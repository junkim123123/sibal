/**
 * Terms of Service Page
 */

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral max-w-none space-y-8">
          <p className="text-sm text-neutral-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Service Description</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              NexSupply provides AI-powered sourcing analysis and consultation services for B2B businesses.
              Our platform offers:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Early-stage cost estimates with accuracy ranges</li>
              <li>Market analysis and supplier insights</li>
              <li>Expert consultation services</li>
              <li>Risk assessment and logistics intelligence</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Use of Service</h2>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>You may use NexSupply for legitimate business sourcing purposes only</li>
              <li>Estimates are for planning purposes and are not final quotes or guarantees</li>
              <li>You are responsible for verifying all information before making business decisions</li>
              <li>You must not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. AI Analysis Disclaimer</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-neutral-800 font-semibold mb-2">Important: AI Analysis Limitations</p>
              <p className="text-neutral-700">
                Our AI-powered analysis provides estimates and recommendations based on available data and algorithms.
                <strong> NexSupply does not guarantee the accuracy, completeness, or reliability of any analysis results.</strong>
              </p>
            </div>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li><strong>Analysis results are estimates only</strong> and may vary significantly from actual costs, timelines, or outcomes</li>
              <li>AI models may contain errors, biases, or limitations that affect the accuracy of results</li>
              <li>Market conditions, supplier availability, and other factors may change after analysis is performed</li>
              <li>You should always consult with qualified professionals before making final sourcing decisions</li>
              <li><strong>NexSupply is not liable for any business decisions made based on our AI analysis</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Limitation of Liability</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEXSUPPLY SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Business decisions made based on our analysis or recommendations</li>
              <li>Inaccuracies in cost estimates, risk assessments, or supplier information</li>
              <li>Delays or failures in service delivery</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              Our total liability shall not exceed the amount you paid for the specific service that gave rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Intellectual Property</h2>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>All analysis reports, calculations, methodologies, and algorithms are proprietary to NexSupply</li>
              <li>You may not reverse-engineer, copy, or replicate our analysis logic or algorithms</li>
              <li>Reports are for your internal business use only</li>
              <li>You may not redistribute, resell, or publicly share our analysis reports without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Payment and Refunds</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Please refer to our <a href="/refund" className="text-blue-600 hover:underline">Refund Policy</a> for detailed information about payment terms and refund eligibility.
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>All payments are processed through secure third-party payment processors</li>
              <li>Service fees are non-refundable once the service has been delivered</li>
              <li>Refunds are subject to our Refund Policy and may be restricted after certain milestones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Termination</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your access to our service at any time if you:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent, abusive, or illegal activity</li>
              <li>Misuse the service or attempt to harm our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Changes to Terms</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We may update these Terms of Service from time to time. We will notify you of any material changes by posting the new terms on this page.
              Your continued use of the service after such changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-neutral-700 mt-2">
              <strong>Email:</strong> <a href="mailto:outreach@nexsupply.net" className="text-blue-600 hover:underline">outreach@nexsupply.net</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

