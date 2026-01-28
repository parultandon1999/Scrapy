import '../styles/Docs.css'

function Docs() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Documentation</h1>
        <p className="page-description">Learn how to use Scrapy effectively</p>
      </div>

      <div className="docs-content">
        <section className="docs-section">
          <h2>Getting Started</h2>
          <p>Follow these steps to start scraping:</p>
          <ol>
            <li>Enter a URL in the home page input field</li>
            <li>Click "Start Scraping" to begin</li>
            <li>Monitor progress in real-time</li>
            <li>View results in the Database page</li>
          </ol>
        </section>

        <section className="docs-section">
          <h2>Configuration</h2>
          <p>
            The scraper uses default settings from the config file. You can modify these 
            settings in the Configuration page:
          </p>
          <ul>
            <li><strong>max_pages:</strong> Maximum number of pages to scrape</li>
            <li><strong>max_depth:</strong> Maximum crawl depth from start URL</li>
            <li><strong>concurrent_limit:</strong> Number of concurrent workers</li>
            <li><strong>headless:</strong> Run browser in headless mode</li>
            <li><strong>download_file_assets:</strong> Enable file downloads</li>
          </ul>
        </section>

        <section className="docs-section">
          <h2>Using Proxies</h2>
          <p>To use proxies:</p>
          <ol>
            <li>Add proxies to <code>server/proxies.txt</code></li>
            <li>Enable proxies in Configuration page</li>
            <li>Test proxies using the proxy tester utility</li>
          </ol>
          <div className="code-block">
            <pre>{`# Proxy format in proxies.txt
http://proxy1.example.com:8080
http://user:pass@proxy2.example.com:8080
socks5://proxy3.example.com:1080`}</pre>
          </div>
        </section>

        <section className="docs-section">
          <h2>Authentication</h2>
          <p>To scrape authenticated pages:</p>
          <ol>
            <li>Use the Selector Finder to analyze the login page</li>
            <li>Copy the suggested configuration</li>
            <li>Update <code>server/config.py</code> with your credentials</li>
            <li>Enable authentication in Configuration page</li>
          </ol>
        </section>

        <section className="docs-section">
          <h2>Database Query</h2>
          <p>The Database page allows you to:</p>
          <ul>
            <li>View scraping statistics</li>
            <li>Browse scraped pages</li>
            <li>View downloaded files</li>
            <li>Search content and files</li>
          </ul>
        </section>

        <section className="docs-section">
          <h2>Selector Finder</h2>
          <p>
            The Selector Finder helps you find CSS selectors for login forms:
          </p>
          <ol>
            <li>Enter the login page URL</li>
            <li>Click "Analyze Page"</li>
            <li>Review suggested selectors</li>
            <li>Copy configuration to config.py</li>
          </ol>
        </section>

        <section className="docs-section">
          <h2>API Endpoints</h2>
          <p>For programmatic access, use these endpoints:</p>
          <div className="api-list">
            <div className="api-item">
              <code>POST /api/scraper/start</code>
              <p>Start scraping</p>
            </div>
            <div className="api-item">
              <code>GET /api/scraper/status</code>
              <p>Get current status</p>
            </div>
            <div className="api-item">
              <code>POST /api/scraper/stop</code>
              <p>Stop scraping</p>
            </div>
            <div className="api-item">
              <code>GET /api/data/stats</code>
              <p>Get statistics</p>
            </div>
            <div className="api-item">
              <code>GET /api/data/pages</code>
              <p>Get scraped pages</p>
            </div>
          </div>
          <p>
            For complete API documentation, visit: 
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
              http://localhost:8000/docs
            </a>
          </p>
        </section>

        <section className="docs-section">
          <h2>Troubleshooting</h2>
          <div className="troubleshooting">
            <div className="trouble-item">
              <h4>Scraper fails immediately</h4>
              <ul>
                <li>Check if URL is valid and accessible</li>
                <li>Disable proxies if having connection issues</li>
                <li>Verify browser can access the site</li>
              </ul>
            </div>
            <div className="trouble-item">
              <h4>No data in database</h4>
              <ul>
                <li>Ensure scraper completed successfully</li>
                <li>Check database file exists in scraped_data folder</li>
                <li>Verify max_pages is not set to 0</li>
              </ul>
            </div>
            <div className="trouble-item">
              <h4>Authentication not working</h4>
              <ul>
                <li>Use Selector Finder to verify selectors</li>
                <li>Check credentials are correct</li>
                <li>Ensure success_indicator is accurate</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Docs
