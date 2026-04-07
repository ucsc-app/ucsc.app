import { useContext, useState, useRef } from "react";
import { BASE_API_URL } from "../common/constants.ts";
import { Loading } from "../common/loading/Loading.tsx";
import Search from "./Search";
import Filters from "./Filters";
import Card from "./Card";
import { Course } from "../types";
import { CourseContext } from "./Courses.tsx";


function parseInput(query: string) {
	const results = {
		dept: "",
		catalogNum: "",
	};

	if (query.length == 0) return results;

	const deptExtractor = new RegExp("^([a-zA-Z]{3,4})");
	const deptResults = deptExtractor.exec(query);
	if (deptResults) results["dept"] = deptResults[0].toUpperCase();

	const catalogNumExtractor = new RegExp("([0-9]{1,3}[a-zA-Z]?)");
	const cnumResults = catalogNumExtractor.exec(query);
	if (cnumResults) results["catalogNum"] = cnumResults[0].toUpperCase();

	return results;
}



export default function CourseSearchPanel() {
	const courseCtx = useContext(CourseContext);

	// const [term, setTerm] = useState<string>("");
	const [ge, setGE] = useState<string>("");
	const [status, setStatus] = useState<string>("all");
	const [time, setTimes] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [courses, setCourses] = useState<Course[]>([]);


	const abortControllerRef = useRef<AbortController | null>(null);

	const onSearch = (query: string) => {
		// if (isFirstLoad) setFirstLoad(false);

		const inputData = parseInput(query);

		fetchCourses(inputData);
	};

	async function fetchCourses(inputData: { dept: string, catalogNum: string }) {
		try {
			abortControllerRef.current?.abort();
			abortControllerRef.current = new AbortController();

			setLoading(true);

			const params = new URLSearchParams({
				term: courseCtx!.term,
				regStatus: status,
				department: inputData.dept,
				catalogNum: inputData.catalogNum,
				ge,
				meetingTimes: time,
			});
			const response = await fetch(`${BASE_API_URL}/courses?${params}`, { signal: abortControllerRef.current.signal });
			const data = await response.json();
			setCourses(data);
		} catch (error) {
			// if (error instanceof Error && error.name !== "AbortError") {
			// 	// Handle fetch error silently
			// }
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<Search onSearch={onSearch} />
			<Filters {...{ setGE, setStatus, setTimes }} />
			{loading && <Loading />}

			{courses.length == 0 ? (<p> no results</p>) :
				courses.map((course: Course, index: number) => (
					<Card
						key={index}
						course={course}
						term={courseCtx!.term}
						onCardClick={(classTerm: string, classID: string) => {
							console.log(classTerm, classID)

							courseCtx!.setSelectedClassLink("https://pisa.ucsc.edu/class_search/" + course.link);
							courseCtx!.setSelectedClassModality(course.modality);
							courseCtx!.getDetailedView(classTerm, classID);
						}}
					/>
				))
			}


		</>
	)

}