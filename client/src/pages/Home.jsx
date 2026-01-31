import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startScraper, getScrapedUrls } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AdvancedOptionsModal from '../components/AdvancedOptionsHome'
import SearchBar from '../components/Searchbar'
import '../styles/Home.css'

function Home({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState(null)
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState({})
  const [urlError, setUrlError] = useState('')
  const [urlValid, setUrlValid] = useState(false)
  const [recentUrls, setRecentUrls] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  // Load recent URLs from API on component mount
  useEffect(() => {
    const fetchRecentUrls = async () => {
      setLoadingRecent(true)
      try {
        const response = await getScrapedUrls()
        if (response.urls && response.urls.length > 0) {
          // Get top 5 most recent URLs
          const recent = response.urls.slice(0, 5).map(item => ({
            url: item.start_url,
            pageCount: item.page_count,
            lastScraped: item.last_scraped
          }))
          setRecentUrls(recent)
        }
      } catch (err) {
        console.error('Failed to load recent URLs:', err)
      } finally {
        setLoadingRecent(false)
      }
    }

    fetchRecentUrls()
  }, [])

  const validateUrl = (urlString) => {
    if (!urlString.trim()) {
      setUrlError('')
      setUrlValid(false)
      return false
    }

    try {
      const urlObj = new URL(urlString)
      if (!urlObj.protocol.startsWith('http')) {
        setUrlError('URL must start with http:// or https://')
        setUrlValid(false)
        return false
      }
      setUrlError('')
      setUrlValid(true)
      return true
    } catch {
      setUrlError('Please enter a valid URL (e.g., https://example.com)')
      setUrlValid(false)
      return false
    }
  }

  const handleUrlChange = (e) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    validateUrl(newUrl)
  }

  const handleSelectRecentUrl = (selectedUrl) => {
    setUrl(selectedUrl)
    validateUrl(selectedUrl)
  }

  const handleSubmit = async () => {
    if (!validateUrl(url)) {
      return
    }

    setError(null)
    setIsLoading(true)
    setLoadingStep('Validating URL...')

    try {
      // Step 1: Validating
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLoadingStep('Initializing scraper...')
      
      const payload = {
        start_url: url
      }

      if (advancedOptions.max_pages) payload.max_pages = parseInt(advancedOptions.max_pages)
      if (advancedOptions.max_depth) payload.max_depth = parseInt(advancedOptions.max_depth)
      if (advancedOptions.concurrent_limit) payload.concurrent_limit = parseInt(advancedOptions.concurrent_limit)
      if (advancedOptions.max_file_size_mb) payload.max_file_size_mb = parseInt(advancedOptions.max_file_size_mb)
      
      payload.headless = advancedOptions.headless !== undefined ? advancedOptions.headless : true
      payload.download_file_assets = advancedOptions.download_file_assets !== undefined ? advancedOptions.download_file_assets : true

      if (advancedOptions.login_url) payload.login_url = advancedOptions.login_url
      if (advancedOptions.username) payload.username = advancedOptions.username
      if (advancedOptions.password) payload.password = advancedOptions.password
      if (advancedOptions.username_selector) payload.username_selector = advancedOptions.username_selector
      if (advancedOptions.password_selector) payload.password_selector = advancedOptions.password_selector
      if (advancedOptions.submit_selector) payload.submit_selector = advancedOptions.submit_selector
      if (advancedOptions.success_indicator) payload.success_indicator = advancedOptions.success_indicator
      if (advancedOptions.manual_login_mode !== undefined) payload.manual_login_mode = advancedOptions.manual_login_mode

      // Step 2: Starting
      setLoadingStep('Starting scraper...')
      
      const response = await startScraper(payload)
      
      if (response.success) {
        setLoadingStep('Redirecting...')
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const timestamp = Date.now()
        const sessionId = btoa(`${url}-${timestamp}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
        
        navigate(`/progress/${sessionId}`, { state: { url, isLiveScraping: true } })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start scraper')
    } finally {
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  const handleSaveOptions = (options) => {
    setAdvancedOptions(options)
  }

  const hasAdvancedOptions = () => {
    return Object.entries(advancedOptions).some(([key, value]) => {
      if (key === 'headless' || key === 'download_file_assets') {
        return false
      }
      return value !== '' && value !== undefined && value !== null
    })
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="home" />
      <div className="home">
        {/* Main content - centered */}
        <main className="main">
        <div className="logo">
          <h1>Scrapy</h1>
        </div>
        <SearchBar 
          value={url}
          onChange={handleUrlChange}
          disabled={isLoading}
          onSubmit={handleSubmit}
          error={urlError}
          valid={urlValid}
          recentUrls={recentUrls}
          onSelectRecent={handleSelectRecentUrl}
          loadingRecent={loadingRecent}
        />
        
        <div className="buttons">
          <button 
            type="button"
            className="btn-primary"
            disabled={isLoading || !url || !urlValid}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <span className="loading-text">
                <span className="loading-spinner"></span>
                {loadingStep}
              </span>
            ) : (
              'Start Scraping'
            )}
          </button>
          <button 
            type="button" 
            className="btn-secondary advanced-options-btn"
            onClick={() => setShowAdvancedModal(true)}
            disabled={isLoading}
          >
            Advanced Options
            {hasAdvancedOptions() && <span className="options-badge pulse">●</span>}
          </button>
        </div>

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
        </main>
      </div>
      <Footer />
    </>
  )
}

export default Home
