import React from "react"
import './styles/Card.css'
import SinglePersonIconLightMode from '/icons/single-person-light-mode.svg';
import SinglePersonIconDarkMode from '/icons/single-person-dark-mode.svg';

import MultiplePeopleIconLightMode from '/icons/multiple-people-light-mode.svg';
import MultiplePeopleIconDarkMode from '/icons/multiple-people-dark-mode.svg';

import MapIconLightMode from '/icons/map-light-mode.svg';
import MapIconDarkMode from '/icons/map-dark-mode.svg';

import ClockIconLightMode from '/icons/clock-light-mode.svg'
import ClockIconDarkMode from '/icons/clock-dark-mode.svg'

import SunIconLightMode from '/icons/sun-light-mode.svg';
import SunIconDarkMode from '/icons/sun-dark-mode.svg';


import { Icon } from "../common/Icon";
import { statusEmoji } from "./StatusEmoji";
import { useContext } from "react";
import { Context } from "../Context";
import { Course } from "../types";

interface CardProps {
    course: Course

    // used in callback
    term: string,
    // classID: string,
    onCardClick: (term: string, classID: string) => void
}

const Card: React.FC<CardProps> = ({ course, term, onCardClick }) => {
    const ctx = useContext(Context);
	
	return (
        <article className="cardParent" onClick={() => { onCardClick(term, course.class_number); window.plausible?.('Course Card Opened', { props: { course: course.name } }); }}>
            <div className="card">
                <div className="classInfo">
                    <div style={{display: "flex", width: "100%"}}>
                        <p style={{ margin: '-2px 0', textAlign: "left", width: "100%", overflowWrap: "break-word" }}>
                            <span style={{ fontWeight: '600' }}>{statusEmoji(course.status)} {course.name}</span>
                        </p>
                    </div>
                    {ctx!.theme === 'dark' ? (
                        <>
                            <Icon svg={SinglePersonIconDarkMode} data={course.instructor} />
                            <Icon svg={MapIconDarkMode} data={course.location} />
                            {course.time && <Icon svg={ClockIconDarkMode} data={course.time} />}
                            <Icon svg={MultiplePeopleIconDarkMode} data={course.enrolled} />
                            {course.summerSession && <Icon svg={SunIconDarkMode} data={course.summerSession} />}
                        </>
                    ) : (
                        <>
                            <Icon svg={SinglePersonIconLightMode} data={course.instructor} />
                            <Icon svg={MapIconLightMode} data={course.location} />
                            {course.time && <Icon svg={ClockIconLightMode} data={course.time} />}
                            <Icon svg={MultiplePeopleIconLightMode} data={course.enrolled} />
                            {course.summerSession && <Icon svg={SunIconLightMode} data={course.summerSession} />}
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

export default Card;