import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { urlFor } from '@/lib/sanity/image';
import type { HomePage } from '@/lib/sanity/client';
import { homePageConfig } from '@/lib/content/homePage';

type Props = {
  page: HomePage | null;
};

export default function HomeHero({ page }: Props) {
  const hero = homePageConfig.hero;

  return (
    <section className="py-16 sm:py-20 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-semibold tracking-tight text-neutral-900 leading-tight">
              {hero.headline}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-neutral-700 font-medium leading-relaxed">
              {hero.subheadline}
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              {hero.target}
            </p>
            <div className="mt-8 flex flex-row flex-wrap gap-3 sm:gap-4 items-center">
              <Link href={hero.cta.primary.href}>
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full px-8 py-3.5"
                >
                  {hero.cta.primary.label}
                </Button>
              </Link>
              <Link
                href={hero.cta.secondary.href}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {hero.cta.secondary.label}
              </Link>
            </div>
          </div>

          {/* Right: Image Card */}
          <div className="relative rounded-3xl bg-white p-6 sm:p-8 aspect-[4/3] sm:aspect-auto sm:h-[480px] flex flex-col items-center justify-center overflow-hidden shadow-lg">
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
                <div className="w-full max-w-sm text-center">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {hero.snapshot.badge}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-4xl font-bold text-neutral-900 mb-1">
                      {hero.snapshot.mainValue}
                    </p>
                    <p className="text-base font-semibold text-neutral-700">
                      {hero.snapshot.mainLabel}
                    </p>
                  </div>
                  <p className="text-sm text-neutral-600 mb-6">
                    {hero.snapshot.details}
                  </p>
                  <p className="text-[10px] text-neutral-400">
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