import requests, bs4, re, sqlite3, json
from tqdm import tqdm
import argparse
from typing import NamedTuple, TypedDict, cast, Literal

URL: str = "https://pisa.ucsc.edu/class_search/index.php"
HEADERS: dict[str, str] = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
	"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.5",
	"Sec-GPC": "1",
	"Upgrade-Insecure-Requests": "1",
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Mode": "navigate",
	"Sec-Fetch-Site": "same-origin",
	"Sec-Fetch-User": "?1",
	"Content-Type": "application/x-www-form-urlencoded",
	"Priority": "u=0, i",
	"Pragma": "no-cache",
	"Cache-Control": "no-cache",
	"Referer": "https://pisa.ucsc.edu/class_search/index.php"
}
body: dict[str, str] = {
	'action': 'update_segment', 
	'binds[:term]': '2048', 
	'binds[:reg_status]': 'all', 
	'binds[:catalog_nbr_op]': '=', 
	'binds[:instr_name_op]': '=', 
	'binds[:crse_units_op]': '=', 
	'binds[:asynch]': 'A',
	'binds[:hybrid]': 'H', 
	'binds[:synch]': 'S',
	'binds[:person]': 'P',
	'rec_start': '0', 
	'rec_dur': '10000'
}
dayToID: dict[str, int] = {
	'M': 0,
	'Tu': 1,
	'W': 2,
	'Th': 3,
	'F': 4,
	'Sa': 5,
	'Su': 6
}

roomPattern: re.Pattern = re.compile(r' ([A-Z]?[0-9]+[A-Z]?)$')
timePattern: re.Pattern = re.compile(r'((?:[A-Z][a-z]?)+) (\d\d:\d\d[A-Z][A-Z]-\d\d:\d\d[A-Z][A-Z])') #group1 is days, group2 is time
isLabPattern: re.Pattern = re.compile(r'([A-Z]{2,4} [0-9]{1,3})L( - .+)')
DayOfWeek = Literal["M", "Tu", "W", "Th", "F", "Sa", "Su"]

# the raw location/time strings from pisa
class MeetingRaw(NamedTuple):
	location: str
	time: str

class ClassDict(TypedDict):
	class_number: str
	name: str
	link: str
	instructor: str
	meetings: list[MeetingRaw]

# the processed locations/times
class Location(NamedTuple):
	building: str
	room: str

class TimeBlock(NamedTuple):
	day: DayOfWeek
	startTime: str
	endTime: str

class Meeting(NamedTuple):
	location: Location
	time: TimeBlock

# Converts from 02:40PM format to 14:40:00 (sql time format)
def convertTo24hr(timeStr: str) -> str:
    timePart: str = timeStr[:-2]
    period: str = timeStr[-2:]
    
    hour, minute = timePart.split(':')
    hour = int(hour)
    
    if period == 'PM' and hour != 12:
        hour += 12
    elif period == 'AM' and hour == 12:
        hour = 0
    
    return f"{hour:02d}:{minute}:00"

def scrapePanel(panel) -> ClassDict:
	classData: ClassDict = cast(ClassDict, {})
	p = panel.find(class_="panel-body").find(class_="row").find_all("div")
	header = panel.find(class_="panel-heading panel-heading-custom").find("h2")
	aTag = header.find("a")

	classData["class_number"] = p[0].find('a').text.strip()
	classData["name"] = aTag.text.replace('\xa0\xa0\xa0', ' ').strip()
	classData["link"] = aTag.get("href")
	classData["instructor"] = p[1].text.replace("Instructor: ", "").strip()

	# the third div under <div class="row"> is the parent for the time and locations
	# the first child will be the location, the second will be the time, 
	# the third will be the next location, the fourth will be the time for that location, and so on
	classData["meetings"] = []
	timeAndLocations = p[2].find_all("div")

	for i in range(0, len(timeAndLocations), 2):
		location: str = timeAndLocations[i].text.replace("Location: ", "").strip()[5:] #to remove the "SEM: "/"LEC: "
		time: str = timeAndLocations[i+1].text.replace("Day and Time: ", "").strip()

		# if a class/section is cancelled, location is empty and the time is "Cancelled Canceled"
		if not location: continue

		classData["meetings"].append(MeetingRaw(location, time))

	

	return classData

