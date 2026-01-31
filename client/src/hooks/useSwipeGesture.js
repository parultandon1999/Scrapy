import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for handling swipe gestures
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {Function} options.onSwipeUp - Callback for up swipe
 * @param {Function} options.onSwipeDown - Callback for down swipe
 * @param {number} options.minSwipeDistance - Minimum distance for swipe (default: 50)
 * @param {number} options.maxSwipeTime - Maximum time for swipe in ms (default: 300)
 * @returns {Object} - Ref to attach to element and swipe state
 */
export function useSwipeGesture(options = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
    maxSwipeTime = 300
  } = options

  const elementRef = useRef(null)
  const [swipeState, setSwipeState] = useState({
    isSwiping: false,
    direction: null,
    distance: 0
  })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0
    let touchEndX = 0
    let touchEndY = 0

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchStartTime = Date.now()
      
      setSwipeState({
        isSwiping: true,
        direction: null,
        distance: 0
      })
    }

    const handleTouchMove = (e) => {
      if (!touchStartX || !touchStartY) return

      touchEndX = e.touches[0].clientX
      touchEndY = e.touches[0].clientY

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      let direction = null
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      setSwipeState({
        isSwiping: true,
        direction,
        distance
      })

      // Add visual feedback class
      if (distance > minSwipeDistance / 2) {
        element.classList.add(`swiping-${direction}`)
      }
    }

    const handleTouchEnd = () => {
      const swipeTime = Date.now() - touchStartTime
      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
      
      // Remove visual feedback classes
      element.classList.remove('swiping-left', 'swiping-right', 'swiping-up', 'swiping-down')

      // Check if swipe is valid
      if (swipeTime > maxSwipeTime) {
        resetSwipe()
        return
      }

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Horizontal swipe
      if (absX > absY && absX > minSwipeDistance) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight({ distance: absX, time: swipeTime })
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft({ distance: absX, time: swipeTime })
        }
      }
      // Vertical swipe
      else if (absY > absX && absY > minSwipeDistance) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown({ distance: absY, time: swipeTime })
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp({ distance: absY, time: swipeTime })
        }
      }

      resetSwipe()
    }

    const resetSwipe = () => {
      touchStartX = 0
      touchStartY = 0
      touchEndX = 0
      touchEndY = 0
      touchStartTime = 0
      
      setSwipeState({
        isSwiping: false,
        direction: null,
        distance: 0
      })
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance, maxSwipeTime])

  return { elementRef, swipeState }
}

/**
 * Hook for swipeable list items (swipe to delete/archive)
 * @param {Function} onDelete - Callback when item is deleted
 * @param {Function} onArchive - Callback when item is archived (optional)
 * @returns {Object} - Handlers and state for swipeable item
 */
export function useSwipeableItem(onDelete, onArchive) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const itemRef = useRef(null)

  const { elementRef, swipeState } = useSwipeGesture({
    onSwipeLeft: ({ distance }) => {
      if (distance > 100) {
        setIsRevealed(true)
        setSwipeOffset(-80) // Reveal delete button
      }
    },
    onSwipeRight: ({ distance }) => {
      if (isRevealed) {
        setIsRevealed(false)
        setSwipeOffset(0)
      } else if (onArchive && distance > 100) {
        setSwipeOffset(80) // Reveal archive button
      }
    },
    minSwipeDistance: 30
  })

  const handleDelete = () => {
    if (itemRef.current) {
      itemRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
      itemRef.current.style.transform = 'translateX(-100%)'
      itemRef.current.style.opacity = '0'
      
      setTimeout(() => {
        if (onDelete) onDelete()
      }, 300)
    }
  }

  const handleArchive = () => {
    if (itemRef.current && onArchive) {
      itemRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
      itemRef.current.style.transform = 'translateX(100%)'
      itemRef.current.style.opacity = '0'
      
      setTimeout(() => {
        onArchive()
      }, 300)
    }
  }

  const resetSwipe = () => {
    setIsRevealed(false)
    setSwipeOffset(0)
  }

  return {
    elementRef,
    itemRef,
    swipeOffset,
    isRevealed,
    swipeState,
    handleDelete,
    handleArchive,
    resetSwipe
  }
}

/**
 * Hook for swipeable tabs navigation
 * @param {number} totalTabs - Total number of tabs
 * @param {number} currentTab - Current active tab index
 * @param {Function} onTabChange - Callback when tab changes
 * @returns {Object} - Ref and handlers for swipeable tabs
 */
export function useSwipeableTabs(totalTabs, currentTab, onTabChange) {
  const { elementRef, swipeState } = useSwipeGesture({
    onSwipeLeft: () => {
      if (currentTab < totalTabs - 1) {
        onTabChange(currentTab + 1)
      }
    },
    onSwipeRight: () => {
      if (currentTab > 0) {
        onTabChange(currentTab - 1)
      }
    },
    minSwipeDistance: 50
  })

  return { elementRef, swipeState }
}

/**
 * Hook for pull-to-refresh functionality
 * @param {Function} onRefresh - Callback when refresh is triggered
 * @param {number} threshold - Pull distance threshold (default: 80)
 * @returns {Object} - State and handlers for pull-to-refresh
 */
export function usePullToRefresh(onRefresh, threshold = 80) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let touchStartY = 0
    let touchCurrentY = 0

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        touchStartY = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e) => {
      if (container.scrollTop === 0 && touchStartY > 0) {
        touchCurrentY = e.touches[0].clientY
        const distance = touchCurrentY - touchStartY

        if (distance > 0) {
          setPullDistance(Math.min(distance, threshold * 1.5))
          
          // Prevent default scroll when pulling
          if (distance > 10) {
            e.preventDefault()
          }
        }
      }
    }

    const handleTouchEnd = () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        
        if (onRefresh) {
          Promise.resolve(onRefresh()).finally(() => {
            setTimeout(() => {
              setIsRefreshing(false)
              setPullDistance(0)
            }, 500)
          })
        }
      } else {
        setPullDistance(0)
      }

      touchStartY = 0
      touchCurrentY = 0
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1)
  }
}
