// How It Works Page - Config-driven
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { MessageSquare, FileText, Package } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { SectionLayout } from '@/components/marketing/SectionLayout';
import { HeroSection } from '@/app/(marketing)/components/HeroSection';

export const revalidate = 60;

export default async function HowItWorksPage() {
  const { hero, journey, steps, pricing, faq, cta } = howItWorksPageConfig;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection
        title={hero.title}
        chips={hero.chips}
        valueStatement={hero.subtitle}
        description={hero.description}
        cta={{
          primary: hero.cta.primary,
          secondary: hero.cta.secondary,
          helperText: hero.cta.helperText,
        }}
        showPreviewCard={true}
      />

      {/* Journey in Three Moves */}
      <SectionLayout
        title={journey.title}
        subtitle={journey.subtitle}
        className="bg-neutral-50 py-16 md:py-20 lg:py-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {journey.cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm h-full flex flex-col"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4 flex-1">
                  {card.body}
                </p>
                {card.deliverables && card.deliverables.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      Deliverables
                    </p>
                    <ul className="space-y-1.5">
                      {card.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionLayout>

      {/* Step by Step Timeline */}
      <SectionLayout
        title={steps.title}
        className="bg-white py-16 md:py-20 lg:py-24"
      >
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8 md:space-y-12 lg:space-y-16">
            {steps.items.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.stepNumber} className="flex gap-4 md:gap-6">
                  {/* Left: Number Bubble */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl md:text-2xl">
                        {step.stepNumber}
                      </div>
                    </div>
                    {/* Vertical line (except last) */}
                    {index < steps.items.length - 1 && (
                      <div className="border-l-2 border-gray-200 ml-6 md:ml-8 mt-4" style={{ height: 'calc(100% + 2rem)' }}></div>
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
                    <p className="text-sm md:text-base lg:text-lg text-neutral-600 mb-6 md:mb-8 leading-relaxed">
                      {step.body}
                    </p>
                    {step.deliverables && step.deliverables.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">
                          Deliverables
                        </p>
                        <ul className="space-y-1.5">
                          {step.deliverables.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {step.bullets && step.bullets.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {step.bullets.map((bullet, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="text-neutral-400 mt-1.5">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </div>
                        ))}
                      </div>
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
        className="bg-neutral-50 py-16 md:py-20 lg:py-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {pricing.cards.map((card, idx) => (
            <div
              key={idx}
              className="border border-neutral-200 rounded-lg p-6 md:p-8 hover:border-blue-300 transition-colors duration-300 bg-white shadow-sm"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-6">{card.title}</h3>
              <ul className="space-y-4">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionLayout>

      {/* FAQ Section */}
      <SectionLayout
        title={faq.title}
        className="bg-white py-16 md:py-20 lg:py-24"
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
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto"
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