def isValidLocation(m: MeetingRaw) -> bool:
	if (
		# Fall 2004: some classes dont have a time, some locations might just be "STU"/"FLD"/etc, and some locations might be empty
		len(m.time) == 0 or 
		len(m.location) == 0 or 
		len(m.location) == 3 or
		# various online classes, tbd locations, off campus locations
		m.location in [
			"Remote Instruction", 
			"Online", 
			"TBD In Person", 
			"SiliconValleyCtr", 
			"Silicon Valley",
			"Off Campus",
			"Cupertino",
			"Harbor",
			"Lockheed",
			"Remote Meeting",
			"UCSC Boating Center",
			"IAS Gallery",
			"Lower Quarry", # no class has been offered here since winter 2011
			"Steven Music" # idk where this is, only 3 classes have ever been offered here
		] or
		# coastal campus locations
		m.location.startswith("Ocean Health") or
		m.location.startswith("CoastBio") or
		m.location.startswith("WestResearchPark") or
		m.location.startswith("Lg Discovery") or
		# only a handful of classes have been taught at the Arboretum (years ago), and the building doesn't seem to exist anymore
		m.location.startswith("Arboretum") or
		# these buildings dont exist anymore
		m.location.startswith("Ch Merr Rm") or
		m.location.startswith("Kresge Rec") or
		m.location.startswith("Krsg Town Hall") or
		# only two classes have ever been offered here (CLNI 70 spring23 and spring24)
		m.location.startswith("Coll9/JRLC Garden")
	): return False

	return True

def fixLocations(location: str) -> Location:
	global roomPattern

	# some kresge classrooms and ming ong 108 are marked as "Inactive", remove that
	location = location.replace(" Inactive", "").replace(" - inactive", "")

	roomMatches: re.Match | None = roomPattern.search(location)
	room: str = roomMatches[0].strip() if roomMatches else None #type: ignore
	building: str = location.replace(room or "", "").strip()
	
	# fix some miscellaneous locations

	if building == "R Carson  Acad":
		building = "R Carson Acad"

	if building == "Soc Sci 1 135 PC Lab":
		building = "Soc Sci 1"
		room = "135 PC Lab"

	if building == "Soc Sci 1 135 Mac Lab":
		building = "Soc Sci 1"
		room = "135 Mac Lab"
	
	if building == "BiomedSci":
		building = "BioMedSci"

	if building == "Bay Tree Conf A":
		building = "Bay Tree"
		room = "Conf A"
	if building == "Bay Tree Conf D":
		building = "Bay Tree"
		room = "Conf D"

	if building == "Kr Lounge":
		building = "Kresge Lounge"
	
	if building == "Elena Baskin Arts" and room:
		building = f"Elena Baskin Arts {room[0]}"
		room = room[1:]
	
	return Location(building, room)

def parseMeeting(m: MeetingRaw) -> list[Meeting]:
	global timePattern
	l: Location = fixLocations(m.location)
	meetings: list[Meeting] = []

	# some classes can have different meeting times on different days. 
	# eg "MTuWTh 06:00PM-10:00PM    F 04:00PM-07:00PM" <-- this will be separated by 3 \xa0s (kys pisa)
	rawMeetingTimes: list[str] = timePattern.findall(m.time.replace('\xa0\xa0\xa0\xa0', ' '))
	for time in rawMeetingTimes:
		meetingDays: str = time[0]
		startTime: str = time[1].split('-')[0]
		endTime: str = time[1].split('-')[1]

		for day in ["M", "Tu", "W", "Th", "F", "Sa", "Su"]:
			if day not in meetingDays: continue

			tb: TimeBlock = TimeBlock(
				cast(DayOfWeek, day),
				convertTo24hr(startTime),
				convertTo24hr(endTime)
			)

			meetings.append(Meeting(l, tb))

	return meetings

