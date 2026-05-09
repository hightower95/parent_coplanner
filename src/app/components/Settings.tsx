'use client';

import { useEffect, useState } from 'react';
import styles from '../page.module.css';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check system preference or stored preference
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored ? JSON.parse(stored) : prefersDark;
    setIsDarkMode(shouldBeDark);
    applyDarkMode(shouldBeDark);
  }, []);

  const applyDarkMode = (isDark: boolean) => {
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  };

  const handleToggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    applyDarkMode(newValue);
  };

  if (!isMounted) return null;

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingSection}>
        <h2 className={styles.settingTitle}>Appearance</h2>
        
        <div className={styles.settingItem}>
          <div className={styles.settingItemContent}>
            <span className={styles.settingLabel}>Dark Mode</span>
            <span className={styles.settingDescription}>
              {isDarkMode ? 'Currently on' : 'Currently off'}
            </span>
          </div>
          <button
            className={`${styles.toggleSwitch} ${isDarkMode ? styles.on : ''}`}
            onClick={handleToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            <div className={styles.toggleSwitchCircle} />
          </button>
        </div>
      </div>
    </div>
  );
}
