import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import {
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, X,
  Play, FileText, Download, RefreshCw, Link, TrendingUp, BarChart3, Upload,
  Shuffle, ArrowRight, Zap, FileJson
} from 'lucide-react'
import * as api from '../services/api'
import { 
  ProxyResultsSkeleton, 
  InlineButtonSkeleton 
} from '../components/mui/skeletons/SkeletonLoader'

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
    } catch {
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
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="proxy-tester" />
      
      {/* Main Container */}
      <div className="flex flex-1 flex-col pb-[70px] md:flex-row md:pb-0">
        
        {/* Sidebar */}
        <aside 
          className="fixed bottom-0 left-0 right-0 z-50 flex w-full flex-col border-t border-gray-200 bg-white/95 backdrop-blur-sm p-3 dark:border-neutral-800 dark:bg-neutral-950/95 md:sticky md:top-[68px] md:h-[calc(100vh-60px)] md:w-[220px] md:border-r md:border-t-0 md:p-0 md:bg-white md:shadow-none md:dark:bg-neutral-950"
          role="complementary" 
          aria-label="Proxy Tester navigation"
        >
          <h2 className="mb-4 hidden items-center gap-2 px-4 pt-4 text-base font-semibold text-gray-900 dark:text-gray-200 md:flex">
            <Globe size={20} /> Proxy Tester
          </h2>
          
          <div className="flex flex-row gap-2 overflow-x-auto p-1 md:flex-col md:overflow-visible md:px-3">
            {/* Proxies Loaded Card - Desktop */}
            <div className="hidden items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950 md:flex">
              <FileText size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Proxies Loaded</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{proxies.length}</div>
              </div>
            </div>

            {/* Results Summary - Desktop */}
            {results && (
              <>
                <div className="hidden items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3 dark:border-green-900/30 dark:bg-green-900/10 md:flex">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Working</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{results.working.length}</div>
                  </div>
                </div>

                <div className="hidden items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-900/10 md:flex">
                  <XCircle size={16} className="text-red-600 dark:text-red-400" />
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Failed</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{results.failed.length}</div>
                  </div>
                </div>
              </>
            )}

            <div className="my-2 hidden h-px bg-gray-200 dark:bg-neutral-800 md:block"></div>

            {/* Actions */}
            <button 
              onClick={loadProxiesList} 
              className="flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200 md:w-full md:justify-start"
              disabled={loadingProxies}
            >
              <RefreshCw size={16} className={loadingProxies ? "animate-spin" : ""} />
              {loadingProxies ? 'Loading...' : 'Load Proxies'}
            </button>

            <button 
              onClick={() => setShowImportModal(true)} 
              className="flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200 md:w-full md:justify-start"
            >
              <Link size={16} />
              Import URL
            </button>

            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200 md:w-full md:justify-start"
            >
              <TrendingUp size={16} />
              {showHistory ? 'Hide' : 'Show'} History
            </button>

            {results && results.working.length > 0 && (
              <button 
                onClick={downloadWorkingProxies} 
                className="flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-[13px] font-medium text-white transition-all hover:bg-blue-700 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400 md:w-full md:justify-start"
              >
                <Download size={16} />
                Download
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main id="main-content" className="flex-1 w-full overflow-y-auto bg-white p-4 dark:bg-black md:p-6" role="main">
          <Breadcrumb 
            items={[
              { label: 'Proxy Tester', icon: Globe },
              { label: showHistory ? 'Performance History' : 'Test Proxies' }
            ]}
          />
          
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
              <button onClick={() => setError(null)} className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/30"><X size={18} /></button>
            </div>
          )}

          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-6">
              <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                <Globe size={24} /> Test Proxy Servers
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Test your proxy list to identify working proxies and their response times
              </p>
            </div>

            {/* Test Configuration */}
            {!showHistory && (
              <div className="mb-8">
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-gray-200">Test Configuration</h3>
                  
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Test URL</label>
                      <input
                        type="text"
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        placeholder="https://httpbin.org/ip"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                        disabled={testing}
                      />
                      <small className="text-xs text-gray-500 dark:text-gray-400">URL to test proxy connectivity</small>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Concurrent Tests</label>
                      <input
                        type="number"
                        value={concurrentTests}
                        onChange={(e) => setConcurrentTests(parseInt(e.target.value) || 1)}
                        min="1"
                        max="20"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                        disabled={testing}
                      />
                      <small className="text-xs text-gray-500 dark:text-gray-400">Number of proxies to test simultaneously (1-20)</small>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Rotation Strategy</label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                            rotationStrategy === 'random' 
                              ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' 
                              : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                          }`}
                          onClick={() => setRotationStrategy('random')}
                          disabled={testing}
                        >
                          <Shuffle size={20} className={rotationStrategy === 'random' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
                          <div>
                            <div className={`text-sm font-semibold ${rotationStrategy === 'random' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-200'}`}>Random</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Randomly select</div>
                          </div>
                        </button>
                        <button
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                            rotationStrategy === 'round-robin' 
                              ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' 
                              : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                          }`}
                          onClick={() => setRotationStrategy('round-robin')}
                          disabled={testing}
                        >
                          <ArrowRight size={20} className={rotationStrategy === 'round-robin' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
                          <div>
                            <div className={`text-sm font-semibold ${rotationStrategy === 'round-robin' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-200'}`}>Round-robin</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Sequential order</div>
                          </div>
                        </button>
                        <button
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                            rotationStrategy === 'fastest-first' 
                              ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' 
                              : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                          }`}
                          onClick={() => setRotationStrategy('fastest-first')}
                          disabled={testing}
                        >
                          <Zap size={20} className={rotationStrategy === 'fastest-first' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
                          <div>
                            <div className={`text-sm font-semibold ${rotationStrategy === 'fastest-first' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-200'}`}>Fastest-first</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Prioritize speed</div>
                          </div>
                        </button>
                      </div>
                      <small className="text-xs text-gray-500 dark:text-gray-400">{getRotationStrategyDescription(rotationStrategy)}</small>
                    </div>

                    <button
                      onClick={handleTestProxies}
                      disabled={testing || proxies.length === 0}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
                    >
                      {testing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
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
            )}

            {/* Results */}
            {testing && !results && <ProxyResultsSkeleton />}
            {results && !showHistory && (
              <div className="flex flex-col gap-6">
                {/* Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                    <FileText size={24} className="text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">Total Tested</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">{results.total_tested}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
                    <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                    <div>
                      <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">Working</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">{results.working.length}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
                    <XCircle size={24} className="text-red-600 dark:text-red-400" />
                    <div>
                      <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">Failed</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">{results.failed.length}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                    <Globe size={24} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">
                        {((results.working.length / results.total_tested) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Actions */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200">Export Results</h4>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={exportToCSV} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-gray-200">
                      <FileText size={16} />
                      Export to CSV
                    </button>
                    <button onClick={exportToJSON} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-gray-200">
                      <FileJson size={16} />
                      Export to JSON
                    </button>
                    {results.working.length > 0 && (
                      <button onClick={downloadWorkingProxies} className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:text-black dark:hover:bg-green-400">
                        <Download size={16} />
                        Download Working (.txt)
                      </button>
                    )}
                  </div>
                </div>

                {/* Working Proxies */}
                {results.working.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                    <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200">
                      <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                      Working Proxies ({results.working.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                      {results.working.map((proxy, idx) => {
                        const trend = getProxyPerformanceTrend(proxy.proxy)
                        const hasTrend = trend.length > 1
                        
                        return (
                          <div key={idx} className="flex flex-col gap-3 rounded-lg border-l-[3px] border-l-green-500 border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <CheckCircle size={18} className="flex-shrink-0 text-green-600 dark:text-green-400" />
                              <div>
                                <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-200">{proxy.proxy}</div>
                                {proxy.response && (
                                  <div className="max-w-md truncate text-xs text-gray-500 dark:text-gray-400">{proxy.response}</div>
                                )}
                                {hasTrend && (
                                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                    <TrendingUp size={12} />
                                    <span>{trend.length} tests in history</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
                              <Clock size={14} />
                              {proxy.response_time}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Failed Proxies */}
                {results.failed.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                    <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200">
                      <XCircle size={18} className="text-red-600 dark:text-red-400" />
                      Failed Proxies ({results.failed.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                      {results.failed.map((proxy, idx) => (
                        <div key={idx} className="flex flex-col gap-3 rounded-lg border-l-[3px] border-l-red-500 border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <XCircle size={18} className="flex-shrink-0 text-red-600 dark:text-red-400" />
                            <div>
                              <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-200">{proxy.proxy}</div>
                              <div className="text-xs text-red-600 dark:text-red-400">
                                {proxy.status}
                                {proxy.response && ` - ${proxy.response}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
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
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                <Globe size={64} className="mb-5 opacity-50" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-200">Ready to Test Proxies</h3>
                <p className="mb-8 text-sm">Load your proxies and click "Start Testing" to begin</p>
                <div className="max-w-[500px] rounded-xl border border-gray-200 bg-white p-6 text-left dark:border-neutral-800 dark:bg-neutral-950">
                  <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-200">Instructions:</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Add proxies to <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-blue-600 dark:bg-neutral-800 dark:text-blue-400">server/proxies.txt</code> or import from URL</li>
                    <li>Click "Load Proxies" to load them</li>
                    <li>Configure test settings if needed</li>
                    <li>Click "Start Testing" to test all proxies</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Performance History */}
            {showHistory && (
              <div className="mt-8">
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-2.5 text-xl font-semibold text-gray-900 dark:text-gray-200">
                    <BarChart3 size={24} />
                    Performance History
                  </h2>
                  {performanceHistory.length > 0 && (
                    <button 
                      className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-black dark:text-red-400 dark:hover:bg-red-900/10" 
                      onClick={clearHistory}
                    >
                      <X size={16} />
                      Clear History
                    </button>
                  )}
                </div>

                {performanceHistory.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {performanceHistory.map((entry) => (
                      <div className="rounded-lg border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950" key={entry.id}>
                        <div className="mb-4 flex flex-col justify-between gap-2 border-b border-gray-200 pb-3 dark:border-neutral-800 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
                            <Clock size={16} />
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                          <div className="font-mono text-xs text-gray-500 dark:text-gray-400">{entry.testUrl}</div>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                          <div className="flex flex-col gap-1 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Tested</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{entry.totalTested}</div>
                          </div>
                          <div className="flex flex-col gap-1 rounded-md border-l-[3px] border-green-500 bg-green-50/50 p-3 dark:border-green-600 dark:bg-green-900/10">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Working</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{entry.workingCount}</div>
                          </div>
                          <div className="flex flex-col gap-1 rounded-md border-l-[3px] border-red-500 bg-red-50/50 p-3 dark:border-red-600 dark:bg-red-900/10">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Failed</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{entry.failedCount}</div>
                          </div>
                          <div className="flex flex-col gap-1 rounded-md border-l-[3px] border-blue-500 bg-blue-50 p-3 dark:border-blue-600 dark:bg-blue-900/10">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Success Rate</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{entry.successRate}%</div>
                          </div>
                          <div className="flex flex-col gap-1 rounded-md border-l-[3px] border-purple-500 bg-purple-50 p-3 dark:border-purple-600 dark:bg-purple-900/10">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Response</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-200">{entry.avgResponseTime}</div>
                          </div>
                        </div>

                        <details className="group">
                          <summary className="flex cursor-pointer select-none items-center justify-between rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30">
                            <span>View Working Proxies ({entry.workingCount})</span>
                          </summary>
                          <div className="mt-3 flex flex-col gap-2">
                            {entry.workingProxies.map((proxy, idx) => (
                              <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-xs dark:bg-neutral-900" key={idx}>
                                <span className="font-mono text-gray-900 dark:text-gray-200">{proxy.proxy}</span>
                                <span className="font-medium text-gray-600 dark:text-gray-400">{proxy.responseTime}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp size={48} className="mb-4 opacity-50" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">No Performance History</h3>
                    <p className="text-sm">Test your proxies to start tracking performance over time</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Import from URL Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200" onClick={() => setShowImportModal(false)}>
          <div className="flex max-h-[80vh] w-full max-w-[500px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 dark:bg-neutral-900 dark:border dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Import Proxies from URL</h2>
              <button className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-gray-200" onClick={() => setShowImportModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                Enter a URL that contains a list of proxies (one per line). The proxies will be loaded into the tester.
              </p>
              <div className="mb-6 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Proxy List URL</label>
                <input
                  type="url"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-black dark:text-gray-200 dark:focus:border-blue-500"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://example.com/proxies.txt"
                  autoFocus
                />
                <small className="text-xs text-gray-500 dark:text-gray-400">Format: http://user:pass@host:port or http://host:port</small>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  className="rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700" 
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400" 
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

      {/* <Footer /> */}
    </div>
  )
}

export default ProxyTester