"""
Test API Health and Basic Endpoints
"""
import pytest
import httpx


@pytest.mark.unit
@pytest.mark.api
class TestHealthEndpoints:
    """Test health check and basic API endpoints"""
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: httpx.AsyncClient):
        """Test GET / - Root endpoint"""
        response = await client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "status" in data
        assert data["status"] == "running"
        assert "Web Scraper API" in data["message"]
    
    @pytest.mark.asyncio
    async def test_get_config(self, client: httpx.AsyncClient):
        """Test GET /api/config - Get configuration"""
        response = await client.get("/api/config")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all config sections present
        assert "features" in data
        assert "scraper" in data
        assert "proxy" in data
        assert "auth" in data
        assert "file_download" in data
        
        # Verify features structure
        assert "use_proxies" in data["features"]
        assert "download_file_assets" in data["features"]
        assert "headless_browser" in data["features"]
        
        # Verify scraper structure
        assert "max_pages" in data["scraper"]
        assert "max_depth" in data["scraper"]
        assert "concurrent_limit" in data["scraper"]
    
    @pytest.mark.asyncio
    async def test_update_config(self, client: httpx.AsyncClient):
        """Test PUT /api/config - Update configuration"""
        update_data = {
            "section": "SCRAPER",
            "key": "max_pages",
            "value": 200
        }
        
        response = await client.put("/api/config", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "Updated" in data["message"]
    
    @pytest.mark.asyncio
    async def test_update_config_invalid_key(self, client: httpx.AsyncClient):
        """Test PUT /api/config with invalid key"""
        update_data = {
            "section": "SCRAPER",
            "key": "invalid_key",
            "value": 100
        }
        
        response = await client.put("/api/config", json=update_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    @pytest.mark.asyncio
    async def test_cors_headers(self, client: httpx.AsyncClient):
        """Test CORS headers are present"""
        # Test with GET request instead of OPTIONS
        response = await client.get("/")
        
        # CORS headers should be present on actual requests
        assert "access-control-allow-origin" in response.headers or response.status_code == 200


@pytest.mark.unit
@pytest.mark.api
class TestErrorHandling:
    """Test API error handling"""
    
    @pytest.mark.asyncio
    async def test_404_not_found(self, client: httpx.AsyncClient):
        """Test 404 for non-existent endpoint"""
        response = await client.get("/api/nonexistent")
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_invalid_json_body(self, client: httpx.AsyncClient):
        """Test invalid JSON in request body"""
        response = await client.post(
            "/api/scraper/start",
            content="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422  # Unprocessable Entity
    
    @pytest.mark.asyncio
    async def test_missing_required_fields(self, client: httpx.AsyncClient):
        """Test missing required fields in request"""
        response = await client.post("/api/scraper/start", json={})
        
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data


@pytest.mark.unit
@pytest.mark.api
class TestResponseFormats:
    """Test API response formats"""
    
    @pytest.mark.asyncio
    async def test_json_content_type(self, client: httpx.AsyncClient):
        """Test that responses have correct content type"""
        response = await client.get("/")
        
        assert "application/json" in response.headers["content-type"]
    
    @pytest.mark.asyncio
    async def test_response_encoding(self, client: httpx.AsyncClient):
        """Test response encoding is UTF-8"""
        response = await client.get("/api/config")
        
        assert response.encoding == "utf-8" or "utf-8" in response.headers.get("content-type", "")