def processMeetings(meetings: list[MeetingRaw]) -> list[Meeting]:
	xs: list[Meeting] = []
	for m in meetings:
		xs.extend(parseMeeting(m))
	
	return xs

def getDiscussionSectionsForClass(classID: str, discussionSectionsJSON: dict[str, list]) -> list[ClassDict]:
	sections: list[ClassDict] = []
	if classID not in discussionSectionsJSON: return sections

	for section in discussionSectionsJSON[classID]:
		name: str = ("LBS" if section["component"] == "Secondary Lab" else "DISC") + "-" + section["class_section"]

		cd: ClassDict = ClassDict({
			"class_number": section["class_nbr"],
			"name": name,
			"meetings": []
		}) # type: ignore

		validMeetings: list[dict] = [m for m in section["meetings"] if isValidLocation(MeetingRaw(m["location"], "a"))]
		if len(validMeetings) == 0: continue

		for meeting in validMeetings:
			mRaw: MeetingRaw = MeetingRaw(
				location=meeting["location"],
				time=f"{meeting['days']} {meeting['start_time'].replace(' ', '')}-{meeting['end_time'].replace(' ', '')}"
			)

			cd["meetings"].append(mRaw)

		sections.append(cd)
	
	return sections

def insertMeetingIntoTable(m: Meeting, term: int, classID: str, cursor: sqlite3.Cursor) -> None:
	# insert location
	# "The DO UPDATE SET locationString = locationString is a no-op that triggers the RETURNING clause even when there's a conflict."
	cursor.execute('''
		INSERT INTO location(building, room) VALUES (?, ?)
		ON CONFLICT(building, room) DO UPDATE SET building = building
		RETURNING locationID
	''', (m.location.building, m.location.room))
	locationID: str = cursor.fetchone()[0]

	#insert time
	cursor.execute('''
		INSERT INTO timeBlock(day, startTime, endTime) VALUES (?, ?, ?)
		ON CONFLICT(day, startTime, endTime) DO UPDATE SET day = day
		RETURNING blockID
	''', (dayToID[m.time.day], m.time.startTime, m.time.endTime))
	timeBlockID: str = cursor.fetchone()[0]

	#insert everything into join table
	cursor.execute('''
		INSERT INTO classLocationTimeBlock(term, classID, locationID, blockID)
		VALUES (?, ?, ?, ?)
		ON CONFLICT DO NOTHING
	''', (term, classID, locationID, timeBlockID))


