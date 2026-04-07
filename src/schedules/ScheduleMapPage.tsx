import { useContext } from "react"
import { Context } from "../Context";
import { TopBar as MobileTopBar } from "../components/navbar/mobile/TopBar";
import { TopBar as DesktopTopBar } from "../components/navbar/desktop/TopBar";
import { usePageMeta } from "../hooks/usePageMeta.tsx";
import { generateCourseSchema } from "../utils/schema";
import Map from "./Map";


export default function ScheduleMapPage() {
	const ctx = useContext(Context);

	const liveClassSchema = generateCourseSchema(
		'Live Classes on Campus',
		'Find ongoing classes on UC Santa Cruz campus. View live class schedules and locations on our interactive map.'
	);

	usePageMeta({
		title: 'Live Classes Map',
		description: 'Find ongoing classes on UC Santa Cruz campus. View live class schedules and locations on our interactive map.',
		keywords: 'UCSC classes, class locations, campus map, class schedule',
		ogUrl: 'https://ucsc.app/map',
		canonical: 'https://ucsc.app/map',
		schema: liveClassSchema,
	});

	return (
		<>
			{ctx!.mobile ? <MobileTopBar /> : <DesktopTopBar />}
			<main>
				<Map />
			</main>
		</>
	)
}