import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import { Shield, Lock, Eye, Database, AlertTriangle, CheckCircle, Info } from 'lucide-react'

function PrivacyPolicy({ darkMode, toggleDarkMode }) {
  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-white pt-20 dark:bg-black">
        <main className="mx-auto max-w-[900px] px-6 py-8">
          <Breadcrumb 
            items={[
              { label: 'Legal', path: '/terms' },
              { label: 'Privacy Policy', icon: Shield }
            ]}
          />

          <div className="mb-8 border-b-2 border-gray-200 pb-6 dark:border-neutral-800">
            <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-gray-900 dark:text-gray-200">
              <Shield size={32} /> Privacy Policy
            </h1>
            <p className="m-0 text-sm text-gray-500 dark:text-gray-400">Last Updated: January 31, 2026</p>
          </div>

          <div className="leading-relaxed">
            {/* Introduction */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Introduction
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                This Privacy Policy explains how the Web Scraper application ("we", "our", or "the application") 
                handles, stores, and protects your data. By using this application, you agree to the practices 
                described in this policy.
              </p>
              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-orange-500 bg-orange-50 p-4 text-gray-900 dark:bg-orange-500/10 dark:text-gray-200">
                <AlertTriangle size={20} className="mt-[2px] flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div>
                  <strong className="mb-1 block font-semibold">Important:</strong> This application stores data locally on your device without encryption. 
                  Do not use this application to scrape or store sensitive, personal, or confidential information.
                </div>
              </div>
            </section>

            {/* Data Collection */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <Database size={24} /> Data Collection
              </h2>
              
              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">What Data We Collect</h3>
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Scraped Web Content:</strong> HTML, text, images, and files from websites you choose to scrape
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Configuration Data:</strong> Your scraper settings, authentication credentials, and preferences
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Session Data:</strong> Scraping history, session timestamps, and activity logs
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Application State:</strong> UI preferences, theme settings, and user customizations
                  </div>
                </div>
              </div>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">What We Don't Collect</h3>
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <X size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Analytics or Tracking:</strong> We do not track your usage or send data to third parties
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <X size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Personal Information:</strong> We do not collect your name, email, or contact information
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <X size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Cookies:</strong> We do not use cookies or similar tracking technologies
                  </div>
                </div>
              </div>
            </section>

            {/* Data Storage */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <Lock size={24} /> Data Storage
              </h2>
              
              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Where Your Data is Stored</h3>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                All data is stored locally on your device in two locations:
              </p>
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Database size={18} className="mt-[2px] flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Browser Storage:</strong> Configuration, preferences, and session tokens in localStorage
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Database size={18} className="mt-[2px] flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Local Database:</strong> Scraped content, files, and metadata in SQLite database
                  </div>
                </div>
              </div>

              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-red-500 bg-red-50 p-4 text-gray-900 dark:bg-red-500/10 dark:text-gray-200">
                <AlertTriangle size={20} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <strong className="mb-1 block font-semibold">No Encryption:</strong> Data is stored in plain text without encryption. 
                  Anyone with access to your device can view this data. Do not store sensitive information.
                </div>
              </div>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Data Retention</h3>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                Data is retained indefinitely until you manually delete it. You can delete data at any time through:
              </p>
              <ul className="my-3 list-disc pl-6 text-gray-500 dark:text-gray-400">
                <li className="mb-2 text-base">Database page: Delete individual pages or sessions</li>
                <li className="mb-2 text-base">History page: Delete entire scraping sessions</li>
                <li className="mb-2 text-base">Browser settings: Clear localStorage and application data</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <Shield size={24} /> Data Security
              </h2>
              
              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Security Measures</h3>
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Session Timeout:</strong> Automatic logout after 30 minutes of inactivity
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">CSRF Protection:</strong> Tokens prevent cross-site request forgery attacks
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Password Masking:</strong> Passwords hidden by default in configuration
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Local Processing:</strong> All data processing happens on your device
                  </div>
                </div>
              </div>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Security Limitations</h3>
              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-orange-500 bg-orange-50 p-4 text-gray-900 dark:bg-orange-500/10 dark:text-gray-200">
                <AlertTriangle size={20} className="mt-[2px] flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div>
                  <strong className="mb-1 block font-semibold">Important Limitations:</strong>
                  <ul className="ml-5 mt-2 list-disc">
                    <li className="mb-1">Data is not encrypted at rest</li>
                    <li className="mb-1">No protection against physical device access</li>
                    <li className="mb-1">No protection against malware or keyloggers</li>
                    <li className="mb-1">Shared devices pose security risks</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <Eye size={24} /> Data Sharing
              </h2>
              
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                <strong className="font-semibold text-gray-900 dark:text-gray-200">We do not share, sell, or transmit your data to any third parties.</strong> 
                All data remains on your local device. However:
              </p>

              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Export Feature:</strong> You can manually export data as JSON files
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Scraped Content:</strong> Content you scrape belongs to the original website owners
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Your Responsibility:</strong> You are responsible for how you use and share scraped data
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Your Rights
              </h2>
              
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">You have complete control over your data:</p>

              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Access:</strong> View all stored data through the Database and History pages
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Export:</strong> Download your data as JSON files at any time
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Delete:</strong> Remove individual items, sessions, or all data
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Control:</strong> Configure what data is collected through settings
                  </div>
                </div>
              </div>
            </section>

            {/* Responsible Use */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <AlertTriangle size={24} /> Responsible Use Guidelines
              </h2>
              
              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-red-500 bg-red-50 p-4 text-gray-900 dark:bg-red-500/10 dark:text-gray-200">
                <AlertTriangle size={20} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <strong className="mb-2 block font-semibold">Do NOT scrape or store:</strong>
                  <ul className="ml-5 mt-2 list-disc">
                    <li className="mb-1">Passwords or authentication credentials</li>
                    <li className="mb-1">Credit card or payment information</li>
                    <li className="mb-1">Social security numbers or government IDs</li>
                    <li className="mb-1">Medical or health records</li>
                    <li className="mb-1">Personal contact information</li>
                    <li className="mb-1">Any other sensitive or confidential data</li>
                  </ul>
                </div>
              </div>

              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-blue-500 bg-blue-50 p-4 text-gray-900 dark:bg-blue-500/10 dark:text-gray-200">
                <Info size={20} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <strong className="mb-2 block font-semibold">Best Practices:</strong>
                  <ul className="ml-5 mt-2 list-disc">
                    <li className="mb-1">Only scrape publicly available information</li>
                    <li className="mb-1">Respect website terms of service and robots.txt</li>
                    <li className="mb-1">Use on trusted, secure devices only</li>
                    <li className="mb-1">Regularly delete data you no longer need</li>
                    <li className="mb-1">Logout when using shared devices</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Changes to This Policy
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                We may update this Privacy Policy from time to time. Changes will be posted on this page 
                with an updated "Last Updated" date. Continued use of the application after changes 
                constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Questions or Concerns
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                If you have questions about this Privacy Policy or how your data is handled, 
                please review the Security Settings page or consult the application documentation.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="mb-10">
              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-blue-500 bg-blue-50 p-4 text-gray-900 dark:bg-blue-500/10 dark:text-gray-200">
                <Info size={20} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <strong className="mb-2 block font-semibold">By using this application, you acknowledge that:</strong>
                  <ul className="ml-5 mt-2 list-disc">
                    <li className="mb-1">You understand data is stored unencrypted on your device</li>
                    <li className="mb-1">You will not use this application for sensitive data</li>
                    <li className="mb-1">You are responsible for securing your device</li>
                    <li className="mb-1">You accept the security limitations described above</li>
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