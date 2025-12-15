'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';
import { ReportPreviewCard } from './ReportPreviewCard';

export default function HowItWorksHero() {
  const { hero } = howItWorksPageConfig;

  return (
    <section aria-label="Hero" className="py-6 md:py-8 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left: Copy and CTA */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight mb-3">
              {hero.title}
            </h1>
            <p className="text-base md:text-lg text-neutral-700 font-medium mb-5 leading-relaxed">
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-3">
              <Link href={hero.cta.primary.href} className="w-full sm:w-auto">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto">
                  Get free snapshot
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href={hero.cta.secondary.href} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto"
                >
                  {hero.cta.secondary.label}
                </Button>
              </Link>
            </div>
            
            {/* Immediate rewards badges - CTA 바로 아래 */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                Free snapshot
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                1 business day
              </span>
            </div>
            
            {/* Trust bar with background - 배지 아래 */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-neutral-900">Refundable $49 deposit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-neutral-900">Pass through at cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-neutral-900">5% on FOB only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sample report preview */}
          <div className="lg:pl-4 order-1 lg:order-2">
            <ReportPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}

