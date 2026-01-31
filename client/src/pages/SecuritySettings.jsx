import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import Button from '../components/Button'
import { useSession } from '../contexts/SecurityContext'
import { 
  Shield, Clock, Key, Lock, Eye, EyeOff, 
  RefreshCw, AlertTriangle, CheckCircle, Info
} from 'lucide-react'
import '../styles/SecuritySettings.css'

function SecuritySettings({ darkMode, toggleDarkMode }) {
  const { getSessionInfo, csrfToken, refreshCSRFToken, logout } = useSession()
  const [sessionInfo, setSessionInfo] = useState(null)
  const [showCSRFToken, setShowCSRFToken] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Update session info every second
    const interval = setInterval(() => {
      setSessionInfo(getSessionInfo())
    }, 1000)

    return () => clearInterval(interval)
  }, [getSessionInfo])

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const copyCSRFToken = () => {
    navigator.clipboard.writeText(csrfToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefreshCSRF = () => {
    refreshCSRFToken()
    setCopied(false)
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="security-settings-page">
        <main className="security-main">
          <Breadcrumb 
            items={[
              { label: 'Settings', path: '/preferences' },
              { label: 'Security', icon: Shield }
            ]}
          />

          <div className="security-header">
            <h1><Shield size={32} /> Security & Privacy</h1>
            <p className="security-description">
              Manage session timeout, CSRF protection, and security settings
            </p>
          </div>

          {/* Session Status */}
          <section className="security-section">
            <div className="section-header">
              <h2><Clock size={20} /> Session Status</h2>
              <div className="session-status-badge">
                {sessionInfo?.isActive ? (
                  <span className="status-active">
                    <CheckCircle size={16} /> Active
                  </span>
                ) : (
                  <span className="status-inactive">
                    <AlertTriangle size={16} /> Inactive
                  </span>
                )}
              </div>
            </div>

            {sessionInfo && (
              <div className="security-card">
                <div className="security-stats">
                  <div className="security-stat">
                    <div className="stat-icon">
                      <Clock size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">Session Duration</div>
                      <div className="stat-value">{formatDuration(sessionInfo.sessionDuration)}</div>
                    </div>
                  </div>

                  <div className="security-stat">
                    <div className="stat-icon">
                      <Clock size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">Last Activity</div>
                      <div className="stat-value">{formatDuration(sessionInfo.lastActivity)} ago</div>
                    </div>
                  </div>

                  <div className="security-stat">
                    <div className="stat-icon">
                      <Clock size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">Time Until Timeout</div>
                      <div className="stat-value">
                        {sessionInfo.isActive ? formatDuration(sessionInfo.timeRemaining) : 'Expired'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="security-info">
                  <Info size={16} />
                  <p>
                    Your session will automatically expire after 30 minutes of inactivity. 
                    You'll receive a warning 2 minutes before timeout.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* CSRF Protection */}
          <section className="security-section">
            <div className="section-header">
              <h2><Shield size={20} /> CSRF Protection</h2>
              <span className="security-badge enabled">
                <CheckCircle size={14} /> Enabled
              </span>
            </div>

            <div className="security-card">
              <p className="security-description">
                Cross-Site Request Forgery (CSRF) protection is enabled. All API requests that modify data 
                include a CSRF token for verification.
              </p>

              <div className="csrf-token-section">
                <div className="csrf-token-header">
                  <h3><Key size={18} /> Current CSRF Token</h3>
                  <div className="csrf-actions">
                    <Button
                      variant="ghost"
                      size="small"
                      icon={showCSRFToken ? EyeOff : Eye}
                      onClick={() => setShowCSRFToken(!showCSRFToken)}
                    >
                      {showCSRFToken ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={RefreshCw}
                      onClick={handleRefreshCSRF}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="csrf-token-display">
                  {showCSRFToken ? (
                    <code className="csrf-token">{csrfToken}</code>
                  ) : (
                    <code className="csrf-token-hidden">••••••••••••••••••••••••••••••••</code>
                  )}
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={copyCSRFToken}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="security-info">
                  <Info size={16} />
                  <p>
                    The CSRF token is automatically included in all POST, PUT, DELETE, and PATCH requests.
                    Refresh the token if you suspect it has been compromised.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Password Security */}
          <section className="security-section">
            <div className="section-header">
              <h2><Lock size={20} /> Password Security</h2>
              <span className="security-badge enabled">
                <CheckCircle size={14} /> Enabled
              </span>
            </div>

            <div className="security-card">
              <div className="security-feature">
                <div className="feature-icon">
                  <EyeOff size={24} />
                </div>
                <div className="feature-content">
                  <h3>Password Masking</h3>
                  <p>
                    Passwords are masked by default in the configuration page. 
                    Click the eye icon to temporarily reveal passwords.
                  </p>
                </div>
                <span className="feature-status enabled">
                  <CheckCircle size={16} /> Active
                </span>
              </div>

              <div className="security-feature">
                <div className="feature-icon">
                  <Lock size={24} />
                </div>
                <div className="feature-content">
                  <h3>Secure Storage</h3>
                  <p>
                    Sensitive configuration data is stored securely on the server. 
                    Passwords are never stored in browser localStorage.
                  </p>
                </div>
                <span className="feature-status enabled">
                  <CheckCircle size={16} /> Active
                </span>
              </div>
            </div>
          </section>

          {/* Security Best Practices */}
          <section className="security-section">
            <div className="section-header">
              <h2><AlertTriangle size={20} /> Security Best Practices</h2>
            </div>

            <div className="security-card">
              <div className="best-practices-grid">
                <div className="practice-item">
                  <CheckCircle size={18} className="practice-icon" />
                  <div>
                    <h4>Use Strong Passwords</h4>
                    <p>Use unique, complex passwords for authentication</p>
                  </div>
                </div>

                <div className="practice-item">
                  <CheckCircle size={18} className="practice-icon" />
                  <div>
                    <h4>Regular Logouts</h4>
                    <p>Logout when finished, especially on shared devices</p>
                  </div>
                </div>

                <div className="practice-item">
                  <CheckCircle size={18} className="practice-icon" />
                  <div>
                    <h4>Monitor Activity</h4>
                    <p>Review session duration and last activity regularly</p>
                  </div>
                </div>

                <div className="practice-item">
                  <CheckCircle size={18} className="practice-icon" />
                  <div>
                    <h4>Secure Connection</h4>
                    <p>Always use HTTPS when accessing the application</p>
                  </div>
                </div>

                <div className="practice-item">
                  <CheckCircle size={18} className="practice-icon" />
                  <div>
                    <h4>Update Regularly</h4>
                    <p>Keep the application updated with latest security patches</p>
                  </div>
                </div>

                <div className="practice-item">
                  <CheckCircle size={18} className="practice-icon" />
                  <div>
                    <h4>Limit Exposure</h4>
                    <p>Don't share CSRF tokens or session information</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="security-section">
            <div className="section-header">
              <h2>Security Actions</h2>
            </div>

            <div className="security-card">
              <div className="security-actions">
                <Button
                  variant="danger"
                  icon={Lock}
                  onClick={logout}
                  size="large"
                >
                  Logout Now
                </Button>
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  onClick={handleRefreshCSRF}
                  size="large"
                >
                  Refresh CSRF Token
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default SecuritySettings
