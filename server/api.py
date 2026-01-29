from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import json
import sqlite3
import os
import uuid
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
current_session_id = None  # Unique session identifier

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
    search_queries: List[str]  # Multiple search texts
    search_type: str = "partial"  # text, partial, attribute, image
    image_urls: Optional[List[str]] = []  # Image URLs to search for

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
    global scraper_instance, scraper_task, current_session_id
    
    if scraper_task and not scraper_task.done():
        raise HTTPException(status_code=400, detail="Scraper is already running")
    
    try:
        # Generate unique session ID
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
        
        # Reset the stopped flag for new scraping session
        scraper_instance.was_stopped_manually = False
        scraper_instance.session_id = current_session_id
        
        # Start scraper in background
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
    """Background task to run the scraper"""
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
    """Get current scraper status with recent pages"""
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
    
    # Get recent pages from database
    recent_pages = []
    recent_files = []
    file_types = {}
    total_pages_in_db = 0
    
    # Get the current session ID
    session_id = getattr(scraper_instance, 'session_id', current_session_id)
    
    try:
        conn = sqlite3.connect(scraper_instance.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check if database has any data
        cursor.execute('SELECT COUNT(*) as count FROM pages')
        total_pages_in_db = cursor.fetchone()['count']
        
        # Get pages from current session only (filter by session_id in fingerprint or use all if no session tracking)
        # Since the database doesn't have session_id column, we'll use the scraper's in-memory data
        # and only show pages that match the current scraping instance
        cursor.execute('''
            SELECT id, url, title, depth, datetime(timestamp, 'unixepoch') as scraped_at
            FROM pages
            ORDER BY timestamp DESC
        ''')
        all_pages = [dict(row) for row in cursor.fetchall()]
        
        # Filter to only show pages from current session by checking if URL is in visited set
        if hasattr(scraper_instance, 'visited'):
            recent_pages = [p for p in all_pages if p['url'] in scraper_instance.visited]
        else:
            recent_pages = all_pages
        
        # Get files from current session
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
            
            # Filter files to current session
            if hasattr(scraper_instance, 'visited'):
                recent_files = [f for f in all_files if f['page_url'] in scraper_instance.visited]
            else:
                recent_files = all_files
            
            # Get file type counts from current session files
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
    
    # If database is empty, reset stats
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
    """Stop the running scraper"""
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

@app.get("/api/data/scraped-urls")
async def get_scraped_urls():
    """Get list of all scraped domains with their page counts"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get all pages and group by domain
        cursor.execute('''
            SELECT url, timestamp FROM pages ORDER BY timestamp DESC
        ''')
        
        pages = cursor.fetchall()
        conn.close()
        
        # Group by domain in Python
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
    """Get detailed scraping sessions with statistics"""
    try:
        from urllib.parse import urlparse
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get all pages
        cursor.execute('SELECT url, timestamp, depth FROM pages ORDER BY timestamp DESC')
        pages = cursor.fetchall()
        
        # Group by domain
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
        
        # Calculate additional stats for each domain
        sessions = []
        for domain, data in domains.items():
            # Get page IDs for this domain
            cursor.execute('SELECT id FROM pages WHERE url LIKE ?', (f'{domain}%',))
            page_ids = [row['id'] for row in cursor.fetchall()]
            
            # Count links
            if page_ids:
                placeholders = ','.join('?' * len(page_ids))
                cursor.execute(f'SELECT COUNT(*) as count FROM links WHERE page_id IN ({placeholders})', page_ids)
                total_links = cursor.fetchone()['count']
                
                # Count files
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
    """Get detailed information about a specific scraping session"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get session overview
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
        
        # Get pages by depth
        cursor.execute('''
            SELECT depth, COUNT(*) as count
            FROM pages
            WHERE url LIKE ?
            GROUP BY depth
            ORDER BY depth
        ''', (f'{domain}%',))
        
        depth_distribution = [dict(row) for row in cursor.fetchall()]
        
        # Get file statistics
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
        
        # Get recent pages
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
    """Delete all data for a specific scraping session"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        cursor = conn.cursor()
        
        # Get page IDs for this domain
        cursor.execute('SELECT id FROM pages WHERE url LIKE ?', (f'{domain}%',))
        page_ids = [row[0] for row in cursor.fetchall()]
        
        if page_ids:
            placeholders = ','.join('?' * len(page_ids))
            
            # Delete related data
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
    """Get overall scraping history statistics"""
    try:
        from urllib.parse import urlparse
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Total sessions (unique domains)
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
        
        # Total pages scraped
        cursor.execute('SELECT COUNT(*) as total_pages FROM pages')
        total_pages = cursor.fetchone()['total_pages']
        
        # Total files downloaded
        cursor.execute('SELECT COUNT(*) as total_files FROM file_assets WHERE download_status = "success"')
        total_files = cursor.fetchone()['total_files']
        
        # Total data size
        cursor.execute('SELECT SUM(file_size_bytes) as total_size FROM file_assets WHERE download_status = "success"')
        total_size = cursor.fetchone()['total_size'] or 0
        
        # Most active day
        cursor.execute('''
            SELECT date(timestamp, 'unixepoch') as date, COUNT(*) as count
            FROM pages
            GROUP BY date
            ORDER BY count DESC
            LIMIT 1
        ''')
        most_active = cursor.fetchone()
        
        # Average session duration
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
    """Get all pages and files for a specific domain"""
    try:
        from urllib.parse import urlparse
        
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Parse the domain from start_url
        try:
            parsed = urlparse(start_url)
            domain_pattern = f"{parsed.scheme}://{parsed.netloc}%"
        except:
            domain_pattern = f"{start_url}%"
        
        # Get all pages that match the domain
        cursor.execute('''
            SELECT id, url, title, depth, datetime(timestamp, 'unixepoch') as scraped_at
            FROM pages
            WHERE url LIKE ?
            ORDER BY timestamp DESC
        ''', (domain_pattern,))
        
        pages = [dict(row) for row in cursor.fetchall()]
        
        # Get files for these pages
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

@app.get("/api/data/files-by-extension")
async def get_files_by_extension():
    """Get file assets grouped by extension"""
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
    """Get the largest downloaded files"""
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
    """Get top links by frequency"""
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
    """Get scraping activity timeline"""
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
    """Get statistics grouped by domain"""
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
    """Get page count distribution by depth"""
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
    """Get detailed file type analytics"""
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
    """Get comprehensive link analysis"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get broken links (links that appear but weren't scraped)
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
        
        # Get most referenced pages
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
    """Delete multiple pages and their related data"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        cursor = conn.cursor()
        
        placeholders = ','.join('?' * len(page_ids))
        
        # Delete related data
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
    """Delete multiple file assets"""
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
    """Advanced page filtering"""
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
    """Compare statistics between multiple domains"""
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

@app.post("/api/selector-finder/test-login")
async def test_login_selectors(request: TestLoginRequest):
    """Test login with provided selectors"""
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
                # Load login page
                await page.goto(request.login_url, wait_until="networkidle", timeout=30000)
                await asyncio.sleep(2)
                
                # Try to fill username
                try:
                    await page.fill(request.username_selector, request.username)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    result["errors"].append(f"Username selector failed: {str(e)}")
                    raise
                
                # Try to fill password
                try:
                    await page.fill(request.password_selector, request.password)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    result["errors"].append(f"Password selector failed: {str(e)}")
                    raise
                
                # Try to click submit
                try:
                    await page.click(request.submit_selector)
                    await asyncio.sleep(5)
                except Exception as e:
                    result["errors"].append(f"Submit selector failed: {str(e)}")
                    raise
                
                # Check results
                result["final_url"] = page.url
                result["url_changed"] = result["final_url"] != request.login_url
                
                # Check for success indicator if provided
                if request.success_indicator:
                    try:
                        element = await page.query_selector(request.success_indicator)
                        result["success_indicator_found"] = element is not None
                    except:
                        result["success_indicator_found"] = False
                
                # Determine success
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
    """Find HTML elements by text content or attributes"""
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
                
                # Process text search queries
                for search_text in request.search_queries:
                    query_results = {
                        "search_text": search_text,
                        "query_type": "text",
                        "elements": []
                    }
                    
                    # Find elements based on search type
                    all_elements = []
                    
                    if request.search_type == "text":
                        # Exact text match
                        elements = await page.query_selector_all(f"text={search_text}")
                        all_elements = [(elem, "exact") for elem in elements]
                    elif request.search_type == "partial":
                        # Partial text match (case insensitive)
                        elements = await page.query_selector_all(f"text=/{search_text}/i")
                        all_elements = [(elem, "partial") for elem in elements]
                    else:
                        # Search in all text content
                        elements = await page.query_selector_all("*")
                        for elem in elements:
                            try:
                                text = await elem.inner_text()
                                if search_text.lower() in text.lower():
                                    # Check if exact match
                                    if text.strip().lower() == search_text.lower():
                                        all_elements.append((elem, "exact"))
                                    else:
                                        all_elements.append((elem, "partial"))
                            except:
                                pass
                    
                    # Sort: exact matches first, then partial
                    all_elements.sort(key=lambda x: 0 if x[1] == "exact" else 1)
                    
                    # Extract details for each matching element
                    for i, (elem, match_type) in enumerate(all_elements[:50]):  # Limit to 50 results per query
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
                            
                            # Get all text content (including hidden)
                            elem_text_content = ""
                            try:
                                elem_text_content = await elem.text_content()
                                if elem_text_content and len(elem_text_content) > 500:
                                    elem_text_content = elem_text_content[:500] + "..."
                            except:
                                pass
                            
                            # Get inner HTML
                            elem_inner_html = ""
                            try:
                                elem_inner_html = await elem.inner_html()
                                if len(elem_inner_html) > 500:
                                    elem_inner_html = elem_inner_html[:500] + "..."
                            except:
                                pass
                            
                            # Get outer HTML
                            elem_outer_html = ""
                            try:
                                elem_outer_html = await elem.evaluate("el => el.outerHTML")
                                if len(elem_outer_html) > 500:
                                    elem_outer_html = elem_outer_html[:500] + "..."
                            except:
                                pass
                            
                            # Get all attributes
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
                            
                            # Get parent info
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
                                    
                                    # Generate parent selectors
                                    if parent_id:
                                        parent_selectors.append(f"#{parent_id}")
                                    if parent_class:
                                        first_class = parent_class.strip().split()[0]
                                        parent_selectors.append(f"{parent_tag}.{first_class}")
                                    if not parent_selectors:
                                        parent_selectors.append(parent_tag)
                            except:
                                pass
                            
                            # Get all ancestors (up to 3 levels)
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
                            
                            # Generate suggested selectors
                            selectors = []
                            
                            # ID selector (most specific)
                            if elem_id:
                                selectors.append(f"#{elem_id}")
                            
                            # Class selector
                            if elem_class:
                                classes = elem_class.strip().split()
                                if classes:
                                    first_class = classes[0]
                                    selectors.append(f".{first_class}")
                                    selectors.append(f"{tag_name}.{first_class}")
                                    
                                    # With parent context
                                    if parent_tag and parent_class:
                                        parent_first_class = parent_class.strip().split()[0]
                                        selectors.append(f"{parent_tag}.{parent_first_class} > {tag_name}.{first_class}")
                                    elif parent_tag:
                                        selectors.append(f"{parent_tag} > {tag_name}.{first_class}")
                            
                            # Name attribute
                            if elem_name:
                                selectors.append(f"{tag_name}[name='{elem_name}']")
                                if parent_tag:
                                    selectors.append(f"{parent_tag} > {tag_name}[name='{elem_name}']")
                            
                            # Type attribute
                            if elem_type:
                                selectors.append(f"{tag_name}[type='{elem_type}']")
                            
                            # Href attribute
                            if elem_href:
                                selectors.append(f"{tag_name}[href='{elem_href}']")
                            
                            # Text selector
                            if elem_text and len(elem_text) < 50:
                                selectors.append(f"{tag_name}:has-text('{elem_text.strip()}')")
                                if parent_tag:
                                    selectors.append(f"{parent_tag} > {tag_name}:has-text('{elem_text.strip()}')")
                            
                            # Tag with parent
                            if parent_tag and not selectors:
                                selectors.append(f"{parent_tag} > {tag_name}")
                            
                            # Tag only (least specific)
                            if not selectors:
                                selectors.append(tag_name)
                            
                            # Get XPath
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
                            
                            # Get computed styles
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
                            
                            # Get bounding box
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
                    
                    # Add query results to main results
                    results["results_by_query"][search_text] = query_results
                
                # Process image search queries
                if request.image_urls:
                    for image_url in request.image_urls:
                        query_results = {
                            "search_text": image_url,
                            "query_type": "image",
                            "elements": []
                        }
                        
                        # Find all images on the page
                        all_images = await page.query_selector_all("img")
                        
                        for i, img_elem in enumerate(all_images):
                            try:
                                img_src = await img_elem.get_attribute("src") or ""
                                img_alt = await img_elem.get_attribute("alt") or ""
                                img_title = await img_elem.get_attribute("title") or ""
                                
                                # Check if image matches
                                is_match = False
                                match_type = "none"
                                
                                # Exact URL match
                                if img_src == image_url:
                                    is_match = True
                                    match_type = "exact"
                                # Partial URL match
                                elif image_url.lower() in img_src.lower():
                                    is_match = True
                                    match_type = "partial"
                                # Match by alt text
                                elif image_url.lower() in img_alt.lower():
                                    is_match = True
                                    match_type = "alt_text"
                                
                                if not is_match:
                                    continue
                                
                                # Get image details
                                tag_name = "img"
                                elem_id = await img_elem.get_attribute("id") or ""
                                elem_class = await img_elem.get_attribute("class") or ""
                                elem_name = await img_elem.get_attribute("name") or ""
                                
                                # Get all attributes
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
                                
                                # Get parent info
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
                                
                                # Get ancestors
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
                                
                                # Generate selectors
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
                                
                                # Get XPath
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
                                
                                # Get computed styles
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
                                
                                # Get bounding box
                                bounding_box = None
                                try:
                                    bounding_box = await img_elem.bounding_box()
                                except:
                                    pass
                                
                                # Get natural dimensions
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
                        
                        # Add image query results
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
    """Get screenshot for a specific page"""
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
        
        # folder_path is relative to server directory (e.g., "scraped_data\nostarch_com\home")
        # __file__ is server/api.py, so dirname(__file__) gives us the server directory
        server_dir = os.path.dirname(os.path.abspath(__file__))
        screenshot_path = os.path.join(server_dir, page['folder_path'], 'screenshot.png')
        screenshot_path = os.path.normpath(screenshot_path)  # Normalize path for Windows
        
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
    """Get a downloaded file by filename"""
    from fastapi.responses import FileResponse
    import mimetypes
    
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Find the file in file_assets table
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
        
        # Construct full file path - folder_path is relative to server directory
        server_dir = os.path.dirname(os.path.abspath(__file__))
        if file_record['local_path']:
            file_path = os.path.join(server_dir, file_record['folder_path'], file_record['local_path'])
        else:
            file_path = os.path.join(server_dir, file_record['folder_path'], 'downloads', filename)
        
        file_path = os.path.normpath(file_path)  # Normalize path for Windows
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found at {file_path}")
        
        # Determine mime type
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
    """Get full metadata JSON for a specific page"""
    try:
        conn = sqlite3.connect(config.get_db_path())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT folder_path FROM pages WHERE id = ?', (page_id,))
        page = cursor.fetchone()
        conn.close()
        
        if not page or not page['folder_path']:
            raise HTTPException(status_code=404, detail="Metadata not found")
        
        # folder_path is relative to server directory
        server_dir = os.path.dirname(os.path.abspath(__file__))
        metadata_path = os.path.join(server_dir, page['folder_path'], 'metadata.json')
        metadata_path = os.path.normpath(metadata_path)  # Normalize path for Windows
        
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
