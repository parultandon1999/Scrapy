# Config Module Documentation

**File:** `server/config.py`  
**Type:** Configuration Management  
**Version:** 1.0.0  
**Last Updated:** 2026-02-07

---

## Table of Contents

1. [Overview](#overview)
2. [Configuration Sections](#configuration-sections)
   - [FEATURES](#features)
   - [SCRAPER](#scraper)
   - [PROXY](#proxy)
   - [AUTH](#auth)
   - [FILE_DOWNLOAD](#file_download)
   - [FINGERPRINTS](#fingerprints)
   - [DATABASE](#database)
   - [CAPTCHA](#captcha)
   - [EXTRACTION](#extraction)
3. [Usage Guide](#usage-guide)
4. [Environment Variables](#environment-variables)
5. [Best Practices](#best-practices)
6. [Common Customizations](#common-customizations)

---

## Overview

The config module provides **centralized configuration management** for the web scraper. All components (API, Scraper, DiffTracker) reference these settings for consistent behavior.

### Key Principles

- **Centralized:** Single source of truth for all settings
- **Modular:** Organized by feature/component
- **Flexible:** Easy to customize without code changes
- **Documented:** Clear defaults with explanations
- **Type-safe:** Proper data types for each setting

### Accessing Configuration

```python
import config

# Access settings
max_pages = config.SCRAPER['max_pages']
use_proxies = config.FEATURES['use_proxies']
db_path = config.get_db_path()
```

---

## Configuration Sections

### FEATURES

Toggles for optional functionality. Enable/disable features without code changes.

```python
FEATURES = {
    'use_proxies': False,           # Use proxy rotation
    'download_file_assets': True,   # Download linked files
    'headless_browser': True,       # Headless mode (no visible window)
    'use_fingerprinting': True,     # Randomize browser fingerprint
}
```

#### Parameter Details

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| **use_proxies** | bool | False | Enable proxy rotation for requests |
| **download_file_assets** | bool | True | Download PDFs, documents, media files |
| **headless_browser** | bool | True | Run browser without GUI (faster, good for servers) |
| **use_fingerprinting** | bool | True | Randomize browser fingerprint (prevent detection) |

#### When to Change

| Setting | Change To | Reason |
|---------|-----------|--------|
| use_proxies | True | Need to bypass IP blocking or anonymity |
| download_file_assets | False | Only need HTML content, save bandwidth |
| headless_browser | False | Debug visual issues in browser window |
| use_fingerprinting | False | Testing - consistent behavior needed |

#### Examples

```python
# Example 1: Low-bandwidth scraping (no files, no proxies)
config.FEATURES['use_proxies'] = False
config.FEATURES['download_file_assets'] = False

# Example 2: Visible debugging
config.FEATURES['headless_browser'] = False  # Show browser window

# Example 3: Maximum stealth
config.FEATURES['use_fingerprinting'] = True
config.FEATURES['use_proxies'] = True
```

---

### SCRAPER

Core scraping behavior and resource limits.

```python
SCRAPER = {
    'max_pages': 100,                    # Max pages to scrape per session
    'max_depth': 3,                      # Max link depth from start URL
    'concurrent_limit': 5,               # Concurrent browser contexts
    'base_dir': 'scraped_data',          # Output directory
    'smart_scroll_iterations': 5,        # Scroll iterations for lazy-load
    'max_page_retries': 3,               # Retry failed pages N times
}
```

#### Parameter Details

| Parameter | Type | Default | Range | Purpose |
|-----------|------|---------|-------|---------|
| **max_pages** | int | 100 | 1-10000 | Stop scraping after N pages |
| **max_depth** | int | 3 | 0-10 | Stop after N link depths |
| **concurrent_limit** | int | 5 | 1-20 | Parallel browser contexts |
| **base_dir** | str | 'scraped_data' | Any path | Output folder for data/files |
| **smart_scroll_iterations** | int | 5 | 0-50 | Scrolls for lazy-loaded content |
| **max_page_retries** | int | 3 | 0-10 | Failed page retry attempts |

#### Performance Impact

| Parameter | ↑ Impact | ↓ Impact | Notes |
|-----------|----------|----------|-------|
| **concurrent_limit** | Memory ↑, Speed ↑ | Memory ↓, Speed ↓ | Each context ≈50MB |
| **max_pages** | Time ↑, Data ↑ | Time ↓, Data ↓ | Scraping scope |
| **max_depth** | Pages ↑, Time ↑ | Pages ↓, Time ↓ | Link depth |
| **smart_scroll_iterations** | Time ↑, Data ↑ | Time ↓, Data ↓ | Lazy-load coverage |
| **max_page_retries** | Reliability ↑, Time ↑ | Reliability ↓, Time ↓ | Failure handling |

#### Recommended Settings

**Fast Scraping (Speed Priority)**
```python
SCRAPER = {
    'max_pages': 50,
    'max_depth': 1,
    'concurrent_limit': 10,
    'smart_scroll_iterations': 1,
    'max_page_retries': 1,
}
```

**Thorough Scraping (Completeness Priority)**
```python
SCRAPER = {
    'max_pages': 1000,
    'max_depth': 5,
    'concurrent_limit': 3,
    'smart_scroll_iterations': 10,
    'max_page_retries': 5,
}
```

**Balanced**
```python
SCRAPER = {
    'max_pages': 100,
    'max_depth': 3,
    'concurrent_limit': 5,
    'smart_scroll_iterations': 5,
    'max_page_retries': 3,
}
```

#### Memory Calculation

```
Estimated Memory = concurrent_limit × 50MB + database_size

Example:
- concurrent_limit=5 → browser memory = 250MB
- 100 pages scraped → database ≈ 5-10MB
- Total ≈ 260-260MB
```

---

### PROXY

Proxy server configuration and testing.

```python
PROXY = {
    'proxy_list': [],                                          # List of proxy URLs
    'test_url': 'https://httpbin.org/ip',                     # URL to test proxies
    'test_timeout': 10000,                                    # Test timeout in ms
    'concurrent_tests': 5,                                    # Parallel proxy tests
    'user_agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" # Test user agent
}
```

#### Parameter Details

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| **proxy_list** | list | [] | List of proxy URLs (http/https/socks5) |
| **test_url** | str | httpbin.org | URL to test proxy working |
| **test_timeout** | int | 10000 | Max time per proxy test (ms) |
| **concurrent_tests** | int | 5 | Parallel test threads |
| **user_agent** | str | Mozilla/... | Header for proxy tests |

#### Proxy Format

```python
# HTTP proxies
PROXY['proxy_list'] = [
    'http://proxy1.com:8080',
    'http://proxy2.com:8080',
    'http://user:pass@proxy.com:8080'
]

# HTTPS proxies
PROXY['proxy_list'] = [
    'https://proxy.com:8080'
]

# SOCKS5 proxies
PROXY['proxy_list'] = [
    'socks5://proxy.com:1080'
]

# Mixed
PROXY['proxy_list'] = [
    'http://free-proxy.com:8080',
    'socks5://premium-proxy.com:1080',
    'http://user:pass@private-proxy.com:3128'
]
```

#### Proxy List Sources

**Free Proxy Lists (Not Recommended):**
- https://free-proxy-list.net
- https://www.sslproxies.org
- https://www.us-proxy.org

**Paid Services (Recommended):**
- Bright Data
- Oxylabs
- ScraperAPI
- Zyte (Scrapy Cloud)

#### Usage

```python
# Enable proxies
config.FEATURES['use_proxies'] = True

# Set proxy list
config.PROXY['proxy_list'] = [
    'http://proxy1.com:8080',
    'http://proxy2.com:8080'
]

# Test proxies (API endpoint: POST /api/proxies/test)
# PUT /api/config with proxy_list
```

---

### AUTH

Authentication and login configuration.

```python
AUTH = {
    'login_url': None,                              # URL with login form
    'username': None,                               # Login username/email
    'password': None,                               # Login password
    'auth_state_file': 'auth_state.json',          # Saved session file
    'username_selector': "input[name='username']", # CSS selector for username field
    'password_selector': "input[name='password']", # CSS selector for password field
    'submit_selector': "button[type='submit']",    # CSS selector for submit button
    'success_indicator': None,                      # Text/element indicating success
    'manual_login_mode': False,                     # User manually enters credentials
    'error_selectors': [...],                       # Selectors for error messages
}
```

#### Parameter Details

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| **login_url** | str | None | URL of login page |
| **username** | str | None | Login username/email |
| **password** | str | None | Login password |
| **auth_state_file** | str | 'auth_state.json' | Session persistence file |
| **username_selector** | str | input[name='username'] | CSS selector for username input |
| **password_selector** | str | input[name='password'] | CSS selector for password input |
| **submit_selector** | str | button[type='submit'] | CSS selector for submit button |
| **success_indicator** | str | None | Element/text after successful login |
| **manual_login_mode** | bool | False | Manual authentication |
| **error_selectors** | list | ['.error', ...] | Login error indicators |

#### Finding Selectors

To find correct selectors, open browser DevTools:

```javascript
// Find username input
document.querySelector('input[name="username"]')  // Standard form

// If different, try:
document.querySelector('#user-email')             // By ID
document.querySelector('.login-field')            // By class
document.querySelector('[placeholder="Email"]')   // By placeholder
```

#### Common Selectors

```python
# Standard HTML form
AUTH = {
    'login_url': 'https://example.com/login',
    'username': 'user@example.com',
    'password': 'secret123',
    'username_selector': "input[name='email']",
    'password_selector': "input[name='password']",
    'submit_selector': "button[type='submit']",
    'success_indicator': 'Dashboard',  # Text on success page
}

# Bootstrap form
AUTH = {
    'username_selector': "input.form-control[type='email']",
    'password_selector': "input.form-control[type='password']",
    'submit_selector': "button.btn-primary",
    'success_indicator': '.welcome-message',
}

# React/Angular form
AUTH = {
    'username_selector': "[data-testid='username']",
    'password_selector': "[data-testid='password']",
    'submit_selector': "[role='button']",
    'success_indicator': "[data-page='dashboard']",
}
```

#### Authentication Modes

**Automated Authentication:**
```python
AUTH = {
    'login_url': 'https://example.com/login',
    'username': 'user@example.com',
    'password': 'secret123',
    'username_selector': "input[name='email']",
    'password_selector': "input[name='password']",
    'submit_selector': "button.login",
    'success_indicator': 'Dashboard'
}
```

**Manual Authentication:**
```python
AUTH = {
    'manual_login_mode': True,
    # ... other fields ...
}
# Scraper pauses, waits for user to login manually in browser
```

**No Authentication:**
```python
AUTH = {
    'login_url': None,
    # Other fields ignored
}
```

#### Session Persistence

After successful login, auth state is saved:
```
scraped_data/auth_state.json
```

This file contains cookies and storage for future sessions.

---

### FILE_DOWNLOAD

File download configuration and restrictions.

```python
FILE_DOWNLOAD = {
    'max_file_size_mb': 50,                    # Skip files larger than N MB
    'max_download_retries': 3,                 # Retry failed downloads
    'chunk_size': 8192,                        # Bytes per download chunk
    'download_timeout': 60,                    # Timeout per file (seconds)
    'downloadable_extensions': {               # Allowed file types
        '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.csv', '.json', '.xml', '.txt',
        '.epub', '.mobi',
        '.mp3', '.mp4', '.avi', '.mov',
        '.sql', '.db', '.sqlite'
    },
}
```

#### Parameter Details

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| **max_file_size_mb** | int | 50 | Skip files larger than N MB |
| **max_download_retries** | int | 3 | Retry attempts per file |
| **chunk_size** | int | 8192 | Bytes per chunk (8KB) |
| **download_timeout** | int | 60 | Timeout seconds per file |
| **downloadable_extensions** | set | {...} | Allowed file extensions |

#### Bandwidth Calculation

```
Per file: min(actual_size, max_file_size_mb) × (1 + retries)

Example:
- 50 files × 5MB average × 3 retries max = 750MB bandwidth

Optimize:
- Reduce max_file_size_mb to 10MB
- Reduce max_download_retries to 1
- Filter extensions to only needed types
```

#### Customizing Extensions

```python
# Minimal (text only)
FILE_DOWNLOAD['downloadable_extensions'] = {'.pdf', '.txt', '.csv'}

# Media only
FILE_DOWNLOAD['downloadable_extensions'] = {'.mp3', '.mp4', '.jpg', '.png'}

# Maximum (all types)
FILE_DOWNLOAD['downloadable_extensions'] = {
    # Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    # Archives
    '.zip', '.rar', '.7z', '.tar', '.gz',
    # Data
    '.csv', '.json', '.xml', '.sql',
    # Media
    '.mp3', '.mp4', '.flac', '.wav', '.avi', '.mov', '.mkv',
    # eBooks
    '.epub', '.mobi', '.azw',
    # Images
    '.jpg', '.png', '.gif', '.webp', '.svg'
}
```

#### Download Statistics

Files are tracked in `file_assets` table:

```python
# Access via API
GET /api/data/file-assets
GET /api/data/downloads/stats

# Returns:
{
    "total_attempted": 50,
    "successful": 45,
    "failed": 5,
    "total_size_mb": 225.5
}
```

---

### FINGERPRINTS

Browser fingerprint randomization for stealth scraping.

```python
FINGERPRINTS = {
    'viewports': [
        {"width": 1920, "height": 1080},
        {"width": 1366, "height": 768},
        # ... 6 more
    ],
    'user_agents': [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X)...",
        # ... more agents
    ],
    'timezones': [
        "America/New_York",
        "Europe/London",
        # ... more zones
    ],
    'geolocations': [
        {"latitude": 40.7128, "longitude": -74.0060},  # New York
        {"latitude": 51.5074, "longitude": -0.1278},   # London
        # ... more locations
    ],
    'locales': [
        ["en-US", "en"],
        ["fr-FR", "fr"],
        # ... more locales
    ],
    'screens': [
        {"width": 1920, "height": 1080},
        # ... more screens
    ],
    'device_scale_factors': [1, 1.5, 2],
    'has_touch_options': [True, False],
}
```

#### Why Fingerprinting?

Websites detect bots by checking:
- User agent (browser type)
- Window size
- Timezone
- Language
- Device type

**Solution:** Randomize for each request

#### Parameter Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **viewports** | Window size | 1920x1080, 1366x768 |
| **user_agents** | Browser identification | Chrome, Firefox, Safari |
| **timezones** | Location timezone | America/New_York, Europe/London |
| **geolocations** | Coordinates | Latitude/longitude pairs |
| **locales** | Language/region | en-US, fr-FR, ja-JP |
| **screens** | Monitor resolution | Physical screen size |
| **device_scale_factors** | Pixel density | 1x, 1.5x, 2x (Retina) |
| **has_touch_options** | Touchscreen support | True/False |

#### Customizing Fingerprints

```python
# Regional customization (Japan only)
FINGERPRINTS['timezones'] = ["Asia/Tokyo"]
FINGERPRINTS['geolocations'] = [
    {"latitude": 35.6762, "longitude": 139.6503},  # Tokyo
    {"latitude": 34.6937, "longitude": 135.5023},  # Osaka
    {"latitude": 42.3601, "longitude": 141.5469},  # Sapporo
]
FINGERPRINTS['locales'] = [["ja-JP", "ja"]]
FINGERPRINTS['user_agents'] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
]

# Apple/Mac users
FINGERPRINTS['user_agents'] = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
]
FINGERPRINTS['device_scale_factors'] = [2]  # Retina displays

# Mobile fingerprints (future)
FINGERPRINTS['viewports'] = [
    {"width": 375, "height": 667},   # iPhone SE
    {"width": 414, "height": 896},   # iPhone 12
    {"width": 390, "height": 844},   # iPhone 14
]
```

#### Fingerprint Distribution

Each page request uses **random** selections:

```python
# Per-request randomization:
fingerprint = {
    "viewport": random.choice(FINGERPRINTS['viewports']),
    "user_agent": random.choice(FINGERPRINTS['user_agents']),
    "timezone": random.choice(FINGERPRINTS['timezones']),
    "geolocation": random.choice(FINGERPRINTS['geolocations']),
    "locale": random.choice(FINGERPRINTS['locales']),
    "screen": random.choice(FINGERPRINTS['screens']),
    "device_scale_factor": random.choice(FINGERPRINTS['device_scale_factors']),
    "has_touch": random.choice(FINGERPRINTS['has_touch_options']),
}
```

---

### DATABASE

Database configuration and path management.

```python
DATABASE = {
    'db_name': 'scraped_data.db',
    'db_path': None,
}

DATABASE['db_path'] = join(SCRAPER['base_dir'], DATABASE['db_name'])
```

#### Parameter Details

| Parameter | Type | Value | Purpose |
|-----------|------|-------|---------|
| **db_name** | str | 'scraped_data.db' | Database filename |
| **db_path** | str | Join base_dir + db_name | Full database path |

#### Storage Location

```
Default: scraped_data/scraped_data.db

Directory structure:
scraped_data/
├── scraped_data.db          (SQLite database)
├── auth_state.json          (Session cookies)
├── example.com/
│   ├── home/
│   │   ├── index.html
│   │   ├── screenshot.png
│   │   └── ...
│   └── products/
│       ├── product-1.html
│       ├── screenshot.png
│       └── ...
└── ...
```

#### DATABASE Access

```python
# Get database path
from config import get_db_path
db_path = get_db_path()

# Connect to database
import sqlite3
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Query
cursor.execute("SELECT * FROM pages LIMIT 10")
pages = cursor.fetchall()
```

#### Database Backup

```bash
# Manual backup
cp scraped_data/scraped_data.db scraped_data/backup_$(date +%s).db

# Auto-backup script (recommended)
```

---

### CAPTCHA

CAPTCHA detection and handling configuration.

```python
CAPTCHA = {
    'enabled': True,                                 # Enable detection
    'manual_solving': True,                         # Manual solving mode
    'wait_timeout': 120,                            # Timeout seconds
    'headless': False,                              # Show window
    'detection_selectors': [                        # CAPTCHA indicators
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
        'div.g-recaptcha',
        'div.h-captcha',
        '[data-sitekey]',
        '#captcha',
        '.captcha'
    ],
    'pause_workers': True,                          # Pause other jobs
    'sound_alert': True,                            # Play sound
    'desktop_notification': True,                   # Desktop popup
    'sound_frequency': 1000,                        # Hz
    'sound_duration': 500,                          # ms
    'sound_repeat': 3,                              # Times
}
```

#### Parameter Details

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| **enabled** | bool | True | Enable CAPTCHA detection |
| **manual_solving** | bool | True | Wait for user to solve |
| **wait_timeout** | int | 120 | Max wait seconds |
| **headless** | bool | False | Show browser window |
| **detection_selectors** | list | [...] | Selectors indicating CAPTCHA |
| **pause_workers** | bool | True | Pause other scrapers |
| **sound_alert** | bool | True | Play alert sound |
| **desktop_notification** | bool | True | Desktop popup |
| **sound_frequency** | int | 1000 | Beep frequency |
| **sound_duration** | int | 500 | Beep duration |
| **sound_repeat** | int | 3 | Number of beeps |

#### CAPTCHA Types

```python
# Google reCAPTCHA v2
CAPTCHA['detection_selectors'].append('iframe[src*="recaptcha"]')
CAPTCHA['detection_selectors'].append('div.g-recaptcha')

# Google reCAPTCHA v3
CAPTCHA['detection_selectors'].append('[data-sitekey]')

# hCaptcha
CAPTCHA['detection_selectors'].append('iframe[src*="hcaptcha"]')

# Custom CAPTCHA
CAPTCHA['detection_selectors'].append('#custom-captcha')
CAPTCHA['detection_selectors'].append('.verify-human')
```

#### Detection Flow

```
1. CAPTCHA enabled? → Yes
2. Scraping page...
3. Check for detection_selectors
4. CAPTCHA found?
   └─ Yes:
      ├─ Pause other workers
      ├─ Play sound alert (3× beeps)
      ├─ Show desktop notification
      ├─ Log URL and warning
      ├─ Wait up to wait_timeout seconds
      └─ Continue if solved, or skip page
   └─ No: Continue normally
```

#### Alert Sound Configuration

```python
# Beep settings
CAPTCHA['sound_frequency'] = 1000    # Hz (higher = higher pitch)
CAPTCHA['sound_duration'] = 500      # Milliseconds
CAPTCHA['sound_repeat'] = 3          # Beep 3 times

# Disable sound
CAPTCHA['sound_alert'] = False

# Aggressive alert
CAPTCHA['sound_frequency'] = 2000    # High pitch
CAPTCHA['sound_duration'] = 1000     # Longer
CAPTCHA['sound_repeat'] = 5          # More times
```

---

### EXTRACTION

Data extraction and cleaning behavior.

```python
EXTRACTION = {
    'enabled': True,               # Enable extraction engine
    'default_timeout': 5000,       # Element wait timeout (ms)
    'retry_on_failure': True,      # Retry failed extractions
    'max_retries': 3,              # Maximum retries
    'clean_whitespace': True,      # Clean whitespace in text
    'validate_data': True,         # Validate extracted data
}
```

#### Parameter Details

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| **enabled** | bool | True | Enable custom extraction |
| **default_timeout** | int | 5000 | Wait for element (ms) |
| **retry_on_failure** | bool | True | Retry if extraction fails |
| **max_retries** | int | 3 | Maximum retry attempts |
| **clean_whitespace** | bool | True | Remove extra spaces |
| **validate_data** | bool | True | Validate types/formats |

#### Extraction Timeout Behavior

```python
# If element not found within timeout:
# 1. Retry (if retry_on_failure=True)
# 2. After max_retries attempts, return default value
# 3. Continue with next rule

default_timeout = 5000  # 5 seconds
```

#### Global vs Rule Timeouts

```python
# Global timeout (applies to all rules)
EXTRACTION['default_timeout'] = 5000

# Rule-specific timeout (overrides global)
rule = {
    "selector": ".slow-loading",
    "type": "text",
    "timeout": 15000  # 15 seconds for this rule only
}
```

---

## Usage Guide

### Basic Usage

```python
import config

# Read configuration
print(config.SCRAPER['max_pages'])           # 100
print(config.FEATURES['headless_browser'])   # True

# Modify configuration
config.SCRAPER['max_pages'] = 200
config.FEATURES['use_proxies'] = True

# Get database path
db_path = config.get_db_path()
```

### With Scraper

```python
from scraper import Scraper
import config

# Use config defaults
scraper = Scraper("https://example.com")

# Or override with custom values
scraper = Scraper(
    start_url="https://example.com",
    max_pages=config.SCRAPER['max_pages'],
    max_depth=config.SCRAPER['max_depth'],
    headless=config.FEATURES['headless_browser']
)
```

### With API

The API automatically uses config values:

```python
# POST /api/scraper/start
{
    "start_url": "https://example.com",
    "max_pages": 100,  # Uses config default
    "headless": true   # Uses config default
}
```

### Environment-Specific Config

```python
# config_dev.py (development)
SCRAPER['max_pages'] = 10
SCRAPER['concurrent_limit'] = 2
FEATURES['headless_browser'] = False

# config_prod.py (production)
SCRAPER['max_pages'] = 500
SCRAPER['concurrent_limit'] = 10
FEATURES['headless_browser'] = True
```

---

## Environment Variables

Configuration can be overridden via environment variables:

```bash
# Note: Currently using hardcoded values
# Can be extended to support env vars:

export SCRAPER_MAX_PAGES=200
export FEATURES_USE_PROXIES=true
export DATABASE_PATH=/custom/path/to/db
```

### Implementation Example

```python
import os

# Override from environment
SCRAPER['max_pages'] = int(os.getenv('SCRAPER_MAX_PAGES', 100))
FEATURES['use_proxies'] = os.getenv('FEATURES_USE_PROXIES', 'false').lower() == 'true'
```

---

## Best Practices

### 1. Configuration Management

✅ **Do:**
```python
# Centralize configuration changes
config.SCRAPER['max_pages'] = 500
config.FEATURES['headless_browser'] = True
```

❌ **Don't:**
```python
# Hardcode values in code
scraper = Scraper(max_pages=500)
```

### 2. Security

✅ **Do:**
```python
# Environment variables for secrets
AUTH['username'] = os.getenv('SCRAPE_USERNAME')
AUTH['password'] = os.getenv('SCRAPE_PASSWORD')
```

❌ **Don't:**
```python
# Hardcode credentials in config
AUTH['username'] = 'actual_email@gmail.com'
AUTH['password'] = 'actual_password'
```

### 3. Resource Limits

✅ **Do:**
```python
# Set reasonable limits
SCRAPER['max_pages'] = 100
FILE_DOWNLOAD['max_file_size_mb'] = 50
```

❌ **Don't:**
```python
# Unlimited scraping
SCRAPER['max_pages'] = 999999
```

### 4. Fingerprinting

✅ **Do:**
```python
# Use diverse fingerprints
FINGERPRINTS['user_agents'] = [...]  # 6+ agents
FINGERPRINTS['viewports'] = [...]    # 8+ sizes
```

❌ **Don't:**
```python
# Single fingerprint (always same)
FINGERPRINTS['user_agents'] = ["Mozilla/..."]
```

### 5. Error Handling

✅ **Do:**
```python
# Enable retries for robustness
SCRAPER['max_page_retries'] = 3
FILE_DOWNLOAD['max_download_retries'] = 3
```

❌ **Don't:**
```python
# No retries (fast but unreliable)
SCRAPER['max_page_retries'] = 0
```

---

## Common Customizations

### Fast Scraping

```python
# Minimal resources, quick results
config.SCRAPER['max_pages'] = 20
config.SCRAPER['max_depth'] = 1
config.SCRAPER['concurrent_limit'] = 10
config.SCRAPER['smart_scroll_iterations'] = 1
config.FEATURES['download_file_assets'] = False
config.CAPTCHA['enabled'] = False
```

### Thorough Scraping

```python
# Complete coverage, longer time
config.SCRAPER['max_pages'] = 1000
config.SCRAPER['max_depth'] = 10
config.SCRAPER['concurrent_limit'] = 3
config.SCRAPER['smart_scroll_iterations'] = 20
config.SCRAPER['max_page_retries'] = 5
config.FEATURES['download_file_assets'] = True
```

### Maximum Stealth

```python
# Avoid detection
config.FEATURES['use_fingerprinting'] = True
config.FEATURES['use_proxies'] = True
config.FEATURES['headless_browser'] = True
config.SCRAPER['concurrent_limit'] = 1  # Sequential
config.CAPTCHA['manual_solving'] = True
```

### Budget Friendly (Low Bandwidth)

```python
# Minimize data transfer
config.FEATURES['download_file_assets'] = False
config.FILE_DOWNLOAD['max_file_size_mb'] = 10
config.FILE_DOWNLOAD['downloadable_extensions'] = {'.pdf', '.txt'}
config.SCRAPER['smart_scroll_iterations'] = 1
```

### Local Testing

```python
# Visible debugging
config.FEATURES['headless_browser'] = False
config.FEATURES['use_proxies'] = False
config.SCRAPER['max_pages'] = 5
config.SCRAPER['concurrent_limit'] = 1
config.CAPTCHA['desktop_notification'] = False
```

---

## Configuration Validation

Before deploying, validate settings:

```python
def validate_config():
    errors = []
    
    # Check ranges
    if config.SCRAPER['concurrent_limit'] > 20:
        errors.append("concurrent_limit > 20 may cause memory issues")
    
    if config.SCRAPER['max_pages'] == 0:
        errors.append("max_pages must be > 0")
    
    # Check dependencies
    if config.FEATURES['use_proxies'] and not config.PROXY['proxy_list']:
        errors.append("use_proxies=True but proxy_list is empty")
    
    return errors

errors = validate_config()
if errors:
    for error in errors:
        print(f"⚠️  {error}")
```

---

## Performance Tuning Guide

### Memory Optimization

```python
# High memory usage scenario:
# concurrent_limit=10 × 50MB = 500MB + database

# Solution 1: Reduce concurrency
SCRAPER['concurrent_limit'] = 3  # 150MB + database

# Solution 2: Smaller fingerprint set
FINGERPRINTS['viewports'] = [{"width": 1920, "height": 1080}]  # 1 only
```

### Speed Optimization

```python
# Slow scraping scenario:

# Solution 1: Increase concurrency
SCRAPER['concurrent_limit'] = 15  # More parallel

# Solution 2: Reduce timeouts
EXTRACTION['default_timeout'] = 2000  # 2 seconds instead of 5
SCRAPER['max_page_retries'] = 1  # 1 try instead of 3

# Solution 3: Disable unnecessary features
FEATURES['download_file_assets'] = False
SCRAPER['smart_scroll_iterations'] = 1
```

### Reliability Optimization

```python
# Pages fail often scenario:

# Solution 1: Increase retries
SCRAPER['max_page_retries'] = 5

# Solution 2: Longer timeouts
EXTRACTION['default_timeout'] = 10000

# Solution 3: Use proxies
FEATURES['use_proxies'] = True
PROXY['proxy_list'] = [...]

# Solution 4: Manual CAPTCHA solving
CAPTCHA['wait_timeout'] = 300  # 5 minutes
```

---

## Troubleshooting

### "Out of Memory"

```python
# Reduce concurrent contexts
SCRAPER['concurrent_limit'] = 1  # Sequential mode
```

### "CAPTCHA timeout"

```python
# Increase timeout
CAPTCHA['wait_timeout'] = 300  # 5 minutes
```

### "File download failing"

```python
# Lower size limit
FILE_DOWNLOAD['max_file_size_mb'] = 10

# Increase retries
FILE_DOWNLOAD['max_download_retries'] = 5
```

### "Extraction returning null"

```python
# Increase timeout
EXTRACTION['default_timeout'] = 10000

# Enable retries
EXTRACTION['retry_on_failure'] = True
EXTRACTION['max_retries'] = 5
```

---

## Migration Guide

### v1.0 → Future Versions

Configuration structure will remain stable. New features will add new sections:

```python
# Example: Future analytics config
ANALYTICS = {
    'track_performance': True,
    'enabled': True,
    'sample_rate': 1.0,
}
```

---

## Version History

### v1.0.0 (2026-02-07)
- Initial release
- 8 configuration sections
- 40+ parameters
- Support for all core features

