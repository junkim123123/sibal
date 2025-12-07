/**
 * Privacy Policy Page
 */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral max-w-none space-y-8">
          <p className="text-sm text-neutral-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Product Information</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Product names, descriptions, and specifications</li>
              <li>Product images you upload</li>
              <li>Sourcing requirements and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Contact Information</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Email address (when you create an account or request consultation)</li>
              <li>Name and company information (when provided)</li>
              <li>Contact preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Usage Data</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Analysis queries and results</li>
              <li>Feature usage and mode selections</li>
              <li>Timestamps and session data</li>
              <li>Device and browser information</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Payment Information</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Payment processing is handled by secure third-party providers (Lemon Squeezy, Stripe)</li>
              <li>We do not store credit card numbers or payment details</li>
              <li>Transaction records and subscription status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li><strong>Service Delivery:</strong> To provide sourcing analysis and reports</li>
              <li><strong>Improvement:</strong> To improve our AI models, algorithms, and service quality</li>
              <li><strong>Communication:</strong> To contact you regarding consultation requests, project updates, and service notifications</li>
              <li><strong>Analytics:</strong> For internal analytics, trend analysis, and business intelligence</li>
              <li><strong>Support:</strong> To provide customer support and respond to inquiries</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Data Sharing and Third Parties</h2>
            
            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">We Do Not Sell Your Data</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Service Providers</h3>
            <p className="text-neutral-700 leading-relaxed mb-2">
              We may share your information with trusted third-party service providers who assist us in:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Cloud hosting and data storage (Supabase, Vercel)</li>
              <li>Payment processing (Lemon Squeezy, Stripe)</li>
              <li>Email delivery (Google SMTP, Nodemailer)</li>
              <li>Analytics and monitoring (Vercel Analytics)</li>
              <li>AI model processing (Google Gemini API)</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-4">
              These providers are contractually obligated to protect your information and use it only for the purposes we specify.
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Legal Requirements</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We may disclose your information if required by law, court order, or government regulation, or to protect our rights and prevent fraud.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Data Security</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest</li>
              <li><strong>Access Controls:</strong> Strict access controls and authentication mechanisms</li>
              <li><strong>Secure Storage:</strong> Data is stored in secure, compliant cloud infrastructure</li>
              <li><strong>Regular Audits:</strong> Regular security audits and vulnerability assessments</li>
              <li><strong>API Keys:</strong> Sensitive credentials and API keys are stored securely and never exposed</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Your Rights</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal and contractual obligations)</li>
              <li><strong>Opt-Out:</strong> Opt out of marketing communications (service notifications may still be sent)</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              To exercise these rights, please contact us at <a href="mailto:outreach@nexsupply.net" className="text-blue-600 hover:underline">outreach@nexsupply.net</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Data Retention</h2>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li><strong>Analysis Data:</strong> Retained for service improvement and model training (anonymized where possible)</li>
              <li><strong>Account Information:</strong> Retained while your account is active and for a reasonable period after account closure</li>
              <li><strong>Contact Information:</strong> Retained for consultation follow-up and service communication</li>
              <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              You can request deletion of your data at any time, subject to legal and contractual obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Maintain your session and authenticate your account</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns and improve our service</li>
              <li>Provide analytics and monitoring</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              You can control cookies through your browser settings, though this may affect service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Children's Privacy</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Our service is intended for business use and is not directed to individuals under 18 years of age.
              We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. International Data Transfers</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your country of residence.
              These countries may have different data protection laws. By using our service, you consent to such transfers.
              We ensure appropriate safeguards are in place to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Changes to Privacy Policy</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              Your continued use of the service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Contact</h2>
            <p className="text-neutral-700 leading-relaxed mb-2">
              For privacy concerns or to exercise your rights, please contact us at:
            </p>
            <p className="text-neutral-700">
              <strong>Email:</strong> <a href="mailto:outreach@nexsupply.net" className="text-blue-600 hover:underline">outreach@nexsupply.net</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

