import '../styles/About.css'

function About() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>About Scrapy</h1>
        <p className="page-description">Advanced Web Scraping Application</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Overview</h2>
          <p>
            Scrapy is a full-stack web scraping application built with Python and React. 
            It provides powerful features for extracting data from websites with advanced 
            capabilities like proxy rotation, browser fingerprinting, and authentication handling.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🚀 Concurrent Crawling</h3>
              <p>Multiple workers scraping pages in parallel for maximum efficiency</p>
            </div>
            <div className="feature-card">
              <h3>🔄 Proxy Rotation</h3>
              <p>Round-robin proxy support with automatic failure detection</p>
            </div>
            <div className="feature-card">
              <h3>🎭 Browser Fingerprinting</h3>
              <p>Randomized user agents, viewports, and geolocations to avoid detection</p>
            </div>
            <div className="feature-card">
              <h3>🔐 Authentication</h3>
              <p>Login form handling with session persistence</p>
            </div>
            <div className="feature-card">
              <h3>📥 File Downloads</h3>
              <p>Automatic detection and download of PDFs, documents, and archives</p>
            </div>
            <div className="feature-card">
              <h3>📊 Data Extraction</h3>
              <p>Extract headers, links, media, structured data, and full text</p>
            </div>
            <div className="feature-card">
              <h3>💾 SQLite Database</h3>
              <p>Store and query all scraped data efficiently</p>
            </div>
            <div className="feature-card">
              <h3>📡 Real-time Updates</h3>
              <p>WebSocket support for live scraping progress</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-category">
              <h3>Backend</h3>
              <ul>
                <li>FastAPI - Modern Python web framework</li>
                <li>Playwright - Browser automation</li>
                <li>aiohttp - Async HTTP client</li>
                <li>SQLite3 - Database</li>
                <li>Uvicorn - ASGI server</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Frontend</h3>
              <ul>
                <li>React 19 - UI library</li>
                <li>Vite - Build tool</li>
                <li>Axios - HTTP client</li>
                <li>React Router - Navigation</li>
                <li>Phosphor Icons - Icon library</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Version</h2>
          <p className="version">v1.0.0</p>
        </section>

        <section className="about-section">
          <h2>License</h2>
          <p>MIT License - Free to use for any purpose</p>
        </section>
      </div>
    </div>
  )
}

export default About
