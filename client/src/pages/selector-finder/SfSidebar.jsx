import {
  Search, FileCode, TestTube, MousePointer, 
  Sparkles, Library, FormInput
} from 'lucide-react'
import { InlineButtonSkeleton } from '../../components/mui/skeletons/SkeletonLoader'

const SelectorSidebar = ({ 
  activeSection, setActiveSection, 
  loginUrl, setLoginUrl, 
  loading, handleAnalyze, 
  libraryCount, historyCount, 
  hasResults 
}) => {
  return (
    <aside 
      className="flex w-full flex-col border-b border-gray-200 bg-white py-3 dark:border-neutral-800 dark:bg-neutral-950 md:sticky md:top-[68px] md:h-[calc(100vh-60px)] md:w-[200px] md:border-b-0 md:border-r md:overflow-y-auto"
      role="complementary"
    >
      <h2 className="mb-4 flex items-center gap-2 px-4 text-base font-semibold text-gray-900 dark:text-gray-200">
        <Search size={20} /> Selector Finder
      </h2>

      <nav className="flex flex-col gap-0.5 px-2">
        <button
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 ${
            activeSection === 'analyze' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveSection('analyze')}
        >
          <FileCode size={18} />
          Analyze Page
        </button>
        <button
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
            activeSection === 'test' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveSection('test')}
          disabled={!hasResults}
        >
          <TestTube size={18} />
          Test Login
        </button>
        <button
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 ${
            activeSection === 'selector-test' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveSection('selector-test')}
        >
          <MousePointer size={18} />
          Test Selector
        </button>
        <button
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 ${
            activeSection === 'generate' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveSection('generate')}
        >
          <Sparkles size={18} />
          Generate Robust
        </button>
        <button
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 ${
            activeSection === 'library' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveSection('library')}
        >
          <Library size={18} />
          Library ({libraryCount})
        </button>
        <button
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 ${
            activeSection === 'history' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveSection('history')}
        >
          <FormInput size={18} />
          History ({historyCount})
        </button>
        <button
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 ${
            activeSection === 'finder' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveSection('finder')}
        >
          <Search size={18} />
          Find Element
        </button>
      </nav>

      {/* URL Input in Sidebar */}
      <div className="mt-6 border-t border-gray-200 px-4 pt-6 dark:border-neutral-800">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Login Page URL</label>
        <input
          type="url"
          className="mb-3 w-full rounded-[20px] border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-gray-900 transition-all duration-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          placeholder="https://example.com/login"
          value={loginUrl}
          onChange={(e) => setLoginUrl(e.target.value)}
          disabled={loading}
        />
        <button
          className="w-full rounded bg-blue-600 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
          onClick={handleAnalyze}
          disabled={loading || !loginUrl}
        >
          {loading ? <InlineButtonSkeleton /> : 'Analyze'}
        </button>
      </div>
    </aside>
  )
}

export default SelectorSidebar