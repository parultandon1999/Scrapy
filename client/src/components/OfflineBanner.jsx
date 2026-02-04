import { useState, useEffect } from 'react'
import { Box, Typography, Slide } from '@mui/material'
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
    <Slide direction="up" in={shouldShowBanner} mountOnEnter unmountOnExit timeout={200}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          py: 1,
          m: 0,
          bgcolor: (isOnline && !testOffline) ? '#12cc8eff' : '#000000',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          borderRadius: 0,
        }}
        role="status"
        aria-live="polite"
      >
        <Icon 
          name={(isOnline && !testOffline) ? "Wifi" : "WifiOff"} 
          size={16} 
          sx={{ color: 'white' }} 
        />
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'white', 
            fontWeight: 500,
            fontSize: '0.8rem'
          }}
        >
          {(isOnline && !testOffline) ? 'Back online' : 'No connection'}
        </Typography>
      </Box>
    </Slide>
  )
}

export default OfflineBanner
