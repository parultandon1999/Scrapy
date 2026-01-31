import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import {
  Globe, CheckCircle, XCircle, Clock, AlertCircle, X,
  Play, FileText, Download, RefreshCw, Link, TrendingUp, BarChart3, Upload,
  Shuffle, ArrowRight, Zap, FileJson
} from 'lucide-react'
import * as api from '../services/api'
import { ProxyResultsSkeleton } from '../components/SkeletonLoader'
import LoadingState from '../components/LoadingState'
import '../styles/ProxyTester.css'

function ProxyTester({ darkMode, toggleDarkMode }) {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [testUrl, setTestUrl] = useState('https://httpbin.org/ip')
  const [concurrentTests, setConcurrentTests] = useState(5)
  const [proxies, setProxies] = useState([])
  const [loadingProxies, setLoadingProxies] = useState(false)
  
  // Rotation strategy state
  const [rotationStrategy, setRotationStrategy] = useState('random')
  
  // Import from URL state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)

  // Performance history state
  const [performanceHistory, setPerformanceHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Load performance history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('proxyPerformanceHistory')
    if (savedHistory) {
      setPerformanceHistory(JSON.parse(savedHistory))
    }
    
    const savedStrategy = localStorage.getItem('proxyRotationStrategy')
    if (savedStrategy) {
      setRotationStrategy(savedStrategy)
    }
  }, [])

  // Save performance history to localStorage
  useEffect(() => {
    if (performanceHistory.length > 0) {
      localStorage.setItem('proxyPerformanceHistory', JSON.stringify(performanceHistory))
    }
  }, [performanceHistory])

  // Save rotation strategy to localStorage
  useEffect(() => {
    localStorage.setItem('proxyRotationStrategy', rotationStrategy)
  }, [rotationStrategy])

  const loadProxiesList = async () => {
    try {
      setLoadingProxies(true)
      const data = await api.listProxies()
      setProxies(data.proxies || [])
    } catch (err) {
      setError('Failed to load proxies list')
    } finally {
      setLoadingProxies(false)
    }
  }

  const handleTestProxies = async () => {
    if (proxies.length === 0) {
      setError('No proxies loaded. Please check your proxies.txt file.')
      return
    }

    try {
      setTesting(true)
      setError(null)
      setResults(null)

      const data = await api.testProxies(testUrl, concurrentTests)
      setResults(data)

      // Save to performance history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        testUrl: testUrl,
        totalTested: data.total_tested,
        workingCount: data.working.length,
        failedCount: data.failed.length,
        successRate: ((data.working.length / data.total_tested) * 100).toFixed(1),
        workingProxies: data.working.map(p => ({
          proxy: p.proxy,
          responseTime: p.response_time,
          status: p.status
        })),
        avgResponseTime: data.working.length > 0 
          ? (data.working.reduce((sum, p) => {
              const time = parseFloat(p.response_time.replace('s', ''))
              return sum + time
            }, 0) / data.working.length).toFixed(2) + 's'
          : 'N/A'
      }

      setPerformanceHistory(prev => [historyEntry, ...prev].slice(0, 100)) // Keep last 100
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to test proxies')
    } finally {
      setTesting(false)
    }
  }

  const handleImportFromUrl = async () => {
    if (!importUrl) {
      setError('Please enter a URL')
      return
    }

    try {
      setImporting(true)
      setError(null)

      const response = await fetch(importUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch proxy list')
      }

      const text = await response.text()
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))

      if (lines.length === 0) {
        setError('No valid proxies found in the URL')
        return
      }

      setProxies(lines)
      setShowImportModal(false)
      setImportUrl('')
      
      // Show success message
      setError(null)
      setTimeout(() => {
        setError(`Successfully imported ${lines.length} proxies`)
      }, 100)
    } catch (err) {
      setError(err.message || 'Failed to import proxies from URL')
    } finally {
      setImporting(false)
    }
  }

  const clearHistory = () => {
    if (confirm('Clear all performance history?')) {
      setPerformanceHistory([])
      localStorage.removeItem('proxyPerformanceHistory')
    }
  }

  const getProxyPerformanceTrend = (proxyAddress) => {
    const proxyHistory = performanceHistory
      .filter(h => h.workingProxies.some(p => p.proxy === proxyAddress))
      .slice(0, 10) // Last 10 tests
      .reverse()

    return proxyHistory.map(h => {
      const proxyData = h.workingProxies.find(p => p.proxy === proxyAddress)
      return {
        timestamp: new Date(h.timestamp).toLocaleDateString(),
        responseTime: parseFloat(proxyData.responseTime.replace('s', ''))
      }
    })
  }

  const downloadWorkingProxies = () => {
    if (!results || results.working.length === 0) return

    const content = results.working
      .map(p => `${p.proxy}  # ${p.response_time}`)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `working_proxies_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    if (!results) return

    const headers = ['Proxy', 'Status', 'Response Time', 'Response']
    const rows = [
      ...results.working.map(p => [p.proxy, 'Working', p.response_time, p.response || '']),
      ...results.failed.map(p => [p.proxy, p.status, p.response_time, p.response || ''])
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proxy_test_results_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    if (!results) return

    const exportData = {
      test_info: {
        timestamp: new Date().toISOString(),
        test_url: testUrl,
        concurrent_tests: concurrentTests,
        rotation_strategy: rotationStrategy
      },
      summary: {
        total_tested: results.total_tested,
        working_count: results.working.length,
        failed_count: results.failed.length,
        success_rate: ((results.working.length / results.total_tested) * 100).toFixed(1) + '%'
      },
      working_proxies: results.working,
      failed_proxies: results.failed
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proxy_test_results_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getRotationStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'random':
        return <Shuffle size={16} />
      case 'round-robin':
        return <ArrowRight size={16} />
      case 'fastest-first':
        return <Zap size={16} />
      default:
        return <Shuffle size={16} />
    }
  }

  const getRotationStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'random':
        return 'Randomly select proxies for each request'
      case 'round-robin':
        return 'Cycle through proxies in sequential order'
      case 'fastest-first':
        return 'Prioritize proxies with fastest response times'
      default:
        return ''
    }
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="proxy-tester" />
      <div className="database-page">
        {/* Sidebar */}
        <aside className="db-sidebar" role="complementary" aria-label="Proxy Tester navigation">
          <h2><Globe size={20} /> Proxy Tester</h2>
          
          <div className="proxy-sidebar-info">
            <div className="proxy-info-card">
              <FileText size={16} />
              <div>
                <div className="proxy-info-label">Proxies Loaded</div>
                <div className="proxy-info-value">{proxies.length}</div>
              </div>
            </div>

            {results && (
              <>
                <div className="proxy-info-card success">
                  <CheckCircle size={16} />
                  <div>
                    <div className="proxy-info-label">Working</div>
                    <div className="proxy-info-value">{results.working.length}</div>
                  </div>
                </div>

                <div className="proxy-info-card danger">
                  <XCircle size={16} />
                  <div>
                    <div className="proxy-info-label">Failed</div>
                    <div className="proxy-info-value">{results.failed.length}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="proxy-sidebar-actions">
            <button 
              onClick={loadProxiesList} 
              className="sidebar-btn"
              disabled={loadingProxies}
            >
              <RefreshCw size={16} />
              {loadingProxies ? <LoadingState type="loading-proxies" size="small" className="loading-inline" /> : 'Load Proxies'}
            </button>

            <button 
              onClick={() => setShowImportModal(true)} 
              className="sidebar-btn"
            >
              <Link size={16} />
              Import from URL
            </button>

            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="sidebar-btn"
            >
              <TrendingUp size={16} />
              {showHistory ? 'Hide' : 'Show'} History ({performanceHistory.length})
            </button>

            {results && results.working.length > 0 && (
              <button 
                onClick={downloadWorkingProxies} 
                className="sidebar-btn primary"
              >
                <Download size={16} />
                Download Working
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main id="main-content" className="db-main" role="main">
          <Breadcrumb 
            items={[
              { label: 'Proxy Tester', icon: Globe },
              { label: showHistory ? 'Performance History' : 'Test Proxies' }
            ]}
          />
          
          {error && (
            <div className="db-error">
              <AlertCircle size={18} />
              <p>{error}</p>
              <button onClick={() => setError(null)}><X size={18} /></button>
            </div>
          )}

          <div className="proxy-tester-view">
            <div className="view-header-compact">
              <h1><Globe size={24} /> Test Proxy Servers</h1>
              <p className="section-description">
                Test your proxy list to identify working proxies and their response times
              </p>
            </div>

            {/* Test Configuration */}
            <div className="proxy-test-config">
              <div className="config-card">
                <h3>Test Configuration</h3>
                
                <div className="config-form">
                  <div className="form-group">
                    <label>Test URL</label>
                    <input
                      type="text"
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      placeholder="https://httpbin.org/ip"
                      className="config-input-text"
                      disabled={testing}
                    />
                    <small>URL to test proxy connectivity</small>
                  </div>

                  <div className="form-group">
                    <label>Concurrent Tests</label>
                    <input
                      type="number"
                      value={concurrentTests}
                      onChange={(e) => setConcurrentTests(parseInt(e.target.value) || 1)}
                      min="1"
                      max="20"
                      className="config-input-number"
                      disabled={testing}
                    />
                    <small>Number of proxies to test simultaneously (1-20)</small>
                  </div>

                  <div className="form-group">
                    <label>Rotation Strategy</label>
                    <div className="rotation-strategy-selector">
                      <button
                        className={`strategy-btn ${rotationStrategy === 'random' ? 'active' : ''}`}
                        onClick={() => setRotationStrategy('random')}
                        disabled={testing}
                      >
                        <Shuffle size={16} />
                        <div>
                          <div className="strategy-name">Random</div>
                          <div className="strategy-desc">Randomly select</div>
                        </div>
                      </button>
                      <button
                        className={`strategy-btn ${rotationStrategy === 'round-robin' ? 'active' : ''}`}
                        onClick={() => setRotationStrategy('round-robin')}
                        disabled={testing}
                      >
                        <ArrowRight size={16} />
                        <div>
                          <div className="strategy-name">Round-robin</div>
                          <div className="strategy-desc">Sequential order</div>
                        </div>
                      </button>
                      <button
                        className={`strategy-btn ${rotationStrategy === 'fastest-first' ? 'active' : ''}`}
                        onClick={() => setRotationStrategy('fastest-first')}
                        disabled={testing}
                      >
                        <Zap size={16} />
                        <div>
                          <div className="strategy-name">Fastest-first</div>
                          <div className="strategy-desc">Prioritize speed</div>
                        </div>
                      </button>
                    </div>
                    <small>{getRotationStrategyDescription(rotationStrategy)}</small>
                  </div>

                  <button
                    onClick={handleTestProxies}
                    disabled={testing || proxies.length === 0}
                    className="btn-primary test-btn"
                  >
                    {testing ? (
                      <>
                        <div className="spinner-small"></div>
                        Testing Proxies...
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        Start Testing
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {testing && !results && <ProxyResultsSkeleton />}
            {results && (
              <div className="proxy-results">
                {/* Summary */}
                <div className="results-summary">
                  <div className="summary-card">
                    <FileText size={20} />
                    <div>
                      <div className="summary-label">Total Tested</div>
                      <div className="summary-value">{results.total_tested}</div>
                    </div>
                  </div>
                  <div className="summary-card success">
                    <CheckCircle size={20} />
                    <div>
                      <div className="summary-label">Working</div>
                      <div className="summary-value">{results.working.length}</div>
                    </div>
                  </div>
                  <div className="summary-card danger">
                    <XCircle size={20} />
                    <div>
                      <div className="summary-label">Failed</div>
                      <div className="summary-value">{results.failed.length}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <Globe size={20} />
                    <div>
                      <div className="summary-label">Success Rate</div>
                      <div className="summary-value">
                        {((results.working.length / results.total_tested) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Actions */}
                <div className="export-actions">
                  <h4>Export Results</h4>
                  <div className="export-buttons">
                    <button className="export-btn" onClick={exportToCSV}>
                      <FileText size={16} />
                      Export to CSV
                    </button>
                    <button className="export-btn" onClick={exportToJSON}>
                      <FileJson size={16} />
                      Export to JSON
                    </button>
                    {results.working.length > 0 && (
                      <button className="export-btn primary" onClick={downloadWorkingProxies}>
                        <Download size={16} />
                        Download Working (.txt)
                      </button>
                    )}
                  </div>
                </div>

                {/* Working Proxies */}
                {results.working.length > 0 && (
                  <div className="results-section">
                    <h3>
                      <CheckCircle size={18} className="success-icon" />
                      Working Proxies ({results.working.length})
                    </h3>
                    <div className="proxy-list">
                      {results.working.map((proxy, idx) => (
                        <div key={idx} className="proxy-item working">
                          <div className="proxy-status">
                            <CheckCircle size={16} />
                          </div>
                          <div className="proxy-info">
                            <div className="proxy-address">{proxy.proxy}</div>
                            {proxy.response && (
                              <div className="proxy-response">{proxy.response}</div>
                            )}
                          </div>
                          <div className="proxy-time">
                            <Clock size={14} />
                            {proxy.response_time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Proxies */}
                {results.failed.length > 0 && (
                  <div className="results-section">
                    <h3>
                      <XCircle size={18} className="error-icon" />
                      Failed Proxies ({results.failed.length})
                    </h3>
                    <div className="proxy-list">
                      {results.failed.map((proxy, idx) => (
                        <div key={idx} className="proxy-item failed">
                          <div className="proxy-status">
                            <XCircle size={16} />
                          </div>
                          <div className="proxy-info">
                            <div className="proxy-address">{proxy.proxy}</div>
                            <div className="proxy-error">
                              {proxy.status}
                              {proxy.response && ` - ${proxy.response}`}
                            </div>
                          </div>
                          <div className="proxy-time">
                            <Clock size={14} />
                            {proxy.response_time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results Yet */}
            {!results && !testing && !showHistory && (
              <div className="no-results">
                <Globe size={64} />
                <h3>Ready to Test Proxies</h3>
                <p>Load your proxies and click "Start Testing" to begin</p>
                <div className="instructions">
                  <h4>Instructions:</h4>
                  <ol>
                    <li>Add proxies to <code>server/proxies.txt</code> or import from URL</li>
                    <li>Click "Load Proxies" to load them</li>
                    <li>Configure test settings if needed</li>
                    <li>Click "Start Testing" to test all proxies</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Performance History */}
            {showHistory && (
              <div className="performance-history">
                <div className="history-header">
                  <h2>
                    <BarChart3 size={24} />
                    Performance History
                  </h2>
                  {performanceHistory.length > 0 && (
                    <button className="clear-history-btn" onClick={clearHistory}>
                      <X size={16} />
                      Clear History
                    </button>
                  )}
                </div>

                {performanceHistory.length > 0 ? (
                  <div className="history-list">
                    {performanceHistory.map((entry) => (
                      <div className="history-card" key={entry.id}>
                        <div className="history-card-header">
                          <div className="history-timestamp">
                            <Clock size={14} />
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                          <div className="history-url">{entry.testUrl}</div>
                        </div>

                        <div className="history-stats">
                          <div className="history-stat">
                            <div className="stat-label">Total Tested</div>
                            <div className="stat-value">{entry.totalTested}</div>
                          </div>
                          <div className="history-stat success">
                            <div className="stat-label">Working</div>
                            <div className="stat-value">{entry.workingCount}</div>
                          </div>
                          <div className="history-stat danger">
                            <div className="stat-label">Failed</div>
                            <div className="stat-value">{entry.failedCount}</div>
                          </div>
                          <div className="history-stat">
                            <div className="stat-label">Success Rate</div>
                            <div className="stat-value">{entry.successRate}%</div>
                          </div>
                          <div className="history-stat">
                            <div className="stat-label">Avg Response</div>
                            <div className="stat-value">{entry.avgResponseTime}</div>
                          </div>
                        </div>

                        <details className="history-details">
                          <summary>View Working Proxies ({entry.workingCount})</summary>
                          <div className="history-proxy-list">
                            {entry.workingProxies.map((proxy, idx) => (
                              <div className="history-proxy-item" key={idx}>
                                <span className="proxy-address">{proxy.proxy}</span>
                                <span className="proxy-time">{proxy.responseTime}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-history">
                    <TrendingUp size={48} />
                    <h3>No Performance History</h3>
                    <p>Test your proxies to start tracking performance over time</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Import from URL Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Proxies from URL</h2>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Enter a URL that contains a list of proxies (one per line). The proxies will be loaded into the tester.
              </p>
              <div className="form-field">
                <label>Proxy List URL</label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://example.com/proxies.txt"
                  autoFocus
                />
                <small>Format: http://user:pass@host:port or http://host:port</small>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowImportModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleImportFromUrl}
                  disabled={!importUrl || importing}
                >
                  <Upload size={16} />
                  {importing ? 'Importing...' : 'Import Proxies'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default ProxyTester
