'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';

export default function HowItWorksHero() {
  const { hero } = howItWorksPageConfig;

  return (
    <section aria-label="Hero" className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight mb-4">
            {hero.title}
          </h1>
          <p className="text-base md:text-lg text-neutral-700 font-medium mb-6 leading-relaxed">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
            <Link href={hero.cta.primary.href} className="w-full sm:w-auto">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto">
                {hero.cta.primary.label}
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
          {/* Immediate rewards badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              Free snapshot
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              1 business day
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-50 text-neutral-700 border border-neutral-200">
              No credit card
            </span>
          </div>
          {hero.cta.helperText && (
            <p className="text-xs text-neutral-500">
              {hero.cta.helperText}
            </p>
          )}
        </div>
        
        {/* Trust bar */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900">Refundable deposit</span>
            </span>
            <span className="text-neutral-400">•</span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900">Pass through at cost</span>
            </span>
            <span className="text-neutral-400">•</span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900">5% on FOB only</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

