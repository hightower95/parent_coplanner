'use client';

import { useState } from 'react';
import styles from './page.module.css';
import BottomNav from './components/BottomNav';
import Planner from './components/Planner';
import Activity from './components/Activity';
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
        {activeView === 'activity' && <Activity />}
        {activeView === 'settings' && <Settings />}
      </main>

      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}
