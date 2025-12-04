import { CheckCircle } from 'lucide-react';
import { homePageConfig } from '@/lib/content/homePage';

export default function HomeBenefitsGrid() {
  const { benefits } = homePageConfig;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {benefits.title}
          </h2>
        </div>
        <div className="mt-12 space-y-12">
          {benefits.pillars.map((pillar, pillarIndex) => (
            <div key={pillarIndex}>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                {pillar.title}
              </h3>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
                {pillar.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-neutral-900">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-base text-neutral-600 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}