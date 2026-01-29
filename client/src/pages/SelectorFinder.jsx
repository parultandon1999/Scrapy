import { useState } from 'react'
import {
  Search, Copy, CheckCircle, XCircle, AlertCircle, X,
  FileCode, MousePointer, FormInput, TestTube, Plus, Minus, Image
} from 'lucide-react'
import * as api from '../services/api'
import '../styles/SelectorFinder.css'

function SelectorFinder() {
  const [activeSection, setActiveSection] = useState('analyze')
  const [loginUrl, setLoginUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  
  // Test login state
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

  // Element finder state
  const [findUrl, setFindUrl] = useState('')
  const [searchQueries, setSearchQueries] = useState([''])
  const [imageUrls, setImageUrls] = useState([''])
  const [searchType, setSearchType] = useState('partial')
  const [findLoading, setFindLoading] = useState(false)
  const [findResults, setFindResults] = useState(null)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults(null)

    try {
      const data = await api.analyzeLoginPage(loginUrl)
      setResults(data)
      
      // Auto-fill test form with suggested selectors
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
      // Filter out empty queries
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

  const useSuggestedSelector = (field, selector) => {
    setTestData(prev => ({
      ...prev,
      [field]: selector
    }))
    setActiveSection('test')
  }

  return (
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
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
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

        {/* Analyze Section */}
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
                          className="icon-btn"
                          onClick={() => useSuggestedSelector('usernameSelector', results.suggested_config.username_selector)}
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
                          className="icon-btn"
                          onClick={() => useSuggestedSelector('passwordSelector', results.suggested_config.password_selector)}
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
                          className="icon-btn"
                          onClick={() => useSuggestedSelector('submitSelector', results.suggested_config.submit_selector)}
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
                {testLoading ? 'Testing...' : 'Test Login'}
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
                {findLoading ? 'Searching...' : 'Find Elements'}
              </button>
            </form>

            {/* Find Results */}
            {findResults && findResults.results_by_query && (
              <div className="queries-results">
                {Object.entries(findResults.results_by_query).map(([searchKey, queryData], queryIdx) => (
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
  )
}

export default SelectorFinder
