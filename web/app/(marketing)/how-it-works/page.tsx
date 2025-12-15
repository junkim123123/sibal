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
        className="bg-neutral-50 py-2 md:py-4 -mt-2"
        titleClassName="text-sm md:text-base lg:text-lg font-semibold"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {journey.cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                id={`step-${idx + 1}`}
                className={`rounded-lg border p-3 shadow-sm h-full flex flex-col scroll-mt-24 ${
                  idx === 2 
                    ? 'bg-blue-50/80 border-2 border-blue-400' 
                    : 'bg-white border-neutral-200'
                }`}
              >
                {/* Step 3 Deposit badge */}
                {idx === 2 && (
                  <div className="mb-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white">
                      Deposit required
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold whitespace-nowrap ${
                        idx === 2 ? 'text-blue-700 bg-blue-100 px-2 py-0.5 rounded' : 'text-blue-600'
                      }`}>
                        Step {idx + 1}
                      </span>
                      {idx === 0 && <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">10 minutes</span>}
                      {idx === 1 && <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">1 business day</span>}
                      {idx === 2 && <span className="text-xs text-blue-700 font-medium whitespace-nowrap">7 days after deposit</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 leading-tight">
                      {card.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-normal mb-2 flex-1">
                  {card.body.split(/(\d+)/g).map((part, i) => {
                    const isNumber = /^\d+$/.test(part);
                    return isNumber ? (
                      <span key={i} className="font-bold text-neutral-900">{part}</span>
                    ) : (
                      <span key={i}>{part}</span>
                    );
                  })}
                </p>
                {card.deliverables && card.deliverables.length > 0 && (
                  <div className="mt-auto pt-1.5 border-t border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
                      Deliverables
                    </p>
                    <ul className="space-y-0.5">
                      {card.deliverables.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-neutral-600">
                          <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                          <span className="leading-snug">{item}</span>
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

      {/* Pricing Summary - Price table style */}
      <SectionLayout
        title={pricing.title}
        className="bg-neutral-50 py-10 md:py-14"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-6xl mx-auto">
          {/* Free */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-5xl font-bold text-neutral-900">$0</div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                1 business day
              </span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Free snapshot</h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-3">
              AI cost and risk snapshot
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 font-bold">•</span>
                <span>No subscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 font-bold">•</span>
                <span>No commitment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 font-bold">•</span>
                <span>No payment unless you proceed</span>
              </li>
            </ul>
          </div>

          {/* Deposit and Fee combined */}
          <div className="bg-white border-2 border-blue-300 rounded-lg p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-1">$49</div>
                <p className="text-xs text-neutral-600 font-medium">Deposit</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-neutral-900 mb-1">5%</div>
                <p className="text-xs text-neutral-600 font-medium">On FOB</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">When you proceed</h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-3">
              Deposit triggers factory outreach. Fee applies to FOB only.
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 font-bold">•</span>
                <span><span className="font-bold text-neutral-900">$49</span> non-refundable once outreach begins. Credited to your first order if you proceed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 font-bold">•</span>
                <span><span className="font-bold text-neutral-900">3</span> quotes in <span className="font-bold text-neutral-900">7 days</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 font-bold">•</span>
                <span>Pass through at cost for logistics and duties</span>
              </li>
            </ul>
          </div>
        </div>
      </SectionLayout>

      {/* FAQ Section */}
      <SectionLayout
        title={faq.title}
        className="bg-white py-10 md:py-14"
      >
        <div className="max-w-3xl mx-auto">
          <Accordion>
            {faq.items.map((faqItem, idx) => (
              <AccordionItem
                key={idx}
                question={faqItem.question}
                answer={faqItem.answer}
                defaultOpen={idx === 0}
              />
            ))}
          </Accordion>
        </div>
      </SectionLayout>

      {/* Final CTA Banner */}
      <section aria-label="Call to action" className="py-12 md:py-16 bg-neutral-900 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4">
              {cta.title}
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-neutral-300 mb-6 max-w-2xl mx-auto">
              {cta.description}
            </p>
            <Link href="/chat" className="inline-block w-full sm:w-auto mb-6">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto border border-blue-500"
              >
                Get free snapshot
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700">
                Credited to first order
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700">
                5% on FOB only
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
