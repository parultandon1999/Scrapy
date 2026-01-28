# Scrapy - Advanced Web Scraping Application

A full-stack web scraping application with a Python backend and React frontend. Features include concurrent crawling, proxy rotation, browser fingerprinting, authentication handling, and file downloads.

## Features

### Backend (Python/FastAPI)
- ✅ **Concurrent Crawling** - Multiple workers scraping in parallel
- ✅ **Proxy Rotation** - Round-robin proxy support with failure detection
- ✅ **Browser Fingerprinting** - Randomized user agents, viewports, timezones, geolocations
- ✅ **Authentication** - Login form handling with session persistence
- ✅ **File Downloads** - Automatic detection and download of PDFs, docs, archives, etc.
- ✅ **Smart Scrolling** - Triggers lazy-loaded content
- ✅ **Depth Control** - Configurable crawl depth
- ✅ **Data Extraction** - Headers, links, media, structured data, full text
- ✅ **SQLite Database** - Stores all scraped data
- ✅ **REST API** - Full API for scraper control and data retrieval
- ✅ **WebSocket** - Real-time scraping updates

### Frontend (React/Vite)
- ✅ **Clean UI** - Google-inspired interface with dark mode
- ✅ **Scraper Control** - Start/stop scraping with real-time status
- ✅ **Advanced Options** - Override config settings per scrape
- ✅ **Progress Tracking** - Live updates on pages scraped, queue size, downloads
- ✅ **Responsive Design** - Works on desktop and mobile

### Utility Scripts
- `proxy_tester.py` - Test and validate proxy servers
- `query_db.py` - Query and analyze scraped data
- `scrap_analyser.py` - Performance analytics
- `selector_finder.py` - Find CSS selectors for login forms

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Playwright** - Browser automation
- **aiohttp** - Async HTTP client
- **SQLite3** - Database
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **Phosphor Icons** - Icon library

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Playwright browsers:
```bash
playwright install chromium
```

4. (Optional) Configure proxies in `proxies.txt`:
```
http://proxy1.example.com:8080
http://username:password@proxy2.example.com:8080
socks5://proxy3.example.com:1080
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL in `.env`:
```
VITE_API_URL=http://localhost:8000
```

## Usage

### Quick Start (Windows)

Run the batch file to start both servers:
```bash
start.bat
```

This will:
- Start the backend on `http://localhost:8000`
- Start the frontend on `http://localhost:5173`

### Manual Start

**Backend:**
```bash
cd server
python api.py
```

**Frontend:**
```bash
cd client
npm run dev
```

### Using the Web Interface

1. Open `http://localhost:5173` in your browser
2. Enter a URL to scrape
3. (Optional) Click "Advanced Options" to customize settings
4. Click "Start Scraping"
5. Monitor progress in real-time
6. Click "Stop Scraping" to halt the process

### Configuration

Edit `server/config.py` to customize default settings:

```python
FEATURES = {
    'use_proxies': False,              # Enable proxy rotation
    'use_authentication': False,       # Enable login handling
    'download_file_assets': True,      # Download files
    'headless_browser': True,          # Run browser headless
}

SCRAPER = {
    'max_pages': 100,                  # Max pages to scrape
    'max_depth': 3,                    # Max crawl depth
    'concurrent_limit': 5,             # Concurrent workers
}
```

### API Documentation

Once the backend is running, visit:
- API Docs: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### Key API Endpoints

**Scraper Control:**
- `POST /api/scraper/start` - Start scraping
- `GET /api/scraper/status` - Get status
- `POST /api/scraper/stop` - Stop scraping

**Data Retrieval:**
- `GET /api/data/stats` - Get statistics
- `GET /api/data/pages` - Get scraped pages
- `GET /api/data/files` - Get downloaded files
- `POST /api/data/search/content` - Search content
- `GET /api/data/export` - Export all data

**Proxy Management:**
- `POST /api/proxies/test` - Test proxies
- `GET /api/proxies/list` - List proxies

## Utility Scripts

### Test Proxies
```bash
cd server
python proxy_tester.py
```

### Query Database
```bash
cd server
python query_db.py
```

### Analyze Performance
```bash
cd server
python scrap_analyser.py
```

### Find Login Selectors
```bash
cd server
python selector_finder.py
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Python backend
│   ├── api.py             # FastAPI application
│   ├── scraper.py         # Main scraper engine
│   ├── config.py          # Configuration
│   ├── proxy_tester.py    # Proxy testing utility
│   ├── query_db.py        # Database query utility
│   ├── scrap_analyser.py  # Performance analyzer
│   ├── selector_finder.py # Login selector finder
│   ├── proxies.txt        # Proxy list
│   └── requirements.txt   # Python dependencies
│
├── start.bat              # Windows startup script
└── README.md              # This file
```

## Database Schema

The scraper stores data in SQLite with the following tables:

- **pages** - Scraped page data (URL, title, content, depth, etc.)
- **headers** - Page headers (h1, h2, h3)
- **links** - Internal and external links
- **media** - Images and media files
- **structured_data** - JSON-LD structured data
- **file_assets** - Downloaded files (PDFs, docs, etc.)

## Advanced Features

### Authentication

To scrape authenticated pages, configure in `config.py`:

```python
AUTH = {
    'login_url': 'https://example.com/login',
    'username': 'your_username',
    'password': 'your_password',
    'username_selector': "input[name='username']",
    'password_selector': "input[name='password']",
    'submit_selector': "button[type='submit']",
    'success_indicator': '.user-profile',
}
```

Or use the selector finder utility to auto-detect selectors.

### Proxy Rotation

Add proxies to `server/proxies.txt`:
```
http://proxy1.example.com:8080
http://user:pass@proxy2.example.com:8080
socks5://proxy3.example.com:1080
```

Enable in `config.py`:
```python
FEATURES['use_proxies'] = True
```

### File Downloads

Configure downloadable file types in `config.py`:

```python
FILE_DOWNLOAD = {
    'max_file_size_mb': 50,
    'downloadable_extensions': {
        '.pdf', '.docx', '.xlsx', '.zip', '.csv', ...
    }
}
```

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Install dependencies: `pip install -r requirements.txt`
- Install Playwright: `playwright install chromium`

### Frontend won't start
- Ensure Node.js 16+ is installed
- Install dependencies: `npm install`
- Check `.env` file has correct API URL

### CORS errors
- Ensure backend is running on port 8000
- Check CORS settings in `server/api.py`

### Scraper fails immediately
- Check URL is valid and accessible
- Disable proxies if having connection issues
- Check browser can access the site

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues and questions, please open an issue on GitHub.
