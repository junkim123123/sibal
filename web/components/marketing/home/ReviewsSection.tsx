'use client';

import { HomeReviewsSection } from '@/lib/content/homePage';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ReviewsSection({ section }: { section: HomeReviewsSection }) {
  const { eyebrow, title, subtitle, averageRating, ratingLabel, reviews } = section;
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

        {/* Horizontal Scroll Container with Controls */}
        <div className="mt-10 relative">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-neutral-200 rounded-full p-2 shadow-lg hover:bg-neutral-50 transition-all ${
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
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-neutral-200 rounded-full p-2 shadow-lg hover:bg-neutral-50 transition-all ${
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
                      className="flex flex-col w-[320px] sm:w-[360px] flex-shrink-0 rounded-2xl bg-neutral-50 p-5 sm:p-6 shadow-sm border border-neutral-100"
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
          </div>
        </div>
      </div>
    </section>
  );
}

