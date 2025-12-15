'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';

export default function HowItWorksHero() {
  const { hero } = howItWorksPageConfig;

  return (
    <section aria-label="Hero" className="w-full pt-4 md:pt-5 pb-3 md:pb-4 bg-white relative overflow-hidden mb-0">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Copy and CTA */}
          <div className="text-left order-2 lg:order-1">
            {/* 1. Kicker */}
            <div className="mb-2">
              <span className="text-xs font-semibold text-blue-700">
                How it works
              </span>
            </div>
            
            {/* 2. Headline */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight mb-3">
              {hero.title}
            </h1>
            
            {/* 3. Subcopy */}
            <p className="text-sm md:text-base text-neutral-700 font-medium mb-4 leading-relaxed">
              {hero.subtitle}
            </p>
            
            {/* 4. CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start mb-2">
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
            
            {/* CTA Helper Text */}
            <p className="text-xs text-neutral-500 mb-3">
              {hero.cta.helperText}
            </p>
            
            {/* 5. Trust bar - Small badges */}
            <div className="mt-4 flex flex-wrap justify-start gap-2">
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                $49 deposit
              </span>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                Pass through at cost
              </span>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                5% on FOB only
              </span>
            </div>
          </div>

          {/* Right: Sample report preview */}
          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm w-full max-w-none">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold tracking-wide text-neutral-900 uppercase">
                  SAMPLE REPORT PREVIEW
                </div>
                <div className="text-xs text-neutral-400">Example</div>
              </div>

              {/* Core numbers block */}
              <div className="mt-4 text-xs font-medium text-neutral-500 uppercase">ESTIMATED LANDED COST RANGE</div>
              <div className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">
                $1.85 to $2.35
              </div>
              <div className="mt-1 text-sm text-neutral-500">per unit, DDP</div>

              {/* Risk flags */}
              <div className="mt-4 text-xs font-medium text-neutral-500 uppercase">EARLY RISK FLAGS</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                  AD risk check
                </span>
                <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  Compliance review
                </span>
              </div>

              {/* Link */}
              <div className="mt-4 border-t border-neutral-200 pt-3 text-center">
                <Link href="/chat" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View full sample report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

