# making new network requests to pisa is slow. instead, im just gonna download all of pisa and store
# it into a folder locally to speed up the process.
import requests
from tqdm import tqdm
from tqdm.asyncio import tqdm
import bs4
from locationscraper import scrapePanel
from pathlib import Path
import re, asyncio, httpx, json, os

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

async def fetchClass(client: httpx.AsyncClient, classNum: str, term: int, semaphore: asyncio.Semaphore):
	async with semaphore:
		await asyncio.sleep(0.05)
		URL: str = f"https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_DETAIL.v1/{term}/{classNum}"
		response = await client.get(URL, timeout=30)
		if response.status_code != 200:
			return {}
		
		data: dict = response.json()
		sections: list = []

		#if no discussion sections, do nothing
		if "secondary_sections" not in data or len(data["secondary_sections"]) == 0:
			return {}
		
		for section in data["secondary_sections"]:
			s = {
				"class_nbr": section["class_nbr"],
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

		# print(classNum, sections)
		return {classNum: sections}


# has to be a seprate function because you cant do async shit in main? i think
# main has to call asyncio.run on a function
async def fetchAllClasses(classNumbers: list[str], term: int):
	semaphore: asyncio.Semaphore = asyncio.Semaphore(5)
	async with httpx.AsyncClient() as client:
		tasks = [fetchClass(client, classNum, term, semaphore) for classNum in classNumbers]
		results = await tqdm.gather(*tasks, desc="Gathering sections")

	merged = {}
	for result in results:
		merged.update(result)
	
	return merged


if __name__ == "__main__":
	CURRENT_TERM: int = 2268

	for term in tqdm(range(2048, CURRENT_TERM + 2, 2)):
		body["binds[:term]"] = str(term)
		response: requests.Response = requests.post(URL, headers=HEADERS, data=body)
		with open(f'locations/html/{term}.html', 'w+', encoding="utf-8") as file:
			file.writelines(response.text)
	
		#for each class for each term, grab all class numbers and make an API call to the detailed course page
		classNumberRegex: re.Pattern = re.compile(r'class_nbr_([0-9]+)')
		classNumbers: list[str] = classNumberRegex.findall(response.text)

		data = asyncio.run(fetchAllClasses(classNumbers, term))
		with open(f"locations/sections/{term}.json", "w+", encoding="utf-8") as file:
			json.dump(data, file)

