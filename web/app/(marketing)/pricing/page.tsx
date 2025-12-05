'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Sparkles, Rocket, ChevronDown } from 'lucide-react';

type ModuleData = {
  title: string;
  commission: string;
  focus: string;
  ideal: string;
  details: string[];
};

function ModuleCard({ moduleKey, moduleData }: { moduleKey: string; moduleData: ModuleData }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
      >
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">{moduleData.title}</h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              moduleKey === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {moduleData.commission} Commission
            </span>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-neutral-500 flex-shrink-0 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-neutral-200">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 mb-2">
                <strong className="text-neutral-900">Focus:</strong> {moduleData.focus}
              </p>
              <p className="text-sm text-neutral-600">
                <strong className="text-neutral-900">Ideal for:</strong> {moduleData.ideal}
              </p>
            </div>
            <ul className="space-y-2">
              {moduleData.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 flex-shrink-0" />
                  <span className="text-sm text-neutral-600 leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

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
      title: 'Validator (Entry)',
      price: '$199',
      pricePeriod: ' (Retainer)',
      features: [
        'Get Verified Quote',
        'Supplier Vetting',
        '100% Credited on Order ($5k+)',
        'Priority support',
        'Dedicated quote specialist'
      ],
      cta: {
        label: 'Request Quote',
        href: '/contact',
        variant: 'primary' as const
      },
      highlight: false
    },
    {
      id: 'executor',
      tag: 'End-to-End Solution',
      tagColor: 'bg-emerald-100 text-emerald-700',
      title: 'Executor (Full Service)',
      price: '3% - 9%',
      pricePeriod: ' Commission',
      features: [
        'Module A or B Selection',
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
      highlight: true,
      note: 'Min. service fee $500 applies.'
    }
  ];

  const modules = {
    A: {
      title: 'Module A: Sourcing & Logistics',
      commission: '3-5%',
      focus: 'Sourcing, Repacking, FNSKU Labeling, DDP Shipping',
      ideal: 'Ideal for Amazon FBA',
      details: [
        'Product sourcing from verified suppliers',
        'Quality control & inspection',
        'Repacking & custom packaging',
        'FNSKU labeling for Amazon',
        'DDP shipping coordination',
        'Port-to-door logistics management'
      ]
    },
    B: {
      title: 'Module B: Product Development',
      commission: '5-9%',
      focus: 'OEM/ODM, Production Monitoring, Certification (FDA/CE), Factory Audit',
      ideal: 'Ideal for DTC Brands',
      details: [
        'OEM/ODM product development',
        'Production monitoring & QC',
        'FDA/CE certification support',
        'Factory audit & verification',
        'Custom design & engineering',
        'Prototype development'
      ]
    }
  };

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
                className={`relative p-6 sm:p-8 bg-white border-2 rounded-2xl transition-all ${
                  tier.highlight
                    ? 'border-neutral-900 shadow-lg scale-105'
                    : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-neutral-900 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4 ${tier.tagColor}`}>
                    {tier.tag}
                  </span>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    {tier.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-neutral-900">{tier.price}</span>
                    <span className="text-lg text-neutral-600">{tier.pricePeriod}</span>
                  </div>
                  {tier.note && (
                    <p className="text-xs text-neutral-500 mt-2">{tier.note}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={tier.cta.href} className="block">
                  <Button
                    variant={tier.cta.variant}
                    size="lg"
                    className="w-full rounded-full"
                  >
                    {tier.cta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Module Details Section */}
      <section aria-label="Module Details" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-4">
              Executor Service Modules
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Choose Module A for logistics-focused sourcing or Module B for product development. Commission rates vary by complexity.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(modules).map(([key, module]) => (
              <ModuleCard key={key} moduleKey={key} moduleData={module} />
            ))}
          </div>
        </div>
      </section>

      {/* Service Promise Section */}
      <section aria-label="Service Promise" className="py-16 sm:py-20 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-10 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-8 text-center">
              Our Service Promise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    24-Hour Response
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    We reply within 24 hours (Mon-Fri). Your questions and requests are our priority.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Global Sync Time
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Dedicated communication slot aligned with factory hours. No time zone confusion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <section aria-label="Disclaimer" className="py-12 bg-white border-t border-neutral-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-neutral-500 text-center leading-relaxed">
            Service fees are based on FOB value. AI estimates are for reference only. Final pricing is confirmed upon retainer payment.
          </p>
        </div>
      </section>
    </div>
  );
}

