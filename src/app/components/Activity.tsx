'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { activeUsersApi, ActiveUser } from '../../lib/supabase';

interface Person {
  name: string;
  groups: string[];
}

interface ActivityProps {
  currentUser: {
    id: string;
    name: string;
    groups: string[];
  };
}

export default function Activity({ currentUser }: ActivityProps) {
  const [isLookingForSomething, setIsLookingForSomething] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch active users
  const fetchActiveUsers = async () => {
    try {
      const users = await activeUsersApi.getActiveUsers();
      setActiveUsers(users.filter((user: ActiveUser) => user.id !== currentUser.id)); // Exclude current user
    } catch (error) {
      console.error('Failed to fetch active users:', error);
    }
  };

  // Handle toggle activation
  const handleToggle = async () => {
    setIsLoading(true);
    const newState = !isLookingForSomething;

    try {
      if (newState) {
        // Set user as active
        const success = await activeUsersApi.setUserActive(
          currentUser.id,
          currentUser.name,
          currentUser.groups
        );
        if (success) {
          setIsLookingForSomething(true);
          await fetchActiveUsers(); // Refresh the list
        }
      } else {
        // Set user as inactive
        const success = await activeUsersApi.setUserInactive(currentUser.id);
        if (success) {
          setIsLookingForSomething(false);
          await fetchActiveUsers(); // Refresh the list
        }
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling to keep user active and refresh list
  useEffect(() => {
    fetchActiveUsers(); // Initial fetch

    const interval = setInterval(async () => {
      if (isLookingForSomething) {
        // Update last seen timestamp only if active
        await activeUsersApi.updateLastSeen(currentUser.id);
      }
      // Always refresh the active users list
      await fetchActiveUsers();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isLookingForSomething, currentUser.id]);

  // Convert ActiveUser to Person format for display
  const peopleLooking: Person[] = activeUsers.map((user: ActiveUser) => ({
    name: user.name,
    groups: user.groups
  }));

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
          {peopleLooking.length === 0 ? (
            <p className={styles.noPeopleMessage}>No one is looking for activities right now.</p>
          ) : (
            <>
              <p className={styles.peopleListHint}>
                {peopleLooking.length} {peopleLooking.length === 1 ? 'person is' : 'people are'} looking for something to do
              </p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}