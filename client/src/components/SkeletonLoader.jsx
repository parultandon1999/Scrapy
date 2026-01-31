import '../styles/SkeletonLoader.css'

// ===== GENERIC SKELETON COMPONENTS =====

export function SkeletonBox({ width = '100%', height = '20px', className = '', borderRadius = '6px' }) {
  return (
    <div 
      className={`skeleton-box ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCircle({ size = '40px', className = '' }) {
  return (
    <div 
      className={`skeleton-box skeleton-circle ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, className = '', gap = '10px' }) {
  return (
    <div className={`skeleton-text ${className}`} style={{ gap }}>
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

export function SkeletonButton({ width = '120px', height = '40px', className = '' }) {
  return (
    <SkeletonBox 
      width={width} 
      height={height} 
      className={`skeleton-button ${className}`}
      borderRadius="8px"
    />
  )
}

export function SkeletonInput({ width = '100%', height = '40px', className = '' }) {
  return (
    <SkeletonBox 
      width={width} 
      height={height} 
      className={`skeleton-input ${className}`}
      borderRadius="6px"
    />
  )
}

export function SkeletonBadge({ width = '60px', height = '24px', className = '' }) {
  return (
    <SkeletonBox 
      width={width} 
      height={height} 
      className={`skeleton-badge ${className}`}
      borderRadius="12px"
    />
  )
}

export function SkeletonAvatar({ size = '40px', className = '' }) {
  return <SkeletonCircle size={size} className={`skeleton-avatar ${className}`} />
}

export function SkeletonIcon({ size = '24px', className = '' }) {
  return <SkeletonCircle size={size} className={`skeleton-icon ${className}`} />
}

// ===== DATABASE SKELETONS =====

export function DatabaseTableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <div className="skeleton-table" role="status" aria-label="Loading table data">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBox key={i} height="40px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, j) => (
            <SkeletonBox key={j} height="50px" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function DatabaseDashboardSkeleton() {
  return (
    <div className="skeleton-dashboard" role="status" aria-label="Loading dashboard">
      {/* Quick Stats */}
      <div className="skeleton-quick-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-stat-card-large">
            <SkeletonIcon size="32px" />
            <div className="skeleton-stat-content">
              <SkeletonBox width="120px" height="16px" />
              <SkeletonBox width="80px" height="32px" />
              <SkeletonBox width="100px" height="14px" />
            </div>
          </div>
        ))}
      </div>

      {/* Compact Stats Grid */}
      <div className="skeleton-stats-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-stat-compact">
            <SkeletonIcon size="20px" />
            <div>
              <SkeletonBox width="60px" height="14px" />
              <SkeletonBox width="40px" height="20px" />
            </div>
          </div>
        ))}
      </div>

      {/* Widgets */}
      <div className="skeleton-widgets">
        <div className="skeleton-widget">
          <div className="skeleton-widget-header">
            <SkeletonBox width="150px" height="20px" />
            <SkeletonBox width="80px" height="16px" />
          </div>
          <div className="skeleton-widget-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-widget-item">
                <SkeletonBadge width="50px" />
                <SkeletonBox width="100%" height="8px" />
                <SkeletonBox width="40px" height="16px" />
              </div>
            ))}
          </div>
        </div>
        <div className="skeleton-widget">
          <div className="skeleton-widget-header">
            <SkeletonBox width="150px" height="20px" />
            <SkeletonBox width="80px" height="16px" />
          </div>
          <div className="skeleton-widget-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-widget-item">
                <SkeletonBox width="80%" height="16px" />
                <SkeletonBox width="60px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DatabasePagesSkeleton({ count = 10 }) {
  return (
    <div className="skeleton-pages-list" role="status" aria-label="Loading pages">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-page-item">
          <SkeletonBox width="24px" height="24px" /> {/* Checkbox */}
          <div className="skeleton-page-content">
            <SkeletonBox width="70%" height="20px" />
            <SkeletonBox width="90%" height="16px" />
            <div className="skeleton-page-meta">
              <SkeletonBadge width="40px" />
              <SkeletonBox width="120px" height="14px" />
            </div>
          </div>
          <div className="skeleton-page-actions">
            <SkeletonButton width="80px" height="32px" />
            <SkeletonButton width="80px" height="32px" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DatabaseFilesSkeleton({ count = 10 }) {
  return (
    <div className="skeleton-files-list" role="status" aria-label="Loading files">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-file-item">
          <SkeletonIcon size="32px" />
          <div className="skeleton-file-content">
            <SkeletonBox width="60%" height="18px" />
            <SkeletonBox width="40%" height="14px" />
          </div>
          <SkeletonBadge width="70px" />
          <SkeletonBox width="80px" height="16px" />
        </div>
      ))}
    </div>
  )
}

