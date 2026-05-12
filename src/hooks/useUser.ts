import { useEffect, useState } from 'react'
import { usersApi } from '../lib/supabase'

interface UserData {
  id: string
  name: string
  groups: string[]
  registered: boolean
  developerMode: boolean
  developDatabase: boolean
}

const USER_DATA_KEY = 'user_data'
const USER_ID_KEY = 'user_id'
const USER_FP_KEY = 'user_fingerprint'

function getStoredUserId(): string {
  let storedId = localStorage.getItem(USER_ID_KEY)
  if (storedId) {
    return storedId
  }

  const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'user-' + Math.random().toString(36).substr(2, 9)

  const id = `user-${generatedId}`
  localStorage.setItem(USER_ID_KEY, id)
  return id
}

function getUserFingerprint(): string {
  const storedFingerprint = localStorage.getItem(USER_FP_KEY)
  if (storedFingerprint) {
    return storedFingerprint
  }

  const fingerprintParts = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset()
  ]

  const raw = fingerprintParts.join('|')
  const fingerprint = btoa(unescape(encodeURIComponent(raw))).replace(/=+$/, '')
  localStorage.setItem(USER_FP_KEY, fingerprint)
  return fingerprint
}

const DEFAULT_USER_ID = 'user-' + Math.random().toString(36).substr(2, 9)

// Generate a guess for username based on device/environment
function generateUserNameGuess(): string {
  // Check if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true

  // Try to extract device info from user agent
  const userAgent = navigator.userAgent
  let deviceName = 'User'

  // Mobile device detection
  if (/android/i.test(userAgent)) {
    const match = userAgent.match(/Android ([^;]+)/)
    const androidModel = match ? match[1].split(' ')[0] : 'Phone'
    deviceName = `User on ${androidModel}`
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    if (/ipad/i.test(userAgent)) {
      deviceName = 'User on iPad'
    } else {
      deviceName = 'User on iPhone'
    }
  } else if (/mac os/i.test(userAgent)) {
    deviceName = 'User on Mac'
  } else if (/windows/i.test(userAgent)) {
    deviceName = 'User on PC'
  }

  // If PWA, append that info
  if (isPWA) {
    return `${deviceName} (PWA)`
  }

  return deviceName
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const saveUserLocally = (updated: UserData) => {
    setUser(updated)
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated))
  }

  const saveUserToDatabase = async (updated: UserData) => {
    try {
      await usersApi.upsertUser(updated.id, updated.name, updated.groups)
    } catch (error) {
      console.error('Failed to save user to database:', error)
    }
  }

  // Load user from localStorage and database on mount
  useEffect(() => {
    async function initializeUser() {
      const userId = getStoredUserId()
      getUserFingerprint()

      const stored = localStorage.getItem(USER_DATA_KEY)
      let localUser: UserData | null = null
      if (stored) {
        try {
          localUser = JSON.parse(stored)
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
        }
      }

      const dbUser = await usersApi.getUserById(userId)
      if (dbUser) {
        saveUserLocally({
          id: userId,
          name: dbUser.name || localUser?.name || generateUserNameGuess(),
          groups: dbUser.groups || localUser?.groups || [],
          registered: true,
          developerMode: localUser?.developerMode ?? false,
          developDatabase: localUser?.developDatabase ?? false
        })
      } else {
        const baseUser = localUser || {
          id: userId,
          name: generateUserNameGuess(),
          groups: [],
          registered: false,
          developerMode: false,
          developDatabase: false
        }

        saveUserLocally({
          ...baseUser,
          id: userId,
          name: baseUser.name || generateUserNameGuess(),
          groups: baseUser.groups || [],
          registered: baseUser.registered ?? false,
          developerMode: baseUser.developerMode ?? false,
          developDatabase: baseUser.developDatabase ?? false
        })
      }

      setIsLoading(false)
    }

    initializeUser()
  }, [])

  const updateUserName = async (newName: string) => {
    if (user) {
      const updated = { ...user, name: newName, registered: true }
      saveUserLocally(updated)
      await saveUserToDatabase(updated)
    }
  }

  const updateUserGroups = async (groups: string[]) => {
    if (user) {
      const updated = { ...user, groups }
      saveUserLocally(updated)
      await saveUserToDatabase(updated)
    }
  }

  const toggleDeveloperMode = () => {
    if (user) {
      const updated = { ...user, developerMode: !user.developerMode }
      saveUserLocally(updated)
    }
  }

  const toggleDevelopDatabase = () => {
    if (user) {
      const updated = { ...user, developDatabase: !user.developDatabase }
      saveUserLocally(updated)
    }
  }

  return {
    user,
    isLoading,
    updateUserName,
    updateUserGroups,
    toggleDeveloperMode,
    toggleDevelopDatabase
  }
}