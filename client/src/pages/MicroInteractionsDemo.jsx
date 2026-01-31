import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import AnimatedCard from '../components/AnimatedCard'
import AnimatedButton from '../components/AnimatedButton'
import { useCountUp, useTypewriter, useStaggerAnimation } from '../hooks/useScrollAnimation'
import { 
  Sparkle, 
  Heart, 
  Star, 
  Lightning,
  CheckCircle,
  XCircle,
  Download,
  Upload
} from '@phosphor-icons/react'
import '../styles/MicroInteractionsDemo.css'

function MicroInteractionsDemo({ darkMode, toggleDarkMode }) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const count = useCountUp(1234, 2000)
  const typedText = useTypewriter('Beautiful micro-interactions make your UI come alive!', 50)
  const visibleItems = useStaggerAnimation(6, 100)

  const breadcrumbItems = [
    { label: 'Micro-interactions', icon: Sparkle }
  ]

  const handleSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const handleError = () => {
    setShowError(true)
    setTimeout(() => setShowError(false), 2000)
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="micro-interactions" />
      
      <main id="main-content" role="main" className="micro-demo-page">
        <div className="micro-demo-header">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="fade-in-up visible">Micro-interactions</h1>
          <p className="micro-demo-subtitle fade-in-up visible" style={{ transitionDelay: '100ms' }}>
            {typedText}
          </p>
        </div>

        {/* Button Interactions */}
        <AnimatedCard animation="fade-in-up" delay={200}>
          <section className="demo-section">
            <h2>Button Interactions</h2>
            <p className="section-description">Hover, click, and watch the magic happen</p>
            
            <div className="button-grid">
              <AnimatedButton variant="primary" icon={<Heart size={18} />}>
                Primary Button
              </AnimatedButton>
              
              <AnimatedButton variant="secondary" icon={<Star size={18} />} iconPosition="right">
                Secondary
              </AnimatedButton>
              
              <AnimatedButton variant="success" icon={<CheckCircle size={18} />}>
                Success
              </AnimatedButton>
              
              <AnimatedButton variant="danger" icon={<XCircle size={18} />}>
                Danger
              </AnimatedButton>
              
              <AnimatedButton variant="primary" loading>
                Loading...
              </AnimatedButton>
              
              <AnimatedButton variant="primary" disabled>
                Disabled
              </AnimatedButton>
            </div>
          </section>
        </AnimatedCard>

        {/* Card Interactions */}
        <AnimatedCard animation="fade-in-up" delay={300}>
          <section className="demo-section">
            <h2>Card Interactions</h2>
            <p className="section-description">Hover over cards to see lift and shine effects</p>
            
            <div className="cards-grid">
              <div className="demo-card card-shine">
                <Lightning size={32} weight="duotone" className="card-icon" />
                <h3>Shine Effect</h3>
                <p>Hover to see the shine animation</p>
              </div>
              
              <div className="demo-card glow-on-hover">
                <Sparkle size={32} weight="duotone" className="card-icon" />
                <h3>Glow Effect</h3>
                <p>Hover to see the glow animation</p>
              </div>
              
              <div className="demo-card">
                <Heart size={32} weight="duotone" className="card-icon icon-pulse" />
                <h3>Pulse Icon</h3>
                <p>Hover the icon to see pulse effect</p>
              </div>
            </div>
          </section>
        </AnimatedCard>

        {/* Stagger Animation */}
        <AnimatedCard animation="fade-in-up" delay={400}>
          <section className="demo-section">
            <h2>Stagger Animation</h2>
            <p className="section-description">Items appear one after another</p>
            
            <div className="stagger-grid">
              {[1, 2, 3, 4, 5, 6].map((item, index) => (
                <div
                  key={item}
                  className={`stagger-card ${visibleItems.includes(index) ? 'visible' : ''}`}
                  style={{
                    opacity: visibleItems.includes(index) ? 1 : 0,
                    transform: visibleItems.includes(index) ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.3s ease',
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <span className="stagger-number">{item}</span>
                  <p>Item {item}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedCard>

        {/* Count Up Animation */}
        <AnimatedCard animation="fade-in-up" delay={500}>
          <section className="demo-section">
            <h2>Count Up Animation</h2>
            <p className="section-description">Numbers animate from 0 to target value</p>
            
            <div className="count-display">
              <div className="count-card">
                <div className="count-value">{count.toLocaleString()}</div>
                <div className="count-label">Total Users</div>
              </div>
            </div>
          </section>
        </AnimatedCard>

        {/* Success/Error Animations */}
        <AnimatedCard animation="fade-in-up" delay={600}>
          <section className="demo-section">
            <h2>Feedback Animations</h2>
            <p className="section-description">Visual feedback for user actions</p>
            
            <div className="feedback-demo">
              <AnimatedButton 
                variant="success" 
                icon={<CheckCircle size={18} />}
                onClick={handleSuccess}
              >
                Show Success
              </AnimatedButton>
              
              <AnimatedButton 
                variant="danger" 
                icon={<XCircle size={18} />}
                onClick={handleError}
              >
                Show Error
              </AnimatedButton>
              
              {showSuccess && (
                <div className="feedback-message success-animation">
                  <CheckCircle size={24} weight="fill" />
                  <span>Action completed successfully!</span>
                </div>
              )}
              
              {showError && (
                <div className="feedback-message error-shake">
                  <XCircle size={24} weight="fill" />
                  <span>Oops! Something went wrong.</span>
                </div>
              )}
            </div>
          </section>
        </AnimatedCard>

        {/* Hover Effects */}
        <AnimatedCard animation="fade-in-up" delay={700}>
          <section className="demo-section">
            <h2>Hover Effects</h2>
            <p className="section-description">Various hover interactions</p>
            
            <div className="hover-grid">
              <div className="hover-card" data-tooltip="Tooltip on hover">
                <Star size={32} className="icon-bounce" />
                <p>Bounce Icon</p>
              </div>
              
              <div className="hover-card" data-tooltip="Spinning icon">
                <Lightning size={32} className="icon-spin" />
                <p>Spin Icon</p>
              </div>
              
              <div className="hover-card" data-tooltip="Pulsing effect">
                <Heart size={32} className="icon-pulse" />
                <p>Pulse Icon</p>
              </div>
            </div>
          </section>
        </AnimatedCard>

        {/* Loading States */}
        <AnimatedCard animation="fade-in-up" delay={800}>
          <section className="demo-section">
            <h2>Loading States</h2>
            <p className="section-description">Skeleton loaders and progress indicators</p>
            
            <div className="loading-demo">
              <div className="skeleton-card">
                <div className="skeleton" style={{ width: '100%', height: '120px', borderRadius: '8px' }} />
                <div className="skeleton" style={{ width: '60%', height: '20px', marginTop: '12px' }} />
                <div className="skeleton" style={{ width: '80%', height: '16px', marginTop: '8px' }} />
              </div>
              
              <div className="progress-demo">
                <div className="progress-bar" style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: 'var(--primary-color)', position: 'relative' }} />
                </div>
                <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Loading... 70%</p>
              </div>
            </div>
          </section>
        </AnimatedCard>

        {/* Attention Seekers */}
        <AnimatedCard animation="fade-in-up" delay={900}>
          <section className="demo-section">
            <h2>Attention Seekers</h2>
            <p className="section-description">Animations to draw user attention</p>
            
            <div className="attention-grid">
              <div className="attention-card">
                <div className="badge badge-pulse">New</div>
                <p>Pulsing Badge</p>
              </div>
              
              <div className="attention-card">
                <Heart size={32} className="heartbeat" />
                <p>Heartbeat</p>
              </div>
              
              <div className="attention-card">
                <Star size={32} className="wiggle" />
                <p>Wiggle</p>
              </div>
            </div>
          </section>
        </AnimatedCard>
      </main>

      <Footer />
    </div>
  )
}

export default MicroInteractionsDemo
