"""
Test Analytics Endpoints
"""
import pytest
import httpx


@pytest.mark.unit
@pytest.mark.api
class TestPerformanceAnalytics:
    """Test performance analytics endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_performance_analytics(self, client: httpx.AsyncClient):
        """Test GET /api/analytics/performance"""
        response = await client.get("/api/analytics/performance")
        
        assert response.status_code == 200
        data = response.json()
        assert "proxy_stats" in data
        assert "depth_stats" in data
        assert "timeline" in data
        assert isinstance(data["proxy_stats"], list)
        assert isinstance(data["depth_stats"], list)
    
    @pytest.mark.asyncio
    async def test_get_fingerprint_analytics(self, client: httpx.AsyncClient):
        """Test GET /api/analytics/fingerprints"""
        response = await client.get("/api/analytics/fingerprints")
        
        assert response.status_code == 200
        data = response.json()
        assert "timezones" in data
        assert "viewports" in data
        assert "user_agents" in data
        assert "locales" in data
        assert "diversity_score" in data
        assert "total_pages" in data
    
    @pytest.mark.asyncio
    async def test_get_geolocation_analytics(self, client: httpx.AsyncClient):
        """Test GET /api/analytics/geolocation"""
        response = await client.get("/api/analytics/geolocation")
        
        assert response.status_code == 200
        data = response.json()
        assert "locations" in data
        assert "total_pages" in data
        assert isinstance(data["locations"], list)


@pytest.mark.unit
@pytest.mark.api
class TestDataAnalytics:
    """Test data analytics endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_scraping_timeline(self, client: httpx.AsyncClient):
        """Test GET /api/data/analytics/timeline"""
        response = await client.get("/api/data/analytics/timeline")
        
        assert response.status_code == 200
        data = response.json()
        assert "timeline" in data
        assert isinstance(data["timeline"], list)
    
    @pytest.mark.asyncio
    async def test_get_domain_statistics(self, client: httpx.AsyncClient):
        """Test GET /api/data/analytics/domains"""
        response = await client.get("/api/data/analytics/domains")
        
        assert response.status_code == 200
        data = response.json()
        assert "domains" in data
        assert isinstance(data["domains"], list)
    
    @pytest.mark.asyncio
    async def test_get_depth_distribution(self, client: httpx.AsyncClient):
        """Test GET /api/data/analytics/depth-distribution"""
        response = await client.get("/api/data/analytics/depth-distribution")
        
        assert response.status_code == 200
        data = response.json()
        assert "depth_distribution" in data
        assert isinstance(data["depth_distribution"], list)
    
    @pytest.mark.asyncio
    async def test_get_file_type_analytics(self, client: httpx.AsyncClient):
        """Test GET /api/data/analytics/file-types"""
        response = await client.get("/api/data/analytics/file-types")
        
        assert response.status_code == 200
        data = response.json()
        assert "file_analytics" in data
        assert isinstance(data["file_analytics"], list)
    
    @pytest.mark.asyncio
    async def test_get_link_analysis(self, client: httpx.AsyncClient):
        """Test GET /api/data/analytics/link-analysis"""
        response = await client.get("/api/data/analytics/link-analysis")
        
        assert response.status_code == 200
        data = response.json()
        assert "broken_links" in data
        assert "most_referenced_pages" in data
        assert isinstance(data["broken_links"], list)
        assert isinstance(data["most_referenced_pages"], list)
    
    @pytest.mark.asyncio
    async def test_get_top_links(self, client: httpx.AsyncClient):
        """Test GET /api/data/top-links"""
        response = await client.get("/api/data/top-links?link_type=internal&limit=10")
        
        assert response.status_code == 200
        data = response.json()
        assert "top_links" in data
        assert isinstance(data["top_links"], list)
    
    @pytest.mark.asyncio
    async def test_compare_domains(self, client: httpx.AsyncClient):
        """Test GET /api/data/compare/domains"""
        domains = "https://example.com,https://test.com"
        response = await client.get(f"/api/data/compare/domains?domains={domains}")
        
        assert response.status_code == 200
        data = response.json()
        assert "comparison" in data
        assert isinstance(data["comparison"], list)


@pytest.mark.unit
@pytest.mark.api
class TestAnalyticsDataValidation:
    """Test analytics data validation"""
    
    @pytest.mark.asyncio
    async def test_timeline_data_structure(self, client: httpx.AsyncClient):
        """Test timeline data has correct structure"""
        response = await client.get("/api/data/analytics/timeline")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["timeline"]) > 0:
            item = data["timeline"][0]
            assert "date" in item
            assert "pages_scraped" in item
    
    @pytest.mark.asyncio
    async def test_domain_stats_structure(self, client: httpx.AsyncClient):
        """Test domain statistics have correct structure"""
        response = await client.get("/api/data/analytics/domains")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["domains"]) > 0:
            domain = data["domains"][0]
            assert "domain" in domain
            assert "page_count" in domain
    
    @pytest.mark.asyncio
    async def test_depth_distribution_structure(self, client: httpx.AsyncClient):
        """Test depth distribution has correct structure"""
        response = await client.get("/api/data/analytics/depth-distribution")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["depth_distribution"]) > 0:
            item = data["depth_distribution"][0]
            assert "depth" in item
            assert "page_count" in item
