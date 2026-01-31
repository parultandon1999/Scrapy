import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { Palette, Ruler, TextT, Layout } from '@phosphor-icons/react'
import '../styles/DesignSystemDemo.css'

function DesignSystemDemo({ darkMode, toggleDarkMode }) {
  const breadcrumbItems = [
    { label: 'Design System', icon: Palette }
  ]

  const spacingScale = [
    { name: 'space-0', value: '0', pixels: '0px' },
    { name: 'space-1', value: 'var(--space-1)', pixels: '4px' },
    { name: 'space-2', value: 'var(--space-2)', pixels: '8px' },
    { name: 'space-3', value: 'var(--space-3)', pixels: '12px' },
    { name: 'space-4', value: 'var(--space-4)', pixels: '16px' },
    { name: 'space-5', value: 'var(--space-5)', pixels: '20px' },
    { name: 'space-6', value: 'var(--space-6)', pixels: '24px' },
    { name: 'space-8', value: 'var(--space-8)', pixels: '32px' },
    { name: 'space-10', value: 'var(--space-10)', pixels: '40px' },
    { name: 'space-12', value: 'var(--space-12)', pixels: '48px' },
    { name: 'space-16', value: 'var(--space-16)', pixels: '64px' },
  ]

  const borderRadiusScale = [
    { name: 'radius-sm', value: 'var(--radius-sm)', pixels: '4px' },
    { name: 'radius-base', value: 'var(--radius-base)', pixels: '6px' },
    { name: 'radius-md', value: 'var(--radius-md)', pixels: '8px' },
    { name: 'radius-lg', value: 'var(--radius-lg)', pixels: '12px' },
    { name: 'radius-xl', value: 'var(--radius-xl)', pixels: '16px' },
    { name: 'radius-2xl', value: 'var(--radius-2xl)', pixels: '20px' },
    { name: 'radius-full', value: 'var(--radius-full)', pixels: '9999px' },
  ]

  const shadowScale = [
    { name: 'shadow-xs', value: 'var(--shadow-xs)' },
    { name: 'shadow-sm', value: 'var(--shadow-sm)' },
    { name: 'shadow-base', value: 'var(--shadow-base)' },
    { name: 'shadow-md', value: 'var(--shadow-md)' },
    { name: 'shadow-lg', value: 'var(--shadow-lg)' },
    { name: 'shadow-xl', value: 'var(--shadow-xl)' },
  ]

  const typographyScale = [
    { name: 'text-xs', size: 'var(--font-size-xs)', pixels: '11px' },
    { name: 'text-sm', size: 'var(--font-size-sm)', pixels: '13px' },
    { name: 'text-base', size: 'var(--font-size-base)', pixels: '14px' },
    { name: 'text-md', size: 'var(--font-size-md)', pixels: '16px' },
    { name: 'text-lg', size: 'var(--font-size-lg)', pixels: '18px' },
    { name: 'text-xl', size: 'var(--font-size-xl)', pixels: '20px' },
    { name: 'text-2xl', size: 'var(--font-size-2xl)', pixels: '24px' },
    { name: 'text-3xl', size: 'var(--font-size-3xl)', pixels: '30px' },
  ]

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="design-system" />
      
      <main id="main-content" role="main" className="design-system-page">
        <div className="design-system-header">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Design System</h1>
          <p className="design-system-subtitle">8px Grid System & Design Tokens</p>
        </div>

        {/* Spacing Scale */}
        <section className="design-section">
          <div className="section-header">
            <Ruler size={24} weight="duotone" />
            <h2>Spacing Scale (8px Grid)</h2>
          </div>
          <p className="section-description">
            All spacing values are multiples of 8px for visual consistency and rhythm.
          </p>
          <div className="spacing-grid">
            {spacingScale.map((space) => (
              <div key={space.name} className="spacing-item">
                <div className="spacing-label">
                  <code>--{space.name}</code>
                  <span className="spacing-pixels">{space.pixels}</span>
                </div>
                <div className="spacing-visual">
                  <div 
                    className="spacing-bar"
                    style={{ width: space.value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Scale */}
        <section className="design-section">
          <div className="section-header">
            <TextT size={24} weight="duotone" />
            <h2>Typography Scale</h2>
          </div>
          <div className="typography-grid">
            {typographyScale.map((type) => (
              <div key={type.name} className="typography-item">
                <div className="typography-label">
                  <code>--{type.name}</code>
                  <span className="typography-pixels">{type.pixels}</span>
                </div>
                <div 
                  className="typography-sample"
                  style={{ fontSize: type.size }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius */}
        <section className="design-section">
          <div className="section-header">
            <Layout size={24} weight="duotone" />
            <h2>Border Radius</h2>
          </div>
          <div className="radius-grid">
            {borderRadiusScale.map((radius) => (
              <div key={radius.name} className="radius-item">
                <div 
                  className="radius-box"
                  style={{ borderRadius: radius.value }}
                />
                <div className="radius-label">
                  <code>--{radius.name}</code>
                  <span className="radius-pixels">{radius.pixels}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shadows */}
        <section className="design-section">
          <div className="section-header">
            <Palette size={24} weight="duotone" />
            <h2>Shadow Scale</h2>
          </div>
          <div className="shadow-grid">
            {shadowScale.map((shadow) => (
              <div key={shadow.name} className="shadow-item">
                <div 
                  className="shadow-box"
                  style={{ boxShadow: shadow.value }}
                />
                <div className="shadow-label">
                  <code>--{shadow.name}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component Examples */}
        <section className="design-section">
          <div className="section-header">
            <Layout size={24} weight="duotone" />
            <h2>Component Spacing Examples</h2>
          </div>
          
          <div className="component-examples">
            <div className="example-card card">
              <h3>Card with Standard Padding</h3>
              <p>Uses <code>var(--space-6)</code> (24px) padding</p>
            </div>

            <div className="example-card card-compact">
              <h3>Compact Card</h3>
              <p>Uses <code>var(--space-4)</code> (16px) padding</p>
            </div>

            <div className="example-stack stack stack-4">
              <div className="stack-item">Stack Item 1</div>
              <div className="stack-item">Stack Item 2</div>
              <div className="stack-item">Stack Item 3</div>
              <p className="stack-description">
                Vertical stack with <code>gap: var(--space-4)</code>
              </p>
            </div>

            <div className="example-inline inline inline-4">
              <button className="example-btn">Button 1</button>
              <button className="example-btn">Button 2</button>
              <button className="example-btn">Button 3</button>
            </div>
            <p className="inline-description">
              Horizontal inline with <code>gap: var(--space-4)</code>
            </p>
          </div>
        </section>

        {/* Usage Guide */}
        <section className="design-section">
          <div className="section-header">
            <TextT size={24} weight="duotone" />
            <h2>Usage Guidelines</h2>
          </div>
          <div className="usage-guide">
            <div className="usage-card">
              <h3>✅ Do</h3>
              <ul>
                <li>Use design tokens for all spacing values</li>
                <li>Stick to the 8px grid system</li>
                <li>Use utility classes for quick prototyping</li>
                <li>Maintain consistent spacing between related elements</li>
                <li>Use larger spacing to separate unrelated sections</li>
              </ul>
            </div>
            <div className="usage-card">
              <h3>❌ Don't</h3>
              <ul>
                <li>Use arbitrary pixel values (e.g., 15px, 23px)</li>
                <li>Mix different spacing systems</li>
                <li>Override design tokens without good reason</li>
                <li>Use inconsistent spacing for similar components</li>
                <li>Forget to test spacing on mobile devices</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default DesignSystemDemo
