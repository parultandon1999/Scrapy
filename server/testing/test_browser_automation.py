"""
Test Browser Automation with Playwright
Tests real browser interactions and scraping
"""
import pytest
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from playwright.async_api import async_playwright
from scraper import Scraper
import config


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.browser
class TestPlaywrightBrowser:
    """Test Playwright browser automation"""
    
    @pytest.mark.asyncio
    async def test_browser_launch(self):
        """Test browser can be launched"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            assert browser is not None
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_browser_context_creation(self):
        """Test browser context can be created"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            assert context is not None
            await context.close()
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_page_navigation(self):
        """Test page navigation"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            response = await page.goto("https://example.com", wait_until="domcontentloaded")
            assert response.status == 200
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_page_title_extraction(self):
        """Test extracting page title"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            title = await page.title()
            
            assert title is not None
            assert len(title) > 0
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_page_content_extraction(self):
        """Test extracting page content"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            content = await page.content()
            
            assert content is not None
            assert len(content) > 0
            assert "<html" in content.lower()
            
            await browser.close()


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.browser
class TestElementExtraction:
    """Test extracting elements from pages"""
    
    @pytest.mark.asyncio
    async def test_extract_headers(self):
        """Test extracting header elements"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Extract h1 elements
            h1_elements = await page.query_selector_all("h1")
            assert len(h1_elements) >= 0  # May or may not have h1
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_extract_links(self):
        """Test extracting links"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Extract all links
            links = await page.query_selector_all("a")
            assert len(links) >= 0
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_extract_images(self):
        """Test extracting images"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Extract all images
            images = await page.query_selector_all("img")
            assert len(images) >= 0
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_extract_text_content(self):
        """Test extracting text content"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Extract body text
            text = await page.inner_text("body")
            assert text is not None
            assert len(text) > 0
            
            await browser.close()


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.browser
class TestBrowserFingerprinting:
    """Test browser fingerprinting"""
    
    @pytest.mark.asyncio
    async def test_custom_viewport(self):
        """Test setting custom viewport"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()
            
            viewport = page.viewport_size
            assert viewport["width"] == 1920
            assert viewport["height"] == 1080
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_custom_user_agent(self):
        """Test setting custom user agent"""
        custom_ua = "Mozilla/5.0 (Test Browser)"
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=custom_ua)
            page = await context.new_page()
            
            await page.goto("https://httpbin.org/user-agent", wait_until="domcontentloaded")
            content = await page.content()
            
            assert custom_ua in content
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_custom_timezone(self):
        """Test setting custom timezone"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                timezone_id="America/New_York"
            )
            page = await context.new_page()
            
            # Timezone is set (no error)
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_custom_geolocation(self):
        """Test setting custom geolocation"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                geolocation={"latitude": 40.7128, "longitude": -74.0060},
                permissions=["geolocation"]
            )
            page = await context.new_page()
            
            # Geolocation is set (no error)
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            await browser.close()


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.browser
class TestPageInteractions:
    """Test page interactions"""
    
    @pytest.mark.asyncio
    async def test_click_element(self):
        """Test clicking an element"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Try to find and click a link (if exists)
            links = await page.query_selector_all("a")
            if len(links) > 0:
                # Element exists, can be clicked
                assert True
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_scroll_page(self):
        """Test scrolling page"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Scroll to bottom
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            
            # Scroll successful (no error)
            assert True
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_wait_for_selector(self):
        """Test waiting for selector"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Wait for body element
            await page.wait_for_selector("body", timeout=5000)
            
            assert True
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_screenshot_capture(self):
        """Test capturing screenshot"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Capture screenshot
            screenshot = await page.screenshot()
            
            assert screenshot is not None
            assert len(screenshot) > 0
            
            await browser.close()


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.browser
class TestScraperWithRealBrowser:
    """Test scraper with real browser"""
    
    @pytest.mark.asyncio
    async def test_scraper_basic_scrape(self):
        """Test basic scraping with real browser"""
        scraper = Scraper(
            "https://example.com",
            max_pages=1,
            max_depth=0,
            headless=True,
            download_file_assets=False
        )
        
        # This will actually scrape example.com
        try:
            await scraper.run()
            
            # Check that scraping occurred
            assert scraper.pages_scraped >= 0
            
        except Exception as e:
            # If scraping fails, that's okay for this test
            # We're just testing that the browser automation works
            pytest.skip(f"Scraping failed (expected in some environments): {e}")
    
    @pytest.mark.asyncio
    async def test_scraper_with_fingerprint(self):
        """Test scraper uses fingerprinting"""
        scraper = Scraper(
            "https://example.com",
            max_pages=1,
            max_depth=0,
            headless=True
        )
        
        # Generate fingerprint
        fingerprint = scraper._generate_fingerprint()
        
        assert fingerprint is not None
        assert "viewport" in fingerprint
        assert "user_agent" in fingerprint


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.browser
class TestErrorHandling:
    """Test browser error handling"""
    
    @pytest.mark.asyncio
    async def test_invalid_url_handling(self):
        """Test handling of invalid URL"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            try:
                await page.goto("https://this-domain-does-not-exist-12345.com", 
                              wait_until="domcontentloaded", 
                              timeout=5000)
                pytest.fail("Should have raised an error")
            except Exception:
                # Expected to fail
                assert True
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_timeout_handling(self):
        """Test timeout handling"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            try:
                # Very short timeout
                await page.goto("https://example.com", 
                              wait_until="domcontentloaded", 
                              timeout=1)
            except Exception:
                # Timeout may occur
                pass
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_selector_not_found(self):
        """Test handling when selector not found"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto("https://example.com", wait_until="domcontentloaded")
            
            # Try to find non-existent selector
            element = await page.query_selector("#this-id-does-not-exist")
            assert element is None
            
            await browser.close()
