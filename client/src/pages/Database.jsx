import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import { 
  LayoutDashboard, FileText, FolderOpen, Package, 
  HardDrive, Link2, Search, Download, ChevronLeft, 
  ChevronRight, X, ExternalLink, File, CheckCircle, 
  XCircle, Database as DatabaseIcon, TrendingUp, Hash,
  BarChart3, PieChart, Activity, GitCompare,
  Calendar, Layers, AlertCircle, Clock, Globe
} from 'lucide-react'
import * as api from '../services/api'
import { 
  DatabaseTableSkeleton, 
  DatabaseDashboardSkeleton,
  DatabasePagesSkeleton,
  DatabaseFilesSkeleton,
  DatabaseAnalyticsSkeleton,
  ConfigSectionSkeleton 
} from '../components/mui/skeletons/SkeletonLoader'
import '../styles/Database.css'
import { useToast } from '../components/mui/toasts/useToast'

function Database({ darkMode, toggleDarkMode }) {
  const toast = useToast()
  const [activeView, setActiveView] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [pages, setPages] = useState([])
  const [files, setFiles] = useState([])
  const [filesByExtension, setFilesByExtension] = useState([])
  const [largestDownloads, setLargestDownloads] = useState([])
  const [topLinks, setTopLinks] = useState([])
  const [pageDetails, setPageDetails] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('content')
  const [linkType, setLinkType] = useState('internal')
  const [fileStatus, setFileStatus] = useState('all')
  const [pageLimit, setPageLimit] = useState(20)
  const [pageOffset, setPageOffset] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  const [timeline, setTimeline] = useState([])
  const [domains, setDomains] = useState([])
  const [depthDistribution, setDepthDistribution] = useState([])
  const [fileAnalytics, setFileAnalytics] = useState([])
  const [linkAnalysis, setLinkAnalysis] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [performanceAnalytics, setPerformanceAnalytics] = useState(null)
  const [fingerprintAnalytics, setFingerprintAnalytics] = useState(null)
  const [geolocationAnalytics, setGeolocationAnalytics] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [hoveredChartItem, setHoveredChartItem] = useState(null)
  const [chartTypes, setChartTypes] = useState({
    depth: 'bar',
    fileType: 'bar'
  })

  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchDashboardData()
    } else if (activeView === 'pages') {
      fetchPages()
    } else if (activeView === 'files') {
      fetchFiles()
    } else if (activeView === 'files-by-ext') {
      fetchFilesByExtension()
    } else if (activeView === 'largest-downloads') {
      fetchLargestDownloads(10)
    } else if (activeView === 'top-links') {
      fetchTopLinks(linkType, 20)
    } else if (activeView === 'analytics') {
      fetchAnalytics()
    } else if (activeView === 'timeline') {
      fetchTimeline()
    } else if (activeView === 'domains') {
      fetchDomains()
    } else if (activeView === 'link-analysis') {
      fetchLinkAnalysis()
    } else if (activeView === 'performance') {
      fetchPerformanceAnalytics()
    } else if (activeView === 'fingerprints') {
      fetchFingerprintAnalytics()
    } else if (activeView === 'geolocation') {
      fetchGeolocationAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, pageLimit, pageOffset, linkType, fileStatus])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchFilesByExtension(),
        fetchLargestDownloads(5),
        fetchTopLinks('internal', 5)
      ])
    } catch {
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await api.getStats()
      setStats(data)
    } catch {
      console.error('Failed to load stats')
    }
  }

  const fetchPages = async () => {
    try {
      setLoading(true)
      const data = await api.getPages(pageLimit, pageOffset)
      setPages(data.pages)
      setTotalPages(data.total)
    } catch {
      setError('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const data = await api.getFileAssets(50, fileStatus === 'all' ? null : fileStatus)
      setFiles(data.files)
    } catch {
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilesByExtension = async () => {
    try {
      const data = await api.getFilesByExtension()
      setFilesByExtension(data.files_by_extension || [])
    } catch {
      console.error('Failed to load files by extension')
    }
  }

  const fetchLargestDownloads = async (limit) => {
    try {
      const data = await api.getLargestDownloads(limit)
      setLargestDownloads(data.largest_downloads || [])
    } catch {
      console.error('Failed to load largest downloads')
    }
  }

  const fetchTopLinks = async (type, limit) => {
    try {
      const data = await api.getTopLinks(type, limit)
      setTopLinks(data.top_links || [])
    } catch {
      console.error('Failed to load top links')
    }
  }

  const fetchPageDetails = async (pageId) => {
    try {
      setLoading(true)
      const data = await api.getPageDetails(pageId)
      setPageDetails(data)
      setActiveView('page-details')
    } catch {
      setError('Failed to load page details')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setError(null)
      const data = searchType === 'content' 
        ? await api.searchContent(searchQuery, 50)
        : await api.searchFiles(searchQuery, 50)
      
      setSearchResults(data)
      setActiveView('search')
    } catch {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      const data = await api.exportData()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scraped_data_export_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const data = await api.getScrapingTimeline()
      setTimeline(data.timeline || [])
    } catch {
      setError('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const fetchDomains = async () => {
    try {
      setLoading(true)
      const data = await api.getDomainStatistics()
      setDomains(data.domains || [])
    } catch {
      setError('Failed to load domains')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [depthData, fileData] = await Promise.all([
        api.getDepthDistribution(),
        api.getFileTypeAnalytics()
      ])
      setDepthDistribution(depthData.depth_distribution || [])
      setFileAnalytics(fileData.file_analytics || [])
    } catch {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const fetchLinkAnalysis = async () => {
    try {
      setLoading(true)
      const data = await api.getLinkAnalysis()
      setLinkAnalysis(data)
    } catch {
      setError('Failed to load link analysis')
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformanceAnalytics = async () => {
    try {
      setLoading(true)
      const data = await api.getPerformanceAnalytics()
      setPerformanceAnalytics(data)
    } catch {
      setError('Failed to load performance analytics')
    } finally {
      setLoading(false)
    }
  }

  const fetchFingerprintAnalytics = async () => {
    try {
      setLoading(true)
      const data = await api.getFingerprintAnalytics()
      setFingerprintAnalytics(data)
    } catch {
      setError('Failed to load fingerprint analytics')
    } finally {
      setLoading(false)
    }
  }

  const fetchGeolocationAnalytics = async () => {
    try {
      setLoading(true)
      const data = await api.getGeolocationAnalytics()
      setGeolocationAnalytics(data)
    } catch {
      setError('Failed to load geolocation analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPages.length === 0) return
    if (!confirm(`Delete ${selectedPages.length} selected pages?`)) return
    
    try {
      setLoading(true)
      const data = await api.bulkDeletePages(selectedPages)
      setSelectedPages([])
      fetchPages()
      toast.success(`Deleted ${data.deleted_count} pages`)
    } catch {
      setError('Failed to delete pages')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkExport = async () => {
    if (selectedPages.length === 0) return
    
    try {
      setLoading(true)
      const data = await api.exportData()
      
      // Filter to only selected pages
      const filteredData = {
        ...data,
        pages: data.pages.filter(p => selectedPages.includes(p.id))
      }
      
      const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `selected_pages_export_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export selected pages')
    } finally {
      setLoading(false)
    }
  }

  const togglePageSelection = (pageId) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([])
    } else {
      setSelectedPages(pages.map(p => p.id))
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (activeView === 'dashboard') {
        await fetchDashboardData()
      } else if (activeView === 'pages') {
        await fetchPages()
      } else if (activeView === 'files') {
        await fetchFiles()
      } else if (activeView === 'files-by-ext') {
        await fetchFilesByExtension()
      } else if (activeView === 'largest-downloads') {
        await fetchLargestDownloads(10)
      } else if (activeView === 'top-links') {
        await fetchTopLinks(linkType, 20)
      } else if (activeView === 'analytics') {
        await fetchAnalytics()
      } else if (activeView === 'timeline') {
        await fetchTimeline()
      } else if (activeView === 'domains') {
        await fetchDomains()
      } else if (activeView === 'link-analysis') {
        await fetchLinkAnalysis()
      } else if (activeView === 'performance') {
        await fetchPerformanceAnalytics()
      } else if (activeView === 'fingerprints') {
        await fetchFingerprintAnalytics()
      } else if (activeView === 'geolocation') {
        await fetchGeolocationAnalytics()
      }
    } catch {
      setError('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDateRangeFilter = async () => {
    if (!dateRange.startDate && !dateRange.endDate) {
      // If no dates selected, just refresh normally
      await handleRefresh()
      return
    }

    try {
      setLoading(true)
      const data = await api.filterPages({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: pageLimit,
        offset: pageOffset
      })
      setPages(data.pages)
      setTotalPages(data.total)
    } catch {
      setError('Failed to filter by date range')
    } finally {
      setLoading(false)
    }
  }

  const clearDateRange = () => {
    setDateRange({ startDate: '', endDate: '' })
    fetchPages()
  }

  const exportChartData = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatBytes = (bytes) => {
    return api.formatBytes(bytes)
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="database" />
      <div className="database-page">
      {/* Sidebar Navigation */}
      <aside className="db-sidebar" role="complementary" aria-label="Database navigation">
        <h2><DatabaseIcon size={20} /> Database</h2>
        <nav className="db-nav" aria-label="Database sections">
          <button 
            className={`db-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button 
            className={`db-nav-item ${activeView === 'pages' ? 'active' : ''}`}
            onClick={() => setActiveView('pages')}
          >
            <FileText size={18} />
            Pages
          </button>
          <button 
            className={`db-nav-item ${activeView === 'files' ? 'active' : ''}`}
            onClick={() => setActiveView('files')}
          >
            <FolderOpen size={18} />
            Files
          </button>
          <button 
            className={`db-nav-item ${activeView === 'files-by-ext' ? 'active' : ''}`}
            onClick={() => setActiveView('files-by-ext')}
          >
            <Package size={18} />
            By Type
          </button>
          <button 
            className={`db-nav-item ${activeView === 'largest-downloads' ? 'active' : ''}`}
            onClick={() => setActiveView('largest-downloads')}
          >
            <HardDrive size={18} />
            Largest
          </button>
          <button 
            className={`db-nav-item ${activeView === 'top-links' ? 'active' : ''}`}
            onClick={() => setActiveView('top-links')}
          >
            <Link2 size={18} />
            Links
          </button>
          <button 
            className={`db-nav-item ${activeView === 'search' ? 'active' : ''}`}
            onClick={() => setActiveView('search')}
          >
            <Search size={18} />
            Search
          </button>
          
          <div className="nav-divider"></div>
          
          <button 
            className={`db-nav-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <BarChart3 size={18} />
            Analytics
          </button>
          <button 
            className={`db-nav-item ${activeView === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveView('timeline')}
          >
            <Activity size={18} />
            Timeline
          </button>
          <button 
            className={`db-nav-item ${activeView === 'domains' ? 'active' : ''}`}
            onClick={() => setActiveView('domains')}
          >
            <Layers size={18} />
            Domains
          </button>
          <button 
            className={`db-nav-item ${activeView === 'link-analysis' ? 'active' : ''}`}
            onClick={() => setActiveView('link-analysis')}
          >
            <AlertCircle size={18} />
            Link Analysis
          </button>
          <button 
            className={`db-nav-item ${activeView === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveView('performance')}
          >
            <TrendingUp size={18} />
            Performance
          </button>
          <button 
            className={`db-nav-item ${activeView === 'fingerprints' ? 'active' : ''}`}
            onClick={() => setActiveView('fingerprints')}
          >
            <Hash size={18} />
            Fingerprints
          </button>
          <button 
            className={`db-nav-item ${activeView === 'geolocation' ? 'active' : ''}`}
            onClick={() => setActiveView('geolocation')}
          >
            <GitCompare size={18} />
            Geolocation
          </button>
        </nav>
        
        <div className="db-actions">
          <button onClick={handleExportData} className="export-btn" disabled={loading}>
            <Download size={16} />
            Export Data
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="db-main" role="main">
        <Breadcrumb 
          items={[
            { label: 'Database', icon: DatabaseIcon, path: '/database' },
            { label: activeView === 'dashboard' ? 'Overview' : 
                     activeView === 'pages' ? 'Pages' :
                     activeView === 'files' ? 'Files' :
                     activeView === 'files-by-ext' ? 'By Type' :
                     activeView === 'largest-downloads' ? 'Largest' :
                     activeView === 'top-links' ? 'Links' :
                     activeView === 'search' ? 'Search' :
                     activeView === 'analytics' ? 'Analytics' :
                     activeView === 'timeline' ? 'Timeline' :
                     activeView === 'domains' ? 'Domains' :
                     activeView === 'link-analysis' ? 'Link Analysis' :
                     activeView === 'performance' ? 'Performance' :
                     activeView === 'fingerprints' ? 'Fingerprints' :
                     activeView === 'geolocation' ? 'Geolocation' :
                     activeView === 'page-details' ? 'Page Details' : 'View'
            }
          ]}
        />
        
        {error && (
          <div className="db-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}

        {loading && activeView === 'dashboard' && <DatabaseDashboardSkeleton />}
        {loading && activeView === 'pages' && <DatabasePagesSkeleton />}
        {loading && activeView === 'files' && <DatabaseFilesSkeleton />}
        {loading && activeView === 'files-by-ext' && <DatabaseFilesSkeleton />}
        {loading && activeView === 'largest-downloads' && <DatabaseFilesSkeleton count={5} />}
        {loading && activeView === 'top-links' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'analytics' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'timeline' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'domains' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'link-analysis' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'performance' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'fingerprints' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'geolocation' && <DatabaseAnalyticsSkeleton />}
        {loading && activeView === 'page-details' && <DatabasePagesSkeleton count={1} />}
        {loading && activeView === 'search' && <DatabasePagesSkeleton />}

        {/* Dashboard View */}
        {activeView === 'dashboard' && stats && (
          <div className="dashboard-view">
            <h1>Overview</h1>
            
            {/* Quick Stats Summary Cards */}
            <div className="quick-stats-grid">
              <div className="quick-stat-card highlight">
                <div className="quick-stat-icon">
                  <HardDrive size={32} />
                </div>
                <div className="quick-stat-content">
                  <div className="quick-stat-label">Total Storage Used</div>
                  <div className="quick-stat-value">
                    {(stats.total_download_size_mb || 0).toFixed(2)} MB
                  </div>
                  <div className="quick-stat-detail">
                    {stats.total_file_assets || 0} files downloaded
                  </div>
                </div>
              </div>

              <div className="quick-stat-card">
                <div className="quick-stat-icon">
                  <Clock size={32} />
                </div>
                <div className="quick-stat-content">
                  <div className="quick-stat-label">Avg Scrape Time</div>
                  <div className="quick-stat-value">
                    {stats.avg_scrape_time ? `${stats.avg_scrape_time.toFixed(1)}s` : 'N/A'}
                  </div>
                  <div className="quick-stat-detail">
                    Per page average
                  </div>
                </div>
              </div>

              <div className="quick-stat-card success">
                <div className="quick-stat-icon">
                  <CheckCircle size={32} />
                </div>
                <div className="quick-stat-content">
                  <div className="quick-stat-label">Success Rate</div>
                  <div className="quick-stat-value">
                    {stats.total_file_assets > 0 
                      ? ((stats.successful_downloads / stats.total_file_assets) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <div className="quick-stat-detail">
                    {stats.successful_downloads || 0} of {stats.total_file_assets || 0} files
                  </div>
                </div>
              </div>

              <div className="quick-stat-card">
                <div className="quick-stat-icon">
                  <Globe size={32} />
                </div>
                <div className="quick-stat-content">
                  <div className="quick-stat-label">Most Scraped Domain</div>
                  <div className="quick-stat-value domain-value">
                    {stats.most_scraped_domain || 'N/A'}
                  </div>
                  <div className="quick-stat-detail">
                    {stats.most_scraped_domain_count || 0} pages
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Stats Grid */}
            <div className="stats-grid-compact">
              <div className="stat-card-compact">
                <FileText size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Pages</div>
                  <div className="stat-value">{stats.total_pages || 0}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <Link2 size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Links</div>
                  <div className="stat-value">{stats.total_links || 0}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <TrendingUp size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Internal</div>
                  <div className="stat-value">{stats.internal_links || 0}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <ExternalLink size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">External</div>
                  <div className="stat-value">{stats.external_links || 0}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <Package size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Files</div>
                  <div className="stat-value">{stats.total_file_assets || 0}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <CheckCircle size={20} className="stat-icon-compact success" />
                <div>
                  <div className="stat-label">Downloaded</div>
                  <div className="stat-value">{stats.successful_downloads || 0}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <XCircle size={20} className="stat-icon-compact danger" />
                <div>
                  <div className="stat-label">Failed</div>
                  <div className="stat-value">{stats.failed_downloads || 0}</div>
                </div>
              </div>
              <div className="stat-card-compact">
                <HardDrive size={20} className="stat-icon-compact" />
                <div>
                  <div className="stat-label">Total Size</div>
                  <div className="stat-value">{(stats.total_download_size_mb || 0).toFixed(1)} MB</div>
                </div>
              </div>
            </div>

            {/* Compact Widgets */}
            <div className="widgets-compact">
              <div className="widget-compact">
                <div className="widget-header-compact">
                  <h3><Package size={16} /> Files by Type</h3>
                  <button onClick={() => setActiveView('files-by-ext')} className="widget-link-compact">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="widget-list">
                  {filesByExtension.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="widget-list-item">
                      <span className="file-badge-compact">{item.file_extension}</span>
                      <div className="widget-bar-compact">
                        <div 
                          className="widget-bar-fill-compact" 
                          style={{width: `${(item.count / filesByExtension[0]?.count * 100) || 0}%`}}
                        ></div>
                      </div>
                      <span className="widget-count-compact">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="widget-compact">
                <div className="widget-header-compact">
                  <h3><HardDrive size={16} /> Largest Files</h3>
                  <button onClick={() => setActiveView('largest-downloads')} className="widget-link-compact">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="widget-list">
                  {largestDownloads.map((file, idx) => (
                    <div key={idx} className="widget-list-item">
                      <File size={14} className="file-icon-compact" />
                      <span className="widget-filename-compact">{file.file_name}</span>
                      <span className="widget-size-compact">{formatBytes(file.file_size_bytes)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="widget-compact">
                <div className="widget-header-compact">
                  <h3><Link2 size={16} /> Top Links</h3>
                  <button onClick={() => setActiveView('top-links')} className="widget-link-compact">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="widget-list">
                  {topLinks.map((link, idx) => (
                    <div key={idx} className="widget-list-item">
                      <span className="widget-url-compact">{link.url.substring(0, 40)}...</span>
                      <span className="frequency-badge-compact"><Hash size={12} />{link.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pages View */}
        {activeView === 'pages' && !loading && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><FileText size={24} /> Pages ({totalPages})</h1>
              <div className="view-controls-compact">
                <button 
                  onClick={handleRefresh} 
                  className="refresh-btn-compact"
                  disabled={isRefreshing}
                  title="Refresh data"
                >
                  <Activity size={16} className={isRefreshing ? 'spinning' : ''} />
                </button>
                <select value={pageLimit} onChange={(e) => setPageLimit(Number(e.target.value))} className="control-select-compact">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <button onClick={() => setPageOffset(Math.max(0, pageOffset - pageLimit))} disabled={pageOffset === 0} className="control-btn-compact">
                  <ChevronLeft size={16} />
                </button>
                <span className="page-info-compact">{pageOffset + 1}-{Math.min(pageOffset + pageLimit, totalPages)}</span>
                <button onClick={() => setPageOffset(pageOffset + pageLimit)} disabled={pageOffset + pageLimit >= totalPages} className="control-btn-compact">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="date-range-filter">
              <div className="date-filter-inputs">
                <div className="date-input-group">
                  <Calendar size={16} />
                  <label>From:</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <Calendar size={16} />
                  <label>To:</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="date-input"
                  />
                </div>
                <button onClick={handleDateRangeFilter} className="filter-apply-btn">
                  <Search size={16} />
                  Apply Filter
                </button>
                {(dateRange.startDate || dateRange.endDate) && (
                  <button onClick={clearDateRange} className="filter-clear-btn">
                    <X size={16} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedPages.length > 0 && (
              <div className="bulk-actions-toolbar">
                <div className="bulk-actions-info">
                  <CheckCircle size={16} />
                  <span>{selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected</span>
                </div>
                <div className="bulk-actions-buttons">
                  <button onClick={handleBulkExport} className="bulk-action-btn export">
                    <Download size={16} />
                    Export Selected
                  </button>
                  <button onClick={handleBulkDelete} className="bulk-action-btn delete">
                    <X size={16} />
                    Delete Selected
                  </button>
                  <button onClick={() => setSelectedPages([])} className="bulk-action-btn cancel">
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            <div className="data-table-compact">
              <table>
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedPages.length === pages.length && pages.length > 0}
                        onChange={toggleSelectAll}
                        className="page-checkbox"
                      />
                    </th>
                    <th>URL</th>
                    <th>Title</th>
                    <th>Depth</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className={selectedPages.includes(page.id) ? 'selected-row' : ''}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(page.id)}
                          onChange={() => togglePageSelection(page.id)}
                          className="page-checkbox"
                        />
                      </td>
                      <td className="url-cell-compact">
                        <a href={page.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} /> {page.url}
                        </a>
                      </td>
                      <td>{page.title || 'No title'}</td>
                      <td><span className="depth-badge-compact">D{page.depth}</span></td>
                      <td className="date-cell-compact">{page.scraped_at}</td>
                      <td><button onClick={() => fetchPageDetails(page.id)} className="action-btn-compact">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Files View */}
        {activeView === 'files' && !loading && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><FolderOpen size={24} /> Files</h1>
              <div className="view-controls-compact">
                <select value={fileStatus} onChange={(e) => setFileStatus(e.target.value)} className="control-select-compact">
                  <option value="all">All</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="data-table-compact">
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, idx) => (
                    <tr key={idx}>
                      <td className="file-cell-compact">
                        <File size={14} /> {file.file_name}
                      </td>
                      <td><span className="file-badge-compact">{file.file_extension}</span></td>
                      <td className="size-cell-compact">{formatBytes(file.file_size_bytes)}</td>
                      <td>
                        {file.download_status === 'success' ? (
                          <span className="status-badge-compact success"><CheckCircle size={12} /> Success</span>
                        ) : (
                          <span className="status-badge-compact failed"><XCircle size={12} /> Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Files by Extension View */}
        {activeView === 'files-by-ext' && !loading && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><Package size={24} /> Files by Type</h1>
            </div>
            <div className="data-table-compact">
              <table>
                <thead>
                  <tr>
                    <th>Extension</th>
                    <th>Count</th>
                    <th>Total Size</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filesByExtension.map((item, idx) => (
                    <tr key={idx}>
                      <td><span className="file-badge-compact">{item.file_extension}</span></td>
                      <td className="count-cell-compact">{item.count}</td>
                      <td className="size-cell-compact">{(item.total_size / (1024 * 1024)).toFixed(2)} MB</td>
                      <td>
                        {item.download_status === 'success' ? (
                          <span className="status-badge-compact success"><CheckCircle size={12} /> Success</span>
                        ) : (
                          <span className="status-badge-compact failed"><XCircle size={12} /> Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Largest Downloads View */}
        {activeView === 'largest-downloads' && !loading && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><HardDrive size={24} /> Largest Files</h1>
            </div>
            <div className="data-table-compact">
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {largestDownloads.map((file, idx) => (
                    <tr key={idx}>
                      <td className="file-cell-compact">
                        <File size={14} /> {file.file_name}
                      </td>
                      <td><span className="file-badge-compact">{file.file_extension}</span></td>
                      <td className="size-cell-compact highlight">{formatBytes(file.file_size_bytes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Links View */}
        {activeView === 'top-links' && !loading && (
          <div className="list-view">
            <div className="view-header-compact">
              <h1><Link2 size={24} /> Top Links</h1>
              <div className="view-controls-compact">
                <select value={linkType} onChange={(e) => setLinkType(e.target.value)} className="control-select-compact">
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>
            </div>
            <div className="data-table-compact">
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link, idx) => (
                    <tr key={idx}>
                      <td className="url-cell-compact">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} /> {link.url}
                        </a>
                      </td>
                      <td><span className="frequency-badge-compact"><Hash size={12} />{link.frequency}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Search View */}
        {activeView === 'search' && (
          <div className="search-view">
            <div className="view-header-compact">
              <h1><Search size={24} /> Search</h1>
              <button 
                onClick={handleRefresh} 
                className="refresh-btn-compact"
                disabled={isRefreshing}
                title="Refresh data"
              >
                <Activity size={16} className={isRefreshing ? 'spinning' : ''} />
              </button>
            </div>
            <form onSubmit={handleSearch} className="search-form-compact">
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="search-select-compact">
                <option value="content">Content</option>
                <option value="files">Files</option>
              </select>
              <input
                type="text"
                placeholder={`Search ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-compact"
              />
              <button type="submit" className="search-btn-compact" disabled={loading}>
                <Search size={16} /> Search
              </button>
            </form>

            {searchResults && (
              <div className="search-results-compact">
                <div className="search-results-header">
                  <h3>Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchResults.keyword}"</h3>
                </div>
                {searchResults.results.length > 0 ? (
                  <div className="results-list-compact">
                    {searchResults.results.map((result, idx) => (
                      <div className="result-card-compact" key={idx}>
                        {result.title && <h4><FileText size={16} /> {result.title}</h4>}
                        {result.file_name && <h4><File size={16} /> {result.file_name}</h4>}
                        {result.url && (
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} /> {result.url}
                          </a>
                        )}
                        {result.page_url && (
                          <a href={result.page_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} /> {result.page_url}
                          </a>
                        )}
                        {result.preview && <p className="result-preview-compact">{result.preview}...</p>}
                        {result.file_extension && <span className="file-badge-compact">{result.file_extension}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-results-compact">No results found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Page Details View */}
        {activeView === 'page-details' && pageDetails && !loading && (
          <div className="details-view">
            <div className="view-header-compact">
              <h1><FileText size={24} /> Page Details</h1>
              <button onClick={() => setActiveView('pages')} className="back-btn-compact">
                <ChevronLeft size={16} /> Back
              </button>
            </div>
            
            <div className="details-grid-compact">
              <div className="detail-section-compact">
                <h3>Information</h3>
                <div className="detail-items-compact">
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">URL:</span>
                    <a href={pageDetails.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} /> {pageDetails.url}
                    </a>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Title:</span>
                    <span>{pageDetails.title || 'No title'}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Depth:</span>
                    <span className="depth-badge-compact">D{pageDetails.depth}</span>
                  </div>
                  <div className="detail-row-compact">
                    <span className="detail-label-compact">Date:</span>
                    <span>{new Date(pageDetails.timestamp * 1000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {pageDetails.headers && pageDetails.headers.length > 0 && (
                <div className="detail-section-compact">
                  <h3>Headers ({pageDetails.headers.length})</h3>
                  <div className="headers-list-compact">
                    {pageDetails.headers.slice(0, 5).map((header, idx) => (
                      <div key={idx} className="header-item-compact">
                        <span className="header-type-compact">{header.header_type}</span>
                        <span>{header.header_text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pageDetails.links && pageDetails.links.length > 0 && (
                <div className="detail-section-compact">
                  <h3>Links ({pageDetails.links.length})</h3>
                  <div className="links-summary-compact">
                    <span><TrendingUp size={14} /> Internal: {pageDetails.links.filter(l => l.link_type === 'internal').length}</span>
                    <span><ExternalLink size={14} /> External: {pageDetails.links.filter(l => l.link_type === 'external').length}</span>
                  </div>
                </div>
              )}

              {pageDetails.file_assets && pageDetails.file_assets.length > 0 && (
                <div className="detail-section-compact">
                  <h3>Files ({pageDetails.file_assets.length})</h3>
                  <div className="files-list-compact">
                    {pageDetails.file_assets.map((file, idx) => (
                      <div key={idx} className="file-item-compact">
                        <File size={14} />
                        <span className="file-badge-compact">{file.file_extension}</span>
                        <span className="file-name-compact">{file.file_name}</span>
                        {file.download_status === 'success' ? (
                          <CheckCircle size={14} className="success-icon" />
                        ) : (
                          <XCircle size={14} className="error-icon" />
                        )}
                        <span className="file-size-compact">{formatBytes(file.file_size_bytes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && !loading && (
          <div className="analytics-view">
            <div className="view-header-compact">
              <h1><BarChart3 size={24} /> Analytics</h1>
              <div className="view-controls-compact">
                <button 
                  onClick={handleRefresh} 
                  className="refresh-btn-compact"
                  disabled={isRefreshing}
                  title="Refresh data"
                >
                  <Activity size={16} className={isRefreshing ? 'spinning' : ''} />
                </button>
                <button 
                  onClick={() => exportChartData({ depthDistribution, fileAnalytics }, 'analytics')}
                  className="export-chart-btn"
                  title="Export chart data"
                >
                  <Download size={16} />
                  Export Data
                </button>
              </div>
            </div>
            
            <div className="analytics-grid">
              {/* Depth Distribution Chart */}
              <div className="analytics-card">
                <div className="chart-header">
                  <h3><Layers size={18} /> Depth Distribution</h3>
                  <div className="chart-controls">
                    <div className="chart-type-toggle">
                      <button 
                        className={`chart-type-btn ${chartTypes.depth === 'bar' ? 'active' : ''}`}
                        onClick={() => setChartTypes(prev => ({ ...prev, depth: 'bar' }))}
                        title="Bar Chart"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button 
                        className={`chart-type-btn ${chartTypes.depth === 'pie' ? 'active' : ''}`}
                        onClick={() => setChartTypes(prev => ({ ...prev, depth: 'pie' }))}
                        title="Pie Chart"
                      >
                        <PieChart size={16} />
                      </button>
                      <button 
                        className={`chart-type-btn ${chartTypes.depth === 'line' ? 'active' : ''}`}
                        onClick={() => setChartTypes(prev => ({ ...prev, depth: 'line' }))}
                        title="Line Chart"
                      >
                        <Activity size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => exportChartData(depthDistribution, 'depth_distribution')}
                      className="chart-export-btn"
                      title="Export this chart"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                {/* Bar Chart */}
                {chartTypes.depth === 'bar' && (
                  <div className="chart-container" id="depth-chart">
                    {depthDistribution.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="chart-bar-item interactive"
                        onMouseEnter={() => setHoveredChartItem({ type: 'depth', data: item })}
                        onMouseLeave={() => setHoveredChartItem(null)}
                      >
                        <span className="chart-label">Depth {item.depth}</span>
                        <div className="chart-bar-bg">
                          <div 
                            className="chart-bar-fill"
                            style={{width: `${(item.page_count / Math.max(...depthDistribution.map(d => d.page_count))) * 100}%`}}
                          ></div>
                        </div>
                        <span className="chart-value">{item.page_count}</span>
                        {hoveredChartItem?.type === 'depth' && hoveredChartItem?.data.depth === item.depth && (
                          <div className="chart-tooltip">
                            <strong>Depth {item.depth}</strong>
                            <div>Pages: {item.page_count}</div>
                            <div>Percentage: {((item.page_count / depthDistribution.reduce((sum, d) => sum + d.page_count, 0)) * 100).toFixed(1)}%</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pie Chart */}
                {chartTypes.depth === 'pie' && (
                  <div className="pie-chart-container">
                    <svg viewBox="0 0 200 200" className="pie-chart">
                      {(() => {
                        const total = depthDistribution.reduce((sum, d) => sum + d.page_count, 0)
                        let currentAngle = -90
                        const colors = ['#1a73e8', '#4285f4', '#8ab4f8', '#aecbfa', '#d2e3fc', '#e8f0fe']
                        
                        return depthDistribution.map((item, idx) => {
                          const percentage = (item.page_count / total) * 100
                          const angle = (percentage / 100) * 360
                          const startAngle = currentAngle
                          const endAngle = currentAngle + angle
                          currentAngle = endAngle

                          const startRad = (startAngle * Math.PI) / 180
                          const endRad = (endAngle * Math.PI) / 180
                          const x1 = 100 + 80 * Math.cos(startRad)
                          const y1 = 100 + 80 * Math.sin(startRad)
                          const x2 = 100 + 80 * Math.cos(endRad)
                          const y2 = 100 + 80 * Math.sin(endRad)
                          const largeArc = angle > 180 ? 1 : 0

                          return (
                            <g 
                              key={idx}
                              onMouseEnter={() => setHoveredChartItem({ type: 'depth', data: item })}
                              onMouseLeave={() => setHoveredChartItem(null)}
                              className="pie-slice"
                            >
                              <path
                                d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={colors[idx % colors.length]}
                                stroke="#fff"
                                strokeWidth="2"
                              />
                            </g>
                          )
                        })
                      })()}
                    </svg>
                    <div className="pie-legend">
                      {depthDistribution.map((item, idx) => {
                        const colors = ['#1a73e8', '#4285f4', '#8ab4f8', '#aecbfa', '#d2e3fc', '#e8f0fe']
                        const total = depthDistribution.reduce((sum, d) => sum + d.page_count, 0)
                        return (
                          <div key={idx} className="legend-item">
                            <span className="legend-color" style={{ background: colors[idx % colors.length] }}></span>
                            <span className="legend-label">Depth {item.depth}</span>
                            <span className="legend-value">{item.page_count} ({((item.page_count / total) * 100).toFixed(1)}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Line Chart */}
                {chartTypes.depth === 'line' && (
                  <div className="line-chart-container">
                    <svg viewBox="0 0 400 200" className="line-chart">
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const maxValue = Math.max(...depthDistribution.map(d => d.page_count))
                        const points = depthDistribution.map((item, idx) => {
                          const x = (idx / (depthDistribution.length - 1)) * 360 + 20
                          const y = 180 - ((item.page_count / maxValue) * 160)
                          return `${x},${y}`
                        }).join(' ')
                        
                        const areaPoints = `20,180 ${points} ${360 + 20},180`

                        return (
                          <>
                            <polyline
                              points={areaPoints}
                              fill="url(#lineGradient)"
                              stroke="none"
                            />
                            <polyline
                              points={points}
                              fill="none"
                              stroke="#1a73e8"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {depthDistribution.map((item, idx) => {
                              const x = (idx / (depthDistribution.length - 1)) * 360 + 20
                              const y = 180 - ((item.page_count / maxValue) * 160)
                              return (
                                <circle
                                  key={idx}
                                  cx={x}
                                  cy={y}
                                  r="5"
                                  fill="#1a73e8"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  className="line-point"
                                  onMouseEnter={() => setHoveredChartItem({ type: 'depth', data: item })}
                                  onMouseLeave={() => setHoveredChartItem(null)}
                                />
                              )
                            })}
                          </>
                        )
                      })()}
                    </svg>
                    {hoveredChartItem?.type === 'depth' && (
                      <div className="chart-tooltip" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <strong>Depth {hoveredChartItem.data.depth}</strong>
                        <div>Pages: {hoveredChartItem.data.page_count}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* File Type Analytics Chart */}
              <div className="analytics-card">
                <div className="chart-header">
                  <h3><PieChart size={18} /> File Type Analytics</h3>
                  <div className="chart-controls">
                    <div className="chart-type-toggle">
                      <button 
                        className={`chart-type-btn ${chartTypes.fileType === 'bar' ? 'active' : ''}`}
                        onClick={() => setChartTypes(prev => ({ ...prev, fileType: 'bar' }))}
                        title="Bar Chart"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button 
                        className={`chart-type-btn ${chartTypes.fileType === 'table' ? 'active' : ''}`}
                        onClick={() => setChartTypes(prev => ({ ...prev, fileType: 'table' }))}
                        title="Table View"
                      >
                        <Layers size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => exportChartData(fileAnalytics, 'file_analytics')}
                      className="chart-export-btn"
                      title="Export this chart"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                {/* Bar Chart for File Types */}
                {chartTypes.fileType === 'bar' && (
                  <div className="chart-container">
                    {fileAnalytics.slice(0, 10).map((item, idx) => (
                      <div 
                        key={idx} 
                        className="chart-bar-item interactive"
                        onMouseEnter={() => setHoveredChartItem({ type: 'file', data: item })}
                        onMouseLeave={() => setHoveredChartItem(null)}
                      >
                        <span className="chart-label">{item.file_extension}</span>
                        <div className="chart-bar-bg">
                          <div 
                            className="chart-bar-fill"
                            style={{width: `${(item.total_files / Math.max(...fileAnalytics.map(f => f.total_files))) * 100}%`}}
                          ></div>
                        </div>
                        <span className="chart-value">{item.total_files}</span>
                        {hoveredChartItem?.type === 'file' && hoveredChartItem?.data.file_extension === item.file_extension && (
                          <div className="chart-tooltip">
                            <strong>{item.file_extension} Files</strong>
                            <div>Total: {item.total_files}</div>
                            <div>Success: {item.successful}</div>
                            <div>Failed: {item.failed}</div>
                            <div>Avg Size: {formatBytes(item.avg_bytes)}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Table View */}
                {chartTypes.fileType === 'table' && (
                  <div className="analytics-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Total</th>
                          <th>Success</th>
                          <th>Failed</th>
                          <th>Avg Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fileAnalytics.slice(0, 10).map((item, idx) => (
                          <tr 
                            key={idx}
                            className="interactive-row"
                            onMouseEnter={() => setHoveredChartItem({ type: 'file', data: item })}
                            onMouseLeave={() => setHoveredChartItem(null)}
                          >
                            <td><span className="file-badge-compact">{item.file_extension}</span></td>
                            <td>{item.total_files}</td>
                            <td className="success-text">{item.successful}</td>
                            <td className="error-text">{item.failed}</td>
                            <td>{formatBytes(item.avg_bytes)}</td>
                            {hoveredChartItem?.type === 'file' && hoveredChartItem?.data.file_extension === item.file_extension && (
                              <td className="row-tooltip">
                                <div className="chart-tooltip">
                                  <strong>{item.file_extension} Files</strong>
                                  <div>Success Rate: {((item.successful / item.total_files) * 100).toFixed(1)}%</div>
                                  <div>Total Size: {formatBytes(item.avg_bytes * item.total_files)}</div>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {activeView === 'timeline' && !loading && (
          <div className="timeline-view">
            <h1><Activity size={24} /> Scraping Timeline</h1>
            <div className="timeline-container">
              {timeline.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-date">
                    <Calendar size={16} />
                    {item.date}
                  </div>
                  <div className="timeline-stats">
                    <span className="timeline-stat">
                      <FileText size={14} /> {item.pages_scraped} pages
                    </span>
                    <span className="timeline-stat">
                      <Layers size={14} /> {item.depths_reached} depths
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domains View */}
        {activeView === 'domains' && !loading && (
          <div className="domains-view">
            <h1><Layers size={24} /> Domain Statistics</h1>
            <div className="data-table-compact">
              <table>
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Pages</th>
                    <th>Avg Depth</th>
                    <th>First Scraped</th>
                    <th>Last Scraped</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((domain, idx) => (
                    <tr key={idx}>
                      <td className="url-cell-compact">
                        <a href={domain.domain} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} /> {domain.domain}
                        </a>
                      </td>
                      <td className="count-cell-compact">{domain.page_count}</td>
                      <td>{domain.avg_depth?.toFixed(1)}</td>
                      <td className="date-cell-compact">{new Date(domain.first_scraped * 1000).toLocaleDateString()}</td>
                      <td className="date-cell-compact">{new Date(domain.last_scraped * 1000).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Link Analysis View */}
        {activeView === 'link-analysis' && linkAnalysis && !loading && (
          <div className="link-analysis-view">
            <h1><AlertCircle size={24} /> Link Analysis</h1>
            
            <div className="analysis-grid">
              <div className="analysis-section">
                <h3><XCircle size={18} /> Broken Links ({linkAnalysis.broken_links?.length || 0})</h3>
                <div className="data-table-compact">
                  <table>
                    <thead>
                      <tr>
                        <th>URL</th>
                        <th>References</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkAnalysis.broken_links?.slice(0, 20).map((link, idx) => (
                        <tr key={idx}>
                          <td className="url-cell-compact">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} /> {link.url}
                            </a>
                          </td>
                          <td className="count-cell-compact">{link.reference_count}</td>
                          <td><span className="link-type-badge">{link.link_type}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="analysis-section">
                <h3><TrendingUp size={18} /> Most Referenced Pages</h3>
                <div className="data-table-compact">
                  <table>
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Inbound Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkAnalysis.most_referenced_pages?.map((page, idx) => (
                        <tr key={idx}>
                          <td className="url-cell-compact">
                            <a href={page.url} target="_blank" rel="noopener noreferrer">
                              <FileText size={14} /> {page.title || page.url}
                            </a>
                          </td>
                          <td className="count-cell-compact highlight">{page.inbound_links}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Analytics View */}
        {activeView === 'performance' && !loading && (
          <div className="analytics-view">
            <div className="view-header-compact">
              <h1><TrendingUp size={24} /> Performance Analytics</h1>
            </div>

            {performanceAnalytics ? (
              <>
                {/* Timeline Stats */}
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <h3><Clock size={18} /> Crawl Timeline</h3>
                    <div className="timeline-stats">
                      <div className="stat-row">
                        <span>Duration:</span>
                        <strong>{(performanceAnalytics.timeline.duration / 60).toFixed(1)} minutes</strong>
                      </div>
                      <div className="stat-row">
                        <span>Total Pages:</span>
                        <strong>{performanceAnalytics.timeline.total_pages}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Speed:</span>
                        <strong>{performanceAnalytics.timeline.pages_per_second.toFixed(2)} pages/sec</strong>
                      </div>
                      <div className="stat-row">
                        <span>Rate:</span>
                        <strong>{performanceAnalytics.timeline.pages_per_minute.toFixed(1)} pages/min</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proxy Statistics */}
                {performanceAnalytics.proxy_stats.length > 0 && (
                  <div className="analytics-section">
                    <h3><Activity size={18} /> Proxy Usage</h3>
                    <div className="chart-container">
                      {performanceAnalytics.proxy_stats.map((proxy, idx) => (
                        <div key={idx} className="chart-bar-item">
                          <span className="chart-label">{proxy.proxy}</span>
                          <div className="chart-bar-bg">
                            <div
                              className="chart-bar-fill"
                              style={{ width: `${proxy.percentage}%` }}
                            ></div>
                          </div>
                          <span className="chart-value">{proxy.page_count} ({proxy.percentage.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Depth Distribution */}
                {performanceAnalytics.depth_stats.length > 0 && (
                  <div className="analytics-section">
                    <h3><Layers size={18} /> Depth Distribution</h3>
                    <div className="chart-container">
                      {performanceAnalytics.depth_stats.map((depth, idx) => (
                        <div key={idx} className="chart-bar-item">
                          <span className="chart-label">Depth {depth.depth}</span>
                          <div className="chart-bar-bg">
                            <div
                              className="chart-bar-fill"
                              style={{ width: `${depth.percentage}%` }}
                            ></div>
                          </div>
                          <span className="chart-value">{depth.page_count} ({depth.percentage.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pages Per Minute */}
                {performanceAnalytics.timeline.pages_per_minute_breakdown?.length > 0 && (
                  <div className="analytics-section">
                    <h3><Activity size={18} /> Pages Per Minute</h3>
                    <div className="chart-container">
                      {performanceAnalytics.timeline.pages_per_minute_breakdown.map((bucket, idx) => (
                        <div key={idx} className="chart-bar-item">
                          <span className="chart-label">Min {bucket.minute}</span>
                          <div className="chart-bar-bg">
                            <div
                              className="chart-bar-fill"
                              style={{ 
                                width: `${(bucket.count / Math.max(...performanceAnalytics.timeline.pages_per_minute_breakdown.map(b => b.count))) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="chart-value">{bucket.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-data-card">
                <TrendingUp size={48} />
                <h3>No performance data available</h3>
                <p>Performance analytics will appear here after scraping pages</p>
              </div>
            )}
          </div>
        )}

        {/* Fingerprint Analytics View */}
        {activeView === 'fingerprints' && !loading && (
          <div className="analytics-view">
            <div className="view-header-compact">
              <h1><Hash size={24} /> Fingerprint Analysis</h1>
              <p className="section-description">
                Browser fingerprint diversity helps avoid detection
              </p>
            </div>

            {fingerprintAnalytics ? (
              <>
                {/* Diversity Score */}
                <div className="analytics-cards">
                  <div className="analytics-card highlight">
                    <h3>Fingerprint Diversity</h3>
                    <div className="diversity-score">
                      <div className="score-circle">
                        <span className="score-value">{fingerprintAnalytics.diversity_score}%</span>
                      </div>
                      <div className="score-details">
                        <div className="stat-row">
                          <span>Total Pages:</span>
                          <strong>{fingerprintAnalytics.total_pages}</strong>
                        </div>
                        <div className="stat-row">
                          <span>Unique Combinations:</span>
                          <strong>{fingerprintAnalytics.unique_combinations}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timezones */}
                {fingerprintAnalytics.timezones.length > 0 && (
                  <div className="analytics-section">
                    <h3><Calendar size={18} /> Timezone Distribution</h3>
                    <div className="fingerprint-grid">
                      {fingerprintAnalytics.timezones.map((tz, idx) => (
                        <div key={idx} className="fingerprint-item">
                          <span className="fp-name">{tz.name}</span>
                          <span className="fp-count">{tz.count} pages</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Viewports */}
                {fingerprintAnalytics.viewports.length > 0 && (
                  <div className="analytics-section">
                    <h3><LayoutDashboard size={18} /> Viewport Distribution</h3>
                    <div className="fingerprint-grid">
                      {fingerprintAnalytics.viewports.map((vp, idx) => (
                        <div key={idx} className="fingerprint-item">
                          <span className="fp-name">{vp.name}</span>
                          <span className="fp-count">{vp.count} pages</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Agents */}
                {fingerprintAnalytics.user_agents.length > 0 && (
                  <div className="analytics-section">
                    <h3><Activity size={18} /> User Agent Distribution</h3>
                    <div className="fingerprint-grid">
                      {fingerprintAnalytics.user_agents.map((ua, idx) => (
                        <div key={idx} className="fingerprint-item">
                          <span className="fp-name">{ua.name}</span>
                          <span className="fp-count">{ua.count} pages</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locales */}
                {fingerprintAnalytics.locales.length > 0 && (
                  <div className="analytics-section">
                    <h3><GitCompare size={18} /> Locale Distribution</h3>
                    <div className="fingerprint-grid">
                      {fingerprintAnalytics.locales.map((locale, idx) => (
                        <div key={idx} className="fingerprint-item">
                          <span className="fp-name">{locale.name}</span>
                          <span className="fp-count">{locale.count} pages</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-data-card">
                <Hash size={48} />
                <h3>No fingerprint data available</h3>
                <p>Fingerprint analytics will appear here after scraping with fingerprints enabled</p>
              </div>
            )}
          </div>
        )}

        {/* Geolocation Analytics View */}
        {activeView === 'geolocation' && !loading && (
          <div className="analytics-view">
            <div className="view-header-compact">
              <h1><GitCompare size={24} /> Geographical Distribution</h1>
              <p className="section-description">
                Apparent locations from geolocation fingerprints
              </p>
            </div>

            {geolocationAnalytics && geolocationAnalytics.locations.length > 0 ? (
              <div className="analytics-section">
                <h3>Location Distribution ({geolocationAnalytics.total_pages} pages)</h3>
                <div className="chart-container">
                  {geolocationAnalytics.locations.map((location, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <span className="chart-label">{location.city}</span>
                      <div className="chart-bar-bg">
                        <div
                          className="chart-bar-fill"
                          style={{ width: `${location.percentage}%` }}
                        ></div>
                      </div>
                      <span className="chart-value">{location.count} ({location.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-data-card">
                <GitCompare size={48} />
                <h3>No geolocation data</h3>
                <p>Geolocation data will appear here after scraping with fingerprints enabled</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
    {/* <Footer /> */}
  </>
  )
}

export default Database
