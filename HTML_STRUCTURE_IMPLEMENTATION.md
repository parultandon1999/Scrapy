# HTML Structure Feature Implementation

## Overview
Successfully implemented a feature to extract, store, and display HTML structure with CSS selectors for each scraped page.

## What Was Implemented

### 1. Database Schema (server/scraper.py)
- Created `html_structure` table with columns:
  - `page_id`: Foreign key to pages table
  - `tag_name`: HTML tag (h1, p, div, etc.)
  - `selector`: CSS selector to uniquely identify the element
  - `text_content`: Text content of the element (limited to 200 chars)
  - `attributes`: JSON string of element attributes (id, class, etc.)
  - `parent_selector`: CSS selector of parent element

### 2. HTML Structure Extraction (server/scraper.py)
- Added `extract_html_structure()` function that:
  - Uses JavaScript to extract elements from the page
  - Generates CSS selectors using IDs, classes, and nth-child
  - Extracts important elements: h1-h6, p, a, button, input, div, section, etc.
  - Limits to 500 elements per page to avoid huge data
  - Skips hidden elements (display: none, visibility: hidden)
  - Captures element attributes, text content, and parent relationships

### 3. Data Storage (server/scraper.py)
- HTML structure is extracted during scraping
- Saved to database in `extract_and_save_data()` function
- Attributes are stored as JSON strings

### 4. API Endpoint (server/api.py)
- Updated `/api/data/page/{page_id}` endpoint
- Returns `html_structure` array with page details
- Limited to 500 elements per request

### 5. Frontend Display (client/src/pages/ScrapingProgress.jsx)
- Added HTML Structure section in detailed view page
- Displays after File Assets section, before Full Text Preview
- Features:
  - Filter/search input box to find specific elements
  - List of elements showing:
    - Tag name badge (color-coded)
    - CSS selector (monospace font)
    - Text content (if available)
    - Attributes (id and class)
    - Parent selector
  - Real-time filtering by tag, selector, or content
  - Scrollable list (max-height: 600px)

### 6. Styling (client/src/styles/ScrapingProgress.css)
- Added comprehensive styles for HTML structure component:
  - `.html-structure-container`: Main container
  - `.html-structure-filters`: Filter section
  - `.html-structure-search`: Search input
  - `.html-structure-list`: Scrollable list
  - `.html-structure-item`: Individual element card
  - `.html-tag-badge`: Tag name badge
  - `.html-selector`: CSS selector display
  - `.html-content`: Text content display
  - `.html-attributes`: Attributes display
  - `.html-parent`: Parent selector display
  - Dark mode support
  - Responsive design for mobile
  - Custom scrollbar styling

## How It Works

1. **During Scraping**: When a page is scraped, the `extract_html_structure()` function runs JavaScript in the browser to extract elements and generate CSS selectors.

2. **Storage**: The extracted structure is saved to the `html_structure` table in SQLite database.

3. **Retrieval**: When viewing page details, the API fetches the HTML structure along with other page data.

4. **Display**: The frontend renders the structure in a filterable list, showing each element's tag, selector, content, and attributes.

## Usage

1. **Scrape a website**: Start a new scraping job
2. **View page details**: Click "View Full Details" on any scraped page
3. **Find HTML structure**: Scroll to the "HTML Structure & Selectors" section
4. **Filter elements**: Use the search box to filter by tag name, selector, or content
5. **Inspect elements**: View the CSS selector, content, attributes, and parent for each element

## Benefits

- **Selector Discovery**: Easily find CSS selectors for specific elements
- **Page Structure Analysis**: Understand the HTML structure of scraped pages
- **Automation**: Use selectors for automated testing or further scraping
- **Debugging**: Identify elements and their relationships
- **Documentation**: Document page structure for reference

## Technical Details

- **Selector Generation**: Uses IDs first, then classes, then nth-child for uniqueness
- **Performance**: Limited to 500 elements per page to avoid performance issues
- **Filtering**: Client-side filtering for instant results
- **Responsive**: Works on desktop and mobile devices
- **Dark Mode**: Full dark mode support

## Testing

To test the feature:
1. Scrape a new website (old scraped pages won't have HTML structure data)
2. Navigate to Scraping Progress page
3. Click "View Full Details" on any page
4. Scroll to "HTML Structure & Selectors" section
5. Try filtering by typing in the search box

## Notes

- Only newly scraped pages will have HTML structure data
- Pages scraped before this implementation won't show HTML structure
- The feature is automatically enabled for all new scraping jobs
- No configuration changes needed
