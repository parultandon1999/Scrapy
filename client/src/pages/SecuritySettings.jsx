import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/Breadcrumb'
import { 
  Shield, Lock, EyeOff, 
  AlertTriangle, CheckCircle, Info
} from 'lucide-react'
import '../styles/SecuritySettings.css'

function SecuritySettings({ darkMode, toggleDarkMode }) {

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
              Security features and best practices for web scraping
            </p>
          </div>

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
                    <h4>Secure Proxies</h4>
                    <p>Only use trusted proxy servers for scraping</p>
                  </div>
                </div>

                <div className="practice-item">
                  <CheckCircle size={18} className="practice-icon" />
                  <div>
                    <h4>Data Privacy</h4>
                    <p>Don't scrape sensitive or personal information</p>
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
                    <p>Don't share authentication credentials or session data</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Storage Warning */}
          <section className="security-section">
            <div className="section-header">
              <h2><Info size={20} /> Data Storage</h2>
            </div>

            <div className="security-card">
              <div className="security-info warning">
                <AlertTriangle size={20} />
                <div>
                  <h3>Unencrypted Local Storage</h3>
                  <p>
                    Scraped data is stored locally without encryption. Anyone with access to your device 
                    can view this data. Avoid scraping sensitive information like passwords, credit cards, 
                    or personal data.
                  </p>
                </div>
              </div>

              <div className="security-info">
                <Info size={16} />
                <p>
                  For production use with sensitive data, consider implementing encryption at rest 
                  and using secure database solutions.
                </p>
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
