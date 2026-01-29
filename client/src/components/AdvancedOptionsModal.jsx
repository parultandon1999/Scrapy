import { useState } from 'react'
import NumericInput from '../components/InputValidator'
import ToggleSwitch from './ToggleSwitch'
import '../styles/AdvancedOptionsModal.css'

function AdvancedOptionsModal({ isOpen, onClose, onSave, initialOptions }) {
  const [fieldError, setFieldError] = useState('')
  const [options, setOptions] = useState(initialOptions || {
    max_pages: '',
    max_depth: '',
    concurrent_limit: '',
    headless: true,
    download_file_assets: true,
    max_file_size_mb: '',
    login_url: '',
    username: '',
    password: '',
    username_selector: '',
    password_selector: '',
    submit_selector: '',
    success_indicator: ''
  })

  const handleChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Validate numeric inputs
    if (options.max_pages && parseInt(options.max_pages) < 1) {
      setFieldError('Max pages must be at least 1')
      return
    }
    
    if (options.max_depth && parseInt(options.max_depth) < 1) {
      setFieldError('Max depth must be at least 1')
      return
    }
    
    if (options.concurrent_limit && parseInt(options.concurrent_limit) < 1) {
      setFieldError('Concurrent limit must be at least 1')
      return
    }
    
    if (options.max_file_size_mb && parseInt(options.max_file_size_mb) < 1) {
      setFieldError('Max file size must be at least 1 MB')
      return
    }
    
    // Validate URL if provided
    if (options.login_url && options.login_url.trim()) {
      try {
        new URL(options.login_url)
      } catch {
        setFieldError('Invalid login URL format')
        return
      }
    }
    
    setFieldError('')
    onSave(options)
    onClose()
  }

  const handleReset = () => {
    setOptions({
      max_pages: '',
      max_depth: '',
      concurrent_limit: '',
      headless: true,
      download_file_assets: true,
      max_file_size_mb: '',
      login_url: '',
      username: '',
      password: '',
      username_selector: '',
      password_selector: '',
      submit_selector: '',
      success_indicator: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Advanced Options</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Scraper Settings */}
          <div className="option-section">
            <h3>Scraper Settings</h3>
            <div className="option-grid">
              <div className="option-field">
                <label>Max Pages</label>
                <NumericInput
                  type="number"
                  placeholder="Default from config"
                  value={options.max_pages}
                  onChange={(e) => handleChange('max_pages', e.target.value)}
                  min="1"
                />
                {fieldError && <span className="field-error">{fieldError}</span>}
              </div>

              <div className="option-field">
                <label>Max Depth</label>
                <NumericInput
                  type="number"
                  placeholder="Default from config"
                  value={options.max_depth}
                  onChange={(e) => handleChange('max_depth', e.target.value)}
                  min="1"
                />
                {fieldError && <span className="field-error">{fieldError}</span>}
              </div>

              <div className="option-field">
                <label>Concurrent Workers</label>
                <NumericInput
                  type="number"
                  placeholder="Default from config"
                  value={options.concurrent_limit}
                  onChange={(e) => handleChange('concurrent_limit', e.target.value)}
                  min="1"
                />
              </div>

              <div className="option-field">
                <label>Max File Size (MB)</label>
                <NumericInput
                  type="number"
                  placeholder="Default from config"
                  value={options.max_file_size_mb}
                  onChange={(e) => handleChange('max_file_size_mb', e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <div className="option-checkboxes">
              <label className="checkbox-label">
                <ToggleSwitch
                  type="checkbox"
                  checked={options.headless}
                  onChange={(e) => handleChange('headless', e.target.checked)}
                />
                <span>Headless Mode</span>
              </label>
            </div>
            <div className="option-checkboxes">
              <label className="checkbox-label">
                <ToggleSwitch
                  type="checkbox"
                  checked={options.download_file_assets}
                  onChange={(e) => handleChange('download_file_assets', e.target.checked)}
                />
                <span>Download File Assets</span>
              </label>
            </div>
          </div>

          {/* Authentication Settings */}
          <div className="option-section">
            <h3>Authentication (Optional)</h3>
            <div className="option-grid">
              <div className="option-field full-width">
                <label>Login URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/login"
                  value={options.login_url}
                  onChange={(e) => handleChange('login_url', e.target.value)}
                />
              </div>

              <div className="option-field">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  value={options.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                />
              </div>

              <div className="option-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={options.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
              </div>

              <div className="option-field">
                <label>Username Selector</label>
                <input
                  type="text"
                  placeholder="input[name='username']"
                  value={options.username_selector}
                  onChange={(e) => handleChange('username_selector', e.target.value)}
                />
              </div>

              <div className="option-field">
                <label>Password Selector</label>
                <input
                  type="text"
                  placeholder="input[name='password']"
                  value={options.password_selector}
                  onChange={(e) => handleChange('password_selector', e.target.value)}
                />
              </div>

              <div className="option-field">
                <label>Submit Selector</label>
                <input
                  type="text"
                  placeholder="button[type='submit']"
                  value={options.submit_selector}
                  onChange={(e) => handleChange('submit_selector', e.target.value)}
                />
              </div>

              <div className="option-field">
                <label>Success Indicator</label>
                <input
                  type="text"
                  placeholder=".user-profile"
                  value={options.success_indicator}
                  onChange={(e) => handleChange('success_indicator', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Options
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedOptionsModal
