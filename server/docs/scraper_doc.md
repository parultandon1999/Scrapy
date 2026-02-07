# Scraper Module Documentation

**File:** `server/scraper.py`  
**Total Lines:** 2392  
**Version:** 1.0.0  
**Last Updated:** 2026-02-07

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Classes](#classes)
   - [DiffTracker](#difftrackerclass)
   - [DataCleaner](#datacleanerclass)
   - [ExtractionEngine](#extractionengineclass)
   - [Scraper](#scraperclass)
4. [Database Schema](#database-schema)
5. [Key Features](#key-features)
6. [Usage Examples](#usage-examples)
7. [API Integration](#api-integration)
8. [Error Handling](#error-handling)

---

## Overview

The scraper module is the core engine of the web scraping system. It provides:

- **Web Scraping**: Asynchronous crawling with configurable depth and concurrency
- **Change Detection**: Real-time tracking of website modifications
- **Data Extraction**: Rule-based extraction and cleaning of structured data
- **File Management**: Download and manage assets with size/extension validation
- **Authentication**: Support for login workflows and session management
- **Proxy Management**: Rotation and failure handling
- **Fingerprinting**: Browser fingerprint randomization for stealth
- **CAPTCHA Handling**: Manual solving with worker pause notifications

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Scraper (Main)                       │
│  - URL crawling (BFS)                                   │
│  - Page scraping with Playwright                        │
│  - Retry logic & error handling                         │
│  - File downloads                                       │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┼──────────┬─────────────────┐
    │          │          │                 │
    ▼          ▼          ▼                 ▼
┌────────┐ ┌──────────┐ ┌────────────┐ ┌────────────┐
│DiffTracker│ │Extractor│ │DataCleaner │ │   DB       │
│- Snapshot │ │- Rules  │ │- Validation│ │- Storage   │
│- Changes  │ │- DOM    │ │- Formatting│ │- Retrieval │
│- History  │ │- Clean  │ │- Conversion│ │            │
└────────┘ └──────────┘ └────────────┘ └────────────┘
```

---

## Classes

### DiffTracker Class

**Purpose:** Tracks changes in scraped pages over time for change detection.

**Database Tables Managed:**
- `page_snapshots`: Snapshots of page state at different times
- `change_log`: Record of detected changes
- `content_diffs`: Detailed content differences with HTML diff
- `link_changes`: Link additions/removals
- `media_changes`: Image/video additions/removals

#### Key Methods

##### `__init__(db_path: str)`
Initializes DiffTracker and creates necessary database tables.

**Parameters:**
- `db_path`: Path to SQLite database

**Example:**
```python
diff_tracker = DiffTracker("scraped_data.db")
```

---

##### `create_snapshot(page_id: int) -> int`
Creates a snapshot of current page state for comparison.

**Parameters:**
- `page_id`: Database ID of the page

**Returns:**
- Snapshot ID (int) or None if error

**What it captures:**
- Page title and description
- Header/link/media/file counts
- Content hash for quick comparison
- Full text hash for similarity detection

**Example:**
```python
snapshot_id = diff_tracker.create_snapshot(page_id=42)
if snapshot_id:
    print(f"Created snapshot: {snapshot_id}")
```

---

##### `detect_changes(url: str, current_page_id: int) -> Optional[Dict]`
Detects changes between current and previous page snapshots.

**Parameters:**
- `url`: URL being monitored
- `current_page_id`: ID of current page in database

**Returns:**
Dictionary with:
- `is_first_scrape`: Boolean - first time scraping this URL
- `changes_detected`: Boolean - changes were found
- `changes`: List of change objects
  - Each change has: `type`, `category`, `summary`, `severity`, `details`
- `snapshot_ids`: Previous and current snapshot IDs

**Example:**
```python
changes = diff_tracker.detect_changes("https://example.com", page_id=42)
if changes and changes['changes_detected']:
    for change in changes['changes']:
        print(f"{change['summary']} - Severity: {change['severity']}")
```

---

##### `_detect_content_changes(cursor, previous_snapshot, current_page, current_page_id) -> List[Dict]`
Detects changes in page content (title, description, text).

**Returns List of:**
- Type: `"content"`
- Category: `"title"`, `"description"`, or `"full_text"`
- Summary: Human-readable description
- Similarity score (0-1)
- Old/new values

---

##### `_detect_link_changes(cursor, previous_page_id, current_page_id) -> List[Dict]`
Detects added/removed links on the page.

**Returns List of:**
- Type: `"links"`
- Category: `"added"` or `"removed"`
- Details: List of link URLs

---

##### `_detect_media_changes(cursor, previous_page_id, current_page_id) -> List[Dict]`
Detects added/removed images/videos.

**Returns List of:**
- Type: `"media"`
- Category: `"added"` or `"removed"`
- Details: List of media URLs

---

##### `_detect_file_changes(cursor, previous_page_id, current_page_id) -> List[Dict]`
Detects added/removed downloadable files.

**Returns List of:**
- Type: `"files"`
- Category: `"added"` or `"removed"`
- Details: File information

---

##### `get_change_history(url: str, limit: int = 10) -> List[Dict]`
Retrieves history of changes for a URL.

**Parameters:**
- `url`: URL to get history for
- `limit`: Maximum number of changes (default: 10)

**Returns:** List of change records with:
- Timestamp and date
- Change details (content, links, media)
- HTML diffs
- Severity levels

**Example:**
```python
history = diff_tracker.get_change_history("https://example.com", limit=5)
for change in history:
    print(f"Changed on {change['change_date']}: {change['change_summary']}")
```

---

##### `get_all_monitored_urls() -> List[Dict]`
Gets list of all URLs being monitored with change statistics.

**Returns:** List of URLs with:
- Total changes count
- Last change timestamp
- High/medium/low severity counts

---

##### `compare_snapshots(snapshot_id_1: int, snapshot_id_2: int) -> Dict`
Compares two snapshots directly.

**Parameters:**
- `snapshot_id_1`: ID of first snapshot
- `snapshot_id_2`: ID of second snapshot

**Returns:** Dictionary with:
- Both snapshots
- List of differences in: title, description, counts

---

### DataCleaner Class

**Purpose:** Validates and formats extracted data into appropriate types.

#### Static Methods

All cleaning methods handle None/empty values gracefully and return None on failure.

##### `clean_text(value: str) -> str`
Strips whitespace and normalizes spaces.
- Removes extra spaces/tabs/newlines
- Trims edges
- Returns empty string if None

**Example:**
```python
DataCleaner.clean_text("  Hello  World  ")  # Returns: "Hello World"
```

---

##### `clean_number(value: str) -> Optional[float]`
Extracts and converts to float.
- Removes non-numeric characters except `.` and `-`
- Supports negative numbers
- Returns None if invalid

**Example:**
```python
DataCleaner.clean_number("$99.99")  # Returns: 99.99
DataCleaner.clean_number("-$50.00")  # Returns: -50.0
```

---

##### `clean_price(value: str) -> Optional[float]`
Same as `clean_number()` - converts to float.

**Example:**
```python
DataCleaner.clean_price("USD $199.99")  # Returns: 199.99
```

---

##### `clean_integer(value: str) -> Optional[int]`
Extracts and converts to integer.
- Removes non-numeric characters except `-`
- No decimal points allowed

**Example:**
```python
DataCleaner.clean_integer("Quantity: 42 items")  # Returns: 42
```

---

##### `clean_date(value: str) -> Optional[str]`
Parses multiple date formats, returns ISO format (YYYY-MM-DD).

**Supported formats:**
- `2026-02-07`
- `02/07/2026`
- `07/02/2026`
- `February 07, 2026`
- `Feb 07, 2026`
- `2026-02-07 10:30:45`

**Example:**
```python
DataCleaner.clean_date("February 7, 2026")  # Returns: "2026-02-07"
```

---

##### `clean_email(value: str) -> Optional[str]`
Extracts valid email address using regex.

**Example:**
```python
DataCleaner.clean_email("Contact: john@example.com")  # Returns: "john@example.com"
```

---

##### `clean_phone(value: str) -> Optional[str]`
Formats phone numbers.

**Supports:**
- 10-digit: `5551234567` → `(555) 123-4567`
- 11-digit (starting with 1): `15551234567` → `+1 (555) 123-4567`
- Other lengths: Returns digits only

**Example:**
```python
DataCleaner.clean_phone("+1 (555) 123-4567")  # Returns: "+1 (555) 123-4567"
```

---

##### `clean_url(value: str, base_url: str = None) -> Optional[str]`
Cleans and resolves relative URLs.

**Features:**
- Strips whitespace
- Resolves relative URLs against base_url
- Returns absolute URLs

**Example:**
```python
DataCleaner.clean_url("/about", base_url="https://example.com")
# Returns: "https://example.com/about"
```

---

##### `clean_boolean(value: str) -> Optional[bool]`
Converts various boolean representations.

**True values:** `true`, `yes`, `1`, `on`, `available`, `in stock`  
**False values:** `false`, `no`, `0`, `off`, `unavailable`, `out of stock`

**Example:**
```python
DataCleaner.clean_boolean("in stock")  # Returns: True
DataCleaner.clean_boolean("unavailable")  # Returns: False
```

---

##### `clean_list(value: str, separator: str = ',') -> list`
Splits string into list of items.

**Parameters:**
- `value`: String to split
- `separator`: Delimiter (default: comma)

**Example:**
```python
DataCleaner.clean_list("apple, banana, orange")
# Returns: ["apple", "banana", "orange"]
```

---

##### `clean(value: Any, data_type: str, **kwargs) -> Any`
Dispatcher method that calls appropriate cleaner.

**Parameters:**
- `value`: Value to clean
- `data_type`: Type of cleaning (`text`, `number`, `price`, `integer`, `date`, `email`, `phone`, `url`, `boolean`, `list`)
- `**kwargs`: Extra parameters (passed to specific cleaners)

**Example:**
```python
DataCleaner.clean("$99.99", "price")  # Returns: 99.99
DataCleaner.clean("hello world", "text")  # Returns: "hello world"
```

---

### ExtractionEngine Class

**Purpose:** Extracts structured data from DOM using CSS selectors and rules.

**Workflow:**
1. Define extraction rules (CSS selector, data type, optional processing)
2. Apply rules to Playwright page object
3. DataCleaner validates and formats results
4. Return cleaned data

#### Key Methods

##### `__init__()`
Initializes engine with DataCleaner instance.

```python
engine = ExtractionEngine()
```

---

##### `extract_single_field(page: Page, rule: Dict) -> Optional[Any]`
Extracts single data point from page.

**Rule Structure:**
```python
rule = {
    "selector": "h1.title",           # CSS selector (required)
    "type": "text",                   # Data type (default: text)
    "attribute": "href",              # Attribute to extract (optional)
    "default": "N/A",                 # Default if not found (optional)
    "regex": r"(\d+)",                # Regex to extract from value (optional)
    "timeout": 5000                   # Wait timeout in ms (default: 5000)
}
```

**Data types:** `text`, `number`, `price`, `integer`, `date`, `email`, `phone`, `url`, `boolean`, `list`

**Process:**
1. Waits for selector (with timeout)
2. Gets element value (text or attribute)
3. Applies regex if provided
4. Cleans value using DataCleaner
5. Returns cleaned value or default

**Example:**
```python
rule = {
    "selector": ".product-title",
    "type": "text",
    "default": "Unknown"
}
title = await engine.extract_single_field(page, rule)
```

---

##### `extract_multiple_fields(page: Page, rule: Dict) -> List[Dict]`
Extracts multiple items (e.g., list of products).

**Rule Structure:**
```python
rule = {
    "selector": ".product-item",      # Container selector (required)
    "limit": 10,                      # Max items to extract (optional)
    "fields": {                       # Field definitions (required)
        "name": {
            "selector": ".name",
            "type": "text"
        },
        "price": {
            "selector": ".price",
            "type": "price"
        }
    }
}
```

**Process:**
1. Finds all containers matching selector
2. For each container, extracts fields
3. Returns list of dictionaries

**Example:**
```python
rule = {
    "selector": "div.product",
    "limit": 20,
    "fields": {
        "title": {"selector": "h2", "type": "text"},
        "price": {"selector": ".price", "type": "price"},
        "rating": {"selector": ".rating", "type": "number"}
    }
}
products = await engine.extract_multiple_fields(page, rule)
# Returns: [{"title": "...", "price": 99.99, "rating": 4.5}, ...]
```

---

##### `extract_all(page: Page, rules: Dict) -> Dict`
Applies all rules to page at once.

**Parameters:**
- `page`: Playwright page object
- `rules`: Dictionary of field_name → rule pairs

**Returns:** Dictionary of field_name → extracted_value/list

**Example:**
```python
rules = {
    "page_title": {
        "selector": "h1",
        "type": "text"
    },
    "products": {
        "selector": ".product",
        "multiple": True,
        "fields": {...}
    }
}
data = await engine.extract_all(page, rules)
```

---

##### `extract_with_condition(page: Page, rule: Dict) -> Optional[Any]`
Conditionally extracts based on another element's value.

**Rule Structure:**
```python
rule = {
    "selector": ".price",
    "type": "price",
    "condition": {
        "selector": ".in-stock",
        "value": "true"
    }
}
```

**Example:**
```python
# Only extract price if "in-stock" contains "true"
price = await engine.extract_with_condition(page, rule)
```

---

##### `extract_with_fallback(page: Page, selectors: List[str], data_type: str = 'text') -> Optional[Any]`
Tries multiple selectors in order until one succeeds.

**Example:**
```python
# Try different selectors for price
price = await engine.extract_with_fallback(
    page,
    [".price", ".product-price", "[data-price]"],
    "price"
)
```

---

##### `extract_with_wait(page: Page, rule: Dict) -> Optional[Any]`
Waits for specified condition before extracting.

**Rule Structure:**
```python
rule = {
    "selector": ".lazy-loaded-content",
    "type": "text",
    "wait_for": {
        "type": "selector",
        "selector": ".loading-spinner[style*='display: none']"
    }
}
```

---

##### `validate_rule(rule: Dict) -> bool`
Validates rule structure and configuration.

**Checks:**
- Selector is present
- Data type is valid
- Multiple extraction has fields defined

**Example:**
```python
if not engine.validate_rule(rule):
    print("Invalid rule!")
```

---

### Scraper Class

**Purpose:** Main web scraper engine - crawls websites, extracts data, downloads files, tracks changes.

#### Initialization

```python
scraper = Scraper(
    start_url="https://example.com",
    max_pages=100,                    # Max pages to scrape
    max_depth=3,                      # Max crawler depth
    concurrent_limit=5,               # Concurrent browser contexts
    headless=True,                    # Headless browser mode
    download_file_assets=True,        # Download files
    max_file_size_mb=50,              # Max file size
    login_url=None,                   # Authentication URL
    username=None,                    # Login credentials
    password=None,
    smart_scroll_iterations=5         # Scroll iterations for lazy-load
)
```

#### Key Configuration

| Parameter | Purpose | Default |
|-----------|---------|---------|
| `start_url` | Initial URL to scrape | Required |
| `max_pages` | Stop after N pages | 100 |
| `max_depth` | Stop after N levels | 3 |
| `concurrent_limit` | Async contexts | 5 |
| `headless` | Headless browser | True |
| `download_file_assets` | Download files | True |
| `max_file_size_mb` | File size limit | 50 |
| `smart_scroll_iterations` | Lazy-load scrolls | 5 |

#### Core Attributes

```python
scraper.start_url              # Normalized start URL
scraper.domain                 # Extracted domain
scraper.queue                  # Deque of URLs to crawl
scraper.visited                # Set of visited URLs
scraper.pages_scraped          # Counter
scraper.is_paused              # Pause flag
scraper.should_stop            # Stop flag
scraper.db_path                # Database file path
scraper.base_dir               # Output directory
scraper.proxies                # List of proxies
scraper.extraction_rules       # Custom extraction rules
scraper.diff_tracker           # Change detection engine
scraper.extraction_engine      # Data extraction engine
```

#### Main Methods

##### `async scrape() -> Dict`
Main scraping loop. Crawls site and processes pages.

**Process:**
1. Initialize browser (with proxy, fingerprint)
2. Perform authentication if configured
3. Crawl queue (BFS)
4. For each page:
   - Extract elements (headers, links, media, files)
   - Download files
   - Extract custom data
   - Create snapshots for change detection
   - Detect changes
   - Broadcast change notifications
5. Close browser and return stats

**Returns:**
```python
{
    "pages_scraped": 150,
    "urls_visited": 150,
    "time_taken": 45.2,
    "database_path": "scraped_data/scraped_data.db",
    "base_directory": "scraped_data",
    "domain": "example.com",
    "files_downloaded": 30,
    "total_file_size_mb": 125.4
}
```

**Example:**
```python
scraper = Scraper("https://example.com")
results = await scraper.scrape()
print(f"Scraped {results['pages_scraped']} pages")
```

---

##### `async scrape_page(page: Page, url: str, depth: int) -> bool`
Scrapes single page - extracts content, downloads files, detects changes.

**Process:**
1. Navigate to URL (with wait and retries)
2. Handle CAPTCHA if detected
3. Wait for smart scroll
4. Extract page content:
   - Headers (h1-h6)
   - Links (internal/external)
   - Media (images, videos)
   - Structured data (JSON-LD)
   - HTML structure
5. Extract custom data using rules
6. Download file assets
7. Store in database
8. Detect and broadcast changes

**Returns:** Boolean - success/failure

---

##### `async _handle_authentication() -> bool`
Handles login workflow.

**Modes:**
- **Automated:** Uses provided credentials
- **Manual:** Pauses, waits for user to login

**Process:**
1. Create new context with auth state
2. Navigate to login_url
3. Fill credentials
4. Submit form
5. Wait for success indicator
6. Save auth state

**Returns:** Boolean - authentication success

---

##### `async _get_next_proxy() -> Optional[str]`
Gets next available proxy from rotation list.

**Features:**
- Round-robin rotation
- Skips failed proxies
- Returns None if all failed

---

##### `async _mark_proxy_failed(proxy: str)`
Marks proxy as failed after error.

---

##### `async detect_captcha(page: Page) -> bool`
Detects CAPTCHA using configured selectors.

**Returns:** Boolean - CAPTCHA detected

---

##### `async wait_for_captcha_solution(page: Page) -> bool`
Pauses workers and waits for manual CAPTCHA solving.

**Actions:**
- Logs warning with URL
- Plays sound alert
- Sends desktop notification
- Waits configured timeout

**Returns:** Boolean - CAPTCHA was solved

---

##### `def set_extraction_rules(rules: Dict)`
Configures custom data extraction rules.

**Example:**
```python
rules = {
    "product_title": {
        "selector": "h1.title",
        "type": "text"
    },
    "price": {
        "selector": ".price",
        "type": "price"
    }
}
scraper.set_extraction_rules(rules)
```

---

##### `def _init_database()`
Initializes SQLite database with all required tables.

**Tables created:**
- `pages`
- `headers`
- `links`
- `media`
- `structured_data`
- `html_structure`
- `file_assets`
- `custom_extracted_data`

---

##### `async _download_file(file_url: str, save_path: str, session) -> Dict`
Downloads single file with retry logic.

**Parameters:**
- `file_url`: URL of file to download
- `save_path`: Local file path
- `session`: aiohttp session

**Returns:**
```python
{
    "success": True,
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "error": None
}
```

**Features:**
- Retry on failure
- Chunked download
- Size validation
- Timeout handling

---

#### Utility Methods

##### `def _normalize_url(url: str) -> str`
Normalizes URL (removes query params, fragments, trailing slash).

---

##### `def _create_folder_path(url: str) -> str`
Creates folder structure based on URL path.

---

##### `def _is_downloadable_file(url: str) -> bool`
Checks if URL points to downloadable file.

---

##### `def _generate_fingerprint() -> Dict`
Generates random browser fingerprint for stealth.

**Returns:** Fingerprint with: viewport, user agent, timezone, geolocation, locale, screen, device scale, touch support

---

##### `def _load_proxies() -> List[str]`
Loads and validates proxy list from config.

---

##### `async _pause_all_workers()`
Pauses all scraper workers (used for CAPTCHA).

---

---

## Database Schema

### pages Table
```sql
id                  INTEGER PRIMARY KEY
url                 TEXT UNIQUE NOT NULL
title               TEXT
description         TEXT
full_text           TEXT
depth               INTEGER
timestamp           REAL
folder_path         TEXT
proxy_used          TEXT
fingerprint         TEXT
authenticated       BOOLEAN
```

### headers Table
```sql
id                  INTEGER PRIMARY KEY
page_id             INTEGER (FK)
header_type         TEXT (h1-h6)
header_text         TEXT
```

### links Table
```sql
id                  INTEGER PRIMARY KEY
page_id             INTEGER (FK)
link_type           TEXT (internal/external)
url                 TEXT
```

### media Table
```sql
id                  INTEGER PRIMARY KEY
page_id             INTEGER (FK)
src                 TEXT
alt                 TEXT
```

### file_assets Table
```sql
id                  INTEGER PRIMARY KEY
page_id             INTEGER (FK)
file_url            TEXT
file_name           TEXT
file_extension      TEXT
file_size_bytes     INTEGER
local_path          TEXT
download_status     TEXT
download_timestamp  REAL
mime_type           TEXT
```

### custom_extracted_data Table
```sql
id                  INTEGER PRIMARY KEY
page_id             INTEGER (FK)
field_name          TEXT
field_value         TEXT
field_type          TEXT
```

### page_snapshots Table
```sql
id                  INTEGER PRIMARY KEY
url                 TEXT NOT NULL
snapshot_timestamp  REAL
page_id             INTEGER (FK)
content_hash        TEXT
title               TEXT
description         TEXT
full_text_hash      TEXT
header_count        INTEGER
link_count          INTEGER
media_count         INTEGER
file_count          INTEGER
```

### change_log Table
```sql
id                  INTEGER PRIMARY KEY
url                 TEXT
change_timestamp    REAL
previous_snapshot_id INTEGER (FK)
current_snapshot_id INTEGER (FK)
change_type         TEXT
change_category     TEXT
change_summary      TEXT
change_details      TEXT
severity            TEXT
```

### content_diffs Table
```sql
id                  INTEGER PRIMARY KEY
change_log_id       INTEGER (FK)
field_name          TEXT
old_value           TEXT
new_value           TEXT
diff_html           TEXT
similarity_score    REAL
```

---

## Key Features

### 1. Web Crawling
- **BFS Queue-based crawling** with depth limit
- **Duplicate URL detection** via visited set
- **Configurable concurrency** with async/await
- **Automatic URL normalization**
- **Domain constraint** (only crawl same domain)

### 2. Page Scraping
- **Full page content extraction:**
  - Headers (h1-h6)
  - Links (internal/external)
  - Images/videos
  - Structured data (JSON-LD)
  - HTML element tree
  - File assets
  - Custom extracted data
- **Smart scrolling** for lazy-loaded content
- **Screenshot capture** for debugging
- **Error screenshots** on failures

### 3. Change Detection
- **Snapshot-based tracking** - captures page state
- **Content analysis** - detects text/title changes
- **Link monitoring** - tracks additions/removals
- **Media tracking** - monitors images/videos
- **File changes** - detects new/deleted assets
- **Severity levels** - high/medium/low
- **Change history** - full audit trail
- **HTML diffs** - side-by-side comparison

### 4. Data Extraction & Cleaning
- **Rule-based extraction** with JSON configuration
- **CSS selector support** with timeout handling
- **Multiple data types** (text, number, price, date, email, phone, URL, boolean, list)
- **Regex support** for pattern extraction
- **Fallback selectors** for robustness
- **Conditional extraction** based on page state
- **Auto-formatting** (phone numbers, dates, etc.)

### 5. File Management
- **Selective downloading** by extension/type
- **Concurrent downloads** with aiohttp
- **Size validation** - skip too-large files
- **Resume support** - chunk-based transfers
- **MIME type detection** - content-based
- **Local organization** - folder structure by path
- **Retry logic** - configurable attempts

### 6. Authentication
- **Credential injection** - user/pass selectors
- **Session persistence** - auth state files
- **Manual login mode** - user-driven auth
- **Logout detection** - success indicators
- **Multi-step workflows** - form submissions

### 7. Proxy Management
- **Proxy rotation** - round-robin
- **Failure detection** - tracks bad proxies
- **Fallback mode** - continues without proxy
- **Per-request** - applied at browser level

### 8. Fingerprinting
- **Browser randomization:**
  - User agents
  - Viewports
  - Timezones
  - Geolocation
  - Locales
  - Screen resolutions
  - Touch support
- **Stealth mode** - avoid detection

### 9. CAPTCHA Handling
- **Detection** - CSS selector-based
- **Manual solving** - user intervention
- **Notifications** - sound + desktop alerts
- **Worker pause** - pause other crawlers
- **Timeout** - configurable wait

### 10. Logging & Monitoring
- **Structured logging** - categorized by component
- **Debug mode** - detailed information
- **Error tracking** - stack traces
- **Stats collection** - pages, files, times

---

## Usage Examples

### Basic Scraping

```python
from server.scraper import Scraper

scraper = Scraper(
    start_url="https://example.com",
    max_pages=50,
    max_depth=2
)

results = await scraper.scrape()
print(f"Scraped {results['pages_scraped']} pages")
```

### With Custom Extraction

```python
scraper = Scraper("https://amazon.com")

rules = {
    "product_title": {
        "selector": "h1",
        "type": "text"
    },
    "price": {
        "selector": ".product-price",
        "type": "price"
    },
    "rating": {
        "selector": ".star-rating",
        "type": "number"
    }
}

scraper.set_extraction_rules(rules)
results = await scraper.scrape()
```

### With Authentication

```python
scraper = Scraper(
    start_url="https://example.com/members",
    login_url="https://example.com/login",
    username="user@example.com",
    password="secret123",
    username_selector="input[name='email']",
    password_selector="input[name='password']",
    submit_selector="button[type='submit']",
    success_indicator="dashboard"
)

results = await scraper.scrape()
```

### Change Detection

```python
# First run - creates initial snapshot
scraper = Scraper("https://example.com")
await scraper.scrape()

# Later run - detects changes
scraper2 = Scraper("https://example.com")
results = await scraper2.scrape()

# Check change history
history = scraper2.diff_tracker.get_change_history("https://example.com")
for change in history:
    print(f"Change: {change['change_summary']}")
    print(f"Severity: {change['severity']}")
```

### File Downloads

```python
scraper = Scraper(
    start_url="https://example.com/documents",
    download_file_assets=True,
    max_file_size_mb=100
)

results = await scraper.scrape()
print(f"Downloaded {results['files_downloaded']} files")
```

### With Proxy

```python
scraper = Scraper(
    start_url="https://example.com",
    proxy_list=["http://proxy1.com:8080", "http://proxy2.com:8080"]
)

results = await scraper.scrape()
```

---

## API Integration

The Scraper is used by API endpoints in `api.py`:

### POST /api/scraper/start
- Creates Scraper instance
- Configures extraction rules
- Starts async scraping task

### WebSocket /ws/scraper
- Receives periodic status updates from scraper
- Tracks: pages_scraped, queue_size, pages_remaining

### WebSocket /ws/diff
- Receives change notifications
- Clients subscribe to specific URLs
- Updates broadcast when changes detected

### GET /api/extracted-data/{page_id}
- Retrieves extracted data for specific page
- Returns all custom_extracted_data rows

### GET /api/diff/*
- Endpoints to retrieve change history
- Compare snapshots
- Get monitored URLs

---

## Error Handling

### Page Scraping Errors
- **Timeout:** Retries with timeout increase
- **Navigation failed:** Tries alternate proxy
- **Network error:** Marks page as failed, continues
- **Parse error:** Logs and continues (partial data)

### File Download Errors
- **Connection timeout:** Retries (configurable attempts)
- **File too large:** Skips file, logs
- **Invalid path:** Creates folders automatically
- **Permission denied:** Logs error

### Database Errors
- **Insertion conflict:** Updates existing record
- **Integrity violation:** Logs and continues
- **Connection lost:** Reconnects automatically

### CAPTCHA
- **Detected:** Pauses workers, waits for solution
- **Timeout:** Continues without solving (may fail)
- **Manual mode:** Requires user to solve

### Logging
- **DiffTracker logger:** `dt_logger`
- **DataCleaner logger:** `dc_logger`
- **ExtractionEngine logger:** `ee_logger`
- **Scraper logger:** `self.logger`

---

## Performance Considerations

### Optimization Tips

1. **Concurrency:** Increase `concurrent_limit` for fast sites (5-10)
2. **Timeouts:** Adjust for slow sites to avoid retries
3. **Smart scroll:** Reduce `smart_scroll_iterations` if not needed
4. **File size:** Set `max_file_size_mb` appropriately
5. **Extraction:** Only define needed rules
6. **Proxy rotation:** Use proxies for heavy scraping

### Memory Usage
- Browser contexts: ~50MB each (multiplied by concurrent_limit)
- Database: Grows with scraped data (typical: 100MB per 1000 pages)
- Snapshots: ~1KB per page

### Network Usage
- Page fetch: 1-5MB per page
- Files: Configurable max size
- Bandwidth: Main bottleneck at high concurrency

---

## Troubleshooting

### Pages not downloading
- Check `max_pages` and `max_depth` limits
- Verify `start_url` is accessible
- Check browser logs for network errors

### Custom extraction returning null
- Validate CSS selector in browser console
- Check `timeout` is sufficient
- Verify data type matches content

### Files not downloading
- Check `download_file_assets` is True
- Verify file URL is accessible
- Check `max_file_size_mb` limit

### Changes not detected
- Verify `enable_diff_tracking` is True
- Check previous snapshot exists
- Confirm content actually changed

### Performance slow
- Reduce `concurrent_limit` if memory saturates
- Check proxy response times
- Increase `timeout` for slow servers
- Disable Smart scroll if not needed

---

## Version History

### v1.0.0 (2026-02-07)
- Initial release
- DiffTracker for change detection
- DataCleaner for data validation
- ExtractionEngine for rule-based extraction
- Scraper with full feature set
- WebSocket integration
- File download support
- Authentication support
- Proxy rotation
- CAPTCHA handling
- Fingerprinting

