"""
Integration Tests - End-to-End Workflows
"""
import pytest
import httpx
import asyncio


@pytest.mark.integration
@pytest.mark.slow
class TestScrapingWorkflow:
    """Test complete scraping workflow"""
    
    @pytest.mark.asyncio
    async def test_complete_scraping_cycle(self, client: httpx.AsyncClient):
        """Test complete scraping cycle: start -> monitor -> stop"""
        # 1. Start scraper
        config = {
            "start_url": "https://example.com",
            "max_pages": 5,
            "max_depth": 1,
            "headless": True,
            "download_file_assets": False
        }
        
        start_response = await client.post("/api/scraper/start", json=config)
        assert start_response.status_code == 200
        
        # 2. Monitor status
        await asyncio.sleep(2)
        status_response = await client.get("/api/scraper/status")
        assert status_response.status_code == 200
        status_data = status_response.json()
        assert "running" in status_data
        
        # 3. Stop scraper
        stop_response = await client.post("/api/scraper/stop")
        assert stop_response.status_code == 200
        
        # 4. Verify stopped
        final_status = await client.get("/api/scraper/status")
        assert final_status.status_code == 200
    
    @pytest.mark.asyncio
    async def test_pause_resume_workflow(self, client: httpx.AsyncClient):
        """Test pause and resume workflow"""
        # Start scraper
        config = {"start_url": "https://example.com", "max_pages": 10}
        await client.post("/api/scraper/start", json=config)
        
        await asyncio.sleep(1)
        
        # Pause
        pause_response = await client.post("/api/scraper/pause")
        assert pause_response.status_code == 200
        
        # Resume
        resume_response = await client.post("/api/scraper/resume")
        assert resume_response.status_code == 200
        
        # Stop
        await client.post("/api/scraper/stop")


@pytest.mark.integration
class TestDataWorkflow:
    """Test data retrieval workflow"""
    
    @pytest.mark.asyncio
    async def test_data_retrieval_workflow(self, client: httpx.AsyncClient):
        """Test retrieving data after scraping"""
        # 1. Get statistics
        stats_response = await client.get("/api/data/stats")
        assert stats_response.status_code == 200
        
        # 2. Get pages
        pages_response = await client.get("/api/data/pages?limit=10")
        assert pages_response.status_code == 200
        
        # 3. Get files
        files_response = await client.get("/api/data/files?limit=10")
        assert files_response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_search_workflow(self, client: httpx.AsyncClient):
        """Test search workflow"""
        # Search content
        search_data = {"keyword": "test", "limit": 10}
        content_response = await client.post("/api/data/search/content", json=search_data)
        assert content_response.status_code == 200
        
        # Search files
        file_response = await client.post("/api/data/search/files", json=search_data)
        assert file_response.status_code == 200


@pytest.mark.integration
class TestAnalyticsWorkflow:
    """Test analytics workflow"""
    
    @pytest.mark.asyncio
    async def test_analytics_workflow(self, client: httpx.AsyncClient):
        """Test retrieving various analytics"""
        # Performance analytics
        perf_response = await client.get("/api/analytics/performance")
        assert perf_response.status_code == 200
        
        # Domain statistics
        domain_response = await client.get("/api/data/analytics/domains")
        assert domain_response.status_code == 200
        
        # Depth distribution
        depth_response = await client.get("/api/data/analytics/depth-distribution")
        assert depth_response.status_code == 200
        
        # File type analytics
        file_response = await client.get("/api/data/analytics/file-types")
        assert file_response.status_code == 200


@pytest.mark.integration
class TestChangeDetectionWorkflow:
    """Test change detection workflow"""
    
    @pytest.mark.asyncio
    async def test_change_detection_workflow(self, client: httpx.AsyncClient):
        """Test change detection workflow"""
        # Get monitored URLs
        monitored_response = await client.get("/api/diff/monitored-urls")
        assert monitored_response.status_code == 200
        
        # Get change history for a URL
        url = "https://example.com"
        history_response = await client.get(f"/api/diff/history/{url}")
        assert history_response.status_code == 200
        
        # Get snapshots
        snapshots_response = await client.get(f"/api/diff/snapshots/{url}")
        assert snapshots_response.status_code == 200


@pytest.mark.integration
class TestConfigurationWorkflow:
    """Test configuration workflow"""
    
    @pytest.mark.asyncio
    async def test_configuration_workflow(self, client: httpx.AsyncClient):
        """Test configuration update workflow"""
        # Get current config
        get_response = await client.get("/api/config")
        assert get_response.status_code == 200
        original_config = get_response.json()
        
        # Update config
        update_data = {
            "section": "SCRAPER",
            "key": "max_pages",
            "value": 150
        }
        update_response = await client.put("/api/config", json=update_data)
        assert update_response.status_code == 200
        
        # Verify update
        verify_response = await client.get("/api/config")
        assert verify_response.status_code == 200
        updated_config = verify_response.json()
        assert updated_config["scraper"]["max_pages"] == 150
        
        # Restore original
        restore_data = {
            "section": "SCRAPER",
            "key": "max_pages",
            "value": original_config["scraper"]["max_pages"]
        }
        await client.put("/api/config", json=restore_data)


@pytest.mark.integration
@pytest.mark.slow
class TestSelectorFinderWorkflow:
    """Test selector finder workflow"""
    
    @pytest.mark.asyncio
    async def test_selector_finder_workflow(self, client: httpx.AsyncClient):
        """Test selector finder workflow"""
        # Analyze login page
        analyze_data = {"login_url": "https://example.com/login"}
        analyze_response = await client.post("/api/selector-finder/analyze", json=analyze_data)
        
        if analyze_response.status_code == 200:
            # Test selector
            test_data = {
                "url": "https://example.com",
                "selector": "button"
            }
            test_response = await client.post("/api/selector-finder/test-selector", json=test_data)
            assert test_response.status_code in [200, 500]


@pytest.mark.integration
class TestErrorRecovery:
    """Test error recovery scenarios"""
    
    @pytest.mark.asyncio
    async def test_stop_non_running_scraper(self, client: httpx.AsyncClient):
        """Test stopping scraper when not running"""
        response = await client.post("/api/scraper/stop")
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_invalid_page_id(self, client: httpx.AsyncClient):
        """Test accessing non-existent page"""
        response = await client.get("/api/data/page/999999")
        assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_invalid_config_update(self, client: httpx.AsyncClient):
        """Test invalid configuration update"""
        update_data = {
            "section": "INVALID",
            "key": "invalid_key",
            "value": 100
        }
        response = await client.put("/api/config", json=update_data)
        assert response.status_code in [400, 500]
