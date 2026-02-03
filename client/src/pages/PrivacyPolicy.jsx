import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import { Shield, Lock, Eye, Database, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import '../styles/LegalPages.css'

function PrivacyPolicy({ darkMode, toggleDarkMode }) {
  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="legal-page">
        <main className="legal-main">
          <Breadcrumb 
            items={[
              { label: 'Legal', path: '/terms' },
              { label: 'Privacy Policy', icon: Shield }
            ]}
          />

          <div className="legal-header">
            <h1><Shield size={32} /> Privacy Policy</h1>
            <p className="legal-meta">Last Updated: January 31, 2026</p>
          </div>

          <div className="legal-content">
            {/* Introduction */}
            <section className="legal-section">
              <h2>Introduction</h2>
              <p>
                This Privacy Policy explains how the Web Scraper application ("we", "our", or "the application") 
                handles, stores, and protects your data. By using this application, you agree to the practices 
                described in this policy.
              </p>
              <div className="legal-notice warning">
                <AlertTriangle size={20} />
                <div>
                  <strong>Important:</strong> This application stores data locally on your device without encryption. 
                  Do not use this application to scrape or store sensitive, personal, or confidential information.
                </div>
              </div>
            </section>

            {/* Data Collection */}
            <section className="legal-section">
              <h2><Database size={24} /> Data Collection</h2>
              
              <h3>What Data We Collect</h3>
              <div className="legal-list">
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Scraped Web Content:</strong> HTML, text, images, and files from websites you choose to scrape
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Configuration Data:</strong> Your scraper settings, authentication credentials, and preferences
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Session Data:</strong> Scraping history, session timestamps, and activity logs
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Application State:</strong> UI preferences, theme settings, and user customizations
                  </div>
                </div>
              </div>

              <h3>What We Don't Collect</h3>
              <div className="legal-list">
                <div className="legal-list-item">
                  <X size={18} className="icon-danger" />
                  <div>
                    <strong>Analytics or Tracking:</strong> We do not track your usage or send data to third parties
                  </div>
                </div>
                <div className="legal-list-item">
                  <X size={18} className="icon-danger" />
                  <div>
                    <strong>Personal Information:</strong> We do not collect your name, email, or contact information
                  </div>
                </div>
                <div className="legal-list-item">
                  <X size={18} className="icon-danger" />
                  <div>
                    <strong>Cookies:</strong> We do not use cookies or similar tracking technologies
                  </div>
                </div>
              </div>
            </section>

            {/* Data Storage */}
            <section className="legal-section">
              <h2><Lock size={24} /> Data Storage</h2>
              
              <h3>Where Your Data is Stored</h3>
              <p>
                All data is stored locally on your device in two locations:
              </p>
              <div className="legal-list">
                <div className="legal-list-item">
                  <Database size={18} />
                  <div>
                    <strong>Browser Storage:</strong> Configuration, preferences, and session tokens in localStorage
                  </div>
                </div>
                <div className="legal-list-item">
                  <Database size={18} />
                  <div>
                    <strong>Local Database:</strong> Scraped content, files, and metadata in SQLite database
                  </div>
                </div>
              </div>

              <div className="legal-notice danger">
                <AlertTriangle size={20} />
                <div>
                  <strong>No Encryption:</strong> Data is stored in plain text without encryption. 
                  Anyone with access to your device can view this data. Do not store sensitive information.
                </div>
              </div>

              <h3>Data Retention</h3>
              <p>
                Data is retained indefinitely until you manually delete it. You can delete data at any time through:
              </p>
              <ul>
                <li>Database page: Delete individual pages or sessions</li>
                <li>History page: Delete entire scraping sessions</li>
                <li>Browser settings: Clear localStorage and application data</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="legal-section">
              <h2><Shield size={24} /> Data Security</h2>
              
              <h3>Security Measures</h3>
              <div className="legal-list">
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Session Timeout:</strong> Automatic logout after 30 minutes of inactivity
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>CSRF Protection:</strong> Tokens prevent cross-site request forgery attacks
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Password Masking:</strong> Passwords hidden by default in configuration
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Local Processing:</strong> All data processing happens on your device
                  </div>
                </div>
              </div>

              <h3>Security Limitations</h3>
              <div className="legal-notice warning">
                <AlertTriangle size={20} />
                <div>
                  <strong>Important Limitations:</strong>
                  <ul>
                    <li>Data is not encrypted at rest</li>
                    <li>No protection against physical device access</li>
                    <li>No protection against malware or keyloggers</li>
                    <li>Shared devices pose security risks</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="legal-section">
              <h2><Eye size={24} /> Data Sharing</h2>
              
              <p>
                <strong>We do not share, sell, or transmit your data to any third parties.</strong> 
                All data remains on your local device. However:
              </p>

              <div className="legal-list">
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Export Feature:</strong> You can manually export data as JSON files
                  </div>
                </div>
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Scraped Content:</strong> Content you scrape belongs to the original website owners
                  </div>
                </div>
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Your Responsibility:</strong> You are responsible for how you use and share scraped data
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="legal-section">
              <h2>Your Rights</h2>
              
              <p>You have complete control over your data:</p>

              <div className="legal-list">
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Access:</strong> View all stored data through the Database and History pages
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Export:</strong> Download your data as JSON files at any time
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Delete:</strong> Remove individual items, sessions, or all data
                  </div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>
                    <strong>Control:</strong> Configure what data is collected through settings
                  </div>
                </div>
              </div>
            </section>

            {/* Responsible Use */}
            <section className="legal-section">
              <h2><AlertTriangle size={24} /> Responsible Use Guidelines</h2>
              
              <div className="legal-notice danger">
                <AlertTriangle size={20} />
                <div>
                  <strong>Do NOT scrape or store:</strong>
                  <ul>
                    <li>Passwords or authentication credentials</li>
                    <li>Credit card or payment information</li>
                    <li>Social security numbers or government IDs</li>
                    <li>Medical or health records</li>
                    <li>Personal contact information</li>
                    <li>Any other sensitive or confidential data</li>
                  </ul>
                </div>
              </div>

              <div className="legal-notice info">
                <Info size={20} />
                <div>
                  <strong>Best Practices:</strong>
                  <ul>
                    <li>Only scrape publicly available information</li>
                    <li>Respect website terms of service and robots.txt</li>
                    <li>Use on trusted, secure devices only</li>
                    <li>Regularly delete data you no longer need</li>
                    <li>Logout when using shared devices</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="legal-section">
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page 
                with an updated "Last Updated" date. Continued use of the application after changes 
                constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section className="legal-section">
              <h2>Questions or Concerns</h2>
              <p>
                If you have questions about this Privacy Policy or how your data is handled, 
                please review the Security Settings page or consult the application documentation.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="legal-section">
              <div className="legal-notice info">
                <Info size={20} />
                <div>
                  <strong>By using this application, you acknowledge that:</strong>
                  <ul>
                    <li>You understand data is stored unencrypted on your device</li>
                    <li>You will not use this application for sensitive data</li>
                    <li>You are responsible for securing your device</li>
                    <li>You accept the security limitations described above</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      {/* <Footer /> */}
    </>
  )
}

function X({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

export default PrivacyPolicy
