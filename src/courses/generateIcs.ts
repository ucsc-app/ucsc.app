import { DetailedClassInfo, Meeting } from "../types";

const TERM_DATES: Record<string, { start: string; end: string }> = {
	"2248": { start: "20240923", end: "20241208" }, // Fall 2024
	"2250": { start: "20250106", end: "20250316" }, // Winter 2025
	"2252": { start: "20250401", end: "20250601" }, // Spring 2025
	"2254": { start: "20250707", end: "20250823" }, // Summer 2025
	"2258": { start: "20250922", end: "20251206" }, // Fall 2025
	"2260": { start: "20260105", end: "20260314" }, // Winter 2026
	"2262": { start: "20260330", end: "20260606" }, // Spring 2026
	"2264": { start: "20260706", end: "20260822" }, // Summer 2026
	"2268": { start: "20260921", end: "20261205" }, // Fall 2026
};


function daysToBYDAY(daysStr: string): string {
	const map: Record<string, string> = {
		M: "MO",
		T: "TU",
		W: "WE",
		R: "TH",
		F: "FR",
		S: "SA",
		U: "SU",
		Tu: "TU",
		Th: "TH"
	};

	const tokens: string[] = [];

	const multi = daysStr.match(/Tu|Th/g);
	if (multi) tokens.push(...multi);

	const remaining = daysStr.replace(/Tu|Th/g, "");

	for (const c of remaining) {
		tokens.push(c);
	}

	return tokens.map(t => map[t]).filter(Boolean).join(",");
}


function parseTime(timeStr: string): string {
	const trimmed = timeStr.trim();
	const isPM = trimmed.toUpperCase().endsWith("PM");
	const isAM = trimmed.toUpperCase().endsWith("AM");

	const timePart = trimmed.replace(/\s*(AM|PM|am|pm)/, "");
	const [hourStr, minuteStr] = timePart.split(":");

	let hour = parseInt(hourStr, 10);
	const minute = parseInt(minuteStr || "0", 10);

	if (isPM && hour !== 12) hour += 12;
	if (isAM && hour === 12) hour = 0;

	const hourPad = String(hour).padStart(2, "0");
	const minPad = String(minute).padStart(2, "0");
	return `${hourPad}${minPad}00`;
}

function getFirstMeetingDate(startDateStr: string, daysStr: string): string {
	const dayValues: Record<string, number> = {
		SU: 0,
		MO: 1,
		TU: 2,
		WE: 3,
		TH: 4,
		FR: 5,
		SA: 6
	};

	const byday = daysToBYDAY(daysStr);
	const targetDays = new Set(
		byday.split(",").map(d => dayValues[d]).filter(d => d !== undefined)
	);

	const year = parseInt(startDateStr.slice(0, 4), 10);
	const month = parseInt(startDateStr.slice(4, 6), 10);
	const day = parseInt(startDateStr.slice(6, 8), 10);

	const currentDate = new Date(year, month - 1, day);

	while (!targetDays.has(currentDate.getDay())) {
		currentDate.setDate(currentDate.getDate() + 1);
	}

	const y = currentDate.getFullYear();
	const m = String(currentDate.getMonth() + 1).padStart(2, "0");
	const d = String(currentDate.getDate()).padStart(2, "0");

	return `${y}${m}${d}`;
}

function escapeIcsText(text: string): string {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n");
}


