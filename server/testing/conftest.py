"""
Pytest Configuration and Shared Fixtures
"""
import pytest
import asyncio
import os
import sys
import sqlite3
import httpx
from typing import Generator, AsyncGenerator
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import config

# Test Configuration
TEST_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
TEST_DB_PATH = os.getenv("TEST_DATABASE_PATH", "test_scraped_data.db")
TEST_TIMEOUT = int(os.getenv("TEST_TIMEOUT", "60"))


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def base_url() -> str:
    """Base URL for API requests"""
    return TEST_BASE_URL


@pytest.fixture
async def client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Async HTTP client for API testing"""
    async with httpx.AsyncClient(base_url=TEST_BASE_URL, timeout=TEST_TIMEOUT) as client:
        yield client


@pytest.fixture
def sync_client() -> Generator[httpx.Client, None, None]:
    """Synchronous HTTP client for API testing"""
    with httpx.Client(base_url=TEST_BASE_URL, timeout=TEST_TIMEOUT) as client:
        yield client


@pytest.fixture(scope="function")
def test_db():
    """Create and cleanup test database"""
    # Setup: Create test database
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    
    conn = sqlite3.connect(TEST_DB_PATH)
    cursor = conn.cursor()
    
    # Create minimal schema for testing
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE NOT NULL,
            title TEXT,
            description TEXT,
            full_text TEXT,
            depth INTEGER,
            timestamp REAL
        )
    ''')
    
    conn.commit()
    conn.close()
    
    yield TEST_DB_PATH
    
    # Teardown: Remove test database
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)


@pytest.fixture
def sample_scraper_config():
    """Sample scraper configuration for testing"""
    return {
        "start_url": "https://example.com",
        "max_pages": 10,
        "max_depth": 2,
        "concurrent_limit": 2,
        "headless": True,
        "download_file_assets": False,
        "smart_scroll_iterations": 1,
        "captcha_enabled": False
    }


@pytest.fixture
def sample_page_data():
    """Sample page data for testing"""
    return {
        "url": "https://example.com/test",
        "title": "Test Page",
        "description": "Test Description",
        "full_text": "This is test content",
        "depth": 1,
        "timestamp": 1707309045.123
    }


@pytest.fixture
def sample_extraction_rules():
    """Sample extraction rules for testing"""
    return {
        "product_name": {
            "selector": "h1.product-title",
            "type": "text"
        },
        "price": {
            "selector": ".price",
            "type": "price"
        },
        "in_stock": {
            "selector": ".availability",
            "type": "boolean"
        }
    }


@pytest.fixture
def sample_selector_request():
    """Sample selector finder request"""
    return {
        "url": "https://example.com/login",
        "selector": "input[name='username']"
    }


@pytest.fixture
def sample_login_request():
    """Sample login test request"""
    return {
        "login_url": "https://example.com/login",
        "username": "testuser",
        "password": "testpass",
        "username_selector": "input[name='username']",
        "password_selector": "input[name='password']",
        "submit_selector": "button[type='submit']"
    }


@pytest.fixture
def sample_search_request():
    """Sample search request"""
    return {
        "keyword": "test",
        "limit": 20
    }


@pytest.fixture(autouse=True)
def reset_config():
    """Reset configuration before each test"""
    # Store original values
    original_features = config.FEATURES.copy()
    original_scraper = config.SCRAPER.copy()
    
    yield
    
    # Restore original values
    config.FEATURES.update(original_features)
    config.SCRAPER.update(original_scraper)


@pytest.fixture
def mock_proxy_list():
    """Mock proxy list for testing"""
    return [
        "http://proxy1.example.com:8080",
        "http://proxy2.example.com:8080",
        "http://proxy3.example.com:8080"
    ]


# Helper Functions

def assert_response_structure(response_data: dict, required_keys: list):
    """Assert that response contains required keys"""
    for key in required_keys:
        assert key in response_data, f"Missing required key: {key}"


def assert_valid_timestamp(timestamp: float):
    """Assert that timestamp is valid"""
    assert isinstance(timestamp, (int, float))
    assert timestamp > 0
    assert timestamp < 2000000000  # Reasonable upper bound


def assert_valid_url(url: str):
    """Assert that URL is valid"""
    assert isinstance(url, str)
    assert url.startswith(("http://", "https://"))


def assert_pagination_response(response_data: dict):
    """Assert pagination response structure"""
    assert "total" in response_data
    assert "limit" in response_data
    assert "offset" in response_data
    assert isinstance(response_data["total"], int)
    assert isinstance(response_data["limit"], int)
    assert isinstance(response_data["offset"], int)


# Pytest Hooks

def pytest_configure(config):
    """Configure pytest"""
    config.addinivalue_line(
        "markers", "smoke: Quick smoke tests"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection"""
    # Add markers based on test names
    for item in items:
        if "slow" in item.nodeid:
            item.add_marker(pytest.mark.slow)
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)


def pytest_report_header(config):
    """Add custom header to pytest report"""
    return [
        f"API Base URL: {TEST_BASE_URL}",
        f"Test Database: {TEST_DB_PATH}",
        f"Test Timeout: {TEST_TIMEOUT}s"
    ]
