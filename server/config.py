import os

FEATURES = {
    'use_proxies': False,
    'use_authentication': False,
    'download_file_assets': True,
    'headless_browser': True,
    'use_fingerprinting': True,
}

SCRAPER = {
    'max_pages': 100,
    'max_depth': 3,
    'concurrent_limit': 5,
    'base_dir': 'scraped_data',
    'smart_scroll_iterations': 5,
    'max_retries': 3,
}

PROXY = {
    'proxy_file': 'proxies.txt',
    'rotation_strategy': 'round-robin',
    'skip_failed_proxies': True,
    'test_url': 'https://httpbin.org/ip',
    'test_timeout': 10000,
    'concurrent_tests': 5,
}

AUTH = {
    'login_url': None,
    'username': None,
    'password': None,
    'auth_state_file': 'auth_state.json',
    'username_selector': "input[name='username']",
    'password_selector': "input[name='password']",
    'submit_selector': "button[type='submit']",
    'success_indicator': None,
    'error_selectors': [
        '.error',
        '.alert-error',
        '.login-error',
        "[class*='error']",
        "[class*='invalid']"
    ],
}

FILE_DOWNLOAD = {
    'max_file_size_mb': 50,
    'chunk_size': 8192,
    'download_timeout': 60,
    'max_retries': 3,
    'downloadable_extensions': {
        '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.csv', '.json', '.xml', '.txt',
        '.epub', '.mobi',
        '.mp3', '.mp4', '.avi', '.mov',
        '.sql', '.db', '.sqlite'
    },
}

TIMEOUTS = {
    'page_goto': 45000,
    'login_page': 30000,
    'network_idle': 15000,
    'session_test': 15000,
    'selector_finder': 30000,
}

DELAYS = {
    'scroll_min': 1.0,
    'scroll_max': 1.5,
    'post_page_min': 0.5,
    'post_page_max': 1.5,
    'retry_wait': 2,
    'post_login_wait': 3,
    'selector_finder_wait': 2,
}

DATABASE = {
    'db_name': 'scraped_data.db',
    'db_path': None,
}

DATABASE['db_path'] = os.path.join(SCRAPER['base_dir'], DATABASE['db_name'])

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
        {"latitude": 40.7128, "longitude": -74.0060},
        {"latitude": 34.0522, "longitude": -118.2437},
        {"latitude": 51.5074, "longitude": -0.1278},
        {"latitude": 48.8566, "longitude": 2.3522},
        {"latitude": 35.6762, "longitude": 139.6503},
        {"latitude": 52.5200, "longitude": 13.4050},
        {"latitude": 37.7749, "longitude": -122.4194},
        {"latitude": 41.8781, "longitude": -87.6298},
        {"latitude": 43.6532, "longitude": -79.3832},
        {"latitude": -33.8688, "longitude": 151.2093},
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

BROWSER = {
    'type': 'chromium',
    'launch_args': [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
    ],
}

OUTPUT = {
    'separator_width': 70,
    'screenshot_name': 'screenshot.png',
    'metadata_name': 'metadata.json',
    'login_error_screenshot': 'login_error.png',
    'export_filename': 'exported_data.json',
}

QUERY = {
    'default_page_limit': 20,
    'default_file_limit': 50,
    'default_largest_downloads': 10,
    'geolocation_proximity': 0.1,
    'timeline_bucket_seconds': 60,
    'bar_chart_scale': 2,
}

SELECTOR_FINDER = {
    'viewport': {"width": 1920, "height": 1080},
    'user_agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    'session_test_wait': 5,
}

def get_proxy_enabled():
    return FEATURES['use_proxies'] and os.path.exists(PROXY['proxy_file'])

def get_auth_enabled():
    return (FEATURES['use_authentication'] and 
            AUTH['login_url'] is not None and 
            AUTH['username'] is not None and 
            AUTH['password'] is not None)

def get_download_enabled():
    return FEATURES['download_file_assets']

def get_max_file_size_bytes():
    return FILE_DOWNLOAD['max_file_size_mb'] * 1024 * 1024

def get_db_path():
    return DATABASE['db_path']

def get_auth_state_path():
    return os.path.join(SCRAPER['base_dir'], AUTH['auth_state_file'])

def validate_config():
    errors = []
    
    base_dir = SCRAPER['base_dir']
    if not os.path.exists(base_dir):
        try:
            os.makedirs(base_dir)
        except Exception as e:
            errors.append(f"Cannot create base directory '{base_dir}': {e}")
    
    if FEATURES['use_proxies'] and not os.path.exists(PROXY['proxy_file']):
        errors.append(f"Proxy file '{PROXY['proxy_file']}' not found. Proxies will be disabled.")
    
    if FEATURES['use_authentication']:
        if not AUTH['login_url']:
            errors.append("Authentication enabled but login_url is not set")
        if not AUTH['username'] or not AUTH['password']:
            errors.append("Authentication enabled but username/password not set")
    
    if SCRAPER['concurrent_limit'] < 1:
        errors.append("concurrent_limit must be at least 1")
    
    if SCRAPER['max_pages'] < 1:
        errors.append("max_pages must be at least 1")
    
    return errors

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
    print_config()
    errors = validate_config()
    if errors:
        print("Configuration Errors:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("Configuration is valid")