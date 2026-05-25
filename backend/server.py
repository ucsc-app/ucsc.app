from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import endpoints.courses as courses
import endpoints.menu as menu
import endpoints.news as news
from locations import locations
from contextlib import asynccontextmanager
from bs4 import BeautifulSoup
import httpx, requests, uvicorn

# this function runs on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
	global http_client
	http_client = httpx.AsyncClient()
	locations.startup()
	# await news.UpdateFeed()
	yield
	await http_client.aclose()

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


@api.get( "/s/script.js" )
async def plausible_script():
	res = await http_client.get( "https://analytics.byseansingh.com/js/pa-Anetiy5ojChFs5Mt9SKus.js" )
	return Response(
		content=res.content,
		media_type="application/javascript"
	)


@api.post("/s/event")
async def plausible_event( request: Request ):
	body = await request.body()
	headers = {
		"Content-Type": request.headers.get( "Content-Type", "application/json" ),
		"User-Agent": request.headers.get( "User-Agent", "" ),
		"X-Forwarded-For": request.headers.get( "X-Forwarded-For" ) or request.client.host,
	}

	res = await http_client.post(
		"https://analytics.byseansingh.com/api/event",
		content=body,
		headers=headers
	)
	return Response(
		content=res.content,
		status_code=res.status_code
	)


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

if __name__ == '__main__':
	uvicorn.run('server:api', host='0.0.0.0', port=8000, reload=True)
