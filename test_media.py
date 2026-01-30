import sqlite3
import json

# Connect to database
conn = sqlite3.connect('server/scraped_data/scraped_data.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get page details
cursor.execute('SELECT * FROM pages WHERE id = 1')
page = dict(cursor.fetchone())

# Get media for this page
cursor.execute('SELECT * FROM media WHERE page_id = 1')
media = [dict(row) for row in cursor.fetchall()]

print(f"Page: {page['title']}")
print(f"URL: {page['url']}")
print(f"Total Images: {len(media)}")
print(f"\nSample Image URLs:")
for img in media:
    print(f"  - {img['src']}")
    print(f"    Alt: {img['alt']}")

conn.close()
