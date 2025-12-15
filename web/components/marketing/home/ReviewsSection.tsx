'use client';

import { HomeReviewsSection } from '@/lib/content/homePage';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';

export function ReviewsSection({ section }: { section: HomeReviewsSection }) {
  const { eyebrow, title, subtitle, averageRating, ratingLabel, reviews } = section;
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hide section if no reviews
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 360 + 24; // card width + gap
    const scrollAmount = cardWidth;
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(reviews.length - 3, currentIndex + 1);
    
    setCurrentIndex(newIndex);
    container.scrollTo({
      left: newIndex * scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-16 md:py-20 border-t border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="max-w-xl space-y-2">
            {t.home.reviews.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400">
                {t.home.reviews.eyebrow}
              </p>
            )}
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                {t.home.reviews.title}
              </h2>
              {/* Rating inline with title - baseline aligned */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-500 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">{averageRating.toFixed(1)}</span>
                {reviews.length > 0 && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            </div>
            {t.home.reviews.subtitle && (
              <p className="text-sm text-neutral-600 dark:text-gray-400">{t.home.reviews.subtitle}</p>
            )}
            {t.home.reviews.ratingLabel && (
              <p className="text-xs text-neutral-500 dark:text-gray-400">{t.home.reviews.ratingLabel}</p>
            )}
          </div>
        </div>

        {/* Desktop: 3-column grid, Mobile: Scroll container */}
        <div className="mt-6 relative">
          {/* Mobile arrows - only show if more than 1 review */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all ${
                  canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-30 pointer-events-none'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </button>

              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all ${
                  canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-30 pointer-events-none'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            </>
          )}

          {/* Desktop: 3-column grid, Mobile: Scroll container */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {reviews.slice(0, Math.min(3, reviews.length)).map((review) => (
              <article
                key={review.id}
                className="flex flex-col rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                {/* Outcome pill */}
                {review.outcome && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {review.outcome}
                    </span>
                  </div>
                )}
                <p className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 leading-relaxed mb-4">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {review.role && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-600 dark:text-neutral-400">Role</span>
                        <span className="text-neutral-700 dark:text-neutral-300">{review.role}</span>
                      </div>
                    )}
                    {review.category && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-600 dark:text-neutral-400">Category</span>
                        <span className="text-neutral-700 dark:text-neutral-300">{review.category}</span>
                      </div>
                    )}
                    {review.date && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-600 dark:text-neutral-400">Date</span>
                        <span className="text-neutral-700 dark:text-neutral-300">{review.date}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile: Scroll Container */}
          <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 md:hidden">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="flex gap-6 sm:gap-8 min-w-max">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="flex flex-col w-[320px] sm:w-[360px] flex-shrink-0 rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                  >
                    {/* Outcome pill */}
                    {review.outcome && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {review.outcome}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 leading-relaxed mb-4">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {review.role && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-600 dark:text-neutral-400">Role</span>
                            <span className="text-neutral-700 dark:text-neutral-300">{review.role}</span>
                          </div>
                        )}
                        {review.category && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-600 dark:text-neutral-400">Category</span>
                            <span className="text-neutral-700 dark:text-neutral-300">{review.category}</span>
                          </div>
                        )}
                        {review.date && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-600 dark:text-neutral-400">Date</span>
                            <span className="text-neutral-700 dark:text-neutral-300">{review.date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