export function DatabaseAnalyticsSkeleton() {
  return (
    <div className="skeleton-analytics" role="status" aria-label="Loading analytics">
      <div className="skeleton-analytics-header">
        <SkeletonBox width="200px" height="28px" />
      </div>
      <div className="skeleton-charts-grid">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton-chart-card">
            <SkeletonBox width="150px" height="20px" />
            <SkeletonBox width="100%" height="300px" borderRadius="12px" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== HISTORY SKELETONS =====

export function HistoryCardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-card-header">
            <div className="skeleton-card-title-section">
              <SkeletonBox width="24px" height="24px" /> {/* Checkbox */}
              <SkeletonIcon size="16px" />
              <SkeletonBox width="60%" height="24px" />
              <SkeletonBadge width="80px" />
            </div>
            <div className="skeleton-card-actions">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonButton key={i} width="32px" height="32px" />
              ))}
            </div>
          </div>
          <SkeletonBox width="90%" height="16px" />
          <div className="skeleton-card-stats">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-stat-item">
                <SkeletonIcon size="12px" />
                <SkeletonBox width="60px" height="16px" />
              </div>
            ))}
          </div>
          <div className="skeleton-card-meta">
            <SkeletonBox width="120px" height="14px" />
            <SkeletonBox width="80px" height="14px" />
          </div>
        </div>
      ))}
    </>
  )
}

export function HistorySessionsSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-sessions-grid" role="status" aria-label="Loading sessions">
      <HistoryCardSkeleton count={count} />
    </div>
  )
}

export function HistoryStatisticsSkeleton() {
  return (
    <div className="skeleton-statistics" role="status" aria-label="Loading statistics">
      <SkeletonBox width="250px" height="32px" />
      <div className="skeleton-stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-stat-compact">
            <SkeletonIcon size="20px" />
            <div>
              <SkeletonBox width="80px" height="14px" />
              <SkeletonBox width="60px" height="24px" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton-analytics-card">
        <SkeletonBox width="180px" height="20px" />
        <div className="skeleton-detail-items">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton-detail-row">
              <SkeletonBox width="100px" height="16px" />
              <SkeletonBox width="120px" height="16px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HistoryTimelineSkeleton() {
  return (
    <div className="skeleton-timeline" role="status" aria-label="Loading timeline">
      <SkeletonBox width="200px" height="28px" />
      <div className="skeleton-timeline-items">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton-timeline-item">
            <SkeletonBox width="120px" height="16px" />
            <SkeletonBox width="100%" height="40px" borderRadius="8px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HistorySessionDetailsSkeleton() {
  return (
    <div className="skeleton-session-details" role="status" aria-label="Loading session details">
      <div className="skeleton-details-header">
        <SkeletonBox width="250px" height="32px" />
        <SkeletonButton width="100px" height="36px" />
      </div>
      <div className="skeleton-details-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-detail-section">
            <SkeletonBox width="150px" height="20px" />
            <div className="skeleton-detail-items">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="skeleton-detail-row">
                  <SkeletonBox width="120px" height="16px" />
                  <SkeletonBox width="100px" height="16px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== CONFIG SKELETONS =====

export function ConfigSectionSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-config-section">
          <SkeletonBox width="200px" height="28px" className="skeleton-section-title" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-config-item">
              <div className="skeleton-config-label">
                <SkeletonBox width="150px" height="18px" />
                <SkeletonIcon size="20px" />
              </div>
              <SkeletonInput />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

export function ConfigPageSkeleton() {
  return (
    <div className="skeleton-config-page" role="status" aria-label="Loading configuration">
      <div className="skeleton-config-header">
        <SkeletonBox width="180px" height="32px" />
        <div className="skeleton-config-actions">
          <SkeletonButton width="120px" height="40px" />
          <SkeletonButton width="100px" height="40px" />
        </div>
      </div>
      <ConfigSectionSkeleton count={4} />
    </div>
  )
}

// ===== SCRAPING PROGRESS SKELETONS =====

export function ScrapingProgressSkeleton() {
  const logWidths = ['85%', '92%', '78%', '88%', '95%', '82%']
  
  return (
    <div className="skeleton-progress" role="status" aria-label="Loading scraping progress">
      <SkeletonBox width="100%" height="8px" className="skeleton-progress-bar" borderRadius="12px" />
      <div className="skeleton-progress-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-stat-card">
            <SkeletonBox width="60px" height="36px" />
            <SkeletonBox width="80px" height="16px" />
          </div>
        ))}
      </div>
      <div className="skeleton-progress-logs">
        {logWidths.map((width, i) => (
          <SkeletonBox key={i} height="24px" width={width} />
        ))}
      </div>
    </div>
  )
}

export function ScrapingStatusSkeleton() {
  return (
    <div className="skeleton-scraping-status" role="status" aria-label="Loading status">
      <div className="skeleton-status-header">
        <SkeletonBox width="200px" height="28px" />
        <div className="skeleton-status-actions">
          <SkeletonButton width="100px" height="40px" />
          <SkeletonButton width="100px" height="40px" />
        </div>
      </div>
      <div className="skeleton-status-cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-status-card">
            <SkeletonIcon size="24px" />
            <SkeletonBox width="100px" height="32px" />
            <SkeletonBox width="80px" height="14px" />
          </div>
        ))}
      </div>
      <div className="skeleton-recent-items">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-recent-item">
            <SkeletonBox width="80%" height="18px" />
            <SkeletonBox width="60%" height="14px" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== SELECTOR FINDER SKELETONS =====

