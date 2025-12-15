'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';

export default function HomeImpactBand() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-neutral-900 dark:bg-gray-800 text-white border-t border-blue-600/20 relative">
      {/* Gradient transition to footer */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white dark:to-neutral-900 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {t.home.cta.title}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-neutral-300 dark:text-neutral-400 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.home.cta.description}
          </p>
          <Link 
            href="/chat" 
            className="inline-block w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-3.5 text-base rounded-xl border border-blue-500 mb-3 shadow-sm hover:shadow-md"
          >
            Calculate landed cost and risk
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
            $49 deposit refundable, credited to first order
          </p>
          {t.home.cta.disclaimer && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-2xl mx-auto">
              {t.home.cta.disclaimer}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}