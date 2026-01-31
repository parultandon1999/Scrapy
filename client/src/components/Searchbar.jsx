import { useState } from 'react'
import '../styles/SearchBar.css'

function SearchBar({ value, onChange, placeholder, disabled, onSubmit, error, valid, recentUrls = [], onSelectRecent, loadingRecent }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit()
    }
  }

  const getInputClassName = () => {
    let className = 'search-input'
    if (value && error) {
      className += ' error'
    } else if (value && valid) {
      className += ' valid'
    }
    return className
  }

  const handleSelectUrl = (url) => {
    if (onSelectRecent) {
      onSelectRecent(url)
    }
    setShowDropdown(false)
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const shouldShowDropdown = (isFocused || showDropdown) && recentUrls.length > 0 && !value

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <div 
        className="search-box"
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <label htmlFor="url-input" className="sr-only">
          Enter URL to scrape
        </label>
        <input
          id="url-input"
          type="url"
          className={getInputClassName()}
          placeholder={placeholder || "Enter URL to scrape..."}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          required
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'url-error' : valid ? 'url-valid' : undefined}
          aria-autocomplete="list"
          aria-controls={shouldShowDropdown ? 'recent-urls-list' : undefined}
          aria-expanded={shouldShowDropdown}
        />
        {error && (
          <span id="url-error" className="url-error-message" role="alert">
            {error}
          </span>
        )}
        {valid && !error && (
          <span id="url-valid" className="url-valid-indicator" aria-label="Valid URL">
            ✓
          </span>
        )}
        
        {/* Recent URLs Dropdown */}
        {shouldShowDropdown && (
          <div 
            id="recent-urls-list"
            className="recent-urls-dropdown"
            role="listbox"
            aria-label="Recent URLs"
          >
            <div className="dropdown-header">
              <span className="dropdown-title">Recent URLs</span>
              {loadingRecent && (
                <span className="dropdown-loading" role="status" aria-live="polite">
                  Loading...
                </span>
              )}
            </div>
            <ul className="recent-urls-list">
              {recentUrls.map((item, index) => (
                <li 
                  key={index} 
                  className="recent-url-item"
                  onClick={() => handleSelectUrl(item.url)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectUrl(item.url)
                    }
                  }}
                  aria-label={`${item.url}, ${item.pageCount} pages, scraped ${formatDate(item.lastScraped)}`}
                >
                  <div className="recent-url-main">
                    <span className="recent-url-icon" aria-hidden="true">🌐</span>
                    <span className="recent-url-text">{item.url}</span>
                  </div>
                  <div className="recent-url-meta">
                    <span className="recent-url-pages">{item.pageCount} pages</span>
                    <span className="recent-url-time">{formatDate(item.lastScraped)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </form>
  )
}

export default SearchBar
