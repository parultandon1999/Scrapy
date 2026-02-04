import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import {
  Settings, Clock, Shield, Download, Globe, Eye, EyeOff,
  AlertCircle, X, ToggleRight, Upload, Save, Zap, Target, Ghost, Info, FileDown
} from 'lucide-react'
import Input from '../components/mui/inputs/Input'
import * as api from '../services/api'
import { ConfigSectionSkeleton, ConfigPageSkeleton, InlineButtonSkeleton } from '../components/mui/skeletons/SkeletonLoader'

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
    <div className="w-full">
      <Input
        type="switch"
        label=""
        value={value}
        onChange={(e) => handleValueChange(section, key, e.target.checked)}
      />
    </div>
  )

  const renderNumberControl = (section, key, value) => {
    const errorKey = `${section}.${key}`
    const hasError = validationErrors[errorKey]
    
    return (
      <div className="w-full">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value)
            handleValueChange(section, key, isNaN(newValue) ? 0 : newValue)
          }}
          className={`
            w-[100px] px-3 py-2 
            bg-white dark:bg-slate-800 
            border rounded-md text-sm text-slate-900 dark:text-slate-100
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
              : 'border-slate-300 dark:border-slate-700'}
          `}
          disabled={saving}
          step={key.includes('delay') || key.includes('scroll') ? '0.1' : '1'}
        />
        {hasError && (
          <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500 rounded text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
            <AlertCircle size={14} className="shrink-0" />
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
      <div className="w-full">
        <div className="relative flex items-center w-full max-w-sm">
          <input
            type={isPassword && !showPasswords ? 'password' : 'text'}
            value={value || ''}
            onChange={(e) => {
              handleValueChange(section, key, e.target.value)
            }}
            className={`
              w-full px-3 py-2 
              bg-white dark:bg-slate-800 
              border rounded-md text-sm text-slate-900 dark:text-slate-100
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                : 'border-slate-300 dark:border-slate-700'}
            `}
            placeholder={`Enter ${key}...`}
            disabled={saving}
          />
          {isPassword && (
            <button
              className="absolute right-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {hasError && (
          <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500 rounded text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
            <AlertCircle size={14} className="shrink-0" />
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow" key={key}>
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
              {key.replace(/_/g, ' ')}
            </span>
            {help && (
              <div className="group relative flex items-center">
                <Info size={14} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-help transition-colors" />
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 text-center">
                  {help}
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-100"></div>
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            {valueType}
          </span>
        </div>
        <div className="w-full md:w-auto md:min-w-[200px] flex justify-end">
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
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-black relative">
          <aside className="w-full md:w-64 bg-white dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 sticky top-16 md:top-[68px] z-30 md:h-[calc(100vh-70px)] shrink-0 flex flex-col p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
              <Settings size={20} /> Configuration
            </h2>
          </aside>
          <main className="flex-1 p-8 overflow-y-auto">
            <ConfigPageSkeleton />
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
      
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-black relative">
        {/* Sidebar / Mobile Tabs Container */}
        <aside 
          className="
            w-full md:w-64 
            bg-white dark:bg-slate-950 
            border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 
            sticky top-[60px] md:top-[68px] z-30 
            md:h-[calc(100vh-70px)] 
            shrink-0 
            flex flex-row md:flex-col 
            overflow-x-auto md:overflow-y-auto 
            p-3 md:py-6 md:px-0
          "
          role="complementary" 
          aria-label="Configuration navigation"
        >
          <div className="hidden md:flex px-5 mb-5 items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <Settings size={20} />
            <h2>Config</h2>
          </div>
          
          {/* Quick Actions */}
          <div className="flex md:flex-col gap-2 px-1 md:px-5 mb-0 md:mb-4 border-b-0 md:border-b border-slate-200 dark:border-slate-800 pb-0 md:pb-4 overflow-x-auto md:overflow-visible shrink-0">
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors whitespace-nowrap"
              onClick={() => setShowPresetModal(true)} 
              title="Load Preset"
            >
              <Zap size={14} />
              <span>Presets</span>
            </button>
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors whitespace-nowrap"
              onClick={handleExportConfig} 
              title="Export Config"
            >
              <FileDown size={14} />
              <span>Export</span>
            </button>
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors whitespace-nowrap"
              onClick={() => fileInputRef.current?.click()} 
              title="Import Config"
            >
              <Upload size={14} />
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

          <nav className="flex md:flex-col gap-1 px-1 md:px-3">
            {config && Object.keys(config).map((section) => (
              <button
                key={section}
                className={`
                  flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-full md:rounded-lg 
                  text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal
                  ${activeSection === section 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
                onClick={() => setActiveSection(section)}
              >
                {getSectionIcon(section)}
                <span>{getSectionTitle(section)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0" role="main">
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
            <div className="flex items-center justify-between p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
          )}

          {config && config[activeSection] && (
            <div className="max-w-4xl">
              <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3 mb-1">
                    {getSectionIcon(activeSection)}
                    {getSectionTitle(activeSection)}
                    {unsavedChanges[activeSection] && (
                      <span className="text-amber-500 animate-pulse text-xl leading-none" title="Unsaved changes">●</span>
                    )}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{getSectionDescription(activeSection)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                {Object.entries(config[activeSection]).map(([key, value]) => 
                  renderConfigItem(activeSection, key, value)
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <button
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => handleResetToDefaults(activeSection)}
                  disabled={saving || !defaultValues[activeSection]}
                  title="Reset this section to default values"
                >
                  Reset to Defaults
                </button>
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                  <button
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handleCancelSection(activeSection)}
                    disabled={saving || !unsavedChanges[activeSection]}
                  >
                    Cancel
                  </button>
                  <button
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all"
                    onClick={() => handleSaveSection(activeSection)}
                    disabled={saving || !unsavedChanges[activeSection] || Object.keys(validationErrors).some(k => k.startsWith(`${activeSection}.`))}
                  >
                    {saving ? <InlineButtonSkeleton /> : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex gap-3 text-blue-700 dark:text-blue-400 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200" onClick={() => setShowPresetModal(false)}>
          <div 
            className="w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Load Configuration Preset</h2>
              <button 
                className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" 
                onClick={() => setShowPresetModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Choose a preset to quickly configure the scraper for different scenarios.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    className="flex flex-col items-center text-center p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleApplyPreset(key)}
                    disabled={saving}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      {preset.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{preset.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200" onClick={() => setShowImportModal(false)}>
          <div 
            className="w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Import Configuration</h2>
              <button 
                className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" 
                onClick={() => setShowImportModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Paste your configuration JSON below or upload a file.
              </p>
              <textarea
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[300px]"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"features": {...}, "scraper": {...}}'
              />
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button 
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                onClick={handleImportConfig}
                disabled={!importText || saving}
              >
                {saving ? <InlineButtonSkeleton /> : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </>
  )
}

export default Config