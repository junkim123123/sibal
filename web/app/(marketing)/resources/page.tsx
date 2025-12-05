// Resources Page - Config-driven structure
// All content is managed through resourcePageConfig in lib/content/resources.ts

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { resourcePageConfig } from '@/lib/content/resources';

export const revalidate = 60;

export default function ResourcesPage() {
  const { hero, startHere, deepDive, faq } = resourcePageConfig;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section aria-label="Hero" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 mb-6">
            {hero.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* Start here section */}
      <section aria-label="Start here" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-8">
            {startHere.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {startHere.cards.map((card) => (
              <Link
                key={card.id}
                href={card.cta?.href || '#'}
                className="block p-6 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all bg-white"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                  {card.description}
                </p>
                {card.cta && (
                  <span className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors inline-flex items-center">
                    {card.cta.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deep dive examples section */}
      <section aria-label="Deep dive examples" className="py-16 sm:py-20 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
              {deepDive.title}
            </h2>
            {deepDive.subtitle && (
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
                {deepDive.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {deepDive.cards.map((card) => (
              <Card key={card.id} className="p-6 bg-white border-neutral-200 shadow-sm rounded-2xl">
                {card.tag && (
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 mb-4">
                    {card.tag}
                  </span>
                )}
                <h3 className="text-base font-semibold text-neutral-900 mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                  {card.description}
                </p>
                {card.badge && (
                  <span className="text-xs text-neutral-500">{card.badge}</span>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section id="faq" aria-label="Frequently asked questions" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
              {faq.title}
            </h2>
            {faq.subtitle && (
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
                {faq.subtitle}
              </p>
            )}
          </div>
          <Accordion>
            {faq.items.map((item, index) => (
              <AccordionItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                defaultOpen={index === 0}
              />
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
