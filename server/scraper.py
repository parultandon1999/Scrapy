import json
import time
import random
import os
import re
import sqlite3
import asyncio
import aiohttp
import mimetypes
import logging
import difflib
from typing import Dict, List, Optional
import hashlib
from urllib.parse import urlparse, urljoin, urlunparse
from collections import deque
from playwright.async_api import async_playwright
import config

logger = logging.getLogger("DiffTracker")

class DiffTracker:
    """
    Tracks changes between scrapes of the same URL.
    
    Detects changes in:
    - Page content (title, description, text)
    - Headers (h1-h6)
    - Links (added/removed)
    - Media (images added/removed)
    - HTML structure
    - File assets
    """
    
    def __init__(self, db_path: str):
        """
        Initialize the DiffTracker.
        
        Args:
            db_path (str): Path to the SQLite database.
        """
        self.db_path = db_path
        self._init_diff_tables()
    
    def _init_diff_tables(self):
        """Create tables for storing diff history."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Main diff snapshots table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS page_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                snapshot_timestamp REAL NOT NULL,
                page_id INTEGER,
                content_hash TEXT,
                title TEXT,
                description TEXT,
                full_text_hash TEXT,
                header_count INTEGER,
                link_count INTEGER,
                media_count INTEGER,
                file_count INTEGER,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # Detailed change log
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS change_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                change_timestamp REAL NOT NULL,
                previous_snapshot_id INTEGER,
                current_snapshot_id INTEGER,
                change_type TEXT,
                change_category TEXT,
                change_summary TEXT,
                change_details TEXT,
                severity TEXT,
                FOREIGN KEY (previous_snapshot_id) REFERENCES page_snapshots(id),
                FOREIGN KEY (current_snapshot_id) REFERENCES page_snapshots(id)
            )
        ''')
        
        # Content diffs (detailed text changes)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS content_diffs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                change_log_id INTEGER,
                field_name TEXT,
                old_value TEXT,
                new_value TEXT,
                diff_html TEXT,
                similarity_score REAL,
                FOREIGN KEY (change_log_id) REFERENCES change_log(id)
            )
        ''')
        
        # Link changes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS link_changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                change_log_id INTEGER,
                link_url TEXT,
                link_type TEXT,
                change_action TEXT,
                FOREIGN KEY (change_log_id) REFERENCES change_log(id)
            )
        ''')
        
        # Media changes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS media_changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                change_log_id INTEGER,
                media_src TEXT,
                media_alt TEXT,
                change_action TEXT,
                FOREIGN KEY (change_log_id) REFERENCES change_log(id)
            )
        ''')
        
        # Create indexes for performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_snapshots_url ON page_snapshots(url)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON page_snapshots(snapshot_timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_changelog_url ON change_log(url)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_changelog_timestamp ON change_log(change_timestamp)')
        
        conn.commit()
        conn.close()
        
        logger.info("Diff tracking tables initialized")
    
    def _calculate_hash(self, content: str) -> str:
        """Calculate SHA256 hash of content."""
        if not content:
            return ""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate similarity ratio between two texts.
        
        Returns:
            float: Similarity score between 0.0 and 1.0
        """
        if not text1 and not text2:
            return 1.0
        if not text1 or not text2:
            return 0.0
        
        return difflib.SequenceMatcher(None, text1, text2).ratio()
    
    def _generate_html_diff(self, old_text: str, new_text: str) -> str:
        """
        Generate HTML diff showing changes between two texts.
        
        Returns:
            str: HTML string with highlighted changes
        """
        if not old_text:
            old_text = ""
        if not new_text:
            new_text = ""
        
        diff = difflib.HtmlDiff()
        html_diff = diff.make_table(
            old_text.splitlines(),
            new_text.splitlines(),
            fromdesc='Previous',
            todesc='Current',
            context=True,
            numlines=3
        )
        
        return html_diff
    
    def create_snapshot(self, page_id: int) -> int:
        """
        Create a snapshot of the current page state.
        
        Args:
            page_id (int): ID of the page to snapshot
            
        Returns:
            int: Snapshot ID
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            # Get page data
            cursor.execute('SELECT * FROM pages WHERE id = ?', (page_id,))
            page = cursor.fetchone()
            
            if not page:
                logger.error(f"Page {page_id} not found")
                return None
            
            # Calculate content hashes
            content_hash = self._calculate_hash(
                f"{page['title']}|{page['description']}"
            )
            full_text_hash = self._calculate_hash(page['full_text'] or "")
            
            # Count related items
            cursor.execute('SELECT COUNT(*) as count FROM headers WHERE page_id = ?', (page_id,))
            header_count = cursor.fetchone()['count']
            
            cursor.execute('SELECT COUNT(*) as count FROM links WHERE page_id = ?', (page_id,))
            link_count = cursor.fetchone()['count']
            
            cursor.execute('SELECT COUNT(*) as count FROM media WHERE page_id = ?', (page_id,))
            media_count = cursor.fetchone()['count']
            
            try:
                cursor.execute('SELECT COUNT(*) as count FROM file_assets WHERE page_id = ?', (page_id,))
                file_count = cursor.fetchone()['count']
            except:
                file_count = 0
            
            # Insert snapshot
            cursor.execute('''
                INSERT INTO page_snapshots (
                    url, snapshot_timestamp, page_id, content_hash,
                    title, description, full_text_hash,
                    header_count, link_count, media_count, file_count
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                page['url'],
                page['timestamp'],
                page_id,
                content_hash,
                page['title'],
                page['description'],
                full_text_hash,
                header_count,
                link_count,
                media_count,
                file_count
            ))
            
            snapshot_id = cursor.lastrowid
            conn.commit()
            
            logger.info(f"Created snapshot {snapshot_id} for page {page_id} ({page['url']})")
            return snapshot_id
            
        except Exception as e:
            logger.error(f"Error creating snapshot: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def detect_changes(self, url: str, current_page_id: int) -> Optional[Dict]:
        """
        Detect changes between the current scrape and the previous one.
        
        Args:
            url (str): URL to check for changes
            current_page_id (int): ID of the current page scrape
            
        Returns:
            dict: Change detection results or None if no previous snapshot
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            # Get the most recent previous snapshot
            cursor.execute('''
                SELECT * FROM page_snapshots
                WHERE url = ? AND page_id != ?
                ORDER BY snapshot_timestamp DESC
                LIMIT 1
            ''', (url, current_page_id))
            
            previous_snapshot = cursor.fetchone()
            
            if not previous_snapshot:
                logger.info(f"No previous snapshot found for {url}")
                # Create first snapshot
                snapshot_id = self.create_snapshot(current_page_id)
                return {
                    'is_first_scrape': True,
                    'snapshot_id': snapshot_id,
                    'changes_detected': False
                }
            
            # Create current snapshot
            current_snapshot_id = self.create_snapshot(current_page_id)
            
            # Get current page data
            cursor.execute('SELECT * FROM pages WHERE id = ?', (current_page_id,))
            current_page = cursor.fetchone()
            
            # Detect changes
            changes = {
                'is_first_scrape': False,
                'changes_detected': False,
                'previous_snapshot_id': previous_snapshot['id'],
                'current_snapshot_id': current_snapshot_id,
                'url': url,
                'timestamp': current_page['timestamp'],
                'changes': []
            }
            
            # 1. Check content changes
            content_changes = self._detect_content_changes(
                cursor, previous_snapshot, current_page, current_page_id
            )
            if content_changes:
                changes['changes'].extend(content_changes)
                changes['changes_detected'] = True
            
            # 2. Check link changes
            link_changes = self._detect_link_changes(
                cursor, previous_snapshot['page_id'], current_page_id
            )
            if link_changes:
                changes['changes'].extend(link_changes)
                changes['changes_detected'] = True
            
            # 3. Check media changes
            media_changes = self._detect_media_changes(
                cursor, previous_snapshot['page_id'], current_page_id
            )
            if media_changes:
                changes['changes'].extend(media_changes)
                changes['changes_detected'] = True
            
            # 4. Check file changes
            file_changes = self._detect_file_changes(
                cursor, previous_snapshot['page_id'], current_page_id
            )
            if file_changes:
                changes['changes'].extend(file_changes)
                changes['changes_detected'] = True
            
            # Log changes to database
            if changes['changes_detected']:
                self._log_changes(conn, changes)
            
            conn.commit()
            return changes
            
        except Exception as e:
            logger.error(f"Error detecting changes: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def _detect_content_changes(
        self, cursor, previous_snapshot, current_page, current_page_id
    ) -> List[Dict]:
        """Detect changes in page content (title, description, text)."""
        changes = []
        
        # Title change
        if previous_snapshot['title'] != current_page['title']:
            similarity = self._calculate_similarity(
                previous_snapshot['title'] or "",
                current_page['title'] or ""
            )
            changes.append({
                'type': 'content',
                'category': 'title',
                'summary': 'Page title changed',
                'severity': 'medium',
                'old_value': previous_snapshot['title'],
                'new_value': current_page['title'],
                'similarity': similarity
            })
        
        # Description change
        if previous_snapshot['description'] != current_page['description']:
            similarity = self._calculate_similarity(
                previous_snapshot['description'] or "",
                current_page['description'] or ""
            )
            changes.append({
                'type': 'content',
                'category': 'description',
                'summary': 'Page description changed',
                'severity': 'low',
                'old_value': previous_snapshot['description'],
                'new_value': current_page['description'],
                'similarity': similarity
            })
        
        # Full text change (using hash for efficiency)
        if previous_snapshot['full_text_hash'] != self._calculate_hash(current_page['full_text'] or ""):
            # Get previous full text
            cursor.execute('SELECT full_text FROM pages WHERE id = ?', (previous_snapshot['page_id'],))
            prev_page = cursor.fetchone()
            
            similarity = self._calculate_similarity(
                prev_page['full_text'] or "",
                current_page['full_text'] or ""
            )
            
            # Only log if significant change (< 95% similar)
            if similarity < 0.95:
                changes.append({
                    'type': 'content',
                    'category': 'full_text',
                    'summary': f'Page content changed ({similarity*100:.1f}% similar)',
                    'severity': 'high' if similarity < 0.7 else 'medium',
                    'old_value': prev_page['full_text'][:500] if prev_page['full_text'] else "",
                    'new_value': current_page['full_text'][:500] if current_page['full_text'] else "",
                    'similarity': similarity
                })
        
        # Header count changes
        if previous_snapshot['header_count'] != current_page['header_count']:
            cursor.execute('SELECT COUNT(*) as count FROM headers WHERE page_id = ?', (current_page_id,))
            current_header_count = cursor.fetchone()['count']
            
            diff = current_header_count - previous_snapshot['header_count']
            changes.append({
                'type': 'structure',
                'category': 'headers',
                'summary': f'Header count changed ({diff:+d})',
                'severity': 'low',
                'old_value': str(previous_snapshot['header_count']),
                'new_value': str(current_header_count),
                'similarity': 1.0
            })
        
        return changes
    
    def _detect_link_changes(self, cursor, previous_page_id: int, current_page_id: int) -> List[Dict]:
        """Detect added and removed links."""
        changes = []
        
        # Get previous links
        cursor.execute('SELECT url, link_type FROM links WHERE page_id = ?', (previous_page_id,))
        previous_links = {(row['url'], row['link_type']) for row in cursor.fetchall()}
        
        # Get current links
        cursor.execute('SELECT url, link_type FROM links WHERE page_id = ?', (current_page_id,))
        current_links = {(row['url'], row['link_type']) for row in cursor.fetchall()}
        
        # Find added and removed links
        added_links = current_links - previous_links
        removed_links = previous_links - current_links
        
        if added_links:
            changes.append({
                'type': 'links',
                'category': 'added',
                'summary': f'{len(added_links)} new link(s) added',
                'severity': 'low',
                'details': [{'url': url, 'type': link_type} for url, link_type in list(added_links)[:10]],
                'count': len(added_links)
            })
        
        if removed_links:
            changes.append({
                'type': 'links',
                'category': 'removed',
                'summary': f'{len(removed_links)} link(s) removed',
                'severity': 'medium',
                'details': [{'url': url, 'type': link_type} for url, link_type in list(removed_links)[:10]],
                'count': len(removed_links)
            })
        
        return changes
    
    def _detect_media_changes(self, cursor, previous_page_id: int, current_page_id: int) -> List[Dict]:
        """Detect added and removed media (images)."""
        changes = []
        
        # Get previous media
        cursor.execute('SELECT src, alt FROM media WHERE page_id = ?', (previous_page_id,))
        previous_media = {row['src'] for row in cursor.fetchall()}
        
        # Get current media
        cursor.execute('SELECT src, alt FROM media WHERE page_id = ?', (current_page_id,))
        current_media = {row['src'] for row in cursor.fetchall()}
        
        # Find added and removed media
        added_media = current_media - previous_media
        removed_media = previous_media - current_media
        
        if added_media:
            changes.append({
                'type': 'media',
                'category': 'added',
                'summary': f'{len(added_media)} new image(s) added',
                'severity': 'low',
                'details': list(added_media)[:10],
                'count': len(added_media)
            })
        
        if removed_media:
            changes.append({
                'type': 'media',
                'category': 'removed',
                'summary': f'{len(removed_media)} image(s) removed',
                'severity': 'low',
                'details': list(removed_media)[:10],
                'count': len(removed_media)
            })
        
        return changes
    
    def _detect_file_changes(self, cursor, previous_page_id: int, current_page_id: int) -> List[Dict]:
        """Detect added and removed downloadable files."""
        changes = []
        
        try:
            # Get previous files
            cursor.execute('SELECT file_url, file_name FROM file_assets WHERE page_id = ?', (previous_page_id,))
            previous_files = {row['file_url'] for row in cursor.fetchall()}
            
            # Get current files
            cursor.execute('SELECT file_url, file_name FROM file_assets WHERE page_id = ?', (current_page_id,))
            current_files = {row['file_url'] for row in cursor.fetchall()}
            
            # Find added and removed files
            added_files = current_files - previous_files
            removed_files = previous_files - current_files
            
            if added_files:
                changes.append({
                    'type': 'files',
                    'category': 'added',
                    'summary': f'{len(added_files)} new file(s) available',
                    'severity': 'medium',
                    'details': list(added_files)[:10],
                    'count': len(added_files)
                })
            
            if removed_files:
                changes.append({
                    'type': 'files',
                    'category': 'removed',
                    'summary': f'{len(removed_files)} file(s) no longer available',
                    'severity': 'high',
                    'details': list(removed_files)[:10],
                    'count': len(removed_files)
                })
        except:
            pass  # Table might not exist
        
        return changes
    
    def _log_changes(self, conn, changes: Dict):
        """Log detected changes to the database."""
        cursor = conn.cursor()
        
        for change in changes['changes']:
            # Insert into change_log
            cursor.execute('''
                INSERT INTO change_log (
                    url, change_timestamp, previous_snapshot_id, current_snapshot_id,
                    change_type, change_category, change_summary, change_details, severity
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                changes['url'],
                changes['timestamp'],
                changes['previous_snapshot_id'],
                changes['current_snapshot_id'],
                change['type'],
                change['category'],
                change['summary'],
                json.dumps(change.get('details', {})),
                change['severity']
            ))
            
            change_log_id = cursor.lastrowid
            
            # Insert detailed content diffs if applicable
            if change['type'] == 'content' and 'old_value' in change:
                html_diff = self._generate_html_diff(
                    change.get('old_value', ''),
                    change.get('new_value', '')
                )
                
                cursor.execute('''
                    INSERT INTO content_diffs (
                        change_log_id, field_name, old_value, new_value,
                        diff_html, similarity_score
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    change_log_id,
                    change['category'],
                    change.get('old_value', ''),
                    change.get('new_value', ''),
                    html_diff,
                    change.get('similarity', 1.0)
                ))
            
            # Insert link changes
            if change['type'] == 'links' and 'details' in change:
                for link_detail in change['details']:
                    cursor.execute('''
                        INSERT INTO link_changes (
                            change_log_id, link_url, link_type, change_action
                        )
                        VALUES (?, ?, ?, ?)
                    ''', (
                        change_log_id,
                        link_detail.get('url', ''),
                        link_detail.get('type', ''),
                        change['category']
                    ))
            
            # Insert media changes
            if change['type'] == 'media' and 'details' in change:
                for media_src in change['details']:
                    cursor.execute('''
                        INSERT INTO media_changes (
                            change_log_id, media_src, media_alt, change_action
                        )
                        VALUES (?, ?, ?, ?)
                    ''', (
                        change_log_id,
                        media_src,
                        '',
                        change['category']
                    ))
        
        conn.commit()
    
    def get_change_history(self, url: str, limit: int = 10) -> List[Dict]:
        """
        Get change history for a specific URL.
        
        Args:
            url (str): URL to get history for
            limit (int): Maximum number of changes to return
            
        Returns:
            list: List of change records
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT 
                    cl.*,
                    datetime(cl.change_timestamp, 'unixepoch') as change_date,
                    ps_prev.title as previous_title,
                    ps_curr.title as current_title
                FROM change_log cl
                LEFT JOIN page_snapshots ps_prev ON cl.previous_snapshot_id = ps_prev.id
                LEFT JOIN page_snapshots ps_curr ON cl.current_snapshot_id = ps_curr.id
                WHERE cl.url = ?
                ORDER BY cl.change_timestamp DESC
                LIMIT ?
            ''', (url, limit))
            
            changes = []
            for row in cursor.fetchall():
                change = dict(row)
                
                # Get detailed content diffs
                cursor.execute('''
                    SELECT * FROM content_diffs WHERE change_log_id = ?
                ''', (change['id'],))
                change['content_diffs'] = [dict(r) for r in cursor.fetchall()]
                
                # Get link changes
                cursor.execute('''
                    SELECT * FROM link_changes WHERE change_log_id = ?
                ''', (change['id'],))
                change['link_changes'] = [dict(r) for r in cursor.fetchall()]
                
                # Get media changes
                cursor.execute('''
                    SELECT * FROM media_changes WHERE change_log_id = ?
                ''', (change['id'],))
                change['media_changes'] = [dict(r) for r in cursor.fetchall()]
                
                changes.append(change)
            
            return changes
            
        finally:
            conn.close()
    
    def get_all_monitored_urls(self) -> List[Dict]:
        """
        Get all URLs that have been monitored for changes.
        
        Returns:
            list: List of URLs with change statistics
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT 
                    url,
                    COUNT(*) as total_changes,
                    MAX(change_timestamp) as last_change,
                    datetime(MAX(change_timestamp), 'unixepoch') as last_change_date,
                    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity_count,
                    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity_count,
                    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity_count
                FROM change_log
                GROUP BY url
                ORDER BY last_change DESC
            ''')
            
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()
    
    def compare_snapshots(self, snapshot_id_1: int, snapshot_id_2: int) -> Dict:
        """
        Compare two specific snapshots.
        
        Args:
            snapshot_id_1 (int): First snapshot ID
            snapshot_id_2 (int): Second snapshot ID
            
        Returns:
            dict: Comparison results
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            # Get both snapshots
            cursor.execute('SELECT * FROM page_snapshots WHERE id = ?', (snapshot_id_1,))
            snapshot1 = cursor.fetchone()
            
            cursor.execute('SELECT * FROM page_snapshots WHERE id = ?', (snapshot_id_2,))
            snapshot2 = cursor.fetchone()
            
            if not snapshot1 or not snapshot2:
                return {'error': 'Snapshot not found'}
            
            comparison = {
                'snapshot1': dict(snapshot1),
                'snapshot2': dict(snapshot2),
                'differences': []
            }
            
            # Compare fields
            fields = ['title', 'description', 'header_count', 'link_count', 'media_count', 'file_count']
            for field in fields:
                if snapshot1[field] != snapshot2[field]:
                    comparison['differences'].append({
                        'field': field,
                        'value1': snapshot1[field],
                        'value2': snapshot2[field]
                    })
            
            return comparison
            
        finally:
            conn.close()

class Scraper:
    """
    A production-grade asynchronous web scraper built with Playwright and Python.

    This scraper supports:
    - Asynchronous crawling with configurable concurrency.
    - JavaScript rendering and interaction (via Playwright).
    - Browser fingerprinting (User-Agent, Viewport, etc.) to avoid detection.
    - Proxy rotation and failure handling.
    - robust authentication (Login with persistence via storage state).
    - Data extraction (HTML structure, JSON-LD, Media).
    - Asset downloading (PDFs, Images, etc.).
    - SQLite storage for structured data.

    Attributes:
        start_url (str): The initial URL to start scraping from.
        base_dir (str): Directory for storing logs, database, and downloaded files.
        db_path (str): Path to the SQLite database.
        queue (deque): FIFO queue for managing URLs to visit.
        visited (set): Set of already visited URLs to prevent cycles.
    """

    def __init__(
        self, start_url, 
        max_pages=None, 
        max_depth=None, 
        base_dir=None,
        headless=None, 
        concurrent_limit=None, 
        proxy_file=None,
        login_url=None, 
        username=None, 
        password=None, 
        username_selector=None, 
        password_selector=None,
        submit_selector=None,
        success_indicator=None,
        auth_state_file=None,
        download_file_assets=None,
        max_file_size_mb=None,
    ):
        """
        Initialize the Scraper with configuration parameters.

        Args:
            start_url (str): The URL where the scraping process begins.
            max_pages (int, optional): Maximum number of pages to scrape. Defaults to config.
            max_depth (int, optional): Maximum recursion depth for link following. Defaults to config.
            base_dir (str, optional): Base directory for output. Defaults to config.
            headless (bool, optional): Whether to run browser in headless mode. Defaults to config.
            concurrent_limit (int, optional): Number of concurrent browser contexts/workers. Defaults to config.
            proxy_file (str, optional): Path to a file containing proxy strings. Defaults to config.
            login_url (str, optional): URL to the login page.
            username (str, optional): Username for authentication.
            password (str, optional): Password for authentication.
            username_selector (str, optional): CSS selector for the username input.
            password_selector (str, optional): CSS selector for the password input.
            submit_selector (str, optional): CSS selector for the login submit button.
            success_indicator (str, optional): Selector that appears only after successful login.
            auth_state_file (str, optional): Filename to save/load authentication cookies.
            download_file_assets (bool, optional): Whether to download files (PDF, etc.).
            max_file_size_mb (int, optional): Max size in MB for downloaded files.
        """
        self.start_url = self._normalize_url(start_url)
        self.should_stop = False
        self.is_paused = False
        self.domain = urlparse(self.start_url).netloc
        
        # Load configuration overrides or defaults
        self.max_pages = max_pages if max_pages is not None else config.SCRAPER['max_pages']
        self.max_depth = max_depth if max_depth is not None else config.SCRAPER['max_depth']
        self.base_dir = base_dir if base_dir is not None else config.SCRAPER['base_dir']
        self.headless = headless if headless is not None else config.FEATURES['headless_browser']
        self.concurrent_limit = concurrent_limit if concurrent_limit is not None else config.SCRAPER['concurrent_limit']
        self.proxy_file = proxy_file if proxy_file is not None else config.PROXY['proxy_file']
        
        # File download settings
        self.download_file_assets = download_file_assets if download_file_assets is not None else config.FEATURES['download_file_assets']
        self.max_file_size_mb = max_file_size_mb if max_file_size_mb is not None else config.FILE_DOWNLOAD['max_file_size_mb']
        self.max_file_size_bytes = self.max_file_size_mb * 1024 * 1024
        self.downloadable_extensions = config.FILE_DOWNLOAD['downloadable_extensions']
        
        # Authentication settings
        self.login_url = login_url if login_url is not None else config.AUTH['login_url']
        self.username = username if username is not None else config.AUTH['username']
        self.password = password if password is not None else config.AUTH['password']
        self.username_selector = username_selector if username_selector is not None else config.AUTH['username_selector']
        self.password_selector = password_selector if password_selector is not None else config.AUTH['password_selector']
        self.submit_selector = submit_selector if submit_selector is not None else config.AUTH['submit_selector']
        self.success_indicator = success_indicator if success_indicator is not None else config.AUTH['success_indicator']
        self.manual_login_mode = config.AUTH.get('manual_login_mode', False)
        
        # Auth state storage
        auth_state_filename = auth_state_file if auth_state_file is not None else config.AUTH['auth_state_file']
        self.auth_state_file = os.path.join(self.base_dir, auth_state_filename)
        self.storage_state = None
        
        # Ensure output directory exists
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

        self._setup_logging()

        # Proxy management
        self.proxies = self._load_proxies()
        self.proxy_index = 0
        self.proxy_lock = asyncio.Lock()
        self.failed_proxies = set()
        
        # Database setup
        self.db_path = os.path.join(self.base_dir, "scraped_data.db")
        self._init_database()
        
        # Queue management
        self.queue = deque([(self.start_url, 0)]) # Tuple: (URL, Depth)
        self.visited = set([self.start_url])
        self.pages_scraped = 0
        self.lock = asyncio.Lock()
        
        # Stats tracking
        self.downloads_stats = {
            'total_attempted': 0,
            'successful': 0,
            'failed': 0,
            'total_bytes': 0
        }
        
        # Diff tracking
        self.diff_tracker = DiffTracker(self.db_path)
        self.enable_diff_tracking = True  # Can be configured

    def _setup_logging(self):
        """
        Configures logging to both console (stdout) and a file (scraper.log).
        """
        log_dir = os.path.join(self.base_dir, 'logs')
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, 'scraper.log')
        
        self.logger = logging.getLogger('Scraper')
        self.logger.setLevel(logging.INFO)
        
        # Console Handler
        c_handler = logging.StreamHandler()
        # File Handler
        f_handler = logging.FileHandler(log_file)
        
        c_handler.setLevel(logging.INFO)
        f_handler.setLevel(logging.INFO)

        log_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        c_handler.setFormatter(log_format)
        f_handler.setFormatter(log_format)

        if not self.logger.handlers:
            self.logger.addHandler(c_handler)
            self.logger.addHandler(f_handler)

    def _load_proxies(self):
        """
        Loads proxy configurations from a file if enabled.

        Returns:
            list: A list of proxy connection strings, or empty list if disabled/not found.
        """
        proxies = []
        
        if not config.FEATURES['use_proxies']:
            self.logger.info("Proxy feature is disabled in config. Running without proxies.")
            return []
        
        if not os.path.exists(self.proxy_file):
            self.logger.warning(f"Proxy file '{self.proxy_file}' not found. Running without proxies.")
            return []
        
        with open(self.proxy_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    proxies.append(line)
        
        self.logger.info(f"Loaded {len(proxies)} proxies from {self.proxy_file}")
        return proxies

    async def _get_next_proxy(self):
        """
        Retrieves the next available proxy from the list in a round-robin fashion.
        
        Thread-safe method using AsyncIO locks. Skips proxies marked as failed.

        Returns:
            str or None: Proxy string or None if no proxies are available/working.
        """
        if not self.proxies:
            return None
        
        async with self.proxy_lock:
            attempts = 0
            max_attempts = len(self.proxies)
            
            while attempts < max_attempts:
                proxy = self.proxies[self.proxy_index]
                self.proxy_index = (self.proxy_index + 1) % len(self.proxies)
                
                if proxy not in self.failed_proxies:
                    return proxy
                
                attempts += 1
            
            self.logger.warning("All proxies have failed. Continuing without proxy.")
            return None

    async def _mark_proxy_failed(self, proxy):
        """
        Marks a specific proxy as failed so it won't be reused in this session.

        Args:
            proxy (str): The proxy string to blocklist.
        """
        async with self.proxy_lock:
            self.failed_proxies.add(proxy)
            self.logger.warning(f"Marked proxy as failed: {proxy}")

    def _generate_fingerprint(self):
        """
        Generates a random browser fingerprint to avoid bot detection.

        Returns:
            dict: Dictionary containing viewport, user_agent, timezone, etc.
        """
        fingerprint = {
            "viewport": random.choice(config.FINGERPRINTS['viewports']),
            "user_agent": random.choice(config.FINGERPRINTS['user_agents']),
            "timezone_id": random.choice(config.FINGERPRINTS['timezones']),
            "geolocation": random.choice(config.FINGERPRINTS['geolocations']),
            "locale": random.choice(config.FINGERPRINTS['locales'])[0],
            "screen": random.choice(config.FINGERPRINTS['screens']),
            "device_scale_factor": random.choice(config.FINGERPRINTS['device_scale_factors']),
            "is_mobile": False,
            "has_touch": random.choice(config.FINGERPRINTS['has_touch_options']),
        }
        
        return fingerprint

    async def perform_manual_login(self, browser):
        """
        Opens a visible browser window for MANUAL login.
        Useful for sites with CAPTCHA or strong bot detection (Pinterest, Instagram, etc.)
        
        User logs in manually, then the session is saved automatically.
        
        Args:
            browser (Browser): The Playwright browser instance.
            
        Returns:
            bool: True if session was saved, False otherwise.
        """
        self.logger.info("=" * 70)
        self.logger.info("MANUAL LOGIN MODE")
        self.logger.info("=" * 70)
        self.logger.info(f"Opening browser for manual login to: {self.login_url}")
        self.logger.info("Please log in manually in the browser window that opens.")
        self.logger.info("After successful login, navigate to your target page.")
        self.logger.info("The session will be saved automatically after 30 seconds.")
        self.logger.info("=" * 70)
        
        try:
            # Create context with fingerprint but NO storage state
            fingerprint = self._generate_fingerprint()
            context_options = {
                "user_agent": fingerprint["user_agent"],
                "viewport": fingerprint["viewport"],
                "timezone_id": fingerprint["timezone_id"],
                "geolocation": fingerprint["geolocation"],
                "permissions": ["geolocation"],
                "locale": fingerprint["locale"],
            }
            
            context = await browser.new_context(**context_options)
            page = await context.new_page()
            
            # Navigate to login page
            await page.goto(self.login_url, timeout=30000)
            
            self.logger.info("Browser opened. Waiting 60 seconds for you to log in manually...")
            self.logger.info("(You can close this message once you've logged in)")
            
            # Wait for user to login (60 seconds)
            await asyncio.sleep(60)
            
            # Save the session state
            self.storage_state = await context.storage_state()
            
            with open(self.auth_state_file, 'w') as f:
                json.dump(self.storage_state, f, indent=2)
            
            self.logger.info(f"Session saved to: {self.auth_state_file}")
            self.logger.info(f"Saved {len(self.storage_state.get('cookies', []))} cookies")
            
            await page.close()
            await context.close()
            
            self.logger.info("Manual login complete! Session will be reused for scraping.")
            return True
            
        except Exception as e:
            self.logger.error(f"Manual login failed: {e}")
            return False

    async def perform_login(self, browser):
        """
        Handles the authentication process.
        
        1. Checks for an existing 'auth_state_file'.
        2. If found, tests if the session is still valid.
        3. If invalid or not found, performs a fresh login using credentials.
        4. Saves the successful session state to disk for future runs.

        Args:
            browser (Browser): The Playwright browser instance.

        Returns:
            bool: True if logged in (or session valid), False otherwise.
        """
        if not self.login_url or not self.username or not self.password:
            self.logger.info("No login credentials provided. Skipping authentication.")
            return False
        
        self.logger.info(f"Starting authentication for {self.username} at {self.login_url}")
        
        # 1. Attempt to restore session
        if os.path.exists(self.auth_state_file):
            self.logger.info("Found saved authentication state. Testing validity...")
            
            try:
                with open(self.auth_state_file, 'r') as f:
                    self.storage_state = json.load(f)
                
                # Test the state in a new context
                test_context = await browser.new_context(storage_state=self.storage_state)
                test_page = await test_context.new_page()
                
                try:
                    test_url = self.start_url if self.start_url != self.login_url else self.login_url
                    await test_page.goto(test_url, timeout=15000)
                    await asyncio.sleep(2)
                    
                    current_url = test_page.url
                    
                    # Heuristic: If we are redirected back to login URL, session is likely expired
                    if self.login_url in current_url:
                        self.logger.info("Saved session expired. Need fresh login.")
                        self.storage_state = None
                    else:
                        self.logger.info("Saved session is still valid! Using existing authentication.")
                        await test_page.close()
                        await test_context.close()
                        return True
                    
                except Exception as e:
                    self.logger.warning(f"Session test failed: {e}")
                
                await test_page.close()
                await test_context.close()
                
            except Exception as e:
                self.logger.error(f"Could not load saved auth state: {e}")
        
        # 2. Perform Fresh Login
        self.logger.info("Performing fresh login...")
        
        try:
            fingerprint = self._generate_fingerprint()
            context, _ = await self.create_context(browser)
            page = await context.new_page()
            
            # Add extra stealth scripts for sites like Pinterest
            await page.add_init_script("""
                // Remove webdriver property
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
                
                // Mock plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                
                // Mock languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                });
                
                // Chrome runtime
                window.chrome = {
                    runtime: {}
                };
                
                // Permissions
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );
            """)
            
            self.logger.info(f"Navigating to login URL: {self.login_url}")
            await page.goto(self.login_url, wait_until="networkidle", timeout=30000)
            
            # Add human-like delays
            await asyncio.sleep(random.uniform(2, 4))
            
            # Scroll a bit to simulate human behavior
            await page.evaluate("window.scrollTo(0, 100)")
            await asyncio.sleep(random.uniform(0.5, 1))
            
            self.logger.debug(f"Entering username")
            # Type slowly like a human
            await page.click(self.username_selector)
            await asyncio.sleep(random.uniform(0.3, 0.7))
            await page.type(self.username_selector, self.username, delay=random.randint(50, 150))
            await asyncio.sleep(random.uniform(0.5, 1))
            
            self.logger.debug(f"Entering password")
            await page.click(self.password_selector)
            await asyncio.sleep(random.uniform(0.3, 0.7))
            await page.type(self.password_selector, self.password, delay=random.randint(50, 150))
            await asyncio.sleep(random.uniform(1, 2))
            
            self.logger.debug(f"Clicking submit button")
            await page.click(self.submit_selector)
            
            self.logger.info(f"Waiting for login to complete...")
            try:
                await page.wait_for_load_state("networkidle", timeout=15000)
            except:
                await asyncio.sleep(5)
            
            current_url = page.url
            
            login_successful = False
            
            # 3. Verify Login Success
            if self.success_indicator:
                try:
                    await page.wait_for_selector(self.success_indicator, timeout=10000)
                    self.logger.info(f"Success indicator found: {self.success_indicator}")
                    login_successful = True
                except:
                    self.logger.warning(f"Success indicator not found: {self.success_indicator}")
            else:
                # Fallback: check URL change or absence of error messages
                if current_url != self.login_url:
                    self.logger.info(f"URL changed from login page (assumed successful)")
                    login_successful = True
                else:
                    error_selectors = [
                        ".error", ".alert-error", ".login-error",
                        "[class*='error']", "[class*='invalid']"
                    ]
                    
                    has_error = False
                    for selector in error_selectors:
                        try:
                            error_elem = await page.query_selector(selector)
                            if error_elem:
                                error_text = await error_elem.inner_text()
                                if error_text:
                                    self.logger.error(f"Login error detected: {error_text}")
                                    has_error = True
                                    break
                        except:
                            continue
                    
                    if not has_error:
                        login_successful = True
            
            # 4. Save State or Log Error
            if login_successful:
                self.logger.info(f"Login successful. Saving state to: {self.auth_state_file}")
                
                self.storage_state = await context.storage_state()
                
                with open(self.auth_state_file, 'w') as f:
                    json.dump(self.storage_state, f, indent=2)
                
                if 'cookies' in self.storage_state:
                    self.logger.debug(f"Saved {len(self.storage_state['cookies'])} cookies")
                
                await page.close()
                await context.close()
                return True
            else:
                self.logger.error("Authentication Failed. Check credentials, selectors, and success indicator.")
                
                try:
                    screenshot_path = os.path.join(self.base_dir, "login_error.png")
                    await page.screenshot(path=screenshot_path)
                    self.logger.error(f"Saved error screenshot to: {screenshot_path}")
                except:
                    pass
                
                await page.close()
                await context.close()
                return False
                
        except Exception as e:
            self.logger.error(f"Login exception: {e}")
            
            try:
                screenshot_path = os.path.join(self.base_dir, "login_error.png")
                await page.screenshot(path=screenshot_path)
                self.logger.error(f"Saved error screenshot to: {screenshot_path}")
            except:
                pass
            return False

    def _init_database(self):
        """
        Initializes the SQLite database schema.
        
        Creates tables for pages, headers, links, media, structured data,
        raw HTML structure, and file assets if they don't exist.
        """
        os.makedirs(os.path.dirname(self.db_path) if os.path.dirname(self.db_path) else '.', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Main pages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE NOT NULL,
                title TEXT,
                description TEXT,
                full_text TEXT,
                depth INTEGER,
                timestamp REAL,
                folder_path TEXT,
                proxy_used TEXT,
                fingerprint TEXT,
                authenticated BOOLEAN
            )
        ''')
        
        # Headers (h1-h6)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS headers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                header_type TEXT,
                header_text TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # Links found on the page
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                link_type TEXT,
                url TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # Media (images, etc)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                src TEXT,
                alt TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # JSON-LD structured data
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS structured_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                json_data TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # Scraped DOM elements structure
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS html_structure (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                tag_name TEXT,
                selector TEXT,
                text_content TEXT,
                attributes TEXT,
                parent_selector TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        # Downloaded files tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS file_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_id INTEGER,
                file_url TEXT,
                file_name TEXT,
                file_extension TEXT,
                file_size_bytes INTEGER,
                local_path TEXT,
                download_status TEXT,
                download_timestamp REAL,
                mime_type TEXT,
                FOREIGN KEY (page_id) REFERENCES pages(id)
            )
        ''')
        
        conn.commit()
        conn.close()

    def _normalize_url(self, url):
        """
        Normalizes a URL by removing query parameters and fragments.

        Args:
            url (str): The input URL.

        Returns:
            str: Cleaned URL string.
        """
        parsed = urlparse(url)
        clean_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
        return clean_url.rstrip('/')

    def _create_folder_path(self, url):
        """
        Creates a local directory structure mirroring the URL path.
        Used for saving screenshots and downloads.

        Args:
            url (str): The URL to map to a folder.

        Returns:
            str: The full path to the created local directory.
        """
        parsed = urlparse(url)
        
        domain_clean = re.sub(r'[^a-zA-Z0-9]', '_', parsed.netloc)
        path_segments = parsed.path.strip("/").split("/")
        path_segments = [s for s in path_segments if s]
        
        if not path_segments:
            path_segments = ["home"]
            
        # Limit segment length to avoid OS filename limits
        safe_segments = [re.sub(r'[^a-zA-Z0-9\-_]', '_', s)[:50] for s in path_segments]
        full_path = os.path.join(self.base_dir, domain_clean, *safe_segments)
        
        if not os.path.exists(full_path):
            os.makedirs(full_path)
            
        return full_path

    def _is_downloadable_file(self, url):
        """Checks if a URL points to a file extension configured for download."""
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        ext = os.path.splitext(path)[1]
        return ext in self.downloadable_extensions

    def _get_file_extension(self, url, content_type=None):
        """
        Determines the file extension from the URL or Content-Type header.
        """
        parsed = urlparse(url)
        path = parsed.path
        ext = os.path.splitext(path)[1].lower()
        
        if ext and ext in self.downloadable_extensions:
            return ext
        
        if content_type:
            extension = mimetypes.guess_extension(content_type.split(';')[0].strip())
            if extension:
                return extension.lower()
        
        return '.bin'

    async def _download_file(self, file_url, save_path, session, max_retries=3):
        """
        Downloads a file asynchronously with retry logic.

        Args:
            file_url (str): URL of the file to download.
            save_path (str): Local path where the file should be saved.
            session (aiohttp.ClientSession): The async HTTP session.
            max_retries (int): Number of download attempts.

        Returns:
            dict: Result dictionary with keys 'success', 'file_size', 'error', 'mime_type'.
        """
        result = {
            'success': False,
            'file_size': 0,
            'error': None,
            'mime_type': None
        }
        
        for attempt in range(max_retries):
            try:
                # Set a high total timeout for large files
                async with session.get(file_url, timeout=aiohttp.ClientTimeout(total=60)) as response:
                    if response.status == 200:
                        content_length = response.headers.get('Content-Length')
                        if content_length:
                            file_size = int(content_length)
                            if file_size > self.max_file_size_bytes:
                                result['error'] = f"File too large: {file_size / (1024*1024):.1f}MB"
                                return result
                        
                        result['mime_type'] = response.headers.get('Content-Type', 'application/octet-stream')
                        
                        with open(save_path, 'wb') as f:
                            total_downloaded = 0
                            # Stream content to avoid loading large files into memory
                            async for chunk in response.content.iter_chunked(8192):
                                f.write(chunk)
                                total_downloaded += len(chunk)
                                
                                if total_downloaded > self.max_file_size_bytes:
                                    result['error'] = "File exceeded size limit during download"
                                    os.remove(save_path)
                                    return result
                        
                        result['success'] = True
                        result['file_size'] = total_downloaded
                        return result
                    else:
                        result['error'] = f"HTTP {response.status}"
                        
            except asyncio.TimeoutError:
                result['error'] = "Download timeout"
            except Exception as e:
                result['error'] = str(e)
            
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
        
        return result

    async def _extract_file_links(self, page, base_url):
        """
        Scans the page for links pointing to downloadable assets.

        Args:
            page (Page): Playwright page object.
            base_url (str): Base URL to resolve relative links.

        Returns:
            list: List of dicts containing 'url' and 'link_text'.
        """
        file_links = []
        
        try:
            # Method 1: Check standard anchor tags
            links = await page.locator("a").all()
            
            for link in links:
                try:
                    href = await link.get_attribute("href")
                    if not href:
                        continue
                    
                    full_url = urljoin(base_url, href)
                    
                    if self._is_downloadable_file(full_url):
                        link_text = ""
                        try:
                            link_text = await link.inner_text()
                            link_text = re.sub(r'[^a-zA-Z0-9\s\-_]', '', link_text)[:50].strip()
                        except:
                            pass
                        
                        file_links.append({
                            'url': full_url,
                            'link_text': link_text
                        })
                
                except Exception as e:
                    continue
            
            # Method 2: Check custom attributes or specific patterns commonly used for downloads
            for selector in ['[data-download]', '[data-file]', '[href$=".pdf"]', 
                           '[href$=".docx"]', '[href$=".zip"]', '[href$=".csv"]']:
                try:
                    elements = await page.locator(selector).all()
                    for elem in elements:
                        href = await elem.get_attribute("href") or await elem.get_attribute("data-download") or await elem.get_attribute("data-file")
                        if href:
                            full_url = urljoin(base_url, href)
                            if self._is_downloadable_file(full_url):
                                file_links.append({
                                    'url': full_url,
                                    'link_text': ''
                                })
                except:
                    continue
        
        except Exception as e:
            self.logger.warning(f"Error extracting file links: {e}")
        
        # Deduplicate
        unique_files = {}
        for file_info in file_links:
            url = file_info['url']
            if url not in unique_files:
                unique_files[url] = file_info
        
        return list(unique_files.values())

    async def smart_scroll(self, page):
        """
        Performs smart scrolling to trigger lazy-loaded content.
        Scrolls to the bottom repeatedly until height stops increasing or limit is reached.
        """
        try:
            last_height = await page.evaluate("document.body.scrollHeight")
            for i in range(5):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(random.uniform(1.0, 1.5))
                new_height = await page.evaluate("document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
        except Exception:
            pass

    async def extract_html_structure(self, page):
        """
        Injects JavaScript to traverse the DOM and extract a structured representation
        of key elements (h1-h6, p, a, button, etc.).

        Args:
            page (Page): Playwright page object.

        Returns:
            list: List of dicts representing DOM elements with selectors and attributes.
        """
        try:
            # Execute JS in browser context
            structure = await page.evaluate("""
                () => {
                    const elements = [];
                    const processedElements = new Set();
                    
                    // Helper: Generate a unique CSS selector for an element
                    function getSelector(element) {
                        if (element.id) {
                            return '#' + element.id;
                        }
                        
                        let path = [];
                        while (element && element.nodeType === Node.ELEMENT_NODE) {
                            let selector = element.nodeName.toLowerCase();
                            
                            if (element.className && typeof element.className === 'string') {
                                const classes = element.className.trim().split(/\\s+/).filter(c => c);
                                if (classes.length > 0) {
                                    selector += '.' + classes.slice(0, 3).join('.');
                                }
                            }
                            
                            // Add nth-child if needed for uniqueness among siblings
                            if (element.parentNode) {
                                const siblings = Array.from(element.parentNode.children);
                                const index = siblings.indexOf(element) + 1;
                                if (siblings.length > 1) {
                                    selector += `:nth-child(${index})`;
                                }
                            }
                            
                            path.unshift(selector);
                            element = element.parentElement;
                            
                            // Limit depth to avoid massive selectors
                            if (path.length >= 5) break;
                        }
                        
                        return path.join(' > ');
                    }
                    
                    function getParentSelector(element) {
                        if (element.parentElement) {
                            return getSelector(element.parentElement);
                        }
                        return null;
                    }
                    
                    function getAttributes(element) {
                        const attrs = {};
                        for (let attr of element.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                        return attrs;
                    }
                    
                    // Target specific content tags
                    const selectors = [
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        'p', 'a', 'button', 'input', 'textarea', 'select',
                        'div[class]', 'section', 'article', 'nav', 'header', 'footer',
                        'ul', 'ol', 'li', 'table', 'form', 'img'
                    ];
                    
                    selectors.forEach(sel => {
                        const elems = document.querySelectorAll(sel);
                        elems.forEach((elem, idx) => {
                            if (processedElements.has(elem)) return;
                            
                            const style = window.getComputedStyle(elem);
                            if (style.display === 'none' || style.visibility === 'hidden') return;
                            
                            // Get text content (truncated)
                            let textContent = elem.textContent?.trim() || '';
                            if (textContent.length > 200) {
                                textContent = textContent.substring(0, 200) + '...';
                            }
                            
                            // Filter empty elements unless they are images or inputs
                            if (!textContent && !elem.src && !elem.href) return;
                            
                            const selector = getSelector(elem);
                            const parentSelector = getParentSelector(elem);
                            const attributes = getAttributes(elem);
                            
                            elements.push({
                                tag: elem.tagName.toLowerCase(),
                                selector: selector,
                                text: textContent,
                                attributes: attributes,
                                parent: parentSelector
                            });
                            
                            processedElements.add(elem);
                            
                            // Hard limit to prevent memory issues on large pages
                            if (elements.length >= 500) return;
                        });
                    });
                    
                    return elements;
                }
            """)
            
            return structure
        except Exception as e:
            self.logger.error(f"Error extracting HTML structure: {e}")
            return []

    async def extract_and_save_data(self, page, depth, proxy_used, fingerprint):
        """
        Main extraction routine for a single page.
        
        1. Extracts JSON-LD structured data.
        2. Extracts Headers and Body text.
        3. Extracts Media (Images) and Links.
        4. Extracts HTML structure using JS injection.
        5. Downloads linked files if enabled.
        6. Saves all gathered data to SQLite.
        7. Saves screenshots to disk.

        Args:
            page (Page): Playwright page object.
            depth (int): Current crawl depth.
            proxy_used (str): The proxy used for this request.
            fingerprint (dict): The fingerprint used for this request.

        Returns:
            tuple: (internal_links, current_depth)
        """
        url = page.url
        
        title = await page.title()
        description = "No description"
        try:
            desc = page.locator('meta[name="description"]').first
            if await desc.count() > 0:
                description = await desc.get_attribute("content")
        except:
            pass

        # --- Structured Data (JSON-LD) ---
        structured_data = []
        scripts = await page.locator('script[type="application/ld+json"]').all()
        for script in scripts:
            try:
                text = await script.inner_text()
                structured_data.append(json.loads(text))
            except:
                continue

        # --- Content Extraction ---
        headers = {}
        for h in ['h1', 'h2', 'h3']:
            headers[h] = await page.locator(h).all_inner_texts()

        try:
            full_text = await page.locator("body").inner_text()
        except:
            full_text = ""

        # --- Media Extraction ---
        media = []
        imgs = await page.locator("img").all()
        for img in imgs:
            try:
                src = await img.get_attribute("src") or await img.get_attribute("data-src")
                alt = await img.get_attribute("alt") or ""
                
                if src:
                    # Normalize relative URLs
                    if not src.startswith("http"):
                        if src.startswith("//"):
                            src = "https:" + src
                        elif src.startswith("/"):
                            src = urljoin(url, src)
                        else:
                            src = urljoin(url, src)
                    
                    if src.startswith("http"):
                        media.append({"src": src, "alt": alt})
            except:
                continue

        # --- Link Extraction ---
        internal_links = []
        external_links = []
        links = await page.locator("a").all()
        
        for link in links:
            try:
                href = await link.get_attribute("href")
                if not href:
                    continue
                
                full_url = urljoin(url, href)
                clean_url = self._normalize_url(full_url)
                parsed_href = urlparse(clean_url)
                
                if parsed_href.netloc == self.domain:
                    internal_links.append(full_url)
                elif parsed_href.scheme.startswith('http'):
                    external_links.append(full_url)
            except:
                continue

        folder_path = self._create_folder_path(url)
        
        # --- Advanced Structure Extraction ---
        html_structure = await self.extract_html_structure(page)

        # --- File Asset Download ---
        file_assets = []
        if self.download_file_assets:
            self.logger.info("Searching for downloadable files...")
            file_links = await self._extract_file_links(page, url)
            
            if file_links:
                self.logger.info(f"Found {len(file_links)} file(s) to download")
                
                downloads_folder = os.path.join(folder_path, "downloads")
                if not os.path.exists(downloads_folder):
                    os.makedirs(downloads_folder)
                
                async with aiohttp.ClientSession() as session:
                    for idx, file_info in enumerate(file_links):
                        file_url = file_info['url']
                        link_text = file_info['link_text']
                        
                        # Calculate filename
                        parsed_file_url = urlparse(file_url)
                        original_filename = os.path.basename(parsed_file_url.path)
                        
                        safe_filename = re.sub(r'[^a-zA-Z0-9\-_\.]', '_', original_filename)
                        if not safe_filename or safe_filename == '_':
                            base_name = link_text if link_text else f"file_{idx+1}"
                            ext = self._get_file_extension(file_url)
                            safe_filename = f"{base_name}{ext}"
                        
                        # Avoid overwriting files with same name
                        save_path = os.path.join(downloads_folder, safe_filename)
                        counter = 1
                        while os.path.exists(save_path):
                            name, ext = os.path.splitext(safe_filename)
                            save_path = os.path.join(downloads_folder, f"{name}_{counter}{ext}")
                            counter += 1
                        
                        self.logger.info(f"Downloading: {safe_filename}")
                        self.downloads_stats['total_attempted'] += 1
                        
                        download_result = await self._download_file(file_url, save_path, session)
                        
                        if download_result['success']:
                            self.downloads_stats['successful'] += 1
                            self.downloads_stats['total_bytes'] += download_result['file_size']
                            
                            file_size_mb = download_result['file_size'] / (1024 * 1024)
                            self.logger.info(f"Downloaded: {safe_filename} ({file_size_mb:.2f} MB)")
                            
                            file_assets.append({
                                'url': file_url,
                                'filename': safe_filename,
                                'extension': os.path.splitext(safe_filename)[1],
                                'size_bytes': download_result['file_size'],
                                'local_path': os.path.relpath(save_path, folder_path),
                                'status': 'success',
                                'mime_type': download_result['mime_type']
                            })
                        else:
                            self.downloads_stats['failed'] += 1
                            self.logger.error(f"Failed: {safe_filename} - {download_result['error']}")
                            
                            file_assets.append({
                                'url': file_url,
                                'filename': safe_filename,
                                'extension': os.path.splitext(safe_filename)[1],
                                'size_bytes': 0,
                                'local_path': None,
                                'status': 'failed',
                                'mime_type': None,
                                'error': download_result['error']
                            })

        # --- Database Insertion ---
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        page_id = None
        try:
            cursor.execute('''
                INSERT INTO pages (url, title, description, full_text, depth, timestamp, 
                                   folder_path, proxy_used, fingerprint, authenticated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (url, title, description, full_text, depth, time.time(), 
                  folder_path, proxy_used or "Direct", json.dumps(fingerprint),
                  bool(self.storage_state)))
            
            page_id = cursor.lastrowid
            
            for header_type, texts in headers.items():
                for text in texts:
                    cursor.execute('''
                        INSERT INTO headers (page_id, header_type, header_text)
                        VALUES (?, ?, ?)
                    ''', (page_id, header_type, text))
            
            for link in set(internal_links):
                cursor.execute('''
                    INSERT INTO links (page_id, link_type, url)
                    VALUES (?, ?, ?)
                ''', (page_id, 'internal', link))
            
            for link in set(external_links):
                cursor.execute('''
                    INSERT INTO links (page_id, link_type, url)
                    VALUES (?, ?, ?)
                ''', (page_id, 'external', link))
            
            for img in media:
                cursor.execute('''
                    INSERT INTO media (page_id, src, alt)
                    VALUES (?, ?, ?)
                ''', (page_id, img['src'], img['alt']))
            
            for data in structured_data:
                cursor.execute('''
                    INSERT INTO structured_data (page_id, json_data)
                    VALUES (?, ?)
                ''', (page_id, json.dumps(data)))
            
            for elem in html_structure:
                cursor.execute('''
                    INSERT INTO html_structure (page_id, tag_name, selector, text_content, attributes, parent_selector)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (page_id, elem['tag'], elem['selector'], elem['text'], 
                     json.dumps(elem['attributes']), elem['parent']))
            
            for file_asset in file_assets:
                cursor.execute('''
                    INSERT INTO file_assets (page_id, file_url, file_name, file_extension, 
                                            file_size_bytes, local_path, download_status, 
                                            download_timestamp, mime_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (page_id, file_asset['url'], file_asset['filename'], 
                     file_asset['extension'], file_asset['size_bytes'],
                     file_asset['local_path'], file_asset['status'],
                     time.time(), file_asset['mime_type']))
            
            conn.commit()
            
            # Detect changes if diff tracking is enabled
            if self.enable_diff_tracking and page_id:
                try:
                    change_result = self.diff_tracker.detect_changes(url, page_id)
                    if change_result and change_result.get('changes_detected'):
                        self.logger.info(f"Changes detected for {url}: {len(change_result['changes'])} change(s)")
                        for change in change_result['changes']:
                            self.logger.info(f"  - {change['summary']} (severity: {change['severity']})")
                except Exception as e:
                    self.logger.error(f"Error in diff tracking: {e}")
            
        except sqlite3.IntegrityError:
            # URL already exists - try to get existing page_id for diff tracking
            cursor.execute('SELECT id FROM pages WHERE url = ?', (url,))
            existing = cursor.fetchone()
            if existing and self.enable_diff_tracking:
                try:
                    change_result = self.diff_tracker.detect_changes(url, existing[0])
                    if change_result and change_result.get('changes_detected'):
                        self.logger.info(f"Changes detected for existing URL {url}")
                except Exception as e:
                    self.logger.error(f"Error in diff tracking: {e}")
        finally:
            conn.close()

        try:
            await page.screenshot(
                path=os.path.join(folder_path, "screenshot.png"),
                full_page=True,
                timeout=10000
            )
        except:
            # Fallback for very long pages that timeout on full_page
            try:
                await page.screenshot(
                    path=os.path.join(folder_path, "screenshot.png"),
                    full_page=False
                )
            except:
                pass

        return internal_links, depth

    async def discover_and_queue_links(self, internal_links, current_depth):
        """
        Filters found links and adds new unique URLs to the queue.
        Implements breadth-first search logic respecting max_depth.

        Args:
            internal_links (list): List of URLs found on the current page.
            current_depth (int): The depth of the current page.

        Returns:
            int: Number of new links added to the queue.
        """
        new_links_found = 0
        
        async with self.lock:
            for link in internal_links:
                clean_url = self._normalize_url(link)
                
                if (current_depth < self.max_depth and 
                    clean_url not in self.visited):
                    
                    self.visited.add(clean_url)
                    self.queue.append((clean_url, current_depth + 1))
                    new_links_found += 1
        
        return new_links_found

    async def create_context(self, browser, proxy=None, storage_state=None):
        """
        Creates a new isolated browser context with specific fingerprinting options.

        Args:
            browser (Browser): Playwright browser instance.
            proxy (str, optional): Proxy connection string.
            storage_state (dict, optional): Cookies/Storage for authentication.

        Returns:
            tuple: (BrowserContext, fingerprint_dict)
        """
        fingerprint = self._generate_fingerprint()
        
        context_options = {
            "user_agent": fingerprint["user_agent"],
            "viewport": fingerprint["viewport"],
            "timezone_id": fingerprint["timezone_id"],
            "geolocation": fingerprint["geolocation"],
            "permissions": ["geolocation"],
            "locale": fingerprint["locale"],
            "device_scale_factor": fingerprint["device_scale_factor"],
            "is_mobile": fingerprint["is_mobile"],
            "has_touch": fingerprint["has_touch"],
        }
        
        if storage_state:
            context_options["storage_state"] = storage_state
        
        if proxy:
            parsed_proxy = urlparse(proxy)
            proxy_config = {
                "server": f"{parsed_proxy.scheme}://{parsed_proxy.hostname}:{parsed_proxy.port}"
            }
            
            if parsed_proxy.username and parsed_proxy.password:
                proxy_config["username"] = parsed_proxy.username
                proxy_config["password"] = parsed_proxy.password
            
            context_options["proxy"] = proxy_config
        
        context = await browser.new_context(**context_options)
        
        # Anti-detect: Override screen properties to match viewport
        await context.add_init_script(f"""
            Object.defineProperty(screen, 'width', {{
                get: () => {fingerprint['screen']['width']}
            }});
            Object.defineProperty(screen, 'height', {{
                get: () => {fingerprint['screen']['height']}
            }});
        """)
        
        return context, fingerprint

    async def process_page(self, browser, url, depth):
        """
        Orchestrates the processing of a single URL:
        1. Gets a proxy.
        2. Creates a context.
        3. Navigates to the page.
        4. Extracts data.
        5. Handles errors and proxy failures.

        Args:
            browser (Browser): Playwright browser instance.
            url (str): URL to process.
            depth (int): Current depth.
        """
        page = None
        context = None
        proxy = await self._get_next_proxy()
        fingerprint = None
        
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                context, fingerprint = await self.create_context(
                    browser, 
                    proxy, 
                    storage_state=self.storage_state
                )
                page = await context.new_page()
                
                proxy_display = f"via {proxy}" if proxy else "Direct"
                auth_display = "[Auth]" if self.storage_state else "[Guest]"
                self.logger.info(f"{auth_display} Visiting (Depth {depth}) {proxy_display}: {url}")
                
                await page.goto(url, wait_until="domcontentloaded", timeout=45000)
                
                await self.smart_scroll(page)
                
                internal_links, depth = await self.extract_and_save_data(page, depth, proxy, fingerprint)
                
                new_links = await self.discover_and_queue_links(internal_links, depth)
                
                self.logger.info(f"Completed {url} - Found {new_links} new links")
                
                await asyncio.sleep(random.uniform(0.5, 1.5))
                
                break
                
            except Exception as e:
                retry_count += 1
                error_msg = str(e)
                
                # Check if the error is proxy-related
                if proxy and any(keyword in error_msg.lower() for keyword in 
                                ['proxy', 'connection', 'timeout', 'refused']):
                    await self._mark_proxy_failed(proxy)
                    proxy = await self._get_next_proxy()
                    self.logger.warning(f"Retrying with different proxy ({retry_count}/{max_retries})")
                else:
                    self.logger.error(f"Failed {url}: {e}")
                    if retry_count < max_retries:
                        self.logger.info(f"Retrying ({retry_count}/{max_retries})")
                        await asyncio.sleep(2)
                    
            finally:
                if page:
                    await page.close()
                if context:
                    await context.close()

    async def worker(self, browser, worker_id):
        """
        Worker coroutine that consumes URLs from the queue.

        Args:
            browser (Browser): Playwright browser instance.
            worker_id (int): ID for logging purposes.
        """
        while True:
            if self.should_stop:
                self.logger.info(f"[Worker {worker_id}] Stopping...")
                break
            
            # Check if paused
            while self.is_paused:
                self.logger.debug(f"[Worker {worker_id}] Paused, waiting...")
                await asyncio.sleep(1)
                if self.should_stop:
                    self.logger.info(f"[Worker {worker_id}] Stopping while paused...")
                    return
            
            url = None
            depth = 0
            
            async with self.lock:
                if not self.queue or self.pages_scraped >= self.max_pages:
                    break
                
                url, depth = self.queue.popleft()
                self.pages_scraped += 1
                current_count = self.pages_scraped
            
            self.logger.info(f"[Worker {worker_id}] Processing [{current_count}/{self.max_pages}]")
            await self.process_page(browser, url, depth)

    async def run(self):
        """
        Entry point for the scraping process.
        
        1. Launches the browser.
        2. Performs login (if configured).
        3. Spawns concurrent worker tasks.
        4. Waits for completion and reports stats.
        """
        async with async_playwright() as p:
            # For manual login mode, we need a visible browser first
            if self.login_url and self.manual_login_mode:
                self.logger.info("=" * 70)
                self.logger.info("MANUAL LOGIN MODE - Launching visible browser")
                self.logger.info("=" * 70)
                
                # Launch visible browser for manual login
                manual_browser = await p.chromium.launch(
                    headless=False,  # Always visible for manual login
                    args=[
                        "--disable-blink-features=AutomationControlled",
                        "--disable-dev-shm-usage",
                        "--no-sandbox"
                    ]
                )
                
                login_success = await self.perform_manual_login(manual_browser)
                await manual_browser.close()
                
                if not login_success:
                    self.logger.warning("Manual login failed. Continuing without authentication...")
            
            # Now launch the main browser for scraping (can be headless)
            browser = await p.chromium.launch(
                headless=self.headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox"
                ]
            )
            
            # Automated login (if not manual mode)
            if self.login_url and not self.manual_login_mode:
                login_success = await self.perform_login(browser)
                if not login_success:
                    self.logger.warning("Login failed. Continuing without authentication...")
            
            self.logger.info(f"Starting Authenticated Async Crawl on: {self.start_url}")
            self.logger.info(f"Configuration: Pages={self.max_pages}, Depth={self.max_depth}, "
                             f"Workers={self.concurrent_limit}, Auth={bool(self.storage_state)}")
            
            workers = [
                self.worker(browser, i+1) 
                for i in range(self.concurrent_limit)
            ]
            
            await asyncio.gather(*workers)
            
            await browser.close()
            
            self.logger.info("Crawl Complete!")
            self.logger.info(f"Total Pages Scraped: {self.pages_scraped}")
            self.logger.info(f"Database Location: {self.db_path}")
            self.logger.info(f"Failed Proxies: {len(self.failed_proxies)}")
            if self.storage_state:
                self.logger.info(f"Auth State Saved: {self.auth_state_file}")
            
            if self.download_file_assets and self.downloads_stats['total_attempted'] > 0:
                total_mb = self.downloads_stats['total_bytes'] / (1024 * 1024)
                stats_msg = (
                    f"Download Stats - Attempted: {self.downloads_stats['total_attempted']}, "
                    f"Success: {self.downloads_stats['successful']}, "
                    f"Failed: {self.downloads_stats['failed']}, "
                    f"Total: {total_mb:.2f} MB"
                )
                self.logger.info(stats_msg)