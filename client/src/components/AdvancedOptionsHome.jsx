import { useState, useEffect } from 'react'
// REMOVED all @mui/material imports
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'
import Input from './mui/inputs/Input'

function AdvancedOptionsModal({ isOpen, onClose, onSave, initialOptions }) {
  const [fieldErrors, setFieldErrors] = useState({})
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
    success_indicator: '',
    manual_login_mode: false
  })

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const handleChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
    
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: '' }))
    }
    
    if (['max_pages', 'max_depth', 'concurrent_limit', 'max_file_size_mb'].includes(key)) {
      if (value) {
        const numValue = parseFloat(value)
        if (!Number.isInteger(numValue)) {
          setFieldErrors(prev => ({ ...prev, [key]: 'Must be a whole number' }))
        } else if (numValue < 1) {
          setFieldErrors(prev => ({ ...prev, [key]: 'Must be at least 1' }))
        }
      }
    }
  }

  const handleSave = () => {
    if (Object.values(fieldErrors).some(error => error)) return
    
    if (options.max_pages && parseInt(options.max_pages) < 1) {
      setFieldErrors(prev => ({ ...prev, max_pages: 'Max pages must be at least 1' }))
      return
    }
    if (options.max_depth && parseInt(options.max_depth) < 1) {
      setFieldErrors(prev => ({ ...prev, max_depth: 'Max depth must be at least 1' }))
      return
    }
    if (options.concurrent_limit && parseInt(options.concurrent_limit) < 1) {
      setFieldErrors(prev => ({ ...prev, concurrent_limit: 'Concurrent limit must be at least 1' }))
      return
    }
    if (options.max_file_size_mb && parseInt(options.max_file_size_mb) < 1) {
      setFieldErrors(prev => ({ ...prev, max_file_size_mb: 'Max file size must be at least 1 MB' }))
      return
    }
    if (options.login_url && options.login_url.trim()) {
      try {
        new URL(options.login_url)
      } catch {
        setFieldErrors(prev => ({ ...prev, login_url: 'Invalid login URL format' }))
        return
      }
    }
    
    setFieldErrors({})
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
      success_indicator: '',
      manual_login_mode: false
    })
    setFieldErrors({})
  }

  if (!isOpen) return null

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Content */}
      <div 
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        
        {/* Header */}
        <div className="text-center py-4 border-b border-gray-100">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Icon name="Settings" size={20} />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Advanced Options</h2>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Scraper Settings */}
          <div>
            <div className="mb-4 flex items-center gap-1.5 font-semibold text-sm text-gray-700">
              <Icon name="Tune" size={16} /> 
              <span>Scraper Settings</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Input
                  type="number"
                  label="Max Pages"
                  placeholder="Default"
                  value={options.max_pages}
                  onChange={(e) => handleChange('max_pages', e.target.value)}
                  error={!!fieldErrors.max_pages}
                  helperText={fieldErrors.max_pages || ''}
                  size="small"
                  fullWidth
                  min={1}
                  step={1}
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="number"
                  label="Max Depth"
                  placeholder="Default"
                  value={options.max_depth}
                  onChange={(e) => handleChange('max_depth', e.target.value)}
                  error={!!fieldErrors.max_depth}
                  helperText={fieldErrors.max_depth || ''}
                  size="small"
                  fullWidth
                  min={1}
                  step={1}
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="number"
                  label="Concurrent Workers"
                  placeholder="Default"
                  value={options.concurrent_limit}
                  onChange={(e) => handleChange('concurrent_limit', e.target.value)}
                  error={!!fieldErrors.concurrent_limit}
                  helperText={fieldErrors.concurrent_limit || ''}
                  size="small"
                  fullWidth
                  min={1}
                  step={1}
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="number"
                  label="Max File Size (MB)"
                  placeholder="Default"
                  value={options.max_file_size_mb}
                  onChange={(e) => handleChange('max_file_size_mb', e.target.value)}
                  error={!!fieldErrors.max_file_size_mb}
                  helperText={fieldErrors.max_file_size_mb || ''}
                  size="small"
                  fullWidth
                  min={1}
                  step={1}
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="switch"
                  label="Headless Mode"
                  value={options.headless}
                  onChange={(e) => handleChange('headless', e.target.checked)}
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="switch"
                  label="Download Assets"
                  value={options.download_file_assets}
                  onChange={(e) => handleChange('download_file_assets', e.target.checked)}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          {/* Authentication Settings */}
          <div>
            <div className="mb-4 flex items-center gap-1.5 font-semibold text-sm text-gray-700">
              <Icon name="Lock" size={16} /> 
              <span>Authentication (Optional)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  type="switch"
                  label="Manual Login Mode"
                  value={options.manual_login_mode}
                  onChange={(e) => handleChange('manual_login_mode', e.target.checked)}
                />
              </div>

              {/* Alert / Collapse Replacement */}
              {options.manual_login_mode && (
                <div className="col-span-2 bg-blue-50 p-3 rounded-md flex items-start gap-3 text-blue-800 mb-2">
                  <Icon name="Info" size={16} className="mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold mb-0.5">
                      Manual Login Enabled
                    </span>
                    <span className="block text-xs leading-relaxed opacity-90">
                      Browser window opens for manual login. Perfect for CAPTCHA sites. Session saved after 60s.
                    </span>
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <Input
                  type="url"
                  label="Login URL"
                  placeholder="https://example.com/login"
                  value={options.login_url}
                  onChange={(e) => handleChange('login_url', e.target.value)}
                  error={!!fieldErrors.login_url}
                  helperText={fieldErrors.login_url || ''}
                  size="small"
                  fullWidth
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="text"
                  label="Username"
                  placeholder="Username"
                  value={options.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  size="small"
                  fullWidth
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="password"
                  label="Password"
                  placeholder="Password"
                  value={options.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  size="small"
                  fullWidth
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="text"
                  label="Username Selector"
                  placeholder="input[name='username']"
                  value={options.username_selector}
                  onChange={(e) => handleChange('username_selector', e.target.value)}
                  disabled={options.manual_login_mode}
                  size="small"
                  fullWidth
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="text"
                  label="Password Selector"
                  placeholder="input[name='password']"
                  value={options.password_selector}
                  onChange={(e) => handleChange('password_selector', e.target.value)}
                  disabled={options.manual_login_mode}
                  size="small"
                  fullWidth
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="text"
                  label="Submit Selector"
                  placeholder="button[type='submit']"
                  value={options.submit_selector}
                  onChange={(e) => handleChange('submit_selector', e.target.value)}
                  disabled={options.manual_login_mode}
                  size="small"
                  fullWidth
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="text"
                  label="Success Indicator"
                  placeholder=".user-profile"
                  value={options.success_indicator}
                  onChange={(e) => handleChange('success_indicator', e.target.value)}
                  disabled={options.manual_login_mode}
                  size="small"
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-lg">
          <Button 
            variant="ghost" 
            size="small"
            onClick={handleReset}
          >
            <Icon name="RestartAlt" size="small" /> Reset
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              size="small"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              size="small"
              onClick={handleSave}
            >
              <Icon name="Save" size="small" /> Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedOptionsModal