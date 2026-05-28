# making new network requests to pisa is slow. instead, im just gonna download all of pisa and store
# it into a folder locally to speed up the process.
from tqdm import tqdm
from tqdm.asyncio import tqdm
import asyncio, httpx, json, base64

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
ALL_CLASSES_URL: str = "https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1/"

async def fetchClass(client: httpx.AsyncClient, classNum: str, term: int, semaphore: asyncio.Semaphore):
	async with semaphore:
		await asyncio.sleep(0.05)
		URL: str = f"https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_DETAIL.v1/{term}/{classNum}"
		response = await client.get(URL, timeout=30)
		if response.status_code != 200: return {}
		
		data: dict = response.json()

		ps: dict = data["primary_section"]
		classData: dict = {
			"class_number": ps["class_nbr"],
			"name": f"{ps['subject']} {ps['catalog_nbr']} - {ps['class_section']} {ps['title']}",
			"link": generatePisaLink(term, classNum),
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

				for meeting in section["meetings"]:
					#during COVID, discussion sections had "TBA" as their location for some reason 
					#see class ID 24825 in term 2208 for an example
					if meeting["days"] == "TBA" or meeting["start_time"] == "TBA" or meeting["end_time"] == "TBA" or meeting["location"] == "TBA":
						continue

					s["meetings"].append({
						"days": meeting["days"],
						"start_time": meeting["start_time"],
						"end_time": meeting["end_time"],
						"location": meeting["location"],
					})
				
				sections.append(s)

		classData["sections"] = sections

		if len(classData["meetings"]) == 0 and len(classData["sections"]) == 0: return {}

		# print(classNum, sections)
		return classData


# has to be a seprate function because you cant do async shit in main? i think
# main has to call asyncio.run on a function
async def fetchAllClasses(classNumbers: list[str], term: int):
	semaphore: asyncio.Semaphore = asyncio.Semaphore(10)
	async with httpx.AsyncClient() as client:
		tasks = [fetchClass(client, c, term, semaphore) for c in classNumbers]
		results = await tqdm.gather(*tasks, desc="Gathering sections")

	merged = []
	for result in results:
		if not result: continue
		merged.append(result)
	
	return merged


async def fetchAllTerms(startTerm: int, endTerm: int, maxConcurrent: int = 5):
	semaphore: asyncio.Semaphore = asyncio.Semaphore(maxConcurrent)
	
	async def fetchTerm(client: httpx.AsyncClient, term: int):
		async with semaphore:
			await asyncio.sleep(0.05)  # rate limiting
			response = await client.get(ALL_CLASSES_URL + f"{term}?dept=")
			if response.status_code != 200: return {}

			allClasses = response.json()
			
			# apparently some classes dont have ids. they all dont have locations either, so skip em
			classNumbers: list[str] = [c["class_nbr"] for c in allClasses["classes"] if len(c["class_nbr"]) > 0]
			
			return {term: list(set(classNumbers))}  # deduplicate, because it can return duplicates (eg DANM 219 fall 2004)
	
	async with httpx.AsyncClient() as client:
		tasks = [fetchTerm(client, term) for term in range(startTerm, endTerm, 2)]
		results = await tqdm.gather(*tasks, desc="Fetching all terms")
	
	merged = {}
	for r in results:
		if not r: continue
		merged.update(r)

	return merged



def generatePisaLink(term: int, classID: str) -> str:
	b: bytes = base64.b64encode(f'a:2:{{s:5:":STRM";s:4:"{term}";s:10:":CLASS_NBR";s:5:"{classID}";}}'.encode('ascii'))
	return f"https://pisa.ucsc.edu/class_search/index.php?action=detail&class_data={b.decode('ascii')}"


if __name__ == "__main__":
	START_TERM: int = 2048
	CURRENT_TERM: int = 2268

	client: httpx.Client = httpx.Client()

	#asynchronously get every term's class IDs 
	allTerms: dict[int, list[str]] = asyncio.run(fetchAllTerms(START_TERM, CURRENT_TERM + 2, 5))

	#then fetch data for all classes in each term
	for term in tqdm(allTerms, desc="Fetching class data"):
		data = asyncio.run(fetchAllClasses(allTerms[term], term))
		with open(f"locations/classes/{term}.json", "w+", encoding="utf-8") as file:
			json.dump(data, file)