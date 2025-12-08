import { homePageConfig } from '@/lib/content/homePage';

export default function HomeUseCases() {
  const { useCases } = homePageConfig;

  return (
    <section id="home-use-cases" className="py-10 md:py-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-6 md:mb-8 text-center">
          {useCases.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {useCases.cards.map((useCase) => (
            <div
              key={useCase.title}
              className="bg-transparent border border-neutral-200 shadow-sm rounded-xl p-4 md:p-5 lg:p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900">
                {useCase.title}
              </h3>
              <p className="mt-3 text-sm md:text-base text-[#444] leading-relaxed">
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