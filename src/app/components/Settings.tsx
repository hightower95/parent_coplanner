'use client';

import { useEffect, useState } from 'react';
import styles from '../page.module.css';
import { useUser } from '../../hooks/useUser';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { user, updateUserName, toggleDeveloperMode, toggleDevelopDatabase } = useUser();

  const applyDarkMode = (isDark: boolean) => {
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  };

  useEffect(() => {
    setIsMounted(true);
    // Check system preference or stored preference
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored ? JSON.parse(stored) : prefersDark;
    setIsDarkMode(shouldBeDark);
    applyDarkMode(shouldBeDark);
  }, []);

  const handleToggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    applyDarkMode(newValue);
  };

  const handleEditName = () => {
    setTempName(user?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim() && tempName !== user?.name) {
      updateUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setTempName('');
  };

  if (!isMounted) return null;

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingSection}>
        <h2 className={styles.settingTitle}>Profile</h2>
        
        <div className={styles.settingItem}>
          <div className={styles.settingItemContent}>
            <span className={styles.settingLabel}>Your Name</span>
            {isEditingName ? (
              <div className={styles.nameEditContainer}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className={styles.nameEditInput}
                  autoFocus
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <div className={styles.nameEditButtons}>
                  <button
                    className={styles.nameEditButton}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.nameEditButtonPrimary}
                    onClick={handleSaveName}
                    disabled={!tempName.trim() || tempName === user?.name}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className={styles.settingDescription}>{user?.name}</span>
                <button
                  className={styles.editNameButton}
                  onClick={handleEditName}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>

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

      <div className={styles.settingSection}>
        <h2 className={styles.settingTitle}>Developer Options</h2>
        
        <div className={styles.settingItem}>
          <div className={styles.settingItemContent}>
            <span className={styles.settingLabel}>Developer Mode</span>
            <span className={styles.settingDescription}>
              Enable developer features and debugging tools
            </span>
          </div>
          <button
            className={`${styles.toggleSwitch} ${user?.developerMode ? styles.on : ''}`}
            onClick={toggleDeveloperMode}
            aria-label="Toggle developer mode"
          >
            <div className={styles.toggleSwitchCircle} />
          </button>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingItemContent}>
            <span className={styles.settingLabel}>Develop Database</span>
            <span className={styles.settingDescription}>
              Enable database development and testing features
            </span>
          </div>
          <button
            className={`${styles.toggleSwitch} ${user?.developDatabase ? styles.on : ''}`}
            onClick={toggleDevelopDatabase}
            aria-label="Toggle develop database"
          >
            <div className={styles.toggleSwitchCircle} />
          </button>
        </div>
      </div>
    </div>
  );
}
