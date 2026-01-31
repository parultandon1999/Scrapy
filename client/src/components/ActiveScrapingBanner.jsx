import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Activity, Eye, X } from 'lucide-react'
import * as api from '../services/api'
import '../styles/ActiveScrapingBanner.css'

function ActiveScrapingBanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isActive, setIsActive] = useState(false)
  const [scrapingData, setScrapingData] = useState(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const intervalRef = useRef(null)
  const consecutiveInactiveRef = useRef(0)

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
          setIsDismissed(false)
          
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

  const handleViewProgress = () => {
    if (scrapingData?.url) {
      const timestamp = Date.now()
      const sessionId = btoa(`${scrapingData.url}-${timestamp}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
      navigate(`/progress/${sessionId}`, { state: { url: scrapingData.url, isLiveScraping: true } })
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  // Don't show banner on progress page
  if (location.pathname.startsWith('/progress')) {
    return null
  }

  if (!isActive || isDismissed || !scrapingData) {
    return null
  }

  const progress = scrapingData.maxPages > 0 
    ? (scrapingData.pagesScraped / scrapingData.maxPages) * 100 
    : 0

  return (
    <div className="active-scraping-banner">
      <div className="banner-content">
        <div className="banner-icon">
          <Activity size={20} className="pulse-icon" />
        </div>
        
        <div className="banner-info">
          <div className="banner-title">
            {scrapingData.isPaused ? 'Scraping Paused' : 'Scraping in Progress'}
          </div>
          <div className="banner-details">
            <span className="banner-url">{scrapingData.url}</span>
            <span className="banner-separator">•</span>
            <span className="banner-stats">
              {scrapingData.pagesScraped} / {scrapingData.maxPages} pages
            </span>
          </div>
          {scrapingData.maxPages > 0 && (
            <div className="banner-progress-bar">
              <div 
                className="banner-progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        <div className="banner-actions">
          <button 
            onClick={handleViewProgress}
            className="banner-btn view-btn"
            title="View Progress"
          >
            <Eye size={16} />
            View Progress
          </button>
          <button 
            onClick={handleDismiss}
            className="banner-btn dismiss-btn"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActiveScrapingBanner
