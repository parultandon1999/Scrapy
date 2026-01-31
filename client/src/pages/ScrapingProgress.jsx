import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Activity, Globe, FileText, Download, Layers, Clock,
  ExternalLink, File, CheckCircle, XCircle, ChevronDown,
  ChevronUp, StopCircle, Play, Package, Link2, Image,
  Hash, Calendar, Shield, X, Eye, ArrowLeft
} from 'lucide-react'
import * as api from '../services/api'
import '../styles/ScrapingProgress.css'

function ScrapingProgress({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { sessionId } = useParams()
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
  const [detailedViewPage, setDetailedViewPage] = useState(null)
  const [detailedViewData, setDetailedViewData] = useState(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [pendingUpdates, setPendingUpdates] = useState({ pages: [], files: [] })
  const updateTimeoutRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const [visiblePageCount, setVisiblePageCount] = useState(20)
  const [visibleFileCount, setVisibleFileCount] = useState(20)
  const [isExporting, setIsExporting] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [eta, setEta] = useState(null)
  const [scrapingRate, setScrapingRate] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedFileTypes, setCollapsedFileTypes] = useState({})
  const [speedHistory, setSpeedHistory] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const detailedPageRef = useRef(null)
  const tabsRef = useRef(null)

  useEffect(() => {
    // Request notification permission
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [sessionId, location.state])

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
    // Increased to 3 seconds to reduce update frequency
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

  // Debounced update function to batch UI updates
  const scheduleUpdate = (newPages, newFiles) => {
    // Add to pending updates
    setPendingUpdates(prev => ({
      pages: [...prev.pages, ...newPages],
      files: [...prev.files, ...newFiles]
    }))

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Schedule batched update after 2 seconds or if enough items accumulated
    const timeSinceLastUpdate = Date.now() - lastUpdateRef.current
    const shouldUpdateImmediately = timeSinceLastUpdate > 5000 || 
                                    (newPages.length + newFiles.length) > 50

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
      
      // Initialize start time when scraping begins
      if (data.running && !startTime && data.pages_scraped > 0) {
        setStartTime(Date.now())
      }
      
      // Calculate ETA and scraping rate
      if (data.running && startTime && data.pages_scraped > 0) {
        const elapsedSeconds = (Date.now() - startTime) / 1000
        const rate = data.pages_scraped / elapsedSeconds
        setScrapingRate(rate)
        
        // Track speed history for graph (keep last 20 data points)
        setSpeedHistory(prev => {
          const newHistory = [...prev, { time: Date.now(), rate }]
          return newHistory.slice(-20)
        })
        
        const remaining = data.max_pages - data.pages_scraped
        if (rate > 0 && remaining > 0) {
          const etaSeconds = remaining / rate
          setEta(etaSeconds)
        } else {
          setEta(null)
        }
      } else if (!data.running) {
        // Check if scraping just completed
        const wasRunning = status?.running
        if (wasRunning && !data.running && data.pages_scraped > 0) {
          // Send notification
          if (notificationsEnabled) {
            new Notification('Scraping Complete! 🎉', {
              body: `Successfully scraped ${data.pages_scraped} pages`,
              icon: '/favicon.ico',
              tag: 'scraping-complete'
            })
          }
        }
        
        setStartTime(null)
        setEta(null)
        setScrapingRate(0)
        
        // STOP POLLING when scraping is not running
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
        // Apply any pending updates immediately when scraping stops
        applyPendingUpdates()
      }
      
      // Use debounced updates instead of immediate updates
      const newPages = data.recent_pages || []
      const newFiles = data.recent_files || []
      
      if (newPages.length > 0 || newFiles.length > 0) {
        scheduleUpdate(newPages, newFiles)
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
      // Stop polling on error
      stopPolling()
    }
  }
      
      if (!data.running && data.pages_scraped === 0 && !isHistoryView) {
        navigate('/')
      }
    } catch (err) {
      console.error('Error fetching status:', err)
    }
  }

  const formatETA = (seconds) => {
    if (!seconds || seconds <= 0) return 'Calculating...'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const handleStop = async () => {
    try {
      await api.stopScraper()
      fetchStatus()
    } catch (err) {
      setError('Failed to stop scraper')
    }
  }

  const handlePause = async () => {
    try {
      await api.pauseScraper()
      fetchStatus()
    } catch (err) {
      setError('Failed to pause scraper')
    }
  }

  const handleResume = async () => {
    try {
      await api.resumeScraper()
      fetchStatus()
    } catch (err) {
      setError('Failed to resume scraper')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await api.exportData()
      
      // Create JSON blob
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `scraper-export-${timestamp}.json`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
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

  const getPageFiles = (pageUrl) => {
    return allFiles.filter(file => file.page_url === pageUrl)
  }

  // Filter pages based on search query
  const filteredPages = allPages.filter(page => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      page.url?.toLowerCase().includes(query) ||
      page.title?.toLowerCase().includes(query)
    )
  })

  // Group files by extension
  const groupedFiles = allFiles.reduce((acc, file) => {
    const ext = file.file_extension || 'unknown'
    if (!acc[ext]) {
      acc[ext] = []
    }
    acc[ext].push(file)
    return acc
  }, {})

  const toggleFileTypeCollapse = (fileType) => {
    setCollapsedFileTypes(prev => ({
      ...prev,
      [fileType]: !prev[fileType]
    }))
  }

  const handleViewDetails = async (page) => {
    setDetailedViewPage(page)
    setDetailedViewData(null)
    
    try {
      const data = await api.getPageDetails(page.id)
      setDetailedViewData(data)
    } catch (err) {
      console.error('Failed to fetch detailed page data:', err)
      setError('Failed to load detailed page data')
      setDetailedViewData(metadataContent[page.id] || null)
    }
  }

  const closeDetailedView = () => {
    setDetailedViewPage(null)
    setDetailedViewData(null)
    setActiveTab('overview')
  }

  const openImageViewer = (img) => {
    setCurrentImage(img)
    setImageViewerOpen(true)
  }

  const closeImageViewer = () => {
    setImageViewerOpen(false)
    setCurrentImage(null)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && imageViewerOpen) {
        closeImageViewer()
      }
    }

    if (imageViewerOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [imageViewerOpen])

  // Handle sticky tabs shadow on scroll
  useEffect(() => {
    const detailedPage = detailedPageRef.current
    const tabs = tabsRef.current
    
    if (!detailedPage || !tabs) return

    const handleScroll = () => {
      const scrollTop = detailedPage.scrollTop
      
      // Add shadow to tabs when scrolled
      if (scrollTop > 100) {
        tabs.classList.add('scrolled')
      } else {
        tabs.classList.remove('scrolled')
      }
      
      // Add shadow to header when scrolled
      const header = detailedPage.querySelector('.detailed-page-header')
      if (header) {
        if (scrollTop > 10) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }
    }

    detailedPage.addEventListener('scroll', handleScroll)
    return () => {
      detailedPage.removeEventListener('scroll', handleScroll)
    }
  }, [detailedViewPage])

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="home" />
      <div className="database-page">
      {/* Sidebar Navigation */}
      <aside className="db-sidebar">
        <h2><Activity size={20} /> Progress</h2>
        
        {/* Status Card */}
        {status && (
          <div className="progress-status-card">
            <div className="status-indicator">
              {status.running ? (
                <div className="status-running">
                  <Play size={14} />
                  <span>{status.is_paused ? 'Paused' : 'Scraping...'}</span>
                </div>
              ) : status.pages_scraped > 0 ? (
                <div className={status.was_stopped ? 'status-stopped' : 'status-complete'}>
                  {status.was_stopped ? <StopCircle size={14} /> : <CheckCircle size={14} />}
                  <span>{status.was_stopped ? 'Stopped' : 'Complete'}</span>
                </div>
              ) : null}
            </div>

            {/* Progress Bar */}
            {status.max_pages > 0 && (
              <div className="progress-bar-container">
                <div className="progress-bar-wrapper">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${(status.pages_scraped / status.max_pages) * 100}%` }}
                  />
                </div>
                <div className="progress-bar-text">
                  {Math.round((status.pages_scraped / status.max_pages) * 100)}% Complete
                </div>
              </div>
            )}

            <div className="status-stats">
              <div className="status-stat">
                <FileText size={14} />
                <span>{status.pages_scraped} / {status.max_pages}</span>
              </div>
              <div className="status-stat">
                <Layers size={14} />
                <span>{status.queue_size} queued</span>
              </div>
              <div className="status-stat">
                <CheckCircle size={14} />
                <span>{status.visited} visited</span>
              </div>
              {status.downloads?.successful > 0 && (
                <div className="status-stat">
                  <Download size={14} />
                  <span>{status.downloads.successful} files</span>
                </div>
              )}
            </div>

            {/* ETA and Rate Display */}
            {status.running && !status.is_paused && (
              <div className="eta-container">
                {scrapingRate > 0 && (
                  <div className="eta-stat">
                    <Activity size={14} />
                    <span>{scrapingRate.toFixed(2)} pages/sec</span>
                  </div>
                )}
                {eta && (
                  <div className="eta-stat">
                    <Clock size={14} />
                    <span>ETA: {formatETA(eta)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Speed Graph */}
            {status.running && speedHistory.length > 1 && (
              <div className="speed-graph-container">
                <div className="speed-graph-header">
                  <Activity size={14} />
                  <span>Scraping Speed</span>
                </div>
                <svg className="speed-graph" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="speedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const maxRate = Math.max(...speedHistory.map(h => h.rate), 0.1)
                    const points = speedHistory.map((h, i) => {
                      const x = (i / (speedHistory.length - 1)) * 300
                      const y = 80 - ((h.rate / maxRate) * 70)
                      return `${x},${y}`
                    }).join(' ')
                    const areaPoints = `0,80 ${points} 300,80`
                    
                    return (
                      <>
                        <polyline
                          points={areaPoints}
                          fill="url(#speedGradient)"
                          stroke="none"
                        />
                        <polyline
                          points={points}
                          fill="none"
                          stroke="#1a73e8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )
                  })()}
                </svg>
              </div>
            )}

            {status.file_types && Object.keys(status.file_types).length > 0 && (
              <div className="status-file-types">
                {Object.entries(status.file_types).map(([ext, count]) => (
                  <span key={ext} className="file-type-badge-small">
                    {ext} ({count})
                  </span>
                ))}
              </div>
            )}

            {status.running && !isHistoryView && (
              <>
                <div className="scraper-controls">
                  {!status.is_paused ? (
                    <button onClick={handlePause} className="pause-btn-sidebar">
                      <StopCircle size={16} />
                      Pause
                    </button>
                  ) : (
                    <button onClick={handleResume} className="resume-btn-sidebar">
                      <Play size={16} />
                      Resume
                    </button>
                  )}
                  <button onClick={handleStop} className="stop-btn-sidebar">
                    <X size={16} />
                    Stop
                  </button>
                </div>
                
                {/* Export Button - Available during scraping */}
                <button 
                  onClick={handleExport} 
                  className="export-btn-sidebar"
                  disabled={isExporting || allPages.length === 0}
                >
                  <Download size={16} />
                  {isExporting ? 'Exporting...' : 'Export Progress'}
                </button>
              </>
            )}

            {/* Export Button - Available when not running */}
            {!status?.running && !isHistoryView && allPages.length > 0 && (
              <button 
                onClick={handleExport} 
                className="export-btn-sidebar"
                disabled={isExporting}
              >
                <Download size={16} />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            )}
          </div>
        )}

        <nav className="db-nav">
          <button 
            className={`db-nav-item ${activeView === 'pages' ? 'active' : ''}`}
            onClick={() => setActiveView('pages')}
          >
            <FileText size={18} />
            Pages ({allPages.length})
          </button>
          <button 
            className={`db-nav-item ${activeView === 'files' ? 'active' : ''}`}
            onClick={() => setActiveView('files')}
          >
            <Package size={18} />
            Files ({allFiles.length})
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="db-main">
        {error && (
          <div className="db-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}

        {/* Image Viewer Modal */}
        {imageViewerOpen && currentImage && (
          <div className="image-viewer-modal" onClick={closeImageViewer}>
            <button className="image-viewer-close" onClick={closeImageViewer}>
              <X size={32} />
            </button>
            <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
              <img 
                /* REFACTORED: Use helper functions for dynamic image URLs */
                src={currentImage.src.includes('/api/screenshot/') 
                  ? currentImage.src 
                  : api.getProxyImageUrl(currentImage.src)
                }
                alt={currentImage.alt || 'Image'}
              />
              {currentImage.alt && (
                <div className="image-viewer-caption">
                  {currentImage.alt}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed View - Full Page */}
        {detailedViewPage ? (
          <div className="detailed-full-page" ref={detailedPageRef}>
            <div className="detailed-page-header">
              <button className="back-btn-full" onClick={closeDetailedView}>
                <ArrowLeft size={20} />
                Back to Pages
              </button>
              <h1>Page Details</h1>
            </div>

            {/* Tabs Navigation */}
            <div className="detail-tabs-container" ref={tabsRef}>
              <div className="detail-tabs">
                <button 
                  className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <FileText size={16} />
                  Overview
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'screenshot' ? 'active' : ''}`}
                  onClick={() => setActiveTab('screenshot')}
                >
                  <Eye size={16} />
                  Screenshot
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'headers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('headers')}
                >
                  <Hash size={16} />
                  Headers
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'links' ? 'active' : ''}`}
                  onClick={() => setActiveTab('links')}
                >
                  <Link2 size={16} />
                  Links
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'images' ? 'active' : ''}`}
                  onClick={() => setActiveTab('images')}
                >
                  <Image size={16} />
                  Images
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  <Download size={16} />
                  Downloaded
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'structure' ? 'active' : ''}`}
                  onClick={() => setActiveTab('structure')}
                >
                  <Layers size={16} />
                  HTML Structure
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'content' ? 'active' : ''}`}
                  onClick={() => setActiveTab('content')}
                >
                  <FileText size={16} />
                  Content
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'fingerprint' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fingerprint')}
                >
                  <Shield size={16} />
                  Fingerprint
                </button>
              </div>
            </div>

              <div className="detailed-page-content">
              {!detailedViewData ? (
                <div className="detail-loading">
                  <div className="spinner"></div>
                  <p>Loading page details...</p>
                </div>
              ) : (
                <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <>
                    {/* Page Title & URL */}
                    <div className="detail-section">
                      <h3>{detailedViewPage.title || 'No title'}</h3>
                      <a href={detailedViewPage.url} target="_blank" rel="noopener noreferrer" className="detail-url">
                        <ExternalLink size={16} />
                        {detailedViewPage.url}
                      </a>
                    </div>

                    {/* Metadata Grid */}
                    <div className="detail-section">
                      <h4>Page Information</h4>
                      <div className="detail-metadata-grid">
                        <div className="detail-meta-item">
                          <span className="detail-meta-label">Depth Level</span>
                          <span className="detail-meta-value">
                            <Layers size={14} />
                            Level {detailedViewPage.depth}
                          </span>
                        </div>
                        <div className="detail-meta-item">
                          <span className="detail-meta-label">Scraped At</span>
                          <span className="detail-meta-value">
                            <Clock size={14} />
                            {detailedViewPage.scraped_at}
                          </span>
                        </div>
                        <div className="detail-meta-item">
                          <span className="detail-meta-label">Proxy</span>
                          <span className="detail-meta-value">
                            <Globe size={14} />
                            {detailedViewData.proxy_used || 'Direct'}
                          </span>
                        </div>
                        <div className="detail-meta-item">
                          <span className="detail-meta-label">Authenticated</span>
                          <span className="detail-meta-value">
                            <Shield size={14} />
                            {detailedViewData.authenticated ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {detailedViewData?.description && detailedViewData.description !== 'No description' && (
                      <div className="detail-section">
                        <h4>Description</h4>
                        <p className="detail-description">{detailedViewData.description}</p>
                      </div>
                    )}

                    {/* Statistics */}
                    <div className="detail-section">
                      <h4>Statistics</h4>
                      <div className="detail-stats-grid">
                        <div className="detail-stat-card">
                          <Image size={20} />
                          <div>
                            <div className="detail-stat-value">{detailedViewData.media?.length || 0}</div>
                            <div className="detail-stat-label">Images</div>
                          </div>
                        </div>
                        <div className="detail-stat-card">
                          <Link2 size={20} />
                          <div>
                            <div className="detail-stat-value">
                              {detailedViewData.links?.filter(l => l.link_type === 'internal').length || 0}
                            </div>
                            <div className="detail-stat-label">Internal Links</div>
                          </div>
                        </div>
                        <div className="detail-stat-card">
                          <ExternalLink size={20} />
                          <div>
                            <div className="detail-stat-value">
                              {detailedViewData.links?.filter(l => l.link_type === 'external').length || 0}
                            </div>
                            <div className="detail-stat-label">External Links</div>
                          </div>
                        </div>
                        <div className="detail-stat-card">
                          <Download size={20} />
                          <div>
                            <div className="detail-stat-value">{detailedViewData.file_assets?.length || 0}</div>
                            <div className="detail-stat-label">Files</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Screenshot Tab */}
                {activeTab === 'screenshot' && (
                  <div className="detail-section">
                    <h4>Page Screenshot</h4>
                    <div className="detail-screenshot-container">
                      <img 
                        /* REFACTORED: Use helper function */
                        src={api.getScreenshotUrl(detailedViewPage.id)}
                        alt="Page Screenshot"
                        className="detail-screenshot"
                        onClick={() => openImageViewer({
                          /* REFACTORED: Use helper function */
                          src: api.getScreenshotUrl(detailedViewPage.id),
                          alt: `Screenshot of ${detailedViewPage.title || detailedViewPage.url}`
                        })}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="detail-screenshot-error" style={{display: 'none'}}>
                        <FileText size={48} />
                        <span>Screenshot not available</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Headers Tab */}
                {activeTab === 'headers' && (
                  <div className="detail-section">
                    <h4>Headers ({detailedViewData?.headers?.length || 0})</h4>
                    {detailedViewData?.headers && detailedViewData.headers.length > 0 ? (
                      <div className="detail-headers-list">
                        {detailedViewData.headers.map((header, idx) => (
                          <div key={idx} className="detail-header-item">
                            <span className="detail-header-tag">{header.header_type}</span>
                            <span className="detail-header-text">{header.header_text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data-message">
                        <Hash size={48} />
                        <p>No headers found on this page</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Links Tab */}
                {activeTab === 'links' && (
                  <div className="detail-section">
                    <h4>Links ({detailedViewData?.links?.length || 0})</h4>
                    {detailedViewData?.links && detailedViewData.links.length > 0 ? (
                      <div className="detail-links-container">
                        <div className="detail-links-list">
                          {detailedViewData.links.map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="detail-link-item"
                            >
                              {link.link_type === 'internal' ? <Link2 size={14} /> : <ExternalLink size={14} />}
                              {link.url}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="no-data-message">
                        <Link2 size={48} />
                        <p>No links found on this page</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === 'images' && (
                  <div className="detail-section">
                    <h4>Images ({detailedViewData?.media?.length || 0})</h4>
                    {detailedViewData?.media && detailedViewData.media.length > 0 ? (
                      <div className="detail-media-grid">
                        {detailedViewData.media.map((img, idx) => (
                          <div key={idx} className="detail-media-item">
                            <div 
                              className="detail-media-image-wrapper"
                              onClick={() => openImageViewer(img)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img 
                                /* REFACTORED: Use helper function */
                                src={api.getProxyImageUrl(img.src)}
                                alt={img.alt || 'No alt text'} 
                                loading="lazy"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="detail-media-error" style={{display: 'none'}}>
                                <File size={24} />
                                <span>Image failed to load</span>
                                <a 
                                  href={img.src} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="detail-media-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Original
                                </a>
                              </div>
                            </div>
                            <span className="detail-media-alt" title={img.alt || 'No alt text'}>
                              {img.alt || 'No alt text'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data-message">
                        <Image size={48} />
                        <p>No images found on this page</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Downloaded Files Tab */}
                {activeTab === 'files' && (
                  <div className="detail-section">
                    <h4>Downloaded Files ({detailedViewData?.file_assets?.length || 0})</h4>
                    {detailedViewData?.file_assets && detailedViewData.file_assets.length > 0 ? (
                      <div className="detail-files-list">
                        {detailedViewData.file_assets.map((file, idx) => (
                          <div key={idx} className="detail-file-item">
                            <File size={16} />
                            <div className="detail-file-info">
                              <span className="detail-file-name">{file.file_name}</span>
                              <span className="detail-file-meta">
                                {file.file_extension} • {api.formatBytes(file.file_size_bytes)}
                              </span>
                            </div>
                            {file.download_status === 'success' ? (
                              <CheckCircle size={16} className="success-icon" />
                            ) : (
                              <XCircle size={16} className="error-icon" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data-message">
                        <Download size={48} />
                        <p>No files downloaded from this page</p>
                      </div>
                    )}
                  </div>
                )}

                {/* HTML Structure Tab */}
                {activeTab === 'structure' && (
                  <div className="detail-section">
                    <h4>HTML Structure & Selectors ({detailedViewData?.html_structure?.length || 0})</h4>
                    {detailedViewData?.html_structure && detailedViewData.html_structure.length > 0 ? (
                      <div className="html-structure-container">
                        <div className="html-structure-filters">
                          <input 
                            type="text" 
                            className="html-structure-search"
                            placeholder="Filter by tag, selector, or content..."
                            onChange={(e) => {
                              const searchTerm = e.target.value.toLowerCase();
                              const items = document.querySelectorAll('.html-structure-item');
                              items.forEach(item => {
                                const text = item.textContent.toLowerCase();
                                item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
                              });
                            }}
                          />
                        </div>
                        <div className="html-structure-list">
                          {detailedViewData.html_structure.map((elem, idx) => {
                            const attrs = elem.attributes ? JSON.parse(elem.attributes) : {};
                            return (
                              <div key={idx} className="html-structure-item">
                                <div className="html-structure-header">
                                  <span className="html-tag-badge">{elem.tag_name}</span>
                                  <code className="html-selector">{elem.selector}</code>
                                </div>
                                {elem.text_content && (
                                  <div className="html-content">{elem.text_content}</div>
                                )}
                                {(attrs.class || attrs.id) && (
                                  <div className="html-attributes">
                                    {attrs.id && <span className="html-attr-id">id: {attrs.id}</span>}
                                    {attrs.class && <span className="html-attr-class">class: {attrs.class}</span>}
                                  </div>
                                )}
                                {elem.parent_selector && (
                                  <div className="html-parent">
                                    Parent: <code>{elem.parent_selector}</code>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="no-data-message">
                        <Layers size={48} />
                        <p>No HTML structure data available</p>
                        <span style={{fontSize: '13px', color: '#5f6368'}}>
                          This page was scraped before HTML structure extraction was implemented
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Preview Tab */}
                {activeTab === 'content' && (
                  <div className="detail-section">
                    <h4>Content Preview</h4>
                    {detailedViewData?.full_text ? (
                      <div className="detail-text-preview">
                        {detailedViewData.full_text}
                      </div>
                    ) : (
                      <div className="no-data-message">
                        <FileText size={48} />
                        <p>No text content available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Browser Fingerprint Tab */}
                {activeTab === 'fingerprint' && (
                  <div className="detail-section">
                    <h4>Browser Fingerprint</h4>
                    {detailedViewData?.fingerprint ? (
                      <div className="detail-fingerprint">
                        <pre>{JSON.stringify(JSON.parse(detailedViewData.fingerprint), null, 2)}</pre>
                      </div>
                    ) : (
                      <div className="no-data-message">
                        <Shield size={48} />
                        <p>No fingerprint data available</p>
                      </div>
                    )}
                  </div>
                )}
              </>
              )}
            </div>
          </div>
        ) : (
          <>

        {/* Pages View */}
        {activeView === 'pages' && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><FileText size={24} /> Scraped Pages ({allPages.length})</h1>
            </div>

            {/* Search Bar */}
            <div className="search-filter-bar">
              <input
                type="text"
                placeholder="Search pages by URL or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-filter"
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="search-results-info">
                Found {filteredPages.length} of {allPages.length} pages
              </div>
            )}

            {filteredPages.length > 0 ? (
              <div className="progress-pages-list">
                {filteredPages.slice(0, visiblePageCount).map((page) => {
                  const pageFiles = getPageFiles(page.url)
                  const metadata = metadataContent[page.id]
                  const isExpanded = expandedMetadata[page.id]
                  
                  return (
                    <div className="progress-page-card" key={page.id}>
                      {/* Page Header */}
                      <div className="progress-card-header">
                        <div className="progress-card-title">
                          <a href={page.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                            {page.title || 'No title'}
                          </a>
                        </div>
                        <div className="progress-card-meta">
                          <span className="depth-badge-compact">D{page.depth}</span>
                          <span className="progress-card-date">
                            <Clock size={12} />
                            {page.scraped_at}
                          </span>
                        </div>
                      </div>

                      <div className="progress-card-url">
                        {formatUrl(page.url)}
                      </div>

                      {/* Quick Stats */}
                      {metadata && (
                        <div className="progress-card-stats">
                          <div className="progress-stat-item">
                            <Image size={12} />
                            <span>{metadata.media_count || 0}</span>
                          </div>
                          <div className="progress-stat-item">
                            <Link2 size={12} />
                            <span>{metadata.internal_links_count || 0}</span>
                          </div>
                          <div className="progress-stat-item">
                            <ExternalLink size={12} />
                            <span>{metadata.external_links_count || 0}</span>
                          </div>
                          {pageFiles.length > 0 && (
                            <div className="progress-stat-item">
                              <Download size={12} />
                              <span>{pageFiles.length}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expanded Metadata */}
                      {isExpanded && metadata && (
                        <div className="progress-card-details">
                          {metadata.description && metadata.description !== 'No description' && (
                            <div className="detail-section-compact">
                              <h4>Description</h4>
                              <p>{metadata.description}</p>
                            </div>
                          )}

                          <div className="detail-section-compact">
                            <h4>Technical Details</h4>
                            <div className="detail-items-compact">
                              <div className="detail-row-compact">
                                <span className="detail-label-compact">Proxy:</span>
                                <span>{metadata.proxy_used || 'Direct'}</span>
                              </div>
                              <div className="detail-row-compact">
                                <span className="detail-label-compact">Authenticated:</span>
                                <span>{metadata.authenticated ? 'Yes' : 'No'}</span>
                              </div>
                              <div className="detail-row-compact">
                                <span className="detail-label-compact">Timestamp:</span>
                                <span>{new Date(metadata.timestamp * 1000).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {metadata.headers && Object.values(metadata.headers).some(arr => arr && arr.length > 0) && (
                            <div className="detail-section-compact">
                              <h4>Headers</h4>
                              <div className="headers-list-compact">
                                {Object.entries(metadata.headers).map(([tag, values]) => (
                                  values && values.length > 0 && (
                                    <div key={tag} className="header-group">
                                      <span className="header-tag-badge">{tag}</span>
                                      <div className="header-values">
                                        {values.map((val, idx) => (
                                          <span key={idx} className="header-value">{val}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Files Section */}
                      {pageFiles.length > 0 && (
                        <div className="progress-card-files">
                          <h4><Download size={14} /> Files ({pageFiles.length})</h4>
                          <div className="files-list-compact">
                            {pageFiles.map((file, idx) => (
                              <div key={idx} className="file-item-row">
                                <span className="file-badge-compact">{file.file_extension}</span>
                                <span className="file-name-text">{file.file_name}</span>
                                <span className="file-size-text">{api.formatBytes(file.file_size_bytes)}</span>
                                {file.download_status === 'success' ? (
                                  <CheckCircle size={14} className="success-icon" />
                                ) : (
                                  <XCircle size={14} className="error-icon" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="progress-card-actions">
                        <button 
                          className="progress-toggle-btn"
                          onClick={() => toggleMetadataExpand(page.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={14} />
                              Less Details
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} />
                              {metadata ? 'More Details' : 'Load Details'}
                            </>
                          )}
                        </button>
                        <button 
                          className="progress-view-btn"
                          onClick={() => handleViewDetails(page)}
                        >
                          <Eye size={14} />
                          View Full Details
                        </button>
                      </div>
                    </div>
                  )
                })}
                
                {/* Load More Button */}
                {filteredPages.length > visiblePageCount && (
                  <div className="load-more-container">
                    <button 
                      className="load-more-btn"
                      onClick={() => setVisiblePageCount(prev => prev + 20)}
                    >
                      Load More ({filteredPages.length - visiblePageCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-card">
                <FileText size={48} />
                <h3>No pages yet</h3>
                <p>{status?.running ? 'Pages will appear here as they are scraped' : 'No pages scraped'}</p>
              </div>
            )}
          </div>
        )}

        {/* Files View */}
        {activeView === 'files' && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><Package size={24} /> Downloaded Files ({allFiles.length})</h1>
            </div>

            {allFiles.length > 0 ? (
              <div className="files-grouped-view">
                {Object.entries(groupedFiles).map(([fileType, files]) => {
                  const isCollapsed = collapsedFileTypes[fileType]
                  const successCount = files.filter(f => f.download_status === 'success').length
                  const totalSize = files.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0)
                  
                  return (
                    <div key={fileType} className="file-type-group">
                      <div 
                        className="file-type-header"
                        onClick={() => toggleFileTypeCollapse(fileType)}
                      >
                        <div className="file-type-info">
                          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                          <span className="file-badge-large">{fileType}</span>
                          <span className="file-count">{files.length} files</span>
                          <span className="file-success-count">
                            <CheckCircle size={14} /> {successCount} successful
                          </span>
                          <span className="file-total-size">
                            {api.formatBytes(totalSize)}
                          </span>
                        </div>
                      </div>
                      
                      {!isCollapsed && (
                        <div className="file-type-content">
                          <table>
                            <thead>
                              <tr>
                                <th>File</th>
                                <th>Size</th>
                                <th>Status</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {files.map((file, idx) => (
                                <tr key={idx}>
                                  <td className="file-cell-compact">
                                    <File size={14} />
                                    {file.file_name}
                                  </td>
                                  <td className="size-cell-compact">{api.formatBytes(file.file_size_bytes)}</td>
                                  <td>
                                    {file.download_status === 'success' ? (
                                      <span className="status-badge-compact success">
                                        <CheckCircle size={12} /> Success
                                      </span>
                                    ) : (
                                      <span className="status-badge-compact failed">
                                        <XCircle size={12} /> Failed
                                      </span>
                                    )}
                                  </td>
                                  <td className="date-cell-compact">{file.downloaded_at}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="no-data-card">
                <Package size={48} />
                <h3>No files yet</h3>
                <p>{status?.running ? 'Files will appear here as they are downloaded' : 'No files downloaded'}</p>
              </div>
            )}
          </div>
        )}
        </>
        )}
      </main>
    </div>
    <Footer />
  </>
  )
}

export default ScrapingProgress