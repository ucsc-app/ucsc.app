import {useContext} from 'react';
import './DateSelector.css';
import {Context} from '../../Context';

const dayOffsets = [0, 1, 2, 3, 4, 5, 6];

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export function DateSelector() {
    const ctx = useContext(Context);
    if (!ctx) {
        return null;
    }
    const {selectedDateOffset} = ctx;

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', borderRadius: 50, backgroundColor: 'var(--card-bg)', 
                overflow: 'hidden', padding: '2.5px 2.5px', gap: '10px', margin: '10px', marginBottom: '0px'}}>
            {dayOffsets.map((offset) => {
                const date = new Date();
                date.setDate(date.getDate() + offset);  
                const display = offset === 0 ? 'Today' :  offset === 1 ? 'Tomorrow' : `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                return (
                    <div className="dateButton"
                        onClick={() => {
                            // setSelectedDateOffset(offset);

                            const menuElement = document.getElementById('dayOffset' + offset);

                            if (menuElement) {
                                menuElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' } );
                            }
                            
                            const dateButton = document.getElementsByClassName('dateButton')[offset];
                            if (dateButton) {
                                dateButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' } );
                            }

                            window.history.replaceState(null, '', `#dayOffset${offset}`);                            
                        }}
                        key={offset} style={{margin: '5px', padding: '0px 15px', scrollMargin: '0px 12.5px',
                            borderRadius: 50, wordBreak: 'keep-all', backgroundColor: selectedDateOffset === offset ? 'var(--gold)' : 'var(--light-gray)', color: selectedDateOffset === offset ? 'black' : 'var(--dark-gray)', cursor: 'pointer', userSelect: 'none'}}>
                        <h3 style={{whiteSpace: 'nowrap', minWidth: 200}}>
                            {display}
                        </h3>
                    </div>
                    );
                })
            }
        </div>
        </>
    );
}
