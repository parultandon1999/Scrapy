import { useState, useEffect } from 'react'
import Icon from './mui/icons/Icon'

function OfflineBanner({ testOffline = false }) {
  const [isOnline, setIsOnline] = useState(() => {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true
    return online
  })
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => {
        setShowReconnected(false)
      }, 5000)
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

  const shouldShowBanner = !isOnline || showReconnected || testOffline

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-[10000] flex justify-center items-center gap-2 py-2
        transition-transform duration-200 ease-out
        ${shouldShowBanner ? 'translate-y-0' : 'translate-y-full'}
        ${(isOnline && !testOffline) ? 'bg-[#12cc8eff]' : 'bg-black'}
      `}
      role="status"
      aria-live="polite"
    >
      <div className="text-white">
        <Icon 
          name={(isOnline && !testOffline) ? "Wifi" : "WifiOff"} 
          size={16} 
        />
      </div>
      <span className="text-white font-medium text-xs">
        {(isOnline && !testOffline) ? 'Back online' : 'No connection'}
      </span>
    </div>
  )
}

export default OfflineBanner