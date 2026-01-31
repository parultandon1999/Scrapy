import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import '../styles/OfflineBanner.css'

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showReconnected) return null

  return (
    <div className={`offline-banner ${isOnline ? 'online' : 'offline'}`}>
      <div className="offline-banner-content">
        {isOnline ? (
          <>
            <Wifi size={20} />
            <span>Back online! Connection restored.</span>
          </>
        ) : (
          <>
            <WifiOff size={20} />
            <span>No internet connection. Some features may not work.</span>
          </>
        )}
      </div>
    </div>
  )
}

export default OfflineBanner
