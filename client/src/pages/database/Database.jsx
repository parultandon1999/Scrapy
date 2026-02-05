import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import DatabaseViews from './DbViews'
import * as api from '../../services/api'
import { useToast } from '../../components/mui/toasts/useToast'

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
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="database" />
      
      {/* Main Container Layout:
        - Mobile: Flex column. Padding bottom for fixed sidebar.
        - Desktop (md): Flex row. Sticky sidebar takes space naturally.
      */}
      <div className="flex flex-1 flex-col pb-[70px] md:flex-row md:pb-0">
        <DatabaseViews
          activeView={activeView}
          setActiveView={setActiveView}
          loading={loading}
          error={error}
          setError={setError}
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
          handleSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          stats={stats}
          pages={pages}
          files={files}
          filesByExtension={filesByExtension}
          largestDownloads={largestDownloads}
          topLinks={topLinks}
          searchResults={searchResults}
          pageDetails={pageDetails}
          analyticsData={{
            timeline,
            domains,
            depthDistribution,
            fileAnalytics,
            linkAnalysis,
            performanceAnalytics,
            fingerprintAnalytics,
            geolocationAnalytics
          }}
          pagination={{
            pageLimit,
            setPageLimit,
            pageOffset,
            setPageOffset,
            totalPages
          }}
          handlers={{
            fetchPageDetails,
            handleExportData,
            handleBulkDelete,
            handleBulkExport,
            togglePageSelection,
            toggleSelectAll,
            handleDateRangeFilter,
            clearDateRange,
            exportChartData,
            formatBytes,
            selectedPages,
            setSelectedPages,
            dateRange,
            setDateRange,
            linkType,
            setLinkType,
            fileStatus,
            setFileStatus,
            hoveredChartItem,
            setHoveredChartItem,
            chartTypes,
            setChartTypes
          }}
        />
      </div>
    </div>
  )
}

export default Database