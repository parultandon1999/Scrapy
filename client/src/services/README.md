# API Service Documentation

This directory contains the API service layer for communicating with the backend.

## Files

- `api.js` - Main API service with all backend endpoints

## Usage

### Import the API functions

```javascript
import { 
  startScraper, 
  getScraperStatus, 
  stopScraper,
  getPages,
  getStats
} from '../services/api'
```

### Start Scraping

```javascript
const config = {
  start_url: 'https://example.com',
  max_pages: 50,
  max_depth: 2,
  headless: true,
  download_file_assets: true
}

const response = await startScraper(config)
```

### Get Scraper Status

```javascript
const status = await getScraperStatus()
console.log(status.pages_scraped, status.running)
```

### Stop Scraper

```javascript
await stopScraper()
```

### Get Scraped Pages

```javascript
const { pages, total } = await getPages(20, 0)
```

### Get Statistics

```javascript
const stats = await getStats()
console.log(stats.total_pages, stats.total_links)
```

### Search Content

```javascript
const results = await searchContent('keyword', 20)
```

### WebSocket for Real-time Updates

```javascript
import { createWebSocket } from '../services/api'

const ws = createWebSocket(
  (data) => {
    // Handle incoming message
    console.log('Message:', data)
  },
  (error) => {
    // Handle error
    console.error('Error:', error)
  },
  () => {
    // Handle close
    console.log('Connection closed')
  }
)

// Close when done
ws.close()
```

## API Endpoints

### Scraper Control
- `startScraper(config)` - Start scraping
- `getScraperStatus()` - Get current status
- `stopScraper()` - Stop scraping

### Configuration
- `getConfig()` - Get configuration
- `updateConfig(section, key, value)` - Update config

### Data Retrieval
- `getStats()` - Get statistics
- `getPages(limit, offset)` - Get pages
- `getPageDetails(pageId)` - Get page details
- `getFileAssets(limit, status)` - Get files
- `searchContent(keyword, limit)` - Search content
- `searchFiles(keyword, limit)` - Search files
- `exportData()` - Export all data

### Proxy Management
- `testProxies(testUrl, concurrentTests)` - Test proxies
- `listProxies()` - List all proxies

### Analytics
- `getPerformanceAnalytics()` - Get analytics

### Selector Finder
- `analyzeLoginPage(loginUrl)` - Analyze login page

## Environment Variables

Set in `.env` file:

```
VITE_API_URL=http://localhost:8000
```

## Error Handling

All API functions throw errors that should be caught:

```javascript
try {
  const data = await startScraper(config)
} catch (error) {
  console.error('API Error:', error.response?.data?.detail || error.message)
}
```

## Utility Functions

- `checkApiHealth()` - Check if API is reachable
- `formatBytes(bytes)` - Format bytes to human-readable
- `formatDate(timestamp)` - Format Unix timestamp
