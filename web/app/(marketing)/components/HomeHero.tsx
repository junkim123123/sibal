'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, FileText, Users } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';
import { ReportPreviewCard } from './ReportPreviewCard';

type Props = {
  page: any | null;
};

export default function HomeHero({ page }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleStartAnalysis = () => {
    router.push('/chat');
  };

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center justify-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50">
                {t.home.hero.badge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
              {t.home.hero.title}{' '}
              <span className="text-neutral-950 dark:text-white font-extrabold">{t.home.hero.titleHighlight}</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              {t.home.hero.subtitle.split(t.home.hero.subtitleHighlight1)[0]}
              <span className="font-semibold text-neutral-900 dark:text-white">{t.home.hero.subtitleHighlight1}</span>
              {t.home.hero.subtitle.split(t.home.hero.subtitleHighlight1)[1]?.split(t.home.hero.subtitleHighlight2)[0]}
              <span className="font-semibold text-neutral-900 dark:text-white">{t.home.hero.subtitleHighlight2}</span>
              {t.home.hero.subtitle.split(t.home.hero.subtitleHighlight2)[1]?.split(t.home.hero.subtitleHighlight3)[0]}
              <span className="font-semibold text-neutral-900 dark:text-white">{t.home.hero.subtitleHighlight3}</span>
              {t.home.hero.subtitle.split(t.home.hero.subtitleHighlight3)[1]}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
              <Button
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-2 group bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {t.home.hero.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => router.push('/chat')}
                variant="outline"
                className="inline-flex items-center gap-2 group border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {t.home.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          {/* Right: Report Preview Card */}
          <div className="relative w-full mt-8 lg:mt-0">
            <ReportPreviewCard />
          </div>
        </div>

        {/* 3 Step Micro Section */}
        <div className="mt-16 pt-16 border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                AI Cost and Risk Snapshot
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Within 1 business day
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Deposit to Unlock Manager
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Real factory quotes within 7 days
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Execute
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                5% service fee, packaging and labeling quoted separately
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}