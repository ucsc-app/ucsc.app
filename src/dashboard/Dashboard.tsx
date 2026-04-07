import { TopBar as MobileTopBar } from "../components/navbar/mobile/TopBar";
import { TopBar as DesktopTopBar } from "../components/navbar/desktop/TopBar";
import { useContext } from "react";
import { Context } from "../Context";
import { Link } from "react-router";
import { usePageMeta } from "../hooks/usePageMeta.tsx";
import {
	generateOrganizationSchema,
	generateWebsiteSchema,
} from "../utils/schema";
import { useNavigate } from "react-router";
import "./Dashboard.css";

export default function Dashboard() {
	const contextValues = useContext(Context);
	const navigate = useNavigate();

	// Combine both organization and website schemas
	const combinedSchema = {
		"@context": "https://schema.org",
		"@graph": [generateOrganizationSchema(), generateWebsiteSchema()],
	};

	usePageMeta({
		title: "Home",
		description:
			"Your all-in-one student platform for UC Santa Cruz. Discover courses, explore dining options, view campus schedules, and stay updated with campus news.",
		keywords: "UCSC, courses, dining, schedule, campus news, UC Santa Cruz",
		ogUrl: "https://ucsc.app/",
		canonical: "https://ucsc.app/",
		schema: combinedSchema,
	});

	return (
		<main className="dashboard-container">
			{contextValues?.mobile ? <MobileTopBar /> : <DesktopTopBar />}

			<section className="hero-section">
				<div className="hero-content">
					<h1 className="hero-title">
						UCSC's all-in-one
						<br />
						student platform
					</h1>
					<p className="hero-subtitle">
						Discover courses, dining, schedules, and campus news
					</p>

					<div className="WelcomeButtons">
						<button
							className="hero-cta"
							onClick={() => navigate("/courses")}
						>
							<Link to="/courses">Courses →</Link>
						</button>

						<button
							className="hero-cta"
							onClick={() => navigate("/menu")}
						>
							<Link to="/menu">Dining →</Link>
						</button>

						<button
							className="hero-cta"
							onClick={() => navigate("/news")}
						>
							<Link to="/news">News →</Link>
						</button>

						<button
							className="hero-cta"
							onClick={() => navigate("/map")}
						>
							<Link to="/map">(New!) Class Map →</Link>
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}



<div className="hero-illustration">
	<svg
		viewBox="0 0 550 600"
		xmlns="http://www.w3.org/2000/svg"
		role="img"
		aria-label="UC Santa Cruz campus illustration with clock tower building"
	>
		<title>UCSC Campus Illustration</title>
		<desc>
			SVG illustration of UC Santa Cruz's campus featuring the iconic Crown
			College Library clock tower with surrounding foliage and a
			decorative railing
		</desc>
		{/* Main building base - left wing */}
		<rect
			x="80"
			y="260"
			width="100"
			height="160"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
		/>

		{/* Main building base - right wing */}
		<rect
			x="370"
			y="260"
			width="100"
			height="160"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
		/>

		{/* Building roof line */}
		<line
			x1="80"
			y1="260"
			x2="290"
			y2="260"
			stroke="currentColor"
			strokeWidth="3"
		/>
		<line
			x1="370"
			y1="260"
			x2="470"
			y2="260"
			stroke="currentColor"
			strokeWidth="3"
		/>

		{/* Windows - left building (3x2 grid) */}
		<rect
			x="100"
			y="290"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="145"
			y="290"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="100"
			y="340"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="145"
			y="340"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="100"
			y="390"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="145"
			y="390"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>

		{/* Windows - right building (3x2 grid) */}
		<rect
			x="390"
			y="290"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="435"
			y="290"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="390"
			y="340"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="435"
			y="340"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="390"
			y="390"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="435"
			y="390"
			width="25"
			height="25"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>

		{/* Clock tower base */}
		<rect
			x="190"
			y="60"
			width="170"
			height="200"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
		/>

		{/* Tower roof - main triangle */}
		<polygon
			points="190,60 275,0 360,60"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
		/>

		{/* Tower roof - ridge detail */}
		<line
			x1="275"
			y1="0"
			x2="275"
			y2="-15"
			stroke="currentColor"
			strokeWidth="2.5"
		/>

		{/* Antenna/spire */}
		<line
			x1="275"
			y1="-15"
			x2="275"
			y2="-35"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<circle cx="275" cy="-40" r="3.5" fill="currentColor" />

		{/* Clock face - outer ring */}
		<circle
			cx="275"
			cy="90"
			r="40"
			fill="currentColor"
			opacity="0.15"
			stroke="currentColor"
			strokeWidth="2.5"
		/>

		{/* Hour markers on clock (all 12) */}
		<circle cx="275" cy="55" r="2.5" fill="currentColor" />
		<circle cx="298" cy="62" r="2.5" fill="currentColor" />
		<circle cx="312" cy="78" r="2.5" fill="currentColor" />
		<circle cx="318" cy="100" r="2.5" fill="currentColor" />
		<circle cx="312" cy="122" r="2.5" fill="currentColor" />
		<circle cx="298" cy="138" r="2.5" fill="currentColor" />
		<circle cx="275" cy="145" r="2.5" fill="currentColor" />
		<circle cx="252" cy="138" r="2.5" fill="currentColor" />
		<circle cx="238" cy="122" r="2.5" fill="currentColor" />
		<circle cx="232" cy="100" r="2.5" fill="currentColor" />
		<circle cx="238" cy="78" r="2.5" fill="currentColor" />
		<circle cx="252" cy="62" r="2.5" fill="currentColor" />

		{/* Clock hands */}
		<line
			x1="275"
			y1="90"
			x2="275"
			y2="65"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
		<line
			x1="275"
			y1="90"
			x2="305"
			y2="90"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<circle cx="275" cy="90" r="4" fill="currentColor" />

		{/* Tower opening/entrance */}
		<rect
			x="250"
			y="180"
			width="50"
			height="70"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
		/>
		<line
			x1="275"
			y1="180"
			x2="275"
			y2="250"
			stroke="currentColor"
			strokeWidth="1.2"
			opacity="0.6"
		/>

		{/* Tower windows (upper sections) */}
		<rect
			x="220"
			y="140"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="330"
			y="140"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>

		{/* Lower section windows in tower */}
		<rect
			x="220"
			y="270"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="330"
			y="270"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>

		{/* Railing/deck - top rail */}
		<line
			x1="30"
			y1="420"
			x2="520"
			y2="420"
			stroke="currentColor"
			strokeWidth="2.5"
		/>

		{/* Railing balusters */}
		<g opacity="0.7" strokeWidth="1.5">
			<line x1="50" y1="420" x2="50" y2="460" />
			<line x1="80" y1="420" x2="80" y2="460" />
			<line x1="110" y1="420" x2="110" y2="460" />
			<line x1="140" y1="420" x2="140" y2="460" />
			<line x1="170" y1="420" x2="170" y2="460" />
			<line x1="200" y1="420" x2="200" y2="460" />
			<line x1="230" y1="420" x2="230" y2="460" />
			<line x1="260" y1="420" x2="260" y2="460" />
			<line x1="290" y1="420" x2="290" y2="460" />
			<line x1="320" y1="420" x2="320" y2="460" />
			<line x1="350" y1="420" x2="350" y2="460" />
			<line x1="380" y1="420" x2="380" y2="460" />
			<line x1="410" y1="420" x2="410" y2="460" />
			<line x1="440" y1="420" x2="440" y2="460" />
			<line x1="470" y1="420" x2="470" y2="460" />
			<line x1="500" y1="420" x2="500" y2="460" />
		</g>

		{/* Bottom railing rail */}
		<line
			x1="30"
			y1="460"
			x2="520"
			y2="460"
			stroke="currentColor"
			strokeWidth="2"
			opacity="0.7"
		/>

		{/* Ground shadow */}
		<ellipse
			cx="275"
			cy="540"
			rx="200"
			ry="40"
			fill="currentColor"
			opacity="0.12"
		/>

		{/* Foundation/base */}
		<rect
			x="30"
			y="420"
			width="490"
			height="10"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			opacity="0.6"
		/>
	</svg>
</div>;
