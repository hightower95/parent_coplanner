'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { activeUsersApi, ActiveUser } from '../../lib/supabase';

interface Person {
  name: string;
  groups: string[];
}

export default function Activity() {
  const [isLookingForSomething, setIsLookingForSomething] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - in a real app, this would come from authentication
  const currentUser = {
    id: 'user-123', // This should be a unique ID from your auth system
    name: 'Peter Johnson',
    groups: ['Book Club', 'Hiking Group']
  };

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
        // Update last seen timestamp
        await activeUsersApi.updateLastSeen(currentUser.id);
      }
      // Refresh the active users list
      await fetchActiveUsers();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isLookingForSomething]);

  // Convert ActiveUser to Person format for display
  const peopleLooking: Person[] = activeUsers.map(user => ({
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

        {/* List of people looking for something to do */}
        {isLookingForSomething && (
          <div className={styles.peopleList}>
            {peopleLooking.length === 0 ? (
              <p className={styles.noPeopleMessage}>No one else is looking for activities right now.</p>
            ) : (
              peopleLooking.map((person, index) => (
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}