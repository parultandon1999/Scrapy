import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScraperStatus, stopScraper } from '../services/api'
import '../styles/ScrapingProgress.css'

function ScrapingProgress() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [allPages, setAllPages] = useState([])
  const [allFiles, setAllFiles] = useState([])
  const [currentStartUrl, setCurrentStartUrl] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Start polling
    startPolling()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(fetchStatus, 2000)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const fetchStatus = async () => {
    try {
      const data = await getScraperStatus()
      setStatus(data)
      
      // Check if this is a new scraping session (different URL)
      if (data.start_url && data.start_url !== currentStartUrl) {
        // Clear old results when starting a new URL
        setAllPages([])
        setAllFiles([])
        setCurrentStartUrl(data.start_url)
      }
      
      // Stop polling if scraping is not running
      if (!data.running && intervalRef.current) {
        stopPolling()
      }
      
      // Append new pages to the list (avoid duplicates)
      if (data.recent_pages) {
        setAllPages(prevPages => {
          const existingIds = new Set(prevPages.map(p => p.id))
          const newPages = data.recent_pages.filter(p => !existingIds.has(p.id))
          return [...newPages, ...prevPages]
        })
      }

      // Append new files to the list (avoid duplicates)
      if (data.recent_files) {
        setAllFiles(prevFiles => {
          const existingNames = new Set(prevFiles.map(f => f.file_name + f.downloaded_at))
          const newFiles = data.recent_files.filter(f => !existingNames.has(f.file_name + f.downloaded_at))
          return [...newFiles, ...prevFiles]
        })
      }
      
      // If scraping stopped, don't redirect, just update status
      if (!data.running && data.pages_scraped === 0) {
        // No scraping session, redirect to home
        navigate('/')
      }
    } catch (err) {
      console.error('Error fetching status:', err)
    }
  }

  const handleStop = async () => {
    try {
      await stopScraper()
      fetchStatus()
    } catch (err) {
      console.error('Failed to stop scraper:', err)
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUrl = (url) => {
    if (!url) return ''
    try {
      const urlObj = new URL(url)
      return urlObj.hostname + urlObj.pathname
    } catch {
      return url
    }
  }

  return (
    <div>
      {/* Header - Google results page style */}
      <header className="progress-header">
        <div className="header-container">
          {/* Logo and Search on same line */}
          <div className="header-top">
            {/* Stop button - minimalistic like navbar links */}
            {status && (
              <button 
                onClick={handleStop} 
                className="stop-btn-minimal"
                disabled={!status.running}
              >
                Stop
              </button>
            )}
            
            {/* Stats bar - Google style */}
            {status && (
              <div className="stats-bar-google">
                <span className="stat-item-google">
                  <strong>{status.pages_scraped}</strong> / {status.max_pages} pages
                </span>
                <span className="stat-separator">•</span>
                <span className="stat-item-google">
                  <strong>{status.queue_size}</strong> in queue
                </span>
                <span className="stat-separator">•</span>
                <span className="stat-item-google">
                  <strong>{status.visited}</strong> visited
                </span>
                {status.downloads && status.downloads.successful > 0 && (
                  <>
                    <span className="stat-separator">•</span>
                    <span className="stat-item-google">
                      <strong>{status.downloads.successful}</strong> files
                    </span>
                  </>
                )}
                {status.file_types && Object.keys(status.file_types).length > 0 && (
                  <>
                    <span className="stat-separator">•</span>
                    <span className="stat-item-google">
                      {Object.entries(status.file_types).map(([ext, count], idx) => (
                        <span key={ext}>
                          {idx > 0 && ', '}
                          <strong>{count}</strong> {ext.toUpperCase()}
                        </span>
                      ))}
                    </span>
                  </>
                )}
                {status.running ? (
                  <>
                    <span className="stat-separator">•</span>
                    <span className="stat-item-google status-running">
                      Scraping...
                    </span>
                  </>
                ) : status.pages_scraped > 0 ? (
                  <>
                    <span className="stat-separator">•</span>
                    <span className={`stat-item-google ${status.was_stopped ? 'status-stopped' : 'status-complete'}`}>
                      {status.was_stopped ? '⏸ Stopped' : '✓ Complete'}
                    </span>
                  </>
                ) : null}
              </div>
            )}
            </div>
        </div>
      </header>

      {/* Main content - left-aligned like Google */}
      <main className="progress-main">
        <div className="results-container">
          {/* Scraped Data - Google Results Style */}
          <div className="results-section">
            {/* Pages */}
            {allPages.length > 0 && (
              <div className="progress-results-list">
                {allPages.map((page) => (
                  <div className="progress-result-item" key={page.id}>
                    <div className="progress-result-header">
                      <cite className="progress-result-url">{formatUrl(page.url)}</cite>
                      <span className="progress-result-depth">Depth {page.depth}</span>
                    </div>
                    <a 
                      href={page.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="progress-result-title"
                    >
                      {page.title || 'No title'}
                    </a>
                    <div className="progress-result-meta">
                      <span className="progress-result-time">{page.scraped_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Files */}
            {allFiles.length > 0 && (
              <div className="progress-results-list" style={{ marginTop: allPages.length > 0 ? '28px' : '0' }}>
                {allFiles.map((file, idx) => (
                  <div className="progress-result-item" key={idx}>
                    <div className="progress-result-header">
                      <cite className="progress-result-url">{formatUrl(file.page_url)}</cite>
                      <span className={`progress-file-status ${file.download_status}`}>
                        {file.download_status}
                      </span>
                    </div>
                    <div className="progress-result-title progress-file-title">
                      <span className="progress-file-icon">{file.file_extension}</span>
                      {file.file_name}
                    </div>
                    <div className="progress-result-meta">
                      <span className="progress-file-size">{formatBytes(file.file_size_bytes)}</span>
                      <span className="progress-result-time">{file.downloaded_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No data yet */}
            {allPages.length === 0 && allFiles.length === 0 && status?.running && (
              <div className="no-results">
                <p>Starting scraper... Results will appear here as pages are scraped.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ScrapingProgress
