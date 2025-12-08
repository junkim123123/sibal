import { homePageConfig } from '@/lib/content/homePage';

export default function HomeSocialProofStrip() {
  const { socialProof } = homePageConfig;

  return (
    <section className="py-10 md:py-16 bg-neutral-50 border-y border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center gap-6 md:gap-10">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 text-center">
            {socialProof.title}
          </h2>
          <div className="text-center">
            <div className="inline-block rounded-xl bg-white p-4 md:p-6 shadow-md text-center">
              <p className="text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                {socialProof.rating.badge}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-neutral-900">{socialProof.rating.value}</p>
              <p className="mt-1 text-xs md:text-sm text-neutral-600">
                {socialProof.rating.label}
              </p>
            </div>
            <p className="mt-4 text-sm md:text-base text-neutral-700 max-w-2xl mx-auto">
              {socialProof.summary}
            </p>
          </div>
        </div>
        <div className="mt-8 md:mt-12 space-y-6 md:space-y-0 md:flex md:gap-8">
          {socialProof.quotes.map((item, index) => (
            <blockquote key={index} className="text-center flex-1">
              <p className="text-sm md:text-base lg:text-lg font-medium text-neutral-800 leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 text-xs md:text-sm text-neutral-600">
                — {item.author}
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200/50">
                  Verified Shipment
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}