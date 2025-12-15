'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';

export default function HowItWorksHero() {
  const { hero } = howItWorksPageConfig;

  return (
    <section aria-label="Hero" className="py-4 md:py-5 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Copy and CTA - 5 columns */}
          <div className="lg:col-span-5 text-center lg:text-left order-2 lg:order-1">
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-4">
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
            
            {/* 5. Mini Stepper - 3 steps in one line */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-center">
                <div className="text-xs font-semibold text-blue-600 mb-0.5">Step 1</div>
                <div className="text-sm font-bold text-neutral-900 mb-0.5">10</div>
                <div className="text-xs text-neutral-600">min</div>
                <div className="text-xs text-neutral-600 mt-0.5">Submit brief</div>
              </div>
              <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-center">
                <div className="text-xs font-semibold text-blue-600 mb-0.5">Step 2</div>
                <div className="text-sm font-bold text-neutral-900 mb-0.5">1</div>
                <div className="text-xs text-neutral-600">business day</div>
                <div className="text-xs text-neutral-600 mt-0.5">Snapshot</div>
              </div>
              <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-center">
                <div className="text-xs font-semibold text-blue-600 mb-0.5">Step 3</div>
                <div className="text-sm font-bold text-neutral-900 mb-0.5">7</div>
                <div className="text-xs text-neutral-600">days after deposit</div>
                <div className="text-xs text-neutral-600 mt-0.5">Quotes</div>
              </div>
            </div>
            
            {/* 6. Trust bar */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-neutral-900">Refundable <span className="font-bold">$49</span> deposit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-neutral-900">Pass through at cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-neutral-900"><span className="font-bold">5</span>% on FOB only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sample report preview - 7 columns */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Sample report preview
                  </h3>
                  <span className="text-xs text-neutral-400">Example only</span>
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
              
              {/* Optional ghost button */}
              <div className="pt-3 border-t border-neutral-200">
                <Link href="/chat" className="inline-block w-full">
                  <Button
                    variant="ghost"
                    className="w-full text-xs py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  >
                    View full sample report
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

