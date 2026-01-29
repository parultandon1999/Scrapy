import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock, Globe, FileText, HardDrive, Link2, Calendar,
  Layers, Trash2, Eye, BarChart3, Download, ChevronRight,
  AlertCircle, CheckCircle, XCircle, X, Filter, Search
} from 'lucide-react'
import * as api from '../services/api'
import '../styles/History.css'

function History() {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('sessions')
  const [sessions, setSessions] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionDetails, setSessionDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterDomain, setFilterDomain] = useState('')

  useEffect(() => {
    if (activeView === 'sessions') {
      fetchSessions()
    } else if (activeView === 'statistics') {
      fetchStatistics()
    }
  }, [activeView])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await api.getScrapingSessions()
      setSessions(data.sessions || [])
    } catch (err) {
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
    } catch (err) {
      setError('Failed to load statistics')
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
    } catch (err) {
      setError('Failed to load session details')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (domain, e) => {
    e.stopPropagation()
    if (!confirm(`Delete all data for ${domain}? This cannot be undone.`)) return

    try {
      setLoading(true)
      const result = await api.deleteSession(domain)
      alert(`Deleted ${result.deleted_pages} pages`)
      fetchSessions()
      if (selectedSession === domain) {
        setSelectedSession(null)
        setSessionDetails(null)
        setActiveView('sessions')
      }
    } catch (err) {
      setError('Failed to delete session')
    } finally {
      setLoading(false)
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
    <div className="database-page">
      {/* Sidebar Navigation */}
      <aside className="db-sidebar">
        <h2><Clock size={20} /> History</h2>
        <nav className="db-nav">
          <button 
            className={`db-nav-item ${activeView === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveView('sessions')}
          >
            <Globe size={18} />
            Sessions
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
      <main className="db-main">
        {error && (
          <div className="db-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}

        {loading && activeView !== 'sessions' && (
          <div className="db-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

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

            {getSortedSessions().length > 0 ? (
              <div className="sessions-grid-compact">
                {getSortedSessions().map((session, idx) => (
                  <div key={idx} className="session-card-compact">
                    <div className="session-header-compact">
                      <div className="session-domain-compact">
                        <Globe size={16} />
                        <h3>{getDomain(session.domain)}</h3>
                      </div>
                      <div className="session-actions-compact">
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
      </main>
    </div>
  )
}

export default History
