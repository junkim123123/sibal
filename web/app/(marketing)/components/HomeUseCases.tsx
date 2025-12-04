import { homePageConfig } from '@/lib/content/homePage';

export default function HomeUseCases() {
  const { useCases } = homePageConfig;

  return (
    <section id="home-use-cases" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8 text-center">
          {useCases.title}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {useCases.cards.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-3xl bg-neutral-50 p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold text-neutral-900">
                {useCase.title}
              </h3>
              <p className="mt-3 text-base text-neutral-600 leading-relaxed">
                {useCase.body}
              </p>
              {useCase.target && (
                <p className="mt-4 text-xs text-neutral-500 italic">
                  {useCase.target}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}