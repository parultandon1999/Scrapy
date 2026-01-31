import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/Breadcrumb'
import {
  Settings, Clock, Shield, Download, Globe, Eye, EyeOff,
  AlertCircle, X, ToggleRight, Upload, Save, Zap, Target, Ghost, Info, FileDown
} from 'lucide-react'
import ToggleSwitch from '../components/mui/ToggleSwitch'
import * as api from '../services/api'
import { ConfigSectionSkeleton, ConfigPageSkeleton, InlineButtonSkeleton } from '../components/SkeletonLoader'
import '../styles/Config.css'

function Config({ darkMode, toggleDarkMode }) {
  const [activeSection, setActiveSection] = useState('features')
  const [config, setConfig] = useState(null)
  const [originalConfig, setOriginalConfig] = useState(null) // Store original for comparison
  const [unsavedChanges, setUnsavedChanges] = useState({}) // Track changes per section
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showPasswords, setShowPasswords] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const fileInputRef = useRef(null)

  // Default values for reset functionality
  const defaultValues = {
    features: {
      use_proxies: false,
      use_authentication: false,
      download_file_assets: true,
      headless_browser: true,
      use_fingerprinting: true
    },
    scraper: {
      max_pages: 100,
      max_depth: 3,
      concurrent_limit: 5,
      smart_scroll_iterations: 5,
      max_retries: 3
    },
    proxy: {
      test_timeout: 10000,
      concurrent_tests: 5
    },
    file_download: {
      max_file_size_mb: 50,
      chunk_size: 8192,
      download_timeout: 60,
      max_retries: 3
    },
    timeouts: {
      page_goto: 45000,
      login_page: 30000,
      network_idle: 15000,
      session_test: 15000,
      selector_finder: 30000
    },
    delays: {
      scroll_min: 1.0,
      scroll_max: 1.5,
      post_page_min: 0.5,
      post_page_max: 1.5,
      retry_wait: 2,
      post_login_wait: 3,
      selector_finder_wait: 2
    }
  }

  // Config Presets
  const presets = {
    fast: {
      name: 'Fast',
      icon: <Zap size={18} />,
      description: 'Quick scraping with minimal delays',
      config: {
        scraper: { max_pages: 50, max_depth: 2, concurrent_limit: 10, smart_scroll_iterations: 3, max_retries: 2 },
        timeouts: { page_goto: 30000, login_page: 20000, network_idle: 10000, session_test: 10000, selector_finder: 20000 },
        delays: { scroll_min: 0.3, scroll_max: 0.5, post_page_min: 0.2, post_page_max: 0.5, retry_wait: 1, post_login_wait: 2, selector_finder_wait: 1 }
      }
    },
    thorough: {
      name: 'Thorough',
      icon: <Target size={18} />,
      description: 'Deep crawling with comprehensive coverage',
      config: {
        scraper: { max_pages: 500, max_depth: 5, concurrent_limit: 3, smart_scroll_iterations: 8, max_retries: 5 },
        timeouts: { page_goto: 60000, login_page: 45000, network_idle: 20000, session_test: 20000, selector_finder: 45000 },
        delays: { scroll_min: 1.5, scroll_max: 2.5, post_page_min: 1.0, post_page_max: 2.0, retry_wait: 3, post_login_wait: 5, selector_finder_wait: 3 }
      }
    },
    stealth: {
      name: 'Stealth',
      icon: <Ghost size={18} />,
      description: 'Human-like behavior to avoid detection',
      config: {
        features: { use_fingerprinting: true, headless_browser: false },
        scraper: { max_pages: 100, max_depth: 3, concurrent_limit: 2, smart_scroll_iterations: 6, max_retries: 3 },
        timeouts: { page_goto: 50000, login_page: 40000, network_idle: 18000, session_test: 18000, selector_finder: 35000 },
        delays: { scroll_min: 2.0, scroll_max: 4.0, post_page_min: 2.0, post_page_max: 4.0, retry_wait: 5, post_login_wait: 8, selector_finder_wait: 4 }
      }
    }
  }

  // Help text for each setting
  const helpText = {
    features: {
      use_proxies: 'Rotate through proxy servers to distribute requests',
      use_authentication: 'Enable login functionality for protected sites',
      download_file_assets: 'Download and save files (PDFs, images, etc.)',
      headless_browser: 'Run browser in background without visible window',
      use_fingerprinting: 'Randomize browser fingerprint to avoid detection'
    },
    scraper: {
      max_pages: 'Maximum number of pages to scrape before stopping',
      max_depth: 'How many link levels deep to follow from start URL',
      concurrent_limit: 'Number of pages to scrape simultaneously',
      smart_scroll_iterations: 'Times to scroll page to load dynamic content',
      max_retries: 'Retry attempts for failed page loads'
    },
    proxy: {
      test_timeout: 'Maximum time to wait when testing proxy connection',
      concurrent_tests: 'Number of proxies to test simultaneously'
    },
    file_download: {
      max_file_size_mb: 'Skip files larger than this size',
      chunk_size: 'Download buffer size in bytes',
      download_timeout: 'Maximum time to wait for file download',
      max_retries: 'Retry attempts for failed downloads'
    },
    timeouts: {
      page_goto: 'Maximum time to wait for page navigation',
      login_page: 'Maximum time to wait for login page load',
      network_idle: 'Wait time for network activity to settle',
      session_test: 'Maximum time to test authentication session',
      selector_finder: 'Maximum time to find login form elements'
    },
    delays: {
      scroll_min: 'Minimum delay between scroll actions (seconds)',
      scroll_max: 'Maximum delay between scroll actions (seconds)',
      post_page_min: 'Minimum delay after page load (seconds)',
      post_page_max: 'Maximum delay after page load (seconds)',
      retry_wait: 'Delay before retrying failed requests (seconds)',
      post_login_wait: 'Wait time after login submission (seconds)',
      selector_finder_wait: 'Delay during login form analysis (seconds)'
    },
    auth: {
      login_url: 'URL of the login page',
      username: 'Login username or email',
      password: 'Login password',
      username_selector: 'CSS selector for username input field',
      password_selector: 'CSS selector for password input field',
      submit_selector: 'CSS selector for login submit button',
      success_indicator: 'CSS selector visible only when logged in'
    }
  }

  // Validation rules for each config field
  const validationRules = {
    scraper: {
      max_pages: { min: 1, max: 10000, type: 'number', message: 'Must be between 1 and 10,000' },
      max_depth: { min: 1, max: 20, type: 'number', message: 'Must be between 1 and 20' },
      concurrent_limit: { min: 1, max: 20, type: 'number', message: 'Must be between 1 and 20' },
      smart_scroll_iterations: { min: 1, max: 20, type: 'number', message: 'Must be between 1 and 20' },
      max_retries: { min: 0, max: 10, type: 'number', message: 'Must be between 0 and 10' }
    },
    proxy: {
      test_timeout: { min: 1000, max: 60000, type: 'number', message: 'Must be between 1,000 and 60,000 ms' },
      concurrent_tests: { min: 1, max: 50, type: 'number', message: 'Must be between 1 and 50' }
    },
    file_download: {
      max_file_size_mb: { min: 1, max: 1000, type: 'number', message: 'Must be between 1 and 1,000 MB' },
      chunk_size: { min: 1024, max: 1048576, type: 'number', message: 'Must be between 1,024 and 1,048,576 bytes' },
      download_timeout: { min: 10, max: 600, type: 'number', message: 'Must be between 10 and 600 seconds' },
      max_retries: { min: 0, max: 10, type: 'number', message: 'Must be between 0 and 10' }
    },
    timeouts: {
      page_goto: { min: 5000, max: 120000, type: 'number', message: 'Must be between 5,000 and 120,000 ms' },
      login_page: { min: 5000, max: 120000, type: 'number', message: 'Must be between 5,000 and 120,000 ms' },
      network_idle: { min: 1000, max: 60000, type: 'number', message: 'Must be between 1,000 and 60,000 ms' },
      session_test: { min: 1000, max: 60000, type: 'number', message: 'Must be between 1,000 and 60,000 ms' },
      selector_finder: { min: 5000, max: 120000, type: 'number', message: 'Must be between 5,000 and 120,000 ms' }
    },
    delays: {
      scroll_min: { min: 0.1, max: 10, type: 'number', message: 'Must be between 0.1 and 10 seconds' },
      scroll_max: { min: 0.1, max: 10, type: 'number', message: 'Must be between 0.1 and 10 seconds' },
      post_page_min: { min: 0.1, max: 10, type: 'number', message: 'Must be between 0.1 and 10 seconds' },
      post_page_max: { min: 0.1, max: 10, type: 'number', message: 'Must be between 0.1 and 10 seconds' },
      retry_wait: { min: 0.5, max: 30, type: 'number', message: 'Must be between 0.5 and 30 seconds' },
      post_login_wait: { min: 1, max: 30, type: 'number', message: 'Must be between 1 and 30 seconds' },
      selector_finder_wait: { min: 1, max: 30, type: 'number', message: 'Must be between 1 and 30 seconds' }
    },
    auth: {
      login_url: { type: 'url', message: 'Must be a valid URL (http:// or https://)' }
    }
  }

  const validateValue = (section, key, value) => {
    const rule = validationRules[section]?.[key]
    if (!rule) return { valid: true }

    // URL validation
    if (rule.type === 'url' && value) {
      try {
        const url = new URL(value)
        if (!url.protocol.startsWith('http')) {
          return { valid: false, message: rule.message }
        }
      } catch {
        return { valid: false, message: rule.message }
      }
    }

    // Number validation
    if (rule.type === 'number') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      
      if (isNaN(numValue)) {
        return { valid: false, message: 'Must be a valid number' }
      }
      
      if (rule.min !== undefined && numValue < rule.min) {
        return { valid: false, message: rule.message }
      }
      
      if (rule.max !== undefined && numValue > rule.max) {
        return { valid: false, message: rule.message }
      }
    }

    return { valid: true }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const data = await api.getConfig()
      setConfig(data)
      setOriginalConfig(JSON.parse(JSON.stringify(data))) // Deep clone
    } catch {
      setError('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (section, key, value) => {
    // Validate the value
    const validation = validateValue(section, key, value)
    
    if (!validation.valid) {
      setValidationErrors(prev => ({
        ...prev,
        [`${section}.${key}`]: validation.message
      }))
      return
    }

    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`${section}.${key}`]
      return newErrors
    })

    // Update config state (not saved yet)
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))

    // Mark section as having unsaved changes
    setUnsavedChanges(prev => ({
      ...prev,
      [section]: true
    }))
  }

  const handleSaveSection = async (section) => {
    try {
      setSaving(true)
      setError(null)

      // Save all changed values in this section
      const sectionConfig = config[section]
      const originalSectionConfig = originalConfig[section]

      for (const [key, value] of Object.entries(sectionConfig)) {
        if (JSON.stringify(value) !== JSON.stringify(originalSectionConfig[key])) {
          await api.updateConfig(section, key, value)
        }
      }

      // Update original config to match current
      setOriginalConfig(prev => ({
        ...prev,
        [section]: { ...config[section] }
      }))

      // Clear unsaved changes for this section
      setUnsavedChanges(prev => {
        const newChanges = { ...prev }
        delete newChanges[section]
        return newChanges
      })

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save configuration')
      // Revert to original on error
      setConfig(prev => ({
        ...prev,
        [section]: { ...originalConfig[section] }
      }))
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSection = (section) => {
    // Revert to original config
    setConfig(prev => ({
      ...prev,
      [section]: { ...originalConfig[section] }
    }))

    // Clear unsaved changes for this section
    setUnsavedChanges(prev => {
      const newChanges = { ...prev }
      delete newChanges[section]
      return newChanges
    })

    // Clear validation errors for this section
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${section}.`)) {
          delete newErrors[key]
        }
      })
      return newErrors
    })
  }

  const handleResetToDefaults = async (section) => {
    if (!defaultValues[section]) return

    try {
      setSaving(true)
      setError(null)

      // Save all default values for this section
      const defaults = defaultValues[section]
      for (const [key, value] of Object.entries(defaults)) {
        await api.updateConfig(section, key, value)
      }

      // Update both current and original config
      setConfig(prev => ({
        ...prev,
        [section]: { ...defaults }
      }))
      setOriginalConfig(prev => ({
        ...prev,
        [section]: { ...defaults }
      }))

      // Clear unsaved changes
      setUnsavedChanges(prev => {
        const newChanges = { ...prev }
        delete newChanges[section]
        return newChanges
      })

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset to defaults')
    } finally {
      setSaving(false)
    }
  }

  const handleApplyPreset = async (presetKey) => {
    const preset = presets[presetKey]
    if (!preset) return

    try {
      setSaving(true)
      setError(null)

      // Apply preset config to all relevant sections
      for (const [section, values] of Object.entries(preset.config)) {
        for (const [key, value] of Object.entries(values)) {
          await api.updateConfig(section, key, value)
        }
      }

      // Fetch updated config
      await fetchConfig()
      setShowPresetModal(false)

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply preset')
    } finally {
      setSaving(false)
    }
  }

  const handleExportConfig = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      config: config
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scraper-config-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportConfig = async () => {
    try {
      const importedData = JSON.parse(importText)
      const importedConfig = importedData.config || importedData

      setSaving(true)
      setError(null)

      // Apply imported config
      for (const [section, values] of Object.entries(importedConfig)) {
        if (config[section]) {
          for (const [key, value] of Object.entries(values)) {
            await api.updateConfig(section, key, value)
          }
        }
      }

      // Fetch updated config
      await fetchConfig()
      setShowImportModal(false)
      setImportText('')

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import config. Check JSON format.')
    } finally {
      setSaving(false)
    }
  }

  const handleImportFile = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportText(e.target.result)
        setShowImportModal(true)
      }
      reader.readAsText(file)
    }
  }

  const renderBooleanControl = (section, key, value) => (
    <div className="config-control">
      <ToggleSwitch
        checked={value}
        onChange={(e) => handleValueChange(section, key, e.target.checked)}
      />
    </div>
  )

  const renderNumberControl = (section, key, value) => {
    const errorKey = `${section}.${key}`
    const hasError = validationErrors[errorKey]
    
    return (
      <div className="config-control">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value)
            handleValueChange(section, key, isNaN(newValue) ? 0 : newValue)
          }}
          className={`config-input-number ${hasError ? 'error' : ''}`}
          disabled={saving}
          step={key.includes('delay') || key.includes('scroll') ? '0.1' : '1'}
        />
        {hasError && (
          <div className="validation-error">
            <AlertCircle size={14} />
            <span>{hasError}</span>
          </div>
        )}
      </div>
    )
  }

  const renderStringControl = (section, key, value, isPassword = false) => {
    const errorKey = `${section}.${key}`
    const hasError = validationErrors[errorKey]
    
    return (
      <div className="config-control">
        <div className="input-with-icon">
          <input
            type={isPassword && !showPasswords ? 'password' : 'text'}
            value={value || ''}
            onChange={(e) => {
              handleValueChange(section, key, e.target.value)
            }}
            className={`config-input-text ${hasError ? 'error' : ''}`}
            placeholder={`Enter ${key}...`}
            disabled={saving}
          />
          {isPassword && (
            <button
              className="toggle-password-btn"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {hasError && (
          <div className="validation-error">
            <AlertCircle size={14} />
            <span>{hasError}</span>
          </div>
        )}
      </div>
    )
  }

  const renderConfigItem = (section, key, value) => {
    const isPassword = key.toLowerCase().includes('password')
    const valueType = typeof value
    const help = helpText[section]?.[key]
    
    return (
      <div className="config-item-row" key={key}>
        <div className="config-item-label">
          <div className="config-label-with-help">
            <span className="config-item-key">{key.replace(/_/g, ' ')}</span>
            {help && (
              <div className="help-tooltip">
                <Info size={14} className="help-icon" />
                <span className="help-text">{help}</span>
              </div>
            )}
          </div>
          <span className="config-item-type">{valueType}</span>
        </div>
        <div className="config-item-value">
          {valueType === 'boolean' && renderBooleanControl(section, key, value)}
          {valueType === 'number' && renderNumberControl(section, key, value)}
          {valueType === 'string' && renderStringControl(section, key, value, isPassword)}
          {value === null && renderStringControl(section, key, '', isPassword)}
        </div>
      </div>
    )
  }

  const getSectionIcon = (section) => {
    const icons = {
      features: <ToggleRight size={18} />,
      scraper: <Settings size={18} />,
      proxy: <Globe size={18} />,
      auth: <Shield size={18} />,
      file_download: <Download size={18} />,
      timeouts: <Clock size={18} />,
      delays: <Clock size={18} />
    }
    return icons[section] || <Settings size={18} />
  }

  const getSectionTitle = (section) => {
    const titles = {
      features: 'Feature Flags',
      scraper: 'Scraper Settings',
      proxy: 'Proxy Config',
      auth: 'Authentication',
      file_download: 'Downloads',
      timeouts: 'Timeouts',
      delays: 'Delays'
    }
    return titles[section] || section
  }

  const getSectionDescription = (section) => {
    const descriptions = {
      features: 'Enable or disable major features',
      scraper: 'Core scraping parameters and limits',
      proxy: 'Proxy rotation and testing settings',
      auth: 'Login credentials and selectors',
      file_download: 'File download configuration',
      timeouts: 'Network and page load timeouts',
      delays: 'Human-like delays between actions'
    }
    return descriptions[section] || ''
  }

  if (loading) {
    return (
      <>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
        <div className="database-page">
          <aside className="db-sidebar">
            <h2><Settings size={20} /> Configuration</h2>
          </aside>
          <main className="db-main">
            <ConfigPageSkeleton />
          </main>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
      
      <div className="database-page">
        {/* Sidebar / Mobile Tabs Container */}
        <aside className="db-sidebar" role="complementary" aria-label="Configuration navigation">
          <div className="sidebar-header">
            <h2><Settings size={20} /> Config</h2>
          </div>
          
          {/* Quick Actions */}
          <div className="sidebar-actions">
            <button className="sidebar-action-btn" onClick={() => setShowPresetModal(true)} title="Load Preset">
              <Zap size={16} />
              <span>Presets</span>
            </button>
            <button className="sidebar-action-btn" onClick={handleExportConfig} title="Export Config">
              <FileDown size={16} />
              <span>Export</span>
            </button>
            <button className="sidebar-action-btn" onClick={() => fileInputRef.current?.click()} title="Import Config">
              <Upload size={16} />
              <span>Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>

          <nav className="db-nav">
            {config && Object.keys(config).map((section) => (
              <button
                key={section}
                className={`db-nav-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => setActiveSection(section)}
              >
                {getSectionIcon(section)}
                <span>{getSectionTitle(section)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" className="db-main" role="main">
          <Breadcrumb 
            items={[
              { label: 'Configuration', icon: Settings, path: '/config' },
              { label: activeSection === 'features' ? 'Features' :
                       activeSection === 'scraper' ? 'Scraper' :
                       activeSection === 'proxy' ? 'Proxy' :
                       activeSection === 'file_download' ? 'File Download' :
                       activeSection === 'authentication' ? 'Authentication' :
                       activeSection === 'fingerprinting' ? 'Fingerprinting' : 'Settings'
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

          {config && config[activeSection] && (
            <div className="config-view">
              <div className="view-header-compact">
                <div>
                  <h1>
                    {getSectionIcon(activeSection)}
                    {getSectionTitle(activeSection)}
                    {unsavedChanges[activeSection] && (
                      <span className="unsaved-indicator" title="Unsaved changes">●</span>
                    )}
                  </h1>
                  <p className="section-description">{getSectionDescription(activeSection)}</p>
                </div>
              </div>

              <div className="config-section-content">
                {Object.entries(config[activeSection]).map(([key, value]) => 
                  renderConfigItem(activeSection, key, value)
                )}
              </div>

              {/* Action Buttons */}
              <div className="config-actions">
                <button
                  className="btn-reset"
                  onClick={() => handleResetToDefaults(activeSection)}
                  disabled={saving || !defaultValues[activeSection]}
                  title="Reset this section to default values"
                >
                  Reset to Defaults
                </button>
                <div className="config-actions-right">
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelSection(activeSection)}
                    disabled={saving || !unsavedChanges[activeSection]}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveSection(activeSection)}
                    disabled={saving || !unsavedChanges[activeSection] || Object.keys(validationErrors).some(k => k.startsWith(`${activeSection}.`))}
                  >
                    {saving ? <InlineButtonSkeleton /> : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="config-note">
                <AlertCircle size={16} />
                <div>
                  <strong>Note:</strong> Changes must be saved to take effect. 
                  Some settings may be overridden by job-specific options.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Preset Modal */}
      {showPresetModal && (
        <div className="modal-overlay" onClick={() => setShowPresetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Load Configuration Preset</h2>
              <button className="modal-close" onClick={() => setShowPresetModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Choose a preset to quickly configure the scraper for different scenarios.
              </p>
              <div className="preset-grid">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    className="preset-card"
                    onClick={() => handleApplyPreset(key)}
                    disabled={saving}
                  >
                    <div className="preset-icon">{preset.icon}</div>
                    <h3>{preset.name}</h3>
                    <p>{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Configuration</h2>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Paste your configuration JSON below or upload a file.
              </p>
              <textarea
                className="import-textarea"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"features": {...}, "scraper": {...}}'
                rows={12}
              />
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowImportModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn-save"
                  onClick={handleImportConfig}
                  disabled={!importText || saving}
                >
                  {saving ? <InlineButtonSkeleton /> : 'Import'}
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

export default Config