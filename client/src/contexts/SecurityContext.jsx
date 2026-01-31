import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ToastContainer'

const SecurityContext = createContext()

export function useSession() {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSession must be used within SecurityProvider')
  }
  return context
}

/**
 * SecurityProvider - Manages session timeout and security features
 */
export function SecurityProvider({ children }) {
  const navigate = useNavigate()
  const toast = useToast()
  
  // Session timeout settings (in milliseconds)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000 // 2 minutes warning
  
  const [isActive, setIsActive] = useState(true)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(INACTIVITY_TIMEOUT)
  const [sessionStartTime] = useState(Date.now())
  
  const timeoutRef = useRef(null)
  const warningTimeoutRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  // CSRF Token management
  const [csrfToken, setCsrfToken] = useState(() => {
    // Try to get existing token from localStorage
    return localStorage.getItem('csrf_token') || generateCSRFToken()
  })

  // Generate a CSRF token
  function generateCSRFToken() {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    localStorage.setItem('csrf_token', token)
    return token
  }

  // Refresh CSRF token
  const refreshCSRFToken = useCallback(() => {
    const newToken = generateCSRFToken()
    setCsrfToken(newToken)
    return newToken
  }, [])

  // Get CSRF token for API requests
  const getCSRFToken = useCallback(() => {
    return csrfToken
  }, [csrfToken])

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    setIsActive(true)
    setShowTimeoutWarning(false)
    setTimeRemaining(INACTIVITY_TIMEOUT)

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    // Set warning timer (show warning before timeout)
    warningTimeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true)
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - lastActivityRef.current
        const remaining = INACTIVITY_TIMEOUT - elapsed
        
        if (remaining <= 0) {
          handleSessionTimeout()
        } else {
          setTimeRemaining(remaining)
        }
      }, 1000)
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT)

    // Set timeout timer (auto-logout)
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout()
    }, INACTIVITY_TIMEOUT)
  }, [INACTIVITY_TIMEOUT, WARNING_BEFORE_TIMEOUT])

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    setIsActive(false)
    setShowTimeoutWarning(false)
    
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    
    // Clear sensitive data
    localStorage.removeItem('csrf_token')
    sessionStorage.clear()
    
    // Show notification
    toast.warning('Session expired due to inactivity. Please refresh to continue.')
    
    // Optionally redirect to home
    // navigate('/')
  }, [toast])

  // Extend session (when user clicks "Stay Logged In")
  const extendSession = useCallback(() => {
    resetActivityTimer()
    toast.success('Session extended')
  }, [resetActivityTimer, toast])

  // Manual logout
  const logout = useCallback(() => {
    setIsActive(false)
    
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    
    // Clear sensitive data
    localStorage.removeItem('csrf_token')
    sessionStorage.clear()
    
    toast.info('Logged out successfully')
    navigate('/')
  }, [navigate, toast])

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      if (isActive) {
        resetActivityTimer()
      }
    }

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Initialize timer
    resetActivityTimer()

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [isActive, resetActivityTimer])

  // Get session info
  const getSessionInfo = useCallback(() => {
    const now = Date.now()
    const sessionDuration = now - sessionStartTime
    const lastActivity = now - lastActivityRef.current
    
    return {
      isActive,
      sessionDuration,
      lastActivity,
      timeRemaining,
      showTimeoutWarning
    }
  }, [isActive, sessionStartTime, timeRemaining, showTimeoutWarning])

  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [timeRemaining])

  const value = {
    isActive,
    showTimeoutWarning,
    timeRemaining,
    formatTimeRemaining,
    extendSession,
    logout,
    getSessionInfo,
    csrfToken,
    getCSRFToken,
    refreshCSRFToken
  }

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  )
}
