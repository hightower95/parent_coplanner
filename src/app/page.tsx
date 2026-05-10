'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import BottomNav from './components/BottomNav';
import Planner from './components/Planner';
import Activity from './components/Activity';
import Settings from './components/Settings';
import EditNameDialog from './components/EditNameDialog';
import { useUser } from '../hooks/useUser';

type View = 'planner' | 'activity' | 'settings';

export default function Home() {
  const [activeView, setActiveView] = useState<View>('planner');
  const [isEditingName, setIsEditingName] = useState(false);
  const { user, isLoading, updateUserName } = useUser();

  // Prevent hydration mismatch by only rendering after mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return null;
  }

  const handleSaveName = (newName: string) => {
    updateUserName(newName);
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.appName}>📅 PlanTogether</h1>
          <div className={styles.headerButtons}>
            <button
              className={styles.editNameButton}
              onClick={() => setIsEditingName(true)}
              title={`Edit name (current: ${user?.name})`}
            >
              👤 {user?.name}
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {activeView === 'planner' && <Planner />}
        {activeView === 'activity' && user && <Activity currentUser={user} />}
        {activeView === 'settings' && <Settings />}
      </main>

      <BottomNav activeView={activeView} setActiveView={setActiveView} />

      <EditNameDialog
        currentName={user?.name || ''}
        onSave={handleSaveName}
        isOpen={isEditingName}
        onClose={() => setIsEditingName(false)}
      />
    </div>
  );
}
