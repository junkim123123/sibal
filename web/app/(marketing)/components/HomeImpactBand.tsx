import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { homePageConfig } from '@/lib/content/homePage';

export default function HomeImpactBand() {
  const { cta } = homePageConfig;

  return (
    <section className="py-16 sm:py-20 bg-neutral-900 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {cta.title}
          </h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {cta.description}
          </p>
          <Link href={cta.buttonHref}>
            <Button
              variant="primary"
              size="lg"
              className="rounded-full px-8 py-3.5 bg-white text-neutral-900 hover:bg-neutral-100"
            >
              {cta.buttonLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}