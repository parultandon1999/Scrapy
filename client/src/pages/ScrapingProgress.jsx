import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Activity, Globe, FileText, Download, Layers, Clock,
  ExternalLink, File, CheckCircle, XCircle, ChevronDown,
  ChevronUp, StopCircle, Play, Package, Link2, Image,
  Hash, Calendar, Shield, X
} from 'lucide-react'
import * as api from '../services/api'
import '../styles/ScrapingProgress.css'

function ScrapingProgress() {
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
      const response = await fetch(`http://localhost:8000/api/data/pages-by-url?start_url=${encodeURIComponent(startUrl)}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const data = await response.json()
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
          const response = await fetch(`http://localhost:8000/api/metadata/${pageId}`)
          const data = await response.json()
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

  return (
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
                                        {values.slice(0, 3).map((val, idx) => (
                                          <span key={idx} className="header-value">{val}</span>
                                        ))}
                                        {values.length > 3 && (
                                          <span className="header-more">+{values.length - 3} more</span>
                                        )}
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

                      {/* Toggle Button */}
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
      </main>
    </div>
  )
}

export default ScrapingProgress
