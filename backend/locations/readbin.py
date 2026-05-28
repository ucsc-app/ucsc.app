import base64, json, pickle, zlib
from typing import cast
from loctypes import ClassDict

#this file holds functions that reads the raw API responses (stored as binary in /compressed), parses it,
#and returns it ias a ClassDict
#separated out from locationscraper.py for organization

#generates a pisa link for a class (thanks advaith)
def generatePisaLink(term: int, classID: str) -> str:
	b: bytes = base64.b64encode(f'a:2:{{s:5:":STRM";s:4:"{term}";s:10:":CLASS_NBR";s:5:"{classID}";}}'.encode('ascii'))
	return f"https://pisa.ucsc.edu/class_search/index.php?action=detail&class_data={b.decode('ascii')}"


#given a path to a binary file (eg 2048.bin), this func will
#decompress it,convert it to normal, and return it
def readBin(filePath: str) -> list[dict]:
    with open(filePath, 'rb') as file:
        compressedData: bytes = pickle.load(file)
    
    decompressed: bytes = zlib.decompress(compressedData)
    return json.loads(decompressed.decode('utf-8'))    


#given the raw API response (from readBin() above), it removes the uselsss shit
#and puts it into a ClassDict and returns it
def processAPIResponse(term: int, data: dict) -> ClassDict:
	ps: dict = data["primary_section"]
	classData: dict = {
		"class_number": ps["class_nbr"],
		"name": f"{ps['subject']} {ps['catalog_nbr']} - {ps['class_section']} {ps['title']}",
		"link": generatePisaLink(term, ps["class_nbr"]),
		"meetings": []
	}

	instructors: set[str] = set()
	if "meetings" in data:
		for meeting in data["meetings"]:
			classData["meetings"].append({
				"days": meeting["days"],
				"start_time": meeting["start_time"],
				"end_time": meeting["end_time"],
				"location": meeting["location"]
			})

			for instructor in meeting["instructors"]:
				instructors.add(instructor["name"])
		
	classData["instructor"] = ', '.join(list(instructors))

	#if no discussion sections, do nothing
	# if "secondary_sections" not in data or len(data["secondary_sections"]) == 0:
	# 	return classData
	
	sections: list = []
	if "secondary_sections" in data:
		for section in data["secondary_sections"]:
			s = {
				"class_number": section["class_nbr"],
				"component": section["component"],
				"class_section": section["class_section"],
				"meetings": [] # fuck discussion sections for having multiple possible meeting times.
			}

			#if a discussion section is cancelled, it wont have a meetings array 
			#see ASTR-3 Fall 2004 section 1D
			if "meetings" not in section: continue

			#a section can have a different set of instructors per meeting time. 
			#i dont give a fuck about attaching instructors per time block, so im gonna gather all of them
			#and shove them into a set (to deduplicate) and then the "instructor" field for this section will be all of them
			instructors: set[str] = set()

			for meeting in section["meetings"]:
				#during COVID, discussion sections had "TBA" as their location for some reason 
				#see class ID 24825 in term 2208 for an example
				if meeting["days"] == "TBA" or meeting["start_time"] == "TBA" or meeting["end_time"] == "TBA" or meeting["location"] == "TBA":
					continue

				instructors.update([i["name"] for i in meeting["instructors"]]) #get all instructors

				s["meetings"].append({
					"days": meeting["days"],
					"start_time": meeting["start_time"],
					"end_time": meeting["end_time"],
					"location": meeting["location"],
				})

			s["instructor"] = ', '.join(list(instructors)) or "Staff"		
			sections.append(s)

	classData["sections"] = sections

	# print(classNum, sections)
	return cast(ClassDict, classData)


#given a term, read its .bin data, parse it, return it
def getClassDictForTerm(term: int) -> list[ClassDict]:
	allAPIResponsesRaw: list[dict] = readBin(f"locations/compressed/{term}.bin")
	return [processAPIResponse(term, a) for a in allAPIResponsesRaw if a]