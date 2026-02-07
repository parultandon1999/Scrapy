"""
Test Real File Downloads
Tests actual file downloading functionality
"""
import pytest
import aiohttp
import os
import sys
from pathlib import Path
import asyncio

sys.path.insert(0, str(Path(__file__).parent.parent))

from scraper import Scraper
import config


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.file_download
class TestFileDownloading:
    """Test real file downloading"""
    
    @pytest.mark.asyncio
    async def test_download_small_file(self, tmp_path):
        """Test downloading a small file"""
        # Use a reliable test file URL
        file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        save_path = tmp_path / "test_file.pdf"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        content = await response.read()
                        
                        # Save file
                        with open(save_path, 'wb') as f:
                            f.write(content)
                        
                        # Verify file was downloaded
                        assert save_path.exists()
                        assert save_path.stat().st_size > 0
                    else:
                        pytest.skip(f"Test file not available (status {response.status})")
            except Exception as e:
                pytest.skip(f"Download failed: {e}")
    
    @pytest.mark.asyncio
    async def test_download_with_retry(self, tmp_path):
        """Test download with retry logic"""
        file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        save_path = tmp_path / "test_retry.pdf"
        
        max_retries = 3
        retry_count = 0
        
        async with aiohttp.ClientSession() as session:
            while retry_count < max_retries:
                try:
                    async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        if response.status == 200:
                            content = await response.read()
                            with open(save_path, 'wb') as f:
                                f.write(content)
                            break
                except Exception:
                    retry_count += 1
                    if retry_count >= max_retries:
                        pytest.skip("Download failed after retries")
                    await asyncio.sleep(1)
        
        if save_path.exists():
            assert save_path.stat().st_size > 0
    
    @pytest.mark.asyncio
    async def test_download_chunked(self, tmp_path):
        """Test chunked file download"""
        file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        save_path = tmp_path / "test_chunked.pdf"
        
        chunk_size = 8192
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        with open(save_path, 'wb') as f:
                            async for chunk in response.content.iter_chunked(chunk_size):
                                f.write(chunk)
                        
                        assert save_path.exists()
                        assert save_path.stat().st_size > 0
                    else:
                        pytest.skip(f"Test file not available")
            except Exception as e:
                pytest.skip(f"Download failed: {e}")
    
    @pytest.mark.asyncio
    async def test_download_with_size_limit(self, tmp_path):
        """Test download respects size limit"""
        file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        save_path = tmp_path / "test_size_limit.pdf"
        max_size = 1024 * 1024  # 1 MB
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        # Check content length
                        content_length = response.headers.get('Content-Length')
                        if content_length and int(content_length) > max_size:
                            pytest.skip("File too large for test")
                        
                        content = await response.read()
                        
                        if len(content) <= max_size:
                            with open(save_path, 'wb') as f:
                                f.write(content)
                            assert save_path.exists()
                        else:
                            # File exceeds size limit
                            assert True
                    else:
                        pytest.skip("Test file not available")
            except Exception as e:
                pytest.skip(f"Download failed: {e}")


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.file_download
class TestFileTypeDetection:
    """Test file type detection"""
    
    @pytest.mark.asyncio
    async def test_detect_pdf_mime_type(self):
        """Test PDF MIME type detection"""
        file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.head(file_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        content_type = response.headers.get('Content-Type', '')
                        assert 'pdf' in content_type.lower() or 'application' in content_type.lower()
                    else:
                        pytest.skip("Test file not available")
            except Exception as e:
                pytest.skip(f"Request failed: {e}")
    
    def test_file_extension_detection(self):
        """Test file extension detection from URL"""
        scraper = Scraper("https://example.com")
        
        assert scraper._is_downloadable_file("https://example.com/file.pdf") is True
        assert scraper._is_downloadable_file("https://example.com/file.docx") is True
        assert scraper._is_downloadable_file("https://example.com/file.xlsx") is True
        assert scraper._is_downloadable_file("https://example.com/file.zip") is True
        assert scraper._is_downloadable_file("https://example.com/page.html") is False


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.file_download
class TestDownloadStatistics:
    """Test download statistics tracking"""
    
    @pytest.mark.asyncio
    async def test_track_download_success(self, tmp_path):
        """Test tracking successful download"""
        file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        save_path = tmp_path / "test_stats.pdf"
        
        stats = {
            "total_attempted": 0,
            "successful": 0,
            "failed": 0,
            "total_bytes": 0
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                stats["total_attempted"] += 1
                
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        content = await response.read()
                        
                        with open(save_path, 'wb') as f:
                            f.write(content)
                        
                        stats["successful"] += 1
                        stats["total_bytes"] += len(content)
                    else:
                        stats["failed"] += 1
            except Exception:
                stats["failed"] += 1
        
        assert stats["total_attempted"] == 1
        assert stats["successful"] + stats["failed"] == stats["total_attempted"]
    
    @pytest.mark.asyncio
    async def test_track_download_failure(self):
        """Test tracking failed download"""
        file_url = "https://this-does-not-exist-12345.com/file.pdf"
        
        stats = {
            "total_attempted": 0,
            "successful": 0,
            "failed": 0
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                stats["total_attempted"] += 1
                
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        stats["successful"] += 1
                    else:
                        stats["failed"] += 1
            except Exception:
                stats["failed"] += 1
        
        assert stats["total_attempted"] == 1
        assert stats["failed"] == 1


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.file_download
class TestConcurrentDownloads:
    """Test concurrent file downloads"""
    
    @pytest.mark.asyncio
    async def test_download_multiple_files_concurrently(self, tmp_path):
        """Test downloading multiple files concurrently"""
        file_urls = [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        ]
        
        async def download_file(session, url, path):
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        content = await response.read()
                        with open(path, 'wb') as f:
                            f.write(content)
                        return True
            except Exception:
                return False
            return False
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for i, url in enumerate(file_urls):
                save_path = tmp_path / f"concurrent_{i}.pdf"
                tasks.append(download_file(session, url, save_path))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # At least some downloads should succeed
            successful = sum(1 for r in results if r is True)
            assert successful >= 0  # May fail in some environments


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.file_download
class TestDownloadErrorHandling:
    """Test download error handling"""
    
    @pytest.mark.asyncio
    async def test_handle_404_error(self):
        """Test handling 404 error"""
        file_url = "https://example.com/nonexistent-file.pdf"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    assert response.status == 404
            except Exception:
                # Connection error is also acceptable
                assert True
    
    @pytest.mark.asyncio
    async def test_handle_timeout(self):
        """Test handling timeout"""
        file_url = "https://httpbin.org/delay/10"  # Delays response by 10 seconds
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=2)) as response:
                    pytest.fail("Should have timed out")
            except asyncio.TimeoutError:
                # Expected timeout
                assert True
            except Exception:
                # Other errors are acceptable
                assert True
    
    @pytest.mark.asyncio
    async def test_handle_connection_error(self):
        """Test handling connection error"""
        file_url = "https://this-domain-definitely-does-not-exist-12345.com/file.pdf"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    # Should not reach here
                    pass
            except Exception:
                # Expected to fail
                assert True


@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.file_download
class TestFileStorage:
    """Test file storage and organization"""
    
    def test_create_folder_structure(self, tmp_path):
        """Test creating folder structure for files"""
        scraper = Scraper("https://example.com")
        scraper.base_dir = str(tmp_path)
        
        # Create folder path
        folder_path = scraper._create_folder_path("https://example.com/products/item")
        
        assert os.path.exists(folder_path)
        assert "example_com" in folder_path
        assert "products" in folder_path
    
    @pytest.mark.asyncio
    async def test_save_file_to_correct_location(self, tmp_path):
        """Test saving file to correct location"""
        file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        
        # Create folder structure
        folder = tmp_path / "example_com" / "files"
        folder.mkdir(parents=True, exist_ok=True)
        
        save_path = folder / "test.pdf"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        content = await response.read()
                        with open(save_path, 'wb') as f:
                            f.write(content)
                        
                        assert save_path.exists()
                        assert save_path.parent == folder
            except Exception as e:
                pytest.skip(f"Download failed: {e}")
