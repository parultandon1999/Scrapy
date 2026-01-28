import { useState, useEffect } from 'react'
import { startScraper, getScraperStatus, stopScraper } from '../services/api'
import AdvancedOptionsModal from '../components/AdvancedOptionsModal'
import '../styles/Home.css'

function Home() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState({})

  // Poll status every 2 seconds when scraper is running
  useEffect(() => {
    let interval
    if (status?.running) {
      interval = setInterval(fetchStatus, 2000)
    }
    return () => clearInterval(interval)
  }, [status?.running])

  const fetchStatus = async () => {
    try {
      const data = await getScraperStatus()
      setStatus(data)
    } catch (err) {
      console.error('Error fetching status:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const payload = {
        start_url: url
      }

      // Add advanced options if they're set
      if (advancedOptions.max_pages) payload.max_pages = parseInt(advancedOptions.max_pages)
      if (advancedOptions.max_depth) payload.max_depth = parseInt(advancedOptions.max_depth)
      if (advancedOptions.concurrent_limit) payload.concurrent_limit = parseInt(advancedOptions.concurrent_limit)
      if (advancedOptions.max_file_size_mb) payload.max_file_size_mb = parseInt(advancedOptions.max_file_size_mb)
      
      payload.headless = advancedOptions.headless !== undefined ? advancedOptions.headless : true
      payload.download_file_assets = advancedOptions.download_file_assets !== undefined ? advancedOptions.download_file_assets : true

      // Add auth options if provided
      if (advancedOptions.login_url) payload.login_url = advancedOptions.login_url
      if (advancedOptions.username) payload.username = advancedOptions.username
      if (advancedOptions.password) payload.password = advancedOptions.password
      if (advancedOptions.username_selector) payload.username_selector = advancedOptions.username_selector
      if (advancedOptions.password_selector) payload.password_selector = advancedOptions.password_selector
      if (advancedOptions.submit_selector) payload.submit_selector = advancedOptions.submit_selector
      if (advancedOptions.success_indicator) payload.success_indicator = advancedOptions.success_indicator

      const response = await startScraper(payload)
      
      if (response.success) {
        fetchStatus()
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start scraper')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    try {
      await stopScraper()
      fetchStatus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to stop scraper')
    }
  }

  const handleSaveOptions = (options) => {
    setAdvancedOptions(options)
  }

  return (
    <div className="home">
      {/* Main content - centered like Google */}
      <main className="main">
        <div className="logo">
          <h1 className={status?.running ? 'syncing' : ''}>Scrapy</h1>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-box">
            <input
              type="url"
              placeholder="Enter URL to scrape..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={status?.running}
            />
          </div>
          
          <div className="buttons">
            {!status?.running ? (
              <>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isLoading || !url}
                >
                  {isLoading ? 'Starting...' : 'Start Scraping'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAdvancedModal(true)}
                >
                  Advanced Options
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="btn-stop"
                onClick={handleStop}
              >
                Stop Scraping
              </button>
            )}
          </div>
        </form>

        <AdvancedOptionsModal
          isOpen={showAdvancedModal}
          onClose={() => setShowAdvancedModal(false)}
          onSave={handleSaveOptions}
          initialOptions={advancedOptions}
        />

        {/* Error Message */}
        {error && (
          <div className="message error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Status Display */}
        {status?.running && (
          <div className={`status-panel ${status?.running ? 'syncing' : ''}`}>
            <h3>Scraping in Progress...</h3>
            <div className="status-stats">
              <div className="stat-item">
                <span className="stat-label">Pages Scraped:</span>
                <span className={`stat-value ${status?.running ? 'syncing' : ''}`}>{status.pages_scraped} / {status.max_pages}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Queue Size:</span>
                <span className={`stat-value ${status?.running ? 'syncing' : ''}`}>{status.queue_size}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Visited:</span>
                <span className={`stat-value ${status?.running ? 'syncing' : ''}`}>{status.visited}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="progress-bar">
              <div 
                className={`progress-fill ${status?.running ? 'syncing' : ''}`}
                style={{ width: `${(status.pages_scraped / status.max_pages) * 100}%` }}
              />
            </div>
            <p className="progress-text">
              {Math.round((status.pages_scraped / status.max_pages) * 100)}% Complete
            </p>

            {/* Download Stats */}
            {status.downloads && Object.keys(status.downloads).length > 0 && (
              <div className="download-stats">
                <h4>Download Statistics</h4>
                <div className="status-stats">
                  <div className="stat-item">
                    <span className="stat-label">Successful:</span>
                    <span className={`stat-value ${status?.running ? 'syncing' : ''}`}>{status.downloads.successful || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Failed:</span>
                    <span className={`stat-value ${status?.running ? 'syncing' : ''}`}>{status.downloads.failed || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Size:</span>
                    <span className={`stat-value ${status?.running ? 'syncing' : ''}`}>
                      {((status.downloads.total_bytes || 0) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completion Message */}
        {status && !status.running && status.pages_scraped > 0 && (
          <div className="message success-message">
            <h3>✓ Scraping Complete!</h3>
            <p>Successfully scraped {status.pages_scraped} pages</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
