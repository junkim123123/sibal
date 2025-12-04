import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { homePageConfig } from '@/lib/content/homePage';

export default function HomeImpactBand() {
  const { cta } = homePageConfig;

  return (
    <section className="py-10 md:py-16 bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {cta.title}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-neutral-300 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            {cta.description}
          </p>
          <Link href={cta.buttonHref} className="inline-block w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="rounded-full px-6 md:px-8 py-3 md:py-3.5 bg-white text-neutral-900 hover:bg-neutral-100 w-full sm:w-auto"
            >
              {cta.buttonLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}