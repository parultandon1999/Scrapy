import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { 
  Home, Settings, Database, FileText, Folder, 
  File, User, ShoppingCart, Package
} from 'lucide-react'
import '../styles/Database.css'

function BreadcrumbDemo({ darkMode, toggleDarkMode }) {
  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
      <div className="database-page">
        <aside className="db-sidebar">
          <h2>Breadcrumb Navigation</h2>
          <p style={{ fontSize: '13px', color: '#5f6368', padding: '0 16px' }}>
            Hierarchical navigation component for better user orientation
          </p>
        </aside>

        <main className="db-main">
          <div className="dashboard-view">
            <h1>Breadcrumb Component Demo</h1>

            {/* Basic Breadcrumb */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Basic Breadcrumb</h2>
              <Breadcrumb 
                items={[
                  { label: 'Dashboard', path: '/dashboard' },
                  { label: 'Settings', path: '/settings' },
                  { label: 'Profile' }
                ]}
              />
            </section>

            {/* With Icons */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>With Icons</h2>
              <Breadcrumb 
                items={[
                  { label: 'Database', icon: Database, path: '/database' },
                  { label: 'Pages', icon: FileText, path: '/database/pages' },
                  { label: 'Details', icon: File }
                ]}
              />
            </section>

            {/* Without Home */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Without Home Icon</h2>
              <Breadcrumb 
                showHome={false}
                items={[
                  { label: 'Products', icon: Package, path: '/products' },
                  { label: 'Electronics', path: '/products/electronics' },
                  { label: 'Laptops' }
                ]}
              />
            </section>

            {/* Compact Variant */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Compact Variant</h2>
              <Breadcrumb 
                compact
                items={[
                  { label: 'Admin', icon: User, path: '/admin' },
                  { label: 'Users', path: '/admin/users' },
                  { label: 'Edit User' }
                ]}
              />
            </section>

            {/* Long Path */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Long Path</h2>
              <Breadcrumb 
                items={[
                  { label: 'Projects', icon: Folder, path: '/projects' },
                  { label: 'Web Development', path: '/projects/web' },
                  { label: 'E-commerce', path: '/projects/web/ecommerce' },
                  { label: 'Shopping Cart', icon: ShoppingCart, path: '/projects/web/ecommerce/cart' },
                  { label: 'Checkout Process' }
                ]}
              />
            </section>

            {/* In Card */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>In Card Container</h2>
              <div className="breadcrumb-card">
                <Breadcrumb 
                  items={[
                    { label: 'Configuration', icon: Settings, path: '/config' },
                    { label: 'Advanced Settings' }
                  ]}
                />
              </div>
            </section>

            {/* Real-World Examples */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Real-World Examples</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#5f6368' }}>Database Navigation</h3>
                <Breadcrumb 
                  items={[
                    { label: 'Database', icon: Database, path: '/database' },
                    { label: 'Analytics' }
                  ]}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#5f6368' }}>History Session Details</h3>
                <Breadcrumb 
                  items={[
                    { label: 'History', path: '/history' },
                    { label: 'Sessions', path: '/history/sessions' },
                    { label: 'Session: example.com' }
                  ]}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#5f6368' }}>Configuration Section</h3>
                <Breadcrumb 
                  items={[
                    { label: 'Configuration', icon: Settings, path: '/config' },
                    { label: 'Scraper Settings' }
                  ]}
                />
              </div>
            </section>

            {/* Usage Example */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Usage Example</h2>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>
                <pre style={{ margin: 0 }}>{`import Breadcrumb from '../components/Breadcrumb'
import { Database, FileText } from 'lucide-react'

<Breadcrumb 
  items={[
    { 
      label: 'Database', 
      icon: Database, 
      path: '/database' 
    },
    { 
      label: 'Pages', 
      icon: FileText, 
      path: '/database/pages' 
    },
    { 
      label: 'Details' // Last item (active)
    }
  ]}
/>`}</pre>
              </div>
            </section>

            {/* Props Documentation */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Props</h2>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Prop</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Default</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>items</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>array</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>required</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Array of breadcrumb items</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>compact</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>boolean</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>false</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Use compact spacing</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>showHome</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>boolean</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>true</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Show home icon at start</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px' }}><code>className</code></td>
                      <td style={{ padding: '12px' }}>string</td>
                      <td style={{ padding: '12px' }}>''</td>
                      <td style={{ padding: '12px' }}>Additional CSS classes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Item Object Structure */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Item Object Structure</h2>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Property</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Required</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>label</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>string</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Yes</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Display text</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>path</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>string</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>No</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Link URL (omit for active item)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px' }}><code>icon</code></td>
                      <td style={{ padding: '12px' }}>Component</td>
                      <td style={{ padding: '12px' }}>No</td>
                      <td style={{ padding: '12px' }}>Lucide icon component</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Best Practices */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Best Practices</h2>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <ul style={{ lineHeight: '1.8', margin: 0 }}>
                  <li>Keep breadcrumb paths concise (3-5 levels max)</li>
                  <li>Last item should be the current page (no link)</li>
                  <li>Use icons sparingly for better clarity</li>
                  <li>Place breadcrumbs at the top of the main content</li>
                  <li>Make breadcrumb items clickable except the last one</li>
                  <li>Use consistent labeling across the application</li>
                  <li>Consider mobile responsiveness for long paths</li>
                </ul>
              </div>
            </section>

            {/* Features */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Features</h2>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <ul style={{ lineHeight: '1.8', margin: 0 }}>
                  <li>✅ Automatic home icon with link to root</li>
                  <li>✅ Optional icons for each breadcrumb item</li>
                  <li>✅ Chevron separators between items</li>
                  <li>✅ Active state for current page</li>
                  <li>✅ Hover effects on clickable items</li>
                  <li>✅ Dark mode support</li>
                  <li>✅ Responsive design</li>
                  <li>✅ Compact variant for tight spaces</li>
                  <li>✅ Accessible navigation with ARIA labels</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default BreadcrumbDemo
