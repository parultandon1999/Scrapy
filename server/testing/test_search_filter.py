"""
Test Search and Filter Endpoints
"""
import pytest
import httpx


@pytest.mark.unit
@pytest.mark.api
class TestSearchEndpoints:
    """Test search functionality"""
    
    @pytest.mark.asyncio
    async def test_search_content(self, client: httpx.AsyncClient, sample_search_request):
        """Test POST /api/data/search/content"""
        response = await client.post("/api/data/search/content", json=sample_search_request)
        
        assert response.status_code == 200
        data = response.json()
        assert "keyword" in data
        assert "results" in data
        assert "total" in data
        assert isinstance(data["results"], list)
        assert data["keyword"] == sample_search_request["keyword"]
    
    @pytest.mark.asyncio
    async def test_search_files(self, client: httpx.AsyncClient, sample_search_request):
        """Test POST /api/data/search/files"""
        response = await client.post("/api/data/search/files", json=sample_search_request)
        
        assert response.status_code == 200
        data = response.json()
        assert "keyword" in data
        assert "results" in data
        assert "total" in data
        assert isinstance(data["results"], list)
    
    @pytest.mark.asyncio
    async def test_search_with_limit(self, client: httpx.AsyncClient):
        """Test search with custom limit"""
        search_data = {
            "keyword": "test",
            "limit": 5
        }
        response = await client.post("/api/data/search/content", json=search_data)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) <= 5
    
    @pytest.mark.asyncio
    async def test_search_empty_keyword(self, client: httpx.AsyncClient):
        """Test search with empty keyword"""
        search_data = {
            "keyword": "",
            "limit": 20
        }
        response = await client.post("/api/data/search/content", json=search_data)
        
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]


@pytest.mark.unit
@pytest.mark.api
class TestFilterEndpoints:
    """Test filter functionality"""
    
    @pytest.mark.asyncio
    async def test_filter_pages_by_depth(self, client: httpx.AsyncClient):
        """Test GET /api/data/filter/pages with depth filter"""
        response = await client.get("/api/data/filter/pages?min_depth=0&max_depth=2")
        
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert "total" in data
        assert isinstance(data["pages"], list)
    
    @pytest.mark.asyncio
    async def test_filter_pages_by_files(self, client: httpx.AsyncClient):
        """Test GET /api/data/filter/pages with file filter"""
        response = await client.get("/api/data/filter/pages?has_files=true")
        
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert "total" in data
    
    @pytest.mark.asyncio
    async def test_filter_pages_by_date(self, client: httpx.AsyncClient):
        """Test GET /api/data/filter/pages with date filter"""
        response = await client.get(
            "/api/data/filter/pages?start_date=2026-01-01&end_date=2026-12-31"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert "total" in data
    
    @pytest.mark.asyncio
    async def test_filter_pages_combined(self, client: httpx.AsyncClient):
        """Test GET /api/data/filter/pages with multiple filters"""
        response = await client.get(
            "/api/data/filter/pages?min_depth=0&max_depth=3&has_files=true&limit=10"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert "total" in data
        assert len(data["pages"]) <= 10
    
    @pytest.mark.asyncio
    async def test_filter_invalid_date_format(self, client: httpx.AsyncClient):
        """Test filter with invalid date format"""
        response = await client.get(
            "/api/data/filter/pages?start_date=invalid-date"
        )
        
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]


@pytest.mark.unit
@pytest.mark.api
class TestSearchResultValidation:
    """Test search result validation"""
    
    @pytest.mark.asyncio
    async def test_content_search_result_structure(self, client: httpx.AsyncClient):
        """Test content search results have correct structure"""
        search_data = {"keyword": "test", "limit": 20}
        response = await client.post("/api/data/search/content", json=search_data)
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["results"]) > 0:
            result = data["results"][0]
            assert "url" in result
            assert "title" in result
    
    @pytest.mark.asyncio
    async def test_file_search_result_structure(self, client: httpx.AsyncClient):
        """Test file search results have correct structure"""
        search_data = {"keyword": "pdf", "limit": 20}
        response = await client.post("/api/data/search/files", json=search_data)
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["results"]) > 0:
            result = data["results"][0]
            assert "file_name" in result
            assert "file_extension" in result
