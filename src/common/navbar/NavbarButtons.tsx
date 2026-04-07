import { Link } from "react-router";

interface NavBarButtonProps {
	onClick: () => void;
}

export default function NavBarButtons({onClick}: NavBarButtonProps) {
	const topBarButtons = {
		'Home': '/',
		...Object.fromEntries(['News', 'Menu', 'Courses', 'Map'].map(k => [k, `/${k.toLowerCase()}`]))
	}

	return (
		Object.entries(topBarButtons).map(([name, path]) => (
			<Link
				key={Math.random() * 1000} // replace later
				to={path}
				style={{
					textDecoration: 'none',
					color: 'var(--gold)',
				}}
				onClick={onClick}
			>
				{name}
			</Link>
		))
	)
}
