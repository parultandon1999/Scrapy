import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================================================
// SCRAPER APIs
// ============================================================================

/**
 * Start a new scraping job
 * @param {Object} config - Scraper configuration
 * @param {string} config.start_url - URL to start scraping
 * @param {number} [config.max_pages] - Maximum pages to scrape
 * @param {number} [config.max_depth] - Maximum crawl depth
 * @param {number} [config.concurrent_limit] - Number of concurrent workers
 * @param {boolean} [config.headless] - Run browser in headless mode
 * @param {boolean} [config.download_file_assets] - Download files
 * @param {number} [config.max_file_size_mb] - Max file size in MB
 * @returns {Promise<Object>} Response with success status
 */
export const startScraper = async (config) => {
  const response = await apiClient.post('/api/scraper/start', config)
  return response.data
}

/**
 * Get current scraper status
 * @returns {Promise<Object>} Status object with running state, pages scraped, etc.
 */
export const getScraperStatus = async () => {
  const response = await apiClient.get('/api/scraper/status')
  return response.data
}

/**
 * Stop the running scraper
 * @returns {Promise<Object>} Response with success status
 */
export const stopScraper = async () => {
  const response = await apiClient.post('/api/scraper/stop')
  return response.data
}

// ============================================================================
// CONFIGURATION APIs
// ============================================================================

/**
 * Get current configuration
 * @returns {Promise<Object>} Configuration object
 */
export const getConfig = async () => {
  const response = await apiClient.get('/api/config')
  return response.data
}

/**
 * Update configuration
 * @param {string} section - Config section (e.g., 'scraper', 'proxy')
 * @param {string} key - Config key
 * @param {any} value - New value
 * @returns {Promise<Object>} Response with success status
 */
export const updateConfig = async (section, key, value) => {
  const response = await apiClient.put('/api/config', { section, key, value })
  return response.data
}

// ============================================================================
// DATA APIs
// ============================================================================

/**
 * Get scraping statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getStats = async () => {
  const response = await apiClient.get('/api/data/stats')
  return response.data
}

/**
 * Get scraped pages
 * @param {number} [limit=20] - Number of pages to retrieve
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Pages array and pagination info
 */
export const getPages = async (limit = 20, offset = 0) => {
  const response = await apiClient.get('/api/data/pages', {
    params: { limit, offset }
  })
  return response.data
}

/**
 * Get detailed information about a specific page
 * @param {number} pageId - Page ID
 * @returns {Promise<Object>} Page details with headers, links, media, etc.
 */
export const getPageDetails = async (pageId) => {
  const response = await apiClient.get(`/api/data/page/${pageId}`)
  return response.data
}

/**
 * Get downloaded file assets
 * @param {number} [limit=50] - Number of files to retrieve
 * @param {string} [status] - Filter by status ('success' or 'failed')
 * @returns {Promise<Object>} Files array
 */
export const getFileAssets = async (limit = 50, status = null) => {
  const params = { limit }
  if (status) params.status = status
  
  const response = await apiClient.get('/api/data/files', { params })
  return response.data
}

/**
 * Search page content
 * @param {string} keyword - Search keyword
 * @param {number} [limit=20] - Number of results
 * @returns {Promise<Object>} Search results
 */
export const searchContent = async (keyword, limit = 20) => {
  const response = await apiClient.post('/api/data/search/content', {
    keyword,
    limit
  })
  return response.data
}

/**
 * Search file assets
 * @param {string} keyword - Search keyword
 * @param {number} [limit=20] - Number of results
 * @returns {Promise<Object>} Search results
 */
export const searchFiles = async (keyword, limit = 20) => {
  const response = await apiClient.post('/api/data/search/files', {
    keyword,
    limit
  })
  return response.data
}

/**
 * Export all scraped data to JSON
 * @returns {Promise<Object>} Exported data
 */
export const exportData = async () => {
  const response = await apiClient.get('/api/data/export')
  return response.data
}

// ============================================================================
// PROXY APIs
// ============================================================================

/**
 * Test all proxies
 * @param {string} [testUrl='https://httpbin.org/ip'] - URL to test proxies against
 * @param {number} [concurrentTests=5] - Number of concurrent tests
 * @returns {Promise<Object>} Test results with working and failed proxies
 */
export const testProxies = async (testUrl = 'https://httpbin.org/ip', concurrentTests = 5) => {
  const response = await apiClient.post('/api/proxies/test', {
    test_url: testUrl,
    concurrent_tests: concurrentTests
  })
  return response.data
}

/**
 * List all proxies from file
 * @returns {Promise<Object>} Proxies array
 */
export const listProxies = async () => {
  const response = await apiClient.get('/api/proxies/list')
  return response.data
}

// ============================================================================
// ANALYTICS APIs
// ============================================================================

/**
 * Get performance analytics
 * @returns {Promise<Object>} Analytics data with proxy stats, depth stats, timeline
 */
export const getPerformanceAnalytics = async () => {
  const response = await apiClient.get('/api/analytics/performance')
  return response.data
}

// ============================================================================
// SELECTOR FINDER APIs
// ============================================================================

/**
 * Analyze a login page and suggest CSS selectors
 * @param {string} loginUrl - URL of the login page
 * @returns {Promise<Object>} Analysis results with suggested selectors
 */
export const analyzeLoginPage = async (loginUrl) => {
  const response = await apiClient.post('/api/selector-finder/analyze', {
    login_url: loginUrl
  })
  return response.data
}

// ============================================================================
// WEBSOCKET CONNECTION
// ============================================================================

/**
 * Create WebSocket connection for real-time updates
 * @param {Function} onMessage - Callback for incoming messages
 * @param {Function} [onError] - Callback for errors
 * @param {Function} [onClose] - Callback for connection close
 * @returns {WebSocket} WebSocket instance
 */
export const createWebSocket = (onMessage, onError, onClose) => {
  const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/scraper'
  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    if (onError) onError(error)
  }

  ws.onclose = () => {
    console.log('WebSocket disconnected')
    if (onClose) onClose()
  }

  return ws
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if API is reachable
 * @returns {Promise<boolean>} True if API is reachable
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/')
    return response.status === 200
  } catch (error) {
    return false
  }
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

// Export API client for custom requests
export default apiClient
