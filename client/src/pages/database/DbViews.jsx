import React from 'react'
import Breadcrumb from '../../components/mui/breadcrumbs/Breadcrumb'
import { 
  Database as DatabaseIcon, LayoutDashboard, FileText, FolderOpen, 
  Package, HardDrive, Link2, Search, BarChart3, Activity, Layers, 
  AlertCircle, TrendingUp, Hash, GitCompare, ChevronLeft, ChevronRight,
  ExternalLink, CheckCircle, XCircle, File, X, Calendar, PieChart, Clock,
  Download, Globe
} from 'lucide-react'
import { 
  DatabaseDashboardSkeleton, DatabasePagesSkeleton, DatabaseFilesSkeleton,
  DatabaseAnalyticsSkeleton 
} from '../../components/mui/skeletons/SkeletonLoader'

const DatabaseViews = ({ 
  activeView, setActiveView, loading, error, setError, isRefreshing, 
  handleRefresh, handleSearch, searchQuery, setSearchQuery, searchType, setSearchType,
  stats, pages, files, filesByExtension, largestDownloads, topLinks, 
  searchResults, pageDetails, analyticsData, pagination, handlers
}) => {
  
  // Destructure analyticsData
  const {
    timeline,
    domains,
    depthDistribution,
    fileAnalytics,
    linkAnalysis,
    performanceAnalytics,
    fingerprintAnalytics,
    geolocationAnalytics
  } = analyticsData || {}

  // Destructure pagination
  const {
    pageLimit,
    setPageLimit,
    pageOffset,
    setPageOffset,
    totalPages
  } = pagination || {}

  // Destructure handlers
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
    setChartTypes
  } = handlers || {}
  
  // Helper to format bytes
  const localFormatBytes = (bytes) => {
    if (formatBytes) return formatBytes(bytes)
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main id="main-content" className="flex-1 w-full overflow-y-auto bg-white p-4 dark:bg-black md:p-6" role="main">
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
        <div className="mb-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/30"><X size={18} /></button>
        </div>
      )}

      {/* --- SKELETON LOADERS --- */}
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
        <div className="w-full">
          <h1 className="mb-5 flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">Overview</h1>
          
          {/* Quick Stats Summary Cards */}
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* Storage Card */}
            <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-600 to-blue-500 opacity-100 transition-all group-hover:opacity-100 dark:from-blue-400 dark:to-blue-600"></div>
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:rotate-6 group-hover:scale-110 dark:bg-blue-900/20 dark:text-blue-400">
                <HardDrive size={32} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Storage Used</div>
                <div className="mb-1 truncate text-3xl font-bold text-gray-900 dark:text-gray-200">
                  {(stats.total_download_size_mb || 0).toFixed(2)} MB
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.total_file_assets || 0} files downloaded
                </div>
              </div>
            </div>

            {/* Time Card */}
            <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
              <div className="absolute left-0 top-0 h-full w-1 bg-gray-200 dark:bg-neutral-700"></div>
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-transform group-hover:rotate-6 group-hover:scale-110 dark:bg-neutral-800 dark:text-gray-400">
                <Clock size={32} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Avg Scrape Time</div>
                <div className="mb-1 truncate text-3xl font-bold text-gray-900 dark:text-gray-200">
                  {stats.avg_scrape_time ? `${stats.avg_scrape_time.toFixed(1)}s` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Per page average
                </div>
              </div>
            </div>

            {/* Success Card */}
            <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 to-green-400"></div>
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-transform group-hover:rotate-6 group-hover:scale-110 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle size={32} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Success Rate</div>
                <div className="mb-1 truncate text-3xl font-bold text-gray-900 dark:text-gray-200">
                  {stats.total_file_assets > 0 
                    ? ((stats.successful_downloads / stats.total_file_assets) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.successful_downloads || 0} of {stats.total_file_assets || 0} files
                </div>
              </div>
            </div>

            {/* Domain Card */}
            <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-purple-400"></div>
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:rotate-6 group-hover:scale-110 dark:bg-purple-900/20 dark:text-purple-400">
                <Globe size={32} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Most Scraped Domain</div>
                <div className="mb-1 truncate text-lg font-bold text-gray-900 dark:text-gray-200" title={stats.most_scraped_domain}>
                  {stats.most_scraped_domain || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.most_scraped_domain_count || 0} pages
                </div>
              </div>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {[
              { label: 'Pages', value: stats.total_pages, icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Links', value: stats.total_links, icon: Link2, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Internal', value: stats.internal_links, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'External', value: stats.external_links, icon: ExternalLink, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Files', value: stats.total_file_assets, icon: Package, color: 'text-gray-600 dark:text-gray-400' },
              { label: 'Downloaded', value: stats.successful_downloads, icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
              { label: 'Failed', value: stats.failed_downloads, icon: XCircle, color: 'text-red-600 dark:text-red-400' },
              { label: 'Total Size', value: `${(stats.total_download_size_mb || 0).toFixed(1)} MB`, icon: HardDrive, color: 'text-blue-600 dark:text-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:-translate-y-px hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                <stat.icon size={20} className={`flex-shrink-0 ${stat.color}`} />
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{stat.label}</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-200">{stat.value || 0}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Compact Widgets */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Files by Type Widget */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200"><Package size={16} /> Files by Type</h3>
                <button onClick={() => setActiveView('files-by-ext')} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-2.5 p-3">
                {filesByExtension.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[13px]">
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{item.file_extension}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300" 
                        style={{width: `${(item.count / filesByExtension[0]?.count * 100) || 0}%`}}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-gray-900 dark:text-gray-200">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Largest Files Widget */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200"><HardDrive size={16} /> Largest Files</h3>
                <button onClick={() => setActiveView('largest-downloads')} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-2.5 p-3">
                {largestDownloads.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[13px]">
                    <File size={14} className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="flex-1 truncate text-gray-500 dark:text-gray-400 text-xs">{file.file_name}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-200">{localFormatBytes(file.file_size_bytes)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Links Widget */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200"><Link2 size={16} /> Top Links</h3>
                <button onClick={() => setActiveView('top-links')} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-2.5 p-3">
                {topLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[13px]">
                    <span className="flex-1 truncate text-xs text-gray-500 dark:text-gray-400">{link.url.substring(0, 40)}...</span>
                    <span className="flex items-center gap-1 rounded bg-yellow-50 px-2 py-0.5 text-[11px] font-semibold text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <Hash size={12} />{link.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pages View */}
      {activeView === 'pages' && !loading && (
        <div className="w-full">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><FileText size={24} /> Pages ({totalPages})</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh} 
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                disabled={isRefreshing}
                title="Refresh data"
              >
                <Activity size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <select 
                value={pageLimit} 
                onChange={(e) => setPageLimit(Number(e.target.value))} 
                className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-800 dark:bg-black dark:text-gray-200"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <button 
                onClick={() => setPageOffset(Math.max(0, pageOffset - pageLimit))} 
                disabled={pageOffset === 0} 
                className="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-black dark:text-gray-200 dark:hover:bg-neutral-900"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-1 text-sm text-gray-500 dark:text-gray-400">{pageOffset + 1}-{Math.min(pageOffset + pageLimit, totalPages)}</span>
              <button 
                onClick={() => setPageOffset(pageOffset + pageLimit)} 
                disabled={pageOffset + pageLimit >= totalPages} 
                className="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-black dark:text-gray-200 dark:hover:bg-neutral-900"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex w-full items-center gap-2 text-sm text-gray-500 dark:text-gray-400 md:w-auto">
                <Calendar size={16} />
                <label className="font-medium">From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-black dark:text-gray-200 dark:focus:border-blue-400"
                />
              </div>
              <div className="flex w-full items-center gap-2 text-sm text-gray-500 dark:text-gray-400 md:w-auto">
                <Calendar size={16} />
                <label className="font-medium">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-black dark:text-gray-200 dark:focus:border-blue-400"
                />
              </div>
              <button 
                onClick={handleDateRangeFilter} 
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 md:w-auto dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-black"
              >
                <Search size={16} />
                Apply
              </button>
              {(dateRange.startDate || dateRange.endDate) && (
                <button 
                  onClick={clearDateRange} 
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-300 md:w-auto dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedPages.length > 0 && (
            <div className="mb-4 flex animate-[slideDown_0.2s_ease] items-center justify-between rounded-lg border border-blue-500 bg-blue-50 p-3 dark:border-blue-400 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <CheckCircle size={16} />
                <span>{selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleBulkExport} className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400">
                  <Download size={14} />
                  Export
                </button>
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:text-black dark:hover:bg-red-400">
                  <X size={14} />
                  Delete
                </button>
                <button onClick={() => setSelectedPages([])} className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-300 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700">
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPages.length === pages.length && pages.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-blue-400"
                      />
                    </th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Depth</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {pages.map((page) => (
                    <tr key={page.id} className={`group hover:bg-gray-50 dark:hover:bg-neutral-900/50 ${selectedPages.includes(page.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(page.id)}
                          onChange={() => togglePageSelection(page.id)}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-blue-400"
                        />
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <a href={page.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-blue-600 hover:underline dark:text-blue-400">
                          <ExternalLink size={14} className="flex-shrink-0" /> <span className="truncate">{page.url}</span>
                        </a>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-gray-900 dark:text-gray-200">{page.title || 'No title'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">D{page.depth}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{page.scraped_at}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => fetchPageDetails(page.id)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-blue-400 dark:hover:bg-neutral-700 dark:hover:border-blue-400">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Files View */}
      {activeView === 'files' && !loading && (
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><FolderOpen size={24} /> Files</h1>
            <select 
              value={fileStatus} 
              onChange={(e) => setFileStatus(e.target.value)} 
              className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-800 dark:bg-black dark:text-gray-200"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {files.map((file, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <File size={16} className="text-gray-400" /> <span className="truncate">{file.file_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{file.file_extension}</span></td>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{localFormatBytes(file.file_size_bytes)}</td>
                      <td className="px-4 py-3">
                        {file.download_status === 'success' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold uppercase text-green-700 dark:bg-green-900/20 dark:text-green-400"><CheckCircle size={12} /> Success</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold uppercase text-red-700 dark:bg-red-900/20 dark:text-red-400"><XCircle size={12} /> Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Files by Extension View */}
      {activeView === 'files-by-ext' && !loading && (
        <div className="w-full">
          <div className="mb-4">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><Package size={24} /> Files by Type</h1>
          </div>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                    <th className="px-4 py-3">Extension</th>
                    <th className="px-4 py-3">Count</th>
                    <th className="px-4 py-3">Total Size</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {filesByExtension.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                      <td className="px-4 py-3"><span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{item.file_extension}</span></td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">{item.count}</td>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{(item.total_size / (1024 * 1024)).toFixed(2)} MB</td>
                      <td className="px-4 py-3">
                        {item.download_status === 'success' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold uppercase text-green-700 dark:bg-green-900/20 dark:text-green-400"><CheckCircle size={12} /> Success</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold uppercase text-red-700 dark:bg-red-900/20 dark:text-red-400"><XCircle size={12} /> Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Largest Downloads View */}
      {activeView === 'largest-downloads' && !loading && (
        <div className="w-full">
          <div className="mb-4">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><HardDrive size={24} /> Largest Files</h1>
          </div>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {largestDownloads.map((file, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <File size={16} className="text-gray-400" /> <span className="truncate">{file.file_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{file.file_extension}</span></td>
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{localFormatBytes(file.file_size_bytes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top Links View */}
      {activeView === 'top-links' && !loading && (
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><Link2 size={24} /> Top Links</h1>
            <select 
              value={linkType} 
              onChange={(e) => setLinkType(e.target.value)} 
              className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-800 dark:bg-black dark:text-gray-200"
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {topLinks.map((link, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                      <td className="max-w-md px-4 py-3">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-blue-600 hover:underline dark:text-blue-400">
                          <ExternalLink size={14} className="flex-shrink-0" /> <span className="truncate">{link.url}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                          <Hash size={12} />{link.frequency}
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

      {/* Search View */}
      {activeView === 'search' && (
        <div className="w-full">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><Search size={24} /> Search</h1>
            <button 
              onClick={handleRefresh} 
              className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
              disabled={isRefreshing}
              title="Refresh data"
            >
              <Activity size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:flex-row md:items-center">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)} 
              className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 md:w-32"
            >
              <option value="content">Content</option>
              <option value="files">Files</option>
            </select>
            <input
              type="text"
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-400"
            />
            <button 
              type="submit" 
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-black"
              disabled={loading}
            >
              <Search size={16} /> Search
            </button>
          </form>

          {searchResults && (
            <div className="w-full">
              <div className="mb-4 rounded-lg border-l-4 border-blue-600 bg-gray-50 p-3 dark:border-blue-500 dark:bg-neutral-900">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200">Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchResults.keyword}"</h3>
              </div>
              {searchResults.results.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {searchResults.results.map((result, idx) => (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950" key={idx}>
                      {result.title && <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200"><FileText size={16} /> {result.title}</h4>}
                      {result.file_name && <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200"><File size={16} /> {result.file_name}</h4>}
                      {result.url && (
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-center gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400">
                          <ExternalLink size={14} /> {result.url}
                        </a>
                      )}
                      {result.page_url && (
                        <a href={result.page_url} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-center gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400">
                          <ExternalLink size={14} /> {result.page_url}
                        </a>
                      )}
                      {result.preview && <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{result.preview}...</p>}
                      {result.file_extension && <span className="mt-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{result.file_extension}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">No results found</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Page Details View */}
      {activeView === 'page-details' && pageDetails && !loading && (
        <div className="w-full">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><FileText size={24} /> Page Details</h1>
            <button onClick={() => setActiveView('pages')} className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-gray-50 hover:border-blue-500 dark:border-neutral-700 dark:bg-black dark:text-blue-400 dark:hover:border-blue-400 dark:hover:bg-neutral-900">
              <ChevronLeft size={16} /> Back
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:col-span-2">
              <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900 dark:border-neutral-800 dark:text-gray-200">Information</h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="min-w-[80px] font-semibold text-gray-500 dark:text-gray-400">URL:</span>
                  <a href={pageDetails.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center gap-1.5 break-all text-blue-600 hover:underline dark:text-blue-400">
                    <ExternalLink size={14} /> {pageDetails.url}
                  </a>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="min-w-[80px] font-semibold text-gray-500 dark:text-gray-400">Title:</span>
                  <span className="text-gray-900 dark:text-gray-200">{pageDetails.title || 'No title'}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="min-w-[80px] font-semibold text-gray-500 dark:text-gray-400">Depth:</span>
                  <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">D{pageDetails.depth}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="min-w-[80px] font-semibold text-gray-500 dark:text-gray-400">Date:</span>
                  <span className="text-gray-900 dark:text-gray-200">{new Date(pageDetails.timestamp * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {pageDetails.headers && pageDetails.headers.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900 dark:border-neutral-800 dark:text-gray-200">Headers ({pageDetails.headers.length})</h3>
                <div className="flex flex-col gap-1.5">
                  {pageDetails.headers.slice(0, 5).map((header, idx) => (
                    <div key={idx} className="flex gap-2 rounded bg-gray-50 p-2 text-xs dark:bg-neutral-900">
                      <span className="min-w-[30px] font-semibold text-blue-600 dark:text-blue-400">{header.header_type}</span>
                      <span className="text-gray-900 dark:text-gray-200">{header.header_text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pageDetails.links && pageDetails.links.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900 dark:border-neutral-800 dark:text-gray-200">Links ({pageDetails.links.length})</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5 rounded bg-gray-50 px-3 py-2 font-medium text-gray-900 dark:bg-neutral-900 dark:text-gray-200"><TrendingUp size={14} /> Internal: {pageDetails.links.filter(l => l.link_type === 'internal').length}</span>
                  <span className="flex items-center gap-1.5 rounded bg-gray-50 px-3 py-2 font-medium text-gray-900 dark:bg-neutral-900 dark:text-gray-200"><ExternalLink size={14} /> External: {pageDetails.links.filter(l => l.link_type === 'external').length}</span>
                </div>
              </div>
            )}

            {pageDetails.file_assets && pageDetails.file_assets.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:col-span-2">
                <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900 dark:border-neutral-800 dark:text-gray-200">Files ({pageDetails.file_assets.length})</h3>
                <div className="flex flex-col gap-1.5">
                  {pageDetails.file_assets.map((file, idx) => (
                    <div key={idx} className="flex min-w-[300px] items-center gap-2 rounded bg-gray-50 p-2 text-xs dark:bg-neutral-900">
                      <File size={14} className="text-gray-500 dark:text-gray-400" />
                      <span className="inline-block rounded bg-blue-50 px-2 py-0.5 font-semibold uppercase text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{file.file_extension}</span>
                      <span className="flex-1 truncate text-gray-900 dark:text-gray-200">{file.file_name}</span>
                      {file.download_status === 'success' ? (
                        <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle size={14} className="text-red-600 dark:text-red-400" />
                      )}
                      <span className="min-w-[60px] font-medium text-gray-500 dark:text-gray-400">{localFormatBytes(file.file_size_bytes)}</span>
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
        <div className="w-full">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><BarChart3 size={24} /> Analytics</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh} 
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                disabled={isRefreshing}
                title="Refresh data"
              >
                <Activity size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => exportChartData({ depthDistribution, fileAnalytics }, 'analytics')}
                className="flex h-9 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                title="Export chart data"
              >
                <Download size={16} />
                Export Data
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Depth Distribution Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-200"><Layers size={18} /> Depth Distribution</h3>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 rounded-md border border-gray-200 bg-gray-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
                    <button 
                      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${chartTypes.depth === 'bar' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-black' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-800'}`}
                      onClick={() => setChartTypes(prev => ({ ...prev, depth: 'bar' }))}
                      title="Bar Chart"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button 
                      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${chartTypes.depth === 'pie' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-black' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-800'}`}
                      onClick={() => setChartTypes(prev => ({ ...prev, depth: 'pie' }))}
                      title="Pie Chart"
                    >
                      <PieChart size={16} />
                    </button>
                    <button 
                      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${chartTypes.depth === 'line' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-black' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-800'}`}
                      onClick={() => setChartTypes(prev => ({ ...prev, depth: 'line' }))}
                      title="Line Chart"
                    >
                      <Activity size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => exportChartData(depthDistribution, 'depth_distribution')}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                    title="Export this chart"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              {/* Bar Chart */}
              {chartTypes.depth === 'bar' && (
                <div className="flex flex-col gap-3" id="depth-chart">
                  {depthDistribution.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="group relative flex cursor-pointer items-center gap-3 transition-all hover:translate-x-1"
                      onMouseEnter={() => setHoveredChartItem({ type: 'depth', data: item })}
                      onMouseLeave={() => setHoveredChartItem(null)}
                    >
                      <span className="min-w-[100px] text-sm font-medium text-gray-900 dark:text-gray-200">Depth {item.depth}</span>
                      <div className="h-8 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-neutral-800 dark:bg-black">
                        <div 
                          className="flex h-full items-center justify-end bg-gradient-to-r from-blue-600 to-blue-500 pr-2 text-xs font-semibold text-white transition-all duration-300 dark:from-blue-500 dark:to-blue-400 dark:text-black"
                          style={{width: `${(item.page_count / Math.max(...depthDistribution.map(d => d.page_count))) * 100}%`}}
                        ></div>
                      </div>
                      <span className="min-w-[40px] text-right text-sm font-medium text-gray-500 dark:text-gray-400">{item.page_count}</span>
                      {hoveredChartItem?.type === 'depth' && hoveredChartItem?.data.depth === item.depth && (
                        <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-800 p-3 text-xs text-white shadow-xl dark:bg-white dark:text-gray-900">
                          <strong className="mb-1 block border-b border-gray-600 pb-1 text-sm dark:border-gray-200">Depth {item.depth}</strong>
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
                <div className="flex flex-col items-center gap-8 p-5 md:flex-row">
                  <svg viewBox="0 0 200 200" className="h-[200px] w-[200px] flex-shrink-0">
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
                            className="cursor-pointer transition-all hover:scale-105 hover:opacity-80"
                            style={{ transformOrigin: 'center' }}
                          >
                            <path
                              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={colors[idx % colors.length]}
                              stroke="#fff"
                              strokeWidth="2"
                              className="dark:stroke-neutral-950"
                            />
                          </g>
                        )
                      })
                    })()}
                  </svg>
                  <div className="flex flex-1 flex-col gap-3">
                    {depthDistribution.map((item, idx) => {
                      const colors = ['#1a73e8', '#4285f4', '#8ab4f8', '#aecbfa', '#d2e3fc', '#e8f0fe']
                      const total = depthDistribution.reduce((sum, d) => sum + d.page_count, 0)
                      return (
                        <div key={idx} className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 transition-transform hover:translate-x-1 hover:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                          <span className="h-4 w-4 flex-shrink-0 rounded bg-current" style={{ color: colors[idx % colors.length] }}></span>
                          <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-200">Depth {item.depth}</span>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.page_count} ({((item.page_count / total) * 100).toFixed(1)}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Line Chart */}
              {chartTypes.depth === 'line' && (
                <div className="relative p-5">
                  <svg viewBox="0 0 400 200" className="h-[200px] w-full">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.3" className="dark:stop-color-blue-400" />
                        <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.05" className="dark:stop-color-blue-400" />
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
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="stroke-blue-600 dark:stroke-blue-400"
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
                                strokeWidth="2"
                                className="cursor-pointer fill-blue-600 stroke-white transition-all hover:r-2 dark:fill-blue-400 dark:stroke-neutral-950"
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
                    <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-800 p-3 text-center text-xs text-white shadow-xl dark:bg-white dark:text-gray-900">
                      <strong className="block text-sm">Depth {hoveredChartItem.data.depth}</strong>
                      <div>Pages: {hoveredChartItem.data.page_count}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* File Type Analytics Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-200"><PieChart size={18} /> File Type Analytics</h3>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 rounded-md border border-gray-200 bg-gray-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
                    <button 
                      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${chartTypes.fileType === 'bar' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-black' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-800'}`}
                      onClick={() => setChartTypes(prev => ({ ...prev, fileType: 'bar' }))}
                      title="Bar Chart"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button 
                      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${chartTypes.fileType === 'table' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-black' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-800'}`}
                      onClick={() => setChartTypes(prev => ({ ...prev, fileType: 'table' }))}
                      title="Table View"
                    >
                      <Layers size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => exportChartData(fileAnalytics, 'file_analytics')}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                    title="Export this chart"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              {/* Bar Chart for File Types */}
              {chartTypes.fileType === 'bar' && (
                <div className="flex flex-col gap-3">
                  {fileAnalytics.slice(0, 10).map((item, idx) => (
                    <div 
                      key={idx} 
                      className="group relative flex cursor-pointer items-center gap-3 transition-all hover:translate-x-1"
                      onMouseEnter={() => setHoveredChartItem({ type: 'file', data: item })}
                      onMouseLeave={() => setHoveredChartItem(null)}
                    >
                      <span className="min-w-[60px] text-sm font-medium text-gray-900 dark:text-gray-200">{item.file_extension}</span>
                      <div className="h-8 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-neutral-800 dark:bg-black">
                        <div 
                          className="flex h-full items-center justify-end bg-gradient-to-r from-blue-600 to-blue-500 pr-2 text-xs font-semibold text-white transition-all duration-300 dark:from-blue-500 dark:to-blue-400 dark:text-black"
                          style={{width: `${(item.total_files / Math.max(...fileAnalytics.map(f => f.total_files))) * 100}%`}}
                        ></div>
                      </div>
                      <span className="min-w-[40px] text-right text-sm font-medium text-gray-500 dark:text-gray-400">{item.total_files}</span>
                      {hoveredChartItem?.type === 'file' && hoveredChartItem?.data.file_extension === item.file_extension && (
                        <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-800 p-3 text-xs text-white shadow-xl dark:bg-white dark:text-gray-900">
                          <strong className="mb-1 block border-b border-gray-600 pb-1 text-sm dark:border-gray-200">{item.file_extension} Files</strong>
                          <div>Total: {item.total_files}</div>
                          <div>Success: {item.successful}</div>
                          <div>Failed: {item.failed}</div>
                          <div>Avg Size: {localFormatBytes(item.avg_bytes)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Table View */}
              {chartTypes.fileType === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-white text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-400">
                        <th className="py-2.5 pl-0 pr-2">Type</th>
                        <th className="px-2 py-2.5">Total</th>
                        <th className="px-2 py-2.5">Success</th>
                        <th className="px-2 py-2.5">Failed</th>
                        <th className="px-2 py-2.5">Avg Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                      {fileAnalytics.slice(0, 10).map((item, idx) => (
                        <tr 
                          key={idx}
                          className="group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-900/50"
                          onMouseEnter={() => setHoveredChartItem({ type: 'file', data: item })}
                          onMouseLeave={() => setHoveredChartItem(null)}
                        >
                          <td className="py-2.5 pl-0 pr-2"><span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{item.file_extension}</span></td>
                          <td className="px-2 py-2.5 text-gray-900 dark:text-gray-200">{item.total_files}</td>
                          <td className="px-2 py-2.5 font-semibold text-green-700 dark:text-green-400">{item.successful}</td>
                          <td className="px-2 py-2.5 font-semibold text-red-700 dark:text-red-400">{item.failed}</td>
                          <td className="px-2 py-2.5 text-gray-900 dark:text-gray-200">{localFormatBytes(item.avg_bytes)}</td>
                          {hoveredChartItem?.type === 'file' && hoveredChartItem?.data.file_extension === item.file_extension && (
                            <td className="absolute left-full top-0 ml-2 p-0">
                              <div className="z-50 whitespace-nowrap rounded-lg bg-gray-800 p-3 text-xs text-white shadow-xl dark:bg-white dark:text-gray-900">
                                <strong className="mb-1 block border-b border-gray-600 pb-1 text-sm dark:border-gray-200">{item.file_extension} Files</strong>
                                <div>Success Rate: {((item.successful / item.total_files) * 100).toFixed(1)}%</div>
                                <div>Total Size: {localFormatBytes(item.avg_bytes * item.total_files)}</div>
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
        <div className="w-full">
          <h1 className="mb-5 flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><Activity size={24} /> Scraping Timeline</h1>
          <div className="flex flex-col gap-3">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200">
                  <Calendar size={16} />
                  {item.date}
                </div>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FileText size={14} /> <strong className="text-gray-900 dark:text-gray-200">{item.pages_scraped}</strong> pages
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Layers size={14} /> <strong className="text-gray-900 dark:text-gray-200">{item.depths_reached}</strong> depths
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domains View */}
      {activeView === 'domains' && !loading && (
        <div className="w-full">
          <h1 className="mb-5 flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><Layers size={24} /> Domain Statistics</h1>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Pages</th>
                    <th className="px-4 py-3">Avg Depth</th>
                    <th className="px-4 py-3">First Scraped</th>
                    <th className="px-4 py-3">Last Scraped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {domains.map((domain, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                      <td className="max-w-xs px-4 py-3">
                        <a href={domain.domain} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-blue-600 hover:underline dark:text-blue-400">
                          <ExternalLink size={14} className="flex-shrink-0" /> <span className="truncate">{domain.domain}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">{domain.page_count}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{domain.avg_depth?.toFixed(1)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(domain.first_scraped * 1000).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(domain.last_scraped * 1000).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Link Analysis View */}
      {activeView === 'link-analysis' && linkAnalysis && !loading && (
        <div className="w-full">
          <h1 className="mb-5 flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><AlertCircle size={24} /> Link Analysis</h1>
          
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-200"><XCircle size={18} /> Broken Links ({linkAnalysis.broken_links?.length || 0})</h3>
              <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                        <th className="px-4 py-3">URL</th>
                        <th className="px-4 py-3">References</th>
                        <th className="px-4 py-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                      {linkAnalysis.broken_links?.slice(0, 20).map((link, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                          <td className="max-w-[200px] px-4 py-3">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-blue-600 hover:underline dark:text-blue-400">
                              <ExternalLink size={14} className="flex-shrink-0" /> <span className="truncate">{link.url}</span>
                            </a>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">{link.reference_count}</td>
                          <td className="px-4 py-3"><span className="inline-block rounded bg-green-50 px-2 py-0.5 text-xs font-semibold uppercase text-green-700 dark:bg-green-900/20 dark:text-green-400">{link.link_type}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-200"><TrendingUp size={18} /> Most Referenced Pages</h3>
              <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                        <th className="px-4 py-3">Page</th>
                        <th className="px-4 py-3">Inbound Links</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                      {linkAnalysis.most_referenced_pages?.map((page, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                          <td className="max-w-[250px] px-4 py-3">
                            <a href={page.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-blue-600 hover:underline dark:text-blue-400">
                              <FileText size={14} className="flex-shrink-0" /> <span className="truncate">{page.title || page.url}</span>
                            </a>
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{page.inbound_links}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Analytics View */}
      {activeView === 'performance' && !loading && (
        <div className="w-full">
          <div className="mb-5">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><TrendingUp size={24} /> Performance Analytics</h1>
          </div>

          {performanceAnalytics ? (
            <div className="flex flex-col gap-6">
              {/* Timeline Stats */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950 md:col-span-2 lg:col-span-4">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-200"><Clock size={18} /> Crawl Timeline</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex justify-between border-b border-gray-200 py-2 dark:border-neutral-800 sm:border-0 sm:block sm:border-r sm:px-4 sm:py-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                      <strong className="block text-lg text-gray-900 dark:text-gray-200">{(performanceAnalytics.timeline.duration / 60).toFixed(1)} minutes</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-2 dark:border-neutral-800 sm:border-0 sm:block sm:border-r sm:px-4 sm:py-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Pages</span>
                      <strong className="block text-lg text-gray-900 dark:text-gray-200">{performanceAnalytics.timeline.total_pages}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-2 dark:border-neutral-800 sm:border-0 sm:block sm:border-r sm:px-4 sm:py-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Speed</span>
                      <strong className="block text-lg text-gray-900 dark:text-gray-200">{performanceAnalytics.timeline.pages_per_second.toFixed(2)} pages/sec</strong>
                    </div>
                    <div className="flex justify-between py-2 sm:block sm:px-4 sm:py-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Rate</span>
                      <strong className="block text-lg text-gray-900 dark:text-gray-200">{performanceAnalytics.timeline.pages_per_minute.toFixed(1)} pages/min</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proxy Statistics */}
              {performanceAnalytics.proxy_stats.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200"><Activity size={18} /> Proxy Usage</h3>
                  <div className="flex flex-col gap-3">
                    {performanceAnalytics.proxy_stats.map((proxy, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="min-w-[150px] text-sm font-medium text-gray-900 dark:text-gray-200">{proxy.proxy}</span>
                        <div className="h-8 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-neutral-800 dark:bg-black">
                          <div
                            className="flex h-full items-center justify-end bg-gradient-to-r from-blue-600 to-blue-500 pr-2 text-xs font-semibold text-white transition-all duration-300 dark:from-blue-500 dark:to-blue-400 dark:text-black"
                            style={{ width: `${proxy.percentage}%` }}
                          ></div>
                        </div>
                        <span className="min-w-[120px] text-right text-sm font-medium text-gray-500 dark:text-gray-400">{proxy.page_count} ({proxy.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Depth Distribution */}
              {performanceAnalytics.depth_stats.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200"><Layers size={18} /> Depth Distribution</h3>
                  <div className="flex flex-col gap-3">
                    {performanceAnalytics.depth_stats.map((depth, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="min-w-[150px] text-sm font-medium text-gray-900 dark:text-gray-200">Depth {depth.depth}</span>
                        <div className="h-8 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-neutral-800 dark:bg-black">
                          <div
                            className="flex h-full items-center justify-end bg-gradient-to-r from-blue-600 to-blue-500 pr-2 text-xs font-semibold text-white transition-all duration-300 dark:from-blue-500 dark:to-blue-400 dark:text-black"
                            style={{ width: `${depth.percentage}%` }}
                          ></div>
                        </div>
                        <span className="min-w-[120px] text-right text-sm font-medium text-gray-500 dark:text-gray-400">{depth.page_count} ({depth.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pages Per Minute */}
              {performanceAnalytics.timeline.pages_per_minute_breakdown?.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200"><Activity size={18} /> Pages Per Minute</h3>
                  <div className="flex flex-col gap-3">
                    {performanceAnalytics.timeline.pages_per_minute_breakdown.map((bucket, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="min-w-[150px] text-sm font-medium text-gray-900 dark:text-gray-200">Min {bucket.minute}</span>
                        <div className="h-8 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-neutral-800 dark:bg-black">
                          <div
                            className="flex h-full items-center justify-end bg-gradient-to-r from-blue-600 to-blue-500 pr-2 text-xs font-semibold text-white transition-all duration-300 dark:from-blue-500 dark:to-blue-400 dark:text-black"
                            style={{ 
                              width: `${(bucket.count / Math.max(...performanceAnalytics.timeline.pages_per_minute_breakdown.map(b => b.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="min-w-[40px] text-right text-sm font-medium text-gray-500 dark:text-gray-400">{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
              <TrendingUp size={48} className="mb-4 opacity-50" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">No performance data available</h3>
              <p className="text-sm">Performance analytics will appear here after scraping pages</p>
            </div>
          )}
        </div>
      )}

      {/* Fingerprint Analytics View */}
      {activeView === 'fingerprints' && !loading && (
        <div className="w-full">
          <div className="mb-5">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><Hash size={24} /> Fingerprint Analysis</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Browser fingerprint diversity helps avoid detection
            </p>
          </div>

          {fingerprintAnalytics ? (
            <div className="flex flex-col gap-6">
              {/* Diversity Score */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-6 dark:border-blue-900/30 dark:from-neutral-950 dark:to-blue-900/10 md:col-span-2">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-200">Fingerprint Diversity</h3>
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-3xl font-bold text-white shadow-lg shadow-blue-500/30 dark:from-blue-500 dark:to-blue-400 dark:text-black">
                      <span className="text-3xl font-bold text-white dark:text-black">{fingerprintAnalytics.diversity_score}%</span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex justify-between border-b border-blue-100 py-2 dark:border-blue-900/30">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Pages:</span>
                        <strong className="text-gray-900 dark:text-gray-200">{fingerprintAnalytics.total_pages}</strong>
                      </div>
                      <div className="flex justify-between border-b border-blue-100 py-2 dark:border-blue-900/30">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Unique Combinations:</span>
                        <strong className="text-gray-900 dark:text-gray-200">{fingerprintAnalytics.unique_combinations}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timezones */}
              {fingerprintAnalytics.timezones.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200"><Calendar size={18} /> Timezone Distribution</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {fingerprintAnalytics.timezones.map((tz, idx) => (
                      <div key={idx} className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-500 hover:shadow-sm dark:border-neutral-800 dark:bg-black dark:hover:border-blue-400">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{tz.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{tz.count} pages</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Viewports */}
              {fingerprintAnalytics.viewports.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200"><LayoutDashboard size={18} /> Viewport Distribution</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {fingerprintAnalytics.viewports.map((vp, idx) => (
                      <div key={idx} className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-500 hover:shadow-sm dark:border-neutral-800 dark:bg-black dark:hover:border-blue-400">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{vp.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{vp.count} pages</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Agents */}
              {fingerprintAnalytics.user_agents.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200"><Activity size={18} /> User Agent Distribution</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {fingerprintAnalytics.user_agents.map((ua, idx) => (
                      <div key={idx} className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-500 hover:shadow-sm dark:border-neutral-800 dark:bg-black dark:hover:border-blue-400">
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-200" title={ua.name}>{ua.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{ua.count} pages</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locales */}
              {fingerprintAnalytics.locales.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-200"><GitCompare size={18} /> Locale Distribution</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {fingerprintAnalytics.locales.map((locale, idx) => (
                      <div key={idx} className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-500 hover:shadow-sm dark:border-neutral-800 dark:bg-black dark:hover:border-blue-400">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{locale.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{locale.count} pages</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
              <Hash size={48} className="mb-4 opacity-50" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">No fingerprint data available</h3>
              <p className="text-sm">Fingerprint analytics will appear here after scraping with fingerprints enabled</p>
            </div>
          )}
        </div>
      )}

      {/* Geolocation Analytics View */}
      {activeView === 'geolocation' && !loading && (
        <div className="w-full">
          <div className="mb-5">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200"><GitCompare size={24} /> Geographical Distribution</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Apparent locations from geolocation fingerprints
            </p>
          </div>

          {geolocationAnalytics && geolocationAnalytics.locations.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
              <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-gray-200">Location Distribution ({geolocationAnalytics.total_pages} pages)</h3>
              <div className="flex flex-col gap-3">
                {geolocationAnalytics.locations.map((location, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="min-w-[150px] text-sm font-medium text-gray-900 dark:text-gray-200">{location.city}</span>
                    <div className="h-8 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-neutral-800 dark:bg-black">
                      <div
                        className="flex h-full items-center justify-end bg-gradient-to-r from-blue-600 to-blue-500 pr-2 text-xs font-semibold text-white transition-all duration-300 dark:from-blue-500 dark:to-blue-400 dark:text-black"
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                    <span className="min-w-[100px] text-right text-sm font-medium text-gray-500 dark:text-gray-400">{location.count} ({location.percentage.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
              <GitCompare size={48} className="mb-4 opacity-50" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">No geolocation data</h3>
              <p className="text-sm">Geolocation data will appear here after scraping with fingerprints enabled</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default DatabaseViews