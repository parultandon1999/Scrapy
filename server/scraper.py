import json
import time
import random
import os
import re
import sqlite3
import asyncio
import aiohttp
import mimetypes
from urllib.parse import urlparse, urljoin, urlunparse
from collections import deque
from playwright.async_api import async_playwright
import config

class Scraper:
    def __init__(
        self, start_url, 
        max_pages=None, 
        max_depth=None, 
        base_dir=None, 
        headless=None, 
        concurrent_limit=None, 
        proxy_file=None,
        login_url=None, 
        username=None, 
        password=None, 
        username_selector=None, 
        password_selector=None,
        submit_selector=None,
        success_indicator=None,
        auth_state_file=None,
        download_file_assets=None,
    ):
        self.start_url = self._normalize_url(start_url)
        self.should_stop = False
        self.domain = urlparse(self.start_url).netloc
        
        # Use config values as defaults
        self.max_pages = max_pages if max_pages is not None else config.SCRAPER['max_pages']
        self.max_depth = max_depth if max_depth is not None else config.SCRAPER['max_depth']
        self.base_dir = base_dir if base_dir is not None else config.SCRAPER['base_dir']
        self.headless = headless if headless is not None else config.FEATURES['headless_browser']
        self.concurrent_limit = concurrent_limit if concurrent_limit is not None else config.SCRAPER['concurrent_limit']
        self.proxy_file = proxy_file if proxy_file is not None else config.PROXY['proxy_file']
        
        # File download settings from config
        self.download_file_assets = download_file_assets if download_file_assets is not None else config.FEATURES['download_file_assets']
        self.max_file_size_mb = max_file_size_mb if max_file_size_mb is not None else config.FILE_DOWNLOAD['max_file_size_mb']
        self.max_file_size_bytes = self.max_file_size_mb * 1024 * 1024
        
        # Supported file extensions from config
        self.downloadable_extensions = config.FILE_DOWNLOAD['downloadable_extensions']
        
        # Authentication settings from config
        self.login_url = login_url if login_url is not None else config.AUTH['login_url']
        self.username = username if username is not None else config.AUTH['username']
        self.password = password if password is not None else config.AUTH['password']
        self.username_selector = username_selector if username_selector is not None else config.AUTH['username_selector']
        self.password_selector = password_selector if password_selector is not None else config.AUTH['password_selector']
        self.submit_selector = submit_selector if submit_selector is not None else config.AUTH['submit_selector']
        self.success_indicator = success_indicator if success_indicator is not None else config.AUTH['success_indicator']
        
        auth_state_filename = auth_state_file if auth_state_file is not None else config.AUTH['auth_state_file']
        self.auth_state_file = os.path.join(self.base_dir, auth_state_filename)
        self.storage_state = None
        
        # Custom extraction rules
        self.extraction_rules = extraction_rules or []
        
        # Load proxies
        self.proxies = self._load_proxies()
        self.proxy_index = 0
        self.proxy_lock = asyncio.Lock()
        
        # Database setup
        self.db_path = os.path.join(self.base_dir, "scraped_data.db")
        self._init_database()
        
        # Crawler State
        self.queue = deque([(self.start_url, 0)])
        self.visited = set([self.start_url])
        self.pages_scraped = 0
        self.lock = asyncio.Lock()
        
        # Failed proxies tracking
        self.failed_proxies = set()
        
        # Download statistics
        self.downloads_stats = {
            'total_attempted': 0,
            'successful': 0,
            'failed': 0,
            'total_bytes': 0
        }
        
        # Create base directory
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def _load_proxies(self):
        """Load proxies from file. Supports HTTP, HTTPS, and SOCKS5 proxies."""
        proxies = []
        
        # Check if proxy feature is enabled
        if not config.FEATURES['use_proxies']:
            print("Proxy feature is disabled in config. Running without proxies.")
            return []
        
        if not os.path.exists(self.proxy_file):
            print(f"Proxy file '{self.proxy_file}' not found. Running without proxies.")
            return []
        
        with open(self.proxy_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    proxies.append(line)
        
        print(f"Loaded {len(proxies)} proxies from {self.proxy_file}")
        return proxies

    async def _get_next_proxy(self):
        """Get next proxy from the list (round-robin with failed proxy skipping)."""
        if not self.proxies:
            return None
        
        async with self.proxy_lock:
            attempts = 0
            max_attempts = len(self.proxies)
            
            while attempts < max_attempts:
                proxy = self.proxies[self.proxy_index]
                self.proxy_index = (self.proxy_index + 1) % len(self.proxies)
                
                if proxy not in self.failed_proxies:
                    return proxy
                
                attempts += 1
            
            print("All proxies have failed. Continuing without proxy.")
            return None

    async def _mark_proxy_failed(self, proxy):
        """Mark a proxy as failed."""
        async with self.proxy_lock:
            self.failed_proxies.add(proxy)
            print(f"Marked proxy as failed: {proxy}")

    def _generate_fingerprint(self):
        """Generate randomized browser fingerprint to avoid detection."""
        
        # Use fingerprints from config
        fingerprint = {
            "viewport": random.choice(config.FINGERPRINTS['viewports']),
            "user_agent": random.choice(config.FINGERPRINTS['user_agents']),
            "timezone_id": random.choice(config.FINGERPRINTS['timezones']),
            "geolocation": random.choice(config.FINGERPRINTS['geolocations']),
            "locale": random.choice(config.FINGERPRINTS['locales'])[0],
            "screen": random.choice(config.FINGERPRINTS['screens']),
            "device_scale_factor": random.choice(config.FINGERPRINTS['device_scale_factors']),
            "is_mobile": False,
            "has_touch": random.choice(config.FINGERPRINTS['has_touch_options']),
        }
        
        return fingerprint

    async def perform_login(self, browser):
        """
        Perform login and save authentication state (cookies/storage).
        Returns True if login successful, False otherwise.
        """
        if not self.login_url or not self.username or not self.password:
            print("No login credentials provided. Skipping authentication.")
            return False
        
        print("\n" + "="*70)
        print("AUTHENTICATION HANDLER")
        print("="*70)
        print(f"Login URL: {self.login_url}")
        print(f"Username: {self.username}")
        print(f"State File: {self.auth_state_file}")
        print()
        
        # Check if we have saved auth state
        if os.path.exists(self.auth_state_file):
            print("Found saved authentication state. Testing validity...")
            
            try:
                with open(self.auth_state_file, 'r') as f:
                    self.storage_state = json.load(f)
                
                # Test if stored session is still valid
                test_context = await browser.new_context(storage_state=self.storage_state)
                test_page = await test_context.new_page()
                
                try:
                    # Try to navigate to a protected page (could be start_url or custom test page)
                    test_url = self.start_url if self.start_url != self.login_url else self.login_url
                    await test_page.goto(test_url, timeout=15000)
                    await asyncio.sleep(2)
                    
                    # Check if we're still logged in
                    current_url = test_page.url
                    
                    # If we got redirected to login, session expired
                    if self.login_url in current_url:
                        print("Saved session expired. Need fresh login.")
                        self.storage_state = None
                    else:
                        print("Saved session is still valid! Using existing authentication.")
                        await test_page.close()
                        await test_context.close()
                        return True
                    
                except Exception as e:
                    print(f"Session test failed: {e}")
                
                await test_page.close()
                await test_context.close()
                
            except Exception as e:
                print(f"Could not load saved auth state: {e}")
        
        # Need to perform fresh login
        print("Performing fresh login...\n")
        
        try:
            # Create a context for login
            fingerprint = self._generate_fingerprint()
            context, _ = await self.create_context(browser)
            page = await context.new_page()
            
            # Navigate to login page
            print(f"Navigating to {self.login_url}")
            await page.goto(self.login_url, wait_until="networkidle", timeout=30000)
            await asyncio.sleep(2)  # Wait for page to fully load
            
            # Fill in username
            print(f"Entering username: {self.username}")
            await page.fill(self.username_selector, self.username)
            await asyncio.sleep(0.5)
            
            # Fill in password
            print(f"Entering password")
            await page.fill(self.password_selector, self.password)
            await asyncio.sleep(0.5)
            
            # Click submit button
            print(f"Clicking submit button")
            await page.click(self.submit_selector)
            
            # Wait for navigation/redirect
            print(f"Waiting for login to complete...")
            try:
                await page.wait_for_load_state("networkidle", timeout=15000)
            except:
                await asyncio.sleep(3)  # Fallback wait
            
            # Check for successful login
            current_url = page.url
            print(f"Current URL after login: {current_url}")
            
            # Verify login success
            login_successful = False
            
            if self.success_indicator:
                # Wait for success indicator element
                try:
                    await page.wait_for_selector(self.success_indicator, timeout=10000)
                    print(f"Success indicator found: {self.success_indicator}")
                    login_successful = True
                except:
                    print(f"Success indicator not found: {self.success_indicator}")
            else:
                # Check if URL changed from login page
                if current_url != self.login_url:
                    print(f"URL changed from login page (assumed successful)")
                    login_successful = True
                else:
                    # Check for error messages
                    error_selectors = [
                        ".error", ".alert-error", ".login-error",
                        "[class*='error']", "[class*='invalid']"
                    ]
                    
                    has_error = False
                    for selector in error_selectors:
                        try:
                            error_elem = await page.query_selector(selector)
                            if error_elem:
                                error_text = await error_elem.inner_text()
                                if error_text:
                                    print(f"Login error detected: {error_text}")
                                    has_error = True
                                    break
                        except:
                            continue
                    
                    if not has_error:
                        login_successful = True
            
            if login_successful:
                # Save storage state (cookies, localStorage, sessionStorage)
                print(f"\nLogin successful!")
                print(f"Saving authentication state to: {self.auth_state_file}")
                
                self.storage_state = await context.storage_state()
                
                with open(self.auth_state_file, 'w') as f:
                    json.dump(self.storage_state, f, indent=2)
                
                # Show saved cookies info
                if 'cookies' in self.storage_state:
                    print(f"Saved {len(self.storage_state['cookies'])} cookies")
                    for cookie in self.storage_state['cookies'][:3]:
                        print(f"{cookie['name']}: {cookie['value'][:20]}...")
                
                print("\n" + "="*70)
                print("AUTHENTICATION SUCCESSFUL")
                print("="*70 + "\n")
                
                await page.close()
                await context.close()
                return True
            else:
                print("\n" + "="*70)
                print("AUTHENTICATION FAILED")
                print("="*70)
                print("Please check:")
                print("• Login credentials are correct")
                print("• CSS selectors match the login form")
                print("• success_indicator selector is correct")
                print("="*70 + "\n")
                
                # Take screenshot of login page for debugging
                try:
                    screenshot_path = os.path.join(self.base_dir, "login_error.png")
                    await page.screenshot(path=screenshot_path)
                    print(f"Saved error screenshot to: {screenshot_path}")
                except:
                    pass
                
                await page.close()
                await context.close()
                return False
                
        except Exception as e:
            print(f"\nLogin error: {e}")
            print("="*70 + "\n")
            
            # Take screenshot on error
            try:
                screenshot_path = os.path.join(self.base_dir, "login_error.png")
                await page.screenshot(path=screenshot_path)
                print(f"Saved error screenshot to: {screenshot_path}")
            except:
                pass
            return False

    def _init_database(self):
        """Initialize SQLite database with required tables."""
        os.makedirs(os.path.dirname(self.db_path) if os.path.dirname(self.db_path) else '.', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pages (
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
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS headers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                header_type TEXT,
                header_text TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                link_type TEXT,
                url TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                src TEXT,
                alt TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS structured_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                json_data TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # NEW: HTML structure table with selectors
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS html_structure (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                tag_name TEXT,
                selector TEXT,
                text_content TEXT,
                attributes TEXT,
                parent_selector TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # NEW: File assets table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS file_assets (
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
        ''')
        
        conn.commit()
        conn.close()

    def _normalize_url(self, url):
        """Strips query parameters and fragments to ensure unique page visits."""
        parsed = urlparse(url)
        clean_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
        return clean_url.rstrip('/')

    def _create_folder_path(self, url):
        """Creates a directory structure that mirrors the URL path for media storage."""
        parsed = urlparse(url)
        
        domain_clean = re.sub(r'[^a-zA-Z0-9]', '_', parsed.netloc)
        path_segments = parsed.path.strip("/").split("/")
        path_segments = [s for s in path_segments if s]
        
        if not path_segments:
            path_segments = ["home"]
            
        safe_segments = [re.sub(r'[^a-zA-Z0-9\-_]', '_', s)[:50] for s in path_segments]
        full_path = os.path.join(self.base_dir, domain_clean, *safe_segments)
        
        if not os.path.exists(full_path):
            os.makedirs(full_path)
            
        return full_path

    def _is_downloadable_file(self, url):
        """Check if URL points to a downloadable file based on extension."""
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        # Check file extension
        ext = os.path.splitext(path)[1]
        return ext in self.downloadable_extensions

    def _get_file_extension(self, url, content_type=None):
        """Extract file extension from URL or content type."""
        # Try from URL first
        parsed = urlparse(url)
        path = parsed.path
        ext = os.path.splitext(path)[1].lower()
        
        if ext and ext in self.downloadable_extensions:
            return ext
        
        # Try from content-type
        if content_type:
            extension = mimetypes.guess_extension(content_type.split(';')[0].strip())
            if extension:
                return extension.lower()
        
        return '.bin'  # Default

    async def _download_file(self, file_url, save_path, session, max_retries=3):
        """
        Download a file from URL to save_path using aiohttp.
        Returns dict with download status.
        """
        result = {
            'success': False,
            'file_size': 0,
            'error': None,
            'mime_type': None
        }
        
        for attempt in range(max_retries):
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=60)) as response:
                    if response.status == 200:
                        # Check file size from headers
                        content_length = response.headers.get('Content-Length')
                        if content_length:
                            file_size = int(content_length)
                            if file_size > self.max_file_size_bytes:
                                result['error'] = f"File too large: {file_size / (1024*1024):.1f}MB"
                                return result
                        
                        # Get mime type
                        result['mime_type'] = response.headers.get('Content-Type', 'application/octet-stream')
                        
                        # Download file
                        with open(save_path, 'wb') as f:
                            total_downloaded = 0
                            async for chunk in response.content.iter_chunked(8192):
                                f.write(chunk)
                                total_downloaded += len(chunk)
                                
                                # Check size limit during download
                                if total_downloaded > self.max_file_size_bytes:
                                    result['error'] = "File exceeded size limit during download"
                                    os.remove(save_path)  # Clean up partial file
                                    return result
                        
                        result['success'] = True
                        result['file_size'] = total_downloaded
                        return result
                    else:
                        result['error'] = f"HTTP {response.status}"
                        
            except asyncio.TimeoutError:
                result['error'] = "Download timeout"
            except Exception as e:
                result['error'] = str(e)
            
            if attempt < max_retries - 1:
                await asyncio.sleep(1)  # Wait before retry
        
        return result

    async def _extract_file_links(self, page, base_url):
        """
        Extract all downloadable file links from page.
        Returns list of dicts with file info.
        """
        file_links = []
        
        try:
            # Get all links from the page
            links = await page.locator("a").all()
            
            for link in links:
                try:
                    href = await link.get_attribute("href")
                    if not href:
                        continue
                    
                    # Convert to absolute URL
                    full_url = urljoin(base_url, href)
                    
                    # Check if it's a downloadable file
                    if self._is_downloadable_file(full_url):
                        # Try to get link text for better naming
                        link_text = ""
                        try:
                            link_text = await link.inner_text()
                            link_text = re.sub(r'[^a-zA-Z0-9\s\-_]', '', link_text)[:50].strip()
                        except:
                            pass
                        
                        file_links.append({
                            'url': full_url,
                            'link_text': link_text
                        })
                
                except Exception as e:
                    continue
            
            # Also check for file links in specific attributes
            # Common patterns: data-download, data-file, etc.
            for selector in ['[data-download]', '[data-file]', '[href$=".pdf"]', 
                           '[href$=".docx"]', '[href$=".zip"]', '[href$=".csv"]']:
                try:
                    elements = await page.locator(selector).all()
                    for elem in elements:
                        href = await elem.get_attribute("href") or await elem.get_attribute("data-download") or await elem.get_attribute("data-file")
                        if href:
                            full_url = urljoin(base_url, href)
                            if self._is_downloadable_file(full_url):
                                file_links.append({
                                    'url': full_url,
                                    'link_text': ''
                                })
                except:
                    continue
        
        except Exception as e:
            print(f"Warning: Error extracting file links: {e}")
        
        # Remove duplicates
        unique_files = {}
        for file_info in file_links:
            url = file_info['url']
            if url not in unique_files:
                unique_files[url] = file_info
        
        return list(unique_files.values())

    async def smart_scroll(self, page):
        """Scrolls to trigger lazy loading."""
        try:
            last_height = await page.evaluate("document.body.scrollHeight")
            for i in range(5):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(random.uniform(1.0, 1.5))
                new_height = await page.evaluate("document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
        except Exception:
            pass

    async def extract_html_structure(self, page):
        """Extract HTML structure with CSS selectors and content."""
        try:
            # JavaScript to extract HTML structure with selectors
            structure = await page.evaluate("""
                () => {
                    const elements = [];
                    const processedElements = new Set();
                    
                    // Function to generate CSS selector for an element
                    function getSelector(element) {
                        if (element.id) {
                            return '#' + element.id;
                        }
                        
                        let path = [];
                        while (element && element.nodeType === Node.ELEMENT_NODE) {
                            let selector = element.nodeName.toLowerCase();
                            
                            if (element.className && typeof element.className === 'string') {
                                const classes = element.className.trim().split(/\\s+/).filter(c => c);
                                if (classes.length > 0) {
                                    selector += '.' + classes.slice(0, 3).join('.');
                                }
                            }
                            
                            // Add nth-child if needed for uniqueness
                            if (element.parentNode) {
                                const siblings = Array.from(element.parentNode.children);
                                const index = siblings.indexOf(element) + 1;
                                if (siblings.length > 1) {
                                    selector += `:nth-child(${index})`;
                                }
                            }
                            
                            path.unshift(selector);
                            element = element.parentElement;
                            
                            // Limit depth to avoid very long selectors
                            if (path.length >= 5) break;
                        }
                        
                        return path.join(' > ');
                    }
                    
                    // Function to get parent selector
                    function getParentSelector(element) {
                        if (element.parentElement) {
                            return getSelector(element.parentElement);
                        }
                        return null;
                    }
                    
                    // Function to get element attributes
                    function getAttributes(element) {
                        const attrs = {};
                        for (let attr of element.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                        return attrs;
                    }
                    
                    // Extract important elements
                    const selectors = [
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        'p', 'a', 'button', 'input', 'textarea', 'select',
                        'div[class]', 'section', 'article', 'nav', 'header', 'footer',
                        'ul', 'ol', 'li', 'table', 'form', 'img'
                    ];
                    
                    selectors.forEach(sel => {
                        const elems = document.querySelectorAll(sel);
                        elems.forEach((elem, idx) => {
                            // Skip if already processed or hidden
                            if (processedElements.has(elem)) return;
                            
                            const style = window.getComputedStyle(elem);
                            if (style.display === 'none' || style.visibility === 'hidden') return;
                            
                            // Get text content (limit to 200 chars)
                            let textContent = elem.textContent?.trim() || '';
                            if (textContent.length > 200) {
                                textContent = textContent.substring(0, 200) + '...';
                            }
                            
                            // Skip elements with no meaningful content
                            if (!textContent && !elem.src && !elem.href) return;
                            
                            const selector = getSelector(elem);
                            const parentSelector = getParentSelector(elem);
                            const attributes = getAttributes(elem);
                            
                            elements.push({
                                tag: elem.tagName.toLowerCase(),
                                selector: selector,
                                text: textContent,
                                attributes: attributes,
                                parent: parentSelector
                            });
                            
                            processedElements.add(elem);
                            
                            // Limit total elements to avoid huge data
                            if (elements.length >= 500) return;
                        });
                    });
                    
                    return elements;
                }
            """)
            
            return structure
        except Exception as e:
            print(f"Error extracting HTML structure: {e}")
            return []

    async def extract_and_save_data(self, page, depth, proxy_used, fingerprint):
        """Extracts all data types and saves to database and files."""
        url = page.url
        
        title = await page.title()
        description = "No description"
        try:
            desc = page.locator('meta[name="description"]').first
            if await desc.count() > 0:
                description = await desc.get_attribute("content")
        except:
            pass

        structured_data = []
        scripts = await page.locator('script[type="application/ld+json"]').all()
        for script in scripts:
            try:
                text = await script.inner_text()
                structured_data.append(json.loads(text))
            except:
                continue

        headers = {}
        for h in ['h1', 'h2', 'h3']:
            headers[h] = await page.locator(h).all_inner_texts()

        try:
            full_text = await page.locator("body").inner_text()
        except:
            full_text = ""

        media = []
        imgs = await page.locator("img").all()
        for img in imgs:
            try:
                src = await img.get_attribute("src") or await img.get_attribute("data-src")
                alt = await img.get_attribute("alt") or ""
                
                if src:
                    # Handle relative URLs
                    if not src.startswith("http"):
                        # Handle protocol-relative URLs (//example.com/image.jpg)
                        if src.startswith("//"):
                            src = "https:" + src
                        # Handle absolute paths (/images/photo.jpg)
                        elif src.startswith("/"):
                            src = urljoin(url, src)
                        # Handle relative paths (images/photo.jpg)
                        else:
                            src = urljoin(url, src)
                    
                    # Only add if it's a valid HTTP(S) URL
                    if src.startswith("http"):
                        media.append({"src": src, "alt": alt})
            except:
                continue

        internal_links = []
        external_links = []
        links = await page.locator("a").all()
        
        for link in links:
            try:
                href = await link.get_attribute("href")
                if not href:
                    continue
                
                full_url = urljoin(url, href)
                clean_url = self._normalize_url(full_url)
                parsed_href = urlparse(clean_url)
                
                if parsed_href.netloc == self.domain:
                    internal_links.append(full_url)
                elif parsed_href.scheme.startswith('http'):
                    external_links.append(full_url)
            except:
                continue

        folder_path = self._create_folder_path(url)
        
        # Extract HTML structure with selectors
        html_structure = await self.extract_html_structure(page)

        # NEW: Extract and download file assets
        file_assets = []
        if self.download_file_assets:
            print("Searching for downloadable files...")
            file_links = await self._extract_file_links(page, url)
            
            if file_links:
                print(f"Found {len(file_links)} file(s) to download")
                
                # Create downloads subfolder
                downloads_folder = os.path.join(folder_path, "downloads")
                if not os.path.exists(downloads_folder):
                    os.makedirs(downloads_folder)
                
                # Download files
                async with aiohttp.ClientSession() as session:
                    for idx, file_info in enumerate(file_links):
                        file_url = file_info['url']
                        link_text = file_info['link_text']
                        
                        # Generate filename
                        parsed_file_url = urlparse(file_url)
                        original_filename = os.path.basename(parsed_file_url.path)
                        
                        # Clean filename
                        safe_filename = re.sub(r'[^a-zA-Z0-9\-_\.]', '_', original_filename)
                        if not safe_filename or safe_filename == '_':
                            # Use link text or generic name
                            base_name = link_text if link_text else f"file_{idx+1}"
                            ext = self._get_file_extension(file_url)
                            safe_filename = f"{base_name}{ext}"
                        
                        # Ensure unique filename
                        save_path = os.path.join(downloads_folder, safe_filename)
                        counter = 1
                        while os.path.exists(save_path):
                            name, ext = os.path.splitext(safe_filename)
                            save_path = os.path.join(downloads_folder, f"{name}_{counter}{ext}")
                            counter += 1
                        
                        # Download file
                        print(f"Downloading: {safe_filename}")
                        self.downloads_stats['total_attempted'] += 1
                        
                        download_result = await self._download_file(file_url, save_path, session)
                        
                        if download_result['success']:
                            self.downloads_stats['successful'] += 1
                            self.downloads_stats['total_bytes'] += download_result['file_size']
                            
                            file_size_mb = download_result['file_size'] / (1024 * 1024)
                            print(f"Downloaded: {safe_filename} ({file_size_mb:.2f} MB)")
                            
                            file_assets.append({
                                'url': file_url,
                                'filename': safe_filename,
                                'extension': os.path.splitext(safe_filename)[1],
                                'size_bytes': download_result['file_size'],
                                'local_path': os.path.relpath(save_path, folder_path),
                                'status': 'success',
                                'mime_type': download_result['mime_type']
                            })
                        else:
                            self.downloads_stats['failed'] += 1
                            print(f"Failed: {safe_filename} - {download_result['error']}")
                            
                            file_assets.append({
                                'url': file_url,
                                'filename': safe_filename,
                                'extension': os.path.splitext(safe_filename)[1],
                                'size_bytes': 0,
                                'local_path': None,
                                'status': 'failed',
                                'mime_type': None,
                                'error': download_result['error']
                            })

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO pages (url, title, description, full_text, depth, timestamp, 
                                   folder_path, proxy_used, fingerprint, authenticated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (url, title, description, full_text, depth, time.time(), 
                  folder_path, proxy_used or "Direct", json.dumps(fingerprint),
                  bool(self.storage_state)))
            
            page_id = cursor.lastrowid
            
            for header_type, texts in headers.items():
                for text in texts:
                    cursor.execute('''
                        INSERT INTO headers (page_id, header_type, header_text)
                        VALUES (?, ?, ?)
                    ''', (page_id, header_type, text))
            
            for link in set(internal_links):
                cursor.execute('''
                    INSERT INTO links (page_id, link_type, url)
                    VALUES (?, ?, ?)
                ''', (page_id, 'internal', link))
            
            for link in set(external_links):
                cursor.execute('''
                    INSERT INTO links (page_id, link_type, url)
                    VALUES (?, ?, ?)
                ''', (page_id, 'external', link))
            
            for img in media:
                cursor.execute('''
                    INSERT INTO media (page_id, src, alt)
                    VALUES (?, ?, ?)
                ''', (page_id, img['src'], img['alt']))
            
            for data in structured_data:
                cursor.execute('''
                    INSERT INTO structured_data (page_id, json_data)
                    VALUES (?, ?)
                ''', (page_id, json.dumps(data)))
            
            # Save HTML structure
            for elem in html_structure:
                cursor.execute('''
                    INSERT INTO html_structure (page_id, tag_name, selector, text_content, attributes, parent_selector)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (page_id, elem['tag'], elem['selector'], elem['text'], 
                     json.dumps(elem['attributes']), elem['parent']))
            
            # NEW: Save file assets to database
            for file_asset in file_assets:
                cursor.execute('''
                    INSERT INTO file_assets (page_id, file_url, file_name, file_extension, 
                                            file_size_bytes, local_path, download_status, 
                                            download_timestamp, mime_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (page_id, file_asset['url'], file_asset['filename'], 
                     file_asset['extension'], file_asset['size_bytes'],
                     file_asset['local_path'], file_asset['status'],
                     time.time(), file_asset['mime_type']))
            
            conn.commit()
        except sqlite3.IntegrityError:
            pass
        finally:
            conn.close()

        # Save JSON metadata file (including file assets)
        metadata = {
            'url': url,
            'title': title,
            'description': description,
            'depth': depth,
            'timestamp': time.time(),
            'proxy_used': proxy_used or "Direct",
            'authenticated': bool(self.storage_state),
            'headers': headers,
            'media_count': len(media),
            'internal_links_count': len(set(internal_links)),
            'external_links_count': len(set(external_links)),
            'file_assets': file_assets  # NEW: Include file assets in JSON
        }
        
        with open(os.path.join(folder_path, 'metadata.json'), 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        try:
            await page.screenshot(
                path=os.path.join(folder_path, "screenshot.png"),
                full_page=True,
                timeout=10000
            )
        except:
            try:
                await page.screenshot(
                    path=os.path.join(folder_path, "screenshot.png"),
                    full_page=False
                )
            except:
                pass

        return internal_links, depth

    async def discover_and_queue_links(self, internal_links, current_depth):
        """Adds new links to queue in a thread-safe manner."""
        new_links_found = 0
        
        async with self.lock:
            for link in internal_links:
                clean_url = self._normalize_url(link)
                
                if (current_depth < self.max_depth and 
                    clean_url not in self.visited):
                    
                    self.visited.add(clean_url)
                    self.queue.append((clean_url, current_depth + 1))
                    new_links_found += 1
        
        return new_links_found

    async def create_context(self, browser, proxy=None, storage_state=None):
        """Create a new browser context with randomized fingerprint, optional proxy, and auth state."""
        fingerprint = self._generate_fingerprint()
        
        context_options = {
            "user_agent": fingerprint["user_agent"],
            "viewport": fingerprint["viewport"],
            "timezone_id": fingerprint["timezone_id"],
            "geolocation": fingerprint["geolocation"],
            "permissions": ["geolocation"],
            "locale": fingerprint["locale"],
            "device_scale_factor": fingerprint["device_scale_factor"],
            "is_mobile": fingerprint["is_mobile"],
            "has_touch": fingerprint["has_touch"],
        }
        
        # Add storage state if provided (for authentication)
        if storage_state:
            context_options["storage_state"] = storage_state
        
        # Add proxy if provided
        if proxy:
            parsed_proxy = urlparse(proxy)
            proxy_config = {
                "server": f"{parsed_proxy.scheme}://{parsed_proxy.hostname}:{parsed_proxy.port}"
            }
            
            if parsed_proxy.username and parsed_proxy.password:
                proxy_config["username"] = parsed_proxy.username
                proxy_config["password"] = parsed_proxy.password
            
            context_options["proxy"] = proxy_config
        
        context = await browser.new_context(**context_options)
        
        await context.add_init_script(f"""
            Object.defineProperty(screen, 'width', {{
                get: () => {fingerprint['screen']['width']}
            }});
            Object.defineProperty(screen, 'height', {{
                get: () => {fingerprint['screen']['height']}
            }});
        """)
        
        return context, fingerprint

    async def process_page(self, browser, url, depth):
        """Process a single page: visit, extract, save."""
        page = None
        context = None
        proxy = await self._get_next_proxy()
        fingerprint = None
        
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Create new context with fingerprint, proxy, and auth state
                context, fingerprint = await self.create_context(
                    browser, 
                    proxy, 
                    storage_state=self.storage_state
                )
                page = await context.new_page()
                
                proxy_display = f"via {proxy}" if proxy else "Direct"
                auth_display = "[Auth]" if self.storage_state else "[Guest]"
                print(f"{auth_display} Visiting (Depth {depth}) {proxy_display}: {url}")
                
                await page.goto(url, wait_until="domcontentloaded", timeout=45000)
                
                await self.smart_scroll(page)
                
                internal_links, depth = await self.extract_and_save_data(page, depth, proxy, fingerprint)
                
                new_links = await self.discover_and_queue_links(internal_links, depth)
                
                print(f"Completed {url} - Found {new_links} new links")
                
                await asyncio.sleep(random.uniform(0.5, 1.5))
                
                break
                
            except Exception as e:
                retry_count += 1
                error_msg = str(e)
                
                if proxy and any(keyword in error_msg.lower() for keyword in 
                                ['proxy', 'connection', 'timeout', 'refused']):
                    await self._mark_proxy_failed(proxy)
                    proxy = await self._get_next_proxy()
                    print(f"Retrying with different proxy ({retry_count}/{max_retries})")
                else:
                    print(f"Failed {url}: {e}")
                    if retry_count < max_retries:
                        print(f"Retrying ({retry_count}/{max_retries})")
                        await asyncio.sleep(2)
                    
            finally:
                if page:
                    await page.close()
                if context:
                    await context.close()

    async def worker(self, browser, worker_id):
        """Worker coroutine that processes pages from the queue."""
        while True:
            if self.should_stop:
                print(f"[Worker {worker_id}] Stopping...")
                break
            
            url = None
            depth = 0
            
            async with self.lock:
                if not self.queue or self.pages_scraped >= self.max_pages:
                    break
                
                url, depth = self.queue.popleft()
                self.pages_scraped += 1
                current_count = self.pages_scraped
            
            print(f"\n[Worker {worker_id}] [{current_count}/{self.max_pages}]")
            await self.process_page(browser, url, depth)

    async def run(self):
        """Main async run method with parallel workers."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox"
                ]
            )
            
            # Perform login if credentials provided
            if self.login_url:
                login_success = await self.perform_login(browser)
                if not login_success:
                    print("\nLogin failed. Continuing without authentication...")
                    # Auto-continue without user input for API compatibility
            
            print(f"Starting Authenticated Async Crawl on: {self.start_url}")
            print(f"Max Pages: {self.max_pages}")
            print(f"Max Depth: {self.max_depth}")
            print(f"Concurrent Workers: {self.concurrent_limit}")
            print(f"Proxies Loaded: {len(self.proxies)}")
            print("Fingerprint Randomization: Enabled")
            print(f"Authentication: {'Enabled' if self.storage_state else 'Disabled'}")
            print(f"File Download: {'Enabled' if self.download_file_assets else 'Disabled'}")
            if self.download_file_assets:
                print(f"Max File Size: {self.max_file_size_mb} MB")
            print(f"Database: {self.db_path}")
            print("-" * 70)
            
            workers = [
                self.worker(browser, i+1) 
                for i in range(self.concurrent_limit)
            ]
            
            await asyncio.gather(*workers)
            
            await browser.close()
            
            print("\n" + "=" * 70)
            print("Crawl Complete!")
            print(f"Total Pages Scraped: {self.pages_scraped}")
            print(f"Database Location: {self.db_path}")
            print(f"Failed Proxies: {len(self.failed_proxies)}")
            if self.storage_state:
                print(f"Auth State Saved: {self.auth_state_file}")
            
            # Show download statistics
            if self.download_file_assets and self.downloads_stats['total_attempted'] > 0:
                print("\nDownload Statistics:")
                print(f"Total Attempted: {self.downloads_stats['total_attempted']}")
                print(f"Successful: {self.downloads_stats['successful']}")
                print(f"Failed: {self.downloads_stats['failed']}")
                total_mb = self.downloads_stats['total_bytes'] / (1024 * 1024)
                print(f"Total Downloaded: {total_mb:.2f} MB")
            
            print("=" * 70)
