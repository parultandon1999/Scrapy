import { useState, useEffect } from 'react'
import { getPerformanceAnalytics } from '../services/api'
import '../styles/History.css'

function History() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await getPerformanceAnalytics()
      setAnalytics(data)
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>History & Analytics</h1>
        </div>
        <div className="loading">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>History & Analytics</h1>
        </div>
        <div className="message error-message">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>History & Analytics</h1>
        <p className="page-description">View scraping performance and statistics</p>
      </div>

      {analytics && (
        <>
          {/* Timeline */}
          {analytics.timeline && (
            <div className="analytics-section">
              <h3>Crawl Timeline</h3>
              <div className="timeline-card">
                <div className="timeline-stat">
                  <span className="label">Start Time:</span>
                  <span className="value">{formatDate(analytics.timeline.start_time)}</span>
                </div>
                <div className="timeline-stat">
                  <span className="label">End Time:</span>
                  <span className="value">{formatDate(analytics.timeline.end_time)}</span>
                </div>
                <div className="timeline-stat">
                  <span className="label">Total Pages:</span>
                  <span className="value">{analytics.timeline.total_pages || 0}</span>
                </div>
                {analytics.timeline.start_time && analytics.timeline.end_time && (
                  <div className="timeline-stat">
                    <span className="label">Duration:</span>
                    <span className="value">
                      {((analytics.timeline.end_time - analytics.timeline.start_time) / 60).toFixed(1)} minutes
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proxy Statistics */}
          {analytics.proxy_stats && analytics.proxy_stats.length > 0 && (
            <div className="analytics-section">
              <h3>Proxy Usage</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Proxy</th>
                      <th>Pages Scraped</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.proxy_stats.map((proxy, idx) => {
                      const total = analytics.proxy_stats.reduce((sum, p) => sum + p.page_count, 0)
                      const percentage = ((proxy.page_count / total) * 100).toFixed(1)
                      return (
                        <tr key={idx}>
                          <td>{proxy.proxy_used || 'Direct'}</td>
                          <td>{proxy.page_count}</td>
                          <td>
                            <div className="percentage-bar">
                              <div 
                                className="percentage-fill" 
                                style={{ width: `${percentage}%` }}
                              />
                              <span className="percentage-text">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Depth Distribution */}
          {analytics.depth_stats && analytics.depth_stats.length > 0 && (
            <div className="analytics-section">
              <h3>Depth Distribution</h3>
              <div className="depth-chart">
                {analytics.depth_stats.map((depth, idx) => {
                  const total = analytics.depth_stats.reduce((sum, d) => sum + d.page_count, 0)
                  const percentage = ((depth.page_count / total) * 100).toFixed(1)
                  return (
                    <div className="depth-item" key={idx}>
                      <div className="depth-label">
                        <span>Depth {depth.depth}</span>
                        <span>{depth.page_count} pages</span>
                      </div>
                      <div className="depth-bar">
                        <div 
                          className="depth-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="depth-percentage">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {analytics.proxy_stats?.length === 0 && analytics.depth_stats?.length === 0 && (
            <div className="no-data-card">
              <p>No analytics data available yet. Start scraping to see performance metrics.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default History
