/**
 * Refund Policy Page
 */

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Refund Policy</h1>
        
        <div className="prose prose-neutral max-w-none space-y-8">
          <p className="text-sm text-neutral-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-neutral-800 font-semibold mb-2">Important Refund Information</p>
              <p className="text-neutral-700">
                Refunds are available under specific conditions. Once manager chat is initiated, refunds are no longer available.
                Please review this policy carefully before making a purchase.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Refund Eligibility</h2>
            
            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Refunds Available</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              You may be eligible for a refund if:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>You request a refund <strong>within 7 days</strong> of purchase</li>
              <li>You have <strong>not initiated manager chat</strong> or requested manager consultation</li>
              <li>The service has not been substantially delivered (e.g., AI analysis not completed)</li>
              <li>There is a technical error or service failure on our part</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Refunds NOT Available</h3>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-neutral-800 font-semibold mb-2">Non-Refundable Conditions</p>
              <ul className="list-disc list-inside text-neutral-700 space-y-2">
                <li><strong>Manager chat has been initiated</strong> - Once you start a conversation with a manager, the service is considered delivered and non-refundable</li>
                <li><strong>Final quote has been sent</strong> - If a manager has sent you a final quote, the service is considered completed</li>
                <li><strong>7 days have passed</strong> since purchase</li>
                <li>You have received the AI analysis results and the service has been delivered as described</li>
                <li>The refund request is due to a change of mind or buyer's remorse after service delivery</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Refund Process</h2>
            
            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">How to Request a Refund</h3>
            <ol className="list-decimal list-inside text-neutral-700 space-y-2 mb-4">
              <li>Contact us at <a href="mailto:outreach@nexsupply.net" className="text-blue-600 hover:underline">outreach@nexsupply.net</a> with your refund request</li>
              <li>Include your order number or transaction ID</li>
              <li>Provide a brief explanation for the refund request</li>
              <li>We will review your request within 5-7 business days</li>
              <li>If approved, refunds will be processed to the original payment method within 10-14 business days</li>
            </ol>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Refund Timeline</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li><strong>Request Review:</strong> 5-7 business days</li>
              <li><strong>Refund Processing:</strong> 10-14 business days after approval</li>
              <li><strong>Payment Method Credit:</strong> Timing depends on your bank or payment provider (typically 3-5 additional business days)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Service-Specific Refund Policies</h2>
            
            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">AI Analysis Service</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>If AI analysis fails to complete due to a technical error, a full refund will be issued</li>
              <li>If you are dissatisfied with the analysis results but the service was delivered as described, refunds are not available</li>
              <li>Refunds are not available if you have used the analysis results in your business planning</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">Manager Consultation Service</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-neutral-800 font-semibold mb-2">Critical: Manager Chat Initiation</p>
              <p className="text-neutral-700 mb-2">
                <strong>Once you initiate a chat with a manager, refunds are NO LONGER AVAILABLE.</strong>
              </p>
              <p className="text-neutral-700">
                This includes:
              </p>
              <ul className="list-disc list-inside text-neutral-700 space-y-1 mt-2">
                <li>Sending your first message to a manager</li>
                <li>Requesting manager consultation or expert advice</li>
                <li>Accepting a manager's assignment to your project</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Partial Refunds</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Partial refunds may be considered in exceptional circumstances:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Service was partially delivered but not completed due to our error</li>
              <li>Technical issues prevented full service delivery</li>
              <li>Dispute resolution that results in a compromise</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              Partial refunds are determined on a case-by-case basis at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Chargebacks and Disputes</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you initiate a chargeback or payment dispute through your bank or payment provider, we will:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>Provide transaction records and service delivery evidence</li>
              <li>Cooperate with the dispute resolution process</li>
              <li>Respect the decision of the payment processor</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              However, initiating a chargeback without first contacting us may result in account suspension and loss of access to our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Subscription Cancellations</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you have a subscription:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
              <li>You can cancel your subscription at any time</li>
              <li>Cancellation will take effect at the end of your current billing period</li>
              <li>No refunds are provided for unused portions of the current billing period</li>
              <li>You will continue to have access to the service until the end of the billing period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Questions and Support</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you have questions about our refund policy or wish to request a refund, please contact us:
            </p>
            <p className="text-neutral-700">
              <strong>Email:</strong> <a href="mailto:outreach@nexsupply.net" className="text-blue-600 hover:underline">outreach@nexsupply.net</a>
            </p>
            <p className="text-neutral-700 mt-2">
              We aim to respond to all refund requests within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Changes to Refund Policy</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting on this page.
              Your continued use of our service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

