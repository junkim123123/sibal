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
    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-12 md:py-16 border-t border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
          <div className="max-w-xl space-y-3">
            {t.home.reviews.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400">
                {t.home.reviews.eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {t.home.reviews.title}
            </h2>
            {t.home.reviews.subtitle && (
              <p className="text-sm sm:text-base text-neutral-600 dark:text-gray-400">{t.home.reviews.subtitle}</p>
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
              <span className="font-semibold text-neutral-900 dark:text-white">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-neutral-500 dark:text-gray-400">{t.home.reviews.ratingLabel}</span>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Container with Controls */}
        <div className="mt-6 relative">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full p-2 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all ${
              canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full p-2 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all ${
              canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-neutral-700" />
          </button>

          {/* Scroll Container */}
          <div className="-mx-4 sm:-mx-6 px-4 sm:px-6">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="flex gap-6 sm:gap-8 min-w-max">
                {reviews.map((review) => {
                  // Extract the most impactful sentence (first sentence) and bold it
                  const quoteParts = review.quote.split('. ');
                  const firstSentence = quoteParts[0];
                  const restOfQuote = quoteParts.slice(1).join('. ');
                  
                  return (
                    <article
                      key={review.id}
                      className="flex flex-col w-[320px] sm:w-[360px] flex-shrink-0 rounded-lg bg-white dark:bg-neutral-800 p-4 sm:p-5 shadow-sm border border-neutral-200 dark:border-neutral-700"
                    >
                      {review.outcome && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">
                            {review.outcome}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 leading-relaxed mb-3">
                        &ldquo;{review.quote}&rdquo;
                      </p>
                      <div className="mt-auto pt-3 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            <p className="font-medium text-neutral-700 dark:text-neutral-300">
                              {review.name}
                            </p>
                            <p className="mt-0.5">
                              {review.role ? `${review.role}` : ''}
                            </p>
                          </div>
                          <a
                            href="#"
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: Link to case study
                            }}
                          >
                            View case study →
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

