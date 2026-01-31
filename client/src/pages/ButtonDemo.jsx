import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import {
  Play, Download, Trash2, Save, Settings, Plus,
  Check, X, AlertCircle, Search, Upload, Edit
} from 'lucide-react'
import '../styles/Database.css'

function ButtonDemo({ darkMode, toggleDarkMode }) {
  const [loading, setLoading] = useState(false)

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
      <div className="database-page">
        <aside className="db-sidebar">
          <h2>Button Component</h2>
          <p style={{ fontSize: '13px', color: '#5f6368', padding: '0 16px' }}>
            Standardized button styles with consistent variants
          </p>
        </aside>

        <main className="db-main">
          <div className="dashboard-view">
            <h1>Button Component Demo</h1>

            {/* Variants */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Variants</h2>
              <div className="btn-group">
                <Button variant="default">Default</Button>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="link">Link</Button>
              </div>
            </section>

            {/* Sizes */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Sizes</h2>
              <div className="btn-group">
                <Button variant="primary" size="small">Small</Button>
                <Button variant="primary" size="medium">Medium</Button>
                <Button variant="primary" size="large">Large</Button>
              </div>
            </section>

            {/* With Icons */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>With Icons</h2>
              <div className="btn-group">
                <Button variant="primary" icon={Play}>Start</Button>
                <Button variant="success" icon={Download}>Download</Button>
                <Button variant="danger" icon={Trash2}>Delete</Button>
                <Button variant="default" icon={Save}>Save</Button>
                <Button variant="secondary" icon={Settings}>Settings</Button>
              </div>
            </section>

            {/* Icon Position */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Icon Position</h2>
              <div className="btn-group">
                <Button variant="primary" icon={Plus} iconPosition="left">Add Item</Button>
                <Button variant="primary" icon={Plus} iconPosition="right">Add Item</Button>
              </div>
            </section>

            {/* States */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>States</h2>
              <div className="btn-group">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
              </div>
            </section>

            {/* Full Width */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Full Width</h2>
              <Button variant="primary" icon={Check} fullWidth>
                Full Width Button
              </Button>
            </section>

            {/* Action Buttons */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Common Actions</h2>
              <div className="btn-group">
                <Button variant="success" icon={Check} size="small">Approve</Button>
                <Button variant="danger" icon={X} size="small">Reject</Button>
                <Button variant="warning" icon={AlertCircle} size="small">Warning</Button>
                <Button variant="default" icon={Search} size="small">Search</Button>
                <Button variant="primary" icon={Upload} size="small">Upload</Button>
                <Button variant="ghost" icon={Edit} size="small">Edit</Button>
              </div>
            </section>

            {/* Button Groups */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Button Groups</h2>
              <div className="btn-group-compact">
                <Button variant="outline" size="small">Option 1</Button>
                <Button variant="outline" size="small">Option 2</Button>
                <Button variant="outline" size="small">Option 3</Button>
              </div>
            </section>

            {/* Vertical Group */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Vertical Group</h2>
              <div className="btn-group-vertical" style={{ maxWidth: '300px' }}>
                <Button variant="default" icon={Save} fullWidth>Save Changes</Button>
                <Button variant="outline" icon={X} fullWidth>Cancel</Button>
                <Button variant="danger" icon={Trash2} fullWidth>Delete</Button>
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
                <pre style={{ margin: 0 }}>{`import Button from '../components/Button'
import { Play } from 'lucide-react'

<Button 
  variant="primary" 
  icon={Play}
  onClick={handleClick}
  loading={isLoading}
>
  Start Scraping
</Button>`}</pre>
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
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>variant</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>string</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>'default'</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>default | primary | secondary | success | danger | warning | ghost | outline | link</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>size</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>string</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>'medium'</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>small | medium | large</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>icon</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Component</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>null</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Lucide icon component</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>iconPosition</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>string</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>'left'</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>left | right</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>disabled</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>boolean</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>false</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Disable button</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>loading</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>boolean</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>false</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Show loading spinner</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>fullWidth</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>boolean</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>false</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Full width button</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px' }}><code>onClick</code></td>
                      <td style={{ padding: '12px' }}>function</td>
                      <td style={{ padding: '12px' }}>-</td>
                      <td style={{ padding: '12px' }}>Click handler</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default ButtonDemo
