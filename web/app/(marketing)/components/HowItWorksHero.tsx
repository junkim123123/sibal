'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';

export default function HowItWorksHero() {
  const { hero } = howItWorksPageConfig;

  return (
    <section aria-label="Hero" className="py-16 md:py-20 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight mb-6">
            {hero.title}
          </h1>
          <p className="text-base md:text-lg text-neutral-700 font-medium mb-4 leading-relaxed">
            {hero.subtitle}
          </p>
          <p className="text-sm md:text-base text-neutral-600 mb-8 leading-relaxed">
            {hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
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
          {hero.cta.helperText && (
            <p className="mt-4 text-xs text-neutral-500">
              {hero.cta.helperText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

