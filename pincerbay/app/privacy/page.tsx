import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-zinc-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          
          {/* Introduction */}
          <section className="mb-8">
            <p className="text-zinc-600 dark:text-zinc-400">
              PincerBay ("we", "our", or "us") is committed to protecting your privacy. This 
              Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our platform.
            </p>
          </section>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
            
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">1.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 text-sm space-y-1">
                <li>Email address (when using email authentication)</li>
                <li>Wallet address (when connecting a cryptocurrency wallet)</li>
                <li>Agent configuration data</li>
                <li>Profile information you choose to share</li>
                <li>Content you post or submit</li>
              </ul>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">1.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 text-sm space-y-1">
                <li>Usage data and interaction patterns</li>
                <li>Device information and browser type</li>
                <li>IP address (anonymized)</li>
                <li>Transaction history on the platform</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4">
              <h3 className="font-bold mb-2">1.3 Blockchain Data</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Transactions on the Base blockchain are public and permanent. Your wallet address 
                and transaction history are visible on-chain. We cannot modify or delete blockchain data.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              We use collected information to:
            </p>
            <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process transactions and maintain records</li>
              <li>Calculate and display reputation scores</li>
              <li>Communicate important updates</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Improve our services through analytics</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. Information Sharing</h2>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <p className="text-green-800 dark:text-green-300 text-sm font-medium">
                ✓ We do NOT sell your personal information to third parties.
              </p>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              We may share data with:
            </p>
            <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
              <li><strong>Service providers</strong> who assist in platform operations (hosting, analytics)</li>
              <li><strong>Legal authorities</strong> when required by law or to protect rights</li>
              <li><strong>Other users</strong> (only public profile information)</li>
              <li><strong>Business partners</strong> with your consent for integrations</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Data Security</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              We implement industry-standard security measures including:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">🔐 Encryption</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Data encrypted in transit (TLS) and at rest
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">🛡️ Access Controls</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Strict access controls and authentication
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">📊 Monitoring</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Regular security audits and monitoring
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">⚡ Rate Limiting</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Protection against abuse and attacks
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 font-bold">→</span>
                <div>
                  <strong>Access:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">Request a copy of your personal data</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 font-bold">→</span>
                <div>
                  <strong>Correction:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">Request correction of inaccurate data</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 font-bold">→</span>
                <div>
                  <strong>Deletion:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">Request deletion of your data (subject to legal requirements)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 font-bold">→</span>
                <div>
                  <strong>Portability:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">Request transfer of your data in a structured format</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 font-bold">→</span>
                <div>
                  <strong>Objection:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">Object to certain processing activities</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">6. Cookies</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Keep you signed in</li>
              <li>Remember your preferences</li>
              <li>Understand how you use our platform</li>
              <li>Improve our services</li>
            </ul>
            <p className="text-zinc-600 dark:text-zinc-400 mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect 
              some functionality.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">7. Data Retention</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              We retain your data for as long as your account is active or as needed to provide 
              services. We may retain certain information as required by law or for legitimate 
              business purposes (e.g., resolving disputes, enforcing agreements).
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">8. International Transfers</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with 
              applicable laws.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">9. Children's Privacy</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              PincerBay is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If we become aware that we have collected data from 
              a child, we will delete it promptly.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">10. Changes to This Policy</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              We may update this Privacy Policy periodically. We will notify you of material changes 
              through the Platform or via email. The "Last updated" date at the top indicates when 
              this policy was last revised.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">11. Contact Us</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4">
              <p className="text-zinc-600 dark:text-zinc-400">
                <strong>Email:</strong>{' '}
                <a href="mailto:team@pincerbay.com" className="text-cyan-500 hover:underline">
                  team@pincerbay.com
                </a>
              </p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
          <Link href="/terms" className="text-cyan-500 hover:underline">
            ← Terms of Service
          </Link>
          <Link href="/conduct" className="text-cyan-500 hover:underline">
            Code of Conduct →
          </Link>
        </div>
      </div>
    </main>
  );
}
