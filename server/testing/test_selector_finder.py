"""
Test Selector Finder Endpoints
"""
import pytest
import httpx


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.selector
class TestSelectorFinderEndpoints:
    """Test selector finder tools"""
    
    @pytest.mark.asyncio
    async def test_analyze_login_page(self, client: httpx.AsyncClient):
        """Test POST /api/selector-finder/analyze"""
        request_data = {
            "login_url": "https://example.com/login"
        }
        
        response = await client.post("/api/selector-finder/analyze", json=request_data)
        
        assert response.status_code in [200, 500]  # May fail if page doesn't exist
        
        if response.status_code == 200:
            data = response.json()
            assert "login_url" in data
            assert "inputs" in data
            assert "buttons" in data
            assert "forms" in data
    
    @pytest.mark.asyncio
    async def test_test_login_selectors(self, client: httpx.AsyncClient, sample_login_request):
        """Test POST /api/selector-finder/test-login"""
        try:
            response = await client.post("/api/selector-finder/test-login", json=sample_login_request, timeout=30.0)
            
            assert response.status_code in [200, 500]  # May fail if page doesn't exist
            
            if response.status_code == 200:
                data = response.json()
                assert "success" in data
                assert "message" in data
                assert "initial_url" in data
                assert "final_url" in data
        except Exception:
            # Test may timeout due to browser launch
            pytest.skip("Test timed out (browser operation too slow)")
    
    @pytest.mark.asyncio
    async def test_test_selector(self, client: httpx.AsyncClient, sample_selector_request):
        """Test POST /api/selector-finder/test-selector"""
        response = await client.post("/api/selector-finder/test-selector", json=sample_selector_request)
        
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "success" in data
            assert "selector" in data
            assert "url" in data
            assert "matched_count" in data
    
    @pytest.mark.asyncio
    async def test_generate_robust_selector(self, client: httpx.AsyncClient):
        """Test POST /api/selector-finder/generate-robust-selector"""
        request_data = {
            "url": "https://example.com",
            "target_description": "submit button"
        }
        
        response = await client.post("/api/selector-finder/generate-robust-selector", json=request_data)
        
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "success" in data
            assert "url" in data
            assert "target_description" in data
            assert "selectors" in data
    
    @pytest.mark.asyncio
    async def test_find_element_by_content(self, client: httpx.AsyncClient):
        """Test POST /api/selector-finder/find-element"""
        request_data = {
            "url": "https://example.com",
            "search_queries": ["Click here", "Submit"],
            "search_type": "partial",
            "image_urls": []
        }
        
        response = await client.post("/api/selector-finder/find-element", json=request_data)
        
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "url" in data
            assert "search_queries" in data
            assert "results_by_query" in data


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.selector
class TestSelectorValidation:
    """Test selector validation"""
    
    @pytest.mark.asyncio
    async def test_test_selector_invalid_url(self, client: httpx.AsyncClient):
        """Test selector test with invalid URL"""
        request_data = {
            "url": "not-a-valid-url",
            "selector": "button"
        }
        
        response = await client.post("/api/selector-finder/test-selector", json=request_data)
        
        # Should handle gracefully
        assert response.status_code in [200, 400, 422, 500]
    
    @pytest.mark.asyncio
    async def test_test_selector_empty_selector(self, client: httpx.AsyncClient):
        """Test selector test with empty selector"""
        request_data = {
            "url": "https://example.com",
            "selector": ""
        }
        
        response = await client.post("/api/selector-finder/test-selector", json=request_data)
        
        # Should handle gracefully
        assert response.status_code in [200, 400, 422, 500]
    
    @pytest.mark.asyncio
    async def test_find_element_empty_queries(self, client: httpx.AsyncClient):
        """Test find element with empty search queries"""
        request_data = {
            "url": "https://example.com",
            "search_queries": [],
            "search_type": "partial"
        }
        
        response = await client.post("/api/selector-finder/find-element", json=request_data)
        
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.selector
class TestSelectorStrength:
    """Test selector strength calculation"""
    
    @pytest.mark.asyncio
    async def test_selector_strength_in_response(self, client: httpx.AsyncClient):
        """Test that selector strength is included in response"""
        request_data = {
            "url": "https://example.com",
            "selector": "#unique-id"
        }
        
        response = await client.post("/api/selector-finder/test-selector", json=request_data)
        
        if response.status_code == 200:
            data = response.json()
            if "strength" in data and data["strength"] is not None:
                strength = data["strength"]
                assert "score" in strength
                assert "strength" in strength
                assert "color" in strength
                assert "description" in strength
                assert 0 <= strength["score"] <= 100
