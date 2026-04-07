/* 
common file to handle term management
*/
import { BASE_API_URL } from "./constants";

export interface Term {
	label: string;
	value: string;
}

export const fallbackTerms: Term[] = [
	{ label: "2026 Winter", value: "2260" },
	{ label: "2025 Fall", value: "2258" },
	{ label: "2025 Summer", value: "2254" },
	{ label: "2025 Spring", value: "2252" },
];


const quarterNumToSeason: Record<number, string> = {
	8: "Fall",
	0: "Winter",
	2: "Spring",
	4: "Summer"
}


export function termToDisplayText(term: number) {
	/* 
	    2 2 6 0
		^ ^^^ ^
		\  \  \_ current season (0 = winter, 2 = spring, 4 = summer, 8 = fall)
		 \  \___ last two digits of year. 26 = 2026, 04 = 2004
	      \_____ current millenium (always 2)
	*/

	const quarter = term % 10;
	const year = 2000 + (((term - (term % 10)) / 10) - 200);

	return `${quarterNumToSeason[quarter]} ${year}`;
}

export async function GetAllTerms() {
	const terms: number[] = await fetch(`${BASE_API_URL}/terms`).then((res) => res.json());
	return terms.map(t => {
		return {
			label: termToDisplayText(t),
			value: t.toString()
		}
	});
}

export function getDefaultTerm() {
	// const currentYear = new Date().getFullYear();
	// const partialTerm = 200 + (currentYear % 100);
	
	// const currentMonth = new Date().getMonth();
	// let season;
	// if (currentMonth <= 2) todo
}
