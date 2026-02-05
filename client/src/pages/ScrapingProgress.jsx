import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Alert,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material'
import Navbar from '../components/Navbar'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import Button from '../components/mui/buttons/Button'
import Icon from '../components/mui/icons/Icon'
import * as api from '../services/api'

function ScrapingProgress({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { sessionId } = useParams()
  
  // State
  const [activeView, setActiveView] = useState('pages')
  const [status, setStatus] = useState(null)
  const [allPages, setAllPages] = useState([])
  const [allFiles, setAllFiles] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [expandedMetadata, setExpandedMetadata] = useState({})
  const [metadataContent, setMetadataContent] = useState({})
  const [isHistoryView, setIsHistoryView] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  
  // Updates & Polling
  const [_pendingUpdates, setPendingUpdates] = useState({ pages: [], files: [] })
  const updateTimeoutRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  
  // UI State
  const [visiblePageCount, setVisiblePageCount] = useState(20)
  const [isExporting, setIsExporting] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [eta, setEta] = useState(null)
  const [scrapingRate, setScrapingRate] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedFileTypes, setCollapsedFileTypes] = useState({})
  const [_speedHistory, setSpeedHistory] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // --- Effects ---
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted')
      })
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true)
    }

    if (sessionId && !location.state?.isLiveScraping) {
      setIsHistoryView(true)
      if (location.state?.viewHistoryUrl) {
        fetchHistoryData(location.state.viewHistoryUrl)
      }
    } else {
      fetchStatus()
      startPolling()
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, location.state])

  // --- API & Logic Functions ---
  const fetchHistoryData = async (startUrl) => {
    try {
      const data = await api.getHistoryByUrl(startUrl)
      setAllPages(data.pages || [])
      setAllFiles(data.files || [])
      const fileTypes = {}
      if (data.files) {
        data.files.forEach(f => {
          if (f.download_status === 'success' && f.file_extension) {
            fileTypes[f.file_extension] = (fileTypes[f.file_extension] || 0) + 1
          }
        })
      }
      setStatus({
        running: false,
        pages_scraped: data.pages?.length || 0,
        queue_size: 0,
        visited: data.pages?.length || 0,
        max_pages: data.pages?.length || 0,
        downloads: { successful: data.files?.length || 0 },
        file_types: fileTypes,
        start_url: startUrl,
        was_stopped: false
      })
    } catch (err) {
      setError('Failed to load history data')
      console.error(err)
    }
  }

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchStatus, 3000)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = null
    }
  }

  const scheduleUpdate = (newPages, newFiles) => {
    setPendingUpdates(prev => ({
      pages: [...prev.pages, ...newPages],
      files: [...prev.files, ...newFiles]
    }))

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)

    const timeSinceLastUpdate = Date.now() - lastUpdateRef.current
    const shouldUpdateImmediately = timeSinceLastUpdate > 5000 || (newPages.length + newFiles.length) > 50

    if (shouldUpdateImmediately) {
      applyPendingUpdates()
    } else {
      updateTimeoutRef.current = setTimeout(applyPendingUpdates, 2000)
    }
  }

  const applyPendingUpdates = () => {
    setPendingUpdates(pending => {
      if (pending.pages.length > 0) {
        setAllPages(prevPages => {
          const existingIds = new Set(prevPages.map(p => p.id))
          const newPages = pending.pages.filter(p => !existingIds.has(p.id))
          return [...prevPages, ...newPages]
        })
      }
      if (pending.files.length > 0) {
        setAllFiles(prevFiles => {
          const existingNames = new Set(prevFiles.map(f => f.file_name + f.downloaded_at))
          const newFiles = pending.files.filter(f => !existingNames.has(f.file_name + f.downloaded_at))
          return [...prevFiles, ...newFiles]
        })
      }
      lastUpdateRef.current = Date.now()
      return { pages: [], files: [] }
    })
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = null
    }
  }

  const fetchStatus = async () => {
    try {
      const data = await api.getScraperStatus()
      setStatus(data)
      
      if (data.running && !startTime && data.pages_scraped > 0) {
        setStartTime(Date.now())
      }
      
      if (data.running && startTime && data.pages_scraped > 0) {
        const elapsedSeconds = (Date.now() - startTime) / 1000
        const rate = data.pages_scraped / elapsedSeconds
        setScrapingRate(rate)
        setSpeedHistory(prev => {
          const newHistory = [...prev, { time: Date.now(), rate }]
          return newHistory.slice(-20)
        })
        const remaining = data.max_pages - data.pages_scraped
        if (rate > 0 && remaining > 0) {
          setEta(remaining / rate)
        } else {
          setEta(null)
        }
      } else if (!data.running) {
        const wasRunning = status?.running
        if (wasRunning && !data.running && data.pages_scraped > 0) {
          if (notificationsEnabled) {
            new Notification('Scraping Complete!', {
              body: `Successfully scraped ${data.pages_scraped} pages`,
              icon: '/favicon.ico',
              tag: 'scraping-complete'
            })
          }
        }
        setStartTime(null)
        setEta(null)
        setScrapingRate(0)
        stopPolling()
      }
      
      if (data.session_id && data.session_id !== currentSessionId) {
        setAllPages([])
        setAllFiles([])
        setPendingUpdates({ pages: [], files: [] })
        setCurrentSessionId(data.session_id)
        setStartTime(null)
        setEta(null)
        setScrapingRate(0)
        setSpeedHistory([])
      }
      
      if (!data.running && intervalRef.current) {
        stopPolling()
        applyPendingUpdates()
      }

      if (!data.running && data.pages_scraped === 0 && !isHistoryView) {
        navigate('/')
        return
      }
      
      const newPages = data.recent_pages || []
      const newFiles = data.recent_files || []
      
      if (newPages.length > 0 || newFiles.length > 0) {
        scheduleUpdate(newPages, newFiles)
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
      stopPolling()
    }
  }

  const formatETA = (seconds) => {
    if (!seconds || seconds <= 0) return 'Calculating...'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const handleStop = async () => {
    try { await api.stopScraper(); fetchStatus() } catch { setError('Failed to stop scraper') }
  }

  const handlePause = async () => {
    try { await api.pauseScraper(); fetchStatus() } catch { setError('Failed to pause scraper') }
  }

  const handleResume = async () => {
    try { await api.resumeScraper(); fetchStatus() } catch { setError('Failed to resume scraper') }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await api.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `scraper-export-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setError(null)
    } catch (err) {
      setError('Failed to export data')
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const toggleMetadataExpand = async (pageId) => {
    if (expandedMetadata[pageId]) {
      setExpandedMetadata(prev => ({ ...prev, [pageId]: false }))
    } else {
      setExpandedMetadata(prev => ({ ...prev, [pageId]: true }))
      if (!metadataContent[pageId]) {
        try {
          const data = await api.getPageMetadata(pageId)
          setMetadataContent(prev => ({ ...prev, [pageId]: data }))
        } catch (err) {
          console.error('Failed to fetch metadata:', err)
        }
      }
    }
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

  const getPageFiles = (pageUrl) => allFiles.filter(file => file.page_url === pageUrl)

  const filteredPages = allPages.filter(page => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      page.url?.toLowerCase().includes(query) ||
      page.title?.toLowerCase().includes(query)
    )
  })

  const groupedFiles = allFiles.reduce((acc, file) => {
    const ext = file.file_extension || 'unknown'
    if (!acc[ext]) acc[ext] = []
    acc[ext].push(file)
    return acc
  }, {})

  const toggleFileTypeCollapse = (fileType) => {
    setCollapsedFileTypes(prev => ({ ...prev, [fileType]: !prev[fileType] }))
  }

  const handleViewDetails = (page) => {
    navigate(`/page-details/${page.id}`)
  }

  // --- Render Helpers ---
  const getStatusColor = () => {
    if (!status) return 'default'
    if (status.running) return status.is_paused ? 'warning' : 'info'
    if (status.was_stopped) return 'error'
    return 'success'
  }

  const getStatusText = () => {
    if (!status) return 'Loading...'
    if (status.running) return status.is_paused ? 'Paused' : 'Scraping...'
    if (status.was_stopped) return 'Stopped'
    return 'Complete'
  }

  const getStatusIconName = () => {
    if (!status) return null
    if (status.running) return status.is_paused ? 'Pause' : 'PlayArrow'
    if (status.was_stopped) return 'StopCircle'
    return 'CheckCircle'
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="home" />

      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Compact Sidebar */}
        <Paper 
          elevation={0}
          sx={{ 
            width: { xs: '100%', md: 260 },
            borderRight: 1,
            borderColor: 'divider',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <Icon name="Timeline" size={18} />
              Progress
            </Typography>

            {status && (
              <Stack spacing={2}>
                {/* Compact Status Badge */}
                <Chip
                  icon={getStatusIconName() ? <Icon name={getStatusIconName()} size={12} /> : undefined}
                  label={getStatusText()}
                  color={getStatusColor()}
                  size="small"
                  sx={{ width: 'fit-content' }}
                />

                {/* Compact Progress Bar */}
                {status.max_pages > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {status.pages_scraped} / {status.max_pages}
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {Math.round((status.pages_scraped / status.max_pages) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(status.pages_scraped / status.max_pages) * 100}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                )}

                {/* Compact Stats Grid */}
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                      <Icon name="Layers" size={14} sx={{ color: 'text.secondary', mb: 0.25 }} />
                      <Typography variant="h6" fontSize="1rem">{status.queue_size}</Typography>
                      <Typography variant="caption" color="text.secondary">Queue</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                      <Icon name="CheckCircle" size={14} sx={{ color: 'text.secondary', mb: 0.25 }} />
                      <Typography variant="h6" fontSize="1rem">{status.visited}</Typography>
                      <Typography variant="caption" color="text.secondary">Visited</Typography>
                    </Paper>
                  </Grid>
                  {status.downloads?.successful > 0 && (
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Icon name="Download" size={14} />
                          <Typography variant="caption">Files</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">{status.downloads.successful}</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {/* Compact ETA */}
                {status.running && !status.is_paused && (scrapingRate > 0 || eta) && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'info.50' }}>
                    {scrapingRate > 0 && (
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: eta ? 0.5 : 0 }}>
                        <Icon name="Timeline" size={14} />
                        {scrapingRate.toFixed(2)} p/s
                      </Typography>
                    )}
                    {eta && (
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Icon name="AccessTime" size={14} />
                        ETA: {formatETA(eta)}
                      </Typography>
                    )}
                  </Paper>
                )}

                {/* Compact File Type Badges */}
                {status.file_types && Object.keys(status.file_types).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.entries(status.file_types).slice(0, 6).map(([ext, count]) => (
                      <Chip
                        key={ext}
                        label={`${ext} (${count})`}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    ))}
                    {Object.keys(status.file_types).length > 6 && (
                      <Chip
                        label={`+${Object.keys(status.file_types).length - 6}`}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    )}
                  </Box>
                )}

                {/* Compact Controls */}
                {status.running && !isHistoryView && (
                  <Stack spacing={0.75} sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                    <Grid container spacing={0.75}>
                      <Grid item xs={6}>
                        {!status.is_paused ? (
                          <Button variant="warning" onClick={handlePause} fullWidth size="small">
                            <Icon name="Pause" size={14} />
                          </Button>
                        ) : (
                          <Button variant="success" onClick={handleResume} fullWidth size="small">
                            <Icon name="PlayArrow" size={14} />
                          </Button>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Button variant="danger" onClick={handleStop} fullWidth size="small">
                          <Icon name="Close" size={14} />
                        </Button>
                      </Grid>
                    </Grid>
                    <Button
                      variant="primary"
                      onClick={handleExport}
                      disabled={isExporting || allPages.length === 0}
                      loading={isExporting}
                      fullWidth
                      size="small"
                    >
                      <Icon name="Download" size={14} /> Export
                    </Button>
                  </Stack>
                )}

                {/* Export when stopped */}
                {!status?.running && !isHistoryView && allPages.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={isExporting}
                    loading={isExporting}
                    fullWidth
                    size="small"
                  >
                    <Icon name="Download" size={14} /> Export
                  </Button>
                )}
              </Stack>
            )}

            {/* Compact Navigation Tabs */}
            <Box sx={{ mt: 2 }}>
              <List disablePadding>
                <ListItemButton
                  selected={activeView === 'pages'}
                  onClick={() => setActiveView('pages')}
                  sx={{ borderRadius: 1, mb: 0.5, py: 0.75 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Icon name="Description" size={16} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Pages" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                  <Chip label={allPages.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                </ListItemButton>
                <ListItemButton
                  selected={activeView === 'files'}
                  onClick={() => setActiveView('files')}
                  sx={{ borderRadius: 1, py: 0.75 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Icon name="Inventory" size={16} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Files" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                  <Chip label={allFiles.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                </ListItemButton>
              </List>
            </Box>
          </Box>
        </Paper>

        {/* Main Content Area */}
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            bgcolor: 'background.default'
          }}
        >
          {/* Compact Header */}
          <Paper 
            elevation={0}
            sx={{ 
              position: 'sticky',
              top: 0,
              zIndex: 10,
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Breadcrumb 
              items={[
                { label: 'Progress', icon: 'Timeline', path: '/progress' },
                { label: activeView === 'pages' ? 'Pages' : 'Files' }
              ]}
            />
            
            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                onClose={() => setError(null)}
                sx={{ py: 0, fontSize: '0.75rem' }}
              >
                {error}
              </Alert>
            )}
          </Paper>

          <Container maxWidth="xl" sx={{ py: 2 }}>
            {/* Main List Views */}
            <Box>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder={activeView === 'pages' ? "Search pages by URL or title..." : "Search files..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon name="Search" size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Button
                        variant="icon"
                        iconOnly
                        size="small"
                        onClick={() => setSearchQuery('')}
                      >
                        <Icon name="Close" size={16} />
                      </Button>
                    </InputAdornment>
                  )
                }}
              />

              {/* Search Results Info */}
              {searchQuery && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Found {filteredPages.length} of {allPages.length} pages
                </Alert>
              )}

              {/* Pages View */}
              {activeView === 'pages' && (
                <Stack spacing={3}>
                  {filteredPages.length > 0 ? (
                    filteredPages.slice(0, visiblePageCount).map((page) => {
                      const pageFiles = getPageFiles(page.url)
                      const metadata = metadataContent[page.id]
                      const isExpanded = expandedMetadata[page.id]

                      return (
                        <Card key={page.id} variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                              <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                                <Typography 
                                  variant="h6" 
                                  component="a"
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    '&:hover': { color: 'primary.main' }
                                  }}
                                >
                                  {page.title || 'No Title'}
                                  <Icon name="OpenInNew" size={14} />
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontFamily="monospace" noWrap>
                                  {formatUrl(page.url)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                  <Chip label={`Depth ${page.depth}`} size="small" />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Icon name="AccessTime" size={12} /> {page.scraped_at}
                                  </Typography>
                                </Box>
                              </Box>
                              <Stack spacing={1}>
                                <Button
                                  variant="primary"
                                  onClick={() => handleViewDetails(page)}
                                  size="small"
                                >
                                  <Icon name="Visibility" size="small" /> View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => toggleMetadataExpand(page.id)}
                                  size="small"
                                >
                                  <Icon name={isExpanded ? 'ExpandLess' : 'ExpandMore'} size="small" /> {isExpanded ? 'Less' : 'More'}
                                </Button>
                              </Stack>
                            </Box>

                            {/* Quick Stats */}
                            {metadata && (
                              <Grid container spacing={2} sx={{ py: 2, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
                                <Grid item xs={3}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Icon name="Image" size={14} /> {metadata.media_count || 0} Images
                                  </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Icon name="Link" size={14} /> {metadata.internal_links_count || 0} Internal
                                  </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Icon name="OpenInNew" size={14} /> {metadata.external_links_count || 0} External
                                  </Typography>
                                </Grid>
                                {pageFiles.length > 0 && (
                                  <Grid item xs={3}>
                                    <Typography variant="caption" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Icon name="Download" size={14} /> {pageFiles.length} Files
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            )}

                            {/* Expanded Content */}
                            <Collapse in={isExpanded}>
                              {metadata && (
                                <Box sx={{ mt: 2 }}>
                                  {metadata.description && metadata.description !== 'No description' && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                        DESCRIPTION
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {metadata.description}
                                      </Typography>
                                    </Box>
                                  )}

                                  {pageFiles.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                                        DOWNLOADED FILES
                                      </Typography>
                                      <Stack spacing={1} sx={{ mt: 1 }}>
                                        {pageFiles.map((file, idx) => (
                                          <Paper key={idx} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Icon name="InsertDriveFile" size={16} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              <Typography variant="caption" noWrap>{file.file_name}</Typography>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                {file.file_extension} • {api.formatBytes(file.file_size_bytes)}
                                              </Typography>
                                            </Box>
                                            <Chip
                                              icon={<Icon name={file.download_status === 'success' ? 'CheckCircle' : 'Cancel'} size={10} />}
                                              label={file.download_status}
                                              color={file.download_status === 'success' ? 'success' : 'error'}
                                              size="small"
                                            />
                                          </Paper>
                                        ))}
                                      </Stack>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Collapse>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <Paper sx={{ p: 8, textAlign: 'center' }}>
                      <Typography color="text.secondary">No pages found</Typography>
                    </Paper>
                  )}

                  {/* Load More Button */}
                  {filteredPages.length > visiblePageCount && (
                    <Button
                      variant="outline"
                      onClick={() => setVisiblePageCount(prev => prev + 20)}
                      fullWidth
                    >
                      Load More ({filteredPages.length - visiblePageCount} remaining)
                    </Button>
                  )}
                </Stack>
              )}

              {/* Files View */}
              {activeView === 'files' && (
                <Stack spacing={3}>
                  {Object.entries(groupedFiles).map(([fileType, files]) => (
                    <Card key={fileType} variant="outlined">
                      <CardContent>
                        <Box 
                          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => toggleFileTypeCollapse(fileType)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip label={fileType} color="primary" />
                            <Typography variant="body2" color="text.secondary">
                              {files.length} files
                            </Typography>
                          </Box>
                          <Button variant="icon" iconOnly size="small">
                            <Icon name={collapsedFileTypes[fileType] ? 'ExpandMore' : 'ExpandLess'} size={18} />
                          </Button>
                        </Box>

                        <Collapse in={!collapsedFileTypes[fileType]}>
                          <Stack spacing={1} sx={{ mt: 2 }}>
                            {files.map((file, idx) => (
                              <Paper key={idx} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Icon name="InsertDriveFile" size={16} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" noWrap>{file.file_name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {api.formatBytes(file.file_size_bytes)}
                                  </Typography>
                                </Box>
                                <Chip
                                  icon={<Icon name={file.download_status === 'success' ? 'CheckCircle' : 'Cancel'} size={10} />}
                                  label={file.download_status}
                                  color={file.download_status === 'success' ? 'success' : 'error'}
                                  size="small"
                                />
                              </Paper>
                            ))}
                          </Stack>
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))}

                  {Object.keys(groupedFiles).length === 0 && (
                    <Paper sx={{ p: 8, textAlign: 'center' }}>
                      <Typography color="text.secondary">No files found</Typography>
                    </Paper>
                  )}
                </Stack>
              )}
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

export default ScrapingProgress