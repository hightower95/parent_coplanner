'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import BottomNav from './components/BottomNav';
import Planner from './components/Planner';
import Activity from './components/Activity';
import Settings from './components/Settings';
import { useUser } from '../hooks/useUser';

type View = 'planner' | 'activity' | 'settings';

export default function Home() {
  const [activeView, setActiveView] = useState<View>('planner');
  const [registrationName, setRegistrationName] = useState('')
  const { user, isLoading, updateUserName } = useUser();

  // Prevent hydration mismatch by only rendering after mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveName = async (newName: string) => {
    if (!newName.trim()) return
    await updateUserName(newName.trim())
    setRegistrationName('')
    setActiveView('planner')
  }

  if (!isMounted || isLoading) {
    return null;
  }

  // Show registration screen if user hasn't registered
  if (!user?.registered) {
    return (
      <div className={styles.app}>
        <div className={styles.registrationContainer}>
          <div className={styles.registrationContent}>
            <h1 className={styles.registrationTitle}>Welcome to PlanTogether</h1>
            <p className={styles.registrationSubtitle}>Let&apos;s get started by entering your name</p>
            
            <div className={styles.registrationForm}>
              <input
                type="text"
                placeholder="Enter your name"
                className={styles.registrationInput}
                autoFocus
                value={registrationName}
                onChange={(e) => setRegistrationName(e.target.value)}
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && registrationName.trim()) {
                    void handleSaveName(registrationName)
                  }
                }}
              />
              <button
                className={styles.registrationButton}
                onClick={() => {
                  if (registrationName.trim()) {
                    void handleSaveName(registrationName)
                  }
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.appName}>📅 PlanTogether</h1>
        </div>
      </header>

      <main className={styles.content}>
        {activeView === 'planner' && <Planner />}
        {activeView === 'activity' && user && <Activity currentUser={user} />}
        {activeView === 'settings' && <Settings />}
      </main>

      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}
