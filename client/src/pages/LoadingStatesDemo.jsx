import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import LoadingState from '../components/LoadingState'
import Button from '../components/Button'
import { Loader2, Play, X } from 'lucide-react'
import '../styles/DesignSystemDemo.css'

function LoadingStatesDemo({ darkMode, toggleDarkMode }) {
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [activeDemo, setActiveDemo] = useState(null)

  const loadingTypes = [
    // Database operations
    { type: 'fetching-stats', label: 'Fetching Stats', category: 'Database' },
    { type: 'fetching-pages', label: 'Fetching Pages', category: 'Database' },
    { type: 'fetching-files', label: 'Fetching Files', category: 'Database' },
    { type: 'fetching-analytics', label: 'Fetching Analytics', category: 'Database' },
    { type: 'fetching-timeline', label: 'Fetching Timeline', category: 'Database' },
    { type: 'exporting-data', label: 'Exporting Data', category: 'Database' },
    
    // History operations
    { type: 'fetching-sessions', label: 'Fetching Sessions', category: 'History' },
    { type: 'fetching-session-details', label: 'Fetching Session Details', category: 'History' },
    { type: 'deleting-session', label: 'Deleting Session', category: 'History' },
    { type: 'comparing-sessions', label: 'Comparing Sessions', category: 'History' },
    
    // Config operations
    { type: 'loading-config', label: 'Loading Config', category: 'Config' },
    { type: 'saving-config', label: 'Saving Config', category: 'Config' },
    { type: 'applying-preset', label: 'Applying Preset', category: 'Config' },
    { type: 'importing-config', label: 'Importing Config', category: 'Config' },
    
    // Scraping operations
    { type: 'starting-scrape', label: 'Starting Scrape', category: 'Scraping' },
    { type: 'scraping-page', label: 'Scraping Page', category: 'Scraping' },
    { type: 'analyzing-page', label: 'Analyzing Page', category: 'Scraping' },
    { type: 'downloading-files', label: 'Downloading Files', category: 'Scraping' },
    
    // Selector Finder operations
    { type: 'analyzing-login', label: 'Analyzing Login', category: 'Selector Finder' },
    { type: 'finding-selectors', label: 'Finding Selectors', category: 'Selector Finder' },
    { type: 'testing-selector', label: 'Testing Selector', category: 'Selector Finder' },
    { type: 'generating-selectors', label: 'Generating Selectors', category: 'Selector Finder' },
    
    // Proxy operations
    { type: 'loading-proxies', label: 'Loading Proxies', category: 'Proxy' },
    { type: 'testing-proxies', label: 'Testing Proxies', category: 'Proxy' },
    { type: 'importing-proxies', label: 'Importing Proxies', category: 'Proxy' },
    
    // Authentication operations
    { type: 'logging-in', label: 'Logging In', category: 'Authentication' },
    { type: 'testing-login', label: 'Testing Login', category: 'Authentication' },
    { type: 'verifying-session', label: 'Verifying Session', category: 'Authentication' },
    
    // Search operations
    { type: 'searching-content', label: 'Searching Content', category: 'Search' },
    { type: 'searching-files', label: 'Searching Files', category: 'Search' },
    { type: 'filtering-results', label: 'Filtering Results', category: 'Search' },
  ]

  const categories = [...new Set(loadingTypes.map(t => t.category))]

  const simulateLoading = (type) => {
    setActiveDemo(type)
    setTimeout(() => {
      setActiveDemo(null)
    }, 3000)
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="design-system-page">
        <main className="design-system-main">
          <Breadcrumb 
            items={[
              { label: 'Design System', path: '/design-system' },
              { label: 'Loading States' }
            ]}
          />

          <div className="design-system-header">
            <h1><Loader2 size={32} /> Contextual Loading States</h1>
            <p className="design-system-description">
              Loading indicators with specific messages for different operations
            </p>
          </div>

          {/* Size Variants */}
          <section className="demo-section">
            <h2>Size Variants</h2>
            <p className="section-description">Three size options for different contexts</p>
            
            <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="demo-card">
                <h3>Small</h3>
                <p>For inline loading (buttons, small sections)</p>
                <LoadingState type="processing" size="small" />
              </div>
              
              <div className="demo-card">
                <h3>Medium (Default)</h3>
                <p>For standard content areas</p>
                <LoadingState type="processing" size="medium" />
              </div>
              
              <div className="demo-card">
                <h3>Large</h3>
                <p>For full page or major sections</p>
                <LoadingState type="processing" size="large" />
              </div>
            </div>
          </section>

          {/* Full Screen Overlay */}
          <section className="demo-section">
            <h2>Full Screen Overlay</h2>
            <p className="section-description">Modal loading overlay for critical operations</p>
            
            <Button 
              variant="primary" 
              icon={Play}
              onClick={() => {
                setShowFullScreen(true)
                setTimeout(() => setShowFullScreen(false), 3000)
              }}
            >
              Show Full Screen Loading
            </Button>
          </section>

          {/* Contextual Loading Types */}
          {categories.map(category => (
            <section key={category} className="demo-section">
              <h2>{category} Operations</h2>
              <p className="section-description">
                Contextual loading messages for {category.toLowerCase()} operations
              </p>
              
              <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {loadingTypes
                  .filter(t => t.category === category)
                  .map(({ type, label }) => (
                    <div key={type} className="demo-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px' }}>{label}</h3>
                        <Button
                          variant="ghost"
                          size="small"
                          icon={Play}
                          onClick={() => simulateLoading(type)}
                          disabled={activeDemo === type}
                        >
                          Demo
                        </Button>
                      </div>
                      {activeDemo === type ? (
                        <LoadingState type={type} size="medium" />
                      ) : (
                        <div style={{ 
                          padding: '24px', 
                          textAlign: 'center', 
                          color: 'var(--text-secondary)',
                          fontSize: '13px'
                        }}>
                          Click Demo to see loading state
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          ))}

          {/* Inline Loading */}
          <section className="demo-section">
            <h2>Inline Loading (Buttons)</h2>
            <p className="section-description">
              Small loading indicators for buttons and inline elements
            </p>
            
            <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              <Button variant="primary" disabled>
                <LoadingState type="saving" size="small" className="loading-inline" />
              </Button>
              
              <Button variant="secondary" disabled>
                <LoadingState type="processing" size="small" className="loading-inline" />
              </Button>
              
              <Button variant="success" disabled>
                <LoadingState type="uploading" size="small" className="loading-inline" />
              </Button>
              
              <Button variant="danger" disabled>
                <LoadingState type="deleting" size="small" className="loading-inline" />
              </Button>
            </div>
          </section>

          {/* Custom Messages */}
          <section className="demo-section">
            <h2>Custom Messages</h2>
            <p className="section-description">
              Override default messages with custom text
            </p>
            
            <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="demo-card">
                <LoadingState 
                  message="Connecting to database..." 
                  size="medium" 
                />
              </div>
              
              <div className="demo-card">
                <LoadingState 
                  message="Processing your request, please wait..." 
                  size="medium" 
                />
              </div>
            </div>
          </section>

          {/* Usage Guidelines */}
          <section className="demo-section">
            <h2>Usage Guidelines</h2>
            <div className="guidelines-grid">
              <div className="guideline-card">
                <h3>✅ Do</h3>
                <ul>
                  <li>Use contextual messages that describe the operation</li>
                  <li>Choose appropriate size for the context</li>
                  <li>Use full-screen overlay for critical operations</li>
                  <li>Keep messages concise and clear</li>
                  <li>Use inline loading for button actions</li>
                </ul>
              </div>
              
              <div className="guideline-card">
                <h3>❌ Don't</h3>
                <ul>
                  <li>Use generic "Loading..." for all operations</li>
                  <li>Show multiple loading states simultaneously</li>
                  <li>Use large loading for small UI elements</li>
                  <li>Write overly technical messages</li>
                  <li>Forget to handle loading state cleanup</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <section className="demo-section">
            <h2>Code Examples</h2>
            
            <div className="code-example">
              <h3>Basic Usage</h3>
              <pre><code>{`import LoadingState from '../components/LoadingState'

// Simple loading state
<LoadingState type="fetching-pages" size="large" />

// With custom message
<LoadingState message="Custom loading message..." size="medium" />

// Full screen overlay
<LoadingState type="saving-config" fullScreen />

// Inline (for buttons)
<button disabled>
  {loading ? (
    <LoadingState type="saving" size="small" className="loading-inline" />
  ) : (
    'Save Changes'
  )}
</button>`}</code></pre>
            </div>

            <div className="code-example">
              <h3>Available Types</h3>
              <pre><code>{`// Database: fetching-stats, fetching-pages, fetching-files, etc.
// History: fetching-sessions, deleting-session, comparing-sessions
// Config: loading-config, saving-config, applying-preset
// Scraping: starting-scrape, scraping-page, analyzing-page
// Selector: analyzing-login, testing-selector, generating-selectors
// Proxy: loading-proxies, testing-proxies, importing-proxies
// Auth: logging-in, testing-login, verifying-session
// Search: searching-content, searching-files, filtering-results
// Generic: default, processing, saving, deleting, uploading, downloading`}</code></pre>
            </div>
          </section>
        </main>
      </div>

      {/* Full Screen Demo */}
      {showFullScreen && (
        <LoadingState 
          type="processing" 
          message="Processing your request, please wait..."
          fullScreen 
        />
      )}

      <Footer />
    </>
  )
}

export default LoadingStatesDemo
