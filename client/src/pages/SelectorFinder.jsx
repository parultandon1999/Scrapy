import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/Breadcrumb'
import {
  Search, Copy, CheckCircle, XCircle, AlertCircle, X,
  FileCode, MousePointer, FormInput, TestTube, Plus, Minus, Image, Sparkles, Shield,
  BookmarkPlus, Library, Trash2, Star, Edit2, Save
} from 'lucide-react'
import * as api from '../services/api'
import { SelectorResultsSkeleton, SelectorAnalysisSkeleton, InlineButtonSkeleton } from '../components/SkeletonLoader'
import '../styles/SelectorFinder.css'

function SelectorFinder({ darkMode, toggleDarkMode }) {
  const [activeSection, setActiveSection] = useState('analyze')
  const [loginUrl, setLoginUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  
  const [testLoading, setTestLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [testData, setTestData] = useState({
    username: '',
    password: '',
    usernameSelector: '',
    passwordSelector: '',
    submitSelector: '',
    successIndicator: ''
  })

  const [findUrl, setFindUrl] = useState('')
  const [searchQueries, setSearchQueries] = useState([''])
  const [imageUrls, setImageUrls] = useState([''])
  const [searchType, setSearchType] = useState('partial')
  const [findLoading, setFindLoading] = useState(false)
  const [findResults, setFindResults] = useState(null)

  // Test Selector state
  const [testSelectorUrl, setTestSelectorUrl] = useState('')
  const [testSelectorInput, setTestSelectorInput] = useState('')
  const [testSelectorLoading, setTestSelectorLoading] = useState(false)
  const [testSelectorResults, setTestSelectorResults] = useState(null)

  // Robust Selector Generator state
  const [generateUrl, setGenerateUrl] = useState('')
  const [generateDescription, setGenerateDescription] = useState('')
  const [generateLoading, setGenerateLoading] = useState(false)
  const [generateResults, setGenerateResults] = useState(null)

  // Selector Library state
  const [selectorLibrary, setSelectorLibrary] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectorToSave, setSelectorToSave] = useState('')
  const [selectorName, setSelectorName] = useState('')
  const [selectorDescription, setSelectorDescription] = useState('')

  // Test History state
  const [testHistory, setTestHistory] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem('selectorLibrary')
    if (savedLibrary) {
      setSelectorLibrary(JSON.parse(savedLibrary))
    }

    const savedHistory = localStorage.getItem('testHistory')
    if (savedHistory) {
      setTestHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save library to localStorage whenever it changes
  useEffect(() => {
    if (selectorLibrary.length > 0) {
      localStorage.setItem('selectorLibrary', JSON.stringify(selectorLibrary))
    }
  }, [selectorLibrary])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (testHistory.length > 0) {
      localStorage.setItem('testHistory', JSON.stringify(testHistory))
    }
  }, [testHistory])

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults(null)

    try {
      const data = await api.analyzeLoginPage(loginUrl)
      setResults(data)
      
      if (data.suggested_config) {
        setTestData(prev => ({
          ...prev,
          usernameSelector: data.suggested_config.username_selector || '',
          passwordSelector: data.suggested_config.password_selector || '',
          submitSelector: data.suggested_config.submit_selector || ''
        }))
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze login page')
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setTestLoading(true)
    setTestResults(null)

    try {
      const data = await api.testLoginSelectors({
        loginUrl: loginUrl,
        ...testData
      })
      setTestResults(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to test login')
    } finally {
      setTestLoading(false)
    }
  }

  const handleFindElement = async (e) => {
    e.preventDefault()
    setError(null)
    setFindLoading(true)
    setFindResults(null)

    try {
      const validQueries = searchQueries.filter(q => q.trim() !== '')
      const validImageUrls = imageUrls.filter(url => url.trim() !== '')
      
      if (validQueries.length === 0 && validImageUrls.length === 0) {
        setError('Please enter at least one search query or image URL')
        setFindLoading(false)
        return
      }

      const data = await api.findElementByContent({
        url: findUrl,
        searchQueries: validQueries,
        imageUrls: validImageUrls,
        searchType: searchType
      })
      setFindResults(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to find elements')
    } finally {
      setFindLoading(false)
    }
  }

  const handleTestSelector = async (e) => {
    e.preventDefault()
    setError(null)
    setTestSelectorLoading(true)
    setTestSelectorResults(null)

    try {
      const data = await api.testSelector(testSelectorUrl, testSelectorInput)
      setTestSelectorResults(data)
      
      // Save to test history
      const historyEntry = {
        id: Date.now(),
        selector: testSelectorInput,
        url: testSelectorUrl,
        timestamp: new Date().toISOString(),
        success: data.success,
        matchCount: data.matched_count,
        strength: data.strength
      }
      setTestHistory(prev => [historyEntry, ...prev].slice(0, 50)) // Keep last 50
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to test selector')
    } finally {
      setTestSelectorLoading(false)
    }
  }

  const handleGenerateRobustSelector = async (e) => {
    e.preventDefault()
    setError(null)
    setGenerateLoading(true)
    setGenerateResults(null)

    try {
      const data = await api.generateRobustSelector(generateUrl, generateDescription)
      setGenerateResults(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate selectors')
    } finally {
      setGenerateLoading(false)
    }
  }

  // Selector Library functions
  const openSaveModal = (selector) => {
    setSelectorToSave(selector)
    setSelectorName('')
    setSelectorDescription('')
    setShowSaveModal(true)
  }

  const handleSaveToLibrary = () => {
    if (!selectorToSave || !selectorName) return

    const newSelector = {
      id: Date.now(),
      name: selectorName,
      selector: selectorToSave,
      description: selectorDescription,
      createdAt: new Date().toISOString(),
      usageCount: 0
    }

    setSelectorLibrary(prev => [newSelector, ...prev])
    setShowSaveModal(false)
    setSelectorToSave('')
    setSelectorName('')
    setSelectorDescription('')
  }

  const handleDeleteFromLibrary = (id) => {
    if (confirm('Delete this selector from your library?')) {
      setSelectorLibrary(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleUseFromLibrary = (selector) => {
    setTestSelectorInput(selector.selector)
    setActiveSection('selector-test')
    
    // Increment usage count
    setSelectorLibrary(prev => prev.map(s => 
      s.id === selector.id ? { ...s, usageCount: s.usageCount + 1 } : s
    ))
  }

  const clearTestHistory = () => {
    if (confirm('Clear all test history?')) {
      setTestHistory([])
      localStorage.removeItem('testHistory')
    }
  }

  const addSearchQuery = () => {
    setSearchQueries([...searchQueries, ''])
  }

  const removeSearchQuery = (index) => {
    if (searchQueries.length > 1) {
      setSearchQueries(searchQueries.filter((_, i) => i !== index))
    }
  }

  const updateSearchQuery = (index, value) => {
    const updated = [...searchQueries]
    updated[index] = value
    setSearchQueries(updated)
  }

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index))
    }
  }

  const updateImageUrl = (index, value) => {
    const updated = [...imageUrls]
    updated[index] = value
    setImageUrls(updated)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleUseSuggestedSelector = (field, selector) => {
    setTestData(prev => ({
      ...prev,
      [field]: selector
    }))
    setActiveSection('test')
  }

  const handleUseForSelectorTest = (selector) => {
    setTestSelectorInput(selector)
    setTestSelectorUrl(loginUrl || findUrl || testSelectorUrl)
    setActiveSection('selector-test')
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="selector-finder" />
      <div className="database-page">
      {/* Sidebar Navigation */}
      <aside className="db-sidebar">
        <h2><Search size={20} /> Selector Finder</h2>
        <nav className="db-nav">
          <button
            className={`db-nav-item ${activeSection === 'analyze' ? 'active' : ''}`}
            onClick={() => setActiveSection('analyze')}
          >
            <FileCode size={18} />
            Analyze Page
          </button>
          <button
            className={`db-nav-item ${activeSection === 'test' ? 'active' : ''}`}
            onClick={() => setActiveSection('test')}
            disabled={!results}
          >
            <TestTube size={18} />
            Test Login
          </button>
          <button
            className={`db-nav-item ${activeSection === 'selector-test' ? 'active' : ''}`}
            onClick={() => setActiveSection('selector-test')}
          >
            <MousePointer size={18} />
            Test Selector
          </button>
          <button
            className={`db-nav-item ${activeSection === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveSection('generate')}
          >
            <Sparkles size={18} />
            Generate Robust
          </button>
          <button
            className={`db-nav-item ${activeSection === 'library' ? 'active' : ''}`}
            onClick={() => setActiveSection('library')}
          >
            <Library size={18} />
            Library ({selectorLibrary.length})
          </button>
          <button
            className={`db-nav-item ${activeSection === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSection('history')}
          >
            <FormInput size={18} />
            History ({testHistory.length})
          </button>
          <button
            className={`db-nav-item ${activeSection === 'finder' ? 'active' : ''}`}
            onClick={() => setActiveSection('finder')}
          >
            <Search size={18} />
            Find Element
          </button>
        </nav>

        {/* URL Input in Sidebar */}
        <div className="sidebar-section">
          <label className="sidebar-label">Login Page URL</label>
          <input
            type="url"
            className="sidebar-input"
            placeholder="https://example.com/login"
            value={loginUrl}
            onChange={(e) => setLoginUrl(e.target.value)}
            disabled={loading}
          />
          <button
            className="sidebar-btn"
            onClick={handleAnalyze}
            disabled={loading || !loginUrl}
          >
            {loading ? <InlineButtonSkeleton /> : 'Analyze'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="db-main" role="main">
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
          <div className="db-error">
            <AlertCircle size={18} />
            <p>{error}</p>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}

        {/* Analyze Section */}
        {activeSection === 'analyze' && loading && <SelectorAnalysisSkeleton />}
        {activeSection === 'analyze' && results && (
          <div className="selector-view">
            <div className="view-header-compact">
              <h1>
                <FileCode size={24} />
                Analysis Results
              </h1>
              <p className="view-subtitle">Found {results.inputs?.length || 0} inputs, {results.buttons?.length || 0} buttons, {results.forms?.length || 0} forms</p>
            </div>

            {/* Suggested Configuration */}
            {results.suggested_config && Object.keys(results.suggested_config).length > 0 && (
              <div className="result-card suggested-config">
                <div className="card-header">
                  <h3><CheckCircle size={18} /> Suggested Configuration</h3>
                </div>
                <div className="config-grid">
                  {results.suggested_config.username_selector && (
                    <div className="config-item">
                      <label>Username Selector</label>
                      <div className="selector-display">
                        <code>{results.suggested_config.username_selector}</code>
                        <button
                          className="icon-btn"
                          onClick={() => copyToClipboard(results.suggested_config.username_selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="icon-btn test-btn"
                          onClick={() => handleUseForSelectorTest(results.suggested_config.username_selector)}
                          title="Test this selector"
                        >
                          <TestTube size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleUseSuggestedSelector('usernameSelector', results.suggested_config.username_selector)}
                          title="Use in test"
                        >
                          <MousePointer size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  {results.suggested_config.password_selector && (
                    <div className="config-item">
                      <label>Password Selector</label>
                      <div className="selector-display">
                        <code>{results.suggested_config.password_selector}</code>
                        <button
                          className="icon-btn"
                          onClick={() => copyToClipboard(results.suggested_config.password_selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="icon-btn test-btn"
                          onClick={() => handleUseForSelectorTest(results.suggested_config.password_selector)}
                          title="Test this selector"
                        >
                          <TestTube size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleUseSuggestedSelector('passwordSelector', results.suggested_config.password_selector)}
                          title="Use in test"
                        >
                          <MousePointer size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  {results.suggested_config.submit_selector && (
                    <div className="config-item">
                      <label>Submit Selector</label>
                      <div className="selector-display">
                        <code>{results.suggested_config.submit_selector}</code>
                        <button
                          className="icon-btn"
                          onClick={() => copyToClipboard(results.suggested_config.submit_selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="icon-btn test-btn"
                          onClick={() => handleUseForSelectorTest(results.suggested_config.submit_selector)}
                          title="Test this selector"
                        >
                          <TestTube size={14} />
                        </button>
                        <button
                          className="icon-btn"
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
              <div className="result-card">
                <div className="card-header">
                  <h3><FormInput size={18} /> Input Fields ({results.inputs.length})</h3>
                </div>
                <div className="items-grid">
                  {results.inputs.map((input, idx) => (
                    <div className="item-card" key={idx}>
                      <div className="item-header">
                        <span className="item-badge">{input.type}</span>
                        {input.likely_field !== 'text' && (
                          <span className={`item-badge ${input.likely_field}`}>{input.likely_field}</span>
                        )}
                      </div>
                      <div className="item-details">
                        {input.name && <p><strong>Name:</strong> {input.name}</p>}
                        {input.id && <p><strong>ID:</strong> {input.id}</p>}
                        {input.placeholder && <p><strong>Placeholder:</strong> {input.placeholder}</p>}
                      </div>
                      {input.suggested_selectors && input.suggested_selectors.length > 0 && (
                        <div className="selectors-list">
                          <strong>Selectors:</strong>
                          {input.suggested_selectors.map((sel, i) => (
                            <div className="selector-item" key={i}>
                              <code onClick={() => copyToClipboard(sel)}>{sel}</code>
                              <Copy size={12} className="copy-icon" />
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
              <div className="result-card">
                <div className="card-header">
                  <h3><MousePointer size={18} /> Buttons ({results.buttons.length})</h3>
                </div>
                <div className="items-grid">
                  {results.buttons.map((button, idx) => (
                    <div className="item-card" key={idx}>
                      <div className="item-header">
                        <span className="item-badge">{button.type || 'button'}</span>
                        {button.likely_submit && (
                          <span className="item-badge submit">submit</span>
                        )}
                      </div>
                      <div className="item-details">
                        {button.text && <p><strong>Text:</strong> {button.text}</p>}
                        {button.id && <p><strong>ID:</strong> {button.id}</p>}
                      </div>
                      {button.suggested_selectors && button.suggested_selectors.length > 0 && (
                        <div className="selectors-list">
                          <strong>Selectors:</strong>
                          {button.suggested_selectors.map((sel, i) => (
                            <div className="selector-item" key={i}>
                              <code onClick={() => copyToClipboard(sel)}>{sel}</code>
                              <Copy size={12} className="copy-icon" />
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
              <div className="result-card">
                <div className="card-header">
                  <h3>Forms ({results.forms.length})</h3>
                </div>
                <div className="items-grid">
                  {results.forms.map((form, idx) => (
                    <div className="item-card" key={idx}>
                      <p><strong>Form #{form.index}</strong></p>
                      {form.id && <p><strong>ID:</strong> {form.id}</p>}
                      {form.action && <p><strong>Action:</strong> {form.action}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Login Section */}
        {activeSection === 'test' && (
          <div className="selector-view">
            <div className="view-header-compact">
              <h1>
                <TestTube size={24} />
                Test Login
              </h1>
              <p className="view-subtitle">Test your selectors with actual credentials</p>
            </div>

            <form className="test-form" onSubmit={handleTestLogin}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={testData.username}
                    onChange={(e) => setTestData({...testData, username: e.target.value})}
                    placeholder="Enter test username"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={testData.password}
                    onChange={(e) => setTestData({...testData, password: e.target.value})}
                    placeholder="Enter test password"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Username Selector</label>
                  <input
                    type="text"
                    value={testData.usernameSelector}
                    onChange={(e) => setTestData({...testData, usernameSelector: e.target.value})}
                    placeholder="input[name='username']"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Password Selector</label>
                  <input
                    type="text"
                    value={testData.passwordSelector}
                    onChange={(e) => setTestData({...testData, passwordSelector: e.target.value})}
                    placeholder="input[name='password']"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Submit Selector</label>
                  <input
                    type="text"
                    value={testData.submitSelector}
                    onChange={(e) => setTestData({...testData, submitSelector: e.target.value})}
                    placeholder="button[type='submit']"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Success Indicator (Optional)</label>
                  <input
                    type="text"
                    value={testData.successIndicator}
                    onChange={(e) => setTestData({...testData, successIndicator: e.target.value})}
                    placeholder=".user-profile"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="test-submit-btn"
                disabled={testLoading}
              >
                {testLoading ? <InlineButtonSkeleton /> : 'Test Login'}
              </button>
            </form>

            {/* Test Results */}
            {testResults && (
              <div className={`test-results ${testResults.success ? 'success' : 'failure'}`}>
                <div className="test-result-header">
                  {testResults.success ? (
                    <CheckCircle size={24} />
                  ) : (
                    <XCircle size={24} />
                  )}
                  <h3>{testResults.message}</h3>
                </div>
                <div className="test-result-details">
                  <div className="detail-row">
                    <span>Initial URL:</span>
                    <code>{testResults.initial_url}</code>
                  </div>
                  <div className="detail-row">
                    <span>Final URL:</span>
                    <code>{testResults.final_url}</code>
                  </div>
                  <div className="detail-row">
                    <span>URL Changed:</span>
                    <span className={testResults.url_changed ? 'status-yes' : 'status-no'}>
                      {testResults.url_changed ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {testData.successIndicator && (
                    <div className="detail-row">
                      <span>Success Indicator Found:</span>
                      <span className={testResults.success_indicator_found ? 'status-yes' : 'status-no'}>
                        {testResults.success_indicator_found ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
                {testResults.errors && testResults.errors.length > 0 && (
                  <div className="test-errors">
                    <strong>Errors:</strong>
                    {testResults.errors.map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Test Selector Section */}
        {activeSection === 'selector-test' && (
          <div className="selector-view">
            <div className="view-header-compact">
              <h1>
                <MousePointer size={24} />
                Test CSS Selector
              </h1>
              <p className="view-subtitle">Test any CSS selector and see which elements it matches</p>
            </div>

            <form className="test-form" onSubmit={handleTestSelector}>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Page URL</label>
                  <input
                    type="url"
                    value={testSelectorUrl}
                    onChange={(e) => setTestSelectorUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>CSS Selector</label>
                  <input
                    type="text"
                    value={testSelectorInput}
                    onChange={(e) => setTestSelectorInput(e.target.value)}
                    placeholder="input[name='username'], .btn-primary, #submit-button"
                    required
                  />
                  <p className="field-hint">
                    Examples: <code>button[type="submit"]</code>, <code>.login-form input</code>, <code>#username</code>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="test-submit-btn"
                disabled={testSelectorLoading}
              >
                {testSelectorLoading ? <InlineButtonSkeleton /> : 'Test Selector'}
              </button>
            </form>

            {/* Test Selector Results */}
            {testSelectorResults && (
              <div className={`test-results ${testSelectorResults.success ? 'success' : 'failure'}`}>
                <div className="test-result-header">
                  {testSelectorResults.success ? (
                    <>
                      <CheckCircle size={24} />
                      <h3>Found {testSelectorResults.matched_count} element{testSelectorResults.matched_count !== 1 ? 's' : ''}</h3>
                      <button
                        className="save-to-library-btn"
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
                      <h3>{testSelectorResults.error || 'No elements matched'}</h3>
                    </>
                  )}
                </div>

                {/* Strength Indicator */}
                {testSelectorResults.strength && (
                  <div className="strength-indicator">
                    <div className="strength-header">
                      <Shield size={18} />
                      <h4>Selector Strength</h4>
                    </div>
                    <div className="strength-content">
                      <div className="strength-score-bar">
                        <div 
                          className="strength-fill" 
                          style={{
                            width: `${testSelectorResults.strength.score}%`,
                            background: testSelectorResults.strength.color
                          }}
                        ></div>
                      </div>
                      <div className="strength-details">
                        <span className="strength-badge" style={{
                          background: testSelectorResults.strength.color,
                          color: '#fff'
                        }}>
                          {testSelectorResults.strength.strength.toUpperCase()}
                        </span>
                        <span className="strength-score">{testSelectorResults.strength.score}/100</span>
                        <span className="strength-description">{testSelectorResults.strength.description}</span>
                      </div>
                    </div>
                  </div>
                )}

                {testSelectorResults.success && testSelectorResults.elements && testSelectorResults.elements.length > 0 && (
                  <div className="matched-elements">
                    {testSelectorResults.elements.map((elem, idx) => (
                      <div className="element-card matched" key={idx}>
                        <div className="element-header">
                          <div className="element-title">
                            <span className="element-badge">{elem.tag}</span>
                            <span className="element-index">Element {elem.index + 1}</span>
                            {elem.attributes?.id && <span className="element-id">#{elem.attributes.id}</span>}
                            {elem.attributes?.class && (
                              <span className="element-class">.{elem.attributes.class.split(' ')[0]}</span>
                            )}
                          </div>
                        </div>

                        <div className="element-body">
                          {/* Text Content */}
                          {elem.text && (
                            <div className="element-section">
                              <strong>Text Content:</strong>
                              <p className="element-text">{elem.text}</p>
                            </div>
                          )}

                          {/* Attributes */}
                          {elem.attributes && Object.keys(elem.attributes).length > 0 && (
                            <div className="element-section">
                              <strong>Attributes:</strong>
                              <div className="attributes-grid">
                                {Object.entries(elem.attributes).map(([key, value]) => (
                                  <div className="attr-item" key={key}>
                                    <span className="attr-label">{key}:</span>
                                    <code>{value}</code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Inner HTML */}
                          {elem.inner_html && (
                            <div className="element-section">
                              <strong>Inner HTML:</strong>
                              <div className="code-block">
                                <code>{elem.inner_html}</code>
                                <button
                                  className="icon-btn copy-code"
                                  onClick={() => copyToClipboard(elem.inner_html)}
                                  title="Copy"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Bounding Box / Position */}
                          {elem.bounding_box && (
                            <div className="element-section">
                              <strong>Position on Page:</strong>
                              <div className="position-highlight">
                                <p className="position-info">
                                  x: {Math.round(elem.bounding_box.x)}px, 
                                  y: {Math.round(elem.bounding_box.y)}px, 
                                  width: {Math.round(elem.bounding_box.width)}px, 
                                  height: {Math.round(elem.bounding_box.height)}px
                                </p>
                                <div className="highlight-indicator">
                                  <div className="highlight-box" style={{
                                    width: `${Math.min(elem.bounding_box.width / 10, 100)}px`,
                                    height: `${Math.min(elem.bounding_box.height / 10, 60)}px`,
                                    border: '2px solid #1a73e8',
                                    background: 'rgba(26, 115, 232, 0.1)',
                                    borderRadius: '4px'
                                  }}></div>
                                  <span className="highlight-label">Visual representation (scaled)</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {testSelectorResults.matched_count > 20 && (
                      <div className="more-results-notice">
                        <AlertCircle size={16} />
                        <p>Showing first 20 of {testSelectorResults.matched_count} matched elements</p>
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
          <div className="selector-view">
            <div className="view-header-compact">
              <h1>
                <Sparkles size={24} />
                Generate Robust Selector
              </h1>
              <p className="view-subtitle">Create multiple fallback selectors with reliability scores</p>
            </div>

            <form className="test-form" onSubmit={handleGenerateRobustSelector}>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Page URL</label>
                  <input
                    type="url"
                    value={generateUrl}
                    onChange={(e) => setGenerateUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Element Description</label>
                  <input
                    type="text"
                    value={generateDescription}
                    onChange={(e) => setGenerateDescription(e.target.value)}
                    placeholder="e.g., 'login button', 'username field', 'submit button'"
                    required
                  />
                  <p className="field-hint">
                    Describe the element you want to find. Examples: "login button", "email input", "submit form"
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="test-submit-btn"
                disabled={generateLoading}
              >
                {generateLoading ? <InlineButtonSkeleton /> : 'Generate Selectors'}
              </button>
            </form>

            {/* Generate Results */}
            {generateResults && (
              <div className={`test-results ${generateResults.success ? 'success' : 'failure'}`}>
                <div className="test-result-header">
                  {generateResults.success ? (
                    <>
                      <CheckCircle size={24} />
                      <h3>Generated {generateResults.selectors?.length || 0} Selector{generateResults.selectors?.length !== 1 ? 's' : ''}</h3>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} />
                      <h3>{generateResults.error || 'Failed to generate selectors'}</h3>
                    </>
                  )}
                </div>

                {generateResults.success && generateResults.selectors && generateResults.selectors.length > 0 && (
                  <div className="robust-selectors-list">
                    <div className="robust-selectors-intro">
                      <AlertCircle size={16} />
                      <p>Selectors are ordered by reliability. Use the strongest selector for production.</p>
                    </div>
                    
                    {generateResults.selectors.map((selectorData, idx) => (
                      <div className="robust-selector-card" key={idx}>
                        <div className="robust-selector-header">
                          <div className="robust-selector-rank">#{idx + 1}</div>
                          <div className="robust-selector-type">{selectorData.type}</div>
                          <div className="robust-selector-matches">
                            {selectorData.matches} match{selectorData.matches !== 1 ? 'es' : ''}
                          </div>
                        </div>

                        <div className="robust-selector-body">
                          <div className="selector-code-display">
                            <code>{selectorData.selector}</code>
                            <button
                              className="icon-btn"
                              onClick={() => copyToClipboard(selectorData.selector)}
                              title="Copy"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              className="icon-btn test-btn"
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
                          <div className="strength-indicator compact">
                            <div className="strength-score-bar">
                              <div 
                                className="strength-fill" 
                                style={{
                                  width: `${selectorData.strength.score}%`,
                                  background: selectorData.strength.color
                                }}
                              ></div>
                            </div>
                            <div className="strength-details">
                              <span className="strength-badge" style={{
                                background: selectorData.strength.color,
                                color: '#fff'
                              }}>
                                {selectorData.strength.strength.toUpperCase()}
                              </span>
                              <span className="strength-score">{selectorData.strength.score}/100</span>
                              <span className="strength-description">{selectorData.strength.description}</span>
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
          <div className="selector-view">
            <div className="view-header-compact">
              <h1>
                <Search size={24} />
                Find Element by Content
              </h1>
              <p className="view-subtitle">Search for elements containing specific text or content</p>
            </div>

            <form className="test-form" onSubmit={handleFindElement}>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Page URL</label>
                  <input
                    type="url"
                    value={findUrl}
                    onChange={(e) => setFindUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Search Queries (Text - Multiple)</label>
                  {searchQueries.map((query, index) => (
                    <div className="query-input-row" key={index}>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => updateSearchQuery(index, e.target.value)}
                        placeholder={`Search text ${index + 1}`}
                      />
                      {searchQueries.length > 1 && (
                        <button
                          type="button"
                          className="query-btn remove"
                          onClick={() => removeSearchQuery(index)}
                          title="Remove"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                      {index === searchQueries.length - 1 && (
                        <button
                          type="button"
                          className="query-btn add"
                          onClick={addSearchQuery}
                          title="Add another"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="form-field full-width">
                  <label>
                    <Image size={14} className="inline-icon" />
                    Image URLs (Multiple)
                  </label>
                  {imageUrls.map((url, index) => (
                    <div className="query-input-row" key={index}>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder={`Image URL or partial URL ${index + 1}`}
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          className="query-btn remove"
                          onClick={() => removeImageUrl(index)}
                          title="Remove"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                      {index === imageUrls.length - 1 && (
                        <button
                          type="button"
                          className="query-btn add"
                          onClick={addImageUrl}
                          title="Add another"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="form-field">
                  <label>Search Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="form-select"
                  >
                    <option value="partial">Partial Match (Recommended)</option>
                    <option value="text">Exact Match</option>
                    <option value="attribute">Contains Text</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="test-submit-btn"
                disabled={findLoading}
              >
                {findLoading ? <InlineButtonSkeleton /> : 'Find Elements'}
              </button>
            </form>

            {/* Find Results */}
            {findResults && findResults.results_by_query && (
              <div className="queries-results">
                {Object.entries(findResults.results_by_query).map(([, queryData], queryIdx) => (
                  <div className="result-card query-result" key={queryIdx}>
                    <div className="card-header">
                      <h3>
                        {queryData.query_type === 'image' ? <Image size={18} /> : <Search size={18} />}
                        {queryData.query_type === 'image' ? 'Image Results for: ' : 'Results for: '}
                        "{queryData.search_text}"
                        <span className="result-count">({queryData.elements?.length || 0} found)</span>
                      </h3>
                    </div>

                    {queryData.elements && queryData.elements.length > 0 ? (
                      <div className="elements-list">{queryData.elements.map((elem, idx) => (
                      <div className="element-card" key={idx}>
                        <div className="element-header">
                          <div className="element-title">
                            <span className="element-badge">{elem.tag}</span>
                            {elem.match_type && (
                              <span className={`match-badge ${elem.match_type}`}>
                                {elem.match_type === 'exact' ? 'EXACT MATCH' : 'PARTIAL MATCH'}
                              </span>
                            )}
                            {elem.id && <span className="element-id">#{elem.id}</span>}
                            <span className="element-index">Element {elem.index}</span>
                          </div>
                        </div>

                        <div className="element-body">
                          {/* Image Preview for image results */}
                          {queryData.query_type === 'image' && elem.src && (
                            <div className="element-section">
                              <strong>Image Preview:</strong>
                              <div className="image-preview">
                                <img src={elem.src} alt={elem.alt || 'Found image'} />
                                {elem.natural_dimensions && (
                                  <p className="image-dimensions">
                                    Natural: {elem.natural_dimensions.naturalWidth} × {elem.natural_dimensions.naturalHeight}px
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Text Content */}
                          {elem.text && (
                            <div className="element-section">
                              <strong>Text Content:</strong>
                              <p className="element-text">{elem.text}</p>
                            </div>
                          )}

                          {/* Attributes */}
                          <div className="element-section">
                            <strong>Attributes:</strong>
                            <div className="attributes-grid">
                              {elem.all_attributes && Object.keys(elem.all_attributes).length > 0 ? (
                                Object.entries(elem.all_attributes).map(([key, value]) => (
                                  <div className="attr-item" key={key}>
                                    <span className="attr-label">{key}:</span>
                                    <code>{value}</code>
                                  </div>
                                ))
                              ) : (
                                <>
                                  {elem.class && (
                                    <div className="attr-item">
                                      <span className="attr-label">Class:</span>
                                      <code>{elem.class}</code>
                                    </div>
                                  )}
                                  {elem.name && (
                                    <div className="attr-item">
                                      <span className="attr-label">Name:</span>
                                      <code>{elem.name}</code>
                                    </div>
                                  )}
                                  {elem.type && (
                                    <div className="attr-item">
                                      <span className="attr-label">Type:</span>
                                      <code>{elem.type}</code>
                                    </div>
                                  )}
                                  {elem.href && (
                                    <div className="attr-item">
                                      <span className="attr-label">Href:</span>
                                      <code>{elem.href}</code>
                                    </div>
                                  )}
                                  {elem.src && (
                                    <div className="attr-item">
                                      <span className="attr-label">Src:</span>
                                      <code>{elem.src}</code>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Text Content (all text including hidden) */}
                          {elem.text_content && elem.text_content !== elem.text && (
                            <div className="element-section">
                              <strong>Full Text Content:</strong>
                              <p className="element-text">{elem.text_content}</p>
                            </div>
                          )}

                          {/* Inner HTML */}
                          {elem.inner_html && (
                            <div className="element-section">
                              <strong>Inner HTML:</strong>
                              <div className="code-block">
                                <code>{elem.inner_html}</code>
                                <button
                                  className="icon-btn copy-code"
                                  onClick={() => copyToClipboard(elem.inner_html)}
                                  title="Copy"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Outer HTML */}
                          {elem.outer_html && (
                            <div className="element-section">
                              <strong>Outer HTML:</strong>
                              <div className="code-block">
                                <code>{elem.outer_html}</code>
                                <button
                                  className="icon-btn copy-code"
                                  onClick={() => copyToClipboard(elem.outer_html)}
                                  title="Copy"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Parent Info */}
                          {elem.parent_tag && (
                            <div className="element-section">
                              <strong>Direct Parent:</strong>
                              <div className="parent-info">
                                <div className="parent-details">
                                  <span className="parent-badge">{elem.parent_tag}</span>
                                  {elem.parent_id && <code>#{elem.parent_id}</code>}
                                  {elem.parent_class && <code>.{elem.parent_class.split(' ')[0]}</code>}
                                </div>
                                {elem.parent_selectors && elem.parent_selectors.length > 0 && (
                                  <div className="parent-selectors">
                                    {elem.parent_selectors.map((sel, i) => (
                                      <code key={i} onClick={() => copyToClipboard(sel)}>{sel}</code>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Ancestors */}
                          {elem.ancestors && elem.ancestors.length > 0 && (
                            <div className="element-section">
                              <strong>Ancestor Chain:</strong>
                              <div className="ancestors-list">
                                {elem.ancestors.map((ancestor, i) => (
                                  <div className="ancestor-item" key={i}>
                                    <span className="ancestor-level">Level {ancestor.level}</span>
                                    <span className="ancestor-badge">{ancestor.tag}</span>
                                    {ancestor.id && <code>#{ancestor.id}</code>}
                                    {ancestor.class && <code>.{ancestor.class.split(' ')[0]}</code>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CSS Selectors */}
                          {elem.selectors && elem.selectors.length > 0 && (
                            <div className="element-section">
                              <strong>CSS Selectors:</strong>
                              <div className="selectors-list">
                                {elem.selectors.map((sel, i) => (
                                  <div className="selector-item" key={i} onClick={() => copyToClipboard(sel)}>
                                    <code>{sel}</code>
                                    <Copy size={12} className="copy-icon" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* XPath */}
                          {elem.xpath && (
                            <div className="element-section">
                              <strong>XPath:</strong>
                              <div className="selector-item" onClick={() => copyToClipboard(elem.xpath)}>
                                <code>{elem.xpath}</code>
                                <Copy size={12} className="copy-icon" />
                              </div>
                            </div>
                          )}

                          {/* Styles */}
                          {elem.styles && Object.keys(elem.styles).length > 0 && (
                            <div className="element-section">
                              <strong>Computed Styles:</strong>
                              <div className="styles-grid">
                                {Object.entries(elem.styles).map(([key, value]) => (
                                  <div className="style-item" key={key}>
                                    <span className="style-key">{key}:</span>
                                    <span className="style-value">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bounding Box */}
                          {elem.bounding_box && (
                            <div className="element-section">
                              <strong>Position:</strong>
                              <p className="position-info">
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
                      <p className="no-results">No elements found matching "{queryData.search_text}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selector Library Section */}
        {activeSection === 'library' && (
          <div className="selector-view">
            <div className="view-header-compact">
              <h1>
                <Library size={24} />
                Selector Library
              </h1>
              <p className="view-subtitle">Save and manage your frequently used selectors</p>
            </div>

            {selectorLibrary.length > 0 ? (
              <div className="library-grid">
                {selectorLibrary.map((item) => (
                  <div className="library-card" key={item.id}>
                    <div className="library-card-header">
                      <h3>{item.name}</h3>
                      <div className="library-card-actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleUseFromLibrary(item)}
                          title="Use this selector"
                        >
                          <MousePointer size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => copyToClipboard(item.selector)}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => handleDeleteFromLibrary(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="library-card-body">
                      <code className="library-selector">{item.selector}</code>
                      {item.description && (
                        <p className="library-description">{item.description}</p>
                      )}
                      <div className="library-meta">
                        <span className="library-usage">
                          <Star size={12} /> Used {item.usageCount} times
                        </span>
                        <span className="library-date">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Library size={48} />
                <h3>No Saved Selectors</h3>
                <p>Test selectors and save them to your library for quick access</p>
              </div>
            )}
          </div>
        )}

        {/* Test History Section */}
        {activeSection === 'history' && (
          <div className="selector-view">
            <div className="view-header-compact">
              <div>
                <h1>
                  <FormInput size={24} />
                  Test History
                </h1>
                <p className="view-subtitle">Recent selector tests with results</p>
              </div>
              {testHistory.length > 0 && (
                <button className="clear-history-btn" onClick={clearTestHistory}>
                  <Trash2 size={16} />
                  Clear History
                </button>
              )}
            </div>

            {testHistory.length > 0 ? (
              <div className="history-list">
                {testHistory.map((item) => (
                  <div className={`history-card ${item.success ? 'success' : 'failure'}`} key={item.id}>
                    <div className="history-card-header">
                      <div className="history-status">
                        {item.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        <span>{item.success ? `${item.matchCount} matches` : 'Failed'}</span>
                      </div>
                      <span className="history-time">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="history-card-body">
                      <code className="history-selector">{item.selector}</code>
                      <p className="history-url">{item.url}</p>
                      {item.strength && (
                        <div className="history-strength">
                          <span 
                            className="strength-badge-small" 
                            style={{ background: item.strength.color }}
                          >
                            {item.strength.strength.toUpperCase()}
                          </span>
                          <span className="strength-score-small">{item.strength.score}/100</span>
                        </div>
                      )}
                    </div>
                    <div className="history-card-actions">
                      <button
                        className="history-action-btn"
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
                        className="history-action-btn"
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
              <div className="empty-state">
                <FormInput size={48} />
                <h3>No Test History</h3>
                <p>Your selector test results will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!results && activeSection === 'analyze' && !loading && (
          <div className="empty-state">
            <Search size={48} />
            <h3>Analyze a Login Page</h3>
            <p>Enter a login page URL in the sidebar to find CSS selectors automatically</p>
          </div>
        )}

        {!results && activeSection === 'test' && (
          <div className="empty-state">
            <TestTube size={48} />
            <h3>Analyze First</h3>
            <p>Analyze a login page first to get suggested selectors</p>
          </div>
        )}
      </main>
    </div>

    {/* Save to Library Modal */}
    {showSaveModal && (
      <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Save Selector to Library</h2>
            <button className="modal-close" onClick={() => setShowSaveModal(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="form-field">
              <label>Selector</label>
              <code className="modal-selector-display">{selectorToSave}</code>
            </div>
            <div className="form-field">
              <label>Name *</label>
              <input
                type="text"
                value={selectorName}
                onChange={(e) => setSelectorName(e.target.value)}
                placeholder="e.g., Login Button, Email Input"
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>Description (Optional)</label>
              <textarea
                value={selectorDescription}
                onChange={(e) => setSelectorDescription(e.target.value)}
                placeholder="Add notes about when to use this selector..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-save" 
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

    <Footer />
  </>
  )
}

export default SelectorFinder
