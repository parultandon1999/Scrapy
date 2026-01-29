import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startScraper } from '../services/api'
import AdvancedOptionsModal from '../components/AdvancedOptionsModal'
import SearchBar from '../components/Searchbar'
import '../styles/Home.css'

function Home() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState({})

  const handleSubmit = async () => {
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
        // Generate unique session ID for this scraping session
        const timestamp = Date.now()
        const sessionId = btoa(`${url}-${timestamp}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
        
        // Navigate to progress page with unique session ID
        navigate(`/progress/${sessionId}`, { state: { url, isLiveScraping: true } })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start scraper')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveOptions = (options) => {
    setAdvancedOptions(options)
  }

  const hasAdvancedOptions = () => {
    return Object.entries(advancedOptions).some(([key, value]) => {
      if (key === 'headless' || key === 'download_file_assets') {
        return false // Don't count default boolean values
      }
      return value !== '' && value !== undefined && value !== null
    })
  }

  return (
    <div className="home">
      {/* Main content - centered */}
      <main className="main">
        <div className="logo">
          <h1>Scrapy</h1>
        </div>
        <SearchBar 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          onSubmit={handleSubmit}
        />
        
        <div className="buttons">
          <button 
            type="button"
            className="btn-primary"
            disabled={isLoading || !url}
            onClick={handleSubmit}
          >
            {isLoading ? 'Starting...' : 'Start Scraping'}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowAdvancedModal(true)}
          >
            Advanced Options
            {hasAdvancedOptions() && <span className="options-badge">Active</span>}
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
  )
}

export default Home
