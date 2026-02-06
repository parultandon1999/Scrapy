import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import Button from '../components/mui/buttons/Button'
import Icon from '../components/mui/icons/Icon'
import * as api from '../services/api'

// --- Internal Reusable Components (Replacements for MUI) ---

const Chip = ({ label, color = 'default', icon, size = 'medium', className = '' }) => {
  const colorClasses = {
    default: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  }

  const sizeClasses = size === 'small' ? 'text-[10px] px-1.5 py-0.5 h-5' : 'text-xs px-2.5 py-1 h-7'

  return (
    <span className={`inline-flex items-center justify-center rounded-full border font-medium ${colorClasses[color]} ${sizeClasses} ${className}`}>
      {icon && <span className="mr-1 flex items-center">{icon}</span>}
      {label}
    </span>
  )
}

const LinearProgress = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden ${className}`}>
    <div 
      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out" 
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    ></div>
  </div>
)

const Alert = ({ severity = 'info', children, onClose, className = '' }) => {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
  }

  return (
    <div className={`p-3 rounded-lg border flex items-center justify-between ${styles[severity]} ${className}`}>
      <div className="text-sm">{children}</div>
      {onClose && (
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <Icon name="Close" size={16} />
        </button>
      )}
    </div>
  )
}

// --- Main Component ---

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="home" />

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Compact Sidebar */}
        <aside className="w-full md:w-[260px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto flex flex-col shrink-0">
          <div className="p-4">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Icon name="Timeline" size={18} />
              Progress
            </h3>

            {status && (
              <div className="space-y-4">
                {/* Compact Status Badge */}
                <Chip
                  icon={getStatusIconName() ? <Icon name={getStatusIconName()} size={12} /> : undefined}
                  label={getStatusText()}
                  color={getStatusColor()}
                  size="small"
                  className="w-fit"
                />

                {/* Compact Progress Bar */}
                {status.max_pages > 0 && (
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {status.pages_scraped} / {status.max_pages}
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {Math.round((status.pages_scraped / status.max_pages) * 100)}%
                      </span>
                    </div>
                    <LinearProgress 
                      value={(status.pages_scraped / status.max_pages) * 100}
                    />
                  </div>
                )}

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 text-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-center mb-1 text-gray-400">
                      <Icon name="Layers" size={14} />
                    </div>
                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{status.queue_size}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Queue</div>
                  </div>
                  <div className="p-2 text-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-center mb-1 text-gray-400">
                      <Icon name="CheckCircle" size={14} />
                    </div>
                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{status.visited}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Visited</div>
                  </div>
                  {status.downloads?.successful > 0 && (
                    <div className="col-span-2 p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Icon name="Download" size={14} />
                        Files
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {status.downloads.successful}
                      </span>
                    </div>
                  )}
                </div>

                {/* Compact ETA */}
                {status.running && !status.is_paused && (scrapingRate > 0 || eta) && (
                  <div className="p-3 rounded border border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/10">
                    {scrapingRate > 0 && (
                      <div className={`flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 ${eta ? 'mb-1' : ''}`}>
                        <Icon name="Timeline" size={14} />
                        {scrapingRate.toFixed(2)} p/s
                      </div>
                    )}
                    {eta && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300">
                        <Icon name="AccessTime" size={14} />
                        ETA: {formatETA(eta)}
                      </div>
                    )}
                  </div>
                )}

                {/* Compact File Type Badges */}
                {status.file_types && Object.keys(status.file_types).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(status.file_types).slice(0, 6).map(([ext, count]) => (
                      <Chip
                        key={ext}
                        label={`${ext} (${count})`}
                        size="small"
                        color="default"
                      />
                    ))}
                    {Object.keys(status.file_types).length > 6 && (
                      <Chip
                        label={`+${Object.keys(status.file_types).length - 6}`}
                        size="small"
                        color="default"
                      />
                    )}
                  </div>
                )}

                {/* Compact Controls */}
                {status.running && !isHistoryView && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {!status.is_paused ? (
                        <Button variant="warning" onClick={handlePause} fullWidth size="small">
                          <Icon name="Pause" size={14} />
                        </Button>
                      ) : (
                        <Button variant="success" onClick={handleResume} fullWidth size="small">
                          <Icon name="PlayArrow" size={14} />
                        </Button>
                      )}
                      <Button variant="danger" onClick={handleStop} fullWidth size="small">
                        <Icon name="Close" size={14} />
                      </Button>
                    </div>
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
                  </div>
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
              </div>
            )}

            {/* Compact Navigation Tabs */}
            <div className="mt-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveView('pages')}
                  className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === 'pages' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Description" size={16} />
                    <span>Pages</span>
                  </div>
                  <Chip label={allPages.length} size="small" color={activeView === 'pages' ? 'primary' : 'default'} />
                </button>
                
                <button
                  onClick={() => setActiveView('files')}
                  className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === 'files' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Inventory" size={16} />
                    <span>Files</span>
                  </div>
                  <Chip label={allFiles.length} size="small" color={activeView === 'files' ? 'primary' : 'default'} />
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {/* Compact Header */}
          <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
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
                className="py-1 text-xs"
              >
                {error}
              </Alert>
            )}
          </div>

          <div className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Main List Views */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icon name="Search" size={18} />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder={activeView === 'pages' ? "Search pages by URL or title..." : "Search files..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Icon name="Close" size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Search Results Info */}
              {searchQuery && (
                <Alert severity="info" className="mb-4">
                  Found {filteredPages.length} of {allPages.length} pages
                </Alert>
              )}

              {/* Pages View */}
              {activeView === 'pages' && (
                <div className="space-y-4">
                  {filteredPages.length > 0 ? (
                    filteredPages.slice(0, visiblePageCount).map((page) => {
                      const pageFiles = getPageFiles(page.url)
                      const metadata = metadataContent[page.id]
                      const isExpanded = expandedMetadata[page.id]

                      return (
                        <div key={page.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-shadow hover:shadow-md">
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <a
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  <span className="truncate">{page.title || 'No Title'}</span>
                                  <Icon name="OpenInNew" size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                </a>
                                <div className="text-sm font-mono text-gray-500 truncate mt-1">
                                  {formatUrl(page.url)}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <Chip label={`Depth ${page.depth}`} size="small" />
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Icon name="AccessTime" size={12} /> {page.scraped_at}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                                <Button
                                  variant="primary"
                                  onClick={() => handleViewDetails(page)}
                                  size="small"
                                >
                                  <Icon name="Visibility" size={14} className="mr-1.5" /> View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => toggleMetadataExpand(page.id)}
                                  size="small"
                                >
                                  <Icon name={isExpanded ? 'ExpandLess' : 'ExpandMore'} size={14} className="mr-1.5" /> 
                                  {isExpanded ? 'Less' : 'More'}
                                </Button>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            {metadata && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-b border-gray-100 dark:border-gray-700 mt-3 mb-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  <Icon name="Image" size={14} /> {metadata.media_count || 0} Images
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  <Icon name="Link" size={14} /> {metadata.internal_links_count || 0} Internal
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  <Icon name="OpenInNew" size={14} /> {metadata.external_links_count || 0} External
                                </div>
                                {pageFiles.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    <Icon name="Download" size={14} /> {pageFiles.length} Files
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Expanded Content */}
                            {isExpanded && metadata && (
                              <div className="mt-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {metadata.description && metadata.description !== 'No description' && (
                                  <div className="mb-4">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                      Description
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {metadata.description}
                                    </p>
                                  </div>
                                )}

                                {pageFiles.length > 0 && (
                                  <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                      Downloaded Files
                                    </div>
                                    <div className="space-y-2">
                                      {pageFiles.map((file, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-3">
                                          <div className="text-gray-500">
                                            <Icon name="InsertDriveFile" size={18} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                              {file.file_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {file.file_extension} • {api.formatBytes(file.file_size_bytes)}
                                            </div>
                                          </div>
                                          <Chip
                                            icon={<Icon name={file.download_status === 'success' ? 'CheckCircle' : 'Cancel'} size={10} />}
                                            label={file.download_status}
                                            color={file.download_status === 'success' ? 'success' : 'error'}
                                            size="small"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                      <div className="text-gray-400 mb-2">
                        <Icon name="SearchOff" size={32} />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">No pages found matching your search.</p>
                    </div>
                  )}

                  {/* Load More Button */}
                  {filteredPages.length > visiblePageCount && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setVisiblePageCount(prev => prev + 20)}
                        fullWidth
                      >
                        Load More ({filteredPages.length - visiblePageCount} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Files View */}
              {activeView === 'files' && (
                <div className="space-y-4">
                  {Object.entries(groupedFiles).map(([fileType, files]) => (
                    <div key={fileType} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div 
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => toggleFileTypeCollapse(fileType)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-sm font-medium dark:bg-blue-900/50 dark:text-blue-300 uppercase">
                            {fileType}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {files.length} files
                          </span>
                        </div>
                        <div className="text-gray-400">
                          <Icon name={collapsedFileTypes[fileType] ? 'ExpandMore' : 'ExpandLess'} size={20} />
                        </div>
                      </div>

                      {!collapsedFileTypes[fileType] && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2 bg-gray-50/50 dark:bg-gray-900/30">
                          {files.map((file, idx) => (
                            <div key={idx} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-3">
                              <div className="text-gray-400">
                                <Icon name="InsertDriveFile" size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {file.file_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {api.formatBytes(file.file_size_bytes)}
                                </div>
                              </div>
                              <Chip
                                icon={<Icon name={file.download_status === 'success' ? 'CheckCircle' : 'Cancel'} size={10} />}
                                label={file.download_status}
                                color={file.download_status === 'success' ? 'success' : 'error'}
                                size="small"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {Object.keys(groupedFiles).length === 0 && (
                    <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                      <div className="text-gray-400 mb-2">
                        <Icon name="Inventory2" size={32} />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">No files found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ScrapingProgress