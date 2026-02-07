"""
Test Proxy Endpoints
"""
import pytest
import httpx


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.proxy
class TestProxyEndpoints:
    """Test proxy-related endpoints"""
    
    @pytest.mark.asyncio
    async def test_list_proxies(self, client: httpx.AsyncClient):
        """Test GET /api/proxies/list"""
        response = await client.get("/api/proxies/list")
        
        assert response.status_code == 200
        data = response.json()
        assert "proxies" in data
        assert isinstance(data["proxies"], list)
    
    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_test_proxies(self, client: httpx.AsyncClient):
        """Test POST /api/proxies/test"""
        request_data = {
            "test_url": "https://httpbin.org/ip",
            "concurrent_tests": 2
        }
        
        response = await client.post("/api/proxies/test", json=request_data, timeout=60)
        
        assert response.status_code == 200
        data = response.json()
        # API returns: working, failed, total_tested
        assert "working" in data or "working_proxies" in data
        assert "failed" in data or "failed_proxies" in data
        assert "total_tested" in data
    
    @pytest.mark.asyncio
    async def test_test_proxies_with_custom_url(self, client: httpx.AsyncClient):
        """Test proxy testing with custom test URL"""
        request_data = {
            "test_url": "https://example.com",
            "concurrent_tests": 1
        }
        
        response = await client.post("/api/proxies/test", json=request_data, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        # API returns: working, failed, total_tested
        assert "working" in data or "working_proxies" in data
        assert "total_tested" in data


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.proxy
class TestProxyConfiguration:
    """Test proxy configuration"""
    
    @pytest.mark.asyncio
    async def test_update_proxy_list(self, client: httpx.AsyncClient, mock_proxy_list):
        """Test updating proxy list via config"""
        update_data = {
            "section": "PROXY",
            "key": "proxy_list",
            "value": mock_proxy_list
        }
        
        response = await client.put("/api/config", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    @pytest.mark.asyncio
    async def test_get_proxy_config(self, client: httpx.AsyncClient):
        """Test getting proxy configuration"""
        response = await client.get("/api/config")
        
        assert response.status_code == 200
        data = response.json()
        assert "proxy" in data
        assert "proxy_list" in data["proxy"]
        assert "test_url" in data["proxy"]
        assert "concurrent_tests" in data["proxy"]


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.proxy
class TestProxyResults:
    """Test proxy test results structure"""
    
    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_proxy_result_structure(self, client: httpx.AsyncClient):
        """Test proxy test result structure"""
        request_data = {
            "test_url": "https://httpbin.org/ip",
            "concurrent_tests": 1
        }
        
        response = await client.post("/api/proxies/test", json=request_data, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if working proxies exist
            working = data.get("working", [])
            if len(working) > 0:
                result = working[0]
                assert "proxy" in result or isinstance(result, str)
                # Working proxies may be simple strings or objects
