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
    <form className="search-form" onSubmit={handleSubmit}>
      <div 
        className="search-box"
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <input
          type="url"
          className={getInputClassName()}
          placeholder={placeholder || "Enter URL to scrape..."}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          required
          disabled={disabled}
        />
        {error && <span className="url-error-message">{error}</span>}
        {valid && !error && <span className="url-valid-indicator">✓</span>}
        
        {/* Recent URLs Dropdown */}
        {shouldShowDropdown && (
          <div className="recent-urls-dropdown">
            <div className="dropdown-header">
              <span className="dropdown-title">Recent URLs</span>
              {loadingRecent && <span className="dropdown-loading">Loading...</span>}
            </div>
            <ul className="recent-urls-list">
              {recentUrls.map((item, index) => (
                <li 
                  key={index} 
                  className="recent-url-item"
                  onClick={() => handleSelectUrl(item.url)}
                >
                  <div className="recent-url-main">
                    <span className="recent-url-icon">🌐</span>
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
