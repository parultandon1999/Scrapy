from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import json
import sqlite3
import os
from datetime import datetime

# Import your existing modules
import config
from scraper import Scraper
from proxy_tester import ProxyTester
from query_db import CrawlDataAnalyzer
from scrap_analyser import CrawlAnalyzer
from selector_finder import SelectorFinder

app = FastAPI(title="Web Scraper API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
scraper_instance = None
scraper_task = None
websocket_connections = []

# Pydantic models
class ScraperConfig(BaseModel):
    start_url: str
    max_pages: Optional[int] = 50
    max_depth: Optional[int] = 2
    concurrent_limit: Optional[int] = 3
    headless: Optional[bool] = True
    download_file_assets: Optional[bool] = True
    max_file_size_mb: Optional[int] = 50
    login_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    username_selector: Optional[str] = None
    password_selector: Optional[str] = None
    submit_selector: Optional[str] = None
    success_indicator: Optional[str] = None

class ProxyTestRequest(BaseModel):
    test_url: Optional[str] = "https://httpbin.org/ip"
    concurrent_tests: Optional[int] = 5

class ConfigUpdate(BaseModel):
    section: str
    key: str
    value: Any

class SelectorFinderRequest(BaseModel):
    login_url: str

class SearchRequest(BaseModel):
    keyword: str
    limit: Optional[int] = 20

# WebSocket manager
async def broadcast_message(message: dict):
    """Send message to all connected WebSocket clients"""
    for connection in websocket_connections:
        try:
            await connection.send_json(message)
        except:
            websocket_connections.remove(connection)

# Routes
@app.get("/")
async def root():
    return {"message": "Web Scraper API", "status": "running"}

@app.get("/api/config")
async def get_config():
    """Get current configuration"""
    return {
        "features": config.FEATURES,
        "scraper": config.SCRAPER,
        "proxy": config.PROXY,
        "auth": {k: v for k, v in config.AUTH.items() if k not in ['username', 'password']},
        "file_download": config.FILE_DOWNLOAD,
        "timeouts": config.TIMEOUTS,
        "delays": config.DELAYS,
    }

@app.put("/api/config")
async def update_config(update: ConfigUpdate):
    """Update configuration"""
    try:
        section = getattr(config, update.section.upper())
        if update.key in section:
            section[update.key] = update.value
            return {"success": True, "message": f"Updated {update.section}.{update.key}"}
        else:
            raise HTTPException(status_code=400, detail="Invalid configuration key")
    except AttributeError:
        raise HTTPException(status_code=400, detail="Invalid configuration section")

@app.post("/api/scraper/start")
async def start_scraper(config_data: ScraperConfig):
    """Start a new scraping job"""
    global scraper_instance, scraper_task
    
    if scraper_task and not scraper_task.done():
        raise HTTPException(status_code=400, detail="Scraper is already running")
    
    try:
        scraper_instance = Scraper(
            start_url=config_data.start_url,
            max_pages=config_data.max_pages,
            max_depth=config_data.max_depth,
            concurrent_limit=config_data.concurrent_limit,
            headless=config_data.headless,
            download_file_assets=config_data.download_file_assets,
            max_file_size_mb=config_data.max_file_size_mb,
            login_url=config_data.login_url,
            username=config_data.username,
            password=config_data.password,
            username_selector=config_data.username_selector,
            password_selector=config_data.password_selector,
            submit_selector=config_data.submit_selector,
            success_indicator=config_data.success_indicator,
        )
        
        # Start scraper in background
        scraper_task = asyncio.create_task(run_scraper())
        
        await broadcast_message({
            "type": "scraper_started",
            "data": {"start_url": config_data.start_url}
        })
        
        return {"success": True, "message": "Scraper started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_scraper():
    """Background task to run the scraper"""
    try:
        await scraper_instance.run()
        await broadcast_message({
            "type": "scraper_completed",
            "data": {"pages_scraped": scraper_instance.pages_scraped}
        })
    except Exception as e:
        await broadcast_message({
            "type": "scraper_error",
            "data": {"error": str(e)}
        })

@app.get("/api/scraper/status")
async def get_scraper_status():
    """Get current scraper status"""
    if not scraper_instance:
        return {
            "running": False,
            "pages_scraped": 0,
            "queue_size": 0,
            "visited": 0
        }
    
    return {
        "running": scraper_task and not scraper_task.done(),
        "pages_scraped": scraper_instance.pages_scraped,
        "queue_size": len(scraper_instance.queue),
        "visited": len(scraper_instance.visited),
        "max_pages": scraper_instance.max_pages,
        "downloads": scraper_instance.downloads_stats if hasattr(scraper_instance, 'downloads_stats') else {}
    }

@app.post("/api/scraper/stop")
async def stop_scraper():
    """Stop the running scraper"""
    global scraper_task, scraper_instance
    
    if not scraper_task or scraper_task.done():
        raise HTTPException(status_code=400, detail="No scraper is running")
    
    if scraper_instance:
        scraper_instance.should_stop = True

    scraper_task.cancel()

    try:
        await asyncio.wait_for(scraper_task, timeout=5.0)
    except (asyncio.CancelledError, asyncio.TimeoutError):
        pass

    await broadcast_message({
        "type": "scraper_stopped",
        "data": {}
    })
    
    return {"success": True, "message": "Scraper stopped"}

@app.get("/api/data/stats")
async def get_stats():
    """Get scraping statistics"""
    try:
        analyzer = CrawlDataAnalyzer()
        stats = analyzer.get_stats()
        analyzer.close()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/pages")
async def get_pages(limit: int = 20, offset: int = 0):
    """Get scraped pages"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, url, title, depth, datetime(timestamp, 'unixepoch') as scraped_at
            FROM pages
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        pages = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT COUNT(*) as total FROM pages')
        total = cursor.fetchone()['total']
        
        conn.close()
        
        return {
            "pages": pages,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/page/{page_id}")
async def get_page_details(page_id: int):
    """Get detailed information about a specific page"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM pages WHERE id = ?', (page_id,))
        page = cursor.fetchone()
        
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")
        
        page_dict = dict(page)
        
        # Get related data
        cursor.execute('SELECT * FROM headers WHERE page_id = ?', (page_id,))
        page_dict['headers'] = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM links WHERE page_id = ?', (page_id,))
        page_dict['links'] = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM media WHERE page_id = ?', (page_id,))
        page_dict['media'] = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM file_assets WHERE page_id = ?', (page_id,))
        page_dict['file_assets'] = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return page_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/files")
async def get_file_assets(limit: int = 50, status: Optional[str] = None):
    """Get downloaded file assets"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if status:
            cursor.execute('''
                SELECT fa.*, p.url as page_url
                FROM file_assets fa
                JOIN pages p ON fa.page_id = p.id
                WHERE fa.download_status = ?
                ORDER BY fa.download_timestamp DESC
                LIMIT ?
            ''', (status, limit))
        else:
            cursor.execute('''
                SELECT fa.*, p.url as page_url
                FROM file_assets fa
                JOIN pages p ON fa.page_id = p.id
                ORDER BY fa.download_timestamp DESC
                LIMIT ?
            ''', (limit,))
        
        files = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/proxies/test")
async def test_proxies(request: ProxyTestRequest):
    """Test all proxies"""
    try:
        tester = ProxyTester()
        results = await tester.test_all_proxies(
            concurrent_tests=request.concurrent_tests,
            test_url=request.test_url
        )
        
        return {
            "working": tester.working_proxies,
            "failed": tester.failed_proxies,
            "total_tested": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/proxies/list")
async def list_proxies():
    """List all proxies from file"""
    try:
        proxies = []
        if os.path.exists(config.PROXY['proxy_file']):
            with open(config.PROXY['proxy_file'], 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        proxies.append(line)
        return {"proxies": proxies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/performance")
async def get_performance_analytics():
    """Get performance analytics"""
    try:
        analyzer = CrawlAnalyzer()
        
        # Get various analytics
        conn = analyzer.conn
        cursor = conn.cursor()
        
        # Proxy stats
        cursor.execute("""
            SELECT proxy_used, COUNT(*) as page_count
            FROM pages
            GROUP BY proxy_used
            ORDER BY page_count DESC
        """)
        proxy_stats = [dict(row) for row in cursor.fetchall()]
        
        # Depth distribution
        cursor.execute("""
            SELECT depth, COUNT(*) as page_count
            FROM pages
            GROUP BY depth
            ORDER BY depth
        """)
        depth_stats = [dict(row) for row in cursor.fetchall()]
        
        # Timeline
        cursor.execute("""
            SELECT 
                MIN(timestamp) as start_time,
                MAX(timestamp) as end_time,
                COUNT(*) as total_pages
            FROM pages
        """)
        timeline = dict(cursor.fetchone())
        
        analyzer.close()
        
        return {
            "proxy_stats": proxy_stats,
            "depth_stats": depth_stats,
            "timeline": timeline
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data/search/content")
async def search_content(request: SearchRequest):
    """Search for keyword in page content"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT url, title, 
                   substr(full_text, 1, 200) as preview
            FROM pages
            WHERE full_text LIKE ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (f'%{request.keyword}%', request.limit))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "keyword": request.keyword,
            "results": results,
            "total": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data/search/files")
async def search_files(request: SearchRequest):
    """Search for files by name"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT fa.file_name, fa.file_extension, fa.file_size_bytes,
                   fa.download_status, fa.local_path, p.url as page_url,
                   datetime(fa.download_timestamp, 'unixepoch') as downloaded_at
            FROM file_assets fa
            JOIN pages p ON fa.page_id = p.id
            WHERE fa.file_name LIKE ?
            ORDER BY fa.download_timestamp DESC
            LIMIT ?
        ''', (f'%{request.keyword}%', request.limit))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "keyword": request.keyword,
            "results": results,
            "total": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/export")
async def export_data():
    """Export all scraped data to JSON"""
    try:
        analyzer = CrawlDataAnalyzer()
        
        conn = analyzer.conn
        cursor = conn.cursor()
        
        # Get all pages with related data
        cursor.execute('SELECT * FROM pages')
        pages = []
        
        for page_row in cursor.fetchall():
            page = dict(page_row)
            page_id = page['id']
            
            # Get headers
            cursor.execute('SELECT * FROM headers WHERE page_id = ?', (page_id,))
            page['headers'] = [dict(row) for row in cursor.fetchall()]
            
            # Get links
            cursor.execute('SELECT * FROM links WHERE page_id = ?', (page_id,))
            page['links'] = [dict(row) for row in cursor.fetchall()]
            
            # Get media
            cursor.execute('SELECT * FROM media WHERE page_id = ?', (page_id,))
            page['media'] = [dict(row) for row in cursor.fetchall()]
            
            # Get file assets
            try:
                cursor.execute('SELECT * FROM file_assets WHERE page_id = ?', (page_id,))
                page['file_assets'] = [dict(row) for row in cursor.fetchall()]
            except sqlite3.OperationalError:
                page['file_assets'] = []
            
            pages.append(page)
        
        analyzer.close()
        
        return {
            "total_pages": len(pages),
            "exported_at": datetime.now().isoformat(),
            "data": pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/selector-finder/analyze")
async def analyze_login_page(request: SelectorFinderRequest):
    """Analyze a login page and suggest CSS selectors"""
    try:
        from playwright.async_api import async_playwright
        
        results = {
            "login_url": request.login_url,
            "inputs": [],
            "buttons": [],
            "forms": [],
            "suggested_config": {}
        }
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport=config.SELECTOR_FINDER['viewport']
            )
            page = await context.new_page()
            
            try:
                await page.goto(request.login_url, wait_until="networkidle", timeout=30000)
                await asyncio.sleep(2)
                
                # Find all input fields
                inputs = await page.query_selector_all("input")
                
                for i, input_elem in enumerate(inputs, 1):
                    input_type = await input_elem.get_attribute("type") or "text"
                    input_name = await input_elem.get_attribute("name") or ""
                    input_id = await input_elem.get_attribute("id") or ""
                    input_placeholder = await input_elem.get_attribute("placeholder") or ""
                    
                    selectors = []
                    if input_name:
                        selectors.append(f"input[name='{input_name}']")
                    if input_id:
                        selectors.append(f"#{input_id}")
                    
                    field_type = "text"
                    if input_type == "password":
                        field_type = "password"
                    elif input_type == "email" or "email" in input_name.lower():
                        field_type = "username"
                    
                    results["inputs"].append({
                        "index": i,
                        "type": input_type,
                        "name": input_name,
                        "id": input_id,
                        "placeholder": input_placeholder,
                        "suggested_selectors": selectors,
                        "likely_field": field_type
                    })
                
                # Find buttons
                buttons = await page.query_selector_all("button, input[type='submit']")
                
                for i, button in enumerate(buttons, 1):
                    button_type = await button.get_attribute("type") or ""
                    button_text = await button.inner_text() or ""
                    button_id = await button.get_attribute("id") or ""
                    
                    selectors = []
                    if button_type == "submit":
                        selectors.append("button[type='submit']")
                    if button_id:
                        selectors.append(f"#{button_id}")
                    
                    is_submit = button_type == "submit" or any(
                        word in button_text.lower() 
                        for word in ["login", "sign in", "submit", "enter"]
                    )
                    
                    results["buttons"].append({
                        "index": i,
                        "type": button_type,
                        "text": button_text.strip(),
                        "id": button_id,
                        "suggested_selectors": selectors,
                        "likely_submit": is_submit
                    })
                
                # Find forms
                forms = await page.query_selector_all("form")
                for i, form in enumerate(forms, 1):
                    form_id = await form.get_attribute("id") or ""
                    form_action = await form.get_attribute("action") or ""
                    
                    results["forms"].append({
                        "index": i,
                        "id": form_id,
                        "action": form_action
                    })
                
                # Auto-detect and suggest configuration
                username_field = next((inp for inp in results["inputs"] if inp["likely_field"] == "username"), None)
                password_field = next((inp for inp in results["inputs"] if inp["likely_field"] == "password"), None)
                submit_button = next((btn for btn in results["buttons"] if btn["likely_submit"]), None)
                
                if username_field and username_field["suggested_selectors"]:
                    results["suggested_config"]["username_selector"] = username_field["suggested_selectors"][0]
                
                if password_field and password_field["suggested_selectors"]:
                    results["suggested_config"]["password_selector"] = password_field["suggested_selectors"][0]
                
                if submit_button and submit_button["suggested_selectors"]:
                    results["suggested_config"]["submit_selector"] = submit_button["suggested_selectors"][0]
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error analyzing page: {str(e)}")
            finally:
                await browser.close()
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/scraper")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    websocket_connections.append(websocket)
    
    try:
        while True:
            # Keep connection alive and send periodic updates
            if scraper_instance:
                await websocket.send_json({
                    "type": "status_update",
                    "data": {
                        "pages_scraped": scraper_instance.pages_scraped,
                        "queue_size": len(scraper_instance.queue),
                        "visited": len(scraper_instance.visited)
                    }
                })
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
