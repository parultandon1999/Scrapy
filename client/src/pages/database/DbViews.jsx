import React, { useState, useEffect } from 'react'

// --- PRESERVED IMPORTS (MUI Icons from your local folder) ---
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  FolderOpen as FolderOpenIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  GetApp as GetAppIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Link as LinkIcon,
  Timeline as TimelineIcon,
  NavigateNext as NavigateNextIcon,
  Storage as StorageIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Public as PublicIcon,
  Layers as LayersIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  BrokenImage as BrokenImageIcon,
  Speed as SpeedIcon,
  Fingerprint as FingerprintIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material'

// --- PRESERVED IMPORTS (Skeletons from your local folder) ---
import {
  DatabaseDashboardSkeleton,
  DatabasePagesSkeleton,
  DatabaseFilesSkeleton,
  DatabaseAnalyticsSkeleton,
} from '../../components/mui/skeletons/SkeletonLoader'

// --- Internal Helper Hooks ---

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) setMatches(media.matches)
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])
  return matches
}

// --- Helper Components ---

const PageHeadersCard = ({ headers }) => {
  const [expanded, setExpanded] = useState(false)
  if (!headers?.length) return null

  const displayHeaders = expanded ? headers : headers.slice(0, 5)
  const hasMore = headers.length > 5

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Headers ({headers.length})</h3>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        {displayHeaders.map((h, i) => (
          <div
            key={i}
            className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100 transition-colors"
          >
            <span className="block text-xs font-bold text-blue-600 uppercase mb-1">
              {h.header_type}
            </span>
            <span className="block text-sm text-gray-700 break-all font-mono">
              {h.header_text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Main Component ---

const DatabaseViews = ({
  activeView,
  setActiveView,
  loading,
  error,
  setError,
  isRefreshing,
  handleRefresh,
  handleSearch,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  stats,
  pages,
  files,
  filesByExtension,
  largestDownloads,
  topLinks,
  searchResults,
  pageDetails,
  analyticsData,
  pagination,
  handlers,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Destructure Data
  const {
    timeline,
    domains,
    depthDistribution,
    fileAnalytics,
    linkAnalysis,
    performanceAnalytics,
    fingerprintAnalytics,
    geolocationAnalytics,
  } = analyticsData || {}

  // Destructure Pagination
  const {
    pageLimit,
    setPageLimit,
    pageOffset,
    setPageOffset,
    totalPages,
  } = pagination || {}

  // Destructure Handlers
  const {
    fetchPageDetails,
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
    setChartTypes,
    handleExportData,
  } = handlers || {}

  const localFormatBytes = (bytes) => {
    if (formatBytes) return formatBytes(bytes)
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSetChartType = (key, value) => {
    if (setChartTypes) {
      setChartTypes((prev) => ({ ...prev, [key]: value }))
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'pages', label: 'Pages', icon: DescriptionIcon },
    { id: 'files', label: 'Files', icon: FolderOpenIcon },
    { id: 'files-by-ext', label: 'By Type', icon: CategoryIcon },
    { id: 'largest-downloads', label: 'Largest', icon: StorageIcon },
    { id: 'top-links', label: 'Top Links', icon: LinkIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChartIcon },
    { id: 'timeline', label: 'Timeline', icon: TimelineIcon },
    { id: 'domains', label: 'Domains', icon: LanguageIcon },
    { id: 'link-analysis', label: 'Link Analysis', icon: BrokenImageIcon },
    { id: 'performance', label: 'Performance', icon: SpeedIcon },
    { id: 'fingerprints', label: 'Fingerprints', icon: FingerprintIcon },
    { id: 'geolocation', label: 'Geolocation', icon: LocationOnIcon },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-slate-800 font-sans">
      
      {/* --- SIDEBAR --- */}
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex overflow-x-auto py-2 px-1 gap-1 no-scrollbar shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {menuItems.map((item) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`min-w-[4rem] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg transition-all duration-200 ${
                  isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <item.icon style={{ fontSize: 20 }} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-200 flex flex-col overflow-y-auto z-40 custom-scrollbar">
          <div className="flex-1 py-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon style={{ fontSize: 20 }} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleExportData}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-[0.98] ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <DownloadIcon style={{ fontSize: 18 }} />
              Export Data
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main
        className={`flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto pb-24 md:pb-8 ${
          !isMobile ? 'ml-64' : ''
        }`}
      >
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <button 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium"
          >
            <DashboardIcon style={{ fontSize: 16 }} />
            Database
          </button>
          <NavigateNextIcon style={{ fontSize: 16 }} className="mx-2 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {activeView === 'dashboard' ? 'Overview'
              : activeView === 'pages' ? 'Pages'
              : activeView === 'files' ? 'Files'
              : activeView === 'files-by-ext' ? 'Files by Type'
              : activeView === 'largest-downloads' ? 'Largest Downloads'
              : activeView === 'top-links' ? 'Top Links'
              : activeView === 'analytics' ? 'Analytics'
              : activeView === 'timeline' ? 'Timeline'
              : activeView === 'domains' ? 'Domains'
              : activeView === 'link-analysis' ? 'Link Analysis'
              : activeView === 'performance' ? 'Performance'
              : activeView === 'fingerprints' ? 'Fingerprints'
              : activeView === 'geolocation' ? 'Geolocation'
              : activeView === 'search' ? 'Search'
              : activeView === 'page-details' ? 'Page Details'
              : 'View'}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
            <span className="flex items-center gap-2 font-medium">
               <CancelIcon style={{ fontSize: 20 }} /> {error}
            </span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full transition-colors"><CloseIcon style={{ fontSize: 20 }} /></button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && activeView === 'dashboard' && <DatabaseDashboardSkeleton />}
        {loading && activeView === 'pages' && <DatabasePagesSkeleton />}
        {loading && activeView === 'files' && <DatabaseFilesSkeleton />}
        {loading && ['files-by-ext', 'largest-downloads', 'top-links', 'timeline', 'domains'].includes(activeView) && <DatabaseFilesSkeleton />}
        {loading && ['analytics', 'link-analysis', 'performance'].includes(activeView) && <DatabaseAnalyticsSkeleton />}


        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && stats && !loading && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Total Storage Used', value: `${(stats.total_download_size_mb || 0).toFixed(2)} MB`, subtitle: `${stats.total_file_assets || 0} files`, icon: StorageIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
                { title: 'Avg Scrape Time', value: stats.avg_scrape_time ? `${stats.avg_scrape_time.toFixed(1)}s` : 'N/A', subtitle: 'Per page', icon: TimelineIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
                { title: 'Success Rate', value: `${stats.total_file_assets > 0 ? ((stats.successful_downloads / stats.total_file_assets) * 100).toFixed(1) : 0}%`, subtitle: `${stats.successful_downloads || 0} of ${stats.total_file_assets || 0}`, icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100' },
                { title: 'Top Domain', value: stats.most_scraped_domain || 'N/A', subtitle: `${stats.most_scraped_domain_count || 0} pages`, icon: PublicIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                      <stat.icon style={{ fontSize: 22 }} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{stat.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Quick Stats Chips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Quick Stats</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: DescriptionIcon, label: `${stats.total_pages || 0} Pages` },
                  { icon: LinkIcon, label: `${stats.total_links || 0} Links` },
                  { icon: TrendingUpIcon, label: `${stats.internal_links || 0} Internal` },
                  { icon: FileDownloadIcon, label: `${stats.external_links || 0} External` },
                  { icon: StorageIcon, label: `${stats.total_file_assets || 0} Files` },
                  { icon: CheckCircleIcon, label: `${stats.successful_downloads || 0} Downloaded` },
                  { icon: CancelIcon, label: `${stats.failed_downloads || 0} Failed` },
                  { icon: null, label: `${(stats.total_download_size_mb || 0).toFixed(1)} MB` },
                ].map((chip, idx) => (
                  <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                    {chip.icon && <chip.icon style={{ fontSize: 16 }} className="text-gray-500" />}
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Files by Extension */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Files by Extension</h3>
                  <button onClick={() => setActiveView('files-by-ext')} className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">View All</button>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  {(filesByExtension || []).slice(0, 5).map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700 border border-gray-200 text-xs">{item.file_extension}</span>
                        <span className="text-gray-500 font-mono">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(item.count / (filesByExtension[0]?.count || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Largest Files */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Largest Files</h3>
                  <button onClick={() => setActiveView('largest-downloads')} className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">View All</button>
                </div>
                <div className="p-6 space-y-3 flex-1">
                  {(largestDownloads || []).slice(0, 5).map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div className="truncate max-w-[60%] text-gray-700 font-medium" title={file.file_name}>{file.file_name}</div>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap border border-blue-100">
                        {localFormatBytes(file.file_size_bytes)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Links */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                 <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Top Links</h3>
                  <button onClick={() => setActiveView('top-links')} className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">View All</button>
                </div>
                <div className="p-6 space-y-3 flex-1">
                  {(topLinks || []).slice(0, 5).map((link, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm group">
                       <a href={link.url} target="_blank" rel="noreferrer" className="text-gray-600 group-hover:text-blue-600 truncate max-w-[70%] transition-colors" title={link.url}>
                         {link.url.replace(/^https?:\/\//, '')}
                       </a>
                       <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-mono">{link.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGES VIEW */}
        {activeView === 'pages' && !loading && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pages <span className="text-gray-400 font-normal text-lg">({totalPages})</span></h2>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 hover:border-gray-400 bg-white"
                  title="Refresh"
                >
                  <RefreshIcon style={{ fontSize: 20 }} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
                <select 
                  value={pageLimit} 
                  onChange={(e) => setPageLimit(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer hover:border-gray-400"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
               <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">From Date</label>
                    <input 
                      type="date" 
                      value={dateRange?.startDate || ''} 
                      onChange={(e) => setDateRange?.((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-400 transition-colors"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">To Date</label>
                    <input 
                      type="date" 
                      value={dateRange?.endDate || ''} 
                      onChange={(e) => setDateRange?.((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-400 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button 
                      onClick={handleDateRangeFilter}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 text-sm font-medium"
                    >
                      <SearchIcon style={{ fontSize: 18 }} /> Apply
                    </button>
                    {(dateRange?.startDate || dateRange?.endDate) && (
                      <button 
                        onClick={clearDateRange}
                         className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <CloseIcon style={{ fontSize: 18 }} /> Clear
                      </button>
                    )}
                  </div>
               </div>
            </div>

            {/* Bulk Actions */}
            {selectedPages?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
                <span className="text-sm font-medium ml-2">{selectedPages.length} page(s) selected</span>
                <div className="flex gap-2">
                  <button onClick={handleBulkExport} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-md text-sm hover:bg-blue-50 text-blue-700 transition-colors">
                    <GetAppIcon style={{ fontSize: 16 }} /> Export
                  </button>
                  <button onClick={handleBulkDelete} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors">
                    <DeleteIcon style={{ fontSize: 16 }} /> Delete
                  </button>
                  <button onClick={() => setSelectedPages?.([])} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 underline decoration-dotted">
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left w-12">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          checked={selectedPages?.length === pages?.length && pages?.length > 0} 
                          onChange={toggleSelectAll} 
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">URL</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Depth</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pages?.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={selectedPages?.includes(page.id)} 
                            onChange={() => togglePageSelection?.(page.id)} 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium max-w-xs truncate">
                          <a href={page.url} target="_blank" rel="noreferrer" className="hover:underline">{new URL(page.url).hostname}</a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                          {page.title || <span className="text-gray-400 italic">No title</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            D{page.depth}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                          {new Date(page.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => fetchPageDetails?.(page.id)}
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors font-semibold text-xs border border-blue-100"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-4">
               <p className="text-sm text-gray-600">
                 Showing <span className="font-semibold text-gray-900">{pageOffset + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(pageOffset + pageLimit, totalPages)}</span> of <span className="font-semibold text-gray-900">{totalPages}</span> results
               </p>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setPageOffset?.(Math.max(0, pageOffset - pageLimit))} 
                   disabled={pageOffset === 0}
                   className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                     pageOffset === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                   }`}
                 >
                   <ChevronLeftIcon style={{ fontSize: 18 }} /> Previous
                 </button>
                 <button 
                   onClick={() => setPageOffset?.(pageOffset + pageLimit)} 
                   disabled={pageOffset + pageLimit >= totalPages}
                   className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                     pageOffset + pageLimit >= totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                   }`}
                 >
                   Next <ChevronRightIcon style={{ fontSize: 18 }} />
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* FILES VIEW */}
        {activeView === 'files' && !loading && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Files</h2>
              <select 
                value={fileStatus || 'all'} 
                onChange={(e) => setFileStatus?.(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[140px] shadow-sm hover:border-gray-400 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                       <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                       <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                       <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {files?.map((file, idx) => (
                       <tr key={idx} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate font-medium" title={file.file_name}>{file.file_name}</td>
                         <td className="px-6 py-4 text-sm"><span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">{file.file_extension}</span></td>
                         <td className="px-6 py-4 text-right text-sm text-gray-500 font-mono">{localFormatBytes(file.file_size_bytes)}</td>
                         <td className="px-6 py-4 text-right">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                             file.download_status === 'success' 
                               ? 'bg-green-50 text-green-700 border-green-200' 
                               : 'bg-red-50 text-red-700 border-red-200'
                           }`}>
                             {file.download_status === 'success' ? <CheckCircleIcon style={{ fontSize: 14 }} /> : <CancelIcon style={{ fontSize: 14 }} />}
                             {file.download_status}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* FILES BY EXTENSION VIEW */}
        {activeView === 'files-by-ext' && !loading && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Files by Type</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Extension</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Size</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filesByExtension?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <span className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-md">{item.file_extension}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700 font-mono">{item.count}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700 font-mono">{localFormatBytes(item.total_size_bytes || 0)}</td>
                        <td className="px-6 py-4 text-right">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                             item.download_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                           }`}>
                             {item.download_status || 'Mixed'}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LARGEST DOWNLOADS VIEW */}
        {activeView === 'largest-downloads' && !loading && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Largest Files</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                       <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                       <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {largestDownloads?.map((file, idx) => (
                       <tr key={idx} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 text-sm text-gray-900 font-medium">{file.file_name}</td>
                         <td className="px-6 py-4 text-sm"><span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-600">{file.file_extension}</span></td>
                         <td className="px-6 py-4 text-right text-sm font-bold text-blue-600 font-mono">{localFormatBytes(file.file_size_bytes)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* TOP LINKS VIEW */}
        {activeView === 'top-links' && !loading && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Top Links</h2>
              <select 
                value={linkType || 'internal'} 
                onChange={(e) => setLinkType?.(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[140px] shadow-sm hover:border-gray-400 cursor-pointer"
              >
                <option value="internal">Internal Links</option>
                <option value="external">External Links</option>
              </select>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">URL</th>
                       <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {topLinks?.map((link, idx) => (
                       <tr key={idx} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 text-sm text-blue-600 hover:underline break-all">
                           <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{link.frequency}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* SEARCH VIEW */}
        {activeView === 'search' && !loading && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Search</h2>
              <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshIcon style={{ fontSize: 20 }} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <select 
                    value={searchType || 'content'} 
                    onChange={(e) => setSearchType?.(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[140px]"
                  >
                    <option value="content">Content</option>
                    <option value="files">Files</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder={`Search ${searchType}...`} 
                    value={searchQuery || ''} 
                    onChange={(e) => setSearchQuery?.(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-400 transition-colors"
                  />
                  <button 
                    type="submit"
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <SearchIcon style={{ fontSize: 18 }} /> Search
                  </button>
               </form>
            </div>

            {searchResults && (
              <div className="animate-fade-in">
                <div className="mb-4 p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg flex items-center gap-2">
                   <div className="font-semibold">Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchResults.keyword}"</div>
                </div>
                {searchResults.results?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {searchResults.results.map((result, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                         {result.title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{result.title}</h3>}
                         {result.file_name && <h3 className="text-lg font-semibold text-gray-900 mb-2">{result.file_name}</h3>}
                         {result.url && <a href={result.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm block mb-2 break-all">{result.url}</a>}
                         {result.page_url && <a href={result.page_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm block mb-2 break-all">{result.page_url}</a>}
                         {result.preview && <p className="text-gray-600 text-sm mt-2 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">{result.preview}...</p>}
                         {result.file_extension && <span className="inline-block mt-3 bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{result.file_extension}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-gray-500">No results found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PAGE DETAILS VIEW */}
        {activeView === 'page-details' && pageDetails && !loading && (
          <div className="space-y-6 animate-fade-in">
            <button 
              onClick={() => setActiveView?.('pages')} 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            >
              <ChevronLeftIcon style={{ fontSize: 20 }} /> Back to Pages
            </button>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <div className="border-b border-gray-100 pb-4 mb-4">
                   <h2 className="text-xl font-bold text-gray-900 mb-1">{pageDetails.title || 'No title'}</h2>
                   <a href={pageDetails.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all">{pageDetails.url}</a>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Depth</span>
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                       D{pageDetails.depth}
                     </span>
                   </div>
                   <div>
                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Scraped At</span>
                     <span className="text-gray-900 text-sm font-medium">
                       {new Date(pageDetails.timestamp * 1000).toLocaleString()}
                     </span>
                   </div>
                 </div>
              </div>

              {/* Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 lg:col-span-1">
                   <PageHeadersCard headers={pageDetails.headers} />
                 </div>

                 {pageDetails.links?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Links ({pageDetails.links.length})</h3>
                    <div className="flex gap-3 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                        <TrendingUpIcon style={{ fontSize: 16 }} /> Internal: {pageDetails.links.filter(l => l.link_type === 'internal').length}
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                        <PublicIcon style={{ fontSize: 16 }} /> External: {pageDetails.links.filter(l => l.link_type === 'external').length}
                      </div>
                    </div>
                  </div>
                 )}
              </div>

              {pageDetails.file_assets?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Files ({pageDetails.file_assets.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">File Name</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Size</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pageDetails.file_assets.map((f, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{f.file_name}</td>
                            <td className="px-6 py-4 text-right text-sm text-gray-500 font-mono">{localFormatBytes(f.file_size_bytes)}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                f.download_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {f.download_status}
                              </span>
                            </td>
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

        {/* ANALYTICS VIEW */}
        {activeView === 'analytics' && !loading && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h2>
               <div className="flex gap-2">
                 <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white shadow-sm">
                   <RefreshIcon style={{ fontSize: 20 }} className={isRefreshing ? 'animate-spin' : ''} />
                 </button>
                 <button 
                   onClick={() => exportChartData?.({ depthDistribution, fileAnalytics }, 'analytics')}
                   className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white text-sm font-medium shadow-sm transition-all"
                 >
                   <GetAppIcon style={{ fontSize: 18 }} /> Export
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Depth Distribution Chart Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">Depth Distribution</h3>
                        <p className="text-sm text-gray-500">Total: {depthDistribution?.length || 0}</p>
                      </div>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        {[
                          { id: 'bar', icon: BarChartIcon },
                          { id: 'pie', icon: PieChartIcon },
                          { id: 'line', icon: TrendingUpIcon }
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => handleSetChartType('depth', type.id)}
                            className={`p-1.5 rounded-md transition-all ${
                              chartTypes?.depth === type.id ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <type.icon style={{ fontSize: 20 }} />
                          </button>
                        ))}
                      </div>
                   </div>
                   
                   <div className="min-h-[250px] flex items-center justify-center">
                      {chartTypes?.depth === 'bar' && (
                        <div className="w-full space-y-3">
                          {depthDistribution?.map((item, idx) => (
                             <div key={idx} className="group relative">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-medium text-gray-700">Depth {item.depth}</span>
                                  <span className="font-bold text-gray-900">{item.page_count}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="bg-blue-500 h-3 rounded-full transition-all duration-500 group-hover:bg-blue-600"
                                    style={{ width: `${(item.page_count / Math.max(...(depthDistribution?.map(d => d.page_count) || [1]))) * 100}%` }}
                                  ></div>
                                </div>
                             </div>
                          ))}
                        </div>
                      )}
                      {chartTypes?.depth === 'pie' && (
                        <div className="text-center text-gray-500 p-8 border border-dashed border-gray-200 rounded-lg w-full">
                           <PieChartIcon style={{ fontSize: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
                           <p>Pie Chart Visualization</p>
                        </div>
                      )}
                      {chartTypes?.depth === 'line' && (
                         <div className="text-center text-gray-500 p-8 border border-dashed border-gray-200 rounded-lg w-full">
                           <TrendingUpIcon style={{ fontSize: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
                           <p>Line Chart Visualization</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* File Types Chart Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">File Type Analytics</h3>
                        <p className="text-sm text-gray-500">Total types: {fileAnalytics?.length || 0}</p>
                      </div>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                         <button
                            onClick={() => handleSetChartType('fileType', 'bar')}
                            className={`p-1.5 rounded-md transition-all ${
                              chartTypes?.fileType === 'bar' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <BarChartIcon style={{ fontSize: 20 }} />
                          </button>
                          <button
                            onClick={() => handleSetChartType('fileType', 'table')}
                            className={`p-1.5 rounded-md transition-all ${
                              chartTypes?.fileType === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <LayersIcon style={{ fontSize: 20 }} />
                          </button>
                      </div>
                   </div>

                   <div className="min-h-[250px]">
                      {chartTypes?.fileType === 'bar' && (
                        <div className="space-y-3">
                          {fileAnalytics?.slice(0, 8).map((item, idx) => (
                             <div key={idx} className="group">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-semibold px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">{item.file_extension || item.file_type}</span>
                                  <span className="font-bold text-gray-900">{item.count || item.total_files}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500 group-hover:bg-green-600"
                                    style={{ width: `${((item.count || item.total_files) / Math.max(...fileAnalytics.map(f => f.count || f.total_files), 1)) * 100}%` }}
                                  ></div>
                                </div>
                             </div>
                          ))}
                        </div>
                      )}
                      {chartTypes?.fileType === 'table' && (
                         <div className="overflow-x-auto">
                           <table className="w-full text-sm">
                             <thead>
                               <tr className="border-b border-gray-200">
                                 <th className="text-left py-2 font-semibold">Type</th>
                                 <th className="text-right py-2 font-semibold">Total</th>
                                 <th className="text-right py-2 font-semibold text-green-600">Success</th>
                                 <th className="text-right py-2 font-semibold text-red-600">Failed</th>
                               </tr>
                             </thead>
                             <tbody>
                               {fileAnalytics?.slice(0, 8).map((item, idx) => (
                                 <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                   <td className="py-2 font-mono text-xs">{item.file_extension}</td>
                                   <td className="py-2 text-right font-medium">{item.total_files}</td>
                                   <td className="py-2 text-right text-green-600 font-medium">{item.successful}</td>
                                   <td className="py-2 text-right text-red-600 font-medium">{item.failed}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {activeView === 'timeline' && !loading && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Scraping Timeline</h2>
             <div className="space-y-4">
                {timeline?.map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                             <EventIcon style={{ fontSize: 24 }} />
                           </div>
                           <span className="font-bold text-gray-800 text-lg">{item.date}</span>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-600">
                           <div className="flex items-center gap-2">
                              <DescriptionIcon style={{ fontSize: 18 }} className="text-gray-400" />
                              <span className="font-medium text-gray-900">{item.pages_scraped}</span> pages
                           </div>
                           <div className="flex items-center gap-2">
                              <LayersIcon style={{ fontSize: 18 }} className="text-gray-400" />
                              <span className="font-medium text-gray-900">{item.depths_reached}</span> depths
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* DOMAINS VIEW */}
        {activeView === 'domains' && !loading && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Domain Statistics</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Pages</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Depth</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">First Scraped</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Last Scraped</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {domains?.map((domain, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-blue-600 hover:underline">
                          <a href={domain.domain} target="_blank" rel="noreferrer">{domain.domain}</a>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">{domain.page_count}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700">{domain.avg_depth?.toFixed(1)}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">{new Date(domain.first_scraped * 1000).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">{new Date(domain.last_scraped * 1000).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LINK ANALYSIS VIEW */}
        {activeView === 'link-analysis' && linkAnalysis && !loading && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Link Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Broken Links */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Broken Links ({linkAnalysis.broken_links?.length || 0})</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">URL</th>
                         <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">References</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {linkAnalysis.broken_links?.slice(0, 20).map((link, i) => (
                         <tr key={i} className="hover:bg-gray-50">
                           <td className="px-6 py-3 text-sm max-w-xs truncate text-blue-600 hover:underline">
                             <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                           </td>
                           <td className="px-6 py-3 text-right text-sm text-gray-700">{link.reference_count}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>

              {/* Most Referenced Pages */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Most Referenced Pages</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Page</th>
                         <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Inbound Links</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {linkAnalysis.most_referenced_pages?.map((page, i) => (
                         <tr key={i} className="hover:bg-gray-50">
                           <td className="px-6 py-3 text-sm max-w-xs truncate text-blue-600 hover:underline">
                             <a href={page.url} target="_blank" rel="noreferrer">{page.title || page.url}</a>
                           </td>
                           <td className="px-6 py-3 text-right text-sm font-bold text-blue-600">{page.inbound_links}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERFORMANCE VIEW */}
        {activeView === 'performance' && performanceAnalytics && !loading && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Analytics</h2>
            <div className="grid grid-cols-1 gap-6">
              {/* Timeline Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Crawl Timeline</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Duration</span>
                      <span className="text-lg font-bold text-gray-900">{(performanceAnalytics.timeline?.duration / 60).toFixed(1)} min</span>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Total Pages</span>
                      <span className="text-lg font-bold text-gray-900">{performanceAnalytics.timeline?.total_pages}</span>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Speed</span>
                      <span className="text-lg font-bold text-gray-900">{performanceAnalytics.timeline?.pages_per_second.toFixed(2)}/s</span>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Rate</span>
                      <span className="text-lg font-bold text-gray-900">{performanceAnalytics.timeline?.pages_per_minute.toFixed(1)}/m</span>
                   </div>
                </div>
              </div>

              {/* Pages Per Minute */}
              {performanceAnalytics.timeline?.pages_per_minute_breakdown?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Pages Per Minute Breakdown</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {performanceAnalytics.timeline.pages_per_minute_breakdown.map((bucket, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-gray-600 font-medium">Minute {bucket.minute}</span>
                           <span className="text-gray-900 font-bold">{bucket.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                           <div 
                             className="bg-blue-500 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-600"
                             style={{ 
                               width: `${(bucket.count / Math.max(...(performanceAnalytics.timeline.pages_per_minute_breakdown?.map(b => b.count) || [1]))) * 100}%` 
                             }}
                           ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proxy Stats */}
              {performanceAnalytics.proxy_stats?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Proxy Usage</h3>
                   <div className="space-y-4">
                     {performanceAnalytics.proxy_stats.map((p, i) => (
                       <div key={i}>
                         <div className="flex justify-between text-xs mb-1">
                           <span className="text-gray-700 font-medium">{p.proxy}</span>
                           <span className="text-gray-900 font-bold">{p.percentage.toFixed(1)}%</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${p.percentage}%` }}></div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {/* Depth Stats */}
              {performanceAnalytics.depth_stats?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Depth Distribution</h3>
                   <div className="space-y-4">
                     {performanceAnalytics.depth_stats.map((d, i) => (
                       <div key={i}>
                         <div className="flex justify-between text-xs mb-1">
                           <span className="text-gray-700 font-medium">Depth {d.depth}</span>
                           <span className="text-gray-900 font-bold">{d.percentage.toFixed(1)}%</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${d.percentage}%` }}></div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FINGERPRINTS VIEW */}
        {activeView === 'fingerprints' && fingerprintAnalytics && !loading && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Fingerprint Analysis</h2>
             
             {/* Diversity Score Card */}
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                   <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-blue-100">
                      {fingerprintAnalytics.diversity_score}%
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h3 className="text-gray-500 uppercase tracking-wide text-sm font-semibold mb-2">Fingerprint Diversity</h3>
                      <div className="space-y-1">
                         <p className="text-gray-900 font-medium text-lg">
                           <strong className="font-bold">Total Pages:</strong> {fingerprintAnalytics.total_pages}
                         </p>
                         <p className="text-gray-900 font-medium text-lg">
                           <strong className="font-bold">Unique Combinations:</strong> {fingerprintAnalytics.unique_combinations}
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {/* User Agents */}
                {fingerprintAnalytics.user_agents?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">User-Agent Distribution</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {fingerprintAnalytics.user_agents.map((ua, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow bg-gray-50/50">
                             <p className="font-semibold text-sm text-gray-800 mb-1 truncate" title={ua.name}>{ua.name?.substring(0, 25)}{ua.name?.length > 25 ? '...' : ''}</p>
                             <p className="text-xs text-gray-500 font-medium">{ua.count} pages</p>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {/* Locales */}
                {fingerprintAnalytics.locales?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Locale Distribution</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {fingerprintAnalytics.locales.map((locale, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-3 text-center hover:bg-gray-50 transition-colors">
                             <p className="font-bold text-gray-800 mb-1">{locale.name}</p>
                             <p className="text-xs text-gray-500">{locale.count} pages</p>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
                
                {/* Timezones & Viewports */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {fingerprintAnalytics.timezones?.length > 0 && (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                        <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Timezone Distribution</h3>
                        <div className="grid grid-cols-2 gap-3">
                           {fingerprintAnalytics.timezones.map((tz, i) => (
                             <div key={i} className="bg-gray-50 rounded p-3 text-center">
                                <p className="font-semibold text-sm text-gray-800 truncate">{tz.name}</p>
                                <p className="text-xs text-gray-500">{tz.count} pages</p>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                   {fingerprintAnalytics.viewports?.length > 0 && (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                        <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Viewport Distribution</h3>
                        <div className="grid grid-cols-2 gap-3">
                           {fingerprintAnalytics.viewports.map((vp, i) => (
                             <div key={i} className="bg-gray-50 rounded p-3 text-center">
                                <p className="font-semibold text-sm text-gray-800 font-mono">{vp.name}</p>
                                <p className="text-xs text-gray-500">{vp.count} pages</p>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* GEOLOCATION VIEW */}
        {activeView === 'geolocation' && !loading && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Geographical Distribution</h2>
             {geolocationAnalytics?.locations?.length > 0 ? (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="space-y-5">
                     {geolocationAnalytics.locations.map((loc, idx) => (
                       <div key={idx}>
                          <div className="flex justify-between items-center mb-1.5">
                             <span className="font-medium text-gray-800 flex items-center gap-2">
                               <LocationOnIcon style={{ fontSize: 16 }} className="text-gray-400" />
                               {loc.city}, {loc.country}
                             </span>
                             <span className="font-bold text-gray-900">{loc.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                             <div 
                               className="bg-blue-500 h-2.5 rounded-full" 
                               style={{ width: `${loc.percentage}%` }}
                             ></div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             ) : (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <PublicIcon style={{ fontSize: 48 }} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No geolocation data available</h3>
                  <p className="text-gray-500 mt-1">Run a scrape with proxy enabled to gather geolocation data.</p>
               </div>
             )}
          </div>
        )}

      </main>
    </div>
  )
}

export default DatabaseViews