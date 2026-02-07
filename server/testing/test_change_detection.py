"""
Test Change Detection Endpoints
"""
import pytest
import httpx


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.change_detection
class TestChangeDetectionEndpoints:
    """Test change detection functionality"""
    
    @pytest.mark.asyncio
    async def test_get_monitored_urls(self, client: httpx.AsyncClient):
        """Test GET /api/diff/monitored-urls"""
        response = await client.get("/api/diff/monitored-urls")
        
        assert response.status_code == 200
        data = response.json()
        assert "monitored_urls" in data
        assert "total_urls" in data
        assert isinstance(data["monitored_urls"], list)
    
    @pytest.mark.asyncio
    async def test_get_change_history(self, client: httpx.AsyncClient):
        """Test GET /api/diff/history/{url}"""
        url = "https://example.com"
        response = await client.get(f"/api/diff/history/{url}")
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "total_changes" in data
        assert "history" in data
        assert isinstance(data["history"], list)
    
    @pytest.mark.asyncio
    async def test_get_change_history_with_limit(self, client: httpx.AsyncClient):
        """Test GET /api/diff/history/{url} with limit"""
        url = "https://example.com"
        response = await client.get(f"/api/diff/history/{url}?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["history"]) <= 5
    
    @pytest.mark.asyncio
    async def test_get_url_snapshots(self, client: httpx.AsyncClient):
        """Test GET /api/diff/snapshots/{url}"""
        url = "https://example.com"
        response = await client.get(f"/api/diff/snapshots/{url}")
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "total_snapshots" in data
        assert "snapshots" in data
        assert isinstance(data["snapshots"], list)
    
    @pytest.mark.asyncio
    async def test_compare_snapshots(self, client: httpx.AsyncClient):
        """Test GET /api/diff/compare/{snapshot_id_1}/{snapshot_id_2}"""
        # Test with non-existent snapshots
        response = await client.get("/api/diff/compare/1/2")
        
        assert response.status_code in [200, 404]


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.change_detection
class TestChangeDataStructure:
    """Test change detection data structure"""
    
    @pytest.mark.asyncio
    async def test_monitored_url_structure(self, client: httpx.AsyncClient):
        """Test monitored URL data structure"""
        response = await client.get("/api/diff/monitored-urls")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["monitored_urls"]) > 0:
            url_data = data["monitored_urls"][0]
            assert "url" in url_data
            assert "total_changes" in url_data
            assert "last_change" in url_data
    
    @pytest.mark.asyncio
    async def test_change_history_structure(self, client: httpx.AsyncClient):
        """Test change history data structure"""
        url = "https://example.com"
        response = await client.get(f"/api/diff/history/{url}")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["history"]) > 0:
            change = data["history"][0]
            assert "id" in change
            assert "change_timestamp" in change
            assert "change_type" in change
            assert "change_category" in change
            assert "change_summary" in change
            assert "severity" in change
    
    @pytest.mark.asyncio
    async def test_snapshot_structure(self, client: httpx.AsyncClient):
        """Test snapshot data structure"""
        url = "https://example.com"
        response = await client.get(f"/api/diff/snapshots/{url}")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["snapshots"]) > 0:
            snapshot = data["snapshots"][0]
            assert "id" in snapshot
            assert "url" in snapshot
            assert "snapshot_timestamp" in snapshot
            assert "title" in snapshot


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.change_detection
class TestChangeSeverity:
    """Test change severity levels"""
    
    @pytest.mark.asyncio
    async def test_severity_levels_in_monitored_urls(self, client: httpx.AsyncClient):
        """Test severity level counts in monitored URLs"""
        response = await client.get("/api/diff/monitored-urls")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["monitored_urls"]) > 0:
            url_data = data["monitored_urls"][0]
            # Check if severity counts are present
            if "high_severity_count" in url_data:
                assert isinstance(url_data["high_severity_count"], int)
            if "medium_severity_count" in url_data:
                assert isinstance(url_data["medium_severity_count"], int)
            if "low_severity_count" in url_data:
                assert isinstance(url_data["low_severity_count"], int)
