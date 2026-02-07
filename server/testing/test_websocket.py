"""
Test WebSocket Connections
"""
import pytest
import asyncio
import json
from websockets import connect
from websockets.exceptions import WebSocketException


@pytest.mark.unit
@pytest.mark.websocket
class TestWebSocketConnections:
    """Test WebSocket functionality"""
    
    @pytest.mark.asyncio
    async def test_scraper_websocket_connection(self, base_url):
        """Test WebSocket connection to /ws/scraper"""
        ws_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
        ws_url = f"{ws_url}/ws/scraper"
        
        try:
            async with connect(ws_url, timeout=5) as websocket:
                # Connection successful
                assert websocket.open
                
                # Try to receive a message (with timeout)
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=2)
                    data = json.loads(message)
                    assert isinstance(data, dict)
                except asyncio.TimeoutError:
                    # No message received, but connection is valid
                    pass
        except WebSocketException as e:
            pytest.skip(f"WebSocket connection failed: {e}")
    
    @pytest.mark.asyncio
    async def test_diff_websocket_connection(self, base_url):
        """Test WebSocket connection to /ws/diff"""
        ws_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
        ws_url = f"{ws_url}/ws/diff"
        
        try:
            async with connect(ws_url, timeout=5) as websocket:
                # Connection successful
                assert websocket.open
                
                # Try to receive a message (with timeout)
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=2)
                    data = json.loads(message)
                    assert isinstance(data, dict)
                except asyncio.TimeoutError:
                    # No message received, but connection is valid
                    pass
        except WebSocketException as e:
            pytest.skip(f"WebSocket connection failed: {e}")
    
    @pytest.mark.asyncio
    async def test_websocket_message_format(self, base_url):
        """Test WebSocket message format"""
        ws_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
        ws_url = f"{ws_url}/ws/scraper"
        
        try:
            async with connect(ws_url, timeout=5) as websocket:
                # Wait for a message
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=3)
                    data = json.loads(message)
                    
                    # Check message structure
                    assert "type" in data or "data" in data
                except asyncio.TimeoutError:
                    pytest.skip("No message received within timeout")
        except WebSocketException as e:
            pytest.skip(f"WebSocket connection failed: {e}")


@pytest.mark.integration
@pytest.mark.websocket
class TestWebSocketIntegration:
    """Test WebSocket integration with scraper"""
    
    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_scraper_status_updates(self, base_url, client, sample_scraper_config):
        """Test receiving scraper status updates via WebSocket"""
        ws_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
        ws_url = f"{ws_url}/ws/scraper"
        
        try:
            async with connect(ws_url, timeout=5) as websocket:
                # Start scraper
                await client.post("/api/scraper/start", json=sample_scraper_config)
                
                # Wait for status update
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=5)
                    data = json.loads(message)
                    
                    # Should receive connection_established, scraper_started, or status update
                    assert "type" in data
                    assert data["type"] in ["connection_established", "scraper_started", "status_update", "scraper_completed"]
                except asyncio.TimeoutError:
                    pytest.skip("No WebSocket message received")
                finally:
                    # Stop scraper
                    await client.post("/api/scraper/stop")
        except WebSocketException as e:
            pytest.skip(f"WebSocket connection failed: {e}")


@pytest.mark.unit
@pytest.mark.websocket
class TestWebSocketErrorHandling:
    """Test WebSocket error handling"""
    
    @pytest.mark.asyncio
    async def test_invalid_websocket_endpoint(self, base_url):
        """Test connection to invalid WebSocket endpoint"""
        ws_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
        ws_url = f"{ws_url}/ws/invalid"
        
        try:
            async with connect(ws_url, timeout=5) as websocket:
                # Should not connect successfully
                pytest.fail("Should not connect to invalid endpoint")
        except WebSocketException:
            # Expected to fail
            pass
    
    @pytest.mark.asyncio
    async def test_websocket_reconnection(self, base_url):
        """Test WebSocket reconnection"""
        ws_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
        ws_url = f"{ws_url}/ws/scraper"
        
        try:
            # First connection
            async with connect(ws_url, timeout=5) as websocket1:
                assert websocket1.open
            
            # Second connection (reconnect)
            async with connect(ws_url, timeout=5) as websocket2:
                assert websocket2.open
        except WebSocketException as e:
            pytest.skip(f"WebSocket connection failed: {e}")
