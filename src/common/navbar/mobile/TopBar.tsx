import { useContext } from "react";
import { Context } from "../../../Context";
import NavBarButtons from "../NavbarButtons";
import ThemeToggle from "../../theme/ThemeChanger";
import "./TopBar.css";

export function TopBar() {
	const ctx = useContext(Context);
	return (
		<header className="top-bar">
			<div
				className={`hamburger ${ctx?.isDrawerOpen ? "open" : ""}`}
				onClick={() => ctx?.setDrawerOpen(!ctx?.isDrawerOpen)}
			>
				<span />
				<span />
				<span />
			</div>

			<ThemeToggle />

			{ctx?.isDrawerOpen && (
				<div
					className="dimming"
					onClick={() => ctx?.setDrawerOpen(false)}
				/>
			)}

			<aside className={`drawer ${ctx?.isDrawerOpen ? "open" : ""}`}>
				<nav className="drawer__nav">
					<NavBarButtons onClick={() => ctx?.setDrawerOpen(false)} />
				</nav>
			</aside>
		</header>
	);
}
