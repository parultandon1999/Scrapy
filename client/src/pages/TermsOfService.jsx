import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { FileText, AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react'
import '../styles/LegalPages.css'

function TermsOfService({ darkMode, toggleDarkMode }) {
  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="legal-page">
        <main className="legal-main">
          <Breadcrumb 
            items={[
              { label: 'Legal', path: '/terms' },
              { label: 'Terms of Service', icon: FileText }
            ]}
          />

          <div className="legal-header">
            <h1><FileText size={32} /> Terms of Service</h1>
            <p className="legal-meta">Last Updated: January 31, 2026</p>
          </div>

          <div className="legal-content">
            {/* Introduction */}
            <section className="legal-section">
              <h2>Agreement to Terms</h2>
              <p>
                By accessing and using the Web Scraper application ("the Application", "we", "our"), 
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these 
                Terms, do not use the Application.
              </p>
              <div className="legal-notice warning">
                <AlertTriangle size={20} />
                <div>
                  <strong>Important:</strong> This Application is provided "as is" without warranties. 
                  You are solely responsible for how you use this tool and the data you collect.
                </div>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="legal-section">
              <h2><CheckCircle size={24} /> Acceptable Use</h2>
              
              <h3>You May Use This Application To:</h3>
              <div className="legal-list">
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>Scrape publicly available information from websites</div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>Collect data for personal research and analysis</div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>Test and analyze website structures</div>
                </div>
                <div className="legal-list-item">
                  <CheckCircle size={18} className="icon-success" />
                  <div>Archive web content for personal use</div>
                </div>
              </div>

              <h3>You Must NOT Use This Application To:</h3>
              <div className="legal-list">
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Scrape or store sensitive personal information (passwords, credit cards, SSNs, etc.)</div>
                </div>
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Violate website terms of service or robots.txt directives</div>
                </div>
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Engage in unauthorized access or hacking attempts</div>
                </div>
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Overload or disrupt target websites (DDoS attacks)</div>
                </div>
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Collect data for spam, phishing, or malicious purposes</div>
                </div>
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Violate copyright, trademark, or intellectual property rights</div>
                </div>
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Scrape data protected by authentication without authorization</div>
                </div>
                <div className="legal-list-item danger">
                  <AlertTriangle size={18} className="icon-danger" />
                  <div>Use the Application for any illegal or unethical purposes</div>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="legal-section">
              <h2>Your Responsibilities</h2>
              
              <div className="legal-list">
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Legal Compliance:</strong> You are responsible for ensuring your use complies with all applicable laws and regulations
                  </div>
                </div>
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Website Terms:</strong> You must respect and comply with target website terms of service
                  </div>
                </div>
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Data Security:</strong> You are responsible for securing your device and the data you collect
                  </div>
                </div>
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Rate Limiting:</strong> You must configure appropriate delays to avoid overloading websites
                  </div>
                </div>
                <div className="legal-list-item">
                  <Info size={18} />
                  <div>
                    <strong>Data Usage:</strong> You are responsible for how you use, store, and share scraped data
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimers */}
            <section className="legal-section">
              <h2><AlertTriangle size={24} /> Disclaimers and Limitations</h2>
              
              <h3>No Warranty</h3>
              <p>
                THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3>No Liability</h3>
              <p>
                WE ARE NOT LIABLE FOR ANY DAMAGES ARISING FROM YOUR USE OF THE APPLICATION, INCLUDING 
                BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>Data loss or corruption</li>
                <li>Security breaches or unauthorized access</li>
                <li>Legal consequences from improper use</li>
                <li>Website blocking or IP bans</li>
                <li>Copyright or terms of service violations</li>
                <li>Any direct, indirect, incidental, or consequential damages</li>
              </ul>

              <h3>No Legal Advice</h3>
              <p>
                Nothing in these Terms or the Application constitutes legal advice. Consult with a 
                qualified attorney regarding the legality of web scraping in your jurisdiction.
              </p>
            </section>

            {/* Data and Privacy */}
            <section className="legal-section">
              <h2><Shield size={24} /> Data and Privacy</h2>
              
              <div className="legal-notice danger">
                <AlertTriangle size={20} />
                <div>
                  <strong>Critical Security Notice:</strong>
                  <ul>
                    <li>All data is stored unencrypted on your local device</li>
                    <li>We do not provide data encryption or secure storage</li>
                    <li>Anyone with device access can view your scraped data</li>
                    <li>You assume all risks associated with data storage</li>
                  </ul>
                </div>
              </div>

              <p>
                For detailed information about data handling, please review our 
                <a href="/privacy-policy"> Privacy Policy</a>.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="legal-section">
              <h2>Intellectual Property</h2>
              
              <h3>Application Ownership</h3>
              <p>
                The Application and its original content, features, and functionality are owned by 
                the developers and are protected by international copyright, trademark, and other 
                intellectual property laws.
              </p>

              <h3>Scraped Content</h3>
              <p>
                Content you scrape using this Application belongs to the original content creators 
                and website owners. You are responsible for:
              </p>
              <ul>
                <li>Respecting copyright and intellectual property rights</li>
                <li>Obtaining necessary permissions for content use</li>
                <li>Complying with content licensing terms</li>
                <li>Proper attribution when required</li>
              </ul>
            </section>

            {/* Termination */}
            <section className="legal-section">
              <h2>Termination</h2>
              <p>
                You may stop using the Application at any time. We reserve the right to modify, 
                suspend, or discontinue the Application at any time without notice.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="legal-section">
              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on 
                this page with an updated "Last Updated" date. Your continued use of the Application 
                after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="legal-section">
              <h2>Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, 
                without regard to conflict of law provisions. You agree to submit to the jurisdiction 
                of the courts for resolution of any disputes.
              </p>
            </section>

            {/* Severability */}
            <section className="legal-section">
              <h2>Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision 
                shall be limited or eliminated to the minimum extent necessary, and the remaining 
                provisions shall remain in full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section className="legal-section">
              <h2>Entire Agreement</h2>
              <p>
                These Terms, together with the Privacy Policy, constitute the entire agreement between 
                you and us regarding the use of the Application.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="legal-section">
              <div className="legal-notice info">
                <Info size={20} />
                <div>
                  <strong>By using this Application, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service.</strong>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default TermsOfService
