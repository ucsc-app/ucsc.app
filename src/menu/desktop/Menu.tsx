// import { useState, useEffect, useRef } from "react"
import DateHeader from "./DateHeader.tsx";
import {MenuPanel} from "../MenuPanel.tsx";
import {type Menu} from "../api.ts";
import {useContext, useEffect, useRef} from "react";
import {Context} from "../../Context.tsx";
// import {useContext} from "react";
// import {Context} from "../../Context.tsx";


export function Menu({children}: {children: Record<number, Record<string, Menu>>}) {
    // const filtered = Object.entries(children)
    //   .filter(([_, menu]) =>
    //     // Filter only if at least one meal has at least one non-empty food group
    //     Object.values(menu).some(meal =>
    //       Object.values(meal).some(foodGroup =>
    //         Object.keys(foodGroup).length > 0
    //       )
    //     )
    //   );

    const ctx = useContext(Context);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        
        const el = scrollRef.current;
        if (!el) return;
        
        const onScroll = () => {
            const container = el;
            const dateMenus = container.querySelectorAll<HTMLElement>('[id^="dayOffset"]');

            const containerTop = container.getBoundingClientRect().top;
            const triggerY = containerTop + 25; // same number you were using

            for (const menu of dateMenus) {
                const rect = menu.getBoundingClientRect();

                if (rect.bottom >= triggerY) {
                    const offset = menu.id.replace('dayOffset', '');
                    ctx?.setSelectedDateOffset(Number(offset));
                    const dateButtons = document.getElementsByClassName('dateButton');
                    const dateButton = dateButtons[Number(offset)];

                    if (dateButton) {
                        dateButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' } );
                    }
                    break;
                }
            }
        };

        onScroll(); // Initial check on mount

        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, [ctx]);
    
    // useEffect(() => {
    //     const scrollContainer = document.querySelector('body');

    //     if (scrollContainer) {
    //         scrollContainer.addEventListener('scroll', onScroll, true);
    //     }

    //     return () => {
    //         if (scrollContainer) {
    //             scrollContainer.removeEventListener('scroll', onScroll, true);
    //         }
    //     };
    // }, []);

    return (
        <>
            <DateHeader/>
            <div ref={scrollRef} style={{overflow: 'scroll', marginTop: 150, height: 'calc(100vh - 210px)'}}>
                {Object.entries(children).map(([offset, dayMenu]) => (
                    <div id={'dayOffset' + offset} style={{fontWeight: 500, scrollMarginTop: 0}}>
                        <div key={offset} style={{display: 'flex', flexDirection: 'row',marginTop: 0, padding: '0px 15px'}}>
                            {Object.entries(dayMenu).map(([location, menu]: [string, Menu], i: number) => (
                                <div key={location} style={{display: 'flex', overflow: 'visible', marginLeft: 10, marginBottom: 0, "--delay": `${i * 150}ms`} as React.CSSProperties}>
                                    <MenuPanel key={location} name={location} menu={menu} width="100%"></MenuPanel>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}