import os

# ============================================================================
# FEATURE FLAGS - Enable/Disable major features
# ============================================================================
FEATURES = {
    'use_proxies': False,               # Enable/disable proxy rotation
    'use_authentication': False,       # Enable/disable login functionality
    'download_file_assets': True,      # Enable/disable file downloads
    'headless_browser': True,          # Run browser in headless mode
    'use_fingerprinting': True,        # Enable browser fingerprint randomization
}

# ============================================================================
# SCRAPER SETTINGS - Core scraping parameters
# ============================================================================
SCRAPER = {
    'max_pages': 100,                  # Maximum number of pages to scrape
    'max_depth': 3,                    # Maximum crawl depth from start URL
    'concurrent_limit': 5,             # Number of concurrent browser workers
    'base_dir': 'scraped_data',        # Directory for storing scraped data
    'smart_scroll_iterations': 5,      # Number of scroll iterations per page
    'max_retries': 3,                  # Maximum retry attempts for failed pages
}

# ============================================================================
# PROXY SETTINGS
# ============================================================================
PROXY = {
    'proxy_file': 'proxies.txt',       # Path to proxy list file
    'rotation_strategy': 'round-robin', # Proxy rotation strategy
    'skip_failed_proxies': True,       # Skip proxies that have failed
    'test_url': 'https://httpbin.org/ip',  # URL for testing proxy connectivity
    'test_timeout': 10000,             # Proxy test timeout (milliseconds)
    'concurrent_tests': 5,             # Number of proxies to test concurrently
}

# ============================================================================
# AUTHENTICATION SETTINGS
# ============================================================================
AUTH = {
    'login_url': None,                 # URL of login page (None = no auth)
    'username': None,                  # Login username
    'password': None,                  # Login password
    'auth_state_file': 'auth_state.json',  # File to save authentication state
    
    # CSS Selectors for login form elements
    'username_selector': "input[name='username']",
    'password_selector': "input[name='password']",
    'submit_selector': "button[type='submit']",
    'success_indicator': None,         # Optional selector to verify login success
    
    # Error detection selectors
    'error_selectors': [
        '.error',
        '.alert-error',
        '.login-error',
        "[class*='error']",
        "[class*='invalid']"
    ],
}

# ============================================================================
# FILE DOWNLOAD SETTINGS
# ============================================================================
FILE_DOWNLOAD = {
    'max_file_size_mb': 50,            # Maximum file size to download (MB)
    'chunk_size': 8192,                # Download chunk size (bytes)
    'download_timeout': 60,            # Download timeout (seconds)
    'max_retries': 3,                  # Maximum retry attempts for failed downloads
    
    # File extensions to download
    'downloadable_extensions': {
        # Documents
        '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
        # Archives
        '.zip', '.rar', '.7z', '.tar', '.gz',
        # Data files
        '.csv', '.json', '.xml', '.txt',
        # E-books
        '.epub', '.mobi',
        # Media
        '.mp3', '.mp4', '.avi', '.mov',
        # Database
        '.sql', '.db', '.sqlite'
    },
}

# ============================================================================
# TIMEOUTS (milliseconds unless specified)
# ============================================================================
TIMEOUTS = {
    'page_goto': 45000,                # Page navigation timeout
    'login_page': 30000,               # Login page load timeout
    'network_idle': 15000,             # Wait for network idle timeout
    'session_test': 15000,             # Session validation timeout
    'selector_finder': 30000,          # Selector finder page load timeout
}

# ============================================================================
# DELAYS (seconds) - Random delays to appear more human-like
# ============================================================================
DELAYS = {
    'scroll_min': 1.0,                 # Minimum scroll delay
    'scroll_max': 1.5,                 # Maximum scroll delay
    'post_page_min': 0.5,              # Minimum delay after page load
    'post_page_max': 1.5,              # Maximum delay after page load
    'retry_wait': 2,                   # Wait time before retry
    'post_login_wait': 3,              # Wait after login attempt
    'selector_finder_wait': 2,         # Wait for selector finder page load
}

# ============================================================================
# DATABASE SETTINGS
# ============================================================================
DATABASE = {
    'db_name': 'scraped_data.db',      # SQLite database filename
    'db_path': None,                   # Auto-generated: base_dir/db_name
}

# Auto-generate database path
DATABASE['db_path'] = os.path.join(SCRAPER['base_dir'], DATABASE['db_name'])

