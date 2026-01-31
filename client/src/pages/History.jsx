import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/Breadcrumb'
import {
  Clock, Globe, FileText, HardDrive, Link2, Calendar,
  Layers, Trash2, Eye, BarChart3, Download, ChevronRight,
  AlertCircle, CheckCircle, XCircle, X, Filter, Search
} from 'lucide-react'
import * as api from '../services/api'
import { useToast } from '../components/mui/useToast'
import { 
  HistoryCardSkeleton,
  HistorySessionsSkeleton,
  HistoryStatisticsSkeleton,
  HistoryTimelineSkeleton,
  HistorySessionDetailsSkeleton,
  ConfigSectionSkeleton 
} from '../components/SkeletonLoader'
import '../styles/History.css'

function History({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [activeView, setActiveView] = useState('sessions')
  const [sessions, setSessions] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionDetails, setSessionDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterDomain, setFilterDomain] = useState('')
  const [selectedForComparison, setSelectedForComparison] = useState([])
  const [comparisonData, setComparisonData] = useState(null)
  const [timelineData, setTimelineData] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [sessionTags, setSessionTags] = useState({}) // Store tags in localStorage
  const [sessionNotes, setSessionNotes] = useState({}) // Store notes in localStorage
  const [editingTag, setEditingTag] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [exportingSession, setExportingSession] = useState(null)

  // Load tags and notes from localStorage on mount
  useEffect(() => {
    const savedTags = localStorage.getItem('sessionTags')
    const savedNotes = localStorage.getItem('sessionNotes')
    if (savedTags) {
      setSessionTags(JSON.parse(savedTags))
    }
    if (savedNotes) {
      setSessionNotes(JSON.parse(savedNotes))
    }
  }, [])

  // Save tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sessionTags', JSON.stringify(sessionTags))
  }, [sessionTags])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sessionNotes', JSON.stringify(sessionNotes))
  }, [sessionNotes])

  useEffect(() => {
    if (activeView === 'sessions') {
      fetchSessions()
    } else if (activeView === 'statistics') {
      fetchStatistics()
    } else if (activeView === 'timeline') {
      fetchTimeline()
    }
  }, [activeView])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await api.getScrapingSessions()
      setSessions(data.sessions || [])
    } catch {
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const data = await api.getHistoryStatistics()
      setStatistics(data)
    } catch {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const data = await api.getScrapingTimeline()
      setTimelineData(data)
    } catch {
      setError('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const toggleSessionForComparison = (domain) => {
    setSelectedForComparison(prev => {
      if (prev.includes(domain)) {
        return prev.filter(d => d !== domain)
      } else if (prev.length < 2) {
        return [...prev, domain]
      } else {
        toast.warning('You can only compare 2 sessions at a time')
        return prev
      }
    })
  }

  const handleCompare = async () => {
    if (selectedForComparison.length !== 2) {
      toast.warning('Please select exactly 2 sessions to compare')
      return
    }

    try {
      setLoading(true)
      const [session1, session2] = await Promise.all([
        api.getSessionDetails(selectedForComparison[0]),
        api.getSessionDetails(selectedForComparison[1])
      ])
      
      setComparisonData({ session1, session2 })
      setActiveView('comparison')
    } catch {
      setError('Failed to load comparison data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessionDetails = async (domain) => {
    try {
      setLoading(true)
      const data = await api.getSessionDetails(domain)
      setSessionDetails(data)
      setSelectedSession(domain)
      setActiveView('session-details')
    } catch {
      setError('Failed to load session details')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (domain, e) => {
    e.stopPropagation()
    // Open confirmation modal instead of simple confirm
    setDeleteConfirmModal(domain)
    setDeleteConfirmInput('')
  }

  const confirmDelete = async () => {
    const domain = deleteConfirmModal
    
    // Extract domain name for comparison (remove protocol)
    const domainName = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    if (deleteConfirmInput !== domainName) {
      toast.error('Domain name does not match. Please type the exact domain name.')
      return
    }

    try {
      setLoading(true)
      const result = await api.deleteSession(domain)
      toast.success(`Deleted ${result.deleted_pages} pages`)
      
      // Remove tag and note if exists
      const newTags = { ...sessionTags }
      const newNotes = { ...sessionNotes }
      delete newTags[domain]
      delete newNotes[domain]
      setSessionTags(newTags)
      setSessionNotes(newNotes)
      
      fetchSessions()
      if (selectedSession === domain) {
        setSelectedSession(null)
        setSessionDetails(null)
        setActiveView('sessions')
      }
      setDeleteConfirmModal(null)
      setDeleteConfirmInput('')
    } catch {
      setError('Failed to delete session')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (domain) => {
    setEditingTag(domain)
    setTagInput(sessionTags[domain] || '')
  }

  const saveTag = (domain) => {
    if (tagInput.trim()) {
      setSessionTags(prev => ({
        ...prev,
        [domain]: tagInput.trim()
      }))
    } else {
      // Remove tag if empty
      const newTags = { ...sessionTags }
      delete newTags[domain]
      setSessionTags(newTags)
    }
    setEditingTag(null)
    setTagInput('')
  }

  const cancelTagEdit = () => {
    setEditingTag(null)
    setTagInput('')
  }

  const handleAddNote = (domain) => {
    setEditingNote(domain)
    setNoteInput(sessionNotes[domain] || '')
  }

  const saveNote = (domain) => {
    if (noteInput.trim()) {
      setSessionNotes(prev => ({
        ...prev,
        [domain]: noteInput.trim()
      }))
    } else {
      // Remove note if empty
      const newNotes = { ...sessionNotes }
      delete newNotes[domain]
      setSessionNotes(newNotes)
    }
    setEditingNote(null)
    setNoteInput('')
  }

  const cancelNoteEdit = () => {
    setEditingNote(null)
    setNoteInput('')
  }

  const handleExportSession = async (domain, e) => {
    e.stopPropagation()
    setExportingSession(domain)
    
    try {
      const details = await api.getSessionDetails(domain)
      
      // Create export data
      const exportData = {
        domain: domain,
        tag: sessionTags[domain] || null,
        note: sessionNotes[domain] || null,
        exported_at: new Date().toISOString(),
        overview: details.overview,
        depth_distribution: details.depth_distribution,
        file_stats: details.file_stats,
        recent_pages: details.recent_pages
      }
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session_${getDomain(domain)}_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Session exported successfully!')
    } catch (err) {
      toast.error('Failed to export session')
      console.error(err)
    } finally {
      setExportingSession(null)
    }
  }

  const handleViewProgress = (domain) => {
    const sessionId = btoa(domain).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
    navigate(`/progress/${sessionId}`, { state: { viewHistoryUrl: domain } })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0s'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const getDomain = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url
    }
  }

  const getSortedSessions = () => {
    let filtered = sessions.filter(s => 
      !filterDomain || s.domain.toLowerCase().includes(filterDomain.toLowerCase())
    )

    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => b.end_time - a.end_time)
      case 'oldest':
        return filtered.sort((a, b) => a.start_time - b.start_time)
      case 'pages':
        return filtered.sort((a, b) => b.total_pages - a.total_pages)
      case 'size':
        return filtered.sort((a, b) => (b.total_size || 0) - (a.total_size || 0))
      default:
        return filtered
    }
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="history" />
      <div className="database-page">
      {/* Sidebar Navigation */}
      <aside className="db-sidebar" role="complementary" aria-label="History navigation">
        <h2><Clock size={20} /> History</h2>
        <nav className="db-nav" aria-label="History sections">
          <button 
            className={`db-nav-item ${activeView === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveView('sessions')}
          >
            <Globe size={18} />
            Sessions
          </button>
          <button 
            className={`db-nav-item ${activeView === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveView('timeline')}
          >
            <Calendar size={18} />
            Timeline
          </button>
          <button 
            className={`db-nav-item ${activeView === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveView('statistics')}
          >
            <BarChart3 size={18} />
            Statistics
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="db-main" role="main">
        <Breadcrumb 
          items={[
            { label: 'History', icon: Clock, path: '/history' },
            { label: activeView === 'sessions' ? 'Sessions' :
                     activeView === 'timeline' ? 'Timeline' :
                     activeView === 'statistics' ? 'Statistics' :
                     activeView === 'session-details' ? `Session: ${selectedSession ? getDomain(selectedSession) : 'Details'}` :
                     activeView === 'comparison' ? 'Compare Sessions' : 'View'
            }
          ]}
        />
        
        {error && (
          <div className="db-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}

        {loading && activeView === 'sessions' && <HistorySessionsSkeleton />}
        {loading && activeView === 'statistics' && <HistoryStatisticsSkeleton />}
        {loading && activeView === 'timeline' && <HistoryTimelineSkeleton />}
        {loading && activeView === 'session-details' && <HistorySessionDetailsSkeleton />}
        {loading && activeView === 'comparison' && <HistorySessionDetailsSkeleton />}

        {/* Sessions View */}
        {activeView === 'sessions' && !loading && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><Globe size={24} /> Scraping Sessions ({sessions.length})</h1>
              <div className="view-controls-compact">
                <input
                  type="text"
                  placeholder="Filter by domain..."
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="search-input-compact"
                  style={{ width: '200px', marginRight: '8px' }}
                />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="control-select-compact">
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="pages">Most Pages</option>
                  <option value="size">Largest Size</option>
                </select>
              </div>
            </div>

            {/* Comparison Toolbar */}
            {selectedForComparison.length > 0 && (
              <div className="comparison-toolbar">
                <div className="comparison-info">
                  <CheckCircle size={16} />
                  <span>{selectedForComparison.length} session{selectedForComparison.length !== 1 ? 's' : ''} selected for comparison</span>
                </div>
                <div className="comparison-buttons">
                  <button 
                    onClick={handleCompare} 
                    className="compare-btn"
                    disabled={selectedForComparison.length !== 2}
                  >
                    <BarChart3 size={16} />
                    Compare Sessions
                  </button>
                  <button 
                    onClick={() => setSelectedForComparison([])} 
                    className="clear-comparison-btn"
                  >
                    <X size={16} />
                    Clear
                  </button>
                </div>
              </div>
            )}

            {getSortedSessions().length > 0 ? (
              <div className="sessions-grid-compact">
                {getSortedSessions().map((session, idx) => (
                  <div 
                    key={idx} 
                    className={`session-card-compact ${selectedForComparison.includes(session.domain) ? 'selected' : ''}`}
                  >
                    <div className="session-header-compact">
                      <div className="session-domain-compact">
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(session.domain)}
                          onChange={() => toggleSessionForComparison(session.domain)}
                          className="session-checkbox"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Globe size={16} />
                        <h3>{getDomain(session.domain)}</h3>
                        {sessionTags[session.domain] && (
                          <span className="session-tag">{sessionTags[session.domain]}</span>
                        )}
                      </div>
                      <div className="session-actions-compact">
                        <button
                          onClick={() => handleAddTag(session.domain)}
                          className="action-btn-compact"
                          title="Add/Edit Tag"
                        >
                          🏷️
                        </button>
                        <button
                          onClick={() => handleAddNote(session.domain)}
                          className="action-btn-compact"
                          title="Add/Edit Note"
                        >
                          📝
                        </button>
                        <button
                          onClick={(e) => handleExportSession(session.domain, e)}
                          className="action-btn-compact success"
                          title="Export Session"
                          disabled={exportingSession === session.domain}
                        >
                          {exportingSession === session.domain ? '⏳' : <Download size={14} />}
                        </button>
                        <button
                          onClick={() => fetchSessionDetails(session.domain)}
                          className="action-btn-compact"
                          title="View Details"
                        >
                          <BarChart3 size={14} />
                        </button>
                        <button
                          onClick={() => handleViewProgress(session.domain)}
                          className="action-btn-compact primary"
                          title="View Progress"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(session.domain, e)}
                          className="action-btn-compact danger"
                          title="Delete Session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="session-url-compact">
                      <a href={session.domain} target="_blank" rel="noopener noreferrer">
                        {session.domain}
                      </a>
                    </div>

                    {/* Show note if exists */}
                    {sessionNotes[session.domain] && (
                      <div className="session-note">
                        <span className="note-icon">📝</span>
                        <span className="note-text">{sessionNotes[session.domain]}</span>
                      </div>
                    )}

                    <div className="session-stats-compact">
                      <div className="session-stat-compact">
                        <FileText size={12} />
                        <span>{session.total_pages} pages</span>
                      </div>
                      <div className="session-stat-compact">
                        <Layers size={12} />
                        <span>D{session.max_depth}</span>
                      </div>
                      <div className="session-stat-compact">
                        <Link2 size={12} />
                        <span>{session.total_links}</span>
                      </div>
                      <div className="session-stat-compact">
                        <Download size={12} />
                        <span>{session.total_files}</span>
                      </div>
                    </div>

                    <div className="session-meta-compact">
                      <div className="session-date-compact">
                        <Calendar size={12} />
                        <span>{new Date(session.end_time * 1000).toLocaleDateString()}</span>
                      </div>
                      {session.total_size > 0 && (
                        <div className="session-size-compact">
                          <HardDrive size={12} />
                          <span>{api.formatBytes(session.total_size)}</span>
                        </div>
                      )}
                    </div>

                    <div className="session-duration-compact">
                      <Clock size={12} />
                      <span>{formatDuration(session.end_time - session.start_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-card">
                <Clock size={48} />
                <h3>No sessions found</h3>
                <p>Start scraping to see your history here</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics View */}
        {activeView === 'statistics' && statistics && !loading && (
          <div className="dashboard-view">
            <h1><BarChart3 size={24} /> Overall Statistics</h1>
            
            <div className="stats-grid-compact">
              <div className="stat-card-compact">
                <Globe size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Total Sessions</div>
                  <div className="stat-value">{statistics.total_sessions}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <FileText size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Total Pages</div>
                  <div className="stat-value">{statistics.total_pages}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <Download size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Total Files</div>
                  <div className="stat-value">{statistics.total_files}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <HardDrive size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Total Size</div>
                  <div className="stat-value">{statistics.total_size_mb.toFixed(1)} MB</div>
                </div>
              </div>
            </div>

            {statistics.most_active_day && (
              <div className="analytics-card">
                <h3><Calendar size={18} /> Most Active Day</h3>
                <div className="detail-items-compact">
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Date:</span>
                    <span>{statistics.most_active_day.date}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Pages Scraped:</span>
                    <span className="highlight">{statistics.most_active_day.count}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="analytics-card">
              <h3><Clock size={18} /> Average Session Duration</h3>
              <div className="stat-value-large">
                {formatDuration(statistics.avg_session_duration_seconds)}
              </div>
            </div>
          </div>
        )}

        {/* Session Details View */}
        {activeView === 'session-details' && sessionDetails && !loading && (
          <div className="details-view">
            <div className="view-header-compact">
              <h1><Globe size={24} /> {getDomain(sessionDetails.domain)}</h1>
              <button onClick={() => setActiveView('sessions')} className="back-btn-compact">
                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
              </button>
            </div>

            <div className="details-grid-compact">
              {/* Overview */}
              <div className="detail-section-compact">
                <h3><BarChart3 size={18} /> Overview</h3>
                <div className="detail-items-compact">
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Total Pages:</span>
                    <span className="highlight">{sessionDetails.overview.total_pages}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Max Depth:</span>
                    <span className="depth-badge-compact">D{sessionDetails.overview.max_depth}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Avg Depth:</span>
                    <span>{sessionDetails.overview.avg_depth?.toFixed(1)}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Duration:</span>
                    <span>{formatDuration(sessionDetails.overview.end_time - sessionDetails.overview.start_time)}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Started:</span>
                    <span>{new Date(sessionDetails.overview.start_time * 1000).toLocaleString()}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Completed:</span>
                    <span>{new Date(sessionDetails.overview.end_time * 1000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Depth Distribution */}
              <div className="detail-section-compact">
                <h3><Layers size={18} /> Depth Distribution</h3>
                <div className="chart-container">
                  {sessionDetails.depth_distribution.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <span className="chart-label">D{item.depth}</span>
                      <div className="chart-bar-bg">
                        <div
                          className="chart-bar-fill"
                          style={{
                            width: `${(item.count / Math.max(...sessionDetails.depth_distribution.map(d => d.count))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="chart-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Statistics */}
              {sessionDetails.file_stats.length > 0 && (
                <div className="detail-section-compact full-width">
                  <h3><Download size={18} /> File Statistics</h3>
                  <div className="data-table-compact">
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Count</th>
                          <th>Total Size</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionDetails.file_stats.map((file, idx) => (
                          <tr key={idx}>
                            <td><span className="file-badge-compact">{file.file_extension}</span></td>
                            <td className="count-cell-compact">{file.count}</td>
                            <td className="size-cell-compact">{api.formatBytes(file.total_size)}</td>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Pages */}
              {sessionDetails.recent_pages.length > 0 && (
                <div className="detail-section-compact full-width">
                  <h3><FileText size={18} /> Recent Pages</h3>
                  <div className="data-table-compact">
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>URL</th>
                          <th>Depth</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionDetails.recent_pages.map((page, idx) => (
                          <tr key={idx}>
                            <td>{page.title || 'No title'}</td>
                            <td className="url-cell-compact">
                              <a href={page.url} target="_blank" rel="noopener noreferrer">
                                {page.url}
                              </a>
                            </td>
                            <td><span className="depth-badge-compact">D{page.depth}</span></td>
                            <td className="date-cell-compact">{new Date(page.timestamp * 1000).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline View */}
        {activeView === 'timeline' && timelineData && !loading && (
          <div className="timeline-view">
            <h1><Calendar size={24} /> Scraping Timeline</h1>
            
            <div className="timeline-visual">
              {timelineData.timeline && timelineData.timeline.length > 0 ? (
                <>
                  <div className="timeline-chart">
                    {timelineData.timeline.map((item, idx) => {
                      const maxPages = Math.max(...timelineData.timeline.map(t => t.pages_scraped))
                      const height = (item.pages_scraped / maxPages) * 100
                      
                      return (
                        <div key={idx} className="timeline-bar-wrapper">
                          <div 
                            className="timeline-bar"
                            style={{ height: `${height}%` }}
                            title={`${item.date}: ${item.pages_scraped} pages`}
                          >
                            <span className="timeline-bar-value">{item.pages_scraped}</span>
                          </div>
                          <div className="timeline-bar-label">{item.date}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="timeline-list">
                    {timelineData.timeline.map((item, idx) => (
                      <div key={idx} className="timeline-item-card">
                        <div className="timeline-item-date">
                          <Calendar size={16} />
                          <strong>{item.date}</strong>
                        </div>
                        <div className="timeline-item-stats">
                          <div className="timeline-stat">
                            <FileText size={14} />
                            <span>{item.pages_scraped} pages</span>
                          </div>
                          <div className="timeline-stat">
                            <Layers size={14} />
                            <span>{item.depths_reached} depths</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-data-card">
                  <Calendar size={48} />
                  <h3>No timeline data</h3>
                  <p>Start scraping to see activity over time</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison View */}
        {activeView === 'comparison' && comparisonData && !loading && (
          <div className="comparison-view">
            <div className="view-header-compact">
              <h1><BarChart3 size={24} /> Session Comparison</h1>
              <button onClick={() => setActiveView('sessions')} className="back-btn-compact">
                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
              </button>
            </div>

            <div className="comparison-grid">
              {/* Session 1 */}
              <div className="comparison-column">
                <div className="comparison-header">
                  <Globe size={20} />
                  <h2>{getDomain(comparisonData.session1.domain)}</h2>
                </div>

                <div className="comparison-stats">
                  <div className="comparison-stat-card">
                    <FileText size={16} />
                    <div>
                      <div className="stat-label">Pages</div>
                      <div className="stat-value">{comparisonData.session1.overview.total_pages}</div>
                    </div>
                  </div>
                  <div className="comparison-stat-card">
                    <Layers size={16} />
                    <div>
                      <div className="stat-label">Max Depth</div>
                      <div className="stat-value">D{comparisonData.session1.overview.max_depth}</div>
                    </div>
                  </div>
                  <div className="comparison-stat-card">
                    <Clock size={16} />
                    <div>
                      <div className="stat-label">Duration</div>
                      <div className="stat-value">
                        {formatDuration(comparisonData.session1.overview.end_time - comparisonData.session1.overview.start_time)}
                      </div>
                    </div>
                  </div>
                  <div className="comparison-stat-card">
                    <Download size={16} />
                    <div>
                      <div className="stat-label">Files</div>
                      <div className="stat-value">
                        {comparisonData.session1.file_stats.reduce((sum, f) => sum + f.count, 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="comparison-chart">
                  <h3>Depth Distribution</h3>
                  <div className="chart-container">
                    {comparisonData.session1.depth_distribution.map((item, idx) => (
                      <div key={idx} className="chart-bar-item">
                        <span className="chart-label">D{item.depth}</span>
                        <div className="chart-bar-bg">
                          <div
                            className="chart-bar-fill"
                            style={{
                              width: `${(item.count / Math.max(...comparisonData.session1.depth_distribution.map(d => d.count))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="chart-value">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="comparison-divider">
                <div className="vs-badge">VS</div>
              </div>

              {/* Session 2 */}
              <div className="comparison-column">
                <div className="comparison-header">
                  <Globe size={20} />
                  <h2>{getDomain(comparisonData.session2.domain)}</h2>
                </div>

                <div className="comparison-stats">
                  <div className="comparison-stat-card">
                    <FileText size={16} />
                    <div>
                      <div className="stat-label">Pages</div>
                      <div className="stat-value">{comparisonData.session2.overview.total_pages}</div>
                    </div>
                  </div>
                  <div className="comparison-stat-card">
                    <Layers size={16} />
                    <div>
                      <div className="stat-label">Max Depth</div>
                      <div className="stat-value">D{comparisonData.session2.overview.max_depth}</div>
                    </div>
                  </div>
                  <div className="comparison-stat-card">
                    <Clock size={16} />
                    <div>
                      <div className="stat-label">Duration</div>
                      <div className="stat-value">
                        {formatDuration(comparisonData.session2.overview.end_time - comparisonData.session2.overview.start_time)}
                      </div>
                    </div>
                  </div>
                  <div className="comparison-stat-card">
                    <Download size={16} />
                    <div>
                      <div className="stat-label">Files</div>
                      <div className="stat-value">
                        {comparisonData.session2.file_stats.reduce((sum, f) => sum + f.count, 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="comparison-chart">
                  <h3>Depth Distribution</h3>
                  <div className="chart-container">
                    {comparisonData.session2.depth_distribution.map((item, idx) => (
                      <div key={idx} className="chart-bar-item">
                        <span className="chart-label">D{item.depth}</span>
                        <div className="chart-bar-bg">
                          <div
                            className="chart-bar-fill"
                            style={{
                              width: `${(item.count / Math.max(...comparisonData.session2.depth_distribution.map(d => d.count))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="chart-value">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="comparison-summary">
              <h3>Comparison Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">More Pages:</span>
                  <span className="summary-value">
                    {comparisonData.session1.overview.total_pages > comparisonData.session2.overview.total_pages
                      ? getDomain(comparisonData.session1.domain)
                      : getDomain(comparisonData.session2.domain)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Deeper Crawl:</span>
                  <span className="summary-value">
                    {comparisonData.session1.overview.max_depth > comparisonData.session2.overview.max_depth
                      ? getDomain(comparisonData.session1.domain)
                      : getDomain(comparisonData.session2.domain)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Faster:</span>
                  <span className="summary-value">
                    {(comparisonData.session1.overview.end_time - comparisonData.session1.overview.start_time) <
                     (comparisonData.session2.overview.end_time - comparisonData.session2.overview.start_time)
                      ? getDomain(comparisonData.session1.domain)
                      : getDomain(comparisonData.session2.domain)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmModal(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirm Deletion</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <AlertCircle size={48} color="#d93025" />
                <p>You are about to permanently delete all data for:</p>
                <div className="delete-domain">{deleteConfirmModal}</div>
                <p className="delete-info">
                  This will delete <strong>all pages, files, and metadata</strong> associated with this session.
                  This action <strong>cannot be undone</strong>.
                </p>
              </div>
              <div className="delete-confirm-input">
                <label>Type the domain name to confirm:</label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={deleteConfirmModal.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  autoFocus
                />
                <p className="input-hint">
                  Enter: <code>{deleteConfirmModal.replace(/^https?:\/\//, '').replace(/\/$/, '')}</code>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirmModal(null)}>
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmDelete}
                disabled={deleteConfirmInput !== deleteConfirmModal.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Edit Modal */}
      {editingTag && (
        <div className="modal-overlay" onClick={cancelTagEdit}>
          <div className="modal-content tag-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏷️ Add/Edit Tag</h2>
              <button className="modal-close" onClick={cancelTagEdit}>×</button>
            </div>
            <div className="modal-body">
              <p>Add a label to help organize this session:</p>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g., Production, Test, Research"
                maxLength={20}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && saveTag(editingTag)}
              />
              <p className="tag-examples">
                Examples: Production, Test, Development, Research, Archive
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelTagEdit}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => saveTag(editingTag)}>
                Save Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Edit Modal */}
      {editingNote && (
        <div className="modal-overlay" onClick={cancelNoteEdit}>
          <div className="modal-content note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Add/Edit Note</h2>
              <button className="modal-close" onClick={cancelNoteEdit}>×</button>
            </div>
            <div className="modal-body">
              <p>Add notes about this scraping session:</p>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g., Scraped for client project, contains product data, needs review..."
                maxLength={500}
                rows={6}
                autoFocus
              />
              <p className="note-char-count">
                {noteInput.length}/500 characters
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelNoteEdit}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => saveNote(editingNote)}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
  </>
  )
}

export default History
