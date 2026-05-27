import { useState, useRef, useEffect, useContext } from "react";
import { Context } from "../Context";

interface NewsFilterProps {
	FEEDS: string[];
	selectedFeeds: string[];
	toggleFeed: (feed: string) => void;
}

export default function NewsFilter({ FEEDS, selectedFeeds, toggleFeed }: NewsFilterProps) {
	const ctx = useContext(Context);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const filterIcon = ctx!.theme == 'light' ? "/icons/filter-light.svg" : "/icons/filter-dark.svg";

	useEffect(() => {
		if (isOpen)
			dialogRef.current?.showModal();
		else
			dialogRef.current?.close();
	}, [isOpen]);

	return (
		<>
			<dialog ref={dialogRef} onClose={() => setIsOpen(false)} className="filterDialog">
				{FEEDS.map((feed) => (
					<div key={feed} className="IndividualCheckBox">
						<label>
							<input
								type="checkbox"
								checked={selectedFeeds.includes(feed)}
								onChange={() => { toggleFeed(feed); window.plausible?.('News Feed Filter Toggled', { props: { feed } }); }}
								style={{marginRight: '5px'}}
							/>
							{feed}
						</label>
					</div>
				))}
				<div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
					<button onClick={() => setIsOpen(false)} className="filterButton">
						Close
					</button>
				</div>
			</dialog>
			<button onClick={() => setIsOpen(true)} className="filterButton" title="Filter news categories">
				<img src={filterIcon} alt="Filter icon" width='16px'></img>
			</button>
		</>
	);
}
