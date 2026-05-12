'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { usersApi, User } from '../../lib/supabase';

interface ActivityProps {
  currentUser: {
    id: string;
    name: string;
    groups: string[];
  };
}

const EmptyListMessages = ['Maybe you are the first awake! Would you like to play a game?', 
  'Everyones here waiting for you to activate!',
  'Unless the apocalypse has come, but that seems unlikely.',
  'When they get here - say hi for me!',
  'Hows the weather today?',
  'Enjoy this fact whilst you wait: the average amount of legs a person has is 1.97',
  'What did the fish say when it hit the wall? Dam.',
  'I would tell you a construction joke, but I’m still working on it.',
  'Why don’t scientists trust atoms? Because they make up everything.',
]



const ACTIVE_TIMEOUT_MINUTES = 30

function getMinutesAgo(timestamp: string): number {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  return Math.floor(diffMs / 60000)
}

function formatTimeoutText(timestamp: string): string {
  const minutes = Math.max(0, ACTIVE_TIMEOUT_MINUTES - getMinutesAgo(timestamp))
  if (minutes <= 0) {
    return 'less than a minute'
  }
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

function formatActivatedAgo(timestamp: string): string {
  const minutes = getMinutesAgo(timestamp)
  if (minutes <= 0) {
    return 'just now'
  }
  if (minutes === 1) {
    return '1 minute ago'
  }
  return `${minutes} minutes ago`
}

export default function Activity({ currentUser }: ActivityProps) {
  const [isLookingForSomething, setIsLookingForSomething] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [currentUserLastActivatedAt, setCurrentUserLastActivatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const fetchActiveUsers = async () => {
    try {
      const users = await usersApi.getActiveUsers();
      setActiveUsers(users.filter((user: User) => user.id !== currentUser.id));
    } catch (error) {
      console.error('Failed to fetch active users:', error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userRecord = await usersApi.getUserById(currentUser.id);
      if (userRecord) {
        const isActive = Boolean(
          userRecord.is_active &&
          userRecord.last_activated_at &&
          getMinutesAgo(userRecord.last_activated_at) < ACTIVE_TIMEOUT_MINUTES
        )
        setIsLookingForSomething(isActive)
        setCurrentUserLastActivatedAt(userRecord.last_activated_at)
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    } finally {
      setIsInitializing(false)
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, [currentUser.id]);

  const handleToggle = async () => {
    setIsLoading(true)
    const newState = !isLookingForSomething

    try {
      if (newState) {
        const success = await usersApi.setUserActive(
          currentUser.id,
          currentUser.name,
          currentUser.groups
        )
        if (success) {
          const now = new Date().toISOString()
          setIsLookingForSomething(true)
          setCurrentUserLastActivatedAt(now)
          await fetchActiveUsers()
        }
      } else {
        const success = await usersApi.setUserInactive(currentUser.id)
        if (success) {
          setIsLookingForSomething(false)
          setCurrentUserLastActivatedAt(null)
          await fetchActiveUsers()
        }
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isInitializing) {
      fetchActiveUsers()
    }

    const interval = setInterval(async () => {
      if (!isInitializing) {
        if (isLookingForSomething) {
          const success = await usersApi.updateLastActivated(currentUser.id)
          if (success) {
            setCurrentUserLastActivatedAt(new Date().toISOString())
          }
        }
        await fetchActiveUsers()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isLookingForSomething, currentUser.id, isInitializing])

  if (isInitializing) {
    return (
      <div className={styles.activityContainer}>
        <div className={styles.todaySection}>
          <h2 className={styles.todayTitle}>Today</h2>
          <p className={styles.loadingMessage}>Loading...</p>
        </div>
      </div>
    );
  }

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
              className={`${styles.toggleButton} ${isLookingForSomething ? styles.active : ''} ${isLoading ? styles.loading : ''}`}
              onClick={handleToggle}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : (isLookingForSomething ? 'Active' : 'Activate')}
            </button>
          </div>
          {isLookingForSomething && (
            <p className={styles.timeoutWarning}>⏱️ This will timeout after 30 minutes</p>
          )}
        </div>

        {/* List of people looking for something to do - always visible */}
        <div className={styles.peopleList}>
          {activeUsers.length === 0 ? (
            <p className={styles.noPeopleMessage}> Others looking for activities will show here! {EmptyListMessages[Math.floor(Math.random() * EmptyListMessages.length)]}</p>
          ) : (
            <>
              <p className={styles.peopleListHint}>
                {activeUsers.length} {activeUsers.length === 1 ? 'person is' : 'people are'} looking for something to do today
              </p>
              {activeUsers.map((person, index) => (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}