export function SelectorResultsSkeleton({ count = 5 }) {
  return (
    <div className="skeleton-selector-results" role="status" aria-label="Loading selector results">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-selector-item">
          <div className="skeleton-selector-header">
            <SkeletonBox width="70%" height="20px" />
            <SkeletonBadge width="80px" height="24px" />
          </div>
          <SkeletonBox width="100%" height="40px" />
          <div className="skeleton-selector-meta">
            <SkeletonBox width="120px" height="16px" />
            <SkeletonBox width="100px" height="16px" />
          </div>
          <div className="skeleton-selector-actions">
            <SkeletonButton width="100px" height="36px" />
            <SkeletonButton width="100px" height="36px" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SelectorAnalysisSkeleton() {
  return (
    <div className="skeleton-selector-analysis" role="status" aria-label="Analyzing page">
      <div className="skeleton-analysis-header">
        <SkeletonBox width="200px" height="24px" />
      </div>
      <div className="skeleton-analysis-sections">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-analysis-section">
            <SkeletonBox width="150px" height="20px" />
            <div className="skeleton-analysis-items">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="skeleton-analysis-item">
                  <SkeletonBox width="120px" height="16px" />
                  <SkeletonBox width="100%" height="36px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== PROXY TESTER SKELETONS =====

export function ProxyResultsSkeleton({ count = 10 }) {
  return (
    <div className="skeleton-proxy-results" role="status" aria-label="Loading proxy results">
      <div className="skeleton-proxy-summary">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-summary-item">
            <SkeletonIcon size="32px" />
            <SkeletonBox width="100px" height="32px" />
            <SkeletonBox width="80px" height="16px" />
          </div>
        ))}
      </div>
      <div className="skeleton-proxy-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-proxy-item">
            <SkeletonBox width="150px" height="20px" />
            <SkeletonBox width="100px" height="20px" />
            <SkeletonBadge width="80px" height="28px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProxyListSkeleton({ count = 5 }) {
  return (
    <div className="skeleton-proxy-list-simple" role="status" aria-label="Loading proxies">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-proxy-list-item">
          <SkeletonBox width="200px" height="18px" />
          <SkeletonButton width="80px" height="32px" />
        </div>
      ))}
    </div>
  )
}

// ===== PREFERENCES SKELETONS =====

export function PreferencesSkeleton() {
  return (
    <div className="skeleton-preferences" role="status" aria-label="Loading preferences">
      <SkeletonBox width="180px" height="32px" />
      <div className="skeleton-preferences-sections">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-preferences-section">
            <SkeletonBox width="150px" height="24px" />
            <div className="skeleton-preferences-items">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="skeleton-preference-item">
                  <div>
                    <SkeletonBox width="140px" height="18px" />
                    <SkeletonBox width="200px" height="14px" />
                  </div>
                  <SkeletonBox width="50px" height="24px" borderRadius="12px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== SEARCH RESULTS SKELETONS =====

export function SearchResultsSkeleton({ count = 10 }) {
  return (
    <div className="skeleton-search-results" role="status" aria-label="Searching">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-search-item">
          <SkeletonBox width="80%" height="20px" />
          <SkeletonBox width="100%" height="16px" />
          <div className="skeleton-search-meta">
            <SkeletonBadge width="60px" />
            <SkeletonBox width="120px" height="14px" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ===== FORM SKELETONS =====

export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="skeleton-form" role="status" aria-label="Loading form">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="skeleton-form-field">
          <SkeletonBox width="120px" height="18px" />
          <SkeletonInput />
        </div>
      ))}
      <div className="skeleton-form-actions">
        <SkeletonButton width="100px" height="40px" />
        <SkeletonButton width="100px" height="40px" />
      </div>
    </div>
  )
}

// ===== INLINE BUTTON SKELETON =====

export function InlineButtonSkeleton() {
  return (
    <div className="skeleton-inline-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <SkeletonCircle size="16px" />
      <SkeletonBox width="80px" height="16px" />
    </div>
  )
}