export function generateIcsForSection(
	subject: string,
	catalogNum: string,
	titleLong: string,
	classNbr: string,
	meetings: Meeting[],
	term: string
): string {
	if (meetings.length === 0) {
		return "";
	}

	const termDates = TERM_DATES[term];
	const courseName = `${subject}-${catalogNum}`;
	const courseTitle = titleLong;
	const classId = classNbr;

	let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ucsc.app//EN
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
`;

	meetings.forEach((meeting: Meeting) => {
		const startTime = parseTime(meeting.start_time);
		const endTime = parseTime(meeting.end_time);
		const byDay = daysToBYDAY(meeting.days);

		let dtstart: string;
		let dtend: string;
		let rrule = "";

		if (termDates) {
			const firstMeetingDate = getFirstMeetingDate(termDates.start, meeting.days);
			dtstart = `${firstMeetingDate}T${startTime}`;
			dtend = `${firstMeetingDate}T${endTime}`;
			rrule = `\nRRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${termDates.end}T235959`;
		} else {
			dtstart = `${new Date().getFullYear()}0101T${startTime}`;
			dtend = `${new Date().getFullYear()}0101T${endTime}`;
		}

		const instructorNames = meeting.instructors.map(i => i.name).join(", ");
		const description = `Instructor: ${instructorNames}\nClass ID: ${classId}`;

		icsContent += `BEGIN:VEVENT
UID:${classId}-${meeting.days}@ucsc.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART;TZID=America/Los_Angeles:${dtstart}
DTEND;TZID=America/Los_Angeles:${dtend}${rrule}
SUMMARY:${escapeIcsText(`${courseName}: ${courseTitle}`)}
LOCATION:${escapeIcsText(meeting.location)}
DESCRIPTION:${escapeIcsText(description)}
END:VEVENT
`;
	});

	icsContent += "END:VCALENDAR";

	return icsContent;
}

export function generateIcs(details: DetailedClassInfo, term: string): string {
	const meetings = details.meetings || [];

	if (meetings.length === 0) {
		return ""; // No meetings to export
	}

	const termDates = TERM_DATES[term];
	const courseName = `${details.primary_section.subject}-${details.primary_section.catalog_nbr}`;
	const courseTitle = details.primary_section.title_long;
	const classId = details.primary_section.class_nbr;

	let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ucsc.app//EN
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
`;

	meetings.forEach((meeting: Meeting) => {
		const startTime = parseTime(meeting.start_time);
		const endTime = parseTime(meeting.end_time);
		const byDay = daysToBYDAY(meeting.days);

		let dtstart: string;
		let dtend: string;
		let rrule = "";

		if (termDates) {
			const firstMeetingDate = getFirstMeetingDate(termDates.start, meeting.days);
			dtstart = `${firstMeetingDate}T${startTime}`;
			dtend = `${firstMeetingDate}T${endTime}`;
			rrule = `\nRRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${termDates.end}T235959`;
		} else {
			// Unknown term: create a single event without recurrence
			dtstart = `${new Date().getFullYear()}0101T${startTime}`;
			dtend = `${new Date().getFullYear()}0101T${endTime}`;
		}

		const instructorNames = meeting.instructors.map(i => i.name).join(", ");
		const description = `Instructor: ${instructorNames}\nClass ID: ${classId}`;

		icsContent += `BEGIN:VEVENT
UID:${classId}-${meeting.days}@ucsc.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART;TZID=America/Los_Angeles:${dtstart}
DTEND;TZID=America/Los_Angeles:${dtend}${rrule}
SUMMARY:${escapeIcsText(`${courseName}: ${courseTitle}`)}
LOCATION:${escapeIcsText(meeting.location)}
DESCRIPTION:${escapeIcsText(description)}
END:VEVENT
`;
	});

	icsContent += "END:VCALENDAR";

	return icsContent;
}


export function generateGoogleCalendarLink(
	subject: string,
	catalogNum: string,
	titleLong: string,
	classNbr: string,
	meeting: Meeting,
	term: string,
	sectionOrLecture: string
) {
	const termDates = TERM_DATES[term];
	if (!termDates) return "";

	const title = `${subject} ${catalogNum} - ${sectionOrLecture}`;

	const startTime = parseTime(meeting.start_time);
	const endTime = parseTime(meeting.end_time);
	const firstMeetingDate = getFirstMeetingDate(termDates.start, meeting.days);

	const start = `${firstMeetingDate}T${startTime}`;
	const end = `${firstMeetingDate}T${endTime}`;

	const byDay = daysToBYDAY(meeting.days);
	const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${termDates.end}T235959`;

	const instructorNames = meeting.instructors.map(i => i.name).join(", ");
	const description = `Title: ${titleLong}\nInstructor: ${instructorNames}\nClass ID: ${classNbr}`;

	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: title,
		dates: `${start}/${end}`,
		location: meeting.location,
		details: description,
		recur: rrule
	});

	return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
