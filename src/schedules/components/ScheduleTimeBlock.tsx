import { TimeBlock } from "../../types"
import "../styles/ScheduleTimeBlock.css"

interface ScheduleTimeBlockProps {
	timeBlock: TimeBlock
}

const d = new Date();
function formatTime(time: string) {
	d.setHours(...(time.split(':') as unknown as [number, number, number]))
	return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/*
0: class name
1: pisa link 
2: professor name
3: start time
4: end time
*/

export default function ScheduleTimeBlock({ timeBlock }: ScheduleTimeBlockProps) {
	return (
		<div className="schedule-time-block">
			<a
				className="stb-pisalink"
				href={timeBlock[1]}
				target="_blank"
				rel="noopener noreferrer"
			>
				{timeBlock[0]}
			</a>
			<p className="stb-instructor">
				{timeBlock[2].replaceAll(',', ', ')}
			</p>
			<p className="stb-time">{formatTime(timeBlock[3])} → {formatTime(timeBlock[4])}</p>
		</div>
	)
}
