import { useState } from 'react'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'

function DataPrivacyWarning() {
  const getInitialVisibility = () => {
    if (typeof window === 'undefined') return false

    const dismissed = localStorage.getItem('privacy_warning_dismissed')
    const dismissedDate = localStorage.getItem('privacy_warning_dismissed_date')
    
    if (!dismissed) {
      return true
    } else if (dismissedDate) {
      // Show again after 30 days
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24)
      return daysSinceDismissed > 30
    }
    return false
  }

  const [isOpen, setIsOpen] = useState(() => getInitialVisibility())

  const handleDismiss = () => {
    setIsOpen(false)
    localStorage.setItem('privacy_warning_dismissed', 'true')
    localStorage.setItem('privacy_warning_dismissed_date', Date.now().toString())
  }

  const handleLearnMore = () => {
    window.location.href = '/privacy-policy'
  }

  if (!isOpen) return null

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="text-amber-500">
            <Icon name="Warning" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Data Storage & Privacy Notice</h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-100 rounded-md p-3 mb-4">
            <p className="text-sm font-semibold text-amber-900">
              Important Security Information
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            This application stores scraped data locally on your device. 
            <strong className="text-amber-600 font-bold"> Data is not encrypted at rest</strong> and may be accessible to others with access to your device.
          </p>

          <p className="text-sm font-bold text-gray-900 mb-2">
            Security Considerations:
          </p>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="min-w-[20px] pt-0.5 text-amber-500">
                <Icon name="Lock" size={18} />
              </div>
              <span className="text-sm text-gray-600">Data stored unencrypted in browser and local database</span>
            </li>
            
            <li className="flex items-start gap-3">
              <div className="min-w-[20px] pt-0.5 text-amber-500">
                <Icon name="Visibility" size={18} />
              </div>
              <span className="text-sm text-gray-600">Scraped content visible to anyone with device access</span>
            </li>
            
            <li className="flex items-start gap-3">
              <div className="min-w-[20px] pt-0.5 text-amber-500">
                <Icon name="Warning" size={18} />
              </div>
              <span className="text-sm text-gray-600">Do not scrape passwords, credit cards, or personal data</span>
            </li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
          <Button variant="outline" onClick={handleLearnMore}>
            Learn More
          </Button>
          <Button variant="primary" onClick={handleDismiss}>
            <Icon name="Check" size="small" /> I Understand
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DataPrivacyWarning