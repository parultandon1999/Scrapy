import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../components/ToastContainer'
import {
  Palette, Download, Upload, RotateCcw, Check, 
  Sparkles, Eye, FileJson, Copy
} from 'lucide-react'
import '../styles/ThemeCustomizer.css'

function ThemeCustomizer({ darkMode, toggleDarkMode }) {
  const { theme, updateColor, resetTheme, applyPreset, exportTheme, importTheme, presetThemes } = useTheme()
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [previewMode, setPreviewMode] = useState(false)

  const colorOptions = [
    { key: 'primary', label: 'Primary Color', description: 'Main brand color for buttons and links' },
    { key: 'primaryDark', label: 'Primary Dark', description: 'Darker shade for hover states' },
    { key: 'secondary', label: 'Secondary Color', description: 'Secondary accent color' },
    { key: 'secondaryDark', label: 'Secondary Dark', description: 'Darker shade for hover states' },
    { key: 'success', label: 'Success Color', description: 'Color for success messages and states' },
    { key: 'successDark', label: 'Success Dark', description: 'Darker shade for hover states' },
    { key: 'danger', label: 'Danger Color', description: 'Color for errors and destructive actions' },
    { key: 'dangerDark', label: 'Danger Dark', description: 'Darker shade for hover states' },
    { key: 'warning', label: 'Warning Color', description: 'Color for warnings and cautions' },
    { key: 'warningDark', label: 'Warning Dark', description: 'Darker shade for hover states' }
  ]

  const handleColorChange = (key, value) => {
    updateColor(key, value)
  }

  const handleReset = () => {
    if (confirm('Reset theme to default colors?')) {
      resetTheme()
      toast.success('Theme reset to default')
    }
  }

  const handleExport = () => {
    exportTheme()
    toast.success('Theme exported successfully!')
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const themeData = JSON.parse(event.target.result)
        if (importTheme(themeData)) {
          toast.success('Theme imported successfully!')
        } else {
          toast.error('Invalid theme file')
        }
      } catch (error) {
        toast.error('Failed to import theme')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    e.target.value = ''
  }

  const copyColorToClipboard = (color) => {
    navigator.clipboard.writeText(color)
    toast.success(`Copied ${color} to clipboard`)
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
      <div className="theme-customizer-page">
        <div className="theme-customizer-container">
          <div className="theme-header">
            <div>
              <h1>
                <Palette size={32} />
                Theme Customizer
              </h1>
              <p className="theme-subtitle">
                Customize the accent colors throughout the entire application
              </p>
            </div>
            <div className="theme-header-actions">
              <Button
                variant="ghost"
                icon={Eye}
                size="small"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
            </div>
          </div>

          {!previewMode ? (
            <>
              {/* Preset Themes */}
              <section className="theme-section">
                <h2>
                  <Sparkles size={20} />
                  Preset Themes
                </h2>
                <p className="section-description">
                  Quick start with pre-designed color schemes
                </p>
                <div className="preset-grid">
                  {Object.entries(presetThemes).map(([key, preset]) => (
                    <div
                      key={key}
                      className="preset-card"
                      onClick={() => {
                        applyPreset(key)
                        toast.success(`Applied ${preset.name} theme`)
                      }}
                    >
                      <div className="preset-colors">
                        <div
                          className="preset-color-dot"
                          style={{ background: preset.colors.primary }}
                        />
                        <div
                          className="preset-color-dot"
                          style={{ background: preset.colors.secondary }}
                        />
                        <div
                          className="preset-color-dot"
                          style={{ background: preset.colors.success }}
                        />
                        <div
                          className="preset-color-dot"
                          style={{ background: preset.colors.danger }}
                        />
                      </div>
                      <h3>{preset.name}</h3>
                      <Button variant="outline" size="small" fullWidth>
                        Apply Theme
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Custom Colors */}
              <section className="theme-section">
                <h2>
                  <Palette size={20} />
                  Custom Colors
                </h2>
                <p className="section-description">
                  Fine-tune individual colors to match your brand
                </p>
                <div className="color-grid">
                  {colorOptions.map((option) => (
                    <div key={option.key} className="color-item">
                      <div className="color-item-header">
                        <label htmlFor={`color-${option.key}`}>
                          {option.label}
                        </label>
                        <button
                          className="copy-color-btn"
                          onClick={() => copyColorToClipboard(theme[option.key])}
                          title="Copy color code"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="color-description">{option.description}</p>
                      <div className="color-input-group">
                        <input
                          id={`color-${option.key}`}
                          type="color"
                          value={theme[option.key]}
                          onChange={(e) => handleColorChange(option.key, e.target.value)}
                          className="color-picker"
                        />
                        <input
                          type="text"
                          value={theme[option.key]}
                          onChange={(e) => handleColorChange(option.key, e.target.value)}
                          className="color-text-input"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions */}
              <section className="theme-section">
                <h2>Theme Actions</h2>
                <div className="theme-actions">
                  <Button
                    variant="success"
                    icon={Download}
                    onClick={handleExport}
                  >
                    Export Theme
                  </Button>
                  <Button
                    variant="primary"
                    icon={Upload}
                    onClick={handleImport}
                  >
                    Import Theme
                  </Button>
                  <Button
                    variant="danger"
                    icon={RotateCcw}
                    onClick={handleReset}
                  >
                    Reset to Default
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </section>
            </>
          ) : (
            /* Preview Mode */
            <section className="theme-section">
              <h2>
                <Eye size={20} />
                Theme Preview
              </h2>
              <p className="section-description">
                See how your theme looks with different UI elements
              </p>
              
              <div className="preview-section">
                <h3>Buttons</h3>
                <div className="btn-group">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="warning">Warning</Button>
                </div>
              </div>

              <div className="preview-section">
                <h3>Button States</h3>
                <div className="btn-group">
                  <Button variant="primary">Normal</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                  <Button variant="primary" loading>Loading</Button>
                </div>
              </div>

              <div className="preview-section">
                <h3>Links & Text</h3>
                <p>
                  This is a paragraph with a <a href="#" style={{ color: 'var(--color-primary)' }}>primary link</a> and 
                  a <a href="#" style={{ color: 'var(--color-secondary)' }}>secondary link</a>.
                </p>
              </div>

              <div className="preview-section">
                <h3>Status Messages</h3>
                <div className="status-messages">
                  <div className="status-message success">
                    <Check size={16} />
                    <span>Success message with custom color</span>
                  </div>
                  <div className="status-message danger">
                    <span>⚠️</span>
                    <span>Error message with custom color</span>
                  </div>
                  <div className="status-message warning">
                    <span>⚡</span>
                    <span>Warning message with custom color</span>
                  </div>
                </div>
              </div>

              <div className="preview-section">
                <h3>Progress Bar</h3>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: '60%',
                      background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`
                    }}
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ThemeCustomizer