def getClassLocationsForTerm(term: int, useLocal: bool) -> None:
	if useLocal:
		with open(f'locations/html/{term}.html', 'r', encoding='utf-8') as file:
			responseText: str = ''.join(file.readlines())
	else:
		body["binds[:term]"] = str(term)
		response = requests.get(URL, headers=HEADERS, data=body)
		responseText: str = response.text

	with open(f"locations/sections/{term}.json", "r", encoding="utf-8") as file:
		allSections: dict[str, list] = json.load(file)

	# a class has its parent field set to null
	# a discussion section has its pisaLink field set to null, and the parent field set to another class
	# a lab is a class, but its timings are the timings of its discussion sections

	# for each class
	# 	scrape its times. 
	# 	if no times, check its name. if is a Lab section
	# 		look up its discussion sections. 
	# 		treat the discussion section locations as the Lab's locations. 
	# 		insert into db, setting parent to null
	#		break
	#
	# 	filter valid locations
	# 	if no valid locations, continue
	# 	for each valid location, process and insert class into db
	# 	
	#	use json and look up its discussion sections
	#	if no sections, continue
	# 	filter locations. if none, continue
	# 	for each valid location
	# 		insert into db. set parent to class. set link to null.

	soup = bs4.BeautifulSoup(responseText, 'lxml')
	panels = soup.find_all(class_="panel panel-default row")

	conn: sqlite3.Connection = sqlite3.connect('locations/locations.db')
	cursor: sqlite3.Cursor = conn.cursor()

	for panel in panels:
		classData: ClassDict = scrapePanel(panel)
		if len(classData["meetings"]) == 0 or len(classData["meetings"][0].time) == 0:
			isLabRe: re.Match[str]|None = isLabPattern.match(classData["name"])
			if isLabRe is None: 
				# print(classData["name"], "is not a lab, continuing")
				continue # not a lab. just a chud class with no meeting locations. ignore it

			#now that we know this is a lab, look up if it has discussion sections. if not, ignore it
			if classData["class_number"] not in allSections: 
				# print(classData["name"], "isnt in sections continuing")
				continue

			sections: list[ClassDict] = getDiscussionSectionsForClass(classData["class_number"], allSections)
			if len(sections) == 0: continue

			cursor.execute('''
				INSERT INTO class(term, classID, pisaLink, name, instructor) 
				VALUES(?, ?, ?, ?, ?)
				ON CONFLICT DO NOTHING
			''', (
				term,
				classData["class_number"], 
				classData["link"],
				classData["name"],
				classData["instructor"], 
			))

			for section in sections:
				processedMeetings: list[Meeting] = processMeetings(section["meetings"])
				for m in processedMeetings:
					insertMeetingIntoTable(m, term, classData["class_number"], cursor)

			continue

		classData["meetings"] = [m for m in classData["meetings"] if isValidLocation(m)]
		if len(classData["meetings"]) == 0: continue
		processedMeetings: list[Meeting] = processMeetings(classData["meetings"])

		# start inserting shit into the db

		#insert class
		cursor.execute('''
			INSERT INTO class(term, classID, pisaLink, name, instructor) 
			VALUES(?, ?, ?, ?, ?)
		''', (
			term,
			classData["class_number"], 
			classData["link"],
			classData["name"],
			classData["instructor"], 
		))

		for m in processedMeetings:
			insertMeetingIntoTable(m, term, classData["class_number"], cursor)
			
		
		# now look up discussion sections for this class and append those 
		sections: list[ClassDict] = getDiscussionSectionsForClass(classData["class_number"], allSections)
		if len(sections) == 0: continue

		for section in sections:
			# as it turns out, its possible for discussion sections to be shared between classes
			# eg, phys 6A 01 and phys 6A 02 in fall 2004 both share their discussion sections
			# since im 99% certain that the class ID is unique, if there is a conflict on entry, we can ignore it.
			cursor.execute('''
				INSERT INTO class(term, classID, name, parent, instructor) 
				VALUES(?, ?, ?, ?, ?)
				ON CONFLICT DO NOTHING
			''', (
				term,
				section["class_number"], 
				section["name"],
				classData["class_number"],
				"Staff"
			))

			processedMeetings: list[Meeting] = processMeetings(section["meetings"])
			for m in processedMeetings:
				insertMeetingIntoTable(m, term, section["class_number"], cursor)




	conn.commit()
	conn.close()


if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument('-l', '--local', action='store_true', help='Scrape from local HTML files instead of making HTTP requests')
	args = parser.parse_args()

	CURRENT_TERM: int = 2262
	for term in tqdm(range(2048, CURRENT_TERM + 1, 2)):
		getClassLocationsForTerm(term, args.local)
		# getSectionLocationsForTerm(term)


'''
edge case:
term 2262, class 50613 is Stat 7L
this class is not in the db
it is a class with no location, but 5 "discussion sections"

so i cannot just have a foreign key to another class to act as the "parent"
for those labs

workarounds:
1. instead of a foreign key to a parent class, make another table/join table that has the name and parent link to the other class (or just link)
2. write some sort of script that for "orphaned" discussion sections finds the "real" parent class. maybe via scraping the html again? do lab sections always have an id that is +1 their parent?

3. Instead of scraping classes and sections separately, scrape them together. So go down the pisa html file. for each panel, scrape it like normal. then,
access the json for that term and grab the discussion sections and add those. 

if the panel has no times listed, then it must be a Lab component for another class. in that case, find the class with the same name but without the L. that is the parent
scrape the sections like normal, then set the other class as its parent




'''