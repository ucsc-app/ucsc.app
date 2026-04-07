import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup, /* useMapEvents, */ ZoomControl } from "react-leaflet";
import { Layer, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/Map.css";
import buildingsData from "./data/temp4.json";
import { Feature, Geometry } from "geojson";
import BuildingPopup from "./BuildingPopup";

interface BuildingProperties {
	BUILDINGNAME: string;
	ADDRESS: string;
}

// term numbers start from 2048 (Fall 2004)
// terms increment by 2 from fall -> winter -> spring -> summer
// however, summer -> fall increments by 4
// 2260
// first number is the millenium
// next two numbers are the year (26 = 2026)
// last number is 8, 0, 2, or 4 (fall, winter, spring, summer, respectively)
const quarterNumToSeason: Record<number, string> = {
	8: "Fall",
	0: "Winter",
	2: "Spring",
	4: "Summer"
}
function termToString(term: number) {
	const quarter = term % 10;
	const year = 2000 + (((term - (term % 10)) / 10) - 200);

	return `${quarterNumToSeason[quarter]} ${year}`;
}

// todo: fetch this from the backend
function getAllTerms() {
	const terms = [2048];
	const years = Array.from({ length: (new Date().getFullYear() - 2000) - 5 + 1 }, (_, i) => i + 5);
	years.forEach(year => {
		terms.push(
			2000 + (year * 10) + 0,
			2000 + (year * 10) + 2,
			2000 + (year * 10) + 4,
			2000 + (year * 10) + 8,
		)
	});

	terms.reverse();
	return terms.filter(y => y <= 2264);
}

// function MapClickHandler() {
// 	useMapEvents({
// 		click: (e) => {
// 			console.log([e.latlng.lng, e.latlng.lat]);
// 		}
// 	});
// 	return null;
// }

export default function Map() {
	const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, BuildingProperties> | null>(null);
	const [popupPosition, setPopupPosition] = useState<LatLng | null>(null);
	const [selectedTerm, setSelectedTerm] = useState<number>(2264);

	// const bounds: [[number, number], [number, number]] = [
	// 	[36.9750, -122.0750],
	// 	[37.0050, -122.0450]
	// ];

	const onEachFeature = (feature: Feature<Geometry, BuildingProperties>, layer: Layer) => {
		layer.on('click', (e) => {
			// console.log([e.latlng.lng, e.latlng.lat]);
			setSelectedFeature(feature);
			setPopupPosition(e.latlng);
		});
	};

	return (
		<>
			<div className="mapParent">
				<select
					value={selectedTerm}
					onChange={(e) => setSelectedTerm(Number(e.target.value))}
					className="termSelector"
				>
					{getAllTerms().map(term => (
						<option key={term} value={term}>{termToString(term)}</option>
					))}
				</select>
			</div>
			<MapContainer
				center={[36.9914, -122.0609]}
				zoom={15}
				// maxBounds={bounds}
				maxBoundsViscosity={1.0}
				minZoom={15}
				maxZoom={30}
				zoomControl={false}
				className="mapContainerComponent"
			>
				<ZoomControl position="bottomright" />
				<TileLayer
					url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
					attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
					subdomains="abcd"
					maxZoom={30}
				/>
				<GeoJSON
					data={buildingsData as GeoJSON.GeoJsonObject}
					style={{
						color: '#3388ff',
						weight: 2,
						opacity: 0.8,
						fillOpacity: 0.3
					}}
					onEachFeature={onEachFeature}
				/>
				{selectedFeature && popupPosition && (
					<Popup
						position={popupPosition}
						eventHandlers={{
							remove: () => setSelectedFeature(null)
						}}
						autoPan={true}
					// autoPanPaddingTopLeft={[20, 100]}
					// autoPanPaddingBottomRight={[20, 20]}
					// keepInView={true}
					// maxHeight={window.innerHeight - 150}
					>
						<BuildingPopup
							locationName={selectedFeature.properties.BUILDINGNAME}
							locationAddress={selectedFeature.properties.ADDRESS}
							term={selectedTerm}
						/>
					</Popup>
				)}
				{/* <MapClickHandler /> */}
			</MapContainer>
		</>
	);
}