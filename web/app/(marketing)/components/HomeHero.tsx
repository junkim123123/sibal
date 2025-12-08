import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StartAnalysisButton } from '@/components/StartAnalysisButton';
import { urlFor } from '@/lib/sanity/image';
import type { HomePage } from '@/lib/sanity/client';
import { homePageConfig } from '@/lib/content/homePage';
import { Factory, Truck, Scale, ArrowRight, CheckCircle, Ship } from 'lucide-react';

type Props = {
  page: HomePage | null;
};

export default function HomeHero({ page }: Props) {
  const hero = homePageConfig.hero;

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-white to-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Badge/Label */}
            <div className="inline-flex items-center">
              <span className="px-4 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full border border-neutral-200/60">
                {hero.target}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-neutral-900 leading-[1.1]">
              Stop Guessing.{' '}
              <span className="text-neutral-950 font-extrabold">
                Start Sourcing with Confidence.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl lg:text-xl text-neutral-600 leading-relaxed max-w-2xl">
              {hero.subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <StartAnalysisButton
                href={hero.cta.primary.href}
                label={hero.cta.primary.label}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 text-white px-6 py-3.5 text-base font-semibold hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                {hero.cta.primary.label}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </StartAnalysisButton>
              <Link
                href={hero.cta.secondary.href}
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3.5 text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors w-full sm:w-auto text-center"
              >
                {hero.cta.secondary.label}
              </Link>
            </div>
          </div>

          {/* Right: Sourcing Intelligence Card */}
          <div className="relative w-full mt-8 lg:mt-0">
            <div className="relative rounded-2xl bg-white/80 backdrop-blur-md p-8 md:p-10 lg:p-12 shadow-xl border border-neutral-200/60 w-full overflow-hidden">
              {/* Glassmorphism overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 pointer-events-none rounded-2xl" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Landed Cost Breakdown
                  </h3>
                </div>

                {/* Main Price */}
                <div className="mb-8 text-center">
                  <p className="text-6xl md:text-7xl lg:text-8xl font-bold text-neutral-900 mb-2 font-mono tracking-tight">
                    $2.10
                  </p>
                  <p className="text-sm font-medium text-neutral-600">
                    per unit
                  </p>
                </div>

                {/* Cost Breakdown Items */}
                <div className="space-y-4 mb-6">
                  {/* Factory Cost */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50 border border-neutral-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Factory className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-base font-medium text-neutral-700">Factory Cost</span>
                    </div>
                    <span className="text-base font-mono font-semibold text-neutral-900">$1.50</span>
                  </div>

                  {/* International Logistics */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50 border border-neutral-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Ship className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="text-base font-medium text-neutral-700">Int'l Logistics</span>
                    </div>
                    <span className="text-base font-mono font-semibold text-neutral-900">$0.40</span>
                  </div>

                  {/* Estimated Duties */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50 border border-neutral-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-base font-medium text-neutral-700">Est. Duties</span>
                    </div>
                    <span className="text-base font-mono font-semibold text-neutral-900">$0.20</span>
                  </div>
                </div>

                {/* Compliance Check Badge */}
                <div className="mt-6 pt-6 border-t border-neutral-200/60">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 border border-green-200/60">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-700">
                      Compliance Check: PASSED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}