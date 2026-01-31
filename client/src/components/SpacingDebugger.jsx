import { useState, useEffect } from 'react'
import { Ruler, Eye, EyeSlash } from '@phosphor-icons/react'
import '../styles/SpacingDebugger.css'

/**
 * SpacingDebugger - Visual tool to verify 8px grid alignment
 * Only shows in development mode
 * Press Ctrl+Shift+G to toggle
 */
function SpacingDebugger() {
  const [isVisible, setIsVisible] = useState(false)
  const [gridSize, setGridSize] = useState(8)
  const [showLabels, setShowLabels] = useState(true)

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+G to toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isVisible) {
    return (
      <button
        className="spacing-debugger-toggle"
        onClick={() => setIsVisible(true)}
        title="Show spacing grid (Ctrl+Shift+G)"
        aria-label="Show spacing grid"
      >
        <Ruler size={20} weight="duotone" />
      </button>
    )
  }

  return (
    <>
      {/* Grid Overlay */}
      <div className="spacing-debugger-overlay">
        <svg className="spacing-grid" width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <rect width={gridSize} height={gridSize} fill="none" stroke="rgba(255, 0, 0, 0.1)" strokeWidth="0.5" />
            </pattern>
            <pattern
              id="grid-major"
              width={gridSize * 8}
              height={gridSize * 8}
              patternUnits="userSpaceOnUse"
            >
              <rect width={gridSize * 8} height={gridSize * 8} fill="none" stroke="rgba(255, 0, 0, 0.3)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#grid-major)" />
        </svg>

        {showLabels && (
          <div className="spacing-labels">
            {[0, 8, 16, 24, 32, 40, 48, 64].map(value => (
              <div
                key={value}
                className="spacing-label"
                style={{ left: `${value}px` }}
              >
                {value}px
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="spacing-debugger-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Ruler size={18} weight="duotone" />
            <span>Spacing Debugger</span>
          </div>
          <button
            className="panel-close"
            onClick={() => setIsVisible(false)}
            aria-label="Close spacing debugger"
          >
            <EyeSlash size={18} />
          </button>
        </div>

        <div className="panel-content">
          <div className="panel-control">
            <label htmlFor="grid-size">Grid Size:</label>
            <select
              id="grid-size"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
            >
              <option value={4}>4px</option>
              <option value={8}>8px (default)</option>
              <option value={16}>16px</option>
            </select>
          </div>

          <div className="panel-control">
            <label htmlFor="show-labels">
              <input
                id="show-labels"
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Show Labels
            </label>
          </div>

          <div className="panel-info">
            <h4>Design Tokens</h4>
            <ul>
              <li><code>--space-2</code> = 8px</li>
              <li><code>--space-4</code> = 16px</li>
              <li><code>--space-6</code> = 24px</li>
              <li><code>--space-8</code> = 32px</li>
            </ul>
          </div>

          <div className="panel-shortcuts">
            <h4>Shortcuts</h4>
            <ul>
              <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd> - Toggle grid</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default SpacingDebugger
