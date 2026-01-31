import '../styles/SkeletonLoader.css'

// Generic skeleton components
export function SkeletonBox({ width = '100%', height = '20px', className = '' }) {
  return (
    <div 
      className={`skeleton-box ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox 
          key={i} 
          height="16px" 
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}

// Database table skeleton
export function DatabaseTableSkeleton() {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox key={i} height="40px" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: 5 }).map((_, j) => (
            <SkeletonBox key={j} height="50px" />
          ))}
        </div>
      ))}
    </div>
  )
}

// History card skeleton
export function HistoryCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <SkeletonBox width="60%" height="24px" />
        <SkeletonBox width="100px" height="20px" />
      </div>
      <div className="skeleton-card-body">
        <SkeletonText lines={2} />
        <div className="skeleton-card-stats">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBox key={i} width="80px" height="32px" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Config section skeleton
export function ConfigSectionSkeleton() {
  return (
    <div className="skeleton-config-section">
      <SkeletonBox width="200px" height="28px" className="skeleton-section-title" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-config-item">
          <div className="skeleton-config-label">
            <SkeletonBox width="150px" height="18px" />
            <SkeletonBox width="20px" height="20px" />
          </div>
          <SkeletonBox width="100%" height="40px" />
        </div>
      ))}
    </div>
  )
}

// Scraping progress skeleton
export function ScrapingProgressSkeleton() {
  return (
    <div className="skeleton-progress">
      <SkeletonBox width="100%" height="8px" className="skeleton-progress-bar" />
      <div className="skeleton-progress-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-stat-card">
            <SkeletonBox width="60px" height="36px" />
            <SkeletonBox width="80px" height="16px" />
          </div>
        ))}
      </div>
      <div className="skeleton-progress-logs">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBox key={i} height="24px" width={`${Math.random() * 30 + 70}%`} />
        ))}
      </div>
    </div>
  )
}

// Selector finder results skeleton
export function SelectorResultsSkeleton() {
  return (
    <div className="skeleton-selector-results">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-selector-item">
          <div className="skeleton-selector-header">
            <SkeletonBox width="70%" height="20px" />
            <SkeletonBox width="80px" height="24px" />
          </div>
          <SkeletonBox width="100%" height="40px" />
          <div className="skeleton-selector-actions">
            <SkeletonBox width="100px" height="36px" />
            <SkeletonBox width="100px" height="36px" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Proxy test results skeleton
export function ProxyResultsSkeleton() {
  return (
    <div className="skeleton-proxy-results">
      <div className="skeleton-proxy-summary">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-summary-item">
            <SkeletonBox width="100%" height="60px" />
          </div>
        ))}
      </div>
      <div className="skeleton-proxy-list">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton-proxy-item">
            <SkeletonBox width="150px" height="20px" />
            <SkeletonBox width="100px" height="20px" />
            <SkeletonBox width="80px" height="28px" />
          </div>
        ))}
      </div>
    </div>
  )
}
