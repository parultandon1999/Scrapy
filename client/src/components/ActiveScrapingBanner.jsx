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
  
  // Keep existing dark mode detection logic
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

  return (
    <div
      className={`
        relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 cursor-pointer
        ${isHovered ? (isDark ? 'bg-white/10' : 'bg-black/5') : ''}
      `}
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
          className="cursor-pointer"
          style={{ color: isDark ? '#FFA500' : '#FF8C00' }} 
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

      {/* Tooltip */}
      <div 
        className={`
          absolute top-[calc(100%+8px)] left-0 min-w-[180px] p-3 rounded-md border shadow-lg z-[1000]
          transition-all duration-200 ease-out cursor-default
          ${isDark 
            ? 'bg-[#1A1D24] border-[#333741] shadow-[0_12px_16px_-4px_rgba(0,0,0,0.4)]' 
            : 'bg-white border-[#E4E7EC] shadow-[0_12px_16px_-4px_rgba(16,24,40,0.08)]'}
          ${showTooltip 
            ? 'opacity-100 visible translate-y-0 pointer-events-auto' 
            : 'opacity-0 invisible -translate-y-1 pointer-events-none'}
        `}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          clearTimeout(hideTimeoutRef.current)
          setShowTooltip(true)
        }}
        onMouseLeave={() => {
          setShowTooltip(false)
        }}
      >
        <div className={`
          text-xs mb-2 overflow-hidden text-ellipsis whitespace-nowrap leading-[18px] max-w-[240px]
          ${isDark ? 'text-[#98A2B3]' : 'text-[#475467]'}
        `}>
          {scrapingData.url}
        </div>
        
        <div className={`
          text-xs mb-2 leading-[18px]
          ${isDark ? 'text-[#85888E]' : 'text-[#667085]'}
        `}>
          {scrapingData.pagesScraped} / {scrapingData.maxPages} pages scraped
        </div>

        {scrapingData.maxPages > 0 && (
          <div className="mb-2">
            <Progress 
              type="linear"
              variant="determinate"
              value={progress}
              color="success"
              size="small"
            />
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <Button
            variant={scrapingData.isPaused ? 'success' : 'warning'}
            size="small"
            className="px-2.5 py-1 text-[11px] h-[26px] min-h-0 leading-none shadow-none rounded"
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
            className="px-3 py-1 text-[11px] h-[26px] min-h-0 leading-none shadow-none rounded"
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