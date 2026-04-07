import './App.css'
import Dashboard from './dashboard/Dashboard';

import { BrowserRouter, Route, Routes } from "react-router";
import RssFeed from './news/News.tsx';
import MenuPage from './menu/MenuPage.tsx';
import { Context } from './Context.tsx';

import Courses from './courses/Courses.tsx';
import { useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import ScheduleMapPage from './schedules/ScheduleMapPage.tsx';

function App() {
	const [mobile, setMobile] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [desktopMenuHeight, setDesktopMenuHeight] = useState(0);
	const [selectedDateOffset, setSelectedDateOffset] = useState(0);
	const [theme, setTheme] = useState(() =>
		localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
	);
	useEffect(() => {
		const onResize = () => setMobile(window.innerWidth < 600);
		onResize();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [setMobile]);
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);


	const contextValues = {
		mobile: mobile,
		isDrawerOpen: drawerOpen,
		setDrawerOpen: setDrawerOpen,

		desktopMenuHeight: desktopMenuHeight,
		setDesktopMenuHeight: setDesktopMenuHeight,

		theme: theme,
		setTheme: setTheme,

		selectedDateOffset: selectedDateOffset,
		setSelectedDateOffset: setSelectedDateOffset,
	}

	return (
		<HelmetProvider>
			<Context.Provider value={contextValues}>
				<BrowserRouter>
					{/* <SubdomainRouter /> */}
					<Routes>
						<Route path='/' element={<Dashboard />} />
						<Route path='/news' element={<RssFeed />} />
						<Route path='/courses' element={<Courses />} />
						<Route path='/menu' element={<MenuPage />} />
						<Route path='/map' element={<ScheduleMapPage />} />
					</Routes>
				</BrowserRouter>
			</Context.Provider>
		</HelmetProvider>
	);
}

export default App;