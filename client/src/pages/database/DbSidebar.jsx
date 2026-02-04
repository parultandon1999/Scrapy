import { 
  LayoutDashboard, FileText, FolderOpen, Package, 
  HardDrive, Link2, Search, Download, BarChart3, 
  Activity, Layers, AlertCircle, TrendingUp, Hash, 
  GitCompare, Database as DatabaseIcon 
} from 'lucide-react'

const DatabaseSidebar = ({ activeView, setActiveView, onExport, loading }) => {
  return (
    <aside 
      className="fixed bottom-0 left-0 right-0 z-50 flex w-full flex-col border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95 md:sticky md:top-[68px] md:h-[calc(100vh-60px)] md:w-[200px] md:border-r md:border-t-0 md:bg-white md:shadow-none md:dark:bg-neutral-950"
      role="complementary" 
      aria-label="Database navigation"
    >
      <h2 className="mb-4 mt-0 hidden items-center gap-2 px-4 text-base font-semibold text-gray-800 dark:text-gray-200 md:flex">
        <DatabaseIcon size={20} /> Database
      </h2>
      
      <nav 
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible md:px-2" 
        aria-label="Database sections"
      >
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('dashboard')}
        >
          <LayoutDashboard className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Dashboard
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'pages' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('pages')}
        >
          <FileText className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Pages
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'files' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('files')}
        >
          <FolderOpen className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Files
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'files-by-ext' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('files-by-ext')}
        >
          <Package className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          By Type
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'largest-downloads' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('largest-downloads')}
        >
          <HardDrive className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Largest
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'top-links' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('top-links')}
        >
          <Link2 className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Links
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'search' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('search')}
        >
          <Search className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Search
        </button>
        
        <div className="mx-2 my-3 hidden h-px bg-gray-200 dark:bg-neutral-800 md:block"></div>
        
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'analytics' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('analytics')}
        >
          <BarChart3 className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Analytics
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'timeline' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('timeline')}
        >
          <Activity className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Timeline
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'domains' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('domains')}
        >
          <Layers className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Domains
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'link-analysis' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('link-analysis')}
        >
          <AlertCircle className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Link Analysis
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'performance' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('performance')}
        >
          <TrendingUp className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Performance
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'fingerprints' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('fingerprints')}
        >
          <Hash className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Fingerprints
        </button>
        <button 
          className={`flex min-w-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-none bg-transparent p-2 text-[11px] font-medium transition-all duration-150 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2.5 md:px-3 md:py-2.5 md:text-[13px] ${activeView === 'geolocation' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'}`}
          onClick={() => setActiveView('geolocation')}
        >
          <GitCompare className="h-5 w-5 md:h-[18px] md:w-[18px]" />
          Geolocation
        </button>
      </nav>
      
      <div className="mt-auto p-3 border-t-0 md:border-t md:border-gray-200 md:p-4 dark:md:border-neutral-800">
        <button 
          onClick={onExport} 
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 p-2.5 text-[13px] font-medium text-white transition-all duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-neutral-950 dark:hover:bg-blue-400" 
          disabled={loading}
        >
          <Download size={16} />
          Export Data
        </button>
      </div>
    </aside>
  )
}

export default DatabaseSidebar