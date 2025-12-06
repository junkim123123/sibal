'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, AlertCircle, MessageCircle } from 'lucide-react'

export default function SupportPage() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16">
          {/* Left Column - Sticky Header */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-4 text-black">
                Get in touch
              </h1>
              <p className="text-lg text-zinc-600">
                Choose the right channel for your inquiry.
              </p>
            </div>
          </div>

          {/* Right Column - Support Sections */}
          <div className="lg:col-span-7 space-y-16 lg:space-y-20">
            {/* Section 1: Urgent Customs & Freight */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-black">
                    Urgent Shipment Issues
                  </h2>
                  <p className="text-lg text-zinc-600 mb-6 leading-relaxed">
                    If your shipment is held at customs or you have a time-sensitive logistics issue, please email our emergency line immediately.
                  </p>
                  <a
                    href="mailto:urgent@nexsupply.net"
                    className="inline-flex items-center gap-2 text-lg font-medium text-black hover:underline transition-colors group"
                  >
                    urgent@nexsupply.net
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </section>

            {/* Section 2: Sourcing Support */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-black">
                Talk to your Sourcing Agent
              </h2>
              <p className="text-lg text-zinc-600 mb-6 leading-relaxed">
                Need updates on an active quote or sample? The fastest way is to message your agent directly through the dashboard.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-lg font-medium text-black hover:underline transition-colors group"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </section>

            {/* Section 3: General Inquiries */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-black">
                Customer Support
              </h2>
              <p className="text-lg text-zinc-600 mb-2 leading-relaxed">
                For general questions about pricing, platform usage, or billing.
              </p>
              <p className="text-base text-zinc-500 mb-6">
                Hours of operation: 9am to 6pm EST, Mon-Fri.
              </p>
              <a
                href="mailto:support@nexsupply.net"
                className="inline-flex items-center gap-2 text-lg font-medium text-black hover:underline transition-colors group"
              >
                support@nexsupply.net
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </section>

            {/* Section 4: Business & Press */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-black">
                Business & Press
              </h2>
              <p className="text-lg text-zinc-600 mb-6 leading-relaxed">
                For factory partnerships or media inquiries.
              </p>
              <a
                href="mailto:partners@nexsupply.net"
                className="inline-flex items-center gap-2 text-lg font-medium text-black hover:underline transition-colors group"
              >
                partners@nexsupply.net
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </section>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white text-black px-6 py-4 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:scale-105 font-medium"
        aria-label="Need help?"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Need Help?</span>
      </button>

      {/* Simple Chat Panel (placeholder) */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-black">Chat Support</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-zinc-600 hover:text-black"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-zinc-600 text-sm mb-4">
              Start a conversation with our support team.
            </p>
            <a
              href="mailto:support@nexsupply.net"
              className="block w-full text-center px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
