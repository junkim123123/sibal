'use client';

import { homePageConfig } from '@/lib/content/homePage';
import { useLanguage } from '@/components/i18n/language-provider';

export default function HomeBenefitsGrid() {
  const { benefits } = homePageConfig;
  const { t } = useLanguage();

  return (
    <section className="py-10 md:py-16 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.home.benefits.title}
          </h2>
        </div>
        <div className="mt-8 md:mt-12 space-y-10 md:space-y-12">
          {t.home.benefits.pillars.map((pillar, pillarIndex) => (
            <div key={pillarIndex}>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-6 text-center">
                {pillar.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
                {pillar.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-3">
                    <h4 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}