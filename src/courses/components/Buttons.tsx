import { useContext } from "react";
import { CourseContext } from "../Courses";
import ExternalLinkIcon from "/icons/external-link.svg";
import GoogleCalendarIcon from "/icons/Google_Calendar_icon.png";
import DownloadIcon from "/icons/downlaod2.png";
import { generateIcs } from "../generateIcs";
import { generateGoogleCalendarLink } from "../generateIcs";

export default function Buttons() {
	const courseCtx = useContext(CourseContext);
	const { details, term, link } = courseCtx!;

	return (
		<>
			<button
				style={{ fontSize: '14px', backgroundColor: "#205cd4" }}
				onClick={() => {
					const ics = generateIcs(details, term);
					const blob = new Blob([ics], {
						type: "text/calendar",
					});
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `${details.primary_section.subject}-${details.primary_section.catalog_nbr}.ics`;
					a.click();
					URL.revokeObjectURL(url);
				}}
				className="pisaButton"
				title="Download calendar file"
			>
				<img
					src={DownloadIcon}
					alt="Download calendar icon"
					width="20"
					height="20"
					style={{ verticalAlign: "middle" }}
				/>
				Download .ics
			</button>

			<button
				style={{ fontSize: '14px', backgroundColor: "#205cd4"  }}
				onClick={() => {
					const meeting = details.meetings?.[0];
					if (!meeting) return;

					const link = generateGoogleCalendarLink(
						details.primary_section.subject,
						details.primary_section.catalog_nbr,
						details.primary_section.title_long,
						details.primary_section.class_nbr,
						meeting,
						term,
						"Lecture",
					);

					if (link) window.open(link, "_blank");
				}}
				className="pisaButton"
			>
				<img
					src={GoogleCalendarIcon}
					alt="Add to Google Calendar icon"
					width="20"
					height="20"
				/>
				Add to Google Calendar
			</button>

			<button
				style={{ fontSize: '14px', backgroundColor: "#205cd4"  }}
				onClick={() => window.open(link, "_blank")}
				className="pisaButton"
			>
				<img
					src={ExternalLinkIcon}
					alt="Open source page in new window"
					width="20"
					height="20"
					style={{ verticalAlign: "middle" }}
				/>
				View Source
			</button>
		</>
	)
}