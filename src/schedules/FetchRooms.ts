import { useState, useCallback } from "react";
import buildingLookup from "./data/buildingLookup.json";
import { RoomsInBuilding } from "../types";
import { BASE_API_URL } from "../common/constants";


export default function GetRooms() {
	const [rooms, setRooms] = useState<Array<RoomsInBuilding>>([]);
	const [loading, setLoading] = useState(false);

	const fetchRooms = useCallback((name: string) => {
		setLoading(true);
		const pisaName: string | string[] = buildingLookup[name as keyof typeof buildingLookup];
		const pisaNames: string[] = Array.isArray(pisaName) ? pisaName : [pisaName];

		Promise.all(
			pisaNames.map((n: string) =>
				fetch(`${BASE_API_URL}/schedule/${encodeURIComponent(n).replace(/%2F/g, '%252F')}`)
					.then(res => res.json())
					.then(data => ({ name: n, data }))
			)
		).then((results) => {
			console.log(results)
			setRooms(results);
			setLoading(false);
		});
	}, []);

	return [fetchRooms, rooms, setRooms, loading];
}
