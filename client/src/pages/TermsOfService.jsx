import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import { FileText, AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react'

function TermsOfService({ darkMode, toggleDarkMode }) {
  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-white pt-20 dark:bg-black">
        <main className="mx-auto max-w-[900px] px-6 py-8">
          <Breadcrumb 
            items={[
              { label: 'Legal', path: '/terms' },
              { label: 'Terms of Service', icon: FileText }
            ]}
          />

          <div className="mb-8 border-b-2 border-gray-200 pb-6 dark:border-neutral-800">
            <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-gray-900 dark:text-gray-200">
              <FileText size={32} /> Terms of Service
            </h1>
            <p className="m-0 text-sm text-gray-500 dark:text-gray-400">Last Updated: January 31, 2026</p>
          </div>

          <div className="leading-relaxed">
            {/* Introduction */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Agreement to Terms
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                By accessing and using the Web Scraper application ("the Application", "we", "our"), 
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these 
                Terms, do not use the Application.
              </p>
              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-orange-500 bg-orange-50 p-4 text-gray-900 dark:bg-orange-500/10 dark:text-gray-200">
                <AlertTriangle size={20} className="mt-[2px] flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div>
                  <strong className="mb-1 block font-semibold">Important:</strong> This Application is provided "as is" without warranties. 
                  You are solely responsible for how you use this tool and the data you collect.
                </div>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <CheckCircle size={24} /> Acceptable Use
              </h2>
              
              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">You May Use This Application To:</h3>
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">Scrape publicly available information from websites</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">Collect data for personal research and analysis</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">Test and analyze website structures</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle size={18} className="mt-[2px] flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-gray-500 dark:text-gray-400">Archive web content for personal use</div>
                </div>
              </div>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">You Must NOT Use This Application To:</h3>
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Scrape or store sensitive personal information (passwords, credit cards, SSNs, etc.)</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Violate website terms of service or robots.txt directives</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Engage in unauthorized access or hacking attempts</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Overload or disrupt target websites (DDoS attacks)</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Collect data for spam, phishing, or malicious purposes</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Violate copyright, trademark, or intellectual property rights</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Scrape data protected by authentication without authorization</div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/10">
                  <AlertTriangle size={18} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-gray-900 dark:text-gray-200">Use the Application for any illegal or unethical purposes</div>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Your Responsibilities
              </h2>
              
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Legal Compliance:</strong> You are responsible for ensuring your use complies with all applicable laws and regulations
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Website Terms:</strong> You must respect and comply with target website terms of service
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Data Security:</strong> You are responsible for securing your device and the data you collect
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Rate Limiting:</strong> You must configure appropriate delays to avoid overloading websites
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border-l-[3px] border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <Info size={18} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-gray-500 dark:text-gray-400">
                    <strong className="mb-1 block font-semibold text-gray-900 dark:text-gray-200">Data Usage:</strong> You are responsible for how you use, store, and share scraped data
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimers */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <AlertTriangle size={24} /> Disclaimers and Limitations
              </h2>
              
              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">No Warranty</h3>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">No Liability</h3>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                WE ARE NOT LIABLE FOR ANY DAMAGES ARISING FROM YOUR USE OF THE APPLICATION, INCLUDING 
                BUT NOT LIMITED TO:
              </p>
              <ul className="my-3 list-disc pl-6 text-gray-500 dark:text-gray-400">
                <li className="mb-2 text-base">Data loss or corruption</li>
                <li className="mb-2 text-base">Security breaches or unauthorized access</li>
                <li className="mb-2 text-base">Legal consequences from improper use</li>
                <li className="mb-2 text-base">Website blocking or IP bans</li>
                <li className="mb-2 text-base">Copyright or terms of service violations</li>
                <li className="mb-2 text-base">Any direct, indirect, incidental, or consequential damages</li>
              </ul>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">No Legal Advice</h3>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                Nothing in these Terms or the Application constitutes legal advice. Consult with a 
                qualified attorney regarding the legality of web scraping in your jurisdiction.
              </p>
            </section>

            {/* Data and Privacy */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                <Shield size={24} /> Data and Privacy
              </h2>
              
              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-red-500 bg-red-50 p-4 text-gray-900 dark:bg-red-500/10 dark:text-gray-200">
                <AlertTriangle size={20} className="mt-[2px] flex-shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <strong className="mb-1 block font-semibold">Critical Security Notice:</strong>
                  <ul className="ml-5 mt-2 list-disc">
                    <li className="mb-1">All data is stored unencrypted on your local device</li>
                    <li className="mb-1">We do not provide data encryption or secure storage</li>
                    <li className="mb-1">Anyone with device access can view your scraped data</li>
                    <li className="mb-1">You assume all risks associated with data storage</li>
                  </ul>
                </div>
              </div>

              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                For detailed information about data handling, please review our 
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"> Privacy Policy</a>.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Intellectual Property
              </h2>
              
              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Application Ownership</h3>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                The Application and its original content, features, and functionality are owned by 
                the developers and are protected by international copyright, trademark, and other 
                intellectual property laws.
              </p>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Scraped Content</h3>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                Content you scrape using this Application belongs to the original content creators 
                and website owners. You are responsible for:
              </p>
              <ul className="my-3 list-disc pl-6 text-gray-500 dark:text-gray-400">
                <li className="mb-2 text-base">Respecting copyright and intellectual property rights</li>
                <li className="mb-2 text-base">Obtaining necessary permissions for content use</li>
                <li className="mb-2 text-base">Complying with content licensing terms</li>
                <li className="mb-2 text-base">Proper attribution when required</li>
              </ul>
            </section>

            {/* Termination */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Termination
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                You may stop using the Application at any time. We reserve the right to modify, 
                suspend, or discontinue the Application at any time without notice.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Changes to Terms
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                We reserve the right to modify these Terms at any time. Changes will be posted on 
                this page with an updated "Last Updated" date. Your continued use of the Application 
                after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Governing Law
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                These Terms shall be governed by and construed in accordance with applicable laws, 
                without regard to conflict of law provisions. You agree to submit to the jurisdiction 
                of the courts for resolution of any disputes.
              </p>
            </section>

            {/* Severability */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Severability
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                If any provision of these Terms is found to be unenforceable or invalid, that provision 
                shall be limited or eliminated to the minimum extent necessary, and the remaining 
                provisions shall remain in full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900 dark:border-neutral-800 dark:text-gray-200">
                Entire Agreement
              </h2>
              <p className="mb-4 text-base text-gray-500 dark:text-gray-400">
                These Terms, together with the Privacy Policy, constitute the entire agreement between 
                you and us regarding the use of the Application.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="mb-10">
              <div className="my-4 flex items-start gap-3 rounded-md border-l-4 border-blue-500 bg-blue-50 p-4 text-gray-900 dark:bg-blue-500/10 dark:text-gray-200">
                <Info size={20} className="mt-[2px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <strong className="mb-2 block font-semibold">By using this Application, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service.</strong>
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

export default TermsOfService