'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';

export default function HowItWorksHero() {
  const { hero } = howItWorksPageConfig;

  return (
    <section aria-label="Hero" className="py-4 md:py-5 bg-white relative overflow-hidden mb-0">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 lg:items-center">
          {/* Left: Copy and CTA - 5 columns */}
          <div className="lg:col-span-5 text-center order-2 lg:order-1 lg:self-center">
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-2">
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
            <p className="text-xs text-neutral-500 text-center mb-3">
              Usually ready in minutes. Up to 1 hour during peak times.
            </p>
            
            {/* 5. Trust bar - Small badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Refundable <span className="font-bold">$49</span> deposit
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Pass through at cost
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <span className="font-bold">5</span>% on FOB only
              </span>
            </div>
          </div>

          {/* Right: Sample report preview - 7 columns (Compact) */}
          <div className="lg:col-span-7 order-1 lg:order-2 lg:self-center">
            <div className="bg-white border border-neutral-200 rounded-lg p-5 md:p-6 shadow-sm max-w-lg mx-auto lg:mx-0">
              {/* Header - Minimal */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Sample report preview
                  </h3>
                  <span className="text-xs text-neutral-400">Example</span>
                </div>
                <div className="h-px bg-neutral-200"></div>
              </div>
              
              {/* Core numbers block */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Estimated landed cost range</div>
                <div className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">
                  $<span className="font-bold">1.85</span> to $<span className="font-bold">2.35</span>
                </div>
                <div className="text-sm text-neutral-600">per unit, DDP</div>
              </div>
              
              {/* Risk flags */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Early risk flags</div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    AD risk check
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Compliance review
                  </span>
                </div>
              </div>
              
              {/* Optional ghost link */}
              <div className="pt-3 border-t border-neutral-200">
                <Link href="/chat" className="inline-block w-full text-center">
                  <span className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    View full sample report
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

