'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/i18n/language-provider';

export default function HomeImpactBand() {
  const { t } = useLanguage();

  return (
    <section className="py-10 md:py-16 bg-neutral-900 dark:bg-gray-800 text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {t.home.cta.title}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-neutral-300 dark:text-neutral-400 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.home.cta.description}
          </p>
          <Link 
            href="/chat" 
            className="inline-block w-full sm:w-auto inline-flex items-center justify-center font-semibold transition-all bg-white text-neutral-900 hover:bg-neutral-100 px-6 md:px-8 py-3 md:py-3.5 text-base rounded-full"
          >
            {t.home.cta.buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}