import { homePageConfig } from '@/lib/content/homePage';
import { Star, User } from 'lucide-react';

export default function HomeSocialProofStrip() {
  const { socialProof } = homePageConfig;

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Badge */}
          {socialProof.badge && (
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium text-neutral-600 bg-neutral-100 border border-neutral-200/60">
                {socialProof.badge}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            {socialProof.title}
          </h2>

          {/* Subtitle */}
          {socialProof.subtitle && (
            <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {socialProof.subtitle}
            </p>
          )}

          {/* Rating Display */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-amber-400 text-amber-400"
                  strokeWidth={2}
                />
              ))}
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-neutral-900">
                {socialProof.rating.value}/5 Average Rating
              </p>
              {socialProof.rating.label && (
                <p className="mt-1 text-sm text-neutral-600">
                  {socialProof.rating.label}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {socialProof.quotes.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-neutral-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                    strokeWidth={2}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-6">
                <p className="text-base md:text-lg text-neutral-700 leading-relaxed italic font-serif">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </blockquote>

              {/* Author Block */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}