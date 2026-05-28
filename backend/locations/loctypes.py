from typing import TypedDict, NamedTuple, Literal

DayOfWeek = Literal["M", "Tu", "W", "Th", "F", "Sa", "Su"]

# the raw location/time strings from pisa
class MeetingRaw(TypedDict):
	location: str
	start_time: str
	end_time: str
	days: str

class Section(TypedDict):
	class_number: str
	component: str
	class_section: str
	meetings: list[MeetingRaw]
	instructor: str

class ClassDict(TypedDict):
	class_number: str
	name: str
	link: str
	instructor: str
	meetings: list[MeetingRaw]
	sections: list[Section]

# the processed locations/times. the code reads the list of MeetingRaw in a ClassDict
# and parses it into a Meeting, and then inserts it into the db to the corresponding tables
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