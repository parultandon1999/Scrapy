import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const startScraper = async (config) => {
  const response = await apiClient.post('/api/scraper/start', config)
  return response.data
}

export const getScraperStatus = async () => {
  const response = await apiClient.get('/api/scraper/status')
  return response.data
}

export const stopScraper = async () => {
  const response = await apiClient.post('/api/scraper/stop')
  return response.data
}

export const pauseScraper = async () => {
  const response = await apiClient.post('/api/scraper/pause')
  return response.data
}

export const resumeScraper = async () => {
  const response = await apiClient.post('/api/scraper/resume')
  return response.data
}

export const getConfig = async () => {
  const response = await apiClient.get('/api/config')
  return response.data
}

export const updateConfig = async (section, key, value) => {
  const response = await apiClient.put('/api/config', { section, key, value })
  return response.data
}

export const getStats = async () => {
  const response = await apiClient.get('/api/data/stats')
  return response.data
}

export const getPages = async (limit = 20, offset = 0) => {
  const response = await apiClient.get('/api/data/pages', {
    params: { limit, offset }
  })
  return response.data
}

export const getPageDetails = async (pageId) => {
  const response = await apiClient.get(`/api/data/page/${pageId}`)
  return response.data
}

export const getPageMetadata = async (pageId) => {
  const response = await apiClient.get(`/api/metadata/${pageId}`)
  return response.data
}

export const getHistoryByUrl = async (startUrl) => {
  const response = await apiClient.get('/api/data/pages-by-url', {
    params: { start_url: startUrl }
  })
  return response.data
}

export const getFileAssets = async (limit = 50, status = null) => {
  const params = { limit }
  if (status) params.status = status
  
  const response = await apiClient.get('/api/data/files', { params })
  return response.data
}

export const searchContent = async (keyword, limit = 20) => {
  const response = await apiClient.post('/api/data/search/content', {
    keyword,
    limit
  })
  return response.data
}

export const searchFiles = async (keyword, limit = 20) => {
  const response = await apiClient.post('/api/data/search/files', {
    keyword,
    limit
  })
  return response.data
}

export const exportData = async () => {
  const response = await apiClient.get('/api/data/export')
  return response.data
}

export const getFilesByExtension = async () => {
  const response = await apiClient.get('/api/data/files-by-extension')
  return response.data
}

export const getLargestDownloads = async (limit = 10) => {
  const response = await apiClient.get('/api/data/largest-downloads', {
    params: { limit }
  })
  return response.data
}

export const getTopLinks = async (linkType = 'internal', limit = 20) => {
  const response = await apiClient.get('/api/data/top-links', {
    params: { link_type: linkType, limit }
  })
  return response.data
}

export const getScrapingTimeline = async () => {
  const response = await apiClient.get('/api/data/analytics/timeline')
  return response.data
}

export const getDomainStatistics = async () => {
  const response = await apiClient.get('/api/data/analytics/domains')
  return response.data
}

export const getDepthDistribution = async () => {
  const response = await apiClient.get('/api/data/analytics/depth-distribution')
  return response.data
}

export const getFileTypeAnalytics = async () => {
  const response = await apiClient.get('/api/data/analytics/file-types')
  return response.data
}

export const getLinkAnalysis = async () => {
  const response = await apiClient.get('/api/data/analytics/link-analysis')
  return response.data
}

export const bulkDeletePages = async (pageIds) => {
  const response = await apiClient.post('/api/data/bulk/delete-pages', pageIds)
  return response.data
}

export const bulkDeleteFiles = async (fileIds) => {
  const response = await apiClient.post('/api/data/bulk/delete-files', fileIds)
  return response.data
}

export const filterPages = async (filters) => {
  const params = {}
  if (filters.minDepth !== undefined) params.min_depth = filters.minDepth
  if (filters.maxDepth !== undefined) params.max_depth = filters.maxDepth
  if (filters.hasFiles !== undefined) params.has_files = filters.hasFiles
  if (filters.startDate) params.start_date = filters.startDate
  if (filters.endDate) params.end_date = filters.endDate
  if (filters.limit) params.limit = filters.limit
  
  const response = await apiClient.get('/api/data/filter/pages', { params })
  return response.data
}

export const compareDomains = async (domains) => {
  const response = await apiClient.get('/api/data/compare/domains', {
    params: { domains: domains.join(',') }
  })
  return response.data
}

export const getScrapedUrls = async () => {
  const response = await apiClient.get('/api/data/scraped-urls')
  return response.data
}

export const getScrapingSessions = async () => {
  const response = await apiClient.get('/api/history/sessions')
  return response.data
}

export const getSessionDetails = async (domain) => {
  const response = await apiClient.get(`/api/history/session/${encodeURIComponent(domain)}`)
  return response.data
}

export const deleteSession = async (domain) => {
  const response = await apiClient.delete(`/api/history/session/${encodeURIComponent(domain)}`)
  return response.data
}

export const getHistoryStatistics = async () => {
  const response = await apiClient.get('/api/history/statistics')
  return response.data
}

export const testProxies = async (testUrl = 'https://httpbin.org/ip', concurrentTests = 5) => {
  const response = await apiClient.post('/api/proxies/test', {
    test_url: testUrl,
    concurrent_tests: concurrentTests
  })
  return response.data
}

export const listProxies = async () => {
  const response = await apiClient.get('/api/proxies/list')
  return response.data
}

export const getPerformanceAnalytics = async () => {
  const response = await apiClient.get('/api/analytics/performance')
  return response.data
}

export const getFingerprintAnalytics = async () => {
  const response = await apiClient.get('/api/analytics/fingerprints')
  return response.data
}

export const getGeolocationAnalytics = async () => {
  const response = await apiClient.get('/api/analytics/geolocation')
  return response.data
}

export const analyzeLoginPage = async (loginUrl) => {
  const response = await apiClient.post('/api/selector-finder/analyze', {
    login_url: loginUrl
  })
  return response.data
}

export const testLoginSelectors = async (testData) => {
  const response = await apiClient.post('/api/selector-finder/test-login', {
    login_url: testData.loginUrl,
    username: testData.username,
    password: testData.password,
    username_selector: testData.usernameSelector,
    password_selector: testData.passwordSelector,
    submit_selector: testData.submitSelector,
    success_indicator: testData.successIndicator || null
  })
  return response.data
}

export const testSelector = async (url, selector) => {
  const response = await apiClient.post('/api/selector-finder/test-selector', {
    url: url,
    selector: selector
  })
  return response.data
}

export const generateRobustSelector = async (url, targetDescription) => {
  const response = await apiClient.post('/api/selector-finder/generate-robust-selector', {
    url: url,
    target_description: targetDescription
  })
  return response.data
}

export const findElementByContent = async (searchData) => {
  const response = await apiClient.post('/api/selector-finder/find-element', {
    url: searchData.url,
    search_queries: searchData.searchQueries,
    image_urls: searchData.imageUrls || [],
    search_type: searchData.searchType
  })
  return response.data
}

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

export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/')
    return response.status === 200
  } catch (error) {
    return false
  }
}

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

export const getProxyImageUrl = (url) => {
  if (!url) return ''
  return `${API_BASE_URL}/api/proxy/image?url=${encodeURIComponent(url)}`
}

export const getScreenshotUrl = (pageId) => {
  if (!pageId) return ''
  return `${API_BASE_URL}/api/screenshot/${pageId}`
}

export default apiClient