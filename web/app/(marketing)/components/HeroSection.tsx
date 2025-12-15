'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReportPreviewCard } from './ReportPreviewCard';

interface HeroChip {
  text: string;
}

interface HeroCTA {
  primary: {
    label: string;
    href: string;
  };
  secondary: {
    label: string;
    href: string;
  };
  helperText?: string;
}

interface HeroSectionProps {
  title: string;
  chips?: HeroChip[];
  valueStatement?: string;
  description?: string;
  cta: HeroCTA;
  showPreviewCard?: boolean;
}

export function HeroSection({
  title,
  chips = [],
  valueStatement,
  description,
  cta,
  showPreviewCard = true,
}: HeroSectionProps) {
  return (
    <section aria-label="Hero" className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Text Content */}
          <div className="flex flex-col space-y-5">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
              {title}
            </h1>

            {/* Chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chips.map((chip, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {chip.text}
                  </span>
                ))}
              </div>
            )}

            {/* Value Statement */}
            {valueStatement && (
              <p className="text-base md:text-lg text-neutral-700 font-medium leading-relaxed">
                {valueStatement}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                {description}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-2">
              <Link href={cta.primary.href} className="w-full sm:w-auto">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto">
                  {cta.primary.label}
                </Button>
              </Link>
              <Link href={cta.secondary.href} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto"
                >
                  {cta.secondary.label}
                </Button>
              </Link>
            </div>

            {/* Helper Text */}
            {cta.helperText && (
              <p className="text-xs text-neutral-500 leading-relaxed">
                {cta.helperText}
              </p>
            )}
          </div>

          {/* Right: Report Preview Card */}
          {showPreviewCard && (
            <div className="relative mt-8 md:mt-0">
              <ReportPreviewCard />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

