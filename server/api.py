from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import json
import sqlite3
import os
import uuid
import time
from datetime import datetime
from urllib.parse import urlparse
from playwright.async_api import async_playwright

import config
from scraper import Scraper
from selector_finder import SelectorFinder
from collections import Counter

app = FastAPI(title="Web Scraper API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scraper_instance = None
scraper_task = None
websocket_connections = []
current_session_id = None

# ============================================================================
# PROXY TESTER CLASS (Moved from proxy_tester.py)
# ============================================================================

class ProxyTester:
    """Test and validate proxy servers for web scraping"""
    
    def __init__(self, proxy_file=None):
        self.proxy_file = proxy_file if proxy_file is not None else config.PROXY['proxy_file']
        self.working_proxies = []
        self.failed_proxies = []
    
    def load_proxies(self):
        """Load proxies from file"""
        proxies = []
        try:
            with open(self.proxy_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        proxies.append(line)
            print(f"Loaded {len(proxies)} proxies from {self.proxy_file}")
        except FileNotFoundError:
            print(f"File not found: {self.proxy_file}")
        
        return proxies
    
    async def test_proxy(self, proxy, test_url=None, timeout=None):
        """Test a single proxy"""
        test_url = test_url if test_url is not None else config.PROXY['test_url']
        timeout = timeout if timeout is not None else config.PROXY['test_timeout']
        parsed_proxy = urlparse(proxy)
        
        proxy_config = {
            "server": f"{parsed_proxy.scheme}://{parsed_proxy.hostname}:{parsed_proxy.port}"
        }
        
        if parsed_proxy.username and parsed_proxy.password:
            proxy_config["username"] = parsed_proxy.username
            proxy_config["password"] = parsed_proxy.password
        
        start_time = time.time()
        
        async with async_playwright() as p:
            browser = None
            try:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    proxy=proxy_config,
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                )
                page = await context.new_page()
                
                response = await page.goto(test_url, wait_until="domcontentloaded", timeout=timeout)
                
                if response and response.status < 400:
                    elapsed = time.time() - start_time
                    
                    try:
                        content = await page.content()
                        if 'httpbin' in test_url:
                            ip_data = await page.inner_text('body')
                            return {
                                "proxy": proxy,
                                "status": "Working",
                                "response_time": f"{elapsed:.2f}s",
                                "response": ip_data[:100]
                            }
                    except:
                        pass
                    
                    return {
                        "proxy": proxy,
                        "status": "Working",
                        "response_time": f"{elapsed:.2f}s",
                        "response": f"Status: {response.status}"
                    }
                else:
                    return {
                        "proxy": proxy,
                        "status": f"Failed (HTTP {response.status})",
                        "response_time": f"{elapsed:.2f}s",
                        "response": ""
                    }
                    
            except asyncio.TimeoutError:
                elapsed = time.time() - start_time
                return {
                    "proxy": proxy,
                    "status": "Timeout",
                    "response_time": f"{elapsed:.2f}s",
                    "response": ""
                }
            except Exception as e:
                elapsed = time.time() - start_time
                error_msg = str(e)[:50]
                return {
                    "proxy": proxy,
                    "status": "Error",
                    "response_time": f"{elapsed:.2f}s",
                    "response": error_msg
                }
            finally:
                if browser:
                    await browser.close()
    
    async def test_all_proxies(self, concurrent_tests=None, test_url=None):
        """Test all proxies concurrently"""
        concurrent_tests = concurrent_tests if concurrent_tests is not None else config.PROXY['concurrent_tests']
        test_url = test_url if test_url is not None else config.PROXY['test_url']
        proxies = self.load_proxies()
        
        if not proxies:
            print("No proxies to test!")
            return []
        
        print(f"Testing {len(proxies)} proxies with {concurrent_tests} concurrent tests...")
        
        results = []
        for i in range(0, len(proxies), concurrent_tests):
            batch = proxies[i:i+concurrent_tests]
            batch_results = await asyncio.gather(*[
                self.test_proxy(proxy, test_url) for proxy in batch
            ])
            results.extend(batch_results)
            
            print(f"Progress: {min(i+concurrent_tests, len(proxies))}/{len(proxies)} tested")
        
        self.working_proxies = [r for r in results if r["status"] == "Working"]
        self.failed_proxies = [r for r in results if r["status"] != "Working"]
        
        return results

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

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
    extraction_rules: Optional[List[dict]] = []

class ProxyTestRequest(BaseModel):
    test_url: Optional[str] = "https://httpbin.org/ip"
    concurrent_tests: Optional[int] = 5

class ConfigUpdate(BaseModel):
    section: str
    key: str
    value: Any

class SelectorFinderRequest(BaseModel):
    login_url: str

class TestLoginRequest(BaseModel):
    login_url: str
    username: str
    password: str
    username_selector: str
    password_selector: str
    submit_selector: str
    success_indicator: Optional[str] = None

class FindElementRequest(BaseModel):
    url: str
    search_queries: List[str]
    search_type: str = "partial"
    image_urls: Optional[List[str]] = []

class SearchRequest(BaseModel):
    keyword: str
    limit: Optional[int] = 20

async def broadcast_message(message: dict):
    for connection in websocket_connections:
        try:
            await connection.send_json(message)
        except:
            websocket_connections.remove(connection)

@app.get("/")
async def root():
    return {"message": "Web Scraper API", "status": "running"}

@app.get("/api/config")
async def get_config():
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
    global scraper_instance, scraper_task, current_session_id
    
    if scraper_task and not scraper_task.done():
        raise HTTPException(status_code=400, detail="Scraper is already running")
    
    try:
        current_session_id = str(uuid.uuid4())
        
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
        
        scraper_instance.was_stopped_manually = False
        scraper_instance.session_id = current_session_id
        
        scraper_task = asyncio.create_task(run_scraper())
        
        await broadcast_message({
            "type": "scraper_started",
            "data": {
                "start_url": config_data.start_url,
                "session_id": current_session_id
            }
        })
        
        return {"success": True, "message": "Scraper started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_scraper():
    global scraper_instance
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
    global current_session_id
    
    if not scraper_instance:
        return {
            "running": False,
            "pages_scraped": 0,
            "queue_size": 0,
            "visited": 0,
            "recent_pages": [],
            "recent_files": [],
            "file_types": {},
            "session_id": None
        }
    
    recent_pages = []
    recent_files = []
    file_types = {}
    total_pages_in_db = 0
    
    session_id = getattr(scraper_instance, 'session_id', current_session_id)
    
    try:
        conn = sqlite3.connect(scraper_instance.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as count FROM pages')
        total_pages_in_db = cursor.fetchone()['count']
        
        cursor.execute('''
            SELECT id, url, title, depth, datetime(timestamp, 'unixepoch') as scraped_at
            FROM pages
            ORDER BY timestamp DESC
        ''')
        all_pages = [dict(row) for row in cursor.fetchall()]
        
        if hasattr(scraper_instance, 'visited'):
            recent_pages = [p for p in all_pages if p['url'] in scraper_instance.visited]
        else:
            recent_pages = all_pages
        
        try:
            cursor.execute('''
                SELECT fa.file_name, fa.file_extension, fa.file_size_bytes,
                       fa.download_status, p.url as page_url,
                       datetime(fa.download_timestamp, 'unixepoch') as downloaded_at
                FROM file_assets fa
                JOIN pages p ON fa.page_id = p.id
                ORDER BY fa.download_timestamp DESC
            ''')
            all_files = [dict(row) for row in cursor.fetchall()]
            
            if hasattr(scraper_instance, 'visited'):
                recent_files = [f for f in all_files if f['page_url'] in scraper_instance.visited]
            else:
                recent_files = all_files
            
            file_type_counts = {}
            for f in recent_files:
                if f['download_status'] == 'success':
                    ext = f['file_extension']
                    file_type_counts[ext] = file_type_counts.get(ext, 0) + 1
            file_types = file_type_counts
        except sqlite3.OperationalError:
            pass
        
        conn.close()
    except Exception as e:
        print(f"Error fetching recent data: {e}")
    
    is_running = scraper_task and not scraper_task.done()
    if total_pages_in_db == 0 and not is_running:
        return {
            "running": False,
            "pages_scraped": 0,
            "queue_size": 0,
            "visited": 0,
            "max_pages": 0,
            "downloads": {},
            "recent_pages": [],
            "recent_files": [],
            "start_url": "",
            "max_depth": 0,
            "concurrent_limit": 0,
            "authenticated": False,
            "was_stopped": False,
            "file_types": {},
            "session_id": session_id
        }
    
    was_stopped = getattr(scraper_instance, 'was_stopped_manually', False)
    print(f"DEBUG: Status check - session_id={session_id}, was_stopped_manually={was_stopped}, instance={id(scraper_instance)}, running={is_running}")
    
    return {
        "running": is_running,
        "pages_scraped": scraper_instance.pages_scraped,
        "queue_size": len(scraper_instance.queue),
        "visited": len(scraper_instance.visited),
        "max_pages": scraper_instance.max_pages,
        "downloads": scraper_instance.downloads_stats if hasattr(scraper_instance, 'downloads_stats') else {},
        "recent_pages": recent_pages,
        "recent_files": recent_files,
        "start_url": scraper_instance.start_url,
        "max_depth": scraper_instance.max_depth,
        "concurrent_limit": scraper_instance.concurrent_limit,
        "authenticated": bool(scraper_instance.storage_state) if hasattr(scraper_instance, 'storage_state') else False,
        "was_stopped": was_stopped,
        "file_types": file_types,
        "session_id": session_id
    }

@app.post("/api/scraper/stop")
async def stop_scraper():
    global scraper_task, scraper_instance
    
    if not scraper_task or scraper_task.done():
        raise HTTPException(status_code=400, detail="No scraper is running")
    
    if scraper_instance:
        scraper_instance.should_stop = True
        scraper_instance.was_stopped_manually = True
        print(f"DEBUG: Set was_stopped_manually to True on instance {id(scraper_instance)}")

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
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        stats = {}
        stats['total_pages'] = cursor.execute('SELECT COUNT(*) FROM pages').fetchone()[0]
        stats['total_links'] = cursor.execute('SELECT COUNT(*) FROM links').fetchone()[0]
        stats['internal_links'] = cursor.execute(
            'SELECT COUNT(*) FROM links WHERE link_type = "internal"'
        ).fetchone()[0]
        stats['external_links'] = cursor.execute(
            'SELECT COUNT(*) FROM links WHERE link_type = "external"'
        ).fetchone()[0]
        stats['total_media'] = cursor.execute('SELECT COUNT(*) FROM media').fetchone()[0]
        stats['total_headers'] = cursor.execute('SELECT COUNT(*) FROM headers').fetchone()[0]
        
        try:
            stats['total_file_assets'] = cursor.execute('SELECT COUNT(*) FROM file_assets').fetchone()[0]
            stats['successful_downloads'] = cursor.execute(
                'SELECT COUNT(*) FROM file_assets WHERE download_status = "success"'
            ).fetchone()[0]
            stats['failed_downloads'] = cursor.execute(
                'SELECT COUNT(*) FROM file_assets WHERE download_status = "failed"'
            ).fetchone()[0]
            
            total_bytes = cursor.execute(
                'SELECT SUM(file_size_bytes) FROM file_assets WHERE download_status = "success"'
            ).fetchone()[0] or 0
            stats['total_download_size_mb'] = total_bytes / (1024 * 1024)
        except sqlite3.OperationalError:
            stats['total_file_assets'] = 0
            stats['successful_downloads'] = 0
            stats['failed_downloads'] = 0
            stats['total_download_size_mb'] = 0
        
        conn.close()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/pages")
async def get_pages(limit: int = 20, offset: int = 0):
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

@app.get("/api/data/scraped-urls")
async def get_scraped_urls():
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT url, timestamp FROM pages ORDER BY timestamp DESC
        ''')
        
        pages = cursor.fetchall()
        conn.close()
        
        from urllib.parse import urlparse
        domains = {}
        
        for page in pages:
            try:
                parsed = urlparse(page['url'])
                domain = f"{parsed.scheme}://{parsed.netloc}"
                
                if domain not in domains:
                    domains[domain] = {
                        'start_url': domain,
                        'page_count': 0,
                        'first_scraped': page['timestamp'],
                        'last_scraped': page['timestamp']
                    }
                
                domains[domain]['page_count'] += 1
                if page['timestamp'] < domains[domain]['first_scraped']:
                    domains[domain]['first_scraped'] = page['timestamp']
                if page['timestamp'] > domains[domain]['last_scraped']:
                    domains[domain]['last_scraped'] = page['timestamp']
            except:
                continue
        
        urls = list(domains.values())
        urls.sort(key=lambda x: x['last_scraped'], reverse=True)
        
        return {"urls": urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/sessions")
async def get_scraping_sessions():
    try:
        from urllib.parse import urlparse
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT url, timestamp, depth FROM pages ORDER BY timestamp DESC')
        pages = cursor.fetchall()
        
        domains = {}
        for page in pages:
            try:
                parsed = urlparse(page['url'])
                domain = f"{parsed.scheme}://{parsed.netloc}"
                
                if domain not in domains:
                    domains[domain] = {
                        'domain': domain,
                        'total_pages': 0,
                        'start_time': page['timestamp'],
                        'end_time': page['timestamp'],
                        'depths': [],
                        'page_ids': []
                    }
                
                domains[domain]['total_pages'] += 1
                domains[domain]['depths'].append(page['depth'])
                if page['timestamp'] < domains[domain]['start_time']:
                    domains[domain]['start_time'] = page['timestamp']
                if page['timestamp'] > domains[domain]['end_time']:
                    domains[domain]['end_time'] = page['timestamp']
            except:
                continue
        
        sessions = []
        for domain, data in domains.items():
            cursor.execute('SELECT id FROM pages WHERE url LIKE ?', (f'{domain}%',))
            page_ids = [row['id'] for row in cursor.fetchall()]
            
            if page_ids:
                placeholders = ','.join('?' * len(page_ids))
                cursor.execute(f'SELECT COUNT(*) as count FROM links WHERE page_id IN ({placeholders})', page_ids)
                total_links = cursor.fetchone()['count']
                
                cursor.execute(f'SELECT COUNT(*) as count, SUM(file_size_bytes) as total_size FROM file_assets WHERE page_id IN ({placeholders})', page_ids)
                file_data = cursor.fetchone()
                total_files = file_data['count']
                total_size = file_data['total_size'] or 0
            else:
                total_links = 0
                total_files = 0
                total_size = 0
            
            sessions.append({
                'domain': domain,
                'total_pages': data['total_pages'],
                'start_time': data['start_time'],
                'end_time': data['end_time'],
                'avg_depth': sum(data['depths']) / len(data['depths']) if data['depths'] else 0,
                'max_depth': max(data['depths']) if data['depths'] else 0,
                'total_links': total_links,
                'total_files': total_files,
                'total_size': total_size
            })
        
        sessions.sort(key=lambda x: x['end_time'], reverse=True)
        conn.close()
        
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/session/{domain:path}")
async def get_session_details(domain: str):
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total_pages,
                MIN(timestamp) as start_time,
                MAX(timestamp) as end_time,
                AVG(depth) as avg_depth,
                MAX(depth) as max_depth
            FROM pages
            WHERE url LIKE ?
        ''', (f'{domain}%',))
        
        overview = dict(cursor.fetchone())
        
        cursor.execute('''
            SELECT depth, COUNT(*) as count
            FROM pages
            WHERE url LIKE ?
            GROUP BY depth
            ORDER BY depth
        ''', (f'{domain}%',))
        
        depth_distribution = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('''
            SELECT 
                fa.file_extension,
                COUNT(*) as count,
                SUM(fa.file_size_bytes) as total_size,
                fa.download_status
            FROM file_assets fa
            JOIN pages p ON fa.page_id = p.id
            WHERE p.url LIKE ?
            GROUP BY fa.file_extension, fa.download_status
        ''', (f'{domain}%',))
        
        file_stats = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('''
            SELECT id, url, title, depth, timestamp
            FROM pages
            WHERE url LIKE ?
            ORDER BY timestamp DESC
            LIMIT 10
        ''', (f'{domain}%',))
        
        recent_pages = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            "domain": domain,
            "overview": overview,
            "depth_distribution": depth_distribution,
            "file_stats": file_stats,
            "recent_pages": recent_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/session/{domain:path}")
async def delete_session(domain: str):
    try:
        conn = sqlite3.connect(config.get_db_path())
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM pages WHERE url LIKE ?', (f'{domain}%',))
        page_ids = [row[0] for row in cursor.fetchall()]
        
        if page_ids:
            placeholders = ','.join('?' * len(page_ids))
            
            cursor.execute(f'DELETE FROM headers WHERE page_id IN ({placeholders})', page_ids)
            cursor.execute(f'DELETE FROM links WHERE page_id IN ({placeholders})', page_ids)
            cursor.execute(f'DELETE FROM media WHERE page_id IN ({placeholders})', page_ids)
            cursor.execute(f'DELETE FROM file_assets WHERE page_id IN ({placeholders})', page_ids)
            cursor.execute(f'DELETE FROM pages WHERE id IN ({placeholders})', page_ids)
            
            conn.commit()
        
        conn.close()
        
        return {"success": True, "deleted_pages": len(page_ids)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/statistics")
async def get_history_statistics():
    try:
        from urllib.parse import urlparse
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT url FROM pages')
        pages = cursor.fetchall()
        unique_domains = set()
        for page in pages:
            try:
                parsed = urlparse(page['url'])
                domain = f"{parsed.scheme}://{parsed.netloc}"
                unique_domains.add(domain)
            except:
                continue
        total_sessions = len(unique_domains)
        
        cursor.execute('SELECT COUNT(*) as total_pages FROM pages')
        total_pages = cursor.fetchone()['total_pages']
        
        cursor.execute('SELECT COUNT(*) as total_files FROM file_assets WHERE download_status = "success"')
        total_files = cursor.fetchone()['total_files']
        
        cursor.execute('SELECT SUM(file_size_bytes) as total_size FROM file_assets WHERE download_status = "success"')
        total_size = cursor.fetchone()['total_size'] or 0
        
        cursor.execute('''
            SELECT date(timestamp, 'unixepoch') as date, COUNT(*) as count
            FROM pages
            GROUP BY date
            ORDER BY count DESC
            LIMIT 1
        ''')
        most_active = cursor.fetchone()
        
        cursor.execute('''
            SELECT url, MIN(timestamp) as min_time, MAX(timestamp) as max_time
            FROM pages
            GROUP BY SUBSTR(url, 1, INSTR(SUBSTR(url, 9), '/') + 8)
        ''')
        sessions = cursor.fetchall()
        durations = [s['max_time'] - s['min_time'] for s in sessions if s['max_time'] and s['min_time']]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        conn.close()
        
        return {
            "total_sessions": total_sessions,
            "total_pages": total_pages,
            "total_files": total_files,
            "total_size_mb": total_size / (1024 * 1024),
            "most_active_day": dict(most_active) if most_active else None,
            "avg_session_duration_seconds": avg_duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/pages-by-url")
async def get_pages_by_url(start_url: str):
    try:
        from urllib.parse import urlparse
        
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            parsed = urlparse(start_url)
            domain_pattern = f"{parsed.scheme}://{parsed.netloc}%"
        except:
            domain_pattern = f"{start_url}%"
        
        cursor.execute('''
            SELECT id, url, title, depth, datetime(timestamp, 'unixepoch') as scraped_at
            FROM pages
            WHERE url LIKE ?
            ORDER BY timestamp DESC
        ''', (domain_pattern,))
        
        pages = [dict(row) for row in cursor.fetchall()]
        
        page_ids = [p['id'] for p in pages]
        files = []
        if page_ids:
            placeholders = ','.join('?' * len(page_ids))
            try:
                cursor.execute(f'''
                    SELECT fa.file_name, fa.file_extension, fa.file_size_bytes,
                           fa.download_status, p.url as page_url,
                           datetime(fa.download_timestamp, 'unixepoch') as downloaded_at
                    FROM file_assets fa
                    JOIN pages p ON fa.page_id = p.id
                    WHERE fa.page_id IN ({placeholders})
                    ORDER BY fa.download_timestamp DESC
                ''', page_ids)
                files = [dict(row) for row in cursor.fetchall()]
            except:
                pass
        
        conn.close()
        
        return {"pages": pages, "files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/page/{page_id}")
async def get_page_details(page_id: int):
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM pages WHERE id = ?', (page_id,))
        page = cursor.fetchone()
        
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")
        
        page_dict = dict(page)
        
        cursor.execute('SELECT * FROM headers WHERE page_id = ?', (page_id,))
        page_dict['headers'] = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM links WHERE page_id = ?', (page_id,))
        page_dict['links'] = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM media WHERE page_id = ?', (page_id,))
        page_dict['media'] = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM file_assets WHERE page_id = ?', (page_id,))
        page_dict['file_assets'] = [dict(row) for row in cursor.fetchall()]
        
        try:
            cursor.execute('SELECT * FROM html_structure WHERE page_id = ? LIMIT 500', (page_id,))
            page_dict['html_structure'] = [dict(row) for row in cursor.fetchall()]
        except:
            page_dict['html_structure'] = []
        
        conn.close()
        
        return page_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/files")
async def get_file_assets(limit: int = 50, status: Optional[str] = None):
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

@app.get("/api/proxy/image")
async def proxy_image(url: str):
    try:
        import aiohttp
        from fastapi.responses import Response
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    content = await response.read()
                    content_type = response.headers.get('Content-Type', 'image/jpeg')
                    
                    return Response(
                        content=content, 
                        media_type=content_type,
                        headers={
                            "Cache-Control": "public, max-age=86400",
                            "Access-Control-Allow-Origin": "*"
                        }
                    )
                else:
                    raise HTTPException(status_code=response.status, detail="Failed to fetch image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/screenshot/{page_id}")
async def get_screenshot(page_id: int):
    try:
        from fastapi.responses import FileResponse
        
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT folder_path FROM pages WHERE id = ?', (page_id,))
        page = cursor.fetchone()
        conn.close()
        
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")
        
        screenshot_path = os.path.join(page['folder_path'], 'screenshot.png')
        
        if not os.path.exists(screenshot_path):
            raise HTTPException(status_code=404, detail="Screenshot not found")
        
        return FileResponse(
            screenshot_path,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=86400"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/proxies/test")
async def test_proxies(request: ProxyTestRequest):
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
    """Get comprehensive performance analytics including proxy, depth, and timeline stats"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Proxy statistics
        cursor.execute("""
            SELECT proxy_used, COUNT(*) as page_count
            FROM pages
            GROUP BY proxy_used
            ORDER BY page_count DESC
        """)
        proxy_data = cursor.fetchall()
        total_pages = sum(row['page_count'] for row in proxy_data)
        
        proxy_stats = []
        for row in proxy_data:
            proxy_stats.append({
                'proxy': row['proxy_used'],
                'page_count': row['page_count'],
                'percentage': (row['page_count'] / total_pages * 100) if total_pages > 0 else 0
            })
        
        # Depth statistics
        cursor.execute("""
            SELECT depth, COUNT(*) as page_count
            FROM pages
            GROUP BY depth
            ORDER BY depth
        """)
        depth_data = cursor.fetchall()
        total_depth_pages = sum(row['page_count'] for row in depth_data)
        
        depth_stats = []
        for row in depth_data:
            depth_stats.append({
                'depth': row['depth'],
                'page_count': row['page_count'],
                'percentage': (row['page_count'] / total_depth_pages * 100) if total_depth_pages > 0 else 0
            })
        
        # Timeline statistics
        cursor.execute("""
            SELECT 
                MIN(timestamp) as start_time,
                MAX(timestamp) as end_time,
                COUNT(*) as total_pages
            FROM pages
        """)
        timeline_row = cursor.fetchone()
        
        timeline = {
            'start_time': timeline_row['start_time'],
            'end_time': timeline_row['end_time'],
            'total_pages': timeline_row['total_pages'],
            'duration': 0,
            'pages_per_second': 0,
            'pages_per_minute': 0
        }
        
        if timeline_row['start_time'] and timeline_row['end_time']:
            duration = timeline_row['end_time'] - timeline_row['start_time']
            timeline['duration'] = duration
            if duration > 0:
                timeline['pages_per_second'] = timeline_row['total_pages'] / duration
                timeline['pages_per_minute'] = (timeline_row['total_pages'] / duration) * 60
        
        # Pages per minute breakdown
        if timeline_row['start_time']:
            cursor.execute("""
                SELECT 
                    CAST((timestamp - ?) / 60 AS INTEGER) as minute_bucket,
                    COUNT(*) as page_count
                FROM pages
                GROUP BY minute_bucket
                ORDER BY minute_bucket
            """, (timeline_row['start_time'],))
            
            timeline['pages_per_minute_breakdown'] = [
                {'minute': row['minute_bucket'], 'count': row['page_count']}
                for row in cursor.fetchall()
            ]
        else:
            timeline['pages_per_minute_breakdown'] = []
        
        conn.close()
        
        return {
            "proxy_stats": proxy_stats,
            "depth_stats": depth_stats,
            "timeline": timeline
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/fingerprints")
async def get_fingerprint_analytics():
    """Get fingerprint diversity analysis"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT fingerprint FROM pages WHERE fingerprint IS NOT NULL")
        rows = cursor.fetchall()
        
        if not rows:
            return {
                "timezones": [],
                "viewports": [],
                "user_agents": [],
                "locales": [],
                "diversity_score": 0,
                "total_pages": 0
            }
        
        fingerprints = [json.loads(row['fingerprint']) for row in rows]
        
        # Extract data
        timezones = [fp['timezone_id'] for fp in fingerprints]
        viewports = [f"{fp['viewport']['width']}x{fp['viewport']['height']}" for fp in fingerprints]
        user_agents = [
            fp['user_agent'].split('Chrome/')[1].split()[0] if 'Chrome/' in fp['user_agent'] else 'Unknown'
            for fp in fingerprints
        ]
        locales = [fp['locale'] for fp in fingerprints]
        
        # Calculate diversity
        unique_combinations = len(set(
            (fp['timezone_id'], 
             f"{fp['viewport']['width']}x{fp['viewport']['height']}", 
             fp['locale'])
            for fp in fingerprints
        ))
        
        diversity_score = (unique_combinations / len(fingerprints) * 100) if fingerprints else 0
        
        conn.close()
        
        return {
            "timezones": [{'name': tz, 'count': count} for tz, count in Counter(timezones).most_common()],
            "viewports": [{'name': vp, 'count': count} for vp, count in Counter(viewports).most_common()],
            "user_agents": [{'name': f"Chrome {ua}", 'count': count} for ua, count in Counter(user_agents).most_common()],
            "locales": [{'name': locale, 'count': count} for locale, count in Counter(locales).most_common()],
            "diversity_score": round(diversity_score, 1),
            "total_pages": len(fingerprints),
            "unique_combinations": unique_combinations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/geolocation")
async def get_geolocation_analytics():
    """Get geographical distribution from fingerprints"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT fingerprint FROM pages WHERE fingerprint IS NOT NULL")
        rows = cursor.fetchall()
        
        if not rows:
            return {"locations": [], "total_pages": 0}
        
        fingerprints = [json.loads(row['fingerprint']) for row in rows]
        
        # City mapping
        city_map = {
            (40.7128, -74.0060): "New York",
            (34.0522, -118.2437): "Los Angeles",
            (51.5074, -0.1278): "London",
            (48.8566, 2.3522): "Paris",
            (35.6762, 139.6503): "Tokyo",
            (52.5200, 13.4050): "Berlin",
            (37.7749, -122.4194): "San Francisco",
            (41.8781, -87.6298): "Chicago",
            (43.6532, -79.3832): "Toronto",
            (-33.8688, 151.2093): "Sydney",
        }
        
        locations = []
        for fp in fingerprints:
            lat = fp['geolocation']['latitude']
            lon = fp['geolocation']['longitude']
            
            for coords, city in city_map.items():
                if abs(coords[0] - lat) < 0.1 and abs(coords[1] - lon) < 0.1:
                    locations.append(city)
                    break
        
        location_counts = Counter(locations)
        total = len(locations)
        
        conn.close()
        
        return {
            "locations": [
                {
                    'city': city,
                    'count': count,
                    'percentage': (count / total * 100) if total > 0 else 0
                }
                for city, count in location_counts.most_common()
            ],
            "total_pages": total
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data/search/content")
async def search_content(request: SearchRequest):
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
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM pages')
        pages = []
        
        for page_row in cursor.fetchall():
            page = dict(page_row)
            page_id = page['id']
            
            cursor.execute('SELECT * FROM headers WHERE page_id = ?', (page_id,))
            page['headers'] = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute('SELECT * FROM links WHERE page_id = ?', (page_id,))
            page['links'] = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute('SELECT * FROM media WHERE page_id = ?', (page_id,))
            page['media'] = [dict(row) for row in cursor.fetchall()]
            
            try:
                cursor.execute('SELECT * FROM file_assets WHERE page_id = ?', (page_id,))
                page['file_assets'] = [dict(row) for row in cursor.fetchall()]
            except sqlite3.OperationalError:
                page['file_assets'] = []
            
            pages.append(page)
        
        conn.close()
        
        return {
            "total_pages": len(pages),
            "exported_at": datetime.now().isoformat(),
            "data": pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/files-by-extension")
async def get_files_by_extension():
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT file_extension, 
                   COUNT(*) as count,
                   SUM(file_size_bytes) as total_size,
                   download_status
            FROM file_assets
            GROUP BY file_extension, download_status
            ORDER BY count DESC
        ''')
        
        files_by_extension = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"files_by_extension": files_by_extension}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/largest-downloads")
async def get_largest_downloads(limit: int = 10):
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT fa.file_name, fa.file_extension, fa.file_size_bytes,
                   fa.local_path, p.url as page_url
            FROM file_assets fa
            JOIN pages p ON fa.page_id = p.id
            WHERE fa.download_status = 'success'
            ORDER BY fa.file_size_bytes DESC
            LIMIT ?
        ''', (limit,))
        
        largest_downloads = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"largest_downloads": largest_downloads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/top-links")
async def get_top_links(link_type: str = 'internal', limit: int = 20):
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT l.url, COUNT(*) as frequency
            FROM links l
            WHERE l.link_type = ?
            GROUP BY l.url
            ORDER BY frequency DESC
            LIMIT ?
        ''', (link_type, limit))
        
        top_links = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"top_links": top_links}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/analytics/timeline")
async def get_scraping_timeline():
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                date(timestamp, 'unixepoch') as date,
                COUNT(*) as pages_scraped,
                COUNT(DISTINCT depth) as depths_reached
            FROM pages
            GROUP BY date(timestamp, 'unixepoch')
            ORDER BY date DESC
            LIMIT 30
        ''')
        
        timeline = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"timeline": timeline}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/analytics/domains")
async def get_domain_statistics():
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                SUBSTR(url, 1, INSTR(SUBSTR(url, 9), '/') + 8) as domain,
                COUNT(*) as page_count,
                AVG(depth) as avg_depth,
                MIN(timestamp) as first_scraped,
                MAX(timestamp) as last_scraped
            FROM pages
            GROUP BY domain
            ORDER BY page_count DESC
        ''')
        
        domains = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"domains": domains}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/analytics/depth-distribution")
async def get_depth_distribution():
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                depth,
                COUNT(*) as page_count,
                COUNT(DISTINCT url) as unique_pages
            FROM pages
            GROUP BY depth
            ORDER BY depth
        ''')
        
        distribution = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"depth_distribution": distribution}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/analytics/file-types")
async def get_file_type_analytics():
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                file_extension,
                COUNT(*) as total_files,
                SUM(CASE WHEN download_status = 'success' THEN 1 ELSE 0 END) as successful,
                SUM(CASE WHEN download_status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(file_size_bytes) as total_bytes,
                AVG(file_size_bytes) as avg_bytes,
                MAX(file_size_bytes) as max_bytes,
                MIN(file_size_bytes) as min_bytes
            FROM file_assets
            GROUP BY file_extension
            ORDER BY total_files DESC
        ''')
        
        analytics = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"file_analytics": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/analytics/link-analysis")
async def get_link_analysis():
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                l.url,
                COUNT(*) as reference_count,
                l.link_type
            FROM links l
            LEFT JOIN pages p ON l.url = p.url
            WHERE p.id IS NULL
            GROUP BY l.url
            ORDER BY reference_count DESC
            LIMIT 50
        ''')
        
        broken_links = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('''
            SELECT 
                p.url,
                p.title,
                COUNT(l.id) as inbound_links
            FROM pages p
            LEFT JOIN links l ON p.url = l.url
            GROUP BY p.id
            ORDER BY inbound_links DESC
            LIMIT 20
        ''')
        
        most_referenced = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            "broken_links": broken_links,
            "most_referenced_pages": most_referenced
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data/bulk/delete-pages")
async def bulk_delete_pages(page_ids: List[int]):
    try:
        conn = sqlite3.connect(config.get_db_path())
        cursor = conn.cursor()
        
        placeholders = ','.join('?' * len(page_ids))
        
        cursor.execute(f'DELETE FROM headers WHERE page_id IN ({placeholders})', page_ids)
        cursor.execute(f'DELETE FROM links WHERE page_id IN ({placeholders})', page_ids)
        cursor.execute(f'DELETE FROM media WHERE page_id IN ({placeholders})', page_ids)
        cursor.execute(f'DELETE FROM file_assets WHERE page_id IN ({placeholders})', page_ids)
        cursor.execute(f'DELETE FROM pages WHERE id IN ({placeholders})', page_ids)
        
        conn.commit()
        deleted_count = cursor.rowcount
        conn.close()
        
        return {"success": True, "deleted_count": deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data/bulk/delete-files")
async def bulk_delete_files(file_ids: List[int]):
    try:
        conn = sqlite3.connect(config.get_db_path())
        cursor = conn.cursor()
        
        placeholders = ','.join('?' * len(file_ids))
        cursor.execute(f'DELETE FROM file_assets WHERE id IN ({placeholders})', file_ids)
        
        conn.commit()
        deleted_count = cursor.rowcount
        conn.close()
        
        return {"success": True, "deleted_count": deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/filter/pages")
async def filter_pages(
    min_depth: Optional[int] = None,
    max_depth: Optional[int] = None,
    has_files: Optional[bool] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 50
):
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = 'SELECT p.*, COUNT(DISTINCT fa.id) as file_count FROM pages p LEFT JOIN file_assets fa ON p.id = fa.page_id WHERE 1=1'
        params = []
        
        if min_depth is not None:
            query += ' AND p.depth >= ?'
            params.append(min_depth)
        
        if max_depth is not None:
            query += ' AND p.depth <= ?'
            params.append(max_depth)
        
        if start_date:
            query += ' AND date(p.timestamp, "unixepoch") >= ?'
            params.append(start_date)
        
        if end_date:
            query += ' AND date(p.timestamp, "unixepoch") <= ?'
            params.append(end_date)
        
        query += ' GROUP BY p.id'
        
        if has_files is not None:
            if has_files:
                query += ' HAVING file_count > 0'
            else:
                query += ' HAVING file_count = 0'
        
        query += ' ORDER BY p.timestamp DESC LIMIT ?'
        params.append(limit)
        
        cursor.execute(query, params)
        pages = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"pages": pages, "total": len(pages)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/compare/domains")
async def compare_domains(domains: str):
    try:
        domain_list = domains.split(',')
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        results = []
        for domain in domain_list:
            cursor.execute('''
                SELECT 
                    COUNT(*) as page_count,
                    AVG(depth) as avg_depth,
                    (SELECT COUNT(*) FROM links WHERE page_id IN (SELECT id FROM pages WHERE url LIKE ?)) as link_count,
                    (SELECT COUNT(*) FROM file_assets WHERE page_id IN (SELECT id FROM pages WHERE url LIKE ?)) as file_count
                FROM pages
                WHERE url LIKE ?
            ''', (f'%{domain}%', f'%{domain}%', f'%{domain}%'))
            
            stats = dict(cursor.fetchone())
            stats['domain'] = domain
            results.append(stats)
        
        conn.close()
        return {"comparison": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/selector-finder/analyze")
async def analyze_login_page(request: SelectorFinderRequest):
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
                
                forms = await page.query_selector_all("form")
                for i, form in enumerate(forms, 1):
                    form_id = await form.get_attribute("id") or ""
                    form_action = await form.get_attribute("action") or ""
                    
                    results["forms"].append({
                        "index": i,
                        "id": form_id,
                        "action": form_action
                    })
                
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

@app.post("/api/selector-finder/test-login")
async def test_login_selectors(request: TestLoginRequest):
    try:
        from playwright.async_api import async_playwright
        
        result = {
            "success": False,
            "message": "",
            "initial_url": request.login_url,
            "final_url": "",
            "url_changed": False,
            "success_indicator_found": False,
            "errors": []
        }
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()
            
            try:
                await page.goto(request.login_url, wait_until="networkidle", timeout=30000)
                await asyncio.sleep(2)
                
                try:
                    await page.fill(request.username_selector, request.username)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    result["errors"].append(f"Username selector failed: {str(e)}")
                    raise
                
                try:
                    await page.fill(request.password_selector, request.password)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    result["errors"].append(f"Password selector failed: {str(e)}")
                    raise
                
                try:
                    await page.click(request.submit_selector)
                    await asyncio.sleep(5)
                except Exception as e:
                    result["errors"].append(f"Submit selector failed: {str(e)}")
                    raise
                
                result["final_url"] = page.url
                result["url_changed"] = result["final_url"] != request.login_url
                
                if request.success_indicator:
                    try:
                        element = await page.query_selector(request.success_indicator)
                        result["success_indicator_found"] = element is not None
                    except:
                        result["success_indicator_found"] = False
                
                if result["url_changed"]:
                    result["success"] = True
                    result["message"] = "Login appears successful - URL changed"
                elif request.success_indicator and result["success_indicator_found"]:
                    result["success"] = True
                    result["message"] = "Login appears successful - success indicator found"
                else:
                    result["success"] = False
                    result["message"] = "Login may have failed - URL unchanged and no success indicator"
                
            except Exception as e:
                result["success"] = False
                result["message"] = f"Test failed: {str(e)}"
                if not result["errors"]:
                    result["errors"].append(str(e))
            finally:
                await browser.close()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/selector-finder/find-element")
async def find_element_by_content(request: FindElementRequest):
    try:
        from playwright.async_api import async_playwright
        
        results = {
            "url": request.url,
            "search_queries": request.search_queries,
            "search_type": request.search_type,
            "results_by_query": {}
        }
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()
            
            try:
                await page.goto(request.url, wait_until="networkidle", timeout=30000)
                await asyncio.sleep(2)
                
                for search_text in request.search_queries:
                    query_results = {
                        "search_text": search_text,
                        "query_type": "text",
                        "elements": []
                    }
                    
                    all_elements = []
                    
                    if request.search_type == "text":
                        elements = await page.query_selector_all(f"text={search_text}")
                        all_elements = [(elem, "exact") for elem in elements]
                    elif request.search_type == "partial":
                        elements = await page.query_selector_all(f"text=/{search_text}/i")
                        all_elements = [(elem, "partial") for elem in elements]
                    else:
                        elements = await page.query_selector_all("*")
                        for elem in elements:
                            try:
                                text = await elem.inner_text()
                                if search_text.lower() in text.lower():
                                    if text.strip().lower() == search_text.lower():
                                        all_elements.append((elem, "exact"))
                                    else:
                                        all_elements.append((elem, "partial"))
                            except:
                                pass
                    
                    all_elements.sort(key=lambda x: 0 if x[1] == "exact" else 1)
                    
                    for i, (elem, match_type) in enumerate(all_elements[:50]):
                        try:
                            tag_name = await elem.evaluate("el => el.tagName.toLowerCase()")
                            elem_id = await elem.get_attribute("id") or ""
                            elem_class = await elem.get_attribute("class") or ""
                            elem_name = await elem.get_attribute("name") or ""
                            elem_type = await elem.get_attribute("type") or ""
                            elem_href = await elem.get_attribute("href") or ""
                            elem_src = await elem.get_attribute("src") or ""
                            elem_text = ""
                            
                            try:
                                elem_text = await elem.inner_text()
                                if len(elem_text) > 200:
                                    elem_text = elem_text[:200] + "..."
                            except:
                                pass
                            
                            elem_text_content = ""
                            try:
                                elem_text_content = await elem.text_content()
                                if elem_text_content and len(elem_text_content) > 500:
                                    elem_text_content = elem_text_content[:500] + "..."
                            except:
                                pass
                            
                            elem_inner_html = ""
                            try:
                                elem_inner_html = await elem.inner_html()
                                if len(elem_inner_html) > 500:
                                    elem_inner_html = elem_inner_html[:500] + "..."
                            except:
                                pass
                            
                            elem_outer_html = ""
                            try:
                                elem_outer_html = await elem.evaluate("el => el.outerHTML")
                                if len(elem_outer_html) > 500:
                                    elem_outer_html = elem_outer_html[:500] + "..."
                            except:
                                pass
                            
                            all_attributes = {}
                            try:
                                all_attributes = await elem.evaluate("""
                                    el => {
                                        const attrs = {};
                                        for (let attr of el.attributes) {
                                            attrs[attr.name] = attr.value;
                                        }
                                        return attrs;
                                    }
                                """)
                            except:
                                pass
                            
                            parent_tag = ""
                            parent_class = ""
                            parent_id = ""
                            parent_selectors = []
                            
                            try:
                                parent = await elem.evaluate("el => el.parentElement")
                                if parent:
                                    parent_tag = await page.evaluate("el => el.tagName.toLowerCase()", parent)
                                    parent_class = await page.evaluate("el => el.className", parent) or ""
                                    parent_id = await page.evaluate("el => el.id", parent) or ""
                                    
                                    if parent_id:
                                        parent_selectors.append(f"#{parent_id}")
                                    if parent_class:
                                        first_class = parent_class.strip().split()[0]
                                        parent_selectors.append(f"{parent_tag}.{first_class}")
                                    if not parent_selectors:
                                        parent_selectors.append(parent_tag)
                            except:
                                pass
                            
                            ancestors = []
                            try:
                                ancestors_data = await elem.evaluate("""
                                    el => {
                                    const ancestors = [];
                                    let current = el.parentElement;
                                    let level = 1;
                                    while (current && level <= 3) {
                                        ancestors.push({
                                            tag: current.tagName.toLowerCase(),
                                            id: current.id || '',
                                            class: current.className || '',
                                            level: level
                                        });
                                        current = current.parentElement;
                                        level++;
                                    }
                                    return ancestors;
                                }
                                """)
                                ancestors = ancestors_data
                            except:
                                pass
                            
                            selectors = []
                            
                            if elem_id:
                                selectors.append(f"#{elem_id}")
                            
                            if elem_class:
                                classes = elem_class.strip().split()
                                if classes:
                                    first_class = classes[0]
                                    selectors.append(f".{first_class}")
                                    selectors.append(f"{tag_name}.{first_class}")
                                    
                                    if parent_tag and parent_class:
                                        parent_first_class = parent_class.strip().split()[0]
                                        selectors.append(f"{parent_tag}.{parent_first_class} > {tag_name}.{first_class}")
                                    elif parent_tag:
                                        selectors.append(f"{parent_tag} > {tag_name}.{first_class}")
                            
                            if elem_name:
                                selectors.append(f"{tag_name}[name='{elem_name}']")
                                if parent_tag:
                                    selectors.append(f"{parent_tag} > {tag_name}[name='{elem_name}']")
                            
                            if elem_type:
                                selectors.append(f"{tag_name}[type='{elem_type}']")
                            
                            if elem_href:
                                selectors.append(f"{tag_name}[href='{elem_href}']")
                            
                            if elem_text and len(elem_text) < 50:
                                selectors.append(f"{tag_name}:has-text('{elem_text.strip()}')")
                                if parent_tag:
                                    selectors.append(f"{parent_tag} > {tag_name}:has-text('{elem_text.strip()}')")
                            
                            if parent_tag and not selectors:
                                selectors.append(f"{parent_tag} > {tag_name}")
                            
                            if not selectors:
                                selectors.append(tag_name)
                            
                            xpath = ""
                            try:
                                xpath = await elem.evaluate("""
                                    el => {
                                        const getXPath = (element) => {
                                            if (element.id) return `//*[@id="${element.id}"]`;
                                            if (element === document.body) return '/html/body';
                                            
                                            let ix = 0;
                                            const siblings = element.parentNode?.childNodes || [];
                                            for (let i = 0; i < siblings.length; i++) {
                                                const sibling = siblings[i];
                                                if (sibling === element) {
                                                    return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
                                                }
                                                if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                                                    ix++;
                                                }
                                            }
                                        };
                                        return getXPath(el);
                                    }
                                """)
                            except:
                                pass
                            
                            styles = {}
                            try:
                                styles = await elem.evaluate("""
                                    el => {
                                        const computed = window.getComputedStyle(el);
                                        return {
                                            display: computed.display,
                                            position: computed.position,
                                            color: computed.color,
                                            backgroundColor: computed.backgroundColor,
                                            fontSize: computed.fontSize,
                                            fontWeight: computed.fontWeight
                                        };
                                    }
                                """)
                            except:
                                pass
                            
                            bounding_box = None
                            try:
                                bounding_box = await elem.bounding_box()
                            except:
                                pass
                            
                            element_data = {
                                "index": i + 1,
                                "match_type": match_type,
                                "tag": tag_name,
                                "id": elem_id,
                                "class": elem_class,
                                "name": elem_name,
                                "type": elem_type,
                                "href": elem_href,
                                "src": elem_src,
                                "text": elem_text.strip(),
                                "text_content": elem_text_content.strip() if elem_text_content else "",
                                "inner_html": elem_inner_html,
                                "outer_html": elem_outer_html,
                                "all_attributes": all_attributes,
                                "parent_tag": parent_tag,
                                "parent_class": parent_class,
                                "parent_id": parent_id,
                                "parent_selectors": parent_selectors,
                                "ancestors": ancestors,
                                "selectors": selectors,
                                "xpath": xpath,
                                "styles": styles,
                                "bounding_box": bounding_box
                            }
                            
                            query_results["elements"].append(element_data)
                        
                        except Exception as e:
                            continue
                    
                    results["results_by_query"][search_text] = query_results
                
                if request.image_urls:
                    for image_url in request.image_urls:
                        query_results = {
                            "search_text": image_url,
                            "query_type": "image",
                            "elements": []
                        }
                        
                        all_images = await page.query_selector_all("img")
                        
                        for i, img_elem in enumerate(all_images):
                            try:
                                img_src = await img_elem.get_attribute("src") or ""
                                img_alt = await img_elem.get_attribute("alt") or ""
                                img_title = await img_elem.get_attribute("title") or ""
                                
                                is_match = False
                                match_type = "none"
                                
                                if img_src == image_url:
                                    is_match = True
                                    match_type = "exact"
                                elif image_url.lower() in img_src.lower():
                                    is_match = True
                                    match_type = "partial"
                                elif image_url.lower() in img_alt.lower():
                                    is_match = True
                                    match_type = "alt_text"
                                
                                if not is_match:
                                    continue
                                
                                tag_name = "img"
                                elem_id = await img_elem.get_attribute("id") or ""
                                elem_class = await img_elem.get_attribute("class") or ""
                                elem_name = await img_elem.get_attribute("name") or ""
                                
                                all_attributes = {}
                                try:
                                    all_attributes = await img_elem.evaluate("""
                                        el => {
                                            const attrs = {};
                                            for (let attr of el.attributes) {
                                                attrs[attr.name] = attr.value;
                                            }
                                            return attrs;
                                        }
                                    """)
                                except:
                                    pass
                                
                                parent_tag = ""
                                parent_class = ""
                                parent_id = ""
                                parent_selectors = []
                                
                                try:
                                    parent = await img_elem.evaluate("el => el.parentElement")
                                    if parent:
                                        parent_tag = await page.evaluate("el => el.tagName.toLowerCase()", parent)
                                        parent_class = await page.evaluate("el => el.className", parent) or ""
                                        parent_id = await page.evaluate("el => el.id", parent) or ""
                                        
                                        if parent_id:
                                            parent_selectors.append(f"#{parent_id}")
                                        if parent_class:
                                            first_class = parent_class.strip().split()[0]
                                            parent_selectors.append(f"{parent_tag}.{first_class}")
                                        if not parent_selectors:
                                            parent_selectors.append(parent_tag)
                                except:
                                    pass
                                
                                ancestors = []
                                try:
                                    ancestors_data = await img_elem.evaluate("""
                                        el => {
                                            const ancestors = [];
                                            let current = el.parentElement;
                                            let level = 1;
                                            while (current && level <= 3) {
                                                ancestors.push({
                                                    tag: current.tagName.toLowerCase(),
                                                    id: current.id || '',
                                                    class: current.className || '',
                                                    level: level
                                                });
                                                current = current.parentElement;
                                                level++;
                                            }
                                            return ancestors;
                                        }
                                    """)
                                    ancestors = ancestors_data
                                except:
                                    pass
                                
                                selectors = []
                                
                                if elem_id:
                                    selectors.append(f"#{elem_id}")
                                
                                if elem_class:
                                    classes = elem_class.strip().split()
                                    if classes:
                                        first_class = classes[0]
                                        selectors.append(f".{first_class}")
                                        selectors.append(f"img.{first_class}")
                                
                                if img_src:
                                    selectors.append(f"img[src='{img_src}']")
                                
                                if img_alt:
                                    selectors.append(f"img[alt='{img_alt}']")
                                
                                if parent_tag:
                                    selectors.append(f"{parent_tag} > img")
                                
                                if not selectors:
                                    selectors.append("img")
                                
                                xpath = ""
                                try:
                                    xpath = await img_elem.evaluate("""
                                        el => {
                                            const getXPath = (element) => {
                                                if (element.id) return `//*[@id="${element.id}"]`;
                                                if (element === document.body) return '/html/body';
                                                
                                                let ix = 0;
                                                const siblings = element.parentNode?.childNodes || [];
                                                for (let i = 0; i < siblings.length; i++) {
                                                    const sibling = siblings[i];
                                                    if (sibling === element) {
                                                        return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
                                                    }
                                                    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                                                        ix++;
                                                    }
                                                }
                                            };
                                            return getXPath(el);
                                        }
                                    """)
                                except:
                                    pass
                                
                                styles = {}
                                try:
                                    styles = await img_elem.evaluate("""
                                        el => {
                                            const computed = window.getComputedStyle(el);
                                            return {
                                                display: computed.display,
                                                position: computed.position,
                                                width: computed.width,
                                                height: computed.height,
                                                objectFit: computed.objectFit
                                            };
                                        }
                                    """)
                                except:
                                    pass
                                
                                bounding_box = None
                                try:
                                    bounding_box = await img_elem.bounding_box()
                                except:
                                    pass
                                
                                natural_dimensions = {}
                                try:
                                    natural_dimensions = await img_elem.evaluate("""
                                        el => ({
                                            naturalWidth: el.naturalWidth,
                                            naturalHeight: el.naturalHeight
                                        })
                                    """)
                                except:
                                    pass
                                
                                element_data = {
                                    "index": len(query_results["elements"]) + 1,
                                    "match_type": match_type,
                                    "tag": tag_name,
                                    "id": elem_id,
                                    "class": elem_class,
                                    "name": elem_name,
                                    "src": img_src,
                                    "alt": img_alt,
                                    "title": img_title,
                                    "all_attributes": all_attributes,
                                    "parent_tag": parent_tag,
                                    "parent_class": parent_class,
                                    "parent_id": parent_id,
                                    "parent_selectors": parent_selectors,
                                    "ancestors": ancestors,
                                    "selectors": selectors,
                                    "xpath": xpath,
                                    "styles": styles,
                                    "bounding_box": bounding_box,
                                    "natural_dimensions": natural_dimensions
                                }
                                
                                query_results["elements"].append(element_data)
                                
                            except Exception as e:
                                continue
                        
                        results["results_by_query"][f"image:{image_url}"] = query_results
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error finding elements: {str(e)}")
            finally:
                await browser.close()
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/screenshot/{page_id}")
async def get_screenshot(page_id: int):
    from fastapi.responses import FileResponse
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT folder_path FROM pages WHERE id = ?', (page_id,))
        page = cursor.fetchone()
        conn.close()
        
        if not page or not page['folder_path']:
            print(f"Page {page_id} not found in database")
            raise HTTPException(status_code=404, detail=f"Page {page_id} not found")
        
        server_dir = os.path.dirname(os.path.abspath(__file__))
        screenshot_path = os.path.join(server_dir, page['folder_path'], 'screenshot.png')
        screenshot_path = os.path.normpath(screenshot_path)
        
        print(f"Looking for screenshot at: {screenshot_path}")
        print(f"Path exists: {os.path.exists(screenshot_path)}")
        
        if not os.path.exists(screenshot_path):
            print(f"Screenshot file not found at {screenshot_path}")
            raise HTTPException(status_code=404, detail=f"Screenshot file not found")
        
        return FileResponse(screenshot_path, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting screenshot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/file/{filename}")
async def get_downloaded_file(filename: str):
    from fastapi.responses import FileResponse
    import mimetypes
    
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT fa.local_path, fa.file_extension, p.folder_path
            FROM file_assets fa
            JOIN pages p ON fa.page_id = p.id
            WHERE fa.file_name = ?
            LIMIT 1
        ''', (filename,))
        
        file_record = cursor.fetchone()
        conn.close()
        
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")
        
        server_dir = os.path.dirname(os.path.abspath(__file__))
        if file_record['local_path']:
            file_path = os.path.join(server_dir, file_record['folder_path'], file_record['local_path'])
        else:
            file_path = os.path.join(server_dir, file_record['folder_path'], 'downloads', filename)
        
        file_path = os.path.normpath(file_path)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found at {file_path}")
        
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"
        
        return FileResponse(file_path, media_type=mime_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metadata/{page_id}")
async def get_metadata(page_id: int):
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT folder_path FROM pages WHERE id = ?', (page_id,))
        page = cursor.fetchone()
        conn.close()
        
        if not page or not page['folder_path']:
            raise HTTPException(status_code=404, detail="Metadata not found")
        
        server_dir = os.path.dirname(os.path.abspath(__file__))
        metadata_path = os.path.join(server_dir, page['folder_path'], 'metadata.json')
        metadata_path = os.path.normpath(metadata_path)
        
        if not os.path.exists(metadata_path):
            raise HTTPException(status_code=404, detail="Metadata file not found")
        
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        return metadata
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/scraper")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.append(websocket)
    
    try:
        while True:
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