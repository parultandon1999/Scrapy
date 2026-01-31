// Tour helper functions

export const resetTour = () => {
  localStorage.removeItem('tourCompleted')
  window.location.reload()
}

export const isTourCompleted = () => {
  return localStorage.getItem('tourCompleted') === 'true'
}

export const markTourCompleted = () => {
  localStorage.setItem('tourCompleted', 'true')
}

export const markTourSkipped = () => {
  localStorage.setItem('tourCompleted', 'skipped')
}

// Tour steps for different pages
export const homeTourSteps = [
  {
    target: '.search-input',
    title: '🌐 Enter URL',
    content: 'Start by entering the URL of the website you want to scrape. The system will validate the URL automatically.',
    placement: 'bottom'
  },
  {
    target: '.buttons',
    title: '🚀 Start Scraping',
    content: 'Click "Start Scraping" to begin. You can also access advanced options to customize your scraping settings.',
    placement: 'bottom'
  },
  {
    target: '.theme-toggle',
    title: '🌙 Dark Mode',
    content: 'Toggle between light and dark mode for comfortable viewing at any time.',
    placement: 'bottom'
  },
  {
    target: 'nav.nav',
    title: '📊 Navigation',
    content: 'Access Database to view scraped data, History to see past sessions, Config for settings, and more tools.',
    placement: 'bottom'
  }
]

export const databaseTourSteps = [
  {
    target: '.db-sidebar',
    title: '📁 Database Sections',
    content: 'Navigate through different views: Dashboard for overview, Pages for scraped content, Files for downloads, and Analytics for insights.',
    placement: 'right'
  },
  {
    target: '.quick-stats-grid',
    title: '📊 Quick Stats',
    content: 'View key metrics at a glance: total storage used, average scrape time, success rate, and most scraped domain.',
    placement: 'bottom'
  },
  {
    target: '.export-btn',
    title: '💾 Export Data',
    content: 'Export all your scraped data as JSON for backup or further processing.',
    placement: 'left'
  }
]

export const configTourSteps = [
  {
    target: '.db-sidebar',
    title: '⚙️ Configuration Sections',
    content: 'Customize scraper behavior: Features, Scraper settings, Proxy configuration, File downloads, Authentication, and Fingerprinting.',
    placement: 'right'
  },
  {
    target: '.preset-btn',
    title: '⚡ Quick Presets',
    content: 'Use presets for common scenarios: Fast (quick scraping), Thorough (comprehensive), or Stealth (avoid detection).',
    placement: 'bottom'
  },
  {
    target: '.config-actions',
    title: '💾 Save Changes',
    content: 'Remember to save your changes! You can also reset to defaults or export/import configurations.',
    placement: 'top'
  }
]

export const historyTourSteps = [
  {
    target: '.db-sidebar',
    title: '📜 History Views',
    content: 'Browse your scraping sessions, view timeline of activities, and analyze statistics.',
    placement: 'right'
  },
  {
    target: '.sessions-grid-compact',
    title: '🗂️ Session Cards',
    content: 'Each card shows session details: domain, pages scraped, files downloaded, and timestamps. Click for detailed view.',
    placement: 'bottom'
  },
  {
    target: '.session-actions-compact',
    title: '🔧 Session Actions',
    content: 'Add tags and notes, export sessions, view details, or delete old sessions.',
    placement: 'left'
  }
]
