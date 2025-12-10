'use client';

import { homePageConfig } from '@/lib/content/homePage';
import { useLanguage } from '@/components/i18n/language-provider';

export default function HomeUseCases() {
  const { useCases } = homePageConfig;
  const { t } = useLanguage();

  return (
    <section id="home-use-cases" className="py-10 md:py-16 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-6 md:mb-8 text-center">
          {t.home.useCases.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {t.home.useCases.cards.map((useCase, index) => (
            <div
              key={index}
              className="bg-transparent border border-neutral-200 dark:border-neutral-700 shadow-sm rounded-xl p-6 md:p-8 lg:p-10 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-300"
            >
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900 dark:text-white">
                {useCase.title}
              </h3>
              <p 
                className="mt-4 text-sm md:text-base text-[#444] dark:text-neutral-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: useCase.body }}
              />
              {useCase.target && (
                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 italic">
                  {useCase.target}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}