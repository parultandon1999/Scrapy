import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Progress from './mui/progress/Progress'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'
import * as api from '../services/api'

function ActiveScrapingBanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isActive, setIsActive] = useState(false)
  const [scrapingData, setScrapingData] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const intervalRef = useRef(null)
  const consecutiveInactiveRef = useRef(0)
  const hideTimeoutRef = useRef(null)
  const isDark = document.body.classList.contains('dark-mode')
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Don't show banner on progress page
    if (location.pathname.startsWith('/progress')) {
      consecutiveInactiveRef.current = 0
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Reset dismiss state when navigating to a new page
    consecutiveInactiveRef.current = 0

    const checkScrapingStatus = async () => {
      try {
        const status = await api.getScraperStatus()
        
        if (status.running && status.pages_scraped > 0) {
          setIsActive(true)
          setScrapingData({
            url: status.start_url,
            pagesScraped: status.pages_scraped,
            maxPages: status.max_pages,
            isPaused: status.is_paused
          })
          consecutiveInactiveRef.current = 0
          
          // Reset to fast polling when active (5 seconds)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          intervalRef.current = setInterval(checkScrapingStatus, 5000)
        } else {
          setIsActive(false)
          setScrapingData(null)
          
          // Increase backoff counter
          consecutiveInactiveRef.current++
          
          // After just 2 inactive checks (10 seconds), slow down significantly
          if (consecutiveInactiveRef.current === 2) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
            // Slow down to 20 seconds
            intervalRef.current = setInterval(checkScrapingStatus, 20000)
          } else if (consecutiveInactiveRef.current >= 4) {
            // After 4 checks, stop polling completely on non-progress pages
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            console.log('ActiveScrapingBanner: Stopped polling (no active scraping)')
          }
        }
      } catch {
        setIsActive(false)
        consecutiveInactiveRef.current++
        
        // Stop on errors too
        if (consecutiveInactiveRef.current >= 3) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }
    }

    // Check immediately
    checkScrapingStatus()

    // Start with 5 second polling
    intervalRef.current = setInterval(checkScrapingStatus, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [location.pathname])

  const handleClick = () => {
    if (scrapingData?.url) {
      const timestamp = Date.now()
      const sessionId = btoa(`${scrapingData.url}-${timestamp}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
      navigate(`/progress/${sessionId}`, { state: { url: scrapingData.url, isLiveScraping: true } })
    }
  }

  if (!isActive || !scrapingData) {
    return null
  }

  const progress = scrapingData.maxPages > 0 
    ? (scrapingData.pagesScraped / scrapingData.maxPages) * 100 
    : 0

  // Untitled UI design tokens
  const styles = {
    indicator: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    },
    indicatorDark: {
    },
    indicatorHover: {
      background: 'rgba(0, 0, 0, 0.05)',
    },
    indicatorHoverDark: {
      background: 'rgba(255, 255, 255, 0.1)',
    },
    tooltip: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: '0',
      minWidth: '180px',
      padding: '12px',
      background: '#FFFFFF',
      border: '1px solid #E4E7EC',
      borderRadius: '4px',
      boxShadow: '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
      zIndex: '1000',
      opacity: showTooltip ? 1 : 0,
      visibility: showTooltip ? 'visible' : 'hidden',
      transform: showTooltip ? 'translateY(0)' : 'translateY(-4px)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: showTooltip ? 'auto' : 'none',
      cursor: 'default'
    },
    tooltipDark: {
      background: '#1A1D24',
      border: '1px solid #333741',
      boxShadow: '0 12px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    },
    tooltipUrl: {
      fontSize: '12px',
      color: '#475467',
      marginBottom: '8px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      lineHeight: '18px',
      maxWidth: '240px', // Added maxWidth to ensure ellipsis works if parent isn't constrained
    },
    tooltipUrlDark: {
      color: '#98A2B3',
    },
    tooltipStats: {
      fontSize: '12px',
      color: '#667085',
      marginBottom: '8px',
      lineHeight: '18px',
    },
    tooltipStatsDark: {
      color: '#85888E',
    },
  }

  return (
    <div
      style={{
        ...styles.indicator,
        ...(isDark && styles.indicatorDark),
        ...(isHovered && (isDark ? styles.indicatorHoverDark : styles.indicatorHover)),
      }}
      onMouseEnter={() => {
        setIsHovered(true)
        setShowTooltip(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        hideTimeoutRef.current = setTimeout(() => {
          setShowTooltip(false)
        }, 200)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {scrapingData.isPaused ? (
        <Icon 
          name="Pause" 
          size={20}
          style={{ 
            cursor: 'pointer',
            color: isDark ? '#FFA500' : '#FF8C00'
          }} 
        />
      ) : (
        <Progress 
          type="circular" 
          variant="indeterminate" 
          size={20}
          thickness={4}
          color="primary"
        />
      )}

      <div 
          style={{
            ...styles.tooltip,
            ...(isDark && styles.tooltipDark),
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => {
            clearTimeout(hideTimeoutRef.current)
            setShowTooltip(true)
          }}
          onMouseLeave={() => {
            setShowTooltip(false)
          }}
        >
          <div style={{
            ...styles.tooltipUrl,
            ...(isDark && styles.tooltipUrlDark),
          }}>
            {scrapingData.url}
          </div>
          <div style={{
            ...styles.tooltipStats,
            ...(isDark && styles.tooltipStatsDark),
          }}>
            {scrapingData.pagesScraped} / {scrapingData.maxPages} pages scraped
          </div>
          {scrapingData.maxPages > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <Progress 
                type="linear"
                variant="determinate"
                value={progress}
                color="success"
                size="small"
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Button
              variant={scrapingData.isPaused ? 'success' : 'warning'}
              size="small"
              // REDUCED HEIGHT: Changed padding and added explicit height/minHeight
              style={{ 
                padding: '4px 10px', 
                fontSize: '11px', 
                height: '26px', 
                minHeight: 'auto',
                lineHeight: '1' ,
                boxShadow: 'none',
                borderRadius: '4px'
              }}
              onClick={async (e) => {
                e.stopPropagation()
                try {
                  if (scrapingData.isPaused) {
                    await api.resumeScraper()
                  } else {
                    await api.pauseScraper()
                  }
                } catch (error) {
                  console.error('Failed to toggle scraper:', error)
                }
              }}
            >
              {scrapingData.isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="primary"
              size="small"
              // REDUCED HEIGHT: Changed padding and added explicit height/minHeight
              style={{ 
                padding: '4px 12px', 
                fontSize: '11px', 
                height: '26px', 
                minHeight: 'auto',
                lineHeight: '1' ,
                boxShadow: 'none',
                borderRadius: '4px'
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
            >
              Progress
            </Button>
          </div>
        </div>
    </div>
  )
}

export default ActiveScrapingBanner