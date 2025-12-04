import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { urlFor } from '@/lib/sanity/image';
import type { HomePage } from '@/lib/sanity/client';

type Props = {
  page: HomePage | null;
};

export default function HomeHero({ page }: Props) {
  const heroTitle = page?.heroTitle || 'Trade support that meets you where you are';
  const heroSubheadline = page?.heroSubtitle || 'Start with one box. Scale when the numbers work.';
  const heroBody = 'Affordable global sourcing from trusted partners for US-bound products.\nWe help you test demand, understand landed cost, and avoid compliance surprises.\n\nFrom one simple analysis to a full sourcing plan, usually within twenty four hours.';
  const heroCtaLabel = page?.heroCtaLabel || 'Get an analysis';
  const heroBadge = page?.heroBadge || 'Get project insights in 24h';

  return (
    <section className="py-16 sm:py-20 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-semibold tracking-tight text-neutral-900 leading-tight">
              {heroTitle}
            </h1>
            <p className="mt-4 text-lg text-neutral-700">
              {heroSubheadline}
            </p>
            <p className="mt-3 text-base text-neutral-600 leading-relaxed whitespace-pre-line">
              {heroBody}
            </p>
            <div className="mt-8 flex flex-row flex-wrap gap-3 sm:gap-4 items-center">
              <Link href="/analyze">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full px-8 py-3.5"
                >
                  Analyze a product
                </Button>
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Right: Image Card */}
          <div className="relative rounded-3xl bg-white p-6 sm:p-8 aspect-[4/3] sm:aspect-auto sm:h-[480px] flex flex-col items-center justify-center overflow-hidden shadow-lg">
            {heroBadge && (
              <div className="absolute top-6 right-6 z-10">
                <span className="inline-block px-3 py-1.5 text-[11px] font-semibold text-neutral-700 bg-neutral-100 rounded-full">
                  {heroBadge}
                </span>
              </div>
            )}
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
                <div className="w-full max-w-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Project snapshot
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Target market</span>
                        <span className="text-sm font-medium text-neutral-900">United States</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Volume</span>
                        <span className="text-sm font-medium text-neutral-900">Test run</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">DDP estimate</span>
                        <span className="text-sm font-medium text-neutral-900">$2.10 per unit</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 text-center mt-6">
                    Example for illustration only
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