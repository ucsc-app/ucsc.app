import { Context } from '../../../Context';
import { useContext } from 'react';
import ThemeToggle from '../../theme/ThemeChanger';
import NavBarButtons from '../NavbarButtons';
import './TopBar.css';

export function TopBar() {
	const ctx = useContext(Context);

    return (
        <header className="top-bar">
            <nav className="nav-buttons">
                <NavBarButtons onClick={() => ctx?.setDrawerOpen(false)} />
			</nav>

            <ThemeToggle />
        </header>
    );
}
