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
    'manual_login_mode': False,  # Set to True for sites with CAPTCHA (Pinterest, Instagram, etc.)
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
