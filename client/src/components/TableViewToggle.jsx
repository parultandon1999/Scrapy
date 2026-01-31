import { useState } from 'react'
import { Table, SquaresFour } from '@phosphor-icons/react'
import '../styles/TableViewToggle.css'

function TableViewToggle({ onViewChange, defaultView = 'table' }) {
  const [view, setView] = useState(defaultView)

  const handleToggle = (newView) => {
    setView(newView)
    if (onViewChange) {
      onViewChange(newView)
    }
  }

  // Only show on mobile
  if (window.innerWidth > 768) {
    return null
  }

  return (
    <div className="table-view-toggle" role="group" aria-label="Table view options">
      <button
        className={`view-toggle-btn ${view === 'table' ? 'active' : ''}`}
        onClick={() => handleToggle('table')}
        aria-label="Table view"
        aria-pressed={view === 'table'}
      >
        <Table size={18} weight="duotone" />
        <span>Table</span>
      </button>
      <button
        className={`view-toggle-btn ${view === 'card' ? 'active' : ''}`}
        onClick={() => handleToggle('card')}
        aria-label="Card view"
        aria-pressed={view === 'card'}
      >
        <SquaresFour size={18} weight="duotone" />
        <span>Cards</span>
      </button>
    </div>
  )
}

export default TableViewToggle
