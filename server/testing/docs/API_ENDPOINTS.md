# Complete API Endpoints Reference

## Base URL
```
http://localhost:8000
```

## Table of Contents
1. [Health & Configuration](#health--configuration)
2. [Scraper Control](#scraper-control)
3. [Data Retrieval](#data-retrieval)
4. [Analytics](#analytics)
5. [Search & Filter](#search--filter)
6. [Selector Finder](#selector-finder)
7. [Change Detection](#change-detection)
8. [Proxy Management](#proxy-management)
9. [File Operations](#file-operations)
10. [WebSocket](#websocket)

---

## Health & Configuration

### GET /
Health check endpoint
```bash
curl http://localhost:8000/
```

### GET /api/config
Get current configuration
```bash
curl http://localhost:8000/api/config
```

### PUT /api/config
Update configuration
```bash
curl -X PUT http://localhost:8000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "section": "SCRAPER",
    "key": "max_pages",
    "value": 200
  }'
```

---

## Scraper Control

### POST /api/scraper/start
Start scraping
```bash
curl -X POST http://localhost:8000/api/scraper/start \
  -H "Content-Type: application/json" \
  -d '{
    "start_url": "https://example.com",
    "max_pages": 50,
    "max_depth": 2,
    "headless": true
  }'
```

### GET /api/scraper/status
Get scraper status
```bash
curl http://localhost:8000/api/scraper/status
```

### POST /api/scraper/stop
Stop scraper
```bash
curl -X POST http://localhost:8000/api/scraper/stop
```

### POST /api/scraper/pause
Pause scraper
```bash
curl -X POST http://localhost:8000/api/scraper/pause
```

### POST /api/scraper/resume
Resume scraper
```bash
curl -X POST http://localhost:8000/api/scraper/resume
```

---

## Data Retrieval

### GET /api/data/stats
Get scraping statistics
```bash
curl http://localhost:8000/api/data/stats
```

### GET /api/data/pages
Get scraped pages (paginated)
```bash
curl "http://localhost:8000/api/data/pages?limit=20&offset=0"
```

### GET /api/data/page/{page_id}
Get specific page details
```bash
curl http://localhost:8000/api/data/page/1
```

### GET /api/data/scraped-urls
Get list of scraped URLs
```bash
curl http://localhost:8000/api/data/scraped-urls
```

### GET /api/data/pages-by-url
Get pages for specific URL
```bash
curl "http://localhost:8000/api/data/pages-by-url?start_url=https://example.com"
```

### GET /api/data/files
Get file assets
```bash
curl "http://localhost:8000/api/data/files?limit=50&status=success"
```

### GET /api/history/sessions
Get scraping sessions
```bash
curl http://localhost:8000/api/history/sessions
```

### GET /api/history/session/{domain}
Get session details for domain
```bash
curl http://localhost:8000/api/history/session/https://example.com
```

### DELETE /api/history/session/{domain}
Delete session data
```bash
curl -X DELETE http://localhost:8000/api/history/session/https://example.com
```

### GET /api/history/statistics
Get history statistics
```bash
curl http://localhost:8000/api/history/statistics
```

---

## Analytics

### GET /api/analytics/performance
Get performance analytics
```bash
curl http://localhost:8000/api/analytics/performance
```

### GET /api/analytics/fingerprints
Get fingerprint analytics
```bash
curl http://localhost:8000/api/analytics/fingerprints
```

### GET /api/analytics/geolocation
Get geolocation analytics
```bash
curl http://localhost:8000/api/analytics/geolocation
```

### GET /api/data/analytics/timeline
Get scraping timeline
```bash
curl http://localhost:8000/api/data/analytics/timeline
```

### GET /api/data/analytics/domains
Get domain statistics
```bash
curl http://localhost:8000/api/data/analytics/domains
```

### GET /api/data/analytics/depth-distribution
Get depth distribution
```bash
curl http://localhost:8000/api/data/analytics/depth-distribution
```

### GET /api/data/analytics/file-types
Get file type analytics
```bash
curl http://localhost:8000/api/data/analytics/file-types
```

### GET /api/data/analytics/link-analysis
Get link analysis
```bash
curl http://localhost:8000/api/data/analytics/link-analysis
```

---

## Search & Filter

### POST /api/data/search/content
Search page content
```bash
curl -X POST http://localhost:8000/api/data/search/content \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "python",
    "limit": 20
  }'
```

### POST /api/data/search/files
Search files
```bash
curl -X POST http://localhost:8000/api/data/search/files \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "report",
    "limit": 20
  }'
```

### GET /api/data/filter/pages
Filter pages
```bash
curl "http://localhost:8000/api/data/filter/pages?min_depth=0&max_depth=2&has_files=true"
```

### GET /api/data/compare/domains
Compare domains
```bash
curl "http://localhost:8000/api/data/compare/domains?domains=https://example.com,https://test.com"
```

### GET /api/data/top-links
Get top links
```bash
curl "http://localhost:8000/api/data/top-links?link_type=internal&limit=20"
```

### GET /api/data/largest-downloads
Get largest downloads
```bash
curl "http://localhost:8000/api/data/largest-downloads?limit=10"
```

### GET /api/data/files-by-extension
Get files grouped by extension
```bash
curl http://localhost:8000/api/data/files-by-extension
```

---

## Selector Finder

### POST /api/selector-finder/analyze
Analyze login page
```bash
curl -X POST http://localhost:8000/api/selector-finder/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "login_url": "https://example.com/login"
  }'
```

### POST /api/selector-finder/test-login
Test login selectors
```bash
curl -X POST http://localhost:8000/api/selector-finder/test-login \
  -H "Content-Type: application/json" \
  -d '{
    "login_url": "https://example.com/login",
    "username": "testuser",
    "password": "testpass",
    "username_selector": "input[name=\"username\"]",
    "password_selector": "input[name=\"password\"]",
    "submit_selector": "button[type=\"submit\"]"
  }'
```

### POST /api/selector-finder/test-selector
Test CSS selector
```bash
curl -X POST http://localhost:8000/api/selector-finder/test-selector \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selector": "button.submit"
  }'
```

### POST /api/selector-finder/generate-robust-selector
Generate robust selector
```bash
curl -X POST http://localhost:8000/api/selector-finder/generate-robust-selector \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "target_description": "submit button"
  }'
```

### POST /api/selector-finder/find-element
Find element by content
```bash
curl -X POST http://localhost:8000/api/selector-finder/find-element \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "search_queries": ["Click here", "Submit"],
    "search_type": "partial"
  }'
```

---

## Change Detection

### GET /api/diff/monitored-urls
Get monitored URLs
```bash
curl http://localhost:8000/api/diff/monitored-urls
```

### GET /api/diff/history/{url}
Get change history for URL
```bash
curl "http://localhost:8000/api/diff/history/https://example.com?limit=20"
```

### GET /api/diff/snapshots/{url}
Get snapshots for URL
```bash
curl "http://localhost:8000/api/diff/snapshots/https://example.com?limit=10"
```

### GET /api/diff/compare/{snapshot_id_1}/{snapshot_id_2}
Compare two snapshots
```bash
curl http://localhost:8000/api/diff/compare/1/2
```

---

## Proxy Management

### GET /api/proxies/list
List configured proxies
```bash
curl http://localhost:8000/api/proxies/list
```

### POST /api/proxies/test
Test proxies
```bash
curl -X POST http://localhost:8000/api/proxies/test \
  -H "Content-Type: application/json" \
  -d '{
    "test_url": "https://httpbin.org/ip",
    "concurrent_tests": 5
  }'
```

---

## File Operations

### GET /api/file/{filename}
Download file
```bash
curl http://localhost:8000/api/file/document.pdf --output document.pdf
```

### GET /api/screenshot/{page_id}
Get page screenshot
```bash
curl http://localhost:8000/api/screenshot/1 --output screenshot.png
```

### GET /api/proxy/image
Proxy image request
```bash
curl "http://localhost:8000/api/proxy/image?url=https://example.com/image.jpg"
```

### GET /api/data/export
Export data as CSV
```bash
curl http://localhost:8000/api/data/export --output data.csv
```

---

## Bulk Operations

### POST /api/data/bulk/delete-pages
Delete multiple pages
```bash
curl -X POST http://localhost:8000/api/data/bulk/delete-pages \
  -H "Content-Type: application/json" \
  -d '[1, 2, 3, 4, 5]'
```

### POST /api/data/bulk/delete-files
Delete multiple files
```bash
curl -X POST http://localhost:8000/api/data/bulk/delete-files \
  -H "Content-Type: application/json" \
  -d '[1, 2, 3]'
```

---

## WebSocket

### WS /ws/scraper
Scraper status updates
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/scraper');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Scraper update:', data);
};
```

### WS /ws/diff
Change detection notifications
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/diff');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Change detected:', data);
};
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## Authentication

Currently no authentication is required. Consider implementing API keys or OAuth for production use.
