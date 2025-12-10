'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 포트폴리오 아이템 타입
interface PortfolioItem {
  id: string;
  image: string;
  productName: string;
  productNameEn?: string;
  category?: string;
  subcategory?: string;
  alt: string;
}

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function loadPortfolio() {
      try {
        // 정적 JSON 파일을 직접 로드
        const response = await fetch('/portfolio-list.json');
        if (response.ok) {
          const data = await response.json();
          setPortfolioItems(data.items || []);
        } else {
          // 파일이 없으면 빈 배열
          setPortfolioItems([]);
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error);
        setPortfolioItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  // 카테고리 목록 추출
  const categories = Array.from(
    new Set(portfolioItems.map(item => item.category || 'other'))
  ).sort();

  const filteredItems = selectedCategory === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => (item.category || 'other') === selectedCategory);

  // 카테고리 표시 이름
  const categoryNames: Record<string, string> = {
    all: 'All Products',
    confectionery: 'Confectionery',
    toys: 'Toys & Novelties',
    character: 'Character Licensing',
    other: 'Other',
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="py-16 sm:py-20 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 mb-4">
              Our Portfolio
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              200+ products sourced and delivered across multiple categories and markets.
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCategory('all');
                }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#008080] text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCategory(category);
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#008080] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {categoryNames[category] || category}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-neutral-600">Loading portfolio...</p>
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-600 mb-4">
                No portfolio images found.
              </p>
              <p className="text-sm text-neutral-500 mb-2">
                Please ensure images are placed in <code className="bg-neutral-100 px-2 py-1 rounded">/public/images/portfolio/</code>
              </p>
              <p className="text-xs text-neutral-400">
                Folder structure: <code className="bg-neutral-100 px-2 py-1 rounded">/portfolio/product-name-1/</code>, <code className="bg-neutral-100 px-2 py-1 rounded">/portfolio/product-name-2/</code>, etc.
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative w-full aspect-square bg-neutral-100">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Product name overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <p className="text-white text-sm font-medium text-center">
                        {item.productNameEn || item.productName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back to Resources */}
      <section className="py-12 bg-neutral-50 border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ← Back to Resources
          </Link>
        </div>
      </section>
    </div>
  );
}

