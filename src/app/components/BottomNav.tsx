'use client';

import styles from '../page.module.css';

type View = 'planner' | 'activity' | 'settings';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const tabs: Array<{ id: View; label: string }> = [
  { id: 'planner', label: 'Planner' },
  { id: 'activity', label: 'Activity' },
  { id: 'settings', label: 'Settings' },
];

export default function BottomNav({ activeView, setActiveView }: BottomNavProps) {
  return (
    <nav className={styles.bottomNav} role="tablist" aria-label="Main views">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeView === tab.id}
          className={`${styles.tab} ${activeView === tab.id ? styles.active : ''}`}
          onClick={() => setActiveView(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
