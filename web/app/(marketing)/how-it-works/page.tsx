// How It Works Page - Config-driven
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { MessageSquare, FileText, Package } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { SectionLayout } from '@/components/marketing/SectionLayout';

export const revalidate = 60;

export default async function HowItWorksPage() {
  const { hero, journey, steps, pricing, faq, cta } = howItWorksPageConfig;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section aria-label="Hero" className="py-10 md:py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Text Content */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl lg:text-[52px] font-semibold tracking-tight text-neutral-900 leading-tight mb-4 md:mb-6">
                {hero.title}
              </h1>
              <p className="text-sm md:text-lg lg:text-xl text-neutral-700 font-medium mb-3 leading-relaxed">
                {hero.subtitle}
              </p>
              <p className="text-xs md:text-sm text-neutral-500 mb-4">
                {hero.note}
              </p>
              <p className="text-sm md:text-base text-neutral-600 mb-6 md:mb-8 leading-relaxed">
                {hero.description}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
                <Link href={hero.cta.primary.href} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto"
                  >
                    {hero.cta.primary.label}
                  </Button>
                </Link>
                <Link
                  href={hero.cta.secondary.href}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors text-center sm:text-left"
                >
                  {hero.cta.secondary.label}
                </Link>
              </div>
            </div>

            {/* Right: Visual Collage */}
            <div className="relative">
              {/* Top Card - Project Chat */}
              <div className="relative z-10 bg-white rounded-3xl p-6 shadow-lg border border-neutral-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Project chat
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-600">
                      &quot;I want to import snack products to the US...&quot;
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-600">
                      &quot;Target market: Amazon FBA, test run volume...&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Left Card - DDP Snapshot (overlapping) */}
              <div className="absolute -bottom-4 -left-4 z-20 bg-white rounded-2xl p-4 shadow-md border border-neutral-200 w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-neutral-600" />
                  <span className="text-xs font-semibold text-neutral-700">
                    DDP and risk snapshot
                  </span>
                </div>
                <div className="text-xs text-neutral-600 space-y-1">
                  <p>• Estimated: $2.10/unit</p>
                  <p>• Risk: Low</p>
                </div>
              </div>

              {/* Bottom Right Card - Pilot Order (overlapping) */}
              <div className="absolute -bottom-4 right-4 z-20 bg-white rounded-2xl p-4 shadow-md border border-neutral-200 w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-neutral-600" />
                  <span className="text-xs font-semibold text-neutral-700">
                    Pilot order checklist
                  </span>
                </div>
                <div className="text-xs text-neutral-600 space-y-1">
                  <p>• QC plan ready</p>
                  <p>• Logistics aligned</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey in Three Moves */}
      <SectionLayout
        title={journey.title}
        subtitle={journey.subtitle}
        className="bg-neutral-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {journey.cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <MarketingCard key={idx}>
                <div className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-neutral-600" />
                    </div>
                    <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </MarketingCard>
            );
          })}
        </div>
      </SectionLayout>

      {/* Step by Step Timeline */}
      <SectionLayout
        title={steps.title}
        className="bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8 md:space-y-12 lg:space-y-16">
            {steps.items.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.stepNumber} className="flex gap-4 md:gap-6">
                  {/* Left: Icon and Number */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xl md:text-2xl">
                        {step.stepNumber}
                      </div>
                      <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-neutral-100 rounded-full p-1.5 md:p-2">
                        <Icon className="h-4 w-4 md:h-5 md:w-5 text-neutral-900" />
                      </div>
                    </div>
                    {/* Vertical line (except last) */}
                    {index < steps.items.length - 1 && (
                      <div className="w-0.5 h-full bg-neutral-200 ml-6 md:ml-8 mt-4" style={{ height: 'calc(100% + 2rem)' }}></div>
                    )}
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 pb-8 md:pb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 md:mb-4">
                      <h3 className="text-xl md:text-2xl font-bold text-neutral-900">
                        {step.title}
                      </h3>
                      {step.timeEstimate && (
                        <span className="text-xs md:text-sm text-neutral-500">
                          {step.timeEstimate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm md:text-base lg:text-lg text-neutral-600 mb-4 md:mb-6 leading-relaxed">
                      {step.body}
                    </p>
                    {step.bullets && step.bullets.length > 0 && (
                      <ul className="space-y-2 md:space-y-3">
                        {step.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 md:gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 md:mt-2.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm lg:text-base text-neutral-600 leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionLayout>

      {/* Pricing and Coverage Band */}
      <SectionLayout
        title={pricing.title}
        className="bg-neutral-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {pricing.cards.map((card, idx) => (
            <MarketingCard key={idx}>
              <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4 md:mb-6">{card.title}</h3>
                <ul className="space-y-3 md:space-y-4">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 md:gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 md:mt-2.5 flex-shrink-0" />
                      <span className="text-sm md:text-base text-neutral-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </MarketingCard>
          ))}
        </div>
      </SectionLayout>

      {/* FAQ Section */}
      <SectionLayout
        title={faq.title}
        className="bg-white"
      >
        <div className="max-w-3xl mx-auto">
          <Accordion>
            {faq.items.map((faqItem, idx) => (
              <AccordionItem
                key={idx}
                question={faqItem.question}
                answer={faqItem.answer}
              />
            ))}
          </Accordion>
        </div>
      </SectionLayout>

      {/* Final CTA Banner */}
      <section aria-label="Call to action" className="py-10 md:py-16 bg-neutral-100">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-900 mb-4">
              {cta.title}
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-neutral-600 mb-6 md:mb-8 max-w-2xl mx-auto">
              {cta.description}
            </p>
            <Link href={cta.buttonHref} className="inline-block w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto"
              >
                {cta.buttonLabel}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
