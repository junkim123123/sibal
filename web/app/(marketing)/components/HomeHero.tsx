import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StartAnalysisButton } from '@/components/StartAnalysisButton';
import { urlFor } from '@/lib/sanity/image';
import type { HomePage } from '@/lib/sanity/client';
import { homePageConfig } from '@/lib/content/homePage';
import { Factory, Truck, Scale } from 'lucide-react';

type Props = {
  page: HomePage | null;
};

export default function HomeHero({ page }: Props) {
  const hero = homePageConfig.hero;

  return (
    <section className="py-10 md:py-16 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl lg:text-[52px] font-semibold tracking-tight text-neutral-900 leading-tight">
              {hero.headline}
            </h1>
            <p className="mt-4 text-sm md:text-lg lg:text-xl text-neutral-700 font-medium leading-relaxed">
              {hero.subheadline}
            </p>
            <p className="mt-3 text-xs md:text-sm text-neutral-500">
              {hero.target}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="w-full sm:w-auto">
                <StartAnalysisButton
                  href={hero.cta.primary.href}
                  label={hero.cta.primary.label}
                  className="rounded-full px-8 py-3.5 w-full sm:w-auto"
                />
              </div>
              <Link
                href={hero.cta.secondary.href}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors text-center sm:text-left"
              >
                {hero.cta.secondary.label}
              </Link>
            </div>
          </div>

          {/* Right: Premium Estimate Card */}
          <div className="relative rounded-2xl bg-white p-6 md:p-8 lg:p-10 aspect-[4/3] md:aspect-auto md:h-[520px] flex flex-col items-center justify-center overflow-hidden shadow-lg border border-neutral-200/50 w-full mt-6 md:mt-0">
            {page?.heroImage ? (
              <div className="absolute top-6 right-6 z-10">
                <span className="inline-block px-3 py-1.5 text-[11px] font-semibold text-neutral-700 bg-neutral-100 rounded-full">
                  {hero.snapshot.badge}
                </span>
              </div>
            ) : null}
            <div className="relative w-full h-full flex flex-col items-center justify-center px-6 py-8">
              {page?.heroImage ? (
                <Image
                  src={urlFor(page.heroImage).width(800).height(600).url()}
                  alt="Small test shipment arriving at a warehouse"
                  fill
                  className="object-cover rounded-2xl"
                  priority
                />
              ) : (
                <div className="w-full max-w-md text-center">
                  {/* Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1.5 text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50 rounded-full border border-neutral-200">
                      {hero.snapshot.badge}
                    </span>
                  </div>
                  
                  {/* Main Value - Massive and Dominant */}
                  <div className="mb-6">
                    <p className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-2 font-mono tracking-tight">
                      {hero.snapshot.mainValue}
                    </p>
                    <p className="text-sm md:text-base font-medium text-neutral-600">
                      {hero.snapshot.mainLabel}
                    </p>
                  </div>

                  {/* Cost Breakdown List */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Factory className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-neutral-700">Factory</span>
                        <span className="ml-2 font-mono font-semibold text-neutral-900">$1.50</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-neutral-700">Logistics</span>
                        <span className="ml-2 font-mono font-semibold text-neutral-900">$0.40</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-neutral-700">Duties</span>
                        <span className="ml-2 font-mono font-semibold text-neutral-900">$0.20</span>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-[9px] md:text-[10px] text-neutral-400 italic">
                    {hero.snapshot.disclaimer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}