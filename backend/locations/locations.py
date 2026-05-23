from fastapi import APIRouter, Path
import sqlite3
from fastapi import HTTPException
from urllib.parse import unquote

router = APIRouter()
conn: sqlite3.Connection 
cursor: sqlite3.Cursor
knownBuildings: set[str]

def startup():
	global conn, cursor, knownBuildings
	conn = sqlite3.connect('locations/locations.db')
	cursor = conn.cursor()

	cursor.execute('SELECT DISTINCT building FROM location ORDER BY building;')
	knownBuildings = set(map(lambda x: x[0], cursor.fetchall()))

	print(f'{len(knownBuildings)} buildings were found in the database.')

@router.get('/schedule')
async def getBuildings():
	return list(knownBuildings)

@router.get('/schedule/{building}')
async def getRoomsForBuilding(building: str):
	building = unquote(building)

	if building not in knownBuildings:
		raise HTTPException(status_code=400, detail="Building not found")

	cursor.execute('SELECT room FROM location WHERE building = ? AND room IS NOT NULL ORDER BY room;', (building,))
	rows: list = cursor.fetchall()
	return [x[0] for x in rows]
	

@router.get('/schedule/{term}/{building}/{room}/{day}')
async def getSchedule(term: str, building: str, room: str|None, day: int = Path(..., ge=0, le=6)):
	building = unquote(building)
	if building not in knownBuildings:
		raise HTTPException(status_code=400, detail="Building not found")
	
	# because some buildings (like oakes acad in term 2092) have rooms in some terms, but not others
	roomQuery: str = 'AND l.room = ?'
	params: tuple = (building, room, day, term)
	if room != '-1':
		cursor.execute('SELECT room FROM location WHERE building = ?', (building,))
		roomsInBuilding = set(map(lambda x: x[0], cursor.fetchall()))
		if room not in roomsInBuilding:
			raise HTTPException(status_code=400, detail="Building does not have specified room")
	else:
		room = None
		roomQuery = 'AND l.room IS NULL'
		params = (building, day, term)
	
	cursor.execute(f'''
		SELECT 
			c.name,
			c.pisaLink,
			c.instructor,
			tb.startTime as startTime,
			tb.endTime
		FROM classLocationTimeBlock cltb
		NATURAL JOIN class c
		NATURAL JOIN location l
		NATURAL JOIN timeBlock tb
		WHERE 
			parent IS NULL
			AND l.building = ?
			{roomQuery}
			AND tb.day = ?
			AND c.term = ?

		UNION

		SELECT 
			-- c.classID,
			c.name || ' for ' || c2.name,
			c2.pisaLink,
			c.instructor,
			startTime,
			endTime 
		FROM classLocationTimeBlock cltb 
		NATURAL JOIN class c 
		NATURAL JOIN location l 
		NATURAL JOIN timeBlock tb 
		join class c2 on c2.classID = c.parent and c2.term = c.term
		where 
			c.parent is not null 
			AND building = ?
			{roomQuery} 
			AND day = ?
			AND c.term = ? 

		ORDER BY startTime;
	''', params + params)

	return cursor.fetchall()
