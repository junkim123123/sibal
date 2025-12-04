import { homePageConfig } from '@/lib/content/homePage';

export default function HomeSocialProofStrip() {
  const { socialProof } = homePageConfig;

  return (
    <section className="py-16 sm:py-20 bg-neutral-50 border-y border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
            {socialProof.title}
          </h2>
          <div className="mt-8">
            <div className="inline-block rounded-xl bg-white p-6 shadow-md text-center">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                {socialProof.rating.badge}
              </p>
              <p className="text-3xl font-bold text-neutral-900">{socialProof.rating.value}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {socialProof.rating.label}
              </p>
            </div>
            <p className="mt-4 text-base text-neutral-700 max-w-2xl mx-auto">
              {socialProof.summary}
            </p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {socialProof.quotes.map((item, index) => (
            <blockquote key={index} className="text-center">
              <p className="text-lg font-medium text-neutral-800 leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 text-sm text-neutral-600">
                — {item.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}