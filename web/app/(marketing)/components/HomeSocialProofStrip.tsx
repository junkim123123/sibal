'use client';

import { useLanguage } from '@/components/i18n/language-provider';

export default function HomeSocialProofStrip() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-gray-700">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center gap-6 md:gap-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white text-center">
            {t.home.socialProof.title}
          </h2>
          <div className="text-center">
            <div className="inline-block rounded-lg bg-neutral-50 dark:bg-neutral-800 p-4 md:p-6 shadow-sm text-center border border-neutral-200 dark:border-neutral-700">
              <p className="text-[10px] md:text-xs font-semibold text-neutral-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {t.home.socialProof.rating.badge}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">{t.home.socialProof.rating.value}</p>
              <p className="mt-1 text-xs md:text-sm text-neutral-600 dark:text-gray-300">
                {t.home.socialProof.rating.label}
              </p>
            </div>
            <p className="mt-4 text-sm md:text-base text-neutral-700 dark:text-gray-300 max-w-2xl mx-auto">
              {t.home.socialProof.summary}
            </p>
          </div>
        </div>
        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.home.socialProof.quotes.map((item, index) => (
            <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
              <blockquote className="text-center">
                <p className="text-sm md:text-base font-medium text-neutral-800 dark:text-gray-200 leading-relaxed mb-4">&ldquo;{item.quote}&rdquo;</p>
                <footer className="text-xs md:text-sm text-neutral-600 dark:text-gray-400">
                  <p className="font-medium text-neutral-900 dark:text-white">- {item.author}</p>
                  <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800">
                    Completed Project
                  </span>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}