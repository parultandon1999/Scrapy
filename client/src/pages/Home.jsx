import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Stack,
  Alert,
  Fade,
} from '@mui/material'
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
      // Optionally show error toast
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
    <Box sx={{ minHeight: '95vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Tour 
        steps={homeTourSteps}
        onComplete={() => console.log('Tour completed')}
        onSkip={() => console.log('Tour skipped')}
      />
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="home" />
      
      {/* History Icon Button - Top Right */}
      <Box
        onClick={() => setShowHistoryModal(true)}
        sx={{
          position: 'fixed',
          top: { xs: 80, md: 100 },
          right: { xs: 20, md: 32 },
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 44, md: 52 },
          height: { xs: 44, md: 52 },
          borderRadius: '50%',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          color: 'text.secondary',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'text.primary',
            transform: 'translateY(-2px)',
            borderColor: 'primary.main',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        }}
        aria-label="View scraping history"
        title="View History"
      >
        <Icon 
        name="Schedule" 
        size={{ xs: 22, md: 26 }} 
      />
      </Box>
      
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: { xs: -2, md: -16 },
          px: { xs: 2, md: 0 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.5rem', md: '5.5rem' },
              fontWeight: 300,
              letterSpacing: '-0.02em',
              mb: { xs: 3, md: 4 },
              color: 'text.primary',
            }}
          >
            Scrapy
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
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
          </Box>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              justifyContent: 'center',
              maxWidth: { xs: 400, sm: 'none' },
              mx: 'auto',
            }}
          >
            <Button
              variant="primary"
              disabled={isLoading || !url || !urlValid}
              onClick={handleSubmit}
              size="medium"
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 400,
                px: 3,
                py: 1,
                borderRadius: 50,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 1,
                },
              }}
            >
              {isLoading ? (
                <>
                  <Icon name="HourglassEmpty" size={18} sx={{ animation: 'spin 1s linear infinite' }} />
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
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 400,
                px: 3,
                py: 1,
                borderRadius: 50,
                position: 'relative',
              }}
            >
              <Icon name="Tune" size={18} />
              Advanced Options
              {hasAdvancedOptions() && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'inline-block',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
              )}
            </Button>
          </Stack>

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

          <Fade in={!!error}>
            <Box sx={{ mt: 3 }}>
              {error && (
                <Alert 
                  severity="error" 
                  onClose={() => setError(null)}
                  sx={{ 
                    maxWidth: 500, 
                    mx: 'auto',
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
