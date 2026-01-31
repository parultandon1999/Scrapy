import { useState } from 'react'
import { usePreferences } from '../contexts/PreferencesContext'
import { useToast } from '../components/ToastContainer'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import Button from '../components/Button'
import { 
  Gear, 
  Bell, 
  Eye, 
  ShieldCheck, 
  DownloadSimple, 
  UploadSimple, 
  ArrowCounterClockwise 
} from '@phosphor-icons/react'
import '../styles/Preferences.css'

function Preferences({ darkMode, toggleDarkMode }) {
  const { preferences, updateSection, resetPreferences, exportPreferences, importPreferences } = usePreferences()
  const { addToast } = useToast()
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')

  const handleScrapingChange = (field, value) => {
    updateSection('scraping', { [field]: value })
  }

  const handleNotificationChange = (field, value) => {
    updateSection('notifications', { [field]: value })
  }

  const handleDisplayChange = (field, value) => {
    updateSection('display', { [field]: value })
  }

  const handlePrivacyChange = (field, value) => {
    updateSection('privacy', { [field]: value })
  }

  const handleExport = () => {
    exportPreferences()
    addToast('Preferences exported successfully', 'success')
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importText)
      if (importPreferences(data)) {
        addToast('Preferences imported successfully', 'success')
        setShowImportModal(false)
        setImportText('')
      } else {
        addToast('Invalid preferences file', 'error')
      }
    } catch (e) {
      addToast('Failed to parse JSON', 'error')
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all preferences to defaults?')) {
      resetPreferences()
      addToast('Preferences reset to defaults', 'success')
    }
  }

  const breadcrumbItems = [
    { label: 'Preferences', icon: Gear }
  ]

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="preferences" />
      
      <main id="main-content" role="main" className="preferences-page">
        <div className="preferences-header">
          <Breadcrumb items={breadcrumbItems} />
          <h1>User Preferences</h1>
          <p className="preferences-subtitle">Customize your scraping experience</p>
        </div>

        {/* Default Scraping Options */}
        <section className="preferences-section" aria-labelledby="scraping-heading">
          <div className="section-header">
            <Gear size={24} weight="duotone" aria-hidden="true" />
            <h2 id="scraping-heading">Default Scraping Options</h2>
          </div>
          
          <div className="preferences-grid">
            <div className="preference-item">
              <label htmlFor="maxPages">Max Pages</label>
              <input
                id="maxPages"
                type="number"
                min="1"
                max="10000"
                value={preferences.scraping.maxPages}
                onChange={(e) => handleScrapingChange('maxPages', parseInt(e.target.value))}
              />
              <span className="preference-hint">Maximum number of pages to scrape</span>
            </div>

            <div className="preference-item">
              <label htmlFor="maxDepth">Max Depth</label>
              <input
                id="maxDepth"
                type="number"
                min="1"
                max="10"
                value={preferences.scraping.maxDepth}
                onChange={(e) => handleScrapingChange('maxDepth', parseInt(e.target.value))}
              />
              <span className="preference-hint">Maximum crawl depth</span>
            </div>

            <div className="preference-item">
              <label htmlFor="concurrentLimit">Concurrent Limit</label>
              <input
                id="concurrentLimit"
                type="number"
                min="1"
                max="20"
                value={preferences.scraping.concurrentLimit}
                onChange={(e) => handleScrapingChange('concurrentLimit', parseInt(e.target.value))}
              />
              <span className="preference-hint">Number of concurrent requests</span>
            </div>

            <div className="preference-item">
              <label htmlFor="smartScrollIterations">Smart Scroll Iterations</label>
              <input
                id="smartScrollIterations"
                type="number"
                min="1"
                max="20"
                value={preferences.scraping.smartScrollIterations}
                onChange={(e) => handleScrapingChange('smartScrollIterations', parseInt(e.target.value))}
              />
              <span className="preference-hint">Number of scroll iterations for dynamic content</span>
            </div>

            <div className="preference-item">
              <label htmlFor="maxRetries">Max Retries</label>
              <input
                id="maxRetries"
                type="number"
                min="0"
                max="10"
                value={preferences.scraping.maxRetries}
                onChange={(e) => handleScrapingChange('maxRetries', parseInt(e.target.value))}
              />
              <span className="preference-hint">Maximum retry attempts for failed requests</span>
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="headlessBrowser">Headless Browser</label>
                <span className="preference-hint">Run browser in headless mode</span>
              </div>
              <input
                id="headlessBrowser"
                type="checkbox"
                checked={preferences.scraping.headlessBrowser}
                onChange={(e) => handleScrapingChange('headlessBrowser', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="downloadFileAssets">Download File Assets</label>
                <span className="preference-hint">Download images, CSS, and JS files</span>
              </div>
              <input
                id="downloadFileAssets"
                type="checkbox"
                checked={preferences.scraping.downloadFileAssets}
                onChange={(e) => handleScrapingChange('downloadFileAssets', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="useProxies">Use Proxies</label>
                <span className="preference-hint">Enable proxy rotation</span>
              </div>
              <input
                id="useProxies"
                type="checkbox"
                checked={preferences.scraping.useProxies}
                onChange={(e) => handleScrapingChange('useProxies', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="useAuthentication">Use Authentication</label>
                <span className="preference-hint">Enable authentication for protected sites</span>
              </div>
              <input
                id="useAuthentication"
                type="checkbox"
                checked={preferences.scraping.useAuthentication}
                onChange={(e) => handleScrapingChange('useAuthentication', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="useFingerprinting">Use Fingerprinting</label>
                <span className="preference-hint">Randomize browser fingerprint</span>
              </div>
              <input
                id="useFingerprinting"
                type="checkbox"
                checked={preferences.scraping.useFingerprinting}
                onChange={(e) => handleScrapingChange('useFingerprinting', e.target.checked)}
              />
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="preferences-section" aria-labelledby="notifications-heading">
          <div className="section-header">
            <Bell size={24} weight="duotone" aria-hidden="true" />
            <h2 id="notifications-heading">Notification Settings</h2>
          </div>
          
          <div className="preferences-grid">
            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="notificationsEnabled">Enable Notifications</label>
                <span className="preference-hint">Master toggle for all notifications</span>
              </div>
              <input
                id="notificationsEnabled"
                type="checkbox"
                checked={preferences.notifications.enabled}
                onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="scrapingComplete">Scraping Complete</label>
                <span className="preference-hint">Notify when scraping finishes</span>
              </div>
              <input
                id="scrapingComplete"
                type="checkbox"
                checked={preferences.notifications.scrapingComplete}
                onChange={(e) => handleNotificationChange('scrapingComplete', e.target.checked)}
                disabled={!preferences.notifications.enabled}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="scrapingError">Scraping Error</label>
                <span className="preference-hint">Notify on scraping errors</span>
              </div>
              <input
                id="scrapingError"
                type="checkbox"
                checked={preferences.notifications.scrapingError}
                onChange={(e) => handleNotificationChange('scrapingError', e.target.checked)}
                disabled={!preferences.notifications.enabled}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="largeFileDownload">Large File Download</label>
                <span className="preference-hint">Notify when downloading large files</span>
              </div>
              <input
                id="largeFileDownload"
                type="checkbox"
                checked={preferences.notifications.largeFileDownload}
                onChange={(e) => handleNotificationChange('largeFileDownload', e.target.checked)}
                disabled={!preferences.notifications.enabled}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="proxyFailure">Proxy Failure</label>
                <span className="preference-hint">Notify when proxies fail</span>
              </div>
              <input
                id="proxyFailure"
                type="checkbox"
                checked={preferences.notifications.proxyFailure}
                onChange={(e) => handleNotificationChange('proxyFailure', e.target.checked)}
                disabled={!preferences.notifications.enabled}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="browserNotifications">Browser Notifications</label>
                <span className="preference-hint">Show native browser notifications</span>
              </div>
              <input
                id="browserNotifications"
                type="checkbox"
                checked={preferences.notifications.browserNotifications}
                onChange={(e) => handleNotificationChange('browserNotifications', e.target.checked)}
                disabled={!preferences.notifications.enabled}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="soundEnabled">Sound Enabled</label>
                <span className="preference-hint">Play sound with notifications</span>
              </div>
              <input
                id="soundEnabled"
                type="checkbox"
                checked={preferences.notifications.soundEnabled}
                onChange={(e) => handleNotificationChange('soundEnabled', e.target.checked)}
                disabled={!preferences.notifications.enabled}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="emailNotifications">Email Notifications</label>
                <span className="preference-hint">Send notifications via email</span>
              </div>
              <input
                id="emailNotifications"
                type="checkbox"
                checked={preferences.notifications.emailNotifications}
                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                disabled={!preferences.notifications.enabled}
              />
            </div>

            {preferences.notifications.emailNotifications && (
              <div className="preference-item preference-full-width">
                <label htmlFor="emailAddress">Email Address</label>
                <input
                  id="emailAddress"
                  type="email"
                  placeholder="your@email.com"
                  value={preferences.notifications.emailAddress}
                  onChange={(e) => handleNotificationChange('emailAddress', e.target.value)}
                />
                <span className="preference-hint">Email address for notifications</span>
              </div>
            )}
          </div>
        </section>

        {/* Display Preferences */}
        <section className="preferences-section" aria-labelledby="display-heading">
          <div className="section-header">
            <Eye size={24} weight="duotone" aria-hidden="true" />
            <h2 id="display-heading">Display Preferences</h2>
          </div>
          
          <div className="preferences-grid">
            <div className="preference-item">
              <label htmlFor="itemsPerPage">Items Per Page</label>
              <select
                id="itemsPerPage"
                value={preferences.display.itemsPerPage}
                onChange={(e) => handleDisplayChange('itemsPerPage', parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="preference-hint">Number of items to display per page</span>
            </div>

            <div className="preference-item">
              <label htmlFor="dateFormat">Date Format</label>
              <select
                id="dateFormat"
                value={preferences.display.dateFormat}
                onChange={(e) => handleDisplayChange('dateFormat', e.target.value)}
              >
                <option value="relative">Relative (2 hours ago)</option>
                <option value="absolute">Absolute (Jan 31, 2026)</option>
              </select>
              <span className="preference-hint">How to display dates</span>
            </div>

            <div className="preference-item">
              <label htmlFor="timeFormat">Time Format</label>
              <select
                id="timeFormat"
                value={preferences.display.timeFormat}
                onChange={(e) => handleDisplayChange('timeFormat', e.target.value)}
              >
                <option value="12h">12-hour (3:45 PM)</option>
                <option value="24h">24-hour (15:45)</option>
              </select>
              <span className="preference-hint">Time display format</span>
            </div>

            <div className="preference-item">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={preferences.display.language}
                onChange={(e) => handleDisplayChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
              <span className="preference-hint">Interface language</span>
            </div>

            <div className="preference-item">
              <label htmlFor="refreshInterval">Auto Refresh Interval (ms)</label>
              <input
                id="refreshInterval"
                type="number"
                min="1000"
                max="60000"
                step="1000"
                value={preferences.display.refreshInterval}
                onChange={(e) => handleDisplayChange('refreshInterval', parseInt(e.target.value))}
                disabled={!preferences.display.autoRefresh}
              />
              <span className="preference-hint">How often to refresh data automatically</span>
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="showThumbnails">Show Thumbnails</label>
                <span className="preference-hint">Display image thumbnails</span>
              </div>
              <input
                id="showThumbnails"
                type="checkbox"
                checked={preferences.display.showThumbnails}
                onChange={(e) => handleDisplayChange('showThumbnails', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="compactView">Compact View</label>
                <span className="preference-hint">Use compact layout</span>
              </div>
              <input
                id="compactView"
                type="checkbox"
                checked={preferences.display.compactView}
                onChange={(e) => handleDisplayChange('compactView', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="showFileSize">Show File Size</label>
                <span className="preference-hint">Display file sizes</span>
              </div>
              <input
                id="showFileSize"
                type="checkbox"
                checked={preferences.display.showFileSize}
                onChange={(e) => handleDisplayChange('showFileSize', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="showTimestamps">Show Timestamps</label>
                <span className="preference-hint">Display timestamps</span>
              </div>
              <input
                id="showTimestamps"
                type="checkbox"
                checked={preferences.display.showTimestamps}
                onChange={(e) => handleDisplayChange('showTimestamps', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="animationsEnabled">Animations Enabled</label>
                <span className="preference-hint">Enable UI animations</span>
              </div>
              <input
                id="animationsEnabled"
                type="checkbox"
                checked={preferences.display.animationsEnabled}
                onChange={(e) => handleDisplayChange('animationsEnabled', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="autoRefresh">Auto Refresh</label>
                <span className="preference-hint">Automatically refresh data</span>
              </div>
              <input
                id="autoRefresh"
                type="checkbox"
                checked={preferences.display.autoRefresh}
                onChange={(e) => handleDisplayChange('autoRefresh', e.target.checked)}
              />
            </div>
          </div>
        </section>

        {/* Privacy & Data */}
        <section className="preferences-section" aria-labelledby="privacy-heading">
          <div className="section-header">
            <ShieldCheck size={24} weight="duotone" aria-hidden="true" />
            <h2 id="privacy-heading">Privacy & Data</h2>
          </div>
          
          <div className="preferences-grid">
            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="saveHistory">Save History</label>
                <span className="preference-hint">Keep scraping history</span>
              </div>
              <input
                id="saveHistory"
                type="checkbox"
                checked={preferences.privacy.saveHistory}
                onChange={(e) => handlePrivacyChange('saveHistory', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="saveCookies">Save Cookies</label>
                <span className="preference-hint">Store cookies between sessions</span>
              </div>
              <input
                id="saveCookies"
                type="checkbox"
                checked={preferences.privacy.saveCookies}
                onChange={(e) => handlePrivacyChange('saveCookies', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="clearOnExit">Clear on Exit</label>
                <span className="preference-hint">Clear data when closing app</span>
              </div>
              <input
                id="clearOnExit"
                type="checkbox"
                checked={preferences.privacy.clearOnExit}
                onChange={(e) => handlePrivacyChange('clearOnExit', e.target.checked)}
              />
            </div>

            <div className="preference-item preference-toggle">
              <div className="toggle-content">
                <label htmlFor="analyticsEnabled">Analytics Enabled</label>
                <span className="preference-hint">Help improve the app with usage data</span>
              </div>
              <input
                id="analyticsEnabled"
                type="checkbox"
                checked={preferences.privacy.analyticsEnabled}
                onChange={(e) => handlePrivacyChange('analyticsEnabled', e.target.checked)}
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="preferences-actions">
          <Button
            variant="primary"
            icon={DownloadSimple}
            onClick={handleExport}
          >
            Export Preferences
          </Button>
          
          <Button
            variant="secondary"
            icon={UploadSimple}
            onClick={() => setShowImportModal(true)}
          >
            Import Preferences
          </Button>
          
          <Button
            variant="danger"
            icon={ArrowCounterClockwise}
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
        </section>
      </main>

      <Footer />

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Import Preferences</h3>
            <p>Paste your exported preferences JSON below:</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"preferences": {...}}'
              rows={10}
            />
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleImport}>
                Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Preferences
