import { useState, useEffect } from 'react'
import { useSwipeableTabs } from '../hooks/useSwipeGesture'
import '../styles/SwipeableTabs.css'

function SwipeableTabs({ tabs, activeTab, onTabChange, children }) {
  const [currentTab, setCurrentTab] = useState(activeTab || 0)
  const { elementRef, swipeState } = useSwipeableTabs(
    tabs.length,
    currentTab,
    (newTab) => {
      setCurrentTab(newTab)
      if (onTabChange) {
        onTabChange(newTab)
      }
    }
  )

  useEffect(() => {
    if (activeTab !== undefined && activeTab !== currentTab) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  return (
    <div className="swipeable-tabs-container">
      {/* Tab Headers */}
      <div className="swipeable-tabs-header" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={currentTab === index}
            aria-controls={`tab-panel-${index}`}
            id={`tab-${index}`}
            className={`swipeable-tab ${currentTab === index ? 'active' : ''}`}
            onClick={() => {
              setCurrentTab(index)
              if (onTabChange) {
                onTabChange(index)
              }
            }}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {tab.badge && <span className="tab-badge">{tab.badge}</span>}
          </button>
        ))}
        <div 
          className="tab-indicator"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${currentTab * 100}%)`
          }}
        />
      </div>

      {/* Tab Content */}
      <div 
        ref={elementRef}
        className={`swipeable-tabs-content ${swipeState.isSwiping ? 'swiping' : ''}`}
        role="tabpanel"
        id={`tab-panel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
      >
        {children || tabs[currentTab]?.content}
      </div>

      {/* Swipe Hint (shows on first use) */}
      {swipeState.isSwiping && (
        <div className="swipe-progress" style={{ width: `${(swipeState.distance / 100) * 100}%` }} />
      )}
    </div>
  )
}

export default SwipeableTabs
