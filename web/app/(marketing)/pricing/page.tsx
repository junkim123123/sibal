'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/i18n/language-provider';
import { ArrowRight, Lock, Shield } from 'lucide-react';


export default function PricingPage() {
  const { t } = useLanguage();
  
  const pricingTiers = [
    {
      id: 'starter',
      tag: t.pricing.tiers.starter.tag,
      tagColor: 'bg-neutral-100 dark:bg-gray-800 text-neutral-700 dark:text-gray-300',
      title: t.pricing.tiers.starter.title,
      price: t.pricing.tiers.starter.price,
      pricePeriod: t.pricing.tiers.starter.pricePeriod,
      features: t.pricing.tiers.starter.features,
      cta: {
        label: t.pricing.tiers.starter.cta,
        href: '/chat',
        variant: 'outline' as const
      }
    },
    {
      id: 'validator',
      tag: t.pricing.tiers.validator.tag,
      tagColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      title: t.pricing.tiers.validator.title,
      price: t.pricing.tiers.validator.price,
      pricePeriod: t.pricing.tiers.validator.pricePeriod,
      features: t.pricing.tiers.validator.features,
      cta: {
        label: t.pricing.tiers.validator.cta,
        href: '/contact',
        variant: 'primary' as const
      },
      highlight: true
    },
    {
      id: 'executor',
      tag: t.pricing.tiers.executor.tag,
      tagColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      title: t.pricing.tiers.executor.title,
      price: t.pricing.tiers.executor.price,
      pricePeriod: t.pricing.tiers.executor.pricePeriod,
      features: t.pricing.tiers.executor.features,
      cta: {
        label: t.pricing.tiers.executor.cta,
        href: '/contact',
        variant: 'primary' as const
      },
      highlight: false
    }
  ];


  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section aria-label="Pricing Hero" className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-6">
            {t.pricing.hero.title}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t.pricing.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section aria-label="Pricing Tiers" className="py-16 sm:py-20 bg-neutral-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative p-8 bg-white dark:bg-gray-700 border rounded-xl transition-all ${
                  tier.highlight
                    ? 'border-[#008080] border-2 shadow-2xl scale-105'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#008080] text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {t.pricing.mostPopular}
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
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                    {tier.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">{tier.price}</span>
                    {tier.pricePeriod && (
                      <span className="text-base text-gray-600 dark:text-gray-400">{tier.pricePeriod}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-teal-600 dark:text-teal-400 font-semibold flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-sm text-neutral-600 dark:text-gray-300 leading-relaxed">{feature}</span>
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
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Lock className="w-3 h-3" />
                        <span>{t.pricing.sslSecure}</span>
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
      <section aria-label="How Our Pricing Works" className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white mb-12 text-center">
            {t.pricing.howItWorks.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto relative">
            {t.pricing.howItWorks.steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-12 h-12 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 relative z-10">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
                {/* Arrow to next step - desktop only */}
                {index < t.pricing.howItWorks.steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 -right-4 z-0">
                    <ArrowRight className="w-6 h-6 text-[#008080]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Promise Section */}
      <section aria-label="Service Promise" className="py-16 sm:py-20 bg-neutral-50 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white mb-12 text-center">
            Our Service Promise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-8">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                {t.pricing.guarantee.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {t.pricing.guarantee.description}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-8">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                {t.pricing.globalSync.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {t.pricing.globalSync.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <section aria-label="Disclaimer" className="py-12 bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
            {t.pricing.disclaimer}
          </p>
        </div>
      </section>
    </div>
  );
}

