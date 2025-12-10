'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


export default function PricingPage() {
  const pricingTiers = [
    {
      id: 'starter',
      tag: 'Free Tool',
      tagColor: 'bg-neutral-100 text-neutral-700',
      title: 'Starter (AI Scout)',
      price: '$0',
      pricePeriod: '/ mo',
      features: [
        'Real-Time Cost & Risk Analysis',
        '30 Reports/month',
        'Platform-neutral insights',
        'Basic supplier database access'
      ],
      cta: {
        label: 'Start Analysis',
        href: '/chat',
        variant: 'outline' as const
      }
    },
    {
      id: 'validator',
      tag: 'Start with One Box',
      tagColor: 'bg-blue-100 text-blue-700',
      title: 'Official Quote Request',
      price: '$49',
      pricePeriod: ' (One-time Fee)',
      features: [
        'Real Factory Quotes (48h)',
        'Supplier Vetting',
        '100% Credited on First Order',
        'Priority support',
        'Dedicated Sourcing Agent'
      ],
      cta: {
        label: 'Pay $49 & Start Project',
        href: '/contact',
        variant: 'primary' as const
      },
      highlight: false
    },
    {
      id: 'executor',
      tag: 'End-to-End Solution',
      tagColor: 'bg-emerald-100 text-emerald-700',
      title: 'Full Service Execution',
      price: 'Starts at 5%',
      pricePeriod: ' Commission',
      features: [
        'QC & Logistics',
        'Dedicated Manager',
        'Global Sync Time',
        '24-hour response (Mon-Fri)'
      ],
      cta: {
        label: 'Get Started',
        href: '/contact',
        variant: 'primary' as const
      },
      highlight: true
    }
  ];


  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section aria-label="Pricing Hero" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 mb-6">
            NexSupply Model 4.0
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Choose the right plan for your sourcing journey. From free AI analysis to full-service execution.
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
                    ? 'border-gray-300 shadow-xl'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-semibold">
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
                    <button
                      className="w-full rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors px-6 py-3 text-sm font-medium"
                    >
                      {tier.cta.label}
                    </button>
                  ) : tier.highlight ? (
                    <button
                      className="w-full rounded-full bg-[#008080] text-white hover:bg-[#006666] transition-colors px-6 py-3 text-sm font-medium"
                    >
                      {tier.cta.label} →
                    </button>
                  ) : (
                    <button
                      className="w-full rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors px-6 py-3 text-sm font-medium"
                    >
                      {tier.cta.label} →
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Start with $49
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This fee confirms your commitment and activates your dedicated agent.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Get Quotes
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your agent works to get you the best price from verified factories.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                The Refund
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                When you place your order, the <strong className="font-bold text-[#008080]">$49 is fully deducted</strong> from your final 5% commission. You only pay the commission once the order is placed.
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
                24-Hour Response
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We reply within 24 hours (Mon-Fri). Your questions and requests are our priority.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Global Sync Time
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dedicated communication slot aligned with factory hours. No time zone confusion.
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

