import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Settings, Clock, Shield, Download, Globe, Eye, EyeOff,
  AlertCircle, X, ToggleRight
} from 'lucide-react'
import ToggleSwitch from '../components/ToggleSwitch'
import * as api from '../services/api'
import '../styles/Config.css'

function Config({ darkMode, toggleDarkMode }) {
  const [activeSection, setActiveSection] = useState('features')
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const data = await api.getConfig()
      setConfig(data)
    } catch (err) {
      setError('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = async (section, key, value) => {
    try {
      setSaving(true)
      setError(null)
      
      await api.updateConfig(section, key, value)
      
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update configuration')
      fetchConfig()
    } finally {
      setSaving(false)
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

  const renderNumberControl = (section, key, value) => (
    <div className="config-control">
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || 0
          setConfig(prev => ({
            ...prev,
            [section]: { ...prev[section], [key]: newValue }
          }))
        }}
        onBlur={(e) => {
          const newValue = parseInt(e.target.value) || 0
          handleValueChange(section, key, newValue)
        }}
        className="config-input-number"
        disabled={saving}
      />
    </div>
  )

  const renderStringControl = (section, key, value, isPassword = false) => (
    <div className="config-control">
      <div className="input-with-icon">
        <input
          type={isPassword && !showPasswords ? 'password' : 'text'}
          value={value || ''}
          onChange={(e) => {
            setConfig(prev => ({
              ...prev,
              [section]: { ...prev[section], [key]: e.target.value }
            }))
          }}
          onBlur={(e) => {
            handleValueChange(section, key, e.target.value)
          }}
          className="config-input-text"
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
    </div>
  )

  const renderConfigItem = (section, key, value) => {
    const isPassword = key.toLowerCase().includes('password')
    const valueType = typeof value
    
    return (
      <div className="config-item-row" key={key}>
        <div className="config-item-label">
          <span className="config-item-key">{key.replace(/_/g, ' ')}</span>
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
      <div className="database-page loading-state">
        <div className="db-loading">
          <div className="spinner"></div>
          <p>Loading configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
      
      <div className="database-page">
        {/* Sidebar / Mobile Tabs Container */}
        <aside className="db-sidebar">
          <div className="sidebar-header">
            <h2><Settings size={20} /> Config</h2>
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
        <main className="db-main">
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
                  </h1>
                  <p className="section-description">{getSectionDescription(activeSection)}</p>
                </div>
              </div>

              <div className="config-section-content">
                {Object.entries(config[activeSection]).map(([key, value]) => 
                  renderConfigItem(activeSection, key, value)
                )}
              </div>

              <div className="config-note">
                <AlertCircle size={16} />
                <div>
                  <strong>Note:</strong> Changes take effect immediately. 
                  Some settings may be overridden by job-specific options.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}

export default Config