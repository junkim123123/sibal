'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Shield } from 'lucide-react';


export default function PricingPage() {
  const pricingTiers = [
    {
      id: 'starter',
      tag: 'Free Tool',
      tagColor: 'bg-neutral-100 text-neutral-700',
      title: 'Market Intelligence',
      price: 'Free',
      pricePeriod: ' / Forever',
      features: [
        'Instant Landed Cost Simulation',
        'Regulatory Risk Check (FDA/CPSIA)',
        '30 AI Reports per month',
        'No credit card required'
      ],
      cta: {
        label: 'Start Free Analysis',
        href: '/chat',
        variant: 'outline' as const
      }
    },
    {
      id: 'validator',
      tag: 'Start with One Box',
      tagColor: 'bg-blue-100 text-blue-700',
      title: 'Verified Sourcing Plan',
      price: '$49',
      pricePeriod: ' / Refundable Deposit',
      features: [
        'Real Factory Quotes (48h)',
        'Sample Consolidation',
        '100% Credited to Your Order',
        'Dedicated Sourcing Expert assigned',
        'Supplier Background Check'
      ],
      cta: {
        label: 'Start Risk-Free Project',
        href: '/contact',
        variant: 'primary' as const
      },
      highlight: true // 가운데 카드를 highlight로 변경
    },
    {
      id: 'executor',
      tag: 'End-to-End Solution',
      tagColor: 'bg-emerald-100 text-emerald-700',
      title: 'End-to-End Execution',
      price: 'Flat 5%',
      pricePeriod: ' Service Fee',
      features: [
        'Production Management & QC',
        'Labeling & Packaging (Kitting)',
        'DDP Logistics Coordination',
        'Net-30 Payment Terms (Qualified)'
      ],
      cta: {
        label: 'Contact Sales',
        href: '/contact',
        variant: 'primary' as const
      },
      highlight: false
    }
  ];


  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section aria-label="Pricing Hero" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 mb-6">
            Simple Pricing, Zero Hidden Costs
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            From instant AI analysis to door-to-door delivery. Scale your sourcing without the guesswork.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section aria-label="Pricing Tiers" className="py-16 sm:py-20 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative p-8 bg-white border rounded-xl transition-all ${
                  tier.highlight
                    ? 'border-[#008080] border-2 shadow-2xl scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#008080] text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  {tier.id === 'validator' && (
                    <span className="inline-block text-xs text-gray-500 mb-4">
                      {tier.tag}
                    </span>
                  )}
                  {tier.id !== 'validator' && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4 ${tier.tagColor}`}>
                      {tier.tag}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    {tier.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-neutral-900">{tier.price}</span>
                    {tier.pricePeriod && (
                      <span className="text-base text-gray-600">{tier.pricePeriod}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-teal-600 font-semibold flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-sm text-neutral-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={tier.cta.href} className="block">
                  {tier.id === 'validator' ? (
                    <div>
                      <button
                        className="w-full rounded-full bg-[#008080] text-white hover:bg-[#006666] transition-colors px-6 py-3 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        {tier.cta.label}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Lock className="w-3 h-3" />
                        <span>SSL Secure Payment</span>
                        <Shield className="w-3 h-3 ml-2" />
                      </div>
                    </div>
                  ) : tier.highlight ? (
                    <button
                      className="w-full rounded-full bg-[#008080] text-white hover:bg-[#006666] transition-colors px-6 py-3 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {tier.cta.label}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      className="w-full rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors px-6 py-3 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {tier.cta.label}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Our Pricing Works Section */}
      <section aria-label="How Our Pricing Works" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-12 text-center">
            How Our Pricing Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto relative">
            <div className="text-center relative">
              <div className="w-12 h-12 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 relative z-10">
                1
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Place Deposit
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Confirm your seriousness with a $49 fully refundable deposit. This activates your dedicated team.
              </p>
              {/* Arrow to next step - desktop only */}
              <div className="hidden md:block absolute top-6 -right-4 z-0">
                <ArrowRight className="w-6 h-6 text-[#008080]" />
              </div>
            </div>
            <div className="text-center relative">
              <div className="w-12 h-12 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 relative z-10">
                2
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Receive Quotes
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We negotiate directly with verified manufacturers to secure the best FOB pricing and MOQ.
              </p>
              {/* Arrow to next step - desktop only */}
              <div className="hidden md:block absolute top-6 -right-4 z-0">
                <ArrowRight className="w-6 h-6 text-[#008080]" />
              </div>
            </div>
            <div className="text-center relative">
              <div className="w-12 h-12 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 relative z-10">
                3
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                100% Credit Back
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                When you place the production order, the <strong className="font-bold text-[#008080]">$49 is fully deducted</strong> from your invoice. You lose nothing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Promise Section */}
      <section aria-label="Service Promise" className="py-16 sm:py-20 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-12 text-center">
            Our Service Promise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Response Guarantee
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We guarantee a response within 24 business hours. No more ghosting factories.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Global Sync
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our local teams bridge the time zone gap, ensuring communication flows while you sleep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <section aria-label="Disclaimer" className="py-12 bg-white border-t border-neutral-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Service fees are based on FOB value. AI estimates are for reference only. Final pricing is confirmed upon retainer payment.
          </p>
        </div>
      </section>
    </div>
  );
}

