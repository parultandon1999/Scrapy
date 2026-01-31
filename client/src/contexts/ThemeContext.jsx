import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const defaultTheme = {
  primary: '#1a73e8',
  primaryDark: '#1557b0',
  secondary: '#667eea',
  secondaryDark: '#5568d3',
  success: '#34a853',
  successDark: '#2d8e47',
  danger: '#ea4335',
  dangerDark: '#d33b2c',
  warning: '#fbbc04',
  warningDark: '#f9ab00'
}

const presetThemes = {
  default: {
    name: 'Default Blue',
    colors: defaultTheme
  },
  purple: {
    name: 'Purple Dream',
    colors: {
      primary: '#7c3aed',
      primaryDark: '#6d28d9',
      secondary: '#a78bfa',
      secondaryDark: '#8b5cf6',
      success: '#10b981',
      successDark: '#059669',
      danger: '#ef4444',
      dangerDark: '#dc2626',
      warning: '#f59e0b',
      warningDark: '#d97706'
    }
  },
  green: {
    name: 'Forest Green',
    colors: {
      primary: '#059669',
      primaryDark: '#047857',
      secondary: '#10b981',
      secondaryDark: '#059669',
      success: '#22c55e',
      successDark: '#16a34a',
      danger: '#ef4444',
      dangerDark: '#dc2626',
      warning: '#f59e0b',
      warningDark: '#d97706'
    }
  },
  orange: {
    name: 'Sunset Orange',
    colors: {
      primary: '#ea580c',
      primaryDark: '#c2410c',
      secondary: '#f97316',
      secondaryDark: '#ea580c',
      success: '#22c55e',
      successDark: '#16a34a',
      danger: '#dc2626',
      dangerDark: '#b91c1c',
      warning: '#eab308',
      warningDark: '#ca8a04'
    }
  },
  pink: {
    name: 'Pink Blossom',
    colors: {
      primary: '#ec4899',
      primaryDark: '#db2777',
      secondary: '#f472b6',
      secondaryDark: '#ec4899',
      success: '#10b981',
      successDark: '#059669',
      danger: '#ef4444',
      dangerDark: '#dc2626',
      warning: '#f59e0b',
      warningDark: '#d97706'
    }
  },
  teal: {
    name: 'Ocean Teal',
    colors: {
      primary: '#0d9488',
      primaryDark: '#0f766e',
      secondary: '#14b8a6',
      secondaryDark: '#0d9488',
      success: '#22c55e',
      successDark: '#16a34a',
      danger: '#ef4444',
      dangerDark: '#dc2626',
      warning: '#f59e0b',
      warningDark: '#d97706'
    }
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('customTheme')
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme))
      } catch (e) {
        console.error('Failed to load theme:', e)
      }
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('theme')
    if (savedDarkMode === 'dark') {
      setDarkMode(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }, [theme])

  const updateTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('customTheme', JSON.stringify(newTheme))
  }

  const updateColor = (colorKey, value) => {
    const newTheme = { ...theme, [colorKey]: value }
    updateTheme(newTheme)
  }

  const resetTheme = () => {
    updateTheme(defaultTheme)
  }

  const applyPreset = (presetKey) => {
    if (presetThemes[presetKey]) {
      updateTheme(presetThemes[presetKey].colors)
    }
  }

  const exportTheme = () => {
    const themeData = {
      name: 'Custom Theme',
      colors: theme,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importTheme = (themeData) => {
    try {
      if (themeData.colors) {
        updateTheme(themeData.colors)
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to import theme:', e)
      return false
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  const value = {
    theme,
    darkMode,
    updateTheme,
    updateColor,
    resetTheme,
    applyPreset,
    exportTheme,
    importTheme,
    toggleDarkMode,
    presetThemes
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
