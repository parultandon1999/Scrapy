# Database Architecture Documentation

**File:** `scraped_data.db` (SQLite)  
**Type:** Relational Database  
**Version:** 1.0.0  
**Last Updated:** 2026-02-07

---

## Table of Contents

1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Core Tables](#core-tables)
4. [Change Detection Tables](#change-detection-tables)
5. [Table Relationships](#table-relationships)
6. [Indexes](#indexes)
7. [Data Types & Constraints](#data-types--constraints)
8. [Storage Estimates](#storage-estimates)
9. [Query Examples](#query-examples)
10. [Maintenance & Optimization](#maintenance--optimization)

---

## Overview

The web scraper uses a **SQLite database** to store all scraped data, including:
- Page content and metadata
- Extracted elements (headers, links, media)
- Downloaded file information
- Custom extracted data
- Change detection snapshots
- Historical change logs

### Database Location
```
Default: scraped_data/scraped_data.db
Configurable via: config.DATABASE['db_path']
```

### Key Features
- **Relational structure** with foreign key constraints
- **Indexed queries** for fast lookups
- **Change tracking** with snapshot comparison
- **Full-text storage** for content analysis
- **JSON support** for structured data


---

## Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CORE SCRAPING TABLES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐                                                   │
│  │  pages   │ ◄─────┬─────────────────────────────────┐         │
│  └──────────┘       │                                 │         │
│       │             │                                 │         │
│       │ (1:N)       │ (1:N)                           │         │
│       ▼             ▼                                 ▼         │
│  ┌─────────┐  ┌─────────┐  ┌────────┐  ┌──────────────────┐     │
│  │ headers │  │  links  │  │ media  │  │ structured_data  │     │
│  └─────────┘  └─────────┘  └────────┘  └──────────────────┘     │
│                                                                 │
│       │             │                                           │
│       │ (1:N)       │ (1:N)                                     │
│       ▼             ▼                                           │
│  ┌──────────────┐  ┌──────────────────────┐                     │
│  │html_structure│  │custom_extracted_data │                     │
│  └──────────────┘  └──────────────────────┘                     │
│                                                                 │
│       │                                                         │
│       │ (1:N)                                                   │
│       ▼                                                         │
│  ┌──────────────┐                                               │
│  │ file_assets  │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  CHANGE DETECTION TABLES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐                                             │
│  │ page_snapshots │ ◄──────┬──────────────┐                     │
│  └────────────────┘        │              │                     │
│         │                  │              │                     │
│         │ (1:N)            │ (N:1)        │ (N:1)               │
│         ▼                  │              │                     │
│  ┌────────────┐            │              │                     │
│  │ change_log │ ───────────┴──────────────┘                     │
│  └────────────┘                                                 │
│         │                                                       │
│         │ (1:N)                                                 │
│         ├──────────┬──────────────┬──────────────┐              │
│         ▼          ▼              ▼              ▼              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │content_  │ │  link_   │ │  media_  │ │  (future)│            │
│  │  diffs   │ │ changes  │ │ changes  │ │          │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Tables

### 1. pages

**Purpose:** Primary table storing scraped page metadata and content.

**Schema:**
```sql
CREATE TABLE pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    full_text TEXT,
    depth INTEGER,
    timestamp REAL,
    folder_path TEXT,
    proxy_used TEXT,
    fingerprint TEXT,
    authenticated BOOLEAN
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **url** | TEXT | NO | Page URL (unique constraint) |
| **title** | TEXT | YES | Page title from `<title>` tag |
| **description** | TEXT | YES | Meta description content |
| **full_text** | TEXT | YES | Complete page text content |
| **depth** | INTEGER | YES | Crawl depth from start URL (0 = start page) |
| **timestamp** | REAL | YES | Unix timestamp when scraped |
| **folder_path** | TEXT | YES | Local folder path for saved files |
| **proxy_used** | TEXT | YES | Proxy server used for this page |
| **fingerprint** | TEXT | YES | JSON of browser fingerprint used |
| **authenticated** | BOOLEAN | YES | Whether page was scraped with authentication |

**Constraints:**
- `UNIQUE(url)`: Prevents duplicate page entries
- `PRIMARY KEY(id)`: Unique identifier

**Indexes:**
- Primary key index on `id` (automatic)
- Unique index on `url` (automatic)

**Example Data:**
```sql
INSERT INTO pages VALUES (
    1,
    'https://example.com/products',
    'Products - Example Store',
    'Browse our product catalog',
    'Welcome to our store. Products include...',
    1,
    1707309045.123,
    'scraped_data/example_com/products',
    'http://proxy.example.com:8080',
    '{"viewport": {"width": 1920, "height": 1080}, "user_agent": "..."}',
    0
);
```

**Usage:**
- Central table referenced by all other tables
- Used for deduplication (URL uniqueness)
- Stores complete page content for full-text search


---

### 2. headers

**Purpose:** Stores all heading elements (h1-h6) extracted from pages.

**Schema:**
```sql
CREATE TABLE headers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    header_type TEXT,
    header_text TEXT,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **header_type** | TEXT | YES | Header level: h1, h2, h3, h4, h5, h6 |
| **header_text** | TEXT | YES | Text content of the header |

**Relationships:**
- `page_id` → `pages.id` (Many-to-One)

**Example Data:**
```sql
INSERT INTO headers VALUES (1, 1, 'h1', 'Welcome to Our Store');
INSERT INTO headers VALUES (2, 1, 'h2', 'Featured Products');
INSERT INTO headers VALUES (3, 1, 'h2', 'Customer Reviews');
```

**Usage:**
- Content structure analysis
- SEO analysis (h1 count, hierarchy)
- Change detection (header count changes)

---

### 3. links

**Purpose:** Stores all hyperlinks found on scraped pages.

**Schema:**
```sql
CREATE TABLE links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    link_type TEXT,
    url TEXT,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **link_type** | TEXT | YES | 'internal' or 'external' |
| **url** | TEXT | YES | Link destination URL |

**Link Types:**
- **internal**: Links to same domain
- **external**: Links to different domains

**Example Data:**
```sql
INSERT INTO links VALUES (1, 1, 'internal', 'https://example.com/about');
INSERT INTO links VALUES (2, 1, 'external', 'https://partner.com');
INSERT INTO links VALUES (3, 1, 'internal', 'https://example.com/contact');
```

**Usage:**
- Crawl queue population (internal links)
- Backlink analysis
- Broken link detection
- Change detection (link additions/removals)

---

### 4. media

**Purpose:** Stores image and video elements from pages.

**Schema:**
```sql
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    src TEXT,
    alt TEXT,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **src** | TEXT | YES | Image/video source URL |
| **alt** | TEXT | YES | Alt text (accessibility description) |

**Example Data:**
```sql
INSERT INTO media VALUES (1, 1, 'https://example.com/images/logo.png', 'Company Logo');
INSERT INTO media VALUES (2, 1, 'https://example.com/images/product1.jpg', 'Product Image');
```

**Usage:**
- Media inventory
- Accessibility audits (alt text presence)
- Change detection (media additions/removals)
- Asset downloading

---

### 5. structured_data

**Purpose:** Stores JSON-LD and structured data from pages.

**Schema:**
```sql
CREATE TABLE structured_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    json_data TEXT,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **json_data** | TEXT | YES | JSON-LD structured data as text |

**Example Data:**
```sql
INSERT INTO structured_data VALUES (
    1, 
    1, 
    '{"@context": "https://schema.org", "@type": "Product", "name": "Widget", "price": "19.99"}'
);
```

**Usage:**
- Extract rich snippets
- Product/article metadata
- SEO analysis
- Structured data validation

---

### 6. html_structure

**Purpose:** Stores DOM element tree structure for advanced analysis.

**Schema:**
```sql
CREATE TABLE html_structure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    tag_name TEXT,
    selector TEXT,
    text_content TEXT,
    attributes TEXT,
    parent_selector TEXT,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **tag_name** | TEXT | YES | HTML tag name (div, span, etc.) |
| **selector** | TEXT | YES | CSS selector for this element |
| **text_content** | TEXT | YES | Text content of element |
| **attributes** | TEXT | YES | JSON of element attributes |
| **parent_selector** | TEXT | YES | CSS selector of parent element |

**Example Data:**
```sql
INSERT INTO html_structure VALUES (
    1, 
    1, 
    'div', 
    'div.product-card', 
    'Product Name $19.99',
    '{"class": "product-card", "data-id": "123"}',
    'div.products-container'
);
```

**Usage:**
- DOM structure analysis
- Selector generation
- Template detection
- Layout change detection


---

### 7. file_assets

**Purpose:** Tracks downloaded files (PDFs, documents, archives, etc.).

**Schema:**
```sql
CREATE TABLE file_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    file_url TEXT,
    file_name TEXT,
    file_extension TEXT,
    file_size_bytes INTEGER,
    local_path TEXT,
    download_status TEXT,
    download_timestamp REAL,
    mime_type TEXT,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **file_url** | TEXT | YES | Original file URL |
| **file_name** | TEXT | YES | Original filename |
| **file_extension** | TEXT | YES | File extension (.pdf, .docx, etc.) |
| **file_size_bytes** | INTEGER | YES | File size in bytes |
| **local_path** | TEXT | YES | Local filesystem path |
| **download_status** | TEXT | YES | 'success', 'failed', 'skipped' |
| **download_timestamp** | REAL | YES | Unix timestamp of download |
| **mime_type** | TEXT | YES | MIME type (application/pdf, etc.) |

**Download Status Values:**
- **success**: File downloaded successfully
- **failed**: Download failed (network error, timeout)
- **skipped**: File skipped (too large, wrong extension)

**Example Data:**
```sql
INSERT INTO file_assets VALUES (
    1,
    1,
    'https://example.com/docs/manual.pdf',
    'manual.pdf',
    '.pdf',
    2048576,
    'scraped_data/example_com/products/manual.pdf',
    'success',
    1707309045.456,
    'application/pdf'
);
```

**Usage:**
- File inventory management
- Download statistics
- File type analysis
- Storage space tracking
- Change detection (file availability)

---

### 8. custom_extracted_data

**Purpose:** Stores data extracted using custom extraction rules.

**Schema:**
```sql
CREATE TABLE custom_extracted_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    field_name TEXT,
    field_value TEXT,
    field_type TEXT,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **field_name** | TEXT | YES | Name of extracted field |
| **field_value** | TEXT | YES | Extracted value (as text) |
| **field_type** | TEXT | YES | Data type (text, number, price, date, etc.) |

**Field Types:**
- text, number, price, integer, date, email, phone, url, boolean, list

**Example Data:**
```sql
INSERT INTO custom_extracted_data VALUES (1, 1, 'product_name', 'Premium Widget', 'text');
INSERT INTO custom_extracted_data VALUES (2, 1, 'price', '19.99', 'price');
INSERT INTO custom_extracted_data VALUES (3, 1, 'in_stock', 'true', 'boolean');
INSERT INTO custom_extracted_data VALUES (4, 1, 'rating', '4.5', 'number');
```

**Usage:**
- Store rule-based extraction results
- Product catalogs
- Price monitoring
- Contact information extraction
- Custom data analysis

---

## Change Detection Tables

### 9. page_snapshots

**Purpose:** Stores snapshots of page state for change detection.

**Schema:**
```sql
CREATE TABLE page_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    snapshot_timestamp REAL NOT NULL,
    page_id INTEGER,
    content_hash TEXT,
    title TEXT,
    description TEXT,
    full_text_hash TEXT,
    header_count INTEGER,
    link_count INTEGER,
    media_count INTEGER,
    file_count INTEGER,
    FOREIGN KEY (page_id) REFERENCES pages(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **url** | TEXT | NO | Page URL being monitored |
| **snapshot_timestamp** | REAL | NO | Unix timestamp of snapshot |
| **page_id** | INTEGER | YES | Foreign key to pages table |
| **content_hash** | TEXT | YES | SHA256 hash of title+description |
| **title** | TEXT | YES | Page title at snapshot time |
| **description** | TEXT | YES | Page description at snapshot time |
| **full_text_hash** | TEXT | YES | SHA256 hash of full page text |
| **header_count** | INTEGER | YES | Number of headers at snapshot time |
| **link_count** | INTEGER | YES | Number of links at snapshot time |
| **media_count** | INTEGER | YES | Number of media items at snapshot time |
| **file_count** | INTEGER | YES | Number of files at snapshot time |

**Indexes:**
```sql
CREATE INDEX idx_snapshots_url ON page_snapshots(url);
CREATE INDEX idx_snapshots_timestamp ON page_snapshots(snapshot_timestamp);
```

**Example Data:**
```sql
INSERT INTO page_snapshots VALUES (
    1,
    'https://example.com/products',
    1707309045.123,
    1,
    'a1b2c3d4e5f6...',
    'Products - Example Store',
    'Browse our product catalog',
    'f6e5d4c3b2a1...',
    15,
    42,
    18,
    3
);
```

**Usage:**
- Baseline for change detection
- Historical page state tracking
- Snapshot comparison
- Rollback reference

---

### 10. change_log

**Purpose:** Records detected changes between snapshots.

**Schema:**
```sql
CREATE TABLE change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    change_timestamp REAL NOT NULL,
    previous_snapshot_id INTEGER,
    current_snapshot_id INTEGER,
    change_type TEXT,
    change_category TEXT,
    change_summary TEXT,
    change_details TEXT,
    severity TEXT,
    FOREIGN KEY (previous_snapshot_id) REFERENCES page_snapshots(id),
    FOREIGN KEY (current_snapshot_id) REFERENCES page_snapshots(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **url** | TEXT | NO | URL where change was detected |
| **change_timestamp** | REAL | NO | Unix timestamp of change detection |
| **previous_snapshot_id** | INTEGER | YES | FK to previous snapshot |
| **current_snapshot_id** | INTEGER | YES | FK to current snapshot |
| **change_type** | TEXT | YES | Type: content, links, media, files, structure |
| **change_category** | TEXT | YES | Category: title, description, added, removed, etc. |
| **change_summary** | TEXT | YES | Human-readable summary |
| **change_details** | TEXT | YES | JSON with detailed change information |
| **severity** | TEXT | YES | Severity: high, medium, low |

**Change Types:**
- **content**: Text/title/description changes
- **links**: Link additions/removals
- **media**: Image/video changes
- **files**: File availability changes
- **structure**: Header count, layout changes

**Severity Levels:**
- **high**: Major content changes, file removals
- **medium**: Title changes, link removals, file additions
- **low**: Description changes, link additions, media changes

**Indexes:**
```sql
CREATE INDEX idx_changelog_url ON change_log(url);
CREATE INDEX idx_changelog_timestamp ON change_log(change_timestamp);
```

**Example Data:**
```sql
INSERT INTO change_log VALUES (
    1,
    'https://example.com/products',
    1707309845.789,
    1,
    2,
    'content',
    'title',
    'Page title changed',
    '{"old": "Products", "new": "All Products"}',
    'medium'
);
```

**Usage:**
- Change history tracking
- Alert generation
- Audit trail
- Compliance monitoring


---

### 11. content_diffs

**Purpose:** Stores detailed content differences with HTML diffs.

**Schema:**
```sql
CREATE TABLE content_diffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_log_id INTEGER,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    diff_html TEXT,
    similarity_score REAL,
    FOREIGN KEY (change_log_id) REFERENCES change_log(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **change_log_id** | INTEGER | YES | Foreign key to change_log table |
| **field_name** | TEXT | YES | Field that changed (title, description, full_text) |
| **old_value** | TEXT | YES | Previous value |
| **new_value** | TEXT | YES | New value |
| **diff_html** | TEXT | YES | HTML diff table for visualization |
| **similarity_score** | REAL | YES | Similarity ratio (0.0 to 1.0) |

**Similarity Score:**
- 1.0 = Identical
- 0.95-0.99 = Very similar (minor changes)
- 0.70-0.94 = Moderately similar
- 0.0-0.69 = Very different

**Example Data:**
```sql
INSERT INTO content_diffs VALUES (
    1,
    1,
    'title',
    'Products - Example Store',
    'All Products - Example Store',
    '<table class="diff">...</table>',
    0.92
);
```

**Usage:**
- Side-by-side comparison
- Change visualization
- Content similarity analysis
- Detailed audit trail

---

### 12. link_changes

**Purpose:** Tracks specific link additions and removals.

**Schema:**
```sql
CREATE TABLE link_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_log_id INTEGER,
    link_url TEXT,
    link_type TEXT,
    change_action TEXT,
    FOREIGN KEY (change_log_id) REFERENCES change_log(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **change_log_id** | INTEGER | YES | Foreign key to change_log table |
| **link_url** | TEXT | YES | URL of the link that changed |
| **link_type** | TEXT | YES | 'internal' or 'external' |
| **change_action** | TEXT | YES | 'added' or 'removed' |

**Example Data:**
```sql
INSERT INTO link_changes VALUES (1, 1, 'https://example.com/new-page', 'internal', 'added');
INSERT INTO link_changes VALUES (2, 1, 'https://example.com/old-page', 'internal', 'removed');
```

**Usage:**
- Track navigation changes
- Detect broken links
- Monitor external link additions
- SEO impact analysis

---

### 13. media_changes

**Purpose:** Tracks image and video additions/removals.

**Schema:**
```sql
CREATE TABLE media_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_log_id INTEGER,
    media_src TEXT,
    media_alt TEXT,
    change_action TEXT,
    FOREIGN KEY (change_log_id) REFERENCES change_log(id)
)
```

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | INTEGER | NO | Primary key, auto-increment |
| **change_log_id** | INTEGER | YES | Foreign key to change_log table |
| **media_src** | TEXT | YES | Media source URL |
| **media_alt** | TEXT | YES | Alt text of media |
| **change_action** | TEXT | YES | 'added' or 'removed' |

**Example Data:**
```sql
INSERT INTO media_changes VALUES (
    1, 
    1, 
    'https://example.com/images/new-banner.jpg', 
    'New Banner Image',
    'added'
);
```

**Usage:**
- Visual content monitoring
- Image inventory changes
- Marketing campaign tracking
- Accessibility compliance

---

## Table Relationships

### Entity Relationship Diagram

```
pages (1) ──────< (N) headers
      (1) ──────< (N) links
      (1) ──────< (N) media
      (1) ──────< (N) structured_data
      (1) ──────< (N) html_structure
      (1) ──────< (N) file_assets
      (1) ──────< (N) custom_extracted_data
      (1) ──────< (N) page_snapshots

page_snapshots (1) ──────< (N) change_log (previous_snapshot_id)
               (1) ──────< (N) change_log (current_snapshot_id)

change_log (1) ──────< (N) content_diffs
           (1) ──────< (N) link_changes
           (1) ──────< (N) media_changes
```

### Relationship Summary

| Parent Table | Child Table | Relationship | Cascade |
|--------------|-------------|--------------|---------|
| pages | headers | 1:N | No |
| pages | links | 1:N | No |
| pages | media | 1:N | No |
| pages | structured_data | 1:N | No |
| pages | html_structure | 1:N | No |
| pages | file_assets | 1:N | No |
| pages | custom_extracted_data | 1:N | No |
| pages | page_snapshots | 1:N | No |
| page_snapshots | change_log | 1:N (×2) | No |
| change_log | content_diffs | 1:N | No |
| change_log | link_changes | 1:N | No |
| change_log | media_changes | 1:N | No |

**Note:** Foreign key constraints are defined but CASCADE DELETE is not enabled. Manual cleanup required when deleting pages.

---

## Indexes

### Automatic Indexes

SQLite automatically creates indexes for:
- Primary keys (all tables)
- Unique constraints (`pages.url`)

### Custom Indexes

```sql
-- Page snapshots indexes
CREATE INDEX idx_snapshots_url ON page_snapshots(url);
CREATE INDEX idx_snapshots_timestamp ON page_snapshots(snapshot_timestamp);

-- Change log indexes
CREATE INDEX idx_changelog_url ON change_log(url);
CREATE INDEX idx_changelog_timestamp ON change_log(change_timestamp);
```

### Index Usage

| Index | Purpose | Query Benefit |
|-------|---------|---------------|
| `idx_snapshots_url` | Find snapshots by URL | Fast snapshot lookup for change detection |
| `idx_snapshots_timestamp` | Time-based queries | Historical snapshot retrieval |
| `idx_changelog_url` | Find changes by URL | Quick change history lookup |
| `idx_changelog_timestamp` | Time-based queries | Recent changes, timeline analysis |

### Performance Impact

- **Read Performance**: 10-100× faster for indexed queries
- **Write Performance**: ~5-10% slower due to index maintenance
- **Storage**: ~10-20% additional space for indexes

---

## Data Types & Constraints

### SQLite Data Types

| Type | Description | Example |
|------|-------------|---------|
| **INTEGER** | Signed integer | 1, 42, -10 |
| **REAL** | Floating point | 1707309045.123, 0.95 |
| **TEXT** | String | 'https://example.com' |
| **BOOLEAN** | Integer (0 or 1) | 0 (false), 1 (true) |

### Timestamp Format

All timestamps use **Unix epoch time** (seconds since 1970-01-01):
```python
timestamp = time.time()  # 1707309045.123456
```

**Conversion to human-readable:**
```sql
SELECT datetime(timestamp, 'unixepoch') FROM pages;
-- Result: '2026-02-07 10:30:45'
```

### JSON Storage

JSON data is stored as TEXT:
```sql
-- structured_data.json_data
'{"@context": "https://schema.org", "@type": "Product"}'

-- html_structure.attributes
'{"class": "product-card", "data-id": "123"}'

-- pages.fingerprint
'{"viewport": {"width": 1920, "height": 1080}}'
```

**Querying JSON (SQLite 3.38+):**
```sql
SELECT json_extract(json_data, '$.name') FROM structured_data;
```

### Constraints Summary

| Table | Constraint | Type | Purpose |
|-------|-----------|------|---------|
| pages | url | UNIQUE | Prevent duplicate pages |
| pages | id | PRIMARY KEY | Unique identifier |
| All child tables | page_id | FOREIGN KEY | Referential integrity |
| page_snapshots | url | NOT NULL | Required field |
| change_log | url | NOT NULL | Required field |


---

## Storage Estimates

### Per-Page Storage

**Typical page (medium complexity):**

| Table | Rows | Size per Row | Total |
|-------|------|--------------|-------|
| pages | 1 | ~5 KB | 5 KB |
| headers | 10 | ~100 B | 1 KB |
| links | 50 | ~150 B | 7.5 KB |
| media | 20 | ~200 B | 4 KB |
| structured_data | 2 | ~500 B | 1 KB |
| html_structure | 100 | ~300 B | 30 KB |
| file_assets | 3 | ~300 B | 1 KB |
| custom_extracted_data | 5 | ~200 B | 1 KB |
| **Total per page** | | | **~50 KB** |

### Change Detection Storage

**Per snapshot:**
- page_snapshots: ~500 B
- change_log: ~300 B (if changes detected)
- content_diffs: ~2 KB (with HTML diff)
- link_changes: ~150 B per link
- media_changes: ~200 B per media

**Typical change event:** ~5-10 KB

### Database Size Projections

| Pages Scraped | Base Data | With Changes (10%) | Total Estimate |
|---------------|-----------|-------------------|----------------|
| 100 | 5 MB | +1 MB | **6 MB** |
| 1,000 | 50 MB | +10 MB | **60 MB** |
| 10,000 | 500 MB | +100 MB | **600 MB** |
| 100,000 | 5 GB | +1 GB | **6 GB** |

**Factors affecting size:**
- Page complexity (more elements = larger)
- Full text length
- Number of snapshots per page
- Change frequency
- File asset metadata

### Optimization Tips

**Reduce database size:**
1. Disable `full_text` storage if not needed
2. Limit `html_structure` depth
3. Clean old snapshots periodically
4. Use `VACUUM` to reclaim space
5. Archive old data to separate database

**Example cleanup:**
```sql
-- Delete snapshots older than 30 days
DELETE FROM page_snapshots 
WHERE snapshot_timestamp < (strftime('%s', 'now') - 2592000);

-- Reclaim space
VACUUM;
```

---

## Query Examples

### Basic Queries

**Get all pages:**
```sql
SELECT id, url, title, depth, datetime(timestamp, 'unixepoch') as scraped_at
FROM pages
ORDER BY timestamp DESC
LIMIT 20;
```

**Get page with all details:**
```sql
SELECT 
    p.*,
    COUNT(DISTINCT h.id) as header_count,
    COUNT(DISTINCT l.id) as link_count,
    COUNT(DISTINCT m.id) as media_count,
    COUNT(DISTINCT f.id) as file_count
FROM pages p
LEFT JOIN headers h ON p.id = h.page_id
LEFT JOIN links l ON p.id = l.page_id
LEFT JOIN media m ON p.id = m.page_id
LEFT JOIN file_assets f ON p.id = f.page_id
WHERE p.id = 1
GROUP BY p.id;
```

**Search page content:**
```sql
SELECT url, title, full_text
FROM pages
WHERE full_text LIKE '%keyword%'
ORDER BY timestamp DESC;
```

### Analytics Queries

**Pages by depth:**
```sql
SELECT depth, COUNT(*) as page_count
FROM pages
GROUP BY depth
ORDER BY depth;
```

**Link type distribution:**
```sql
SELECT link_type, COUNT(*) as count
FROM links
GROUP BY link_type;
```

**File downloads by extension:**
```sql
SELECT 
    file_extension,
    COUNT(*) as total_files,
    SUM(CASE WHEN download_status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(file_size_bytes) as total_bytes,
    ROUND(SUM(file_size_bytes) / 1024.0 / 1024.0, 2) as total_mb
FROM file_assets
GROUP BY file_extension
ORDER BY total_files DESC;
```

**Top domains scraped:**
```sql
SELECT 
    SUBSTR(url, 1, INSTR(SUBSTR(url, 9), '/') + 8) as domain,
    COUNT(*) as page_count,
    MIN(timestamp) as first_scraped,
    MAX(timestamp) as last_scraped
FROM pages
GROUP BY domain
ORDER BY page_count DESC;
```

### Change Detection Queries

**Get monitored URLs with change counts:**
```sql
SELECT 
    url,
    COUNT(*) as total_changes,
    MAX(change_timestamp) as last_change,
    datetime(MAX(change_timestamp), 'unixepoch') as last_change_date,
    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity
FROM change_log
GROUP BY url
ORDER BY last_change DESC;
```

**Get change history for URL:**
```sql
SELECT 
    cl.id,
    cl.change_type,
    cl.change_category,
    cl.change_summary,
    cl.severity,
    datetime(cl.change_timestamp, 'unixepoch') as change_date,
    ps_prev.title as previous_title,
    ps_curr.title as current_title
FROM change_log cl
LEFT JOIN page_snapshots ps_prev ON cl.previous_snapshot_id = ps_prev.id
LEFT JOIN page_snapshots ps_curr ON cl.current_snapshot_id = ps_curr.id
WHERE cl.url = 'https://example.com'
ORDER BY cl.change_timestamp DESC
LIMIT 10;
```

**Get content diffs for a change:**
```sql
SELECT 
    cd.field_name,
    cd.old_value,
    cd.new_value,
    cd.similarity_score,
    ROUND(cd.similarity_score * 100, 1) as similarity_percent
FROM content_diffs cd
WHERE cd.change_log_id = 1;
```

**Recent high-severity changes:**
```sql
SELECT 
    url,
    change_summary,
    datetime(change_timestamp, 'unixepoch') as when_detected
FROM change_log
WHERE severity = 'high'
ORDER BY change_timestamp DESC
LIMIT 20;
```

### Custom Extraction Queries

**Get extracted data for page:**
```sql
SELECT 
    field_name,
    field_value,
    field_type
FROM custom_extracted_data
WHERE page_id = 1
ORDER BY field_name;
```

**Aggregate extracted prices:**
```sql
SELECT 
    p.url,
    ced.field_value as price
FROM custom_extracted_data ced
JOIN pages p ON ced.page_id = p.id
WHERE ced.field_name = 'price'
  AND ced.field_type = 'price'
ORDER BY CAST(ced.field_value AS REAL) DESC;
```

### Advanced Queries

**Pages with most links:**
```sql
SELECT 
    p.url,
    p.title,
    COUNT(l.id) as link_count
FROM pages p
JOIN links l ON p.id = l.page_id
GROUP BY p.id
ORDER BY link_count DESC
LIMIT 10;
```

**Find broken links (pages that link to non-existent pages):**
```sql
SELECT DISTINCT l.url as broken_link
FROM links l
WHERE l.link_type = 'internal'
  AND l.url NOT IN (SELECT url FROM pages);
```

**Pages with no images:**
```sql
SELECT p.url, p.title
FROM pages p
LEFT JOIN media m ON p.id = m.page_id
WHERE m.id IS NULL;
```

**Snapshot comparison:**
```sql
SELECT 
    ps1.title as old_title,
    ps2.title as new_title,
    ps1.header_count as old_headers,
    ps2.header_count as new_headers,
    ps1.link_count as old_links,
    ps2.link_count as new_links
FROM page_snapshots ps1
JOIN page_snapshots ps2 ON ps1.url = ps2.url
WHERE ps1.id = 1 AND ps2.id = 2;
```

---

## Maintenance & Optimization

### Regular Maintenance Tasks

**1. Vacuum Database (Reclaim Space)**
```sql
VACUUM;
```
- Run after large deletions
- Reduces file size
- Rebuilds indexes
- Can take several minutes on large databases

**2. Analyze Statistics**
```sql
ANALYZE;
```
- Updates query optimizer statistics
- Run after significant data changes
- Improves query performance

**3. Check Integrity**
```sql
PRAGMA integrity_check;
```
- Verifies database integrity
- Detects corruption
- Run periodically (weekly/monthly)

### Cleanup Strategies

**Delete old snapshots:**
```sql
-- Keep only last 5 snapshots per URL
DELETE FROM page_snapshots
WHERE id NOT IN (
    SELECT id FROM page_snapshots ps
    WHERE ps.url = page_snapshots.url
    ORDER BY snapshot_timestamp DESC
    LIMIT 5
);
```

**Delete old change logs:**
```sql
-- Delete changes older than 90 days
DELETE FROM change_log
WHERE change_timestamp < (strftime('%s', 'now') - 7776000);
```

**Archive old pages:**
```sql
-- Export to archive database
ATTACH DATABASE 'archive.db' AS archive;

INSERT INTO archive.pages
SELECT * FROM pages
WHERE timestamp < (strftime('%s', 'now') - 31536000);

DELETE FROM pages
WHERE timestamp < (strftime('%s', 'now') - 31536000);

DETACH DATABASE archive;
```

### Performance Optimization

**1. Add indexes for common queries:**
```sql
-- If frequently filtering by depth
CREATE INDEX idx_pages_depth ON pages(depth);

-- If frequently filtering by timestamp
CREATE INDEX idx_pages_timestamp ON pages(timestamp);

-- If frequently joining on page_id
CREATE INDEX idx_headers_page_id ON headers(page_id);
CREATE INDEX idx_links_page_id ON links(page_id);
```

**2. Use prepared statements:**
```python
# Good (prepared statement)
cursor.execute("SELECT * FROM pages WHERE url = ?", (url,))

# Bad (string concatenation - SQL injection risk)
cursor.execute(f"SELECT * FROM pages WHERE url = '{url}'")
```

**3. Batch inserts:**
```python
# Good (batch insert)
cursor.executemany(
    "INSERT INTO headers VALUES (?, ?, ?, ?)",
    [(None, page_id, 'h1', 'Title 1'), (None, page_id, 'h2', 'Title 2')]
)

# Bad (individual inserts)
for header in headers:
    cursor.execute("INSERT INTO headers VALUES (?, ?, ?, ?)", header)
```

**4. Use transactions:**
```python
# Good (single transaction)
conn.execute("BEGIN")
# ... multiple operations ...
conn.commit()

# Bad (auto-commit each operation)
# ... operations without explicit transaction ...
```

### Backup Strategies

**1. File-based backup:**
```bash
# Simple copy (database must be idle)
cp scraped_data.db scraped_data_backup.db

# With timestamp
cp scraped_data.db "scraped_data_$(date +%Y%m%d_%H%M%S).db"
```

**2. SQL dump:**
```bash
sqlite3 scraped_data.db .dump > backup.sql
```

**3. Incremental backup:**
```python
import sqlite3
import shutil

# Backup using SQLite backup API
source = sqlite3.connect('scraped_data.db')
backup = sqlite3.connect('backup.db')
source.backup(backup)
backup.close()
source.close()
```

**4. Automated backup script:**
```python
import sqlite3
import os
from datetime import datetime

def backup_database():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = 'backups'
    os.makedirs(backup_dir, exist_ok=True)
    
    source = sqlite3.connect('scraped_data.db')
    backup_path = f'{backup_dir}/scraped_data_{timestamp}.db'
    backup = sqlite3.connect(backup_path)
    
    source.backup(backup)
    
    backup.close()
    source.close()
    
    print(f"Backup created: {backup_path}")
    
    # Keep only last 7 backups
    backups = sorted([f for f in os.listdir(backup_dir) if f.endswith('.db')])
    for old_backup in backups[:-7]:
        os.remove(os.path.join(backup_dir, old_backup))
```

### Monitoring

**Database size:**
```python
import os
db_size = os.path.getsize('scraped_data.db')
print(f"Database size: {db_size / 1024 / 1024:.2f} MB")
```

**Table row counts:**
```sql
SELECT 
    'pages' as table_name, COUNT(*) as row_count FROM pages
UNION ALL
SELECT 'headers', COUNT(*) FROM headers
UNION ALL
SELECT 'links', COUNT(*) FROM links
UNION ALL
SELECT 'media', COUNT(*) FROM media
UNION ALL
SELECT 'file_assets', COUNT(*) FROM file_assets
UNION ALL
SELECT 'page_snapshots', COUNT(*) FROM page_snapshots
UNION ALL
SELECT 'change_log', COUNT(*) FROM change_log;
```

**Table sizes:**
```sql
SELECT 
    name,
    SUM(pgsize) as size_bytes,
    ROUND(SUM(pgsize) / 1024.0 / 1024.0, 2) as size_mb
FROM dbstat
GROUP BY name
ORDER BY size_bytes DESC;
```

---

## Best Practices

### 1. Data Integrity
- Always use foreign key constraints
- Validate data before insertion
- Use transactions for multi-table operations
- Handle NULL values appropriately

### 2. Performance
- Create indexes for frequently queried columns
- Use LIMIT for large result sets
- Avoid SELECT * in production queries
- Use prepared statements for repeated queries

### 3. Security
- Never concatenate user input into SQL
- Use parameterized queries (? placeholders)
- Validate and sanitize all inputs
- Restrict database file permissions

### 4. Scalability
- Archive old data regularly
- Partition large tables if needed
- Monitor database size growth
- Plan for migration to PostgreSQL/MySQL if exceeding 100GB

### 5. Maintenance
- Run VACUUM monthly
- Run ANALYZE after bulk operations
- Check integrity quarterly
- Backup before major operations

---

## Troubleshooting

### Common Issues

**1. Database locked error:**
```
sqlite3.OperationalError: database is locked
```
**Solution:**
- Close all connections before writing
- Use WAL mode: `PRAGMA journal_mode=WAL;`
- Increase timeout: `conn.timeout = 30`

**2. Slow queries:**
**Solution:**
- Add indexes for WHERE/JOIN columns
- Use EXPLAIN QUERY PLAN to analyze
- Reduce result set with LIMIT
- Optimize complex JOINs

**3. Large database size:**
**Solution:**
- Run VACUUM to reclaim space
- Archive old data
- Disable full_text storage
- Limit snapshot retention

**4. Corruption:**
```
sqlite3.DatabaseError: database disk image is malformed
```
**Solution:**
- Restore from backup
- Try: `sqlite3 scraped_data.db ".recover" | sqlite3 recovered.db`
- Check disk space and permissions

---

## Migration Guide

### Exporting Data

**To CSV:**
```bash
sqlite3 -header -csv scraped_data.db "SELECT * FROM pages;" > pages.csv
```

**To JSON:**
```python
import sqlite3
import json

conn = sqlite3.connect('scraped_data.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT * FROM pages")
rows = [dict(row) for row in cursor.fetchall()]

with open('pages.json', 'w') as f:
    json.dump(rows, f, indent=2)
```

### Migrating to PostgreSQL

```python
import sqlite3
import psycopg2

# Connect to both databases
sqlite_conn = sqlite3.connect('scraped_data.db')
pg_conn = psycopg2.connect("dbname=scraper user=postgres")

# Migrate pages table
sqlite_cursor = sqlite_conn.cursor()
pg_cursor = pg_conn.cursor()

sqlite_cursor.execute("SELECT * FROM pages")
for row in sqlite_cursor.fetchall():
    pg_cursor.execute(
        "INSERT INTO pages VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        row
    )

pg_conn.commit()
```

---

## Conclusion

This database architecture provides:
- **Comprehensive data storage** for all scraped content
- **Flexible schema** supporting various data types
- **Change detection** with historical tracking
- **Scalable design** for thousands of pages
- **Query optimization** through strategic indexing
- **Data integrity** via foreign key constraints

For questions or issues, refer to the API documentation (`api_doc.md`) and scraper documentation (`scraper_doc.md`).

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-07  
**Database Schema Version:** 1.0.0
