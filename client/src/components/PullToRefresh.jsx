import { usePullToRefresh } from '../hooks/useSwipeGesture'
import { ArrowClockwise } from '@phosphor-icons/react'
import '../styles/PullToRefresh.css'

function PullToRefresh({ onRefresh, children, threshold = 80 }) {
  const { containerRef, pullDistance, isRefreshing, pullProgress } = usePullToRefresh(
    onRefresh,
    threshold
  )

  const getRefreshText = () => {
    if (isRefreshing) return 'Refreshing...'
    if (pullProgress >= 1) return 'Release to refresh'
    return 'Pull to refresh'
  }

  return (
    <div className="pull-to-refresh-container" ref={containerRef}>
      {/* Pull indicator */}
      <div 
        className={`pull-to-refresh-indicator ${pullDistance > 0 ? 'visible' : ''} ${isRefreshing ? 'refreshing' : ''}`}
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`
        }}
      >
        <div 
          className={`pull-refresh-icon ${isRefreshing ? 'spinning' : ''}`}
          style={{
            transform: `rotate(${pullProgress * 360}deg)`
          }}
        >
          <ArrowClockwise size={20} weight="bold" />
        </div>
        <span className="pull-refresh-text">{getRefreshText()}</span>
      </div>

      {/* Content */}
      <div className="pull-to-refresh-content">
        {children}
      </div>
    </div>
  )
}

export default PullToRefresh
