import { createContext, useContext, useState, useEffect } from 'react'

const PreferencesContext = createContext()

const defaultPreferences = {
  // Default Scraping Options
  scraping: {
    maxPages: 100,
    maxDepth: 3,
    concurrentLimit: 5,
    headlessBrowser: true,
    downloadFileAssets: true,
    useProxies: false,
    useAuthentication: false,
    useFingerprinting: true,
    smartScrollIterations: 5,
    maxRetries: 3
  },
  
  // Notification Settings
  notifications: {
    enabled: true,
    scrapingComplete: true,
    scrapingError: true,
    largeFileDownload: true,
    proxyFailure: true,
    browserNotifications: false,
    soundEnabled: false,
    emailNotifications: false,
    emailAddress: ''
  },
  
  // Display Preferences
  display: {
    itemsPerPage: 20,
    showThumbnails: true,
    compactView: false,
    showFileSize: true,
    showTimestamps: true,
    dateFormat: 'relative', // 'relative' or 'absolute'
    timeFormat: '12h', // '12h' or '24h'
    language: 'en',
    animationsEnabled: true,
    autoRefresh: true,
    refreshInterval: 5000 // milliseconds
  },
  
  // Privacy & Data
  privacy: {
    saveHistory: true,
    saveCookies: true,
    clearOnExit: false,
    analyticsEnabled: true
  }
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(defaultPreferences)

  useEffect(() => {
    // Load saved preferences
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (e) {
        console.error('Failed to load preferences:', e)
      }
    }
  }, [])

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences)
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
  }

  const updateSection = (section, values) => {
    const newPreferences = {
      ...preferences,
      [section]: { ...preferences[section], ...values }
    }
    updatePreferences(newPreferences)
  }

  const resetPreferences = () => {
    updatePreferences(defaultPreferences)
  }

  const exportPreferences = () => {
    const data = {
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `preferences_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importPreferences = (data) => {
    try {
      if (data.preferences) {
        updatePreferences({ ...defaultPreferences, ...data.preferences })
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to import preferences:', e)
      return false
    }
  }

  const value = {
    preferences,
    updatePreferences,
    updateSection,
    resetPreferences,
    exportPreferences,
    importPreferences
  }

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
