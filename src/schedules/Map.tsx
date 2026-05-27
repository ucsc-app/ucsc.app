import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup, /* useMapEvents, */ ZoomControl } from "react-leaflet";
import { Layer, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/Map.css";
import buildingsData from "./data/temp4.json";
import { Feature, Geometry } from "geojson";
import BuildingPopup from "./BuildingPopup";
import { GetAllTerms, Term } from "../common/terms";

interface BuildingProperties {
	BUILDINGNAME: string;
	ADDRESS: string;
}

export default function Map() {
	const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, BuildingProperties> | null>(null);
	const [popupPosition, setPopupPosition] = useState<LatLng | null>(null);
	const [selectedTerm, setSelectedTerm] = useState<number>(2262);

	const [allTerms, setAllTerms] = useState<Term[]>([]);
	useEffect(() => {
		(async () => {
			const resolvedTerms = await GetAllTerms();
			setAllTerms(resolvedTerms);
		})();
	}, []);

	const onEachFeature = (feature: Feature<Geometry, BuildingProperties>, layer: Layer) => {
		layer.on('click', (e) => {
			setSelectedFeature(feature);
			setPopupPosition(e.latlng);
			window.plausible?.('Map Building Viewed', { props: { building: feature.properties.BUILDINGNAME } });
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
					{allTerms.map(term => (
						<option key={term.value} value={term.value}>{term.label}</option>
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
