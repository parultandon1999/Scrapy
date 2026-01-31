import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { useToast } from '../components/ToastContainer'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import '../styles/Database.css'

function ToastDemo({ darkMode, toggleDarkMode }) {
  const toast = useToast()

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="config" />
      <div className="database-page">
        <aside className="db-sidebar">
          <h2>Toast Notifications</h2>
          <p style={{ fontSize: '13px', color: '#5f6368', padding: '0 16px' }}>
            Non-blocking notifications that replace alert() calls
          </p>
        </aside>

        <main className="db-main">
          <div className="dashboard-view">
            <h1>Toast Notification Demo</h1>

            {/* Toast Types */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Toast Types</h2>
              <div className="btn-group">
                <Button 
                  variant="success" 
                  icon={CheckCircle}
                  onClick={() => toast.success('Operation completed successfully!')}
                >
                  Success Toast
                </Button>
                <Button 
                  variant="danger" 
                  icon={XCircle}
                  onClick={() => toast.error('An error occurred. Please try again.')}
                >
                  Error Toast
                </Button>
                <Button 
                  variant="warning" 
                  icon={AlertCircle}
                  onClick={() => toast.warning('This action requires your attention.')}
                >
                  Warning Toast
                </Button>
                <Button 
                  variant="primary" 
                  icon={Info}
                  onClick={() => toast.info('Here is some helpful information.')}
                >
                  Info Toast
                </Button>
              </div>
            </section>

            {/* Custom Duration */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Custom Duration</h2>
              <div className="btn-group">
                <Button 
                  variant="default"
                  onClick={() => toast.info('This toast disappears in 2 seconds', 2000)}
                >
                  2 Seconds
                </Button>
                <Button 
                  variant="default"
                  onClick={() => toast.info('This toast disappears in 5 seconds', 5000)}
                >
                  5 Seconds
                </Button>
                <Button 
                  variant="default"
                  onClick={() => toast.info('This toast stays for 10 seconds', 10000)}
                >
                  10 Seconds
                </Button>
              </div>
            </section>

            {/* Multiple Toasts */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Multiple Toasts</h2>
              <Button 
                variant="secondary"
                onClick={() => {
                  toast.success('First notification')
                  setTimeout(() => toast.info('Second notification'), 300)
                  setTimeout(() => toast.warning('Third notification'), 600)
                }}
              >
                Show Multiple Toasts
              </Button>
            </section>

            {/* Real-World Examples */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Real-World Examples</h2>
              <div className="btn-group-vertical" style={{ maxWidth: '400px' }}>
                <Button 
                  variant="success"
                  fullWidth
                  onClick={() => toast.success('Configuration saved successfully!')}
                >
                  Save Configuration
                </Button>
                <Button 
                  variant="success"
                  fullWidth
                  onClick={() => toast.success('Session exported successfully!')}
                >
                  Export Session
                </Button>
                <Button 
                  variant="success"
                  fullWidth
                  onClick={() => toast.success('Deleted 15 pages')}
                >
                  Delete Pages
                </Button>
                <Button 
                  variant="error"
                  fullWidth
                  onClick={() => toast.error('Failed to load data. Please try again.')}
                >
                  Simulate Error
                </Button>
                <Button 
                  variant="warning"
                  fullWidth
                  onClick={() => toast.warning('You can only compare 2 sessions at a time')}
                >
                  Show Warning
                </Button>
                <Button 
                  variant="default"
                  fullWidth
                  onClick={() => toast.info('Chart export requires html2canvas library')}
                >
                  Show Info
                </Button>
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
                <pre style={{ margin: 0 }}>{`import { useToast } from '../components/ToastContainer'

function MyComponent() {
  const toast = useToast()

  const handleSave = async () => {
    try {
      await saveData()
      toast.success('Data saved successfully!')
    } catch (error) {
      toast.error('Failed to save data')
    }
  }

  return (
    <button onClick={handleSave}>
      Save
    </button>
  )
}`}</pre>
              </div>
            </section>

            {/* Migration Guide */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>Migration from alert()</h2>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h3 style={{ marginTop: 0 }}>Before (alert):</h3>
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>{`alert('Operation completed successfully!')`}</pre>

                <h3>After (toast):</h3>
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>{`toast.success('Operation completed successfully!')`}</pre>

                <h3>Benefits:</h3>
                <ul style={{ lineHeight: '1.8' }}>
                  <li>Non-blocking - doesn't interrupt user workflow</li>
                  <li>Multiple notifications can be shown simultaneously</li>
                  <li>Auto-dismisses after a few seconds</li>
                  <li>Can be manually dismissed</li>
                  <li>Visual types (success, error, warning, info)</li>
                  <li>Better UX and modern appearance</li>
                  <li>Dark mode support</li>
                </ul>
              </div>
            </section>

            {/* API Reference */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '16px' }}>API Reference</h2>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Method</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Parameters</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>toast.success()</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>message, duration?</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Show success notification</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>toast.error()</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>message, duration?</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Show error notification</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}><code>toast.warning()</code></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>message, duration?</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Show warning notification</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px' }}><code>toast.info()</code></td>
                      <td style={{ padding: '12px' }}>message, duration?</td>
                      <td style={{ padding: '12px' }}>Show info notification</td>
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

export default ToastDemo
