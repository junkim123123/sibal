import { HomeReviewsSection } from '@/lib/content/homePage';

export function ReviewsSection({ section }: { section: HomeReviewsSection }) {
  const { eyebrow, title, subtitle, averageRating, ratingLabel, reviews } = section;

  return (
    <section className="py-16 sm:py-24 border-t-2 border-b-2 border-neutral-300 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-10">
          <div className="max-w-xl space-y-3">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm sm:text-base text-neutral-600">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm sm:text-base">
            {/* Simple star row */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-500 text-lg">
                  ★
                </span>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-neutral-900">{averageRating.toFixed(1)} / 5</span>
              <span className="text-xs text-neutral-500">{ratingLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            // Extract the most impactful sentence (first sentence) and bold it
            const quoteParts = review.quote.split('. ');
            const firstSentence = quoteParts[0];
            const restOfQuote = quoteParts.slice(1).join('. ');
            
            return (
              <article
                key={review.id}
                className="flex h-full flex-col rounded-2xl bg-neutral-50 p-5 shadow-sm border border-neutral-100"
              >
                <h3 className="text-sm font-semibold leading-snug text-neutral-900">
                  {review.headline}
                </h3>
                <p className="mt-3 text-sm text-neutral-700 flex-1 leading-relaxed">
                  &ldquo;<strong className="font-semibold text-neutral-900">{firstSentence}</strong>{restOfQuote ? '. ' + restOfQuote : ''}&rdquo;
                </p>
              <div className="mt-4 text-xs text-neutral-500">
                <p className="font-medium text-neutral-700">
                  {review.name}
                  {review.role ? ` · ${review.role}` : ''}
                </p>
                <p>{review.date}</p>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

