import { Loader2 } from 'lucide-react'
import '../styles/LoadingState.css'

/**
 * LoadingState - Contextual loading component with specific messages
 * @param {string} type - Type of loading operation
 * @param {string} message - Custom loading message (optional)
 * @param {string} size - Size variant: 'small', 'medium', 'large'
 * @param {boolean} fullScreen - Show as full-screen overlay
 * @param {string} className - Additional CSS classes
 */
function LoadingState({ 
  type = 'default',
  message,
  size = 'medium',
  fullScreen = false,
  className = ''
}) {
  // Contextual loading messages based on operation type
  const loadingMessages = {
    // Database operations
    'fetching-stats': 'Loading database statistics...',
    'fetching-pages': 'Retrieving scraped pages...',
    'fetching-files': 'Loading file assets...',
    'fetching-analytics': 'Analyzing data patterns...',
    'fetching-timeline': 'Building activity timeline...',
    'fetching-domains': 'Gathering domain statistics...',
    'exporting-data': 'Preparing data export...',
    'deleting-pages': 'Removing selected pages...',
    'filtering-data': 'Applying filters...',
    
    // History operations
    'fetching-sessions': 'Loading scraping sessions...',
    'fetching-session-details': 'Retrieving session information...',
    'deleting-session': 'Deleting session data...',
    'exporting-session': 'Exporting session...',
    'comparing-sessions': 'Comparing session data...',
    
    // Config operations
    'loading-config': 'Loading configuration...',
    'saving-config': 'Saving configuration changes...',
    'applying-preset': 'Applying configuration preset...',
    'importing-config': 'Importing configuration...',
    'resetting-config': 'Resetting to default values...',
    
    // Scraping operations
    'starting-scrape': 'Initializing scraper...',
    'scraping-page': 'Scraping page content...',
    'analyzing-page': 'Analyzing page structure...',
    'downloading-files': 'Downloading file assets...',
    'testing-session': 'Testing authentication session...',
    
    // Selector Finder operations
    'analyzing-login': 'Analyzing login page...',
    'finding-selectors': 'Finding CSS selectors...',
    'testing-selector': 'Testing selector...',
    'generating-selectors': 'Generating robust selectors...',
    'searching-elements': 'Searching for elements...',
    
    // Proxy operations
    'loading-proxies': 'Loading proxy list...',
    'testing-proxies': 'Testing proxy connections...',
    'importing-proxies': 'Importing proxy list...',
    'validating-proxies': 'Validating proxy format...',
    
    // Authentication operations
    'logging-in': 'Authenticating...',
    'testing-login': 'Testing login credentials...',
    'verifying-session': 'Verifying session...',
    
    // Search operations
    'searching-content': 'Searching content...',
    'searching-files': 'Searching files...',
    'filtering-results': 'Filtering results...',
    
    // Default
    'default': 'Loading...',
    'processing': 'Processing...',
    'saving': 'Saving...',
    'deleting': 'Deleting...',
    'uploading': 'Uploading...',
    'downloading': 'Downloading...'
  }

  const displayMessage = message || loadingMessages[type] || loadingMessages.default

  if (fullScreen) {
    return (
      <div className={`loading-overlay ${className}`}>
        <div className="loading-content">
          <Loader2 className={`loading-spinner loading-spinner-${size}`} />
          <p className="loading-message">{displayMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`loading-state loading-state-${size} ${className}`}>
      <Loader2 className={`loading-spinner loading-spinner-${size}`} />
      <p className="loading-message">{displayMessage}</p>
    </div>
  )
}

export default LoadingState
