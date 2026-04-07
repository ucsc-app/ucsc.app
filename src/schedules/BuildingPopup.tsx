import { useState, useEffect, useContext } from "react";
import { RoomsInBuilding, TimeBlock } from "../types";
import { BASE_API_URL } from "../common/constants";
import { MapContext } from "./MapContext";
import { Context } from "../Context";
import GetRooms from "./FetchRooms";
import BuildingRoomList from "./components/BuildingRoomList";
import Schedule from "./Schedule";
import './styles/BuildingPopup.css';

/*
Each location can have multiple "buildings" in it
eg McHenry's rooms and McHenry Classrooms are considered two separate places, even though
they're both the same building, hence why selectedBuilding and locationName are separate things
*/

// todo Oakes Acad might be null some terms
// and TA 2nd Stage

export default function BuildingPopup({ locationName, locationAddress, term }: { locationName: string; locationAddress: string, term: number }) {
	const ctx = useContext(Context);

	// todo: fix any type
	const [fetchRooms, rooms, setRooms] = GetRooms() as [(building: string) => void, Array<RoomsInBuilding>, (a: any) => void];

	const [selectedBuilding, setSelectedBuilding] = useState<string>("");
	const [selectedRoom, setSelectedRoom] = useState<string>("");
	const [selectedSchedule, setSelectedSchedule] = useState<Array<TimeBlock>>([]);
	const [day, setDay] = useState<number>((new Date().getDay() + 6) % 7); // Monday=0, Tuesday=1, etc

	// just checking if selected schedule length > 1 is not enough to determine if a room was selected
	// because a room can have no classes in it. i need a dedicated boolean to know if it was selected or not
	const [wasRoomSelected, setWasRoomSelected] = useState<boolean>(false);

	// whenever a new place is clicked, wipe the previous room and schedule info, and call
	// fetch rooms to get the new list of rooms
	useEffect(() => {
		setRooms([]);
		setSelectedRoom("");
		setSelectedSchedule([]);
		setWasRoomSelected(false);
		fetchRooms(locationName);
	}, [locationName, locationAddress, fetchRooms, setRooms]);

	// whenever a button with a room number is clicked, fetch the schedule for that
	// room from the api
	useEffect(() => {
		if (!selectedBuilding || !selectedRoom) return;

		setWasRoomSelected(true);
		const uriEncoded = encodeURIComponent(selectedBuilding as string).replace(/%2F/g, '%252F');
		fetch(`${BASE_API_URL}/schedule/${term}/${uriEncoded}/${selectedRoom}/${day}`)
			.then(res => res.json())
			.then(res => {
				setSelectedSchedule(res);
			});
	}, [selectedRoom, day, term, selectedBuilding]);

	const contextValues = {
		selectedBuilding,
		setSelectedBuilding,
		selectedRoom,
		setSelectedRoom,
		selectedSchedule,
		onScheduleBackButtonPress: () => {
			setSelectedSchedule([]);
			setSelectedRoom("");
			setWasRoomSelected(false);
		},
		day,
		setDay
	};

	const maxHeight = ctx!.mobile ? '200px' : '200px';

	return (
		<MapContext.Provider value={contextValues}>
			{!wasRoomSelected ? (
				<div className="roomSelectorParent" style={{ maxHeight: maxHeight }}>
					<strong>{locationName}</strong>
					<br />
					{locationAddress}
					<br />
					<div className="roomListParent">
						{rooms.map(d => {
							return (
								<BuildingRoomList
									buildingData={d}
									shouldDisplayName={rooms.length > 1}
								/>
							)
						})}
					</div>
				</div>
			) : (
				<Schedule
					locationName={locationName}
				/>
			)}
		</MapContext.Provider>
	);
}
