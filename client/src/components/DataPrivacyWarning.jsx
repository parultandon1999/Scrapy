import { useState, useEffect } from 'react'
import Button from './mui/buttons/Button'
import { AlertTriangle, X, Shield, Lock, Eye } from 'lucide-react'
import '../styles/DataPrivacyWarning.css'

/**
 * DataPrivacyWarning - Warning banner about data storage and encryption
 * Shows on first visit and can be dismissed
 */
function DataPrivacyWarning() {
  const [isDismissed, setIsDismissed] = useState(false)

  // Calculate initial visibility state
  const getInitialVisibility = () => {
    const dismissed = localStorage.getItem('privacy_warning_dismissed')
    const dismissedDate = localStorage.getItem('privacy_warning_dismissed_date')
    
    if (!dismissed) {
      return true
    } else if (dismissedDate) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24)
      return daysSinceDismissed > 30
    }
    return false
  }

  const [isVisible, setIsVisible] = useState(getInitialVisibility)

  useEffect(() => {
    // Effect only for side effects, not for setting initial state
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem('privacy_warning_dismissed', 'true')
      localStorage.setItem('privacy_warning_dismissed_date', Date.now().toString())
    }, 300)
  }

  const handleLearnMore = () => {
    window.location.href = '/privacy-policy'
  }

  if (!isVisible) return null

  return (
    <div 
      className={`data-privacy-warning ${isDismissed ? 'dismissing' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="privacy-warning-container">
        <div className="privacy-warning-icon">
          <AlertTriangle size={24} />
        </div>
        
        <div className="privacy-warning-content">
          <h3 className="privacy-warning-title">
            <Shield size={18} />
            Important: Data Storage & Privacy Notice
          </h3>
          <p className="privacy-warning-message">
            This application stores scraped data locally on your device. 
            <strong> Data is not encrypted at rest</strong> and may be accessible to others with access to your device. 
            Avoid scraping sensitive or personal information.
          </p>
          
          <div className="privacy-warning-details">
            <div className="privacy-detail-item">
              <Lock size={16} />
              <span>Data stored unencrypted in browser and local database</span>
            </div>
            <div className="privacy-detail-item">
              <Eye size={16} />
              <span>Scraped content visible to anyone with device access</span>
            </div>
            <div className="privacy-detail-item">
              <AlertTriangle size={16} />
              <span>Do not scrape passwords, credit cards, or personal data</span>
            </div>
          </div>
        </div>

        <div className="privacy-warning-actions">
          <Button
            variant="ghost"
            size="small"
            onClick={handleLearnMore}
          >
            Learn More
          </Button>
          <Button
            variant="primary"
            size="small"
            icon={X}
            onClick={handleDismiss}
          >
            I Understand
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DataPrivacyWarning
