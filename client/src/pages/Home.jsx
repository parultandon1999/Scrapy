import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startScraper, getScrapedUrls } from '../services/api'
import Navbar from '../components/Navbar'
import Button from '../components/mui/buttons/Button'
import Icon from '../components/mui/icons/Icon'
import Tour from '../components/Tour'
import { homeTourSteps } from '../utils/tourHelpers'
import AdvancedOptionsModal from '../components/AdvancedOptionsHome'
import HistoryModal from '../components/HistoryModal'
import SearchBar from '../components/Searchbar'

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
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    const fetchRecentUrls = async () => {
      setLoadingRecent(true)
      try {
        const response = await getScrapedUrls()
        if (response.urls && response.urls.length > 0) {
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
      setUrlError('Please enter a valid URL')
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

  const handleDeleteRecentUrl = async (urlToDelete) => {
    try {
      // Remove from local state immediately for better UX
      setRecentUrls(prev => prev.filter(item => item.url !== urlToDelete))
      
      // Optionally: Call API to delete the session from database
      // await deleteSession(urlToDelete)
    } catch (err) {
      console.error('Failed to delete recent URL:', err)
    }
  }

  const handleSubmit = async () => {
    if (!validateUrl(url)) {
      return
    }

    setError(null)
    setIsLoading(true)
    setLoadingStep('Validating URL...')

    try {
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
    <div className="min-h-[95vh] flex flex-col bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-200">
      <Tour 
        steps={homeTourSteps}
        onComplete={() => console.log('Tour completed')}
        onSkip={() => console.log('Tour skipped')}
      />
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="home" />
      
      {/* History Icon Button - Top Right */}
      <button
        onClick={() => setShowHistoryModal(true)}
        className={`
          fixed top-20 right-5 md:top-[100px] md:right-8 z-[1000]
          flex items-center justify-center
          w-11 h-11 md:w-[52px] md:h-[52px]
          rounded-full bg-white dark:bg-[#1A1D24]
          border border-gray-200 dark:border-[#333741]
          text-gray-500 dark:text-gray-400
          cursor-pointer backdrop-blur-md
          transition-all duration-300 ease-out
          hover:bg-gray-50 dark:hover:bg-[#2A2D35]
          hover:text-gray-900 dark:hover:text-white
          hover:-translate-y-0.5 hover:border-blue-600 dark:hover:border-blue-500
          active:translate-y-0
          shadow-sm
        `}
        aria-label="View scraping history"
        title="View History"
      >
        <Icon 
          name="Schedule" 
          className="text-[22px] md:text-[26px]" 
        />
      </button>
      
      <main className="flex-1 flex flex-col items-center justify-center mt-[-16px] md:mt-[-64px] px-4 md:px-0">
        <div className="w-full max-w-4xl text-center">
          
          {/* Title */}
          <h1 className="text-[3.5rem] md:text-[5.5rem] font-light tracking-tight mb-6 md:mb-8 text-gray-900 dark:text-white">
            Scrapy
          </h1>
          
          {/* Search Bar Container */}
          <div className="flex justify-center mb-6 w-full">
            <SearchBar 
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
              onSubmit={handleSubmit}
              error={urlError}
              valid={urlValid}
              recentUrls={recentUrls}
              onSelectRecent={handleSelectRecentUrl}
              onDeleteRecent={handleDeleteRecentUrl}
              loadingRecent={loadingRecent}
            />
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-[400px] sm:max-w-none mx-auto">
            <Button
              variant="primary"
              disabled={isLoading || !url || !urlValid}
              onClick={handleSubmit}
              size="medium"
              className="px-6 py-2 rounded-full shadow-none hover:shadow-md text-sm font-normal min-w-[160px]"
            >
              {isLoading ? (
                <>
                  <Icon name="HourglassEmpty" size={18} className="animate-spin" />
                  {loadingStep}
                </>
              ) : (
                <>
                  <Icon name="PlayArrow" size={18} />
                  Start Scraping
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedModal(true)}
              disabled={isLoading}
              size="medium"
              className="px-6 py-2 rounded-full text-sm font-normal relative min-w-[180px]"
            >
              <Icon name="Tune" size={18} />
              Advanced Options
              {hasAdvancedOptions() && (
                <span className="ml-2 w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
              )}
            </Button>
          </div>

          <AdvancedOptionsModal
            isOpen={showAdvancedModal}
            onClose={() => setShowAdvancedModal(false)}
            onSave={handleSaveOptions}
            initialOptions={advancedOptions}
          />

          <HistoryModal
            isOpen={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
          />

          {/* Error Alert with Fade Transition */}
          <div 
            className={`
              mt-6 transition-all duration-300 ease-in-out
              ${error ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
            `}
          >
            {error && (
              <div className="max-w-[500px] mx-auto bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm">
                <span className="text-sm font-medium">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
                >
                  <Icon name="Close" size={16} />
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default Home