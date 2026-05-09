'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Planner from './components/Planner';
import Settings from './components/Settings';

type View = 'planner' | 'activity' | 'settings';

export default function Home() {
  const [activeView, setActiveView] = useState<View>('planner');

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.appName}>📅 PlanTogether</h1>
          <div className={styles.headerButtons}>
            {/* Add buttons here later */}
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {activeView === 'planner' && <Planner />}
        {activeView === 'activity' && <div className={styles.placeholder}>Activity view coming soon</div>}
        {activeView === 'settings' && <Settings />}
      </main>

      <nav className={styles.bottomNav} role="tablist" aria-label="Main views">
        <button
          role="tab"
          aria-selected={activeView === 'planner'}
          className={`${styles.tab} ${activeView === 'planner' ? styles.active : ''}`}
          onClick={() => setActiveView('planner')}
        >
          Planner
        </button>
        <button
          role="tab"
          aria-selected={activeView === 'activity'}
          className={`${styles.tab} ${activeView === 'activity' ? styles.active : ''}`}
          onClick={() => setActiveView('activity')}
        >
          Activity
        </button>
        <button
          role="tab"
          aria-selected={activeView === 'settings'}
          className={`${styles.tab} ${activeView === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveView('settings')}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
