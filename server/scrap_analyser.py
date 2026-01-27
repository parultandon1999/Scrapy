import sqlite3
import json
from collections import Counter
from datetime import datetime
import config

class CrawlAnalyzer:
    """Analyze crawler performance, proxy usage, and fingerprinting patterns."""
    
    def __init__(self, db_path=None):
        self.db_path = db_path if db_path is not None else config.get_db_path()
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
    
    def close(self):
        self.conn.close()
    
    def proxy_statistics(self):
        """Analyze proxy usage and success rates."""
        cursor = self.conn.cursor()
        
        print("\n" + "="*70)
        print("PROXY USAGE STATISTICS")
        print("="*70 + "\n")
        
        # Count pages per proxy
        cursor.execute("""
            SELECT proxy_used, COUNT(*) as page_count
            FROM pages
            GROUP BY proxy_used
            ORDER BY page_count DESC
        """)
        
        proxy_data = cursor.fetchall()
        
        print("Pages Scraped Per Proxy:")
        print("-" * 70)
        
        total_pages = sum(row['page_count'] for row in proxy_data)
        
        for row in proxy_data:
            proxy = row['proxy_used']
            count = row['page_count']
            percentage = (count / total_pages * 100) if total_pages > 0 else 0
            
            # Create bar chart
            bar_length = int(percentage / 2)  # Scale for display
            bar = "█" * bar_length
            
            print(f"  {proxy[:40]:<40} | {count:>4} pages | {percentage:>5.1f}% {bar}")
        
        print("-" * 70)
        print(f"Total: {total_pages} pages across {len(proxy_data)} proxies/connections\n")
    
    def fingerprint_analysis(self):
        """Analyze fingerprint diversity."""
        cursor = self.conn.cursor()
        
        print("\n" + "="*70)
        print("FINGERPRINT ANALYSIS")
        print("="*70 + "\n")
        
        cursor.execute("SELECT fingerprint FROM pages")
        rows = cursor.fetchall()
        
        if not rows:
            print("No fingerprint data found.")
            return
        
        # Parse all fingerprints
        fingerprints = [json.loads(row['fingerprint']) for row in rows]
        
        # Analyze each component
        timezones = [fp['timezone_id'] for fp in fingerprints]
        viewports = [f"{fp['viewport']['width']}x{fp['viewport']['height']}" for fp in fingerprints]
        user_agents = [fp['user_agent'].split('Chrome/')[1].split()[0] if 'Chrome/' in fp['user_agent'] else 'Unknown' for fp in fingerprints]
        locales = [fp['locale'] for fp in fingerprints]
        
        print("Timezone Distribution:")
        print("-" * 70)
        for tz, count in Counter(timezones).most_common():
            print(f"  {tz:<30} | {count:>3} pages")
        
        print("\nViewport Distribution:")
        print("-" * 70)
        for vp, count in Counter(viewports).most_common():
            print(f"  {vp:<30} | {count:>3} pages")
        
        print("\nChrome Version Distribution:")
        print("-" * 70)
        for ua, count in Counter(user_agents).most_common():
            print(f"  Chrome {ua:<20} | {count:>3} pages")
        
        print("\nLocale Distribution:")
        print("-" * 70)
        for locale, count in Counter(locales).most_common():
            print(f"  {locale:<30} | {count:>3} pages")
        
        # Uniqueness score
        unique_combinations = len(set(
            (fp['timezone_id'], 
             f"{fp['viewport']['width']}x{fp['viewport']['height']}", 
             fp['locale'])
            for fp in fingerprints
        ))
        
        print("\n" + "-" * 70)
        print(f"Fingerprint Diversity: {unique_combinations} unique combinations out of {len(fingerprints)} pages")
        print(f"Uniqueness Score: {(unique_combinations/len(fingerprints)*100):.1f}%")
        print()
    
    def geographical_distribution(self):
        """Show geographical distribution from fingerprints."""
        cursor = self.conn.cursor()
        
        print("\n" + "="*70)
        print("GEOGRAPHICAL DISTRIBUTION (from fingerprints)")
        print("="*70 + "\n")
        
        cursor.execute("SELECT fingerprint FROM pages")
        rows = cursor.fetchall()
        
        if not rows:
            print("No data found.")
            return
        
        # Parse geolocations
        fingerprints = [json.loads(row['fingerprint']) for row in rows]
        
        # Map coordinates to cities (approximate)
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
            
            # Find closest city
            for coords, city in city_map.items():
                if abs(coords[0] - lat) < 0.1 and abs(coords[1] - lon) < 0.1:
                    locations.append(city)
                    break
        
        print("Apparent Locations (from geolocation fingerprints):")
        print("-" * 70)
        
        for city, count in Counter(locations).most_common():
            percentage = (count / len(locations) * 100) if locations else 0
            bar_length = int(percentage / 2)
            bar = "█" * bar_length
            print(f"  {city:<20} | {count:>3} pages | {percentage:>5.1f}% {bar}")
        
        print()
    
    def crawl_timeline(self):
        """Show crawl timeline and speed."""
        cursor = self.conn.cursor()
        
        print("\n" + "="*70)
        print("CRAWL TIMELINE")
        print("="*70 + "\n")
        
        cursor.execute("""
            SELECT 
                MIN(timestamp) as start_time,
                MAX(timestamp) as end_time,
                COUNT(*) as total_pages
            FROM pages
        """)
        
        row = cursor.fetchone()
        
        if not row or not row['start_time']:
            print("No timing data found.")
            return
        
        start_time = row['start_time']
        end_time = row['end_time']
        total_pages = row['total_pages']
        duration = end_time - start_time
        
        print(f"Start Time: {datetime.fromtimestamp(start_time).strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"End Time:   {datetime.fromtimestamp(end_time).strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Duration:   {duration:.1f} seconds ({duration/60:.1f} minutes)")
        print(f"Total Pages: {total_pages}")
        
        if duration > 0:
            pages_per_second = total_pages / duration
            pages_per_minute = pages_per_second * 60
            print(f"\nSpeed:")
            print(f"  {pages_per_second:.2f} pages/second")
            print(f"  {pages_per_minute:.1f} pages/minute")
        
        # Show pages over time (bucketed)
        cursor.execute("""
            SELECT 
                CAST((timestamp - ?) / 60 AS INTEGER) as minute_bucket,
                COUNT(*) as page_count
            FROM pages
            GROUP BY minute_bucket
            ORDER BY minute_bucket
        """, (start_time,))
        
        buckets = cursor.fetchall()
        
        if len(buckets) > 1:
            print("\nPages Per Minute:")
            print("-" * 70)
            
            for bucket in buckets:
                minute = bucket['minute_bucket']
                count = bucket['page_count']
                bar_length = min(count, 50)
                bar = "█" * bar_length
                print(f"  Minute {minute:>2} | {count:>3} pages | {bar}")
        
        print()
    
    def depth_distribution(self):
        """Show how pages are distributed by depth."""
        cursor = self.conn.cursor()
        
        print("\n" + "="*70)
        print("DEPTH DISTRIBUTION")
        print("="*70 + "\n")
        
        cursor.execute("""
            SELECT depth, COUNT(*) as page_count
            FROM pages
            GROUP BY depth
            ORDER BY depth
        """)
        
        rows = cursor.fetchall()
        
        print("Pages by Depth:")
        print("-" * 70)
        
        total = sum(row['page_count'] for row in rows)
        
        for row in rows:
            depth = row['depth']
            count = row['page_count']
            percentage = (count / total * 100) if total > 0 else 0
            bar_length = int(percentage / 2)
            bar = "█" * bar_length
            
            print(f"  Depth {depth} | {count:>4} pages | {percentage:>5.1f}% {bar}")
        
        print("-" * 70)
        print(f"Total: {total} pages\n")
    
    def generate_full_report(self):
        """Generate a comprehensive report."""
        print("\n" + "+" + "="*68 + "+")
        print("|" + " "*18 + "CRAWLER PERFORMANCE REPORT" + " "*24 + "|")
        print("+" + "="*68 + "+")
        
        self.crawl_timeline()
        self.depth_distribution()
        self.proxy_statistics()
        self.fingerprint_analysis()
        self.geographical_distribution()
        
        print("\n" + "="*70)
        print("END OF REPORT")
        print("="*70 + "\n")


def main():
    """Main function."""
    import sys
    
    db_path = config.get_db_path()
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    
    try:
        analyzer = CrawlAnalyzer(db_path)
        
        print("\nCrawl Data Analyzer")
        print("Using database:", db_path)
        print("\nOptions:")
        print("  1. Full Report")
        print("  2. Proxy Statistics Only")
        print("  3. Fingerprint Analysis Only")
        print("  4. Geographical Distribution")
        print("  5. Crawl Timeline")
        print("  6. Depth Distribution")
        
        choice = input("\nEnter choice (1-6) or press Enter for full report: ").strip()
        
        if choice == "2":
            analyzer.proxy_statistics()
        elif choice == "3":
            analyzer.fingerprint_analysis()
        elif choice == "4":
            analyzer.geographical_distribution()
        elif choice == "5":
            analyzer.crawl_timeline()
        elif choice == "6":
            analyzer.depth_distribution()
        else:
            analyzer.generate_full_report()
        
        analyzer.close()
        
    except sqlite3.OperationalError as e:
        print(f"\nDatabase error: {e}")
        print("Make sure the database exists and has been populated.")
    except Exception as e:
        print(f"\nError: {e}")


if __name__ == "__main__":
    main()