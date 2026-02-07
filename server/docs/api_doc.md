## Overview

The Web Scraper API is a comprehensive RESTful web service built with FastAPI, providing advanced web scraping, data extraction, and website change monitoring capabilities. This document outlines all available endpoints, request/response formats, and usage examples.

**Base URL:** `http://localhost:8000`  
**API Version:** 1.0.0  
**Content Type:** application/json

---

## Table of Contents

- [Health & Status](#health--status)
- [Configuration](#configuration)
- [Scraper Control](#scraper-control)
- [Data Retrieval](#data-retrieval)
- [Analytics](#analytics)
- [Search & Filtering](#search--filtering)
- [Selector Finder](#selector-finder)
- [Change Detection](#change-detection)
- [Data Export](#data-export)
- [File Management](#file-management)
- [WebSocket Connections](#websocket-connections)

---

## Health & Status

### Health Check
Returns API status and version information.

**Endpoint:** `GET /`

**Response:**
```json
{
  "message": "Web Scraper API",
  "status": "running"
}
```

**Status Code:** 200

---

## Configuration

### Get Configuration
Retrieves current API configuration including features, scraper settings, proxy settings, and more.

**Endpoint:** `GET /api/config`

**Response:**
```json
{
  "features": {
    "use_proxies": false,
    "download_file_assets": true,
    "headless_browser": true,
    "use_fingerprinting": true
  },
  "scraper": {
    "max_pages": 100,
    "max_depth": 3,
    "concurrent_limit": 5,
    "base_dir": "scraped_data",
    "smart_scroll_iterations": 5,
    "max_page_retries": 3
  },
  "proxy": {
    "proxy_list": [],
    "test_url": "https://httpbin.org/ip",
    "concurrent_tests": 5
  },
  "auth": {
    "login_url": null,
    "auth_state_file": "auth_state.json"
  },
  "file_download": {
    "max_file_size_mb": 50,
    "max_download_retries": 3,
    "downloadable_extensions": [".pdf", ".docx", ".xlsx", ".csv", ".json"]
  },
  "timeouts": {},
  "delays": {}
}
```

**Status Code:** 200

---

### Update Configuration
Modifies specific configuration settings.

**Endpoint:** `PUT /api/config`

**Request Body:**
```json
{
  "section": "SCRAPER",
  "key": "max_pages",
  "value": 150
}
```

**Parameters:**
- `section` (string, required): Configuration section (e.g., "SCRAPER", "PROXY", "FEATURES")
- `key` (string, required): Configuration key to update
- `value` (any, required): New value for the configuration key

**Response:**
```json
{
  "success": true,
  "message": "Updated SCRAPER.max_pages"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid configuration key
- 500: Server error

---

## Scraper Control

### Start Scraper
Initiates a new web scraping session with specified configuration.

**Endpoint:** `POST /api/scraper/start`

**Request Body:**
```json
{
  "start_url": "https://example.com",
  "max_pages": 50,
  "max_depth": 2,
  "concurrent_limit": 3,
  "headless": true,
  "download_file_assets": true,
  "max_file_size_mb": 50,
  "smart_scroll_iterations": 5,
  "login_url": null,
  "username": null,
  "password": null,
  "username_selector": null,
  "password_selector": null,
  "submit_selector": null,
  "success_indicator": null,
  "manual_login_mode": false,
  "captcha_enabled": true,
  "captcha_pause_workers": true,
  "captcha_sound_alert": true,
  "captcha_desktop_notification": true,
  "extraction_rules": {}
}
```

**Parameters:**
- `start_url` (string, required): The starting URL to scrape
- `max_pages` (integer, optional): Maximum number of pages to scrape. Default: 50
- `max_depth` (integer, optional): Maximum crawl depth. Default: 2
- `concurrent_limit` (integer, optional): Number of concurrent page requests. Default: 3
- `headless` (boolean, optional): Run browser in headless mode. Default: true
- `download_file_assets` (boolean, optional): Download file assets. Default: true
- `max_file_size_mb` (integer, optional): Maximum file size in MB. Default: 50
- `smart_scroll_iterations` (integer, optional): Number of scroll iterations for dynamic content. Default: 5
- `login_url` (string, optional): URL for login page if authentication required
- `username` (string, optional): Username for authentication
- `password` (string, optional): Password for authentication
- `username_selector` (string, optional): CSS selector for username field
- `password_selector` (string, optional): CSS selector for password field
- `submit_selector` (string, optional): CSS selector for submit button
- `success_indicator` (string, optional): CSS selector to verify successful login
- `manual_login_mode` (boolean, optional): Enable manual login solving. Default: false
- `captcha_enabled` (boolean, optional): Enable CAPTCHA detection. Default: true
- `captcha_pause_workers` (boolean, optional): Pause workers on CAPTCHA. Default: true
- `captcha_sound_alert` (boolean, optional): Play sound on CAPTCHA. Default: true
- `captcha_desktop_notification` (boolean, optional): Display notification on CAPTCHA. Default: true
- `extraction_rules` (object, optional): Custom extraction rules for data extraction

**Response:**
```json
{
  "success": true,
  "message": "Scraper started"
}
```

**Status Codes:**
- 200: Scraper started successfully
- 400: Scraper already running
- 500: Server error

---

### Get Scraper Status
Returns current status and progress of the running scraper.

**Endpoint:** `GET /api/scraper/status`

**Response:**
```json
{
  "running": true,
  "is_paused": false,
  "pages_scraped": 45,
  "queue_size": 12,
  "visited": 45,
  "max_pages": 100,
  "downloads": {
    "total_attempted": 25,
    "successful": 23,
    "failed": 2,
    "total_bytes": 5242880
  },
  "recent_pages": [
    {
      "id": 45,
      "url": "https://example.com/page1",
      "title": "Page Title",
      "depth": 1,
      "scraped_at": "2026-02-07 10:30:45"
    }
  ],
  "recent_files": [
    {
      "file_name": "document.pdf",
      "file_extension": ".pdf",
      "file_size_bytes": 1048576,
      "download_status": "success",
      "page_url": "https://example.com/downloads",
      "downloaded_at": "2026-02-07 10:30:30"
    }
  ],
  "start_url": "https://example.com",
  "max_depth": 2,
  "concurrent_limit": 3,
  "authenticated": false,
  "was_stopped": false,
  "file_types": {
    ".pdf": 5,
    ".docx": 3
  },
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Status Code:** 200

---

### Stop Scraper
Terminates the currently running scraper session.

**Endpoint:** `POST /api/scraper/stop`

**Response:**
```json
{
  "success": true,
  "message": "Scraper stopped"
}
```

**Status Codes:**
- 200: Scraper stopped successfully
- 400: No scraper is running
- 500: Server error

---

### Pause Scraper
Pauses the currently running scraper without stopping it completely.

**Endpoint:** `POST /api/scraper/pause`

**Response:**
```json
{
  "success": true,
  "message": "Scraper paused"
}
```

**Status Codes:**
- 200: Scraper paused successfully
- 400: No scraper running or already paused
- 500: Server error

---

### Resume Scraper
Resumes a paused scraper.

**Endpoint:** `POST /api/scraper/resume`

**Response:**
```json
{
  "success": true,
  "message": "Scraper resumed"
}
```

**Status Codes:**
- 200: Scraper resumed successfully
- 400: Scraper not paused
- 500: Server error

---

## Data Retrieval

### Get Statistics
Returns comprehensive statistics about scraped data.

**Endpoint:** `GET /api/data/stats`

**Response:**
```json
{
  "total_pages": 150,
  "total_links": 1250,
  "internal_links": 900,
  "external_links": 350,
  "total_media": 340,
  "total_headers": 520,
  "total_file_assets": 85,
  "successful_downloads": 82,
  "failed_downloads": 3,
  "total_download_size_mb": 245.5
}
```

**Status Code:** 200

---

### Get Pages
Retrieves paginated list of scraped pages.

**Endpoint:** `GET /api/data/pages`

**Query Parameters:**
- `limit` (integer, optional): Number of results to return. Default: 20
- `offset` (integer, optional): Number of results to skip. Default: 0

**Response:**
```json
{
  "pages": [
    {
      "id": 1,
      "url": "https://example.com/page1",
      "title": "Page Title",
      "depth": 0,
      "scraped_at": "2026-02-07 10:30:45"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

**Status Code:** 200

---

### Get Scraped URLs
Returns list of all scraped domains and their statistics.

**Endpoint:** `GET /api/data/scraped-urls`

**Response:**
```json
{
  "urls": [
    {
      "start_url": "https://example.com",
      "page_count": 45,
      "first_scraped": 1707309045,
      "last_scraped": 1707309845
    }
  ]
}
```

**Status Code:** 200

---

### Get Scraping Sessions
Returns list of all scraping sessions with aggregated statistics.

**Endpoint:** `GET /api/history/sessions`

**Response:**
```json
{
  "sessions": [
    {
      "domain": "https://example.com",
      "total_pages": 45,
      "start_time": 1707309045,
      "end_time": 1707309845,
      "avg_depth": 1.8,
      "max_depth": 3,
      "total_links": 340,
      "total_files": 15,
      "total_size": 5242880
    }
  ]
}
```

**Status Code:** 200

---

### Get Session Details
Returns detailed statistics for a specific domain session.

**Endpoint:** `GET /api/history/session/{domain}`

**Path Parameters:**
- `domain` (string, required): Domain to get session details for (URL encoded)

**Response:**
```json
{
  "domain": "https://example.com",
  "overview": {
    "total_pages": 45,
    "start_time": 1707309045,
    "end_time": 1707309845,
    "avg_depth": 1.8,
    "max_depth": 3
  },
  "depth_distribution": [
    {
      "depth": 0,
      "count": 10
    },
    {
      "depth": 1,
      "count": 25
    }
  ],
  "file_stats": [
    {
      "file_extension": ".pdf",
      "count": 5,
      "total_size": 1048576,
      "download_status": "success"
    }
  ],
  "recent_pages": [
    {
      "id": 45,
      "url": "https://example.com/page1",
      "title": "Page Title",
      "depth": 1,
      "timestamp": 1707309845
    }
  ]
}
```

**Status Code:** 200

---

### Delete Session
Deletes all data associated with a specific domain session.

**Endpoint:** `DELETE /api/history/session/{domain}`

**Path Parameters:**
- `domain` (string, required): Domain to delete session for (URL encoded)

**Response:**
```json
{
  "success": true,
  "deleted_pages": 45
}
```

**Status Codes:**
- 200: Session deleted successfully
- 500: Server error

---

### Get History Statistics
Returns overall statistics about all scraping history.

**Endpoint:** `GET /api/history/statistics`

**Response:**
```json
{
  "total_sessions": 5,
  "total_pages": 250,
  "total_files": 50,
  "total_size_mb": 512.5,
  "most_active_day": {
    "date": "2026-02-07",
    "count": 85
  },
  "avg_session_duration_seconds": 780
}
```

**Status Code:** 200

---

### Get Page Details
Returns comprehensive details for a specific page including headers, links, media, and files.

**Endpoint:** `GET /api/data/page/{page_id}`

**Path Parameters:**
- `page_id` (integer, required): Page ID

**Response:**
```json
{
  "id": 1,
  "url": "https://example.com/page1",
  "title": "Page Title",
  "depth": 1,
  "timestamp": 1707309045,
  "headers": [
    {
      "h1": "Main Heading",
      "h2": "Sub Heading"
    }
  ],
  "links": [
    {
      "url": "https://example.com/page2",
      "link_type": "internal",
      "text": "Link Text"
    }
  ],
  "media": [
    {
      "src": "https://example.com/image.jpg",
      "alt": "Image description"
    }
  ],
  "file_assets": [
    {
      "file_name": "document.pdf",
      "file_extension": ".pdf",
      "file_size_bytes": 1048576,
      "download_status": "success"
    }
  ]
}
```

**Status Codes:**
- 200: Page found
- 404: Page not found

---

### Get Pages by URL
Returns all pages and files for a specific domain.

**Endpoint:** `GET /api/data/pages-by-url`

**Query Parameters:**
- `start_url` (string, required): Domain URL to filter by

**Response:**
```json
{
  "pages": [
    {
      "id": 1,
      "url": "https://example.com/page1",
      "title": "Page Title",
      "depth": 0,
      "scraped_at": "2026-02-07 10:30:45"
    }
  ],
  "files": [
    {
      "file_name": "document.pdf",
      "file_extension": ".pdf",
      "file_size_bytes": 1048576,
      "download_status": "success",
      "page_url": "https://example.com/downloads",
      "downloaded_at": "2026-02-07 10:30:30"
    }
  ]
}
```

**Status Code:** 200

---

### Get File Assets
Returns list of downloaded file assets with optional filtering.

**Endpoint:** `GET /api/data/files`

**Query Parameters:**
- `limit` (integer, optional): Number of results. Default: 50
- `status` (string, optional): Filter by status ("success" or "failed")

**Response:**
```json
{
  "files": [
    {
      "id": 1,
      "file_name": "document.pdf",
      "file_extension": ".pdf",
      "file_size_bytes": 1048576,
      "download_status": "success",
      "page_url": "https://example.com/downloads",
      "downloaded_at": "2026-02-07 10:30:30"
    }
  ]
}
```

**Status Code:** 200

---

## Analytics

### Get Performance Analytics
Returns analytics about proxy usage, depth distribution, and scraping timeline.

**Endpoint:** `GET /api/analytics/performance`

**Response:**
```json
{
  "proxy_stats": [
    {
      "proxy": "192.168.1.1:8080",
      "page_count": 50,
      "percentage": 33.3
    }
  ],
  "depth_stats": [
    {
      "depth": 0,
      "page_count": 30,
      "percentage": 20.0
    }
  ],
  "timeline": {
    "start_time": 1707309045,
    "end_time": 1707309845,
    "total_pages": 150,
    "duration": 800,
    "pages_per_second": 0.1875,
    "pages_per_minute": 11.25,
    "pages_per_minute_breakdown": [
      {
        "minute": 0,
        "count": 45
      }
    ]
  }
}
```

**Status Code:** 200

---

### Get Fingerprint Analytics
Returns browser fingerprint usage statistics.

**Endpoint:** `GET /api/analytics/fingerprints`

**Response:**
```json
{
  "timezones": [
    {
      "name": "America/New_York",
      "count": 50
    }
  ],
  "viewports": [
    {
      "name": "1920x1080",
      "count": 80
    }
  ],
  "user_agents": [
    {
      "name": "Chrome 121",
      "count": 90
    }
  ],
  "locales": [
    {
      "name": "en-US",
      "count": 100
    }
  ],
  "diversity_score": 85.5,
  "total_pages": 150,
  "unique_combinations": 128
}
```

**Status Code:** 200

---

### Get Geolocation Analytics
Returns geographic location statistics based on fingerprints.

**Endpoint:** `GET /api/analytics/geolocation`

**Response:**
```json
{
  "locations": [
    {
      "city": "New York",
      "count": 50,
      "percentage": 33.3
    },
    {
      "city": "Los Angeles",
      "count": 35,
      "percentage": 23.3
    }
  ],
  "total_pages": 150
}
```

**Status Code:** 200

---

### Get Scraping Timeline
Returns daily scraping statistics for the last 30 days.

**Endpoint:** `GET /api/data/analytics/timeline`

**Response:**
```json
{
  "timeline": [
    {
      "date": "2026-02-07",
      "pages_scraped": 85,
      "depths_reached": 3
    }
  ]
}
```

**Status Code:** 200

---

### Get Domain Statistics
Returns statistics grouped by domain.

**Endpoint:** `GET /api/data/analytics/domains`

**Response:**
```json
{
  "domains": [
    {
      "domain": "https://example.com",
      "page_count": 45,
      "avg_depth": 1.8,
      "first_scraped": 1707309045,
      "last_scraped": 1707309845
    }
  ]
}
```

**Status Code:** 200

---

### Get Depth Distribution
Returns page count distribution by crawl depth.

**Endpoint:** `GET /api/data/analytics/depth-distribution`

**Response:**
```json
{
  "depth_distribution": [
    {
      "depth": 0,
      "page_count": 30,
      "unique_pages": 30
    },
    {
      "depth": 1,
      "page_count": 80,
      "unique_pages": 75
    }
  ]
}
```

**Status Code:** 200

---

### Get File Type Analytics
Returns detailed statistics about downloaded file types.

**Endpoint:** `GET /api/data/analytics/file-types`

**Response:**
```json
{
  "file_analytics": [
    {
      "file_extension": ".pdf",
      "total_files": 15,
      "successful": 14,
      "failed": 1,
      "total_bytes": 5242880,
      "avg_bytes": 349525,
      "max_bytes": 1048576,
      "min_bytes": 51200
    }
  ]
}
```

**Status Code:** 200

---

### Get Link Analysis
Returns analysis of broken links and most referenced pages.

**Endpoint:** `GET /api/data/analytics/link-analysis`

**Response:**
```json
{
  "broken_links": [
    {
      "url": "https://example.com/missing",
      "reference_count": 5,
      "link_type": "internal"
    }
  ],
  "most_referenced_pages": [
    {
      "url": "https://example.com/home",
      "title": "Home",
      "inbound_links": 25
    }
  ]
}
```

**Status Code:** 200

---

## Search & Filtering

### Search Content
Searches page content by keyword.

**Endpoint:** `POST /api/data/search/content`

**Request Body:**
```json
{
  "keyword": "python",
  "limit": 20
}
```

**Parameters:**
- `keyword` (string, required): Search keyword
- `limit` (integer, optional): Maximum results. Default: 20

**Response:**
```json
{
  "keyword": "python",
  "results": [
    {
      "url": "https://example.com/page1",
      "title": "Python Guide",
      "preview": "Learn Python programming..."
    }
  ],
  "total": 5
}
```

**Status Code:** 200

---

### Search Files
Searches downloaded files by name.

**Endpoint:** `POST /api/data/search/files`

**Request Body:**
```json
{
  "keyword": "report",
  "limit": 20
}
```

**Parameters:**
- `keyword` (string, required): Search keyword
- `limit` (integer, optional): Maximum results. Default: 20

**Response:**
```json
{
  "keyword": "report",
  "results": [
    {
      "file_name": "annual_report.pdf",
      "file_extension": ".pdf",
      "file_size_bytes": 2097152,
      "download_status": "success",
      "page_url": "https://example.com/reports",
      "downloaded_at": "2026-02-07 10:30:30"
    }
  ],
  "total": 3
}
```

**Status Code:** 200

---

### Filter Pages
Filters pages by depth, date, and file presence.

**Endpoint:** `GET /api/data/filter/pages`

**Query Parameters:**
- `min_depth` (integer, optional): Minimum crawl depth
- `max_depth` (integer, optional): Maximum crawl depth
- `has_files` (boolean, optional): Filter by presence of files
- `start_date` (string, optional): Start date (YYYY-MM-DD)
- `end_date` (string, optional): End date (YYYY-MM-DD)
- `limit` (integer, optional): Result limit. Default: 50

**Response:**
```json
{
  "pages": [
    {
      "id": 1,
      "url": "https://example.com/page1",
      "title": "Page Title",
      "depth": 1,
      "file_count": 2
    }
  ],
  "total": 10
}
```

**Status Code:** 200

---

### Compare Domains
Compares statistics across multiple domains.

**Endpoint:** `GET /api/data/compare/domains`

**Query Parameters:**
- `domains` (string, required): Comma-separated domain list

**Response:**
```json
{
  "comparison": [
    {
      "domain": "https://example.com",
      "page_count": 45,
      "avg_depth": 1.8,
      "link_count": 340,
      "file_count": 15
    }
  ]
}
```

**Status Code:** 200

---

### Get Top Links
Returns most frequently encountered links.

**Endpoint:** `GET /api/data/top-links`

**Query Parameters:**
- `link_type` (string, optional): "internal" or "external". Default: "internal"
- `limit` (integer, optional): Result limit. Default: 20

**Response:**
```json
{
  "top_links": [
    {
      "url": "https://example.com/home",
      "frequency": 45
    }
  ]
}
```

**Status Code:** 200

---

### Get Largest Downloads
Returns files sorted by size.

**Endpoint:** `GET /api/data/largest-downloads`

**Query Parameters:**
- `limit` (integer, optional): Result limit. Default: 10

**Response:**
```json
{
  "largest_downloads": [
    {
      "file_name": "large_archive.zip",
      "file_extension": ".zip",
      "file_size_bytes": 104857600,
      "local_path": "/downloads/large_archive.zip",
      "page_url": "https://example.com/downloads"
    }
  ]
}
```

**Status Code:** 200

---

### Get Files by Extension
Returns file statistics grouped by extension.

**Endpoint:** `GET /api/data/files-by-extension`

**Response:**
```json
{
  "files_by_extension": [
    {
      "file_extension": ".pdf",
      "count": 15,
      "total_size": 5242880,
      "download_status": "success"
    }
  ]
}
```

**Status Code:** 200

---

## Selector Finder

### Analyze Login Page
Analyzes a login page to identify input fields and submit buttons.

**Endpoint:** `POST /api/selector-finder/analyze`

**Request Body:**
```json
{
  "login_url": "https://example.com/login"
}
```

**Parameters:**
- `login_url` (string, required): Login page URL

**Response:**
```json
{
  "login_url": "https://example.com/login",
  "inputs": [
    {
      "index": 1,
      "type": "text",
      "name": "username",
      "id": "user-input",
      "placeholder": "Enter username",
      "suggested_selectors": ["input[name='username']", "#user-input"],
      "likely_field": "username"
    }
  ],
  "buttons": [
    {
      "index": 1,
      "type": "submit",
      "text": "Login",
      "id": "submit-btn",
      "suggested_selectors": ["button[type='submit']", "#submit-btn"],
      "likely_submit": true
    }
  ],
  "forms": [
    {
      "index": 1,
      "id": "login-form",
      "action": "/auth/login"
    }
  ],
  "suggested_config": {
    "username_selector": "input[name='username']",
    "password_selector": "input[name='password']",
    "submit_selector": "button[type='submit']"
  }
}
```

**Status Codes:**
- 200: Analysis successful
- 500: Failed to analyze page

---

### Test Login Selectors
Tests login functionality with provided selectors.

**Endpoint:** `POST /api/selector-finder/test-login`

**Request Body:**
```json
{
  "login_url": "https://example.com/login",
  "username": "testuser",
  "password": "testpass123",
  "username_selector": "input[name='username']",
  "password_selector": "input[name='password']",
  "submit_selector": "button[type='submit']",
  "success_indicator": "a[href='/logout']"
}
```

**Parameters:**
- `login_url` (string, required): Login page URL
- `username` (string, required): Test username
- `password` (string, required): Test password
- `username_selector` (string, required): CSS selector for username field
- `password_selector` (string, required): CSS selector for password field
- `submit_selector` (string, required): CSS selector for submit button
- `success_indicator` (string, optional): CSS selector to verify successful login

**Response:**
```json
{
  "success": true,
  "message": "Login appears successful - URL changed",
  "initial_url": "https://example.com/login",
  "final_url": "https://example.com/dashboard",
  "url_changed": true,
  "success_indicator_found": true,
  "errors": []
}
```

**Status Codes:**
- 200: Test completed
- 500: Test failed to run

---

### Test Selector
Tests if a CSS selector successfully matches elements on a page.

**Endpoint:** `POST /api/selector-finder/test-selector`

**Request Body:**
```json
{
  "url": "https://example.com",
  "selector": "button.submit"
}
```

**Parameters:**
- `url` (string, required): URL to test
- `selector` (string, required): CSS selector to test

**Response:**
```json
{
  "success": true,
  "selector": "button.submit",
  "url": "https://example.com",
  "matched_count": 3,
  "strength": {
    "score": 75,
    "strength": "strong",
    "color": "#1a73e8",
    "description": "Reliable - good for production use"
  },
  "elements": [
    {
      "index": 0,
      "tag": "button",
      "text": "Submit",
      "inner_html": "Submit",
      "attributes": {
        "class": "submit",
        "type": "submit"
      },
      "bounding_box": {
        "x": 400,
        "y": 300,
        "width": 100,
        "height": 40
      }
    }
  ],
  "error": null
}
```

**Status Codes:**
- 200: Test successful
- 500: Test failed

---

### Generate Robust Selector
Automatically generates robust CSS selectors for an element based on description.

**Endpoint:** `POST /api/selector-finder/generate-robust-selector`

**Request Body:**
```json
{
  "url": "https://example.com",
  "target_description": "submit button"
}
```

**Parameters:**
- `url` (string, required): Page URL
- `target_description` (string, required): Description of target element

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "target_description": "submit button",
  "selectors": [
    {
      "selector": "#submit-btn",
      "type": "ID",
      "strength": {
        "score": 95,
        "strength": "excellent",
        "color": "#34a853",
        "description": "Highly reliable - unlikely to break"
      },
      "matches": 1
    }
  ],
  "error": null
}
```

**Status Codes:**
- 200: Selectors generated
- 500: Failed to generate selectors

---

### Find Element
Finds elements on a page by text content or image URL.

**Endpoint:** `POST /api/selector-finder/find-element`

**Request Body:**
```json
{
  "url": "https://example.com",
  "search_queries": ["Click here", "Learn more"],
  "search_type": "partial",
  "image_urls": []
}
```

**Parameters:**
- `url` (string, required): Page URL to search
- `search_queries` (array, required): Text queries to search for
- `search_type` (string, optional): "text", "partial", or "regex". Default: "partial"
- `image_urls` (array, optional): Image URLs to search for

**Response:**
```json
{
  "url": "https://example.com",
  "search_queries": ["Click here"],
  "search_type": "partial",
  "results_by_query": {
    "Click here": {
      "search_text": "Click here",
      "query_type": "text",
      "elements": [
        {
          "index": 1,
          "match_type": "exact",
          "tag": "a",
          "id": "main-cta",
          "class": "button primary",
          "name": "",
          "type": "",
          "href": "/start",
          "src": "",
          "text": "Click here",
          "selectors": ["#main-cta", ".primary", "a.primary"],
          "xpath": "/html/body/div/a[1]",
          "styles": {
            "display": "block",
            "color": "rgb(255, 255, 255)"
          },
          "bounding_box": {
            "x": 100,
            "y": 200,
            "width": 120,
            "height": 40
          }
        }
      ]
    }
  }
}
```

**Status Codes:**
- 200: Search completed
- 500: Search failed

---

## Change Detection

### Get Monitored URLs
Returns list of all URLs being monitored for changes.

**Endpoint:** `GET /api/diff/monitored-urls`

**Response:**
```json
{
  "monitored_urls": [
    {
      "url": "https://example.com",
      "total_changes": 5,
      "last_change": 1707309845,
      "last_change_date": "2026-02-07 10:30:45",
      "high_severity_count": 1,
      "medium_severity_count": 2,
      "low_severity_count": 2
    }
  ],
  "total_urls": 1
}
```

**Status Code:** 200

---

### Get Change History
Returns change history for a specific URL.

**Endpoint:** `GET /api/diff/history/{url}`

**Path Parameters:**
- `url` (string, required): URL to get history for (URL encoded)

**Query Parameters:**
- `limit` (integer, optional): Result limit. Default: 20

**Response:**
```json
{
  "url": "https://example.com",
  "total_changes": 5,
  "history": [
    {
      "id": 1,
      "url": "https://example.com",
      "change_timestamp": 1707309845,
      "change_date": "2026-02-07 10:30:45",
      "previous_snapshot_id": 1,
      "current_snapshot_id": 2,
      "change_type": "content",
      "change_category": "text_modified",
      "change_summary": "Header text changed",
      "severity": "medium",
      "content_diffs": [],
      "link_changes": [],
      "media_changes": []
    }
  ]
}
```

**Status Code:** 200

---

### Get URL Snapshots
Returns all snapshots for a specific URL.

**Endpoint:** `GET /api/diff/snapshots/{url}`

**Path Parameters:**
- `url` (string, required): URL to get snapshots for (URL encoded)

**Query Parameters:**
- `limit` (integer, optional): Result limit. Default: 10

**Response:**
```json
{
  "url": "https://example.com",
  "total_snapshots": 5,
  "snapshots": [
    {
      "id": 5,
      "url": "https://example.com",
      "snapshot_timestamp": 1707309845,
      "snapshot_date": "2026-02-07 10:30:45",
      "page_id": 45,
      "content_hash": "abc123def456",
      "title": "Page Title",
      "description": "Page description",
      "header_count": 5,
      "link_count": 25,
      "media_count": 10,
      "file_count": 3
    }
  ]
}
```

**Status Code:** 200

---

### Compare Snapshots
Compares two page snapshots and returns differences.

**Endpoint:** `GET /api/diff/compare/{snapshot_id_1}/{snapshot_id_2}`

**Path Parameters:**
- `snapshot_id_1` (integer, required): First snapshot ID
- `snapshot_id_2` (integer, required): Second snapshot ID

**Response:**
```json
{
  "snapshot1": {
    "id": 1,
    "title": "Old Title",
    "link_count": 20
  },
  "snapshot2": {
    "id": 2,
    "title": "New Title",
    "link_count": 25
  },
  "differences": [
    {
      "field": "title",
      "value1": "Old Title",
      "value2": "New Title"
    }
  ]
}
```

**Status Code:** 200

---

### Get Recent Changes
Returns recent changes across all monitored URLs.

**Endpoint:** `GET /api/diff/recent-changes`

**Query Parameters:**
- `limit` (integer, optional): Result limit. Default: 50
- `severity` (string, optional): Filter by severity ("high", "medium", "low")

**Response:**
```json
{
  "recent_changes": [
    {
      "id": 5,
      "url": "https://example.com",
      "change_timestamp": 1707309845,
      "change_date": "2026-02-07 10:30:45",
      "change_type": "content",
      "change_category": "text_modified",
      "change_summary": "Header text changed",
      "severity": "medium"
    }
  ],
  "total": 5,
  "severity_filter": null
}
```

**Status Code:** 200

---

### Get Diff Statistics
Returns comprehensive statistics about detected changes.

**Endpoint:** `GET /api/diff/stats`

**Response:**
```json
{
  "total_monitored_urls": 5,
  "total_snapshots": 25,
  "total_changes_detected": 42,
  "changes_by_severity": {
    "high": 8,
    "medium": 18,
    "low": 16
  },
  "changes_by_type": {
    "content": 25,
    "links": 10,
    "media": 7
  },
  "changes_by_category": {
    "added": 15,
    "removed": 12,
    "modified": 15
  },
  "most_active_urls": [
    {
      "url": "https://example.com",
      "change_count": 12
    }
  ],
  "recent_activity": [
    {
      "date": "2026-02-07",
      "change_count": 8
    }
  ]
}
```

**Status Code:** 200

---

### Get Content Diff
Returns detailed content differences for a specific change.

**Endpoint:** `GET /api/diff/content-diff/{change_log_id}`

**Path Parameters:**
- `change_log_id` (integer, required): Change log ID

**Response:**
```json
{
  "id": 5,
  "url": "https://example.com",
  "change_timestamp": 1707309845,
  "change_type": "content",
  "change_category": "text_modified",
  "change_summary": "Header text changed",
  "severity": "medium",
  "content_diffs": [
    {
      "field_name": "title",
      "old_value": "Old Title",
      "new_value": "New Title",
      "diff_html": "<del>Old</del> <ins>New</ins> Title",
      "similarity_score": 0.85
    }
  ],
  "link_changes": [],
  "media_changes": []
}
```

**Status Codes:**
- 200: Diff found
- 404: Change not found

---

### Delete Snapshot
Deletes a specific snapshot and associated change records.

**Endpoint:** `DELETE /api/diff/snapshots/{snapshot_id}`

**Path Parameters:**
- `snapshot_id` (integer, required): Snapshot ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Snapshot 5 deleted"
}
```

**Status Codes:**
- 200: Snapshot deleted
- 404: Snapshot not found

---

### Get Change Timeline
Returns change history timeline for a specific URL.

**Endpoint:** `GET /api/diff/timeline/{url}`

**Path Parameters:**
- `url` (string, required): URL to get timeline for (URL encoded)

**Response:**
```json
{
  "url": "https://example.com",
  "timeline": [
    {
      "date": "2026-02-07",
      "change_count": 3,
      "summaries": "Header changed | Content updated | Image added",
      "high_severity": 0,
      "medium_severity": 2,
      "low_severity": 1
    }
  ]
}
```

**Status Code:** 200

---

## Data Export

### Get Extracted Data
Retrieves custom extracted data for a specific page.

**Endpoint:** `GET /api/extracted-data/{page_id}`

**Path Parameters:**
- `page_id` (integer, required): Page ID

**Response:**
```json
{
  "page_id": 45,
  "url": "https://example.com/products/item1",
  "title": "Product Title",
  "extracted_data": {
    "product_name": "Item Name",
    "price": "99.99",
    "availability": "In Stock",
    "description": "Product description"
  }
}
```

**Status Codes:**
- 200: Data found
- 404: Page not found

---

### Get All Extracted Data
Returns paginated extracted data from all pages.

**Endpoint:** `GET /api/extracted-data`

**Query Parameters:**
- `limit` (integer, optional): Result limit. Default: 100
- `offset` (integer, optional): Pagination offset. Default: 0

**Response:**
```json
{
  "total": 150,
  "limit": 100,
  "offset": 0,
  "results": [
    {
      "page_id": 45,
      "url": "https://example.com/products/item1",
      "title": "Product Title",
      "timestamp": 1707309045,
      "extracted_data": {
        "product_name": "Item Name",
        "price": "99.99"
      }
    }
  ]
}
```

**Status Code:** 200

---

### Export Data as JSON
Exports all scraped data in JSON format.

**Endpoint:** `GET /api/data/export`

**Response:**
```json
{
  "total_pages": 150,
  "exported_at": "2026-02-07T10:30:45",
  "data": [
    {
      "id": 1,
      "url": "https://example.com/page1",
      "title": "Page Title",
      "depth": 0,
      "timestamp": 1707309045,
      "headers": [],
      "links": [],
      "media": [],
      "file_assets": []
    }
  ]
}
```

**Status Code:** 200

---

### Export CSV
Exports extracted data as CSV file.

**Endpoint:** `GET /api/export/csv`

**Response:**
```
URL,Title,Field Name,Field Value
https://example.com/products/item1,Product Title,product_name,Item Name
https://example.com/products/item1,Product Title,price,99.99
```

**Headers:**
- Content-Type: text/csv
- Content-Disposition: attachment; filename=extracted_data.csv

**Status Code:** 200

---

### Export JSON
Exports extracted data as JSON file.

**Endpoint:** `GET /api/export/json`

**Response:**
```json
[
  {
    "url": "https://example.com/products/item1",
    "title": "Product Title",
    "data": {
      "product_name": "Item Name",
      "price": "99.99"
    }
  }
]
```

**Headers:**
- Content-Type: application/json
- Content-Disposition: attachment; filename=extracted_data.json

**Status Code:** 200

---

## File Management

### Get Downloaded File
Downloads a previously scraped file.

**Endpoint:** `GET /api/file/{filename}`

**Path Parameters:**
- `filename` (string, required): File name from database

**Response:**
Binary file content with appropriate Content-Type header set based on file extension.

**Status Codes:**
- 200: File found and returned
- 404: File not found

---

### Get Screenshot
Retrieves screenshot of a scraped page.

**Endpoint:** `GET /api/screenshot/{page_id}`

**Path Parameters:**
- `page_id` (integer, required): Page ID

**Response:**
PNG image file.

**Status Codes:**
- 200: Screenshot found
- 404: Screenshot not found

---

### Proxy Image
Proxies external images through the API.

**Endpoint:** `GET /api/proxy/image`

**Query Parameters:**
- `url` (string, required): Image URL to proxy

**Response:**
Image file with appropriate Content-Type.

**Status Codes:**
- 200: Image retrieved
- 500: Failed to fetch image

---

### Proxy Testing
Tests proxy functionality.

**Endpoint:** `POST /api/proxies/test`

**Request Body:**
```json
{
  "test_url": "https://httpbin.org/ip",
  "concurrent_tests": 5
}
```

**Parameters:**
- `test_url` (string, optional): URL to test proxies against
- `concurrent_tests` (integer, optional): Number of concurrent tests

**Response:**
```json
{
  "working": [
    {
      "proxy": "192.168.1.1:8080",
      "status": "Working",
      "response_time": "0.45s",
      "response": "IP information"
    }
  ],
  "failed": [
    {
      "proxy": "10.0.0.1:8080",
      "status": "Timeout",
      "response_time": "10.00s",
      "response": ""
    }
  ],
  "total_tested": 10
}
```

**Status Code:** 200

---

### List Proxies
Returns configured proxy list.

**Endpoint:** `GET /api/proxies/list`

**Response:**
```json
{
  "proxies": [
    "192.168.1.1:8080",
    "10.0.0.1:3128"
  ]
}
```

**Status Code:** 200

---

## Bulk Operations

### Bulk Delete Pages
Deletes multiple pages and associated data.

**Endpoint:** `POST /api/data/bulk/delete-pages`

**Request Body:**
```json
{
  "page_ids": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "deleted_count": 5
}
```

**Status Code:** 200

---

### Bulk Delete Files
Deletes multiple file assets.

**Endpoint:** `POST /api/data/bulk/delete-files`

**Request Body:**
```json
{
  "file_ids": [10, 20, 30]
}
```

**Response:**
```json
{
  "success": true,
  "deleted_count": 3
}
```

**Status Code:** 200

---

## WebSocket Connections

WebSocket endpoints provide real-time, bidirectional communication for live scraper status updates and change detection notifications.

### Scraper Status Updates
Real-time WebSocket connection for scraper status monitoring with automatic heartbeat messages.

**Endpoint:** `WS /ws/scraper`

**Connection:**
```
ws://localhost:8000/ws/scraper
```

**Initial Connection Response:**
When a client connects, the server immediately sends a connection confirmation:
```json
{
  "type": "connection_established",
  "data": {
    "message": "Connected to scraper WebSocket",
    "timestamp": "2026-02-07T10:30:45.123456"
  }
}
```

**Periodic Status Updates (every 2 seconds):**
```json
{
  "type": "status_update",
  "data": {
    "pages_scraped": 45,
    "queue_size": 12,
    "visited": 45,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_paused": false,
    "is_running": true,
    "max_pages": 100,
    "pages_remaining": 55,
    "download_stats": {
      "total_files": 10,
      "successful": 9,
      "failed": 1,
      "total_size_mb": 45.2
    },
    "timestamp": "2026-02-07T10:30:45.123456"
  }
}
```

**When Idle (no active scraper):**
```json
{
  "type": "status_update",
  "data": {
    "pages_scraped": 0,
    "queue_size": 0,
    "visited": 0,
    "session_id": null,
    "is_paused": false,
    "is_running": false,
    "timestamp": "2026-02-07T10:30:45.123456",
    "message": "No active scraper session"
  }
}
```

**Disconnect Handling:**
- When a client disconnects, the connection is automatically cleaned up
- Errors are logged but do not affect other connected clients
- Connection supports reconnection without losing server state

---

### Change Detection Notifications
Real-time WebSocket connection for subscribing to website change detection notifications with flexible subscription management.

**Endpoint:** `WS /ws/diff`

**Connection:**
```
ws://localhost:8000/ws/diff
```

**Initial Connection Response:**
```json
{
  "type": "connection_established",
  "data": {
    "message": "Connected to change detection WebSocket",
    "client_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-02-07T10:30:45.123456"
  }
}
```

**Client Subscription Messages:**
The client sends actions to subscribe/unsubscribe from change notifications:

**Subscribe to Specific URL:**
```json
{
  "action": "subscribe",
  "url": "https://example.com"
}
```

**Unsubscribe from Specific URL:**
```json
{
  "action": "unsubscribe",
  "url": "https://example.com"
}
```

**Subscribe to All Changes:**
```json
{
  "action": "subscribe_all"
}
```

**Ping (keep-alive):**
```json
{
  "action": "ping"
}
```

**Server Subscription Confirmation:**
```json
{
  "type": "subscription_confirmed",
  "data": {
    "action": "subscribe",
    "url": "https://example.com",
    "timestamp": "2026-02-07T10:30:45.123456"
  }
}
```

**Server Heartbeat (every 30 seconds):**
```json
{
  "type": "heartbeat",
  "data": {
    "status": "connected",
    "timestamp": "2026-02-07T10:30:45.123456"
  }
}
```

**Server Pong Response:**
```json
{
  "type": "pong",
  "data": {
    "timestamp": "2026-02-07T10:30:45.123456"
  }
}
```

**Change Detection Broadcast:**
When changes are detected on a subscribed URL, the server broadcasts:
```json
{
  "type": "change_detected",
  "data": {
    "url": "https://example.com",
    "change_data": {
      "summary": "3 new links detected",
      "type": "links_added",
      "severity": "medium"
    },
    "timestamp": "2026-02-07T10:30:45.123456",
    "severity": "medium",
    "change_type": "links_added",
    "change_summary": "3 new links detected"
  }
}
```

**Error Response:**
```json
{
  "type": "error",
  "data": {
    "message": "Invalid JSON format",
    "timestamp": "2026-02-07T10:30:45.123456"
  }
}
```

**Subscription Features:**
- **Selective Subscriptions:** Subscribe to specific URLs to receive only relevant changes
- **Broadcast Subscriptions:** Use `subscribe_all` to receive all change notifications
- **Multiple Subscriptions:** A single client can maintain multiple URL subscriptions simultaneously
- **Connection Keep-Alive:** Heartbeats sent every 30 seconds prevent connection timeout
- **Timeout Handling:** 60-second message timeout with automatic recovery
- **Client Tracking:** Each client gets a unique `client_id` for tracking and logging

**Best Practices:**
1. Establish connection and subscribe to desired URLs immediately
2. Send periodic ping messages to maintain connection health
3. Implement reconnection logic with exponential backoff
4. Handle heartbeat messages gracefully
5. Log client_id for debugging purposes
6. Unsubscribe from URLs when monitoring is no longer needed

---

## Error Handling

All endpoints follow standard HTTP status codes:

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 404 | Resource not found |
| 500 | Server error |

Error Response Format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Currently, no rate limiting is enforced. However, it is recommended to implement reasonable timeouts for long-running operations and concurrent requests.

---

## Authentication

The API currently does not implement authentication. In production environments, it is recommended to:
- Add API key authentication
- Implement JWT tokens
- Use OAuth2 for user management
- Run behind a reverse proxy with authentication

---

## CORS Policy

The API allows requests from:
- `http://localhost:5173`
- `http://localhost:8000`

All HTTP methods and headers are permitted for these origins.

---

## Pagination

Paginated endpoints support the following parameters:
- `limit` (integer): Number of results per page
- `offset` (integer): Number of results to skip

Example:
```
GET /api/data/pages?limit=50&offset=100
```

---

## Filtering & Sorting

Most list endpoints support filtering and sorting through query parameters. Refer to individual endpoint documentation for specific supported filters.

---

## Versioning

Current API Version: 1.0.0

Future versions will maintain backward compatibility where possible. Breaking changes will be communicated in advance.

---

## Support

For issues, bugs, or feature requests, please contact the development team or create an issue in the project repository.

---

## Changelog

### Version 1.0.0 (2026-02-07)
- Initial API release
- 60+ endpoints implemented
- WebSocket support for real-time updates
- Complete scraping, analytics, and change detection functionality
