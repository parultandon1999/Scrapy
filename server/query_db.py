import sqlite3
import json
from tabulate import tabulate
import os
import config

class CrawlDataAnalyzer:
    
    def __init__(self, db_path=None):
        self.db_path = db_path if db_path is not None else config.get_db_path()
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
    
    def close(self):
        self.conn.close()
    
    def get_stats(self):
        cursor = self.conn.cursor()
        
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
        
        print("\n" + "="*50)
        print("CRAWL STATISTICS")
        print("="*50)
        for key, value in stats.items():
            display_value = f"{value:.2f}" if isinstance(value, float) else value
            print(f"{key.replace('_', ' ').title()}: {display_value}")
        print("="*50 + "\n")
        
        return stats
    
    def list_pages(self, limit=None):
        limit = limit if limit is not None else config.QUERY['default_page_limit']
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT url, title, depth, datetime(timestamp, 'unixepoch') as scraped_at
            FROM pages
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        data = [[row['url'], row['title'][:50], row['depth'], row['scraped_at']] 
                for row in rows]
        
        print("\nSCRAPED PAGES:")
        print(tabulate(data, headers=['URL', 'Title', 'Depth', 'Scraped At'], tablefmt='grid'))
    
    def list_file_assets(self, limit=None, status=None):
        limit = limit if limit is not None else config.QUERY['default_file_limit']
        cursor = self.conn.cursor()
        
        try:
            if status:
                cursor.execute('''
                    SELECT fa.file_name, fa.file_extension, fa.file_size_bytes, 
                           fa.download_status, fa.local_path, p.url as page_url,
                           datetime(fa.download_timestamp, 'unixepoch') as downloaded_at
                    FROM file_assets fa
                    JOIN pages p ON fa.page_id = p.id
                    WHERE fa.download_status = ?
                    ORDER BY fa.download_timestamp DESC
                    LIMIT ?
                ''', (status, limit))
            else:
                cursor.execute('''
                    SELECT fa.file_name, fa.file_extension, fa.file_size_bytes, 
                           fa.download_status, fa.local_path, p.url as page_url,
                           datetime(fa.download_timestamp, 'unixepoch') as downloaded_at
                    FROM file_assets fa
                    JOIN pages p ON fa.page_id = p.id
                    ORDER BY fa.download_timestamp DESC
                    LIMIT ?
                ''', (limit,))
            
            rows = cursor.fetchall()
            
            if not rows:
                print("\nNo file assets found.")
                return
            
            data = []
            for row in rows:
                size_mb = row['file_size_bytes'] / (1024 * 1024) if row['file_size_bytes'] else 0
                data.append([
                    row['file_name'][:40],
                    row['file_extension'],
                    f"{size_mb:.2f} MB",
                    row['download_status'],
                    row['downloaded_at']
                ])
            
            status_text = f" ({status.upper()})" if status else ""
            print(f"\nFILE ASSETS{status_text}:")
            print(tabulate(data, headers=['Filename', 'Type', 'Size', 'Status', 'Downloaded At'], tablefmt='grid'))
            
        except sqlite3.OperationalError:
            print("\nFile assets table not found. This database was created with an older version.")
    
    def get_file_assets_by_extension(self):
        cursor = self.conn.cursor()
        
        try:
            cursor.execute('''
                SELECT file_extension, 
                       COUNT(*) as count,
                       SUM(file_size_bytes) as total_size,
                       download_status
                FROM file_assets
                GROUP BY file_extension, download_status
                ORDER BY count DESC
            ''')
            
            rows = cursor.fetchall()
            
            if not rows:
                print("\nNo file assets found.")
                return
            
            data = []
            for row in rows:
                total_mb = row['total_size'] / (1024 * 1024) if row['total_size'] else 0
                data.append([
                    row['file_extension'],
                    row['count'],
                    f"{total_mb:.2f} MB",
                    row['download_status']
                ])
            
            print("\nFILE ASSETS BY EXTENSION:")
            print(tabulate(data, headers=['Extension', 'Count', 'Total Size', 'Status'], tablefmt='grid'))
            
        except sqlite3.OperationalError:
            print("\nFile assets table not found.")
    
    def get_largest_downloads(self, limit=None):
        limit = limit if limit is not None else config.QUERY['default_largest_downloads']
        cursor = self.conn.cursor()
        
        try:
            cursor.execute('''
                SELECT fa.file_name, fa.file_extension, fa.file_size_bytes,
                       fa.local_path, p.url as page_url
                FROM file_assets fa
                JOIN pages p ON fa.page_id = p.id
                WHERE fa.download_status = 'success'
                ORDER BY fa.file_size_bytes DESC
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            
            if not rows:
                print("\nNo successful downloads found.")
                return
            
            data = []
            for row in rows:
                size_mb = row['file_size_bytes'] / (1024 * 1024)
                data.append([
                    row['file_name'][:40],
                    row['file_extension'],
                    f"{size_mb:.2f} MB",
                    row['page_url'][:50]
                ])
            
            print(f"\nLARGEST DOWNLOADS (Top {limit}):")
            print(tabulate(data, headers=['Filename', 'Type', 'Size', 'Source Page'], tablefmt='grid'))
            
        except sqlite3.OperationalError:
            print("\nFile assets table not found.")
    
    def search_file_assets(self, keyword):
        cursor = self.conn.cursor()
        
        try:
            cursor.execute('''
                SELECT fa.file_name, fa.file_extension, fa.file_size_bytes,
                       fa.download_status, fa.local_path, p.url as page_url
                FROM file_assets fa
                JOIN pages p ON fa.page_id = p.id
                WHERE fa.file_name LIKE ?
                ORDER BY fa.download_timestamp DESC
            ''', (f'%{keyword}%',))
            
            rows = cursor.fetchall()
            
            if not rows:
                print(f"\nNo files found matching '{keyword}'")
                return
            
            print(f"\nFILE SEARCH RESULTS FOR '{keyword}' ({len(rows)} matches):")
            
            for row in rows:
                size_mb = row['file_size_bytes'] / (1024 * 1024) if row['file_size_bytes'] else 0
                print(f"\n- {row['file_name']}")
                print(f"  Type: {row['file_extension']}")
                print(f"  Size: {size_mb:.2f} MB")
                print(f"  Status: {row['download_status']}")
                print(f"  Source: {row['page_url']}")
                if row['local_path']:
                    print(f"  Path: {row['local_path']}")
                    
        except sqlite3.OperationalError:
            print("\nFile assets table not found.")
    
    def search_content(self, keyword):
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT url, title, 
                    substr(full_text, 1, 200) as preview
            FROM pages
            WHERE full_text LIKE ?
            ORDER BY timestamp DESC
        ''', (f'%{keyword}%',))
        
        rows = cursor.fetchall()
        print(f"\nSEARCH RESULTS FOR '{keyword}' ({len(rows)} matches):")
        
        for row in rows:
            print(f"\n- {row['title']}")
            print(f"  URL: {row['url']}")
            print(f"  Preview: {row['preview']}...")
    
    def get_page_details(self, page_id):
        cursor = self.conn.cursor()
        
        cursor.execute('SELECT * FROM pages WHERE id = ?', (page_id,))
        page = cursor.fetchone()
        
        if not page:
            print(f"Page ID {page_id} not found.")
            return
        
        print(f"\n{'='*70}")
        print(f"PAGE DETAILS - ID: {page_id}")
        print(f"{'='*70}")
        print(f"URL: {page['url']}")
        print(f"Title: {page['title']}")
        print(f"Description: {page['description']}")
        print(f"Depth: {page['depth']}")
        print(f"Folder: {page['folder_path']}")
        
        cursor.execute('SELECT * FROM headers WHERE page_id = ?', (page_id,))
        headers = cursor.fetchall()
        if headers:
            print(f"\nHeaders ({len(headers)}):")
            for h in headers[:10]:
                print(f"  {h['header_type']}: {h['header_text']}")
        
        cursor.execute('SELECT link_type, COUNT(*) as count FROM links WHERE page_id = ? GROUP BY link_type', (page_id,))
        link_counts = cursor.fetchall()
        print(f"\nLinks:")
        for lc in link_counts:
            print(f"  {lc['link_type']}: {lc['count']}")
        
        cursor.execute('SELECT COUNT(*) as count FROM media WHERE page_id = ?', (page_id,))
        media_count = cursor.fetchone()['count']
        print(f"\nMedia: {media_count} images")
        
        try:
            cursor.execute('''
                SELECT file_name, file_extension, file_size_bytes, download_status
                FROM file_assets 
                WHERE page_id = ?
            ''', (page_id,))
            file_assets = cursor.fetchall()
            
            if file_assets:
                print(f"\nFile Assets ({len(file_assets)}):")
                for fa in file_assets:
                    size_mb = fa['file_size_bytes'] / (1024 * 1024) if fa['file_size_bytes'] else 0
                    status_text = "[Success]" if fa['download_status'] == 'success' else "[Failed]"
                    print(f"  {status_text} {fa['file_name']} ({fa['file_extension']}, {size_mb:.2f} MB)")
        except sqlite3.OperationalError:
            pass
        
        print(f"\nContent Preview (first 500 chars):")
        print(page['full_text'][:500])
        print("...")
    
    def get_links_by_type(self, link_type='internal', limit=20):
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT l.url, COUNT(*) as frequency
            FROM links l
            WHERE l.link_type = ?
            GROUP BY l.url
            ORDER BY frequency DESC
            LIMIT ?
        ''', (link_type, limit))
        
        rows = cursor.fetchall()
        data = [[row['url'], row['frequency']] for row in rows]
        
        print(f"\nTOP {link_type.upper()} LINKS:")
        print(tabulate(data, headers=['URL', 'Frequency'], tablefmt='grid'))
    
    def export_to_json(self, output_file=None):
        output_file = output_file if output_file is not None else config.OUTPUT['export_filename']
        cursor = self.conn.cursor()
        
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
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(pages, f, indent=2, ensure_ascii=False)
        
        print(f"\nExported {len(pages)} pages to {output_file}")


def main():
    import sys
    
    db_path = config.get_db_path()
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        return
    
    analyzer = CrawlDataAnalyzer(db_path)
    
    while True:
        print("\n" + "="*70)
        print("CRAWL DATA ANALYZER")
        print("="*70)
        print("\nOptions:")
        print("  1. Show Statistics")
        print("  2. List Pages")
        print("  3. List File Assets")
        print("  4. File Assets by Extension")
        print("  5. Largest Downloads")
        print("  6. Search File Assets")
        print("  7. Search Page Content")
        print("  8. Get Page Details (by ID)")
        print("  9. Get Top Links")
        print("  10. Export to JSON")
        print("  0. Exit")
        
        choice = input("\nEnter choice: ").strip()
        
        if choice == "1":
            analyzer.get_stats()
        
        elif choice == "2":
            limit = input("How many pages? (default 20): ").strip()
            limit = int(limit) if limit else 20
            analyzer.list_pages(limit)
        
        elif choice == "3":
            print("\nFilter by status:")
            print("  1. All")
            print("  2. Successful only")
            print("  3. Failed only")
            status_choice = input("Enter choice (default 1): ").strip()
            
            status = None
            if status_choice == "2":
                status = "success"
            elif status_choice == "3":
                status = "failed"
            
            limit = input("How many files? (default 50): ").strip()
            limit = int(limit) if limit else 50
            
            analyzer.list_file_assets(limit, status)
        
        elif choice == "4":
            analyzer.get_file_assets_by_extension()
        
        elif choice == "5":
            limit = input("How many files? (default 10): ").strip()
            limit = int(limit) if limit else 10
            analyzer.get_largest_downloads(limit)
        
        elif choice == "6":
            keyword = input("Enter search keyword: ").strip()
            if keyword:
                analyzer.search_file_assets(keyword)
        
        elif choice == "7":
            keyword = input("Enter search keyword: ").strip()
            if keyword:
                analyzer.search_content(keyword)
        
        elif choice == "8":
            page_id = input("Enter page ID: ").strip()
            if page_id:
                analyzer.get_page_details(int(page_id))
        
        elif choice == "9":
            print("\nLink type:")
            print("  1. Internal")
            print("  2. External")
            link_choice = input("Enter choice (default 1): ").strip()
            
            link_type = "internal" if link_choice != "2" else "external"
            limit = input("How many links? (default 20): ").strip()
            limit = int(limit) if limit else 20
            
            analyzer.get_links_by_type(link_type, limit)
        
        elif choice == "10":
            output_file = input("Output filename (default: exported_data.json): ").strip()
            output_file = output_file if output_file else "exported_data.json"
            analyzer.export_to_json(output_file)
        
        elif choice == "0":
            print("\nExiting...")
            break
        
        else:
            print("Invalid choice!")
    
    analyzer.close()


if __name__ == "__main__":
    main()