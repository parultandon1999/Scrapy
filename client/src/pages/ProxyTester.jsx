import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Globe, CheckCircle, XCircle, Clock, AlertCircle, X,
  Play, FileText, Download, RefreshCw
} from 'lucide-react'
import * as api from '../services/api'
import '../styles/ProxyTester.css'

function ProxyTester({ darkMode, toggleDarkMode }) {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [testUrl, setTestUrl] = useState('https://httpbin.org/ip')
  const [concurrentTests, setConcurrentTests] = useState(5)
  const [proxies, setProxies] = useState([])
  const [loadingProxies, setLoadingProxies] = useState(false)

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
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to test proxies')
    } finally {
      setTesting(false)
    }
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

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="proxy-tester" />
      <div className="database-page">
        {/* Sidebar */}
        <aside className="db-sidebar">
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
              {loadingProxies ? 'Loading...' : 'Load Proxies'}
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
        <main className="db-main">
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
            {!results && !testing && (
              <div className="no-results">
                <Globe size={64} />
                <h3>Ready to Test Proxies</h3>
                <p>Load your proxies and click "Start Testing" to begin</p>
                <div className="instructions">
                  <h4>Instructions:</h4>
                  <ol>
                    <li>Add proxies to <code>server/proxies.txt</code></li>
                    <li>Click "Load Proxies" to load them</li>
                    <li>Configure test settings if needed</li>
                    <li>Click "Start Testing" to test all proxies</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default ProxyTester
