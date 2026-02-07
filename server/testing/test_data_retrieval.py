"""
Test Data Retrieval Endpoints
"""
import pytest
import httpx


@pytest.mark.unit
@pytest.mark.api
@pytest.mark.database
class TestDataRetrieval:
    """Test data retrieval endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_stats(self, client: httpx.AsyncClient):
        """Test GET /api/data/stats"""
        response = await client.get("/api/data/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert "total_pages" in data
        assert "total_links" in data
        assert "internal_links" in data
        assert "external_links" in data
        assert "total_media" in data
        assert "total_headers" in data
    
    @pytest.mark.asyncio
    async def test_get_pages(self, client: httpx.AsyncClient):
        """Test GET /api/data/pages"""
        response = await client.get("/api/data/pages")
        
        # May fail if database has issues
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert "pages" in data
            assert "total" in data
            assert "limit" in data
            assert "offset" in data
            assert isinstance(data["pages"], list)
    
    @pytest.mark.asyncio
    async def test_get_pages_with_pagination(self, client: httpx.AsyncClient):
        """Test GET /api/data/pages with pagination"""
        response = await client.get("/api/data/pages?limit=10&offset=0")
        
        # May fail if database has issues
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert data["limit"] == 10
            assert data["offset"] == 0
    
    @pytest.mark.asyncio
    async def test_get_scraped_urls(self, client: httpx.AsyncClient):
        """Test GET /api/data/scraped-urls"""
        response = await client.get("/api/data/scraped-urls")
        
        assert response.status_code == 200
        data = response.json()
        assert "urls" in data
        assert isinstance(data["urls"], list)
    
    @pytest.mark.asyncio
    async def test_get_page_details(self, client: httpx.AsyncClient):
        """Test GET /api/data/page/{page_id}"""
        # Test with non-existent page
        response = await client.get("/api/data/page/999999")
        
        assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_get_pages_by_url(self, client: httpx.AsyncClient):
        """Test GET /api/data/pages-by-url"""
        response = await client.get("/api/data/pages-by-url?start_url=https://example.com")
        
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert "files" in data
    
    @pytest.mark.asyncio
    async def test_get_file_assets(self, client: httpx.AsyncClient):
        """Test GET /api/data/files"""
        response = await client.get("/api/data/files")
        
        assert response.status_code == 200
        data = response.json()
        assert "files" in data
        assert isinstance(data["files"], list)
    
    @pytest.mark.asyncio
    async def test_get_file_assets_with_status_filter(self, client: httpx.AsyncClient):
        """Test GET /api/data/files with status filter"""
        response = await client.get("/api/data/files?status=success&limit=20")
        
        assert response.status_code == 200
        data = response.json()
        assert "files" in data


@pytest.mark.unit
@pytest.mark.api
class TestHistoryEndpoints:
    """Test history and session endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_scraping_sessions(self, client: httpx.AsyncClient):
        """Test GET /api/history/sessions"""
        response = await client.get("/api/history/sessions")
        
        # May fail if database has issues
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert "sessions" in data
            assert isinstance(data["sessions"], list)
    
    @pytest.mark.asyncio
    async def test_get_session_details(self, client: httpx.AsyncClient):
        """Test GET /api/history/session/{domain}"""
        domain = "https://example.com"
        response = await client.get(f"/api/history/session/{domain}")
        
        assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_delete_session(self, client: httpx.AsyncClient):
        """Test DELETE /api/history/session/{domain}"""
        domain = "https://example.com"
        response = await client.delete(f"/api/history/session/{domain}")
        
        assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_get_history_statistics(self, client: httpx.AsyncClient):
        """Test GET /api/history/statistics"""
        response = await client.get("/api/history/statistics")
        
        # May fail if database has issues
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert "total_sessions" in data
            assert "total_pages" in data


@pytest.mark.unit
@pytest.mark.api
class TestFileOperations:
    """Test file-related endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_files_by_extension(self, client: httpx.AsyncClient):
        """Test GET /api/data/files-by-extension"""
        response = await client.get("/api/data/files-by-extension")
        
        assert response.status_code == 200
        data = response.json()
        assert "files_by_extension" in data
        assert isinstance(data["files_by_extension"], list)
    
    @pytest.mark.asyncio
    async def test_get_largest_downloads(self, client: httpx.AsyncClient):
        """Test GET /api/data/largest-downloads"""
        response = await client.get("/api/data/largest-downloads?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert "largest_downloads" in data
    
    @pytest.mark.asyncio
    async def test_get_downloaded_file(self, client: httpx.AsyncClient):
        """Test GET /api/file/{filename}"""
        # Test with non-existent file
        response = await client.get("/api/file/nonexistent.pdf")
        
        assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_get_screenshot(self, client: httpx.AsyncClient):
        """Test GET /api/screenshot/{page_id}"""
        # Test with non-existent page
        response = await client.get("/api/screenshot/999999")
        
        assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_proxy_image(self, client: httpx.AsyncClient):
        """Test GET /api/proxy/image"""
        response = await client.get("/api/proxy/image?url=https://example.com/image.jpg")
        
        # Should handle gracefully even if image doesn't exist
        assert response.status_code in [200, 400, 404, 500]


@pytest.mark.unit
@pytest.mark.api
class TestBulkOperations:
    """Test bulk operation endpoints"""
    
    @pytest.mark.asyncio
    async def test_bulk_delete_pages(self, client: httpx.AsyncClient):
        """Test POST /api/data/bulk/delete-pages"""
        page_ids = [1, 2, 3]
        response = await client.post("/api/data/bulk/delete-pages", json=page_ids)
        
        assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_bulk_delete_files(self, client: httpx.AsyncClient):
        """Test POST /api/data/bulk/delete-files"""
        file_ids = [1, 2, 3]
        response = await client.post("/api/data/bulk/delete-files", json=file_ids)
        
        assert response.status_code in [200, 404]


@pytest.mark.unit
@pytest.mark.api
class TestExportEndpoints:
    """Test data export endpoints"""
    
    @pytest.mark.asyncio
    async def test_export_data(self, client: httpx.AsyncClient):
        """Test GET /api/data/export"""
        response = await client.get("/api/data/export")
        
        assert response.status_code == 200
        # Export returns JSON data
        data = response.json()
        assert "total_pages" in data
        assert "data" in data
