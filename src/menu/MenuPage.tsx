
import {TopBar as MobileTopBar} from "../common/navbar/mobile/TopBar";
import {TopBar as DesktopTopBar} from "../common/navbar/desktop/TopBar";
import { Context } from "../Context";
import {Menu as MobileMenu} from './mobile/Menu';
import {Menu as DesktopMenu} from './desktop/Menu';
import {getAllLocationMenus, type Menu} from "./api";
import './Menu.css'
import '../common/loading/Loading.css';
import {Error, Loading} from "../common/loading/Loading";
import {useContext, useEffect, useState} from "react";
import { usePageMeta } from "../common/seo/usePageMeta.tsx";
import { generateLocalBusinessSchema } from "../common/seo/schema.ts";

const dayOffsetCount = 7; // Number of days to fetch menus for

export default function MenuPage() {
    const contextValues = useContext(Context);
    const [menuData, setMenuData] = useState<Record<number, Record<string, Menu>>>({});
    const [loading, setLoading] = useState(true);
    const [error] = useState(false);

    // Create dining location schema
    const diningSchema = generateLocalBusinessSchema(
        'UCSC Dining Services',
        'Explore UC Santa Cruz dining options and meal menus at all campus locations.',
        '1156 High Street, Santa Cruz, CA'
    );

    usePageMeta({
        title: 'Dining & Menu',
        description: 'Explore UC Santa Cruz dining options and meal menus. Check what\'s available at all campus dining locations.',
        keywords: 'UCSC dining, campus menu, dining options, food services, UC Santa Cruz',
        ogUrl: 'https://ucsc.app/menu',
        canonical: 'https://ucsc.app/menu',
        schema: diningSchema,
    });

    useEffect(() => {
        const abortController = new AbortController();

        (async () => {
            const menus: Record<number, Record<string, Menu>> = {};

            await Promise.all(
                Array.from({ length: dayOffsetCount }, (_, offset) =>
                    getAllLocationMenus(offset, abortController.signal).then(dayMenu => menus[offset] = dayMenu)
                )
            )

            // if (!dayMenu) {
            //     setError(true);
            //     setLoading(false);
            //     return;
            // }
            setMenuData(menus);
            setLoading(false);
        })()

        return () => {
            abortController.abort();
        };
    }, []);
        return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw'}}>
            {contextValues?.mobile ? (<MobileTopBar />) : (<DesktopTopBar />)}
            {/* <DateHeader/> */}


            <main style={{width: '100%', overflowX: 'scroll', flex: 1}}>
            {loading ? <Loading/> : error ? <Error>Error Loading Menus</Error> : (
                <div className="MenuPanelDelay" style={{ "--delay": `${1 * 115}ms` } as React.CSSProperties}>
                    {contextValues?.mobile ? (<MobileMenu>{menuData}</MobileMenu>) : (<DesktopMenu>{menuData}</DesktopMenu>)}
                </div>
            )}
            </main>
        </div>
    );
}
