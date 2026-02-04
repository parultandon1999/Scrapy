import Breadcrumb from '../../components/mui/breadcrumbs/Breadcrumb'
import {
  Search, Copy, CheckCircle, XCircle, AlertCircle, X,
  FileCode, MousePointer, FormInput, TestTube, Plus, Minus, Image, Sparkles, Shield,
  BookmarkPlus, Library, Trash2, Star, Save
} from 'lucide-react'
import { SelectorAnalysisSkeleton, InlineButtonSkeleton } from '../../components/mui/skeletons/SkeletonLoader'

const SelectorViews = ({
  activeSection, setActiveSection,
  loading, error, setError,
  
  // Analyze Data
  results,

  // Test Login Data & Handlers
  testLoading, testResults, testData, setTestData, handleTestLogin,

  // Selector Test Data & Handlers
  testSelectorUrl, setTestSelectorUrl,
  testSelectorInput, setTestSelectorInput,
  testSelectorLoading, testSelectorResults, handleTestSelector,

  // Generate Data & Handlers
  generateUrl, setGenerateUrl,
  generateDescription, setGenerateDescription,
  generateLoading, generateResults, handleGenerateRobustSelector,

  // Finder Data & Handlers
  findUrl, setFindUrl,
  searchQueries, imageUrls,
  searchType, setSearchType,
  findLoading, findResults, handleFindElement,
  addSearchQuery, removeSearchQuery, updateSearchQuery,
  addImageUrl, removeImageUrl, updateImageUrl,

  // Library & History Data & Handlers
  selectorLibrary, handleUseFromLibrary, handleDeleteFromLibrary,
  testHistory, clearTestHistory,

  // Modal State
  showSaveModal, setShowSaveModal,
  selectorToSave, selectorName, setSelectorName,
  selectorDescription, setSelectorDescription, handleSaveToLibrary,

  // Helpers
  copyToClipboard, handleUseSuggestedSelector, handleUseForSelectorTest, openSaveModal
}) => {
  return (
    <main id="main-content" className="flex-1 w-full overflow-y-auto bg-white p-4 dark:bg-black md:p-6" role="main">
        <Breadcrumb 
          items={[
            { label: 'Selector Finder', icon: Search, path: '/selector-finder' },
            { label: activeSection === 'analyze' ? 'Analyze' :
                     activeSection === 'test' ? 'Test Selector' :
                     activeSection === 'generate' ? 'Generate Robust' :
                     activeSection === 'library' ? 'Library' :
                     activeSection === 'history' ? 'History' : 'Tools'
            }
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

        {/* Analyze Section */}
        {activeSection === 'analyze' && loading && <SelectorAnalysisSkeleton />}
        {activeSection === 'analyze' && results && (
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  <FileCode size={24} />
                  Analysis Results
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Found {results.inputs?.length || 0} inputs, {results.buttons?.length || 0} buttons, {results.forms?.length || 0} forms</p>
              </div>
            </div>

            {/* Suggested Configuration */}
            {results.suggested_config && Object.keys(results.suggested_config).length > 0 && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50/50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
                <div className="mb-4 flex items-center gap-2 border-b border-green-200 pb-3 text-base font-semibold text-green-800 dark:border-green-900/30 dark:text-green-400">
                  <CheckCircle size={18} /> <h3>Suggested Configuration</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.suggested_config.username_selector && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Username Selector</label>
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-xs dark:border-neutral-800 dark:bg-black">
                        <code className="flex-1 font-mono text-blue-600 dark:text-blue-400 truncate">{results.suggested_config.username_selector}</code>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => copyToClipboard(results.suggested_config.username_selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          onClick={() => handleUseForSelectorTest(results.suggested_config.username_selector)}
                          title="Test this selector"
                        >
                          <TestTube size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => handleUseSuggestedSelector('usernameSelector', results.suggested_config.username_selector)}
                          title="Use in test"
                        >
                          <MousePointer size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  {results.suggested_config.password_selector && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Password Selector</label>
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-xs dark:border-neutral-800 dark:bg-black">
                        <code className="flex-1 font-mono text-blue-600 dark:text-blue-400 truncate">{results.suggested_config.password_selector}</code>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => copyToClipboard(results.suggested_config.password_selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          onClick={() => handleUseForSelectorTest(results.suggested_config.password_selector)}
                          title="Test this selector"
                        >
                          <TestTube size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => handleUseSuggestedSelector('passwordSelector', results.suggested_config.password_selector)}
                          title="Use in test"
                        >
                          <MousePointer size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  {results.suggested_config.submit_selector && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Submit Selector</label>
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-xs dark:border-neutral-800 dark:bg-black">
                        <code className="flex-1 font-mono text-blue-600 dark:text-blue-400 truncate">{results.suggested_config.submit_selector}</code>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => copyToClipboard(results.suggested_config.submit_selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          onClick={() => handleUseForSelectorTest(results.suggested_config.submit_selector)}
                          title="Test this selector"
                        >
                          <TestTube size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => handleUseSuggestedSelector('submitSelector', results.suggested_config.submit_selector)}
                          title="Use in test"
                        >
                          <MousePointer size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input Fields */}
            {results.inputs && results.inputs.length > 0 && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-base font-semibold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                  <FormInput size={18} /> <h3>Input Fields ({results.inputs.length})</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.inputs.map((input, idx) => (
                    <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900" key={idx}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-neutral-800 dark:text-gray-400">{input.type}</span>
                        {input.likely_field !== 'text' && (
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            input.likely_field === 'username' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            input.likely_field === 'password' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-gray-400'
                          }`}>{input.likely_field}</span>
                        )}
                      </div>
                      <div className="mb-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {input.name && <p><strong className="text-gray-900 dark:text-gray-200">Name:</strong> {input.name}</p>}
                        {input.id && <p><strong className="text-gray-900 dark:text-gray-200">ID:</strong> {input.id}</p>}
                        {input.placeholder && <p><strong className="text-gray-900 dark:text-gray-200">Placeholder:</strong> {input.placeholder}</p>}
                      </div>
                      {input.suggested_selectors && input.suggested_selectors.length > 0 && (
                        <div className="mt-auto border-t border-gray-200 pt-2 dark:border-neutral-800">
                          <strong className="mb-1.5 block text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Selectors:</strong>
                          {input.suggested_selectors.map((sel, i) => (
                            <div className="mb-1 flex cursor-pointer items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-black dark:hover:border-blue-700 dark:hover:bg-blue-900/10" key={i} onClick={() => copyToClipboard(sel)}>
                              <code className="flex-1 font-mono text-[10px] text-blue-600 dark:text-blue-400 truncate">{sel}</code>
                              <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            {results.buttons && results.buttons.length > 0 && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-base font-semibold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                  <MousePointer size={18} /> <h3>Buttons ({results.buttons.length})</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.buttons.map((button, idx) => (
                    <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900" key={idx}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-neutral-800 dark:text-gray-400">{button.type || 'button'}</span>
                        {button.likely_submit && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:bg-green-900/30 dark:text-green-400">submit</span>
                        )}
                      </div>
                      <div className="mb-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {button.text && <p><strong className="text-gray-900 dark:text-gray-200">Text:</strong> {button.text}</p>}
                        {button.id && <p><strong className="text-gray-900 dark:text-gray-200">ID:</strong> {button.id}</p>}
                      </div>
                      {button.suggested_selectors && button.suggested_selectors.length > 0 && (
                        <div className="mt-auto border-t border-gray-200 pt-2 dark:border-neutral-800">
                          <strong className="mb-1.5 block text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Selectors:</strong>
                          {button.suggested_selectors.map((sel, i) => (
                            <div className="mb-1 flex cursor-pointer items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-black dark:hover:border-blue-700 dark:hover:bg-blue-900/10" key={i} onClick={() => copyToClipboard(sel)}>
                              <code className="flex-1 font-mono text-[10px] text-blue-600 dark:text-blue-400 truncate">{sel}</code>
                              <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forms */}
            {results.forms && results.forms.length > 0 && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-base font-semibold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                  <h3>Forms ({results.forms.length})</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.forms.map((form, idx) => (
                    <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900" key={idx}>
                      <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">Form #{form.index}</p>
                      {form.id && <p className="text-xs text-gray-500 dark:text-gray-400"><strong className="text-gray-900 dark:text-gray-200">ID:</strong> {form.id}</p>}
                      {form.action && <p className="text-xs text-gray-500 dark:text-gray-400"><strong className="text-gray-900 dark:text-gray-200">Action:</strong> {form.action}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Login Section */}
        {activeSection === 'test' && (
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  <TestTube size={24} />
                  Test Login
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Test your selectors with actual credentials</p>
              </div>
            </div>

            <form className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950" onSubmit={handleTestLogin}>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                  <input
                    type="text"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testData.username}
                    onChange={(e) => setTestData({...testData, username: e.target.value})}
                    placeholder="Enter test username"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testData.password}
                    onChange={(e) => setTestData({...testData, password: e.target.value})}
                    placeholder="Enter test password"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username Selector</label>
                  <input
                    type="text"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testData.usernameSelector}
                    onChange={(e) => setTestData({...testData, usernameSelector: e.target.value})}
                    placeholder="input[name='username']"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password Selector</label>
                  <input
                    type="text"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testData.passwordSelector}
                    onChange={(e) => setTestData({...testData, passwordSelector: e.target.value})}
                    placeholder="input[name='password']"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Submit Selector</label>
                  <input
                    type="text"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testData.submitSelector}
                    onChange={(e) => setTestData({...testData, submitSelector: e.target.value})}
                    placeholder="button[type='submit']"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Success Indicator (Optional)</label>
                  <input
                    type="text"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testData.successIndicator}
                    onChange={(e) => setTestData({...testData, successIndicator: e.target.value})}
                    placeholder=".user-profile"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
                disabled={testLoading}
              >
                {testLoading ? <InlineButtonSkeleton /> : 'Test Login'}
              </button>
            </form>

            {/* Test Results */}
            {testResults && (
              <div className={`mt-6 overflow-hidden rounded-lg border border-l-4 bg-white p-5 shadow-sm dark:bg-neutral-950 ${testResults.success ? 'border-gray-200 border-l-green-500 dark:border-neutral-800 dark:border-l-green-500' : 'border-gray-200 border-l-red-500 dark:border-neutral-800 dark:border-l-red-500'}`}>
                <div className={`mb-4 flex items-center gap-3 border-b pb-3 ${testResults.success ? 'border-green-100 text-green-700 dark:border-green-900/30 dark:text-green-400' : 'border-red-100 text-red-700 dark:border-red-900/30 dark:text-red-400'}`}>
                  {testResults.success ? (
                    <CheckCircle size={24} />
                  ) : (
                    <XCircle size={24} />
                  )}
                  <h3 className="text-base font-semibold">{testResults.message}</h3>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm dark:bg-neutral-900">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Initial URL:</span>
                    <code className="font-mono text-blue-600 dark:text-blue-400 break-all text-xs">{testResults.initial_url}</code>
                  </div>
                  <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm dark:bg-neutral-900">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Final URL:</span>
                    <code className="font-mono text-blue-600 dark:text-blue-400 break-all text-xs">{testResults.final_url}</code>
                  </div>
                  <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm dark:bg-neutral-900">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">URL Changed:</span>
                    <span className={`font-semibold ${testResults.url_changed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {testResults.url_changed ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {testData.successIndicator && (
                    <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm dark:bg-neutral-900">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Success Indicator Found:</span>
                      <span className={`font-semibold ${testResults.success_indicator_found ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {testResults.success_indicator_found ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
                {testResults.errors && testResults.errors.length > 0 && (
                  <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
                    <strong className="mb-2 block text-xs font-semibold uppercase text-red-700 dark:text-red-400">Errors:</strong>
                    {testResults.errors.map((err, i) => (
                      <p className="text-xs text-red-600 dark:text-red-300" key={i}>{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Test Selector Section */}
        {activeSection === 'selector-test' && (
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  <MousePointer size={24} />
                  Test CSS Selector
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Test any CSS selector and see which elements it matches</p>
              </div>
            </div>

            <form className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950" onSubmit={handleTestSelector}>
              <div className="mb-6 grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Page URL</label>
                  <input
                    type="url"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testSelectorUrl}
                    onChange={(e) => setTestSelectorUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">CSS Selector</label>
                  <input
                    type="text"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={testSelectorInput}
                    onChange={(e) => setTestSelectorInput(e.target.value)}
                    placeholder="input[name='username'], .btn-primary, #submit-button"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Examples: <code className="rounded bg-gray-100 px-1 py-0.5 text-blue-600 dark:bg-neutral-800 dark:text-blue-400">button[type="submit"]</code>, <code className="rounded bg-gray-100 px-1 py-0.5 text-blue-600 dark:bg-neutral-800 dark:text-blue-400">.login-form input</code>, <code className="rounded bg-gray-100 px-1 py-0.5 text-blue-600 dark:bg-neutral-800 dark:text-blue-400">#username</code>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
                disabled={testSelectorLoading}
              >
                {testSelectorLoading ? <InlineButtonSkeleton /> : 'Test Selector'}
              </button>
            </form>

            {/* Test Selector Results */}
            {testSelectorResults && (
              <div className={`mt-6 overflow-hidden rounded-lg border border-l-4 bg-white p-5 shadow-sm dark:bg-neutral-950 ${testSelectorResults.success ? 'border-gray-200 border-l-green-500 dark:border-neutral-800 dark:border-l-green-500' : 'border-gray-200 border-l-red-500 dark:border-neutral-800 dark:border-l-red-500'}`}>
                <div className={`mb-4 flex flex-wrap items-center gap-3 border-b pb-3 ${testSelectorResults.success ? 'border-green-100 text-green-700 dark:border-green-900/30 dark:text-green-400' : 'border-red-100 text-red-700 dark:border-red-900/30 dark:text-red-400'}`}>
                  {testSelectorResults.success ? (
                    <>
                      <CheckCircle size={24} />
                      <h3 className="flex-1 text-base font-semibold">Found {testSelectorResults.matched_count} element{testSelectorResults.matched_count !== 1 ? 's' : ''}</h3>
                      <button
                        className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-green-700 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
                        onClick={() => openSaveModal(testSelectorInput)}
                        title="Save to Library"
                      >
                        <BookmarkPlus size={16} />
                        Save to Library
                      </button>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} />
                      <h3 className="text-base font-semibold">{testSelectorResults.error || 'No elements matched'}</h3>
                    </>
                  )}
                </div>

                {/* Strength Indicator */}
                {testSelectorResults.strength && (
                  <div className="mb-5 mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <Shield size={18} />
                      <h4>Selector Strength</h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${testSelectorResults.strength.score}%`,
                            background: testSelectorResults.strength.color
                          }}
                        ></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider" style={{
                          background: testSelectorResults.strength.color,
                        }}>
                          {testSelectorResults.strength.strength.toUpperCase()}
                        </span>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-200">{testSelectorResults.strength.score}/100</span>
                        <span className="text-xs italic text-gray-500 dark:text-gray-400">{testSelectorResults.strength.description}</span>
                      </div>
                    </div>
                  </div>
                )}

                {testSelectorResults.success && testSelectorResults.elements && testSelectorResults.elements.length > 0 && (
                  <div className="mt-5 flex flex-col gap-4">
                    {testSelectorResults.elements.map((elem, idx) => (
                      <div className="overflow-hidden rounded-lg border-l-4 border-green-500 bg-green-50/30 transition-all dark:border-green-500 dark:bg-green-900/10" key={idx}>
                        <div className="border-b border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold uppercase text-white dark:bg-blue-500 dark:text-black">{elem.tag}</span>
                            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Element {elem.index + 1}</span>
                            {elem.attributes?.id && <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">#{elem.attributes.id}</span>}
                            {elem.attributes?.class && (
                              <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">.{elem.attributes.class.split(' ')[0]}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 p-4">
                          {/* Text Content */}
                          {elem.text && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Text Content:</strong>
                              <p className="rounded-md border border-gray-200 bg-white p-2.5 text-xs text-gray-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200">{elem.text}</p>
                            </div>
                          )}

                          {/* Attributes */}
                          {elem.attributes && Object.keys(elem.attributes).length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Attributes:</strong>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(elem.attributes).map(([key, value]) => (
                                  <div className="flex flex-col gap-1 rounded bg-white p-2 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800" key={key}>
                                    <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">{key}:</span>
                                    <code className="break-all font-mono text-xs text-blue-600 dark:text-blue-400">{value}</code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Inner HTML */}
                          {elem.inner_html && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Inner HTML:</strong>
                              <div className="relative rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                <code className="block whitespace-pre-wrap break-all font-mono text-xs text-gray-800 dark:text-gray-300">{elem.inner_html}</code>
                                <button
                                  className="absolute right-2 top-2 rounded p-1 hover:bg-gray-200 dark:hover:bg-neutral-800"
                                  onClick={() => copyToClipboard(elem.inner_html)}
                                  title="Copy"
                                >
                                  <Copy size={14} className="text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Bounding Box / Position */}
                          {elem.bounding_box && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Position on Page:</strong>
                              <div className="flex flex-col gap-3">
                                <p className="rounded-md border border-gray-200 bg-white p-2 font-mono text-xs text-gray-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                                  x: {Math.round(elem.bounding_box.x)}px, 
                                  y: {Math.round(elem.bounding_box.y)}px, 
                                  width: {Math.round(elem.bounding_box.width)}px, 
                                  height: {Math.round(elem.bounding_box.height)}px
                                </p>
                                <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                  <div className="flex-shrink-0" style={{
                                    width: `${Math.min(elem.bounding_box.width / 10, 100)}px`,
                                    height: `${Math.min(elem.bounding_box.height / 10, 60)}px`,
                                    border: '2px solid #3b82f6',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '4px'
                                  }}></div>
                                  <span className="text-xs italic text-gray-500 dark:text-gray-400">Visual representation (scaled)</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {testSelectorResults.matched_count > 20 && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <AlertCircle size={16} />
                        <p className="text-sm">Showing first 20 of {testSelectorResults.matched_count} matched elements</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Generate Robust Selector Section */}
        {activeSection === 'generate' && (
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  <Sparkles size={24} />
                  Generate Robust Selector
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create multiple fallback selectors with reliability scores</p>
              </div>
            </div>

            <form className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950" onSubmit={handleGenerateRobustSelector}>
              <div className="mb-6 grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Page URL</label>
                  <input
                    type="url"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={generateUrl}
                    onChange={(e) => setGenerateUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Element Description</label>
                  <input
                    type="text"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={generateDescription}
                    onChange={(e) => setGenerateDescription(e.target.value)}
                    placeholder="e.g., 'login button', 'username field', 'submit button'"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Describe the element you want to find. Examples: "login button", "email input", "submit form"
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
                disabled={generateLoading}
              >
                {generateLoading ? <InlineButtonSkeleton /> : 'Generate Selectors'}
              </button>
            </form>

            {/* Generate Results */}
            {generateResults && (
              <div className={`mt-6 overflow-hidden rounded-lg border border-l-4 bg-white p-5 shadow-sm dark:bg-neutral-950 ${generateResults.success ? 'border-gray-200 border-l-green-500 dark:border-neutral-800 dark:border-l-green-500' : 'border-gray-200 border-l-red-500 dark:border-neutral-800 dark:border-l-red-500'}`}>
                <div className={`mb-4 flex flex-wrap items-center gap-3 border-b pb-3 ${generateResults.success ? 'border-green-100 text-green-700 dark:border-green-900/30 dark:text-green-400' : 'border-red-100 text-red-700 dark:border-red-900/30 dark:text-red-400'}`}>
                  {generateResults.success ? (
                    <>
                      <CheckCircle size={24} />
                      <h3 className="text-base font-semibold">Generated {generateResults.selectors?.length || 0} Selector{generateResults.selectors?.length !== 1 ? 's' : ''}</h3>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} />
                      <h3 className="text-base font-semibold">{generateResults.error || 'Failed to generate selectors'}</h3>
                    </>
                  )}
                </div>

                {generateResults.success && generateResults.selectors && generateResults.selectors.length > 0 && (
                  <div className="mt-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300">
                      <AlertCircle size={16} />
                      <p>Selectors are ordered by reliability. Use the strongest selector for production.</p>
                    </div>
                    
                    {generateResults.selectors.map((selectorData, idx) => (
                      <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-blue-500 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500" key={idx}>
                        <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white dark:bg-blue-500 dark:text-black">#{idx + 1}</div>
                          <div className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-200">{selectorData.type}</div>
                          <div className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {selectorData.matches} match{selectorData.matches !== 1 ? 'es' : ''}
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="mb-3 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                            <code className="flex-1 font-mono text-sm text-blue-600 dark:text-blue-400 break-all">{selectorData.selector}</code>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-700"
                              onClick={() => copyToClipboard(selectorData.selector)}
                              title="Copy"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              onClick={() => {
                                setTestSelectorInput(selectorData.selector)
                                setTestSelectorUrl(generateUrl)
                                setActiveSection('selector-test')
                              }}
                              title="Test this selector"
                            >
                              <TestTube size={14} />
                            </button>
                          </div>

                          {/* Strength Indicator */}
                          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${selectorData.strength.score}%`,
                                  background: selectorData.strength.color
                                }}
                              ></div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider" style={{
                                background: selectorData.strength.color,
                              }}>
                                {selectorData.strength.strength.toUpperCase()}
                              </span>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{selectorData.strength.score}/100</span>
                              <span className="text-xs italic text-gray-500 dark:text-gray-400">{selectorData.strength.description}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Element Finder Section */}
        {activeSection === 'finder' && (
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  <Search size={24} />
                  Find Element by Content
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Search for elements containing specific text or content</p>
              </div>
            </div>

            <form className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950" onSubmit={handleFindElement}>
              <div className="mb-6 grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Page URL</label>
                  <input
                    type="url"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                    value={findUrl}
                    onChange={(e) => setFindUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search Queries (Text - Multiple)</label>
                  {searchQueries.map((query, index) => (
                    <div className="flex gap-2" key={index}>
                      <input
                        type="text"
                        className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                        value={query}
                        onChange={(e) => updateSearchQuery(index, e.target.value)}
                        placeholder={`Search text ${index + 1}`}
                      />
                      {searchQueries.length > 1 && (
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500 text-white transition-all hover:bg-red-600 dark:bg-red-500 dark:text-black dark:hover:bg-red-400"
                          onClick={() => removeSearchQuery(index)}
                          title="Remove"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                      {index === searchQueries.length - 1 && (
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-md bg-green-600 text-white transition-all hover:bg-green-700 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
                          onClick={addSearchQuery}
                          title="Add another"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Image size={14} className="text-gray-500 dark:text-gray-400" />
                    Image URLs (Multiple)
                  </label>
                  {imageUrls.map((url, index) => (
                    <div className="flex gap-2" key={index}>
                      <input
                        type="text"
                        className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder={`Image URL or partial URL ${index + 1}`}
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500 text-white transition-all hover:bg-red-600 dark:bg-red-500 dark:text-black dark:hover:bg-red-400"
                          onClick={() => removeImageUrl(index)}
                          title="Remove"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                      {index === imageUrls.length - 1 && (
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-md bg-green-600 text-white transition-all hover:bg-green-700 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
                          onClick={addImageUrl}
                          title="Add another"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                  >
                    <option value="partial">Partial Match (Recommended)</option>
                    <option value="text">Exact Match</option>
                    <option value="attribute">Contains Text</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
                disabled={findLoading}
              >
                {findLoading ? <InlineButtonSkeleton /> : 'Find Elements'}
              </button>
            </form>

            {/* Find Results */}
            {findResults && findResults.results_by_query && (
              <div className="flex flex-col gap-6">
                {Object.entries(findResults.results_by_query).map(([, queryData], queryIdx) => (
                  <div className="overflow-hidden rounded-lg border-l-4 border-blue-600 bg-white p-5 shadow-sm dark:border-blue-500 dark:bg-neutral-950" key={queryIdx}>
                    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-neutral-800">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-200">
                        {queryData.query_type === 'image' ? <Image size={18} /> : <Search size={18} />}
                        {queryData.query_type === 'image' ? 'Image Results for: ' : 'Results for: '}
                        "{queryData.search_text}"
                        <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">({queryData.elements?.length || 0} found)</span>
                      </h3>
                    </div>

                    {queryData.elements && queryData.elements.length > 0 ? (
                      <div className="flex flex-col gap-4">{queryData.elements.map((elem, idx) => (
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900" key={idx}>
                        <div className="border-b border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold uppercase text-white dark:bg-blue-500 dark:text-black">{elem.tag}</span>
                            {elem.match_type && (
                              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                elem.match_type === 'exact' ? 'bg-green-600 text-white dark:bg-green-500 dark:text-black' : 'bg-yellow-400 text-black dark:bg-yellow-500'
                              }`}>
                                {elem.match_type === 'exact' ? 'EXACT MATCH' : 'PARTIAL MATCH'}
                              </span>
                            )}
                            {elem.id && <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">#{elem.id}</span>}
                            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Element {elem.index}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 p-4">
                          {/* Image Preview for image results */}
                          {queryData.query_type === 'image' && elem.src && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Image Preview:</strong>
                              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
                                <img src={elem.src} alt={elem.alt || 'Found image'} className="mx-auto max-h-[300px] max-w-full rounded shadow-sm dark:shadow-gray-900/50" />
                                {elem.natural_dimensions && (
                                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Natural: {elem.natural_dimensions.naturalWidth} × {elem.natural_dimensions.naturalHeight}px
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Text Content */}
                          {elem.text && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Text Content:</strong>
                              <p className="rounded-md border border-gray-200 bg-white p-2.5 text-xs text-gray-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200">{elem.text}</p>
                            </div>
                          )}

                          {/* Attributes */}
                          <div className="flex flex-col gap-1.5">
                            <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Attributes:</strong>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {elem.all_attributes && Object.keys(elem.all_attributes).length > 0 ? (
                                Object.entries(elem.all_attributes).map(([key, value]) => (
                                  <div className="flex flex-col gap-1 rounded bg-white p-2 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800" key={key}>
                                    <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">{key}:</span>
                                    <code className="break-all font-mono text-xs text-blue-600 dark:text-blue-400">{value}</code>
                                  </div>
                                ))
                              ) : (
                                <>
                                  {elem.class && (
                                    <div className="flex flex-col gap-1 rounded bg-white p-2 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
                                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Class:</span>
                                      <code className="break-all font-mono text-xs text-blue-600 dark:text-blue-400">{elem.class}</code>
                                    </div>
                                  )}
                                  {elem.name && (
                                    <div className="flex flex-col gap-1 rounded bg-white p-2 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
                                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Name:</span>
                                      <code className="break-all font-mono text-xs text-blue-600 dark:text-blue-400">{elem.name}</code>
                                    </div>
                                  )}
                                  {elem.type && (
                                    <div className="flex flex-col gap-1 rounded bg-white p-2 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
                                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Type:</span>
                                      <code className="break-all font-mono text-xs text-blue-600 dark:text-blue-400">{elem.type}</code>
                                    </div>
                                  )}
                                  {elem.href && (
                                    <div className="flex flex-col gap-1 rounded bg-white p-2 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
                                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Href:</span>
                                      <code className="break-all font-mono text-xs text-blue-600 dark:text-blue-400">{elem.href}</code>
                                    </div>
                                  )}
                                  {elem.src && (
                                    <div className="flex flex-col gap-1 rounded bg-white p-2 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
                                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Src:</span>
                                      <code className="break-all font-mono text-xs text-blue-600 dark:text-blue-400">{elem.src}</code>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Text Content (all text including hidden) */}
                          {elem.text_content && elem.text_content !== elem.text && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Full Text Content:</strong>
                              <p className="rounded-md border border-gray-200 bg-white p-2.5 text-xs text-gray-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200">{elem.text_content}</p>
                            </div>
                          )}

                          {/* Inner HTML */}
                          {elem.inner_html && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Inner HTML:</strong>
                              <div className="relative rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                <code className="block whitespace-pre-wrap break-all font-mono text-xs text-gray-800 dark:text-gray-300">{elem.inner_html}</code>
                                <button
                                  className="absolute right-2 top-2 rounded p-1 hover:bg-gray-200 dark:hover:bg-neutral-800"
                                  onClick={() => copyToClipboard(elem.inner_html)}
                                  title="Copy"
                                >
                                  <Copy size={14} className="text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Outer HTML */}
                          {elem.outer_html && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Outer HTML:</strong>
                              <div className="relative rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                <code className="block whitespace-pre-wrap break-all font-mono text-xs text-gray-800 dark:text-gray-300">{elem.outer_html}</code>
                                <button
                                  className="absolute right-2 top-2 rounded p-1 hover:bg-gray-200 dark:hover:bg-neutral-800"
                                  onClick={() => copyToClipboard(elem.outer_html)}
                                  title="Copy"
                                >
                                  <Copy size={14} className="text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Parent Info */}
                          {elem.parent_tag && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Direct Parent:</strong>
                              <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                                  <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{elem.parent_tag}</span>
                                  {elem.parent_id && <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-blue-600 dark:bg-neutral-800 dark:text-blue-400">#{elem.parent_id}</code>}
                                  {elem.parent_class && <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-blue-600 dark:bg-neutral-800 dark:text-blue-400">.{elem.parent_class.split(' ')[0]}</code>}
                                </div>
                                {elem.parent_selectors && elem.parent_selectors.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {elem.parent_selectors.map((sel, i) => (
                                      <code key={i} onClick={() => copyToClipboard(sel)} className="cursor-pointer rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-blue-900/10">{sel}</code>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Ancestors */}
                          {elem.ancestors && elem.ancestors.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ancestor Chain:</strong>
                              <div className="flex flex-col gap-2">
                                {elem.ancestors.map((ancestor, i) => (
                                  <div className="flex flex-wrap items-center gap-2 rounded-md border-l-4 border-blue-600 bg-white p-2.5 shadow-sm dark:border-blue-500 dark:bg-neutral-900" key={i}>
                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">Level {ancestor.level}</span>
                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{ancestor.tag}</span>
                                    {ancestor.id && <code className="font-mono text-xs text-blue-600 dark:text-blue-400">#{ancestor.id}</code>}
                                    {ancestor.class && <code className="font-mono text-xs text-blue-600 dark:text-blue-400">.{ancestor.class.split(' ')[0]}</code>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CSS Selectors */}
                          {elem.selectors && elem.selectors.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">CSS Selectors:</strong>
                              <div className="mt-1 border-t border-gray-200 pt-2 dark:border-neutral-800">
                                {elem.selectors.map((sel, i) => (
                                  <div className="mb-1 flex cursor-pointer items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-black dark:hover:border-blue-700 dark:hover:bg-blue-900/10" key={i} onClick={() => copyToClipboard(sel)}>
                                    <code className="flex-1 font-mono text-xs text-blue-600 dark:text-blue-400 truncate">{sel}</code>
                                    <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* XPath */}
                          {elem.xpath && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">XPath:</strong>
                              <div className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-black dark:hover:border-blue-700 dark:hover:bg-blue-900/10" onClick={() => copyToClipboard(elem.xpath)}>
                                <code className="flex-1 font-mono text-xs text-blue-600 dark:text-blue-400 truncate">{elem.xpath}</code>
                                <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                              </div>
                            </div>
                          )}

                          {/* Styles */}
                          {elem.styles && Object.keys(elem.styles).length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Computed Styles:</strong>
                              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                                {Object.entries(elem.styles).map(([key, value]) => (
                                  <div className="flex gap-1.5 rounded border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-neutral-800 dark:bg-neutral-900" key={key}>
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">{key}:</span>
                                    <span className="font-mono text-gray-900 dark:text-gray-200">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bounding Box */}
                          {elem.bounding_box && (
                            <div className="flex flex-col gap-1.5">
                              <strong className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Position:</strong>
                              <p className="rounded-md border border-gray-200 bg-white p-2 font-mono text-xs text-gray-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
                                x: {Math.round(elem.bounding_box.x)}px, 
                                y: {Math.round(elem.bounding_box.y)}px, 
                                width: {Math.round(elem.bounding_box.width)}px, 
                                height: {Math.round(elem.bounding_box.height)}px
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}</div>
                    ) : (
                      <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">No elements found matching "{queryData.search_text}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selector Library Section */}
        {activeSection === 'library' && (
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  <Library size={24} />
                  Selector Library
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Save and manage your frequently used selectors</p>
              </div>
            </div>

            {selectorLibrary.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectorLibrary.map((item) => (
                  <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-blue-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500" key={item.id}>
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">{item.name}</h3>
                      <div className="flex gap-1">
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => handleUseFromLibrary(item)}
                          title="Use this selector"
                        >
                          <MousePointer size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                          onClick={() => copyToClipboard(item.selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteFromLibrary(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <code className="mb-3 block break-all rounded-md border border-gray-200 bg-gray-100 p-2.5 font-mono text-xs text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-blue-400">{item.selector}</code>
                      {item.description && (
                        <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star size={12} /> Used {item.usageCount} times
                        </span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                <Library size={48} className="mb-4 opacity-50" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">No Saved Selectors</h3>
                <p className="text-sm">Test selectors and save them to your library for quick access</p>
              </div>
            )}
          </div>
        )}

        {/* Test History Section */}
        {activeSection === 'history' && (
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  <FormInput size={24} />
                  Test History
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Recent selector tests with results</p>
              </div>
              {testHistory.length > 0 && (
                <button className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-black dark:text-red-400 dark:hover:bg-red-900/10" onClick={clearTestHistory}>
                  <Trash2 size={16} />
                  Clear History
                </button>
              )}
            </div>

            {testHistory.length > 0 ? (
              <div className="flex flex-col gap-3">
                {testHistory.map((item) => (
                  <div className={`overflow-hidden rounded-lg border-2 border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-neutral-950 ${item.success ? 'border-gray-200 border-l-green-500 dark:border-neutral-800 dark:border-l-green-500' : 'border-gray-200 border-l-red-500 dark:border-neutral-800 dark:border-l-red-500'}`} key={item.id}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 text-sm font-semibold ${item.success ? 'text-gray-900 dark:text-gray-200' : 'text-gray-900 dark:text-gray-200'}`}>
                        {item.success ? <CheckCircle size={16} className="text-green-600 dark:text-green-400" /> : <XCircle size={16} className="text-red-600 dark:text-red-400" />}
                        <span>{item.success ? `${item.matchCount} matches` : 'Failed'}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <code className="mb-2 block break-all rounded border border-gray-200 bg-gray-100 p-2 font-mono text-xs text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-blue-400">{item.selector}</code>
                      <p className="mb-2 break-all text-xs text-gray-500 dark:text-gray-400">{item.url}</p>
                      {item.strength && (
                        <div className="flex items-center gap-2">
                          <span 
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider" 
                            style={{ background: item.strength.color }}
                          >
                            {item.strength.strength.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.strength.score}/100</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/10 dark:hover:text-blue-400"
                        onClick={() => {
                          setTestSelectorInput(item.selector)
                          setTestSelectorUrl(item.url)
                          setActiveSection('selector-test')
                        }}
                      >
                        <TestTube size={14} />
                        Test Again
                      </button>
                      <button
                        className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/10 dark:hover:text-blue-400"
                        onClick={() => openSaveModal(item.selector)}
                      >
                        <BookmarkPlus size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                <FormInput size={48} className="mb-4 opacity-50" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">No Test History</h3>
                <p className="text-sm">Your selector test results will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!results && activeSection === 'analyze' && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
            <Search size={48} className="mb-4 opacity-50" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">Analyze a Login Page</h3>
            <p className="text-sm">Enter a login page URL in the sidebar to find CSS selectors automatically</p>
          </div>
        )}

        {!results && activeSection === 'test' && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
            <TestTube size={48} className="mb-4 opacity-50" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">Analyze First</h3>
            <p className="text-sm">Analyze a login page first to get suggested selectors</p>
          </div>
        )}

        {/* Save to Library Modal */}
    {showSaveModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200" onClick={() => setShowSaveModal(false)}>
        <div className="flex max-h-[80vh] w-full max-w-[500px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 dark:bg-neutral-900 dark:border dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Save Selector to Library</h2>
            <button className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-gray-200" onClick={() => setShowSaveModal(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Selector</label>
              <code className="block break-all rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-xs text-blue-600 dark:border-neutral-800 dark:bg-black dark:text-blue-400">{selectorToSave}</code>
            </div>
            <div className="mb-4 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name *</label>
              <input
                type="text"
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                value={selectorName}
                onChange={(e) => setSelectorName(e.target.value)}
                placeholder="e.g., Login Button, Email Input"
                autoFocus
              />
            </div>
            <div className="mb-4 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description (Optional)</label>
              <textarea
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-blue-500"
                value={selectorDescription}
                onChange={(e) => setSelectorDescription(e.target.value)}
                placeholder="Add notes about when to use this selector..."
                rows={3}
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button className="rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button 
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400" 
                onClick={handleSaveToLibrary}
                disabled={!selectorName}
              >
                <Save size={16} />
                Save to Library
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
      </main>
  )
}

export default SelectorViews