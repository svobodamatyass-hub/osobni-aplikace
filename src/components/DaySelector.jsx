import { useRef, useEffect } from 'react';
import { DAY_NAMES } from '../constants';

export default function DaySelector({ selectedDate, onSelectDate }) {
  const scrollRef = useRef(null);
  const todayRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate days: 3 past + today + 10 future
  const days = [];
  for (let i = -3; i <= 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    days.push({ date, isToday: i === 0 });
  }

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  return (
    <div className="day-selector card-glass" ref={scrollRef}>
      {days.map(({ date, isToday }) => {
        const isActive = date.getTime() === selectedDate.getTime();
        const classes = [
          'day-item',
          isToday ? 'today' : '',
          isActive ? 'active' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={date.getTime()}
            className={classes}
            ref={isToday ? todayRef : null}
            onClick={() => onSelectDate(date)}
          >
            <span className="day-name">{DAY_NAMES[date.getDay()]}</span>
            <span className="day-date">{date.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}
