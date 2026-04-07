import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter

router = APIRouter()

MAX_RESULTS: str = "2000"
URL:         str = "https://pisa.ucsc.edu/class_search/index.php";

# term                2252 (summer 2025), 2248 (spring 2025), 2246 (winter 2024), etc 2048 is oldest
# reg_status          O (open), all
# department          ANTH, AM, CSE, etc.
# catalogOp           = contains >= <=
# catalogNbr          the course number (any number from 1 to 299)
# titleKeyword        a string to look for in the course name
# instr_name_op is    = contains begins
# instructorName      instructor name string
# ge                  empty string or AnyGE, TA, PR, etc.
# crseUnitsOp         = between
# crseUnitsFrom       lower bound (if crseUnitsOp is "between")
# crseUnitsTo         upper bound (if crseUnitsOp is "between")
# crseUnitsExact      num credits (if crseUnitsOp is "=")
# meetingDays         MWF, TuTh, etc.
# meetingTimes        "", Morning, Afteroon, Evening, or a specific time (formatted as 1200PM01:05PM)
# acadCareer          "", UGRD, GRAD
# asynch              "A" if async, otherwise ""
# hybrid              "H" if hybrid, otherwise ""
# synch               "S" if synchronous, otherwise ""
# person              "P" if in person, otherwise ""

@router.get("/courses")
def queryPisa(
        term: str, 
		regStatus: str = "O",
		department: str = "", 
		catalogOp: str = "contains", 
		catalogNum: str = "", 
		titleKeyword: str = "",
		instructorNameOp: str = "=",
		instructorName: str = "",
		ge: str = "",
		crseUnitsOp: str = "=",
		crseUnitsFrom: str = "",
		crseUnitsTo: str = "",
		crseUnitsExact: str = "",
		meetingDays: str = "",
		meetingTimes: str = "",
		acadCareer: str = "",
		asynch: str = "A",
		hybrid: str = "H",
		synch: str = "S",
		person: str = "P"
):
    info: dict[str, str] = {
        "action": "results",
        "binds[:term]": term,
        "binds[:reg_status]": regStatus,
        "binds[:subject]": department,
        "binds[:catalog_nbr_op]": catalogOp,
        "binds[:catalog_nbr]": catalogNum,
        "binds[:title]": titleKeyword,
        "binds[:instr_name_op]": instructorNameOp,
        "binds[:instructor]": instructorName,
        "binds[:ge]": ge,
        "binds[:crse_units_op]": crseUnitsOp,
        "binds[:crse_units_from]": crseUnitsFrom,
        "binds[:crse_units_to]": crseUnitsTo,
        "binds[:crse_units_exact]": crseUnitsExact,
        "binds[:day]": meetingDays,
        "binds[:times]": meetingTimes,
        "binds[:acad_career]": acadCareer,
        "binds[:asynch]": asynch,
        "binds[:hybrid]": hybrid,
        "binds[:synch]": synch,
        "binds[:person]": person,
        "rec_start": "0",
        "rec_dur": MAX_RESULTS
    }

    response = requests.post(URL, data=info)
    responseData: str = response.text

    # print(responseData)

    # parse data
    soup = BeautifulSoup(responseData, 'lxml')
    panels = soup.find_all(class_="panel panel-default row")

    # Print the number of panels found
    data = []
    for panel in panels:
        classData: dict = {}

        # scrape header (open/closed/waitlisted, class name, link)
        header = panel.find(class_="panel-heading panel-heading-custom").find("h2")
        classData["status"] = header.find("span").text.strip()

        aTag = header.find("a")
        classData["link"] = aTag.get("href")
        classData["name"] = aTag.text.replace('\xa0\xa0\xa0', ' ').strip()


        # scrape body 
        p = panel.find(class_="panel-body").find(class_="row").find_all("div")
        # 0: class number
        # 1: instructor
        # 2: parent div of location and time
        # 3: location
        # 4: time
        # 5: summer session
        # 6: enrolled
        # 7: textbooks
        # 8: course readers
        # 9: modality

        # the 4th div in summer quarter class panels will be either summer session 1 or 2
        isSummerSession: bool = len(p) == 10

        classData["class_number"] = p[0].find('a').text.strip()
        classData["instructor"] = p[1].text.replace("Instructor: ", "").strip()
        classData["location"] = p[3].text.replace("Location: ", "").strip()
        classData["time"] = p[4].text.replace("Day and Time: ", "").strip()
        classData["summer_session"] = p[5].text.replace("Session: ", "").strip() if isSummerSession else None
        classData["enrolled"] = p[-4].text.strip()
        classData["modality"] = p[-1].text.replace("Instruction Mode:", "").strip()
        
        data.append(classData)

    return data
    # # Write the data to a JSON file
    # with open('data.json', 'w') as f:
    #     json.dump(data, f, indent=4)
        
    # print(f"Data written to data.json with {len(data)} classes")
    

# queryPisa(
#     "2252", 
#     "O",
#     "", 
#     "contains", 
#     "", 
#     "",
#     "=",
#     "",
#     "",
#     "=",
#     "",
#     "",
#     "",
#     "",
#     "",
#     "",
#     "A",
#     "H",
#     "S",
#     "P"
# )


# @router.get("/courses/terms")
# def getTerms():
#     response = requests.get("https://pisa.ucsc.edu/class_search/index.php")
#     responseData: str = response.text

#     soup = BeautifulSoup(responseData, 'lxml')
#     termSelect = soup.find("select", {"id": "term_dropdown"})
#     options = termSelect.find_all("option")

#     terms: list[dict[str, str]] = []
#     for option in options:
#         termValue = option.get("value")
#         termName = option.text.strip()
#         terms.append({'value': termValue, 'label': termName}) 

#     return terms
