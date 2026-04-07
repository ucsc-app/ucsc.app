import { useEffect, useState, useContext } from "react";
import { TopBar as MobileTopBar } from "../common/navbar/mobile/TopBar";
import { TopBar as DesktopTopBar } from "../common/navbar/desktop/TopBar";
import { Error } from "../common/loading/Loading";
import { BASE_API_URL } from "../common/constants.ts";
import NewsCard from "./NewsCard";
import { Context } from "../Context";
import NewsSidebar from "./NewsSidebar";
import NewsFilter from "./NewsFilter";
import { Loading } from "../common/loading/Loading";
import { usePageMeta } from "../hooks/usePageMeta.tsx";
import { generateNewsArticleSchema } from "../utils/schema";
import "./News.css";

type FeedItem = {
	title: string;
	link: string;
	published: string;
	summary: string;
	categories: string[];
};

const FEEDS = [
	"Campus News",
	"Arts & Culture",
	"Climate & Sustainability",
	"Earth & Space",
	"Health",
	"Social Justice & Community",
	"Student Experience",
	"Technology",
	"Baskin Undergrad Newsletter",
	"Baskin Community News",
];

export default function RssFeed() {
	const ctx = useContext(Context);

	const newsSchema = generateNewsArticleSchema(
		'UCSC Campus News',
		'Stay updated with UC Santa Cruz campus news. Browse articles about campus life, events, research, and student experience.',
		new Date().toISOString()
	);

	usePageMeta({
		title: 'Campus News',
		description: 'Stay updated with UC Santa Cruz campus news. Browse articles about campus life, events, research, and student experience.',
		keywords: 'UCSC news, campus news, UC Santa Cruz updates, student experience',
		ogUrl: 'https://ucsc.app/news',
		canonical: 'https://ucsc.app/news',
		schema: newsSchema,
	});

	const [selectedFeeds, setSelectedFeeds] = useState<string[]>(() => {
		const storedFeeds = localStorage.getItem("selectedFeeds");
		if (storedFeeds) {
			return JSON.parse(storedFeeds);
		}
		return FEEDS; // Default to all feeds selected'
	});

	const [selectedItems, setSelectedItems] = useState<FeedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const toggleFeed = (key: string) => {
		const selected = selectedFeeds.includes(key) ? selectedFeeds.filter((k) => k !== key) : [...selectedFeeds, key]
		setSelectedFeeds(selected);
		localStorage.setItem("selectedFeeds", JSON.stringify(selected));
	};

	useEffect(() => {
		setLoading(true);
		setError(false);

		const fetchFeeds = async () => {
			if (selectedFeeds.length === 0) {
				setSelectedItems([]);
				setLoading(false);
				return;
			}

			try {
				// instead of shoving everything into query parameters, encode the filters into 
				// a bitmask on a 16-bit int. 
				let encoded = 0x00;
				for (let i = 0; i < FEEDS.length; i++) {
					if (selectedFeeds.includes(FEEDS[i]))
						encoded |= 0x01 << i;
				}

				const results = await fetch(`${BASE_API_URL}/rss?categories=${encoded}`).then(res => res.json())
				setSelectedItems([].concat(...results) as FeedItem[]);
			} catch (error) {
				setError(true);
			} finally {
				setLoading(false);
			}
		};
		fetchFeeds();
	}, [selectedFeeds]);

	return (
		<>
			{ctx!.mobile ? <MobileTopBar /> : <DesktopTopBar />}

			<main className="RssFeedMain">
				{!ctx!.mobile ? <NewsSidebar {...{ FEEDS, setSelectedFeeds, selectedFeeds, toggleFeed }} /> : <></>}

				{error ? <Error>Error Loading News</Error> :
					<section className="RSS_Feed">
						{ctx!.mobile ? (
							<div style={{ textAlign: 'left' }}>
								<h1 style={{ marginBottom: '-33px' }}>UCSC News</h1>
								<NewsFilter {...{ FEEDS, selectedFeeds, toggleFeed }} />
							</div>
						) : (<h1>UCSC News</h1>)}

						{loading && <div style={{ display: 'flex', minHeight: '60vh', gridColumn: '1 / -1', }}><Loading /></div>}
						{selectedItems.map((item, i) => (
							<NewsCard key={i} index={i} {...item} />
						))}
					</section>}
			</main>
		</>
	);
};