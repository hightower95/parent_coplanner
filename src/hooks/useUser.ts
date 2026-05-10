import { useEffect, useState } from 'react'

interface UserData {
  id: string
  name: string
  groups: string[]
}

const DEFAULT_USER_ID = 'user-' + Math.random().toString(36).substr(2, 9)

// Generate a guess for username based on device/environment
function generateUserNameGuess(): string {
  // Check if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true

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

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user_data')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        setUser({
          id: DEFAULT_USER_ID,
          name: generateUserNameGuess(),
          groups: []
        })
      }
    } else {
      // First time - generate a guess
      setUser({
        id: DEFAULT_USER_ID,
        name: generateUserNameGuess(),
        groups: []
      })
    }
    setIsLoading(false)
  }, [])

  const updateUserName = (newName: string) => {
    if (user) {
      const updated = { ...user, name: newName }
      setUser(updated)
      localStorage.setItem('user_data', JSON.stringify(updated))
    }
  }

  const updateUserGroups = (groups: string[]) => {
    if (user) {
      const updated = { ...user, groups }
      setUser(updated)
      localStorage.setItem('user_data', JSON.stringify(updated))
    }
  }

  return {
    user,
    isLoading,
    updateUserName,
    updateUserGroups
  }
}