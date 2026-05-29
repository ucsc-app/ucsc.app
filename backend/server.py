from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import endpoints.courses as courses
import endpoints.menu as menu
import endpoints.news as news
import endpoints.bigbrother as bigbrother
from locations import locations
from contextlib import asynccontextmanager
from bs4 import BeautifulSoup
import httpx, requests, uvicorn

# this function runs on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
	locations.startup()
	bigbrother.startup()
	# await news.UpdateFeed()
	yield
	await bigbrother.shutdown()

api = FastAPI(lifespan=lifespan)
api.add_middleware(
	CORSMiddleware,
	allow_origins=[
	"http://localhost:5173",
	"http://localhost:8080",
	"https://ucsc.app",
	],
	allow_credentials=True,
	allow_methods=["GET", "POST"],
	allow_headers=["*"],
)

@api.get("/test")
async def getPath():
	return {"hello": "world"}


@api.get("/terms")
async def getTerms():
	response = requests.get("https://pisa.ucsc.edu/class_search/index.php")
	responseData: str = response.text
	soup = BeautifulSoup(responseData, 'lxml')
	termSelect = soup.find("select", {"id": "term_dropdown"}) #type: ignore
	options = termSelect.find_all("option") #type: ignore

	terms: list[int] = []
	for option in options:
		terms.append(int(option.get("value"))) #type: ignore

	return terms


api.include_router(news.router)
api.include_router(locations.router)
api.include_router(menu.router)
api.include_router(courses.router)
api.include_router(bigbrother.router)

if __name__ == '__main__':
	uvicorn.run('server:api', host='0.0.0.0', port=8000, reload=True)
