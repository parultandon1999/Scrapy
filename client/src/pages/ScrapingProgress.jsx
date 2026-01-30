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

  useEffect(() => {
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
      const data = await api.getScraperStatus()
      setStatus(data)
      
      if (data.session_id && data.session_id !== currentSessionId) {
        setAllPages([])
        setAllFiles([])
        setCurrentSessionId(data.session_id)
      }
      
      if (!data.running && intervalRef.current) {
        stopPolling()
      }
      
      if (data.recent_pages) {
        setAllPages(prevPages => {
          const existingIds = new Set(prevPages.map(p => p.id))
          const newPages = data.recent_pages.filter(p => !existingIds.has(p.id))
          return [...prevPages, ...newPages]
        })
      }

      if (data.recent_files) {
        setAllFiles(prevFiles => {
          const existingNames = new Set(prevFiles.map(f => f.file_name + f.downloaded_at))
          const newFiles = data.recent_files.filter(f => !existingNames.has(f.file_name + f.downloaded_at))
          return [...prevFiles, ...newFiles]
        })
      }
      
      if (!data.running && data.pages_scraped === 0 && !isHistoryView) {
        navigate('/')
      }
    } catch (err) {
      console.error('Error fetching status:', err)
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
                  <span>Scraping...</span>
                </div>
              ) : status.pages_scraped > 0 ? (
                <div className={status.was_stopped ? 'status-stopped' : 'status-complete'}>
                  {status.was_stopped ? <StopCircle size={14} /> : <CheckCircle size={14} />}
                  <span>{status.was_stopped ? 'Stopped' : 'Complete'}</span>
                </div>
              ) : null}
            </div>

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
              <button onClick={handleStop} className="stop-btn-sidebar">
                <StopCircle size={16} />
                Stop Scraping
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
          <div className="detailed-full-page">
            <div className="detailed-page-header">
              <button className="back-btn-full" onClick={closeDetailedView}>
                <ArrowLeft size={20} />
                Back to Pages
              </button>
              <h1>Page Details</h1>
            </div>

            {/* Tabs Navigation */}
            <div className="detail-tabs-container">
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

            {allPages.length > 0 ? (
              <div className="progress-pages-list">
                {allPages.map((page) => {
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
              <div className="data-table-compact">
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFiles.map((file, idx) => (
                      <tr key={idx}>
                        <td className="file-cell-compact">
                          <File size={14} />
                          {file.file_name}
                        </td>
                        <td><span className="file-badge-compact">{file.file_extension}</span></td>
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