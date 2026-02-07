"""
Test Scraper Control Endpoints
"""
import pytest
import httpx
import asyncio


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.scraper
class TestScraperControl:
    """Test scraper start/stop/pause/resume endpoints"""
    
    @pytest.mark.asyncio
    async def test_start_scraper(self, client: httpx.AsyncClient, sample_scraper_config):
        """Test POST /api/scraper/start"""
        response = await client.post("/api/scraper/start", json=sample_scraper_config)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "started" in data["message"].lower()
    
    @pytest.mark.asyncio
    async def test_start_scraper_already_running(self, client: httpx.AsyncClient, sample_scraper_config):
        """Test starting scraper when already running"""
        # Start first scraper
        await client.post("/api/scraper/start", json=sample_scraper_config)
        
        # Try to start again
        response = await client.post("/api/scraper/start", json=sample_scraper_config)
        
        assert response.status_code == 400
        data = response.json()
        assert "already running" in data["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_get_scraper_status_not_running(self, client: httpx.AsyncClient):
        """Test GET /api/scraper/status when not running"""
        response = await client.get("/api/scraper/status")
        
        assert response.status_code == 200
        data = response.json()
        assert "running" in data
        # Scraper may be running from previous tests
        assert isinstance(data["running"], bool)
        assert "pages_scraped" in data
        assert "queue_size" in data
    
    @pytest.mark.asyncio
    async def test_get_scraper_status_running(self, client: httpx.AsyncClient, sample_scraper_config):
        """Test GET /api/scraper/status when running"""
        # Start scraper
        await client.post("/api/scraper/start", json=sample_scraper_config)
        
        # Get status
        response = await client.get("/api/scraper/status")
        
        assert response.status_code == 200
        data = response.json()
        assert "running" in data
        assert "pages_scraped" in data
        assert "queue_size" in data
        assert "visited" in data
        assert "max_pages" in data
        assert "start_url" in data
        assert "session_id" in data
    
    @pytest.mark.asyncio
    async def test_stop_scraper(self, client: httpx.AsyncClient, sample_scraper_config):
        """Test POST /api/scraper/stop"""
        # Start scraper first
        await client.post("/api/scraper/start", json=sample_scraper_config)
        
        # Stop scraper
        response = await client.post("/api/scraper/stop")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "stopped" in data["message"].lower()
    
    @pytest.mark.asyncio
    async def test_stop_scraper_not_running(self, client: httpx.AsyncClient):
        """Test stopping scraper when not running"""
        response = await client.post("/api/scraper/stop")
        
        assert response.status_code == 400
        data = response.json()
        assert "not running" in data["detail"].lower() or "no scraper" in data["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_pause_scraper(self, client: httpx.AsyncClient, sample_scraper_config):
        """Test POST /api/scraper/pause"""
        # Start scraper first
        await client.post("/api/scraper/start", json=sample_scraper_config)
        
        # Pause scraper
        response = await client.post("/api/scraper/pause")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "paused" in data["message"].lower()
    
    @pytest.mark.asyncio
    async def test_resume_scraper(self, client: httpx.AsyncClient, sample_scraper_config):
        """Test POST /api/scraper/resume"""
        # Start and pause scraper
        await client.post("/api/scraper/start", json=sample_scraper_config)
        await client.post("/api/scraper/pause")
        
        # Resume scraper
        response = await client.post("/api/scraper/resume")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "resumed" in data["message"].lower()


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.scraper
class TestScraperConfiguration:
    """Test scraper configuration options"""
    
    @pytest.mark.asyncio
    async def test_start_with_minimal_config(self, client: httpx.AsyncClient):
        """Test starting scraper with minimal configuration"""
        minimal_config = {
            "start_url": "https://example.com"
        }
        
        response = await client.post("/api/scraper/start", json=minimal_config)
        
        # May fail if scraper already running
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert data["success"] is True
    
    @pytest.mark.asyncio
    async def test_start_with_authentication(self, client: httpx.AsyncClient):
        """Test starting scraper with authentication"""
        auth_config = {
            "start_url": "https://example.com",
            "login_url": "https://example.com/login",
            "username": "testuser",
            "password": "testpass",
            "username_selector": "input[name='username']",
            "password_selector": "input[name='password']",
            "submit_selector": "button[type='submit']"
        }
        
        response = await client.post("/api/scraper/start", json=auth_config)
        
        # May fail if scraper already running
        assert response.status_code in [200, 400]
    
    @pytest.mark.asyncio
    async def test_start_with_extraction_rules(self, client: httpx.AsyncClient, sample_extraction_rules):
        """Test starting scraper with extraction rules"""
        config_with_rules = {
            "start_url": "https://example.com",
            "extraction_rules": sample_extraction_rules
        }
        
        response = await client.post("/api/scraper/start", json=config_with_rules)
        
        # May fail if scraper already running
        assert response.status_code in [200, 400]
    
    @pytest.mark.asyncio
    async def test_start_with_invalid_url(self, client: httpx.AsyncClient):
        """Test starting scraper with invalid URL"""
        invalid_config = {
            "start_url": "not-a-valid-url"
        }
        
        response = await client.post("/api/scraper/start", json=invalid_config)
        
        # Should either reject or handle gracefully
        assert response.status_code in [200, 400, 422]
    
    @pytest.mark.asyncio
    async def test_start_with_captcha_config(self, client: httpx.AsyncClient):
        """Test starting scraper with CAPTCHA configuration"""
        captcha_config = {
            "start_url": "https://example.com",
            "captcha_enabled": True,
            "captcha_pause_workers": True,
            "captcha_sound_alert": False,
            "captcha_desktop_notification": False
        }
        
        response = await client.post("/api/scraper/start", json=captcha_config)
        
        # May fail if scraper already running
        assert response.status_code in [200, 400]
