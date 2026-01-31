/**
 * Adds data-label attributes to table cells for mobile card view
 * @param {string} tableSelector - CSS selector for the table
 * @param {Array<string>} headers - Array of header labels
 */
export function addDataLabels(tableSelector, headers) {
  if (window.innerWidth > 768) return // Only for mobile

  const table = document.querySelector(tableSelector)
  if (!table) return

  const rows = table.querySelectorAll('tbody tr')
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td')
    cells.forEach((cell, index) => {
      if (headers[index]) {
        cell.setAttribute('data-label', headers[index])
      }
    })
  })
}

/**
 * Toggles table view between table and card mode
 * @param {string} tableSelector - CSS selector for the table
 * @param {string} view - 'table' or 'card'
 */
export function toggleTableView(tableSelector, view) {
  const table = document.querySelector(tableSelector)
  if (!table) return

  if (view === 'card') {
    table.classList.add('card-view')
    table.classList.add('mobile-cards')
  } else {
    table.classList.remove('card-view')
    table.classList.remove('mobile-cards')
  }
}

/**
 * Makes table horizontally scrollable with visual indicator
 * @param {string} tableSelector - CSS selector for the table
 */
export function makeTableScrollable(tableSelector) {
  const tableContainer = document.querySelector(tableSelector)
  if (!tableContainer) return

  // Add scroll indicator class
  tableContainer.classList.add('table-scroll-indicator')

  // Remove indicator when scrolled to the end
  tableContainer.addEventListener('scroll', () => {
    const isScrolledToEnd = 
      tableContainer.scrollLeft + tableContainer.clientWidth >= 
      tableContainer.scrollWidth - 10

    if (isScrolledToEnd) {
      tableContainer.classList.add('scrolled-to-end')
    } else {
      tableContainer.classList.remove('scrolled-to-end')
    }
  })
}

/**
 * Detects if device is mobile
 * @returns {boolean}
 */
export function isMobile() {
  return window.innerWidth <= 768
}

/**
 * Detects if device is tablet
 * @returns {boolean}
 */
export function isTablet() {
  return window.innerWidth > 768 && window.innerWidth <= 1024
}

/**
 * Gets optimal items per page based on screen size
 * @returns {number}
 */
export function getOptimalItemsPerPage() {
  if (isMobile()) return 10
  if (isTablet()) return 20
  return 50
}

/**
 * Formats file size for mobile display
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Truncates text for mobile display
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Adds touch swipe gestures to an element
 * @param {HTMLElement} element
 * @param {Function} onSwipeLeft
 * @param {Function} onSwipeRight
 */
export function addSwipeGestures(element, onSwipeLeft, onSwipeRight) {
  if (!element) return

  let touchStartX = 0
  let touchEndX = 0
  const minSwipeDistance = 50

  element.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX
  }, { passive: true })

  element.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX
    handleSwipe()
  }, { passive: true })

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX
    
    if (Math.abs(swipeDistance) < minSwipeDistance) return

    if (swipeDistance > 0 && onSwipeRight) {
      onSwipeRight()
    } else if (swipeDistance < 0 && onSwipeLeft) {
      onSwipeLeft()
    }
  }
}

/**
 * Enables pull-to-refresh functionality
 * @param {Function} onRefresh
 */
export function enablePullToRefresh(onRefresh) {
  if (!isMobile()) return

  let touchStartY = 0
  let touchEndY = 0
  const pullThreshold = 80

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      touchStartY = e.touches[0].clientY
    }
  }, { passive: true })

  document.addEventListener('touchmove', (e) => {
    if (window.scrollY === 0) {
      touchEndY = e.touches[0].clientY
      const pullDistance = touchEndY - touchStartY

      if (pullDistance > 0 && pullDistance < pullThreshold) {
        // Show pull indicator
        showPullIndicator(pullDistance / pullThreshold)
      }
    }
  }, { passive: true })

  document.addEventListener('touchend', () => {
    const pullDistance = touchEndY - touchStartY
    
    if (pullDistance >= pullThreshold && window.scrollY === 0) {
      if (onRefresh) {
        onRefresh()
      }
    }
    
    hidePullIndicator()
    touchStartY = 0
    touchEndY = 0
  }, { passive: true })
}

function showPullIndicator(progress) {
  let indicator = document.querySelector('.pull-to-refresh')
  
  if (!indicator) {
    indicator = document.createElement('div')
    indicator.className = 'pull-to-refresh'
    indicator.textContent = progress >= 1 ? 'Release to refresh' : 'Pull to refresh'
    document.body.appendChild(indicator)
  }
  
  indicator.classList.add('visible')
  indicator.style.opacity = Math.min(progress, 1)
}

function hidePullIndicator() {
  const indicator = document.querySelector('.pull-to-refresh')
  if (indicator) {
    indicator.classList.remove('visible')
    setTimeout(() => indicator.remove(), 300)
  }
}
