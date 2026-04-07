import { useContext } from "react";
import { Context } from "../../Context";
import ToggleLightModeIcon from '/icons/toggle-light-mode.svg';
import ToggleDarkModeIcon from '/icons/toggle-dark-mode.svg';
import { Icon } from "../Icon";

import './ThemeChanger.css';

export default function ThemeToggle() {
	const ctx = useContext(Context);
	const toggle = () => ctx!.setTheme((t) => (t === "light" ? "dark" : "light"));

	return (
		<button
			className="ThemeChangerButton"
			onClick={toggle}
		>
			<Icon
				svg={ctx!.theme === "light" ? ToggleDarkModeIcon : ToggleLightModeIcon}
				data={""}
			/>
		</button>
	);
}
