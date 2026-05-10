'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface DayTile {
  day: string;
  date: string;
  status: string;
}

export default function Planner() {
  const [isLookingForSomething, setIsLookingForSomething] = useState(false);

  const days: DayTile[] = [
    { day: 'Friday', date: 'May 8', status: 'Free all day' },
    { day: 'Saturday', date: 'May 9', status: 'Free all day' },
    { day: 'Sunday', date: 'May 10', status: '1 event available' },
    { day: 'Monday', date: 'May 11', status: '1 event available' },
    { day: 'Tuesday', date: 'May 12', status: 'Free all day' },
    { day: 'Wednesday', date: 'May 13', status: 'Free all day' },
    { day: 'Thursday', date: 'May 14', status: 'Free all day' },
  ];

  return (
    <div className={styles.plannerContainer}>
      <p className={styles.plannerHint}>Tap any day to see what's happening</p>
      <div className={styles.dayTilesList}>
        {days.map((day, index) => (
          <div key={index} className={styles.dayTile}>
            <div className={styles.dayTileContent}>
              <div className={styles.dayHeader}>
                <span className={styles.dayName}>{day.day}</span>
                <span className={styles.dayDate}>{day.date}</span>
              </div>
              <p className={styles.dayStatus}>{day.status}</p>
            </div>
            <span className={styles.dayTileArrow}>&gt;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
