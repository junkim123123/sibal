'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function PortfolioMarquee() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        // 각 상품의 첫 번째 이미지만 가져와서 30개로 제한
        const imageMap = new Map<string, string>();
        data.items?.forEach((item: { image: string; productName: string }) => {
          if (!imageMap.has(item.productName)) {
            imageMap.set(item.productName, item.image);
          }
        });
        const uniqueImages = Array.from(imageMap.values()).slice(0, 30);
        // 무한 루프를 위해 2배로 복제
        setImages([...uniqueImages, ...uniqueImages]);
      } catch (error) {
        console.error('Failed to load portfolio images:', error);
      }
    }
    loadImages();
  }, []);

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-neutral-50 border-y border-neutral-200 overflow-hidden">
      <div className="relative">
        <div className="flex animate-marquee gap-6">
          {/* 첫 번째 세트 */}
          {images.map((image, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden bg-neutral-200 group"
            >
              <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300">
                <Image
                  src={image}
                  alt={`Portfolio item ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="160px"
                  onError={(e) => {
                    // 이미지 로드 실패 시 플레이스홀더 표시
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          ))}
          {/* 두 번째 세트 (무한 루프를 위해) */}
          {images.map((image, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden bg-neutral-200 group"
            >
              <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300">
                <Image
                  src={image}
                  alt={`Portfolio item ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="160px"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}

