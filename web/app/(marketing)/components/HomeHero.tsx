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
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-gray-900 relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Text Content */}
          <div className="flex flex-col space-y-5 min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50">
                Predictable sourcing for modern brands
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
              Stop guessing.{' '}
              <span className="text-blue-600 dark:text-blue-400">Start sourcing with confidence.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              See landed cost, duty exposure, and compliance flags before you commit to inventory.
            </p>

            {/* Bullets */}
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm md:text-base text-neutral-700 dark:text-neutral-300">
                <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                <span>AI cost and risk snapshot in 1 business day</span>
              </li>
              <li className="flex items-start gap-2 text-sm md:text-base text-neutral-700 dark:text-neutral-300">
                <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                <span>Unlock a dedicated manager with a $49 deposit</span>
              </li>
              <li className="flex items-start gap-2 text-sm md:text-base text-neutral-700 dark:text-neutral-300">
                <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                <span>3 real factory quotes within 7 days</span>
              </li>
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-2">
              <Button
                onClick={handleStartAnalysis}
                className="inline-flex items-center justify-center gap-2 group bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                Get free snapshot
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link
                href="/chat"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center sm:text-left"
              >
                Talk to a manager
              </Link>
            </div>
            {/* Deposit microcopy */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              The $49 deposit is credited to your first order and refundable if you do not proceed.
            </p>
          </div>

          {/* Right: Report Preview Card */}
          <div className="relative w-full mt-8 lg:mt-0 z-20">
            <div className="relative">
              {/* Subtle background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-neutral-50/30 rounded-lg -z-10 pointer-events-none" />
              <ReportPreviewCard />
            </div>
          </div>
        </div>

        {/* 3 Step Micro Section */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">1 business day</div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">AI snapshot, cost and risk</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">3 quotes</div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Factory quotes from three options in 7 days</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">5% fee</div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Transparent management fee on FOB only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}