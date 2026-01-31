import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'
import { 
  Package, 
  Plus, 
  ArrowClockwise,
  MagnifyingGlass,
  Upload,
  FolderPlus,
  Play
} from '@phosphor-icons/react'
import '../styles/EmptyStatesDemo.css'

function EmptyStatesDemo({ darkMode, toggleDarkMode }) {
  const breadcrumbItems = [
    { label: 'Empty States', icon: Package }
  ]

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="empty-states" />
      
      <main id="main-content" role="main" className="empty-states-demo-page">
        <div className="empty-states-header">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Empty States</h1>
          <p className="empty-states-subtitle">
            Helpful illustrations and CTAs for when there's no data
          </p>
        </div>

        {/* No Data */}
        <section className="demo-section">
          <h2>No Data</h2>
          <div className="demo-container">
            <EmptyState
              type="no-data"
              primaryAction={{
                label: 'Add Data',
                icon: <Plus size={18} />,
                onClick: () => alert('Add data clicked')
              }}
            />
          </div>
        </section>

        {/* No Results */}
        <section className="demo-section">
          <h2>No Search Results</h2>
          <div className="demo-container">
            <EmptyState
              type="no-results"
              primaryAction={{
                label: 'Clear Filters',
                icon: <ArrowClockwise size={18} />,
                onClick: () => alert('Clear filters clicked')
              }}
              secondaryAction={{
                label: 'New Search',
                icon: <MagnifyingGlass size={18} />,
                onClick: () => alert('New search clicked')
              }}
            />
          </div>
        </section>

        {/* No History */}
        <section className="demo-section">
          <h2>No History</h2>
          <div className="demo-container">
            <EmptyState
              type="no-history"
              primaryAction={{
                label: 'Start Scraping',
                icon: <Play size={18} />,
                onClick: () => alert('Start scraping clicked')
              }}
            />
          </div>
        </section>

        {/* Empty Folder */}
        <section className="demo-section">
          <h2>Empty Folder</h2>
          <div className="demo-container">
            <EmptyState
              type="empty-folder"
              primaryAction={{
                label: 'Upload Files',
                icon: <Upload size={18} />,
                onClick: () => alert('Upload clicked')
              }}
              secondaryAction={{
                label: 'Create Folder',
                icon: <FolderPlus size={18} />,
                onClick: () => alert('Create folder clicked')
              }}
            />
          </div>
        </section>

        {/* No Files */}
        <section className="demo-section">
          <h2>No Files</h2>
          <div className="demo-container">
            <EmptyState
              type="no-files"
              size="small"
              primaryAction={{
                label: 'Upload',
                icon: <Upload size={18} />,
                onClick: () => alert('Upload clicked')
              }}
            />
          </div>
        </section>

        {/* No Connection */}
        <section className="demo-section">
          <h2>No Connection</h2>
          <div className="demo-container">
            <EmptyState
              type="no-connection"
              primaryAction={{
                label: 'Retry',
                icon: <ArrowClockwise size={18} />,
                onClick: () => alert('Retry clicked')
              }}
            />
          </div>
        </section>

        {/* Error State */}
        <section className="demo-section">
          <h2>Error State</h2>
          <div className="demo-container">
            <EmptyState
              type="error"
              primaryAction={{
                label: 'Try Again',
                icon: <ArrowClockwise size={18} />,
                onClick: () => alert('Try again clicked')
              }}
            />
          </div>
        </section>

        {/* No Scraped Data */}
        <section className="demo-section">
          <h2>No Scraped Data</h2>
          <div className="demo-container">
            <EmptyState
              type="no-scraped-data"
              primaryAction={{
                label: 'Start Scraping',
                icon: <Play size={18} />,
                href: '/'
              }}
            />
          </div>
        </section>

        {/* No Selectors */}
        <section className="demo-section">
          <h2>No Selectors</h2>
          <div className="demo-container">
            <EmptyState
              type="no-selectors"
              primaryAction={{
                label: 'Analyze Page',
                icon: <MagnifyingGlass size={18} />,
                onClick: () => alert('Analyze clicked')
              }}
            />
          </div>
        </section>

        {/* Empty Library */}
        <section className="demo-section">
          <h2>Empty Library</h2>
          <div className="demo-container">
            <EmptyState
              type="empty-library"
              size="small"
              primaryAction={{
                label: 'Browse Selectors',
                icon: <MagnifyingGlass size={18} />,
                onClick: () => alert('Browse clicked')
              }}
            />
          </div>
        </section>

        {/* Custom Empty State */}
        <section className="demo-section">
          <h2>Custom Empty State</h2>
          <div className="demo-container">
            <EmptyState
              title="Custom Title"
              description="This is a custom empty state with your own title and description."
              size="large"
              primaryAction={{
                label: 'Primary Action',
                icon: <Plus size={18} />,
                onClick: () => alert('Primary clicked')
              }}
              secondaryAction={{
                label: 'Secondary Action',
                onClick: () => alert('Secondary clicked')
              }}
            />
          </div>
        </section>

        {/* Size Variations */}
        <section className="demo-section">
          <h2>Size Variations</h2>
          <div className="size-grid">
            <div className="size-demo">
              <h3>Small</h3>
              <div className="demo-container">
                <EmptyState
                  type="no-data"
                  size="small"
                />
              </div>
            </div>
            <div className="size-demo">
              <h3>Medium (Default)</h3>
              <div className="demo-container">
                <EmptyState
                  type="no-data"
                  size="medium"
                />
              </div>
            </div>
            <div className="size-demo">
              <h3>Large</h3>
              <div className="demo-container">
                <EmptyState
                  type="no-data"
                  size="large"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default EmptyStatesDemo
