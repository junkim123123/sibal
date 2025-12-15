// How It Works Page - Config-driven
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { MessageSquare, FileText, Package, ArrowRight } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { SectionLayout } from '@/components/marketing/SectionLayout';
import HowItWorksHero from '@/app/(marketing)/components/HowItWorksHero';

export const revalidate = 60;

export default async function HowItWorksPage() {
  const { hero, journey, steps, pricing, faq, cta } = howItWorksPageConfig;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HowItWorksHero />

      {/* Journey in Three Moves */}
      <SectionLayout
        title={journey.title}
        subtitle={journey.subtitle}
        className="bg-neutral-50 py-12 md:py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {journey.cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-lg border p-6 shadow-sm h-full flex flex-col ${
                  idx === 2 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-600">Step {idx + 1}</span>
                      {idx === 0 && <span className="text-xs text-neutral-500">10 minutes</span>}
                      {idx === 1 && <span className="text-xs text-neutral-500">1 business day</span>}
                      {idx === 2 && <span className="text-xs text-neutral-500">7 days after deposit</span>}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {card.title}
                    </h3>
                  </div>
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
        
        {/* Mini CTA after steps */}
        <div className="mt-8 text-center">
          <Link href="/chat" className="inline-block">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 text-sm font-medium">
              Get free snapshot
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </SectionLayout>

      {/* Pricing Summary */}
      <SectionLayout
        title={pricing.title}
        className="bg-neutral-50 py-12 md:py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {pricing.cards.map((card, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-6 md:p-8 hover:border-blue-300 transition-colors duration-300 shadow-sm ${
                idx === 0 
                  ? 'bg-white border-neutral-200' 
                  : 'bg-blue-50/30 border-blue-200'
              }`}
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-6">{card.title}</h3>
              <ul className="space-y-4">
                {card.items.map((item, i) => {
                  // Extract numbers and make them bold
                  const numberPattern = /(\$?\d+%?|\d+\s+(?:day|month|percent|business day|days))/gi;
                  const parts = item.split(numberPattern);
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 flex-shrink-0" />
                      <span className="text-sm md:text-base text-neutral-600 leading-relaxed">
                        {parts.map((part, partIdx) => {
                          const isNumber = numberPattern.test(part);
                          return isNumber ? (
                            <span key={partIdx} className="font-bold text-neutral-900">{part}</span>
                          ) : (
                            <span key={partIdx}>{part}</span>
                          );
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </SectionLayout>

      {/* FAQ Section */}
      <SectionLayout
        title={faq.title}
        className="bg-white py-12 md:py-16"
      >
        <div className="max-w-3xl mx-auto">
          <Accordion>
            {faq.items.map((faqItem, idx) => (
              <AccordionItem
                key={idx}
                question={faqItem.question}
                answer={faqItem.answer}
                defaultOpen={faqItem.question.includes('shipping and customs')}
              />
            ))}
          </Accordion>
        </div>
      </SectionLayout>

      {/* Final CTA Banner */}
      <section aria-label="Call to action" className="py-16 md:py-24 bg-neutral-100">
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