# ============================================================================
# BROWSER FINGERPRINTING - Randomized browser characteristics
# ============================================================================
FINGERPRINTS = {
    'viewports': [
        {"width": 1920, "height": 1080},
        {"width": 1366, "height": 768},
        {"width": 1536, "height": 864},
        {"width": 1440, "height": 900},
        {"width": 1280, "height": 720},
        {"width": 2560, "height": 1440},
        {"width": 1600, "height": 900},
        {"width": 1680, "height": 1050},
    ],
    
    'user_agents': [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ],
    
    'timezones': [
        "America/New_York",
        "America/Chicago",
        "America/Los_Angeles",
        "America/Denver",
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Australia/Sydney",
        "America/Toronto",
        "Europe/Madrid",
    ],
    
    'geolocations': [
        {"latitude": 40.7128, "longitude": -74.0060},   # New York
        {"latitude": 34.0522, "longitude": -118.2437},  # Los Angeles
        {"latitude": 51.5074, "longitude": -0.1278},    # London
        {"latitude": 48.8566, "longitude": 2.3522},     # Paris
        {"latitude": 35.6762, "longitude": 139.6503},   # Tokyo
        {"latitude": 52.5200, "longitude": 13.4050},    # Berlin
        {"latitude": 37.7749, "longitude": -122.4194},  # San Francisco
        {"latitude": 41.8781, "longitude": -87.6298},   # Chicago
        {"latitude": 43.6532, "longitude": -79.3832},   # Toronto
        {"latitude": -33.8688, "longitude": 151.2093},  # Sydney
    ],
    
    'locales': [
        ["en-US", "en"],
        ["en-GB", "en"],
        ["fr-FR", "fr"],
        ["de-DE", "de"],
        ["es-ES", "es"],
        ["ja-JP", "ja"],
    ],
    
    'screens': [
        {"width": 1920, "height": 1080},
        {"width": 2560, "height": 1440},
        {"width": 1366, "height": 768},
        {"width": 1536, "height": 864},
    ],
    
    'device_scale_factors': [1, 1.5, 2],
    'has_touch_options': [True, False],
}

# ============================================================================
# BROWSER LAUNCH ARGUMENTS
# ============================================================================
BROWSER = {
    'type': 'chromium',                # Browser type: chromium, firefox, webkit
    'launch_args': [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
    ],
}

# ============================================================================
# OUTPUT & LOGGING SETTINGS
# ============================================================================
OUTPUT = {
    'separator_width': 70,             # Width of console separator lines
    'screenshot_name': 'screenshot.png',
    'metadata_name': 'metadata.json',
    'login_error_screenshot': 'login_error.png',
    'export_filename': 'exported_data.json',
}

# ============================================================================
# QUERY & ANALYSIS SETTINGS
# ============================================================================
QUERY = {
    'default_page_limit': 20,          # Default number of pages to display
    'default_file_limit': 50,          # Default number of file assets to display
    'default_largest_downloads': 10,   # Default number of largest downloads to show
    'geolocation_proximity': 0.1,      # Degrees for geolocation proximity matching
    'timeline_bucket_seconds': 60,     # Timeline grouping interval (seconds)
    'bar_chart_scale': 2,              # Scale factor for console bar charts
}

# ============================================================================
# SELECTOR FINDER SETTINGS
# ============================================================================
SELECTOR_FINDER = {
    'viewport': {"width": 1920, "height": 1080},
    'user_agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    'session_test_wait': 5,            # Seconds to wait during session test
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_proxy_enabled():
    """Check if proxy feature is enabled and proxy file exists."""
    return FEATURES['use_proxies'] and os.path.exists(PROXY['proxy_file'])

def get_auth_enabled():
    """Check if authentication is enabled and credentials are provided."""
    return (FEATURES['use_authentication'] and 
            AUTH['login_url'] is not None and 
            AUTH['username'] is not None and 
            AUTH['password'] is not None)

def get_download_enabled():
    """Check if file download feature is enabled."""
    return FEATURES['download_file_assets']

def get_max_file_size_bytes():
    """Get maximum file size in bytes."""
    return FILE_DOWNLOAD['max_file_size_mb'] * 1024 * 1024

def get_db_path():
    """Get full database path."""
    return DATABASE['db_path']

def get_auth_state_path():
    """Get full authentication state file path."""
    return os.path.join(SCRAPER['base_dir'], AUTH['auth_state_file'])

# ============================================================================
# CONFIGURATION VALIDATION
# ============================================================================

def validate_config():
    """Validate configuration settings."""
    errors = []
    
    # Check if base directory is writable
    base_dir = SCRAPER['base_dir']
    if not os.path.exists(base_dir):
        try:
            os.makedirs(base_dir)
        except Exception as e:
            errors.append(f"Cannot create base directory '{base_dir}': {e}")
    
    # Check proxy file if proxies are enabled
    if FEATURES['use_proxies'] and not os.path.exists(PROXY['proxy_file']):
        errors.append(f"Proxy file '{PROXY['proxy_file']}' not found. Proxies will be disabled.")
    
    # Check authentication settings
    if FEATURES['use_authentication']:
        if not AUTH['login_url']:
            errors.append("Authentication enabled but login_url is not set")
        if not AUTH['username'] or not AUTH['password']:
            errors.append("Authentication enabled but username/password not set")
    
    # Check concurrent limit
    if SCRAPER['concurrent_limit'] < 1:
        errors.append("concurrent_limit must be at least 1")
    
    # Check max pages
    if SCRAPER['max_pages'] < 1:
        errors.append("max_pages must be at least 1")
    
    return errors

# ============================================================================
# EXPORT CONFIGURATION
# ============================================================================

def print_config():
    print("CURRENT CONFIGURATION")
    print(f"\nFeatures:")
    for key, value in FEATURES.items():
        print(f"  {key}: {value}")
    print(f"\nScraper Settings:")
    for key, value in SCRAPER.items():
        print(f"  {key}: {value}")
    print(f"\nProxy: Enabled={get_proxy_enabled()}")
    print(f"Authentication: Enabled={get_auth_enabled()}")
    print(f"File Downloads: Enabled={get_download_enabled()}")

if __name__ == "__main__":
    # Validate configuration when run directly
    print_config()
    errors = validate_config()
    if errors:
        print("Configuration Errors:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("Configuration is valid")
