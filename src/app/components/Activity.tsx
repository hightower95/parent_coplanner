'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface Person {
  name: string;
  groups: string[];
}

export default function Activity() {
  const [isLookingForSomething, setIsLookingForSomething] = useState(false);

  const peopleLooking: Person[] = [
    { name: 'Alice Johnson', groups: ['Book Club', 'Yoga Group'] },
    { name: 'Bob Smith', groups: ['Hiking Club'] },
    { name: 'Carol Davis', groups: ['Cooking Class', 'Photography'] },
    { name: 'David Wilson', groups: ['Gaming Group', 'Music Lovers'] },
  ];

  return (
    <div className={styles.activityContainer}>
      {/* Today section */}
      <div className={styles.todaySection}>
        <h2 className={styles.todayTitle}>Today</h2>

        {/* Looking for something tile */}
        <div className={styles.toggleTile}>
          <div className={styles.toggleContent}>
            <span className={styles.toggleLabel}>Looking for something to do?</span>
            <button
              className={`${styles.toggleButton} ${isLookingForSomething ? styles.active : ''}`}
              onClick={() => setIsLookingForSomething(!isLookingForSomething)}
            >
              {isLookingForSomething ? 'Active' : 'Activate'}
            </button>
          </div>
          {isLookingForSomething && (
            <p className={styles.timeoutWarning}>⏱️ This will timeout after 30 minutes</p>
          )}
        </div>

        {/* List of people looking for something to do */}
        {isLookingForSomething && (
          <div className={styles.peopleList}>
            {peopleLooking.map((person, index) => (
              <div key={index} className={styles.personTile}>
                <div className={styles.personContent}>
                  <span className={styles.personName}>{person.name}</span>
                  <div className={styles.personGroups}>
                    {person.groups.map((group, gIndex) => (
                      <span key={gIndex} className={styles.groupTag}>{group}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}