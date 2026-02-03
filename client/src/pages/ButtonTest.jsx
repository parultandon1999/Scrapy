import { useState } from 'react'
import Button from '../components/mui/buttons/Button'
import { 
  Copy, Save, Trash2, Download, Search, Plus, 
  Check, X, AlertCircle, Settings 
} from 'lucide-react'

function ButtonTest() {
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(false)

  const handleLoadingTest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Material-UI Button Test</h1>
      <p>All buttons use Material-UI with CSS-in-JS - NO CSS files!</p>

      {/* Variants */}
      <section style={{ marginTop: '40px' }}>
        <h2>Button Variants</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
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
      <section style={{ marginTop: '40px' }}>
        <h2>Button Sizes</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px' }}>
          <Button variant="primary" size="small">Small</Button>
          <Button variant="primary" size="medium">Medium</Button>
          <Button variant="primary" size="large">Large</Button>
        </div>
      </section>

      {/* With Icons */}
      <section style={{ marginTop: '40px' }}>
        <h2>Buttons with Icons</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
          <Button variant="primary" icon={Save}>Save</Button>
          <Button variant="danger" icon={Trash2}>Delete</Button>
          <Button variant="success" icon={Download}>Download</Button>
          <Button variant="default" icon={Search}>Search</Button>
          <Button variant="secondary" icon={Plus}>Add New</Button>
        </div>
      </section>

      {/* Icon Position */}
      <section style={{ marginTop: '40px' }}>
        <h2>Icon Position</h2>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <Button variant="primary" icon={Check} iconPosition="left">Left Icon</Button>
          <Button variant="primary" icon={Check} iconPosition="right">Right Icon</Button>
        </div>
      </section>

      {/* Icon Only */}
      <section style={{ marginTop: '40px' }}>
        <h2>Icon-Only Buttons</h2>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <Button variant="icon" icon={Copy} iconOnly ariaLabel="Copy" />
          <Button variant="icon" icon={Save} iconOnly ariaLabel="Save" />
          <Button variant="icon" icon={Trash2} iconOnly ariaLabel="Delete" />
          <Button variant="icon" icon={Settings} iconOnly ariaLabel="Settings" />
        </div>
      </section>

      {/* States */}
      <section style={{ marginTop: '40px' }}>
        <h2>Button States</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
          <Button variant="primary">Normal</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading={loading} onClick={handleLoadingTest}>
            {loading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </section>

      {/* Navigation Buttons */}
      <section style={{ marginTop: '40px' }}>
        <h2>Navigation Buttons (Sidebar)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px', marginTop: '20px' }}>
          <Button variant="nav" icon={Settings} active={active} onClick={() => setActive(!active)}>
            Dashboard
          </Button>
          <Button variant="nav" icon={Search}>Search</Button>
          <Button variant="nav" icon={AlertCircle}>Settings</Button>
        </div>
      </section>

      {/* Sidebar Buttons */}
      <section style={{ marginTop: '40px' }}>
        <h2>Sidebar Action Buttons</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', marginTop: '20px' }}>
          <Button variant="sidebar" icon={Search}>Analyze Page</Button>
          <Button variant="sidebar" icon={Download}>Export Data</Button>
        </div>
      </section>

      {/* Submit Button */}
      <section style={{ marginTop: '40px' }}>
        <h2>Submit Button</h2>
        <div style={{ marginTop: '20px' }}>
          <Button variant="submit" icon={Check} fullWidth>
            Submit Form
          </Button>
        </div>
      </section>

      {/* Full Width */}
      <section style={{ marginTop: '40px' }}>
        <h2>Full Width Buttons</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          <Button variant="primary" fullWidth>Primary Full Width</Button>
          <Button variant="danger" fullWidth>Danger Full Width</Button>
        </div>
      </section>
    </div>
  )
}

export default ButtonTest
