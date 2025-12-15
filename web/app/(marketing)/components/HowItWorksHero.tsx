'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, FileText, Package } from 'lucide-react';
import { howItWorksPageConfig } from '@/lib/content/howItWorks';

export default function HowItWorksHero() {
  const { hero } = howItWorksPageConfig;

  return (
    <section aria-label="Hero" className="py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">
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

        {/* 3 Step Visual Stepper */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {hero.chips?.map((chip, index) => {
            const icons = [Brain, FileText, Package];
            const Icon = icons[index] || Brain;
            return (
              <div key={index} className="relative">
                {/* Connector line on desktop */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+3rem)] w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
                )}
                <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-xs font-semibold text-blue-600 mb-2">Step {index + 1}</div>
                  <p className="text-sm font-medium text-neutral-900">{chip.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

