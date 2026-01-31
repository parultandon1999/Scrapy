import { useSwipeableItem } from '../hooks/useSwipeGesture'
import { Trash, Archive } from '@phosphor-icons/react'
import '../styles/SwipeableListItem.css'

function SwipeableListItem({ 
  children, 
  onDelete, 
  onArchive,
  deleteLabel = 'Delete',
  archiveLabel = 'Archive',
  deleteColor = '#d93025',
  archiveColor = '#1a73e8'
}) {
  const {
    elementRef,
    itemRef,
    swipeOffset,
    isRevealed,
    handleDelete,
    handleArchive
  } = useSwipeableItem(onDelete, onArchive)

  return (
    <div className="swipeable-list-item-container" ref={elementRef}>
      {/* Archive button (right side) */}
      {onArchive && (
        <div 
          className="swipe-action swipe-action-archive"
          style={{ backgroundColor: archiveColor }}
        >
          <button 
            onClick={handleArchive}
            className="swipe-action-btn"
            aria-label={archiveLabel}
          >
            <Archive size={20} weight="duotone" />
            <span>{archiveLabel}</span>
          </button>
        </div>
      )}

      {/* Main content */}
      <div
        ref={itemRef}
        className="swipeable-list-item-content"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isRevealed ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>

      {/* Delete button (left side) */}
      <div 
        className="swipe-action swipe-action-delete"
        style={{ backgroundColor: deleteColor }}
      >
        <button 
          onClick={handleDelete}
          className="swipe-action-btn"
          aria-label={deleteLabel}
        >
          <Trash size={20} weight="duotone" />
          <span>{deleteLabel}</span>
        </button>
      </div>
    </div>
  )
}

export default SwipeableListItem
