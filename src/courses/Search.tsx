import './styles/Search.css';
import { useState, useRef } from 'react';

interface SearchProps {
	onSearch: (query: string) => void;
}

function SearchIcon() {
	return (
		<svg
			style={{
				position: 'absolute',
				top: '50%',
				left: '12px',
				transform: 'translateY(-50%)',
				color: '#9aa0a6',
			}}
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	)
}

const Search: React.FC<SearchProps> = ({ onSearch }) => {
	const [searchText, setSearchText] = useState('');

	const searchBoxRef = useRef<HTMLInputElement>(null);

	return (
		<div className="searchContainer">
			<SearchIcon />
			<input
				ref={searchBoxRef}
				className="searchBox"
				type="text"
				placeholder="Search..."
				value={searchText}
				onChange={(e) => setSearchText(e.target.value)}
				style={{ minWidth: '0px' }}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						onSearch(searchText);
						window.plausible?.('Course Searched', { props: { query: searchText } });
						searchBoxRef.current?.blur();
					}
				}}
			/>
			<button
				className="searchButton"
				onClick={() => {
					onSearch(searchText);
					window.plausible?.('Course Searched', { props: { query: searchText } });
				}}
			>
				Go
			</button>
		</div>
	);
}

export default Search;
