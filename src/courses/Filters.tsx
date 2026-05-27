import { useEffect, useState, useContext } from "react";
import { CourseContext } from "./Courses";
import { Term, GetAllTerms, fallbackTerms } from "../common/terms";

import './styles/Filters.css';

interface FilterProps {
	isMobile?: boolean,

	setGE: (ge: string) => void,
	setStatus: (status: string) => void,
	setTimes: (times: string) => void,
}

export default function Filters({ setGE, setStatus, setTimes }: FilterProps) {
	const [termOptions, setTermOptions] = useState<Term[]>(fallbackTerms);
	const courseCtx = useContext(CourseContext);

	useEffect(() => {
		(async () => {
			// const options = await getTermOptions();
			const options = await GetAllTerms();
			setTermOptions(options);
			console.log(options)
			courseCtx!.setTerm(options[0].value);
		})();

	}, [courseCtx!.setTerm]);

	return (
		<div className="filters">

			{/* Quarter select */}
			<select
				name="quarter"
				id="quarter"
				className="dropdown"
				style={{ width: 'calc(30% - 3px)' }}
				value={courseCtx!.term}
				onChange={(e) => {
					courseCtx!.setTerm(e.target.value);
					window.plausible?.('Filter Changed', { props: { filter: 'Term', value: e.target.value } });
				}}
			>
				{termOptions.map((termOption: Term, index: number) => (
					<option key={index} value={termOption.value}>{termOption.label}</option>
				))}
			</select>

			{/* GE type selection */}
			<select
				name="GE"
				id="GE"
				className="dropdown"
				style={{ width: 'calc(20% - 3px)' }}
				onChange={(e) => { setGE(e.target.value); window.plausible?.('Filter Changed', { props: { filter: 'GE', value: e.target.value } }); }}
			>
				{["Any GE", "AH & I", "C", "CC", "ER", "IM", "MF", "PE-E", "PE-H", "PE-T", "PR-C", "PR-E", "PR-S", "SI", "SR", "TA"].map((ge: string, idx: number) => (
					<option key={idx} value={ge}>{ge}</option>
				))}
			</select>

			{/* filter by open/all */}
			<select
				name="status"
				id="status"
				className="dropdown"
				style={{ width: 'calc(17% - 3px)' }}
				onChange={(e) => { setStatus(e.target.value); window.plausible?.('Filter Changed', { props: { filter: 'Status', value: e.target.value } }); }}
			>
				<option value="all">All</option>
				<option value="O">Open</option>
			</select>

			{/* filter by time */}
			<select
				name="times"
				id="times"
				className="dropdown"
				style={{ width: 'calc(33% - 3px)' }}
				onChange={(e) => { setTimes(e.target.value); window.plausible?.('Filter Changed', { props: { filter: 'Time', value: e.target.value } }); }}
			>
				<option value="">All Times</option>
				<option value="Morning">Morning</option>
				<option value="Afternoon">Afternoon</option>
				<option value="Evening">Evening</option>
				{/* Time options... */}
				{/*<option value="08:00PM09:45PM">08:00PM-09:45PM</option>*/}
				<option value="Night">Night</option>
			</select>
		</div>

	);
}
