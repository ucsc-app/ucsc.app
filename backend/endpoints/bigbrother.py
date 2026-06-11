from fastapi import APIRouter, Request
from fastapi.responses import Response
import httpx

router = APIRouter()

def startup():
	global http_client
	http_client = httpx.AsyncClient()

async def shutdown():
	global http_client
	await http_client.aclose()


@router.get( "/s/script.js" )
async def plausible_script():
	res = await http_client.get( "https://analytics.byseansingh.com/js/pa-Anetiy5ojChFs5Mt9SKus.js" )
	return Response(
		content=res.content,
		media_type="application/javascript"
	)


@router.post("/s/event")
async def plausible_event( request: Request ):
	body = await request.body()
	headers = {
		"Content-Type": request.headers.get( "Content-Type", "application/json" ),
		"User-Agent": request.headers.get( "User-Agent", "" ),
		"X-Forwarded-For": request.headers.get( "CF-Connecting-IP" ) or request.headers.get( "X-Forwarded-For" ) or request.client.host,
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
