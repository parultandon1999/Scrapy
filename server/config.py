from os.path import join


FEATURES = {
    'use_proxies': False,
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
    'max_page_retries': 3,
}

PROXY = {
    'proxy_list': [],
    'test_url': 'https://httpbin.org/ip',
    'test_timeout': 10000,
    'concurrent_tests': 5,
    'user_agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
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
    'manual_login_mode': False,
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
    'max_download_retries': 3,
    'chunk_size': 8192,
    'download_timeout': 60,
    'downloadable_extensions': {
        '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.csv', '.json', '.xml', '.txt',
        '.epub', '.mobi',
        '.mp3', '.mp4', '.avi', '.mov',
        '.sql', '.db', '.sqlite'
    },
}

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

DATABASE = {
    'db_name': 'scraped_data.db',
    'db_path': None,
}

DATABASE['db_path'] = join(SCRAPER['base_dir'], DATABASE['db_name'])

CAPTCHA = {
    'enabled': True,
    'manual_solving': True,
    'wait_timeout': 120,
    'headless': False,
    'detection_selectors': [
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
        'div.g-recaptcha',
        'div.h-captcha',
        '[data-sitekey]',
        '#captcha',
        '.captcha'
    ],
    'pause_workers': True,
    'sound_alert': True,
    'desktop_notification': True,
    'sound_frequency': 1000,
    'sound_duration': 500,
    'sound_repeat': 3,
}

EXTRACTION = {
    'enabled': True,
    'default_timeout': 5000,  # milliseconds to wait for elements
    'retry_on_failure': True,
    'max_retries': 3,
    'clean_whitespace': True,
    'validate_data': True,
}


def get_db_path():
    return DATABASE['db_path']

