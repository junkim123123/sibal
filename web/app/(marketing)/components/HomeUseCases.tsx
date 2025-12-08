import { homePageConfig } from '@/lib/content/homePage';
import { Rocket, TrendingUp, ShieldCheck, LucideIcon } from 'lucide-react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Rocket,
  TrendingUp,
  ShieldCheck,
};

// Badge color mapping
const badgeColorMap: Record<string, string> = {
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

// Icon container color mapping
const iconColorMap: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-600',
  blue: 'bg-blue-100 text-blue-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  indigo: 'bg-indigo-100 text-indigo-600',
};

export default function HomeUseCases() {
  const { useCases } = homePageConfig;

  return (
    <section id="home-use-cases" className="py-12 md:py-20 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            {useCases.title}
          </h2>
          {useCases.subtitle && (
            <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {useCases.subtitle}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {useCases.cards.map((useCase, index) => {
            const Icon = useCase.icon ? iconMap[useCase.icon] : null;
            const badgeColor = useCase.badgeColor || 'blue';
            const badgeClasses = badgeColorMap[badgeColor] || badgeColorMap.blue;
            const iconClasses = iconColorMap[badgeColor] || iconColorMap.blue;

            return (
              <div
                key={useCase.title}
                className="group relative bg-white border border-neutral-200 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Persona Badge */}
                {useCase.target && (
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClasses}`}
                    >
                      {useCase.target}
                    </span>
                  </div>
                )}

                {/* Icon */}
                {Icon && (
                  <div className={`w-12 h-12 rounded-lg ${iconClasses} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3 leading-tight">
                  {useCase.title}
                </h3>

                {/* Body */}
                <p className="text-base text-neutral-600 leading-relaxed">
                  {useCase.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}