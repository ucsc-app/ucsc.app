// import { useState, useEffect, useRef } from "react"
import {useContext} from "react";
import {MenuPanel} from "../MenuPanel.tsx";
import {type Menu} from "../api.ts";
import {Context} from "../../Context.tsx";
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import DateHeader from "../DateHeader.tsx";

export function Menu({children}: {children: Record<number, Record<string, Menu>>}) {
    const contextValues = useContext(Context);
    const menuArrays = Object.entries(children[0]);
    return (
        <>
            <DateHeader/>
            <div style={{marginTop: 60}}>

                <Swiper slidesPerView={1} spaceBetween={0}
                    allowSlideNext={!contextValues?.isDrawerOpen} allowSlidePrev={!contextValues?.isDrawerOpen}
                    style={{height: '100%'}}
                >
                    {/* {menuArrays.filter(([_, menu]) =>
                        // Filter only if at least one meal has at least one non-empty food group
                        Object.values(menu).some(meal =>
                        Object.values(meal).some(foodGroup =>
                            Object.keys(foodGroup).length > 0
                        )
                        ) */}
                    {menuArrays.map(([location, menu]: [string, Menu]) => (
                        <>
                        {/* <div key={location} style={{display: 'flex', overflow: 'visible', marginLeft: 10, marginBottom: 50, "--delay": `${i * 150}ms`} as React.CSSProperties}> */}
                        <SwiperSlide key={location as string} style={{top: '0px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
                            <MenuPanel key={location} name={location} menu={menu} width="95%"></MenuPanel>
                        {/* <div style={{height: 500}}></div> */}
                        </SwiperSlide>
                        </>
                    ))}
                </Swiper>
                {/* </div>q */}
            </div>
        </>
    );
}