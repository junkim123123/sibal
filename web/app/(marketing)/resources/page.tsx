// Resources Page - Config-driven structure
// All content is managed through resourcePageConfig in lib/content/resources.ts

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { resourcePageConfig } from '@/lib/content/resources';
import { MapPin, DollarSign, Rocket, Play } from 'lucide-react';
import React from 'react';

export default function ResourcesPage() {
  const { hero, startHere, featuredProjects, knowledgeHub, faq } = resourcePageConfig;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section aria-label="Hero" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 mb-6">
            {hero.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* Start here section */}
      <section aria-label="Start here" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-8">
            {startHere.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {startHere.cards.map((card) => {
              const iconMap: Record<string, React.ReactNode> = {
                'how-it-works': <MapPin className="w-6 h-6 text-[#008080]" />,
                'faq-page': <DollarSign className="w-6 h-6 text-[#008080]" />,
                'analyze-product': <Rocket className="w-6 h-6 text-[#008080]" />,
              };
              const icon = iconMap[card.id] || null;
              
              return (
                <Link
                  key={card.id}
                  href={card.cta?.href || '#'}
                  className="block p-6 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all bg-white hover:-translate-y-1"
                >
                  {icon && (
                    <div className="mb-4">
                      {icon}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                    {card.description}
                  </p>
                  {card.cta && (
                    <span className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors inline-flex items-center">
                      {card.cta.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects section */}
      <section aria-label="Featured Projects" className="py-16 sm:py-20 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
              {featuredProjects.title}
            </h2>
            {featuredProjects.subtitle && (
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
                {featuredProjects.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredProjects.projects.map((project) => (
              <Card key={project.id} className="overflow-hidden bg-white border-neutral-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                <div className="relative w-full aspect-[2/3] bg-neutral-100">
                  <Image
                    src={project.image.src}
                    alt={project.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {project.country && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-900 border border-neutral-200">
                      {project.country}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {project.tag && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-semibold mb-4">
                      {project.tag}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-neutral-900 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                    {project.description}
                  </p>
                  {project.result && (
                    <p className="text-sm font-bold text-neutral-900 mt-3 pt-3 border-t border-neutral-100">
                      {project.result}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {/* View All Button */}
          <div className="mt-10 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
            >
              View All 200+ Sourced Products
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Knowledge Hub / Video Guides section */}
      <section aria-label="Sourcing Insights" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
              {knowledgeHub.title}
            </h2>
            {knowledgeHub.subtitle && (
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
                {knowledgeHub.subtitle}
              </p>
            )}
          </div>
          
          {/* Operations Section */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6">Operations & Infrastructure</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeHub.videos
                .filter(video => !video.category || video.category === 'operations')
                .map((video) => (
                  <Card key={video.id} className="overflow-hidden bg-white border-neutral-200 shadow-sm rounded-2xl group cursor-pointer">
                    <a
                      href={video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden">
                        {video.youtubeId ? (
                          <>
                            <img
                              src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-[#008080] ml-1" fill="currentColor" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                            <span className="text-sm">Video coming soon</span>
                          </div>
                        )}
                      </div>
                    </a>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          {/* Trends Section */}
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-6">Market Trends & Experiments</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeHub.videos
                .filter(video => video.category === 'trends')
                .map((video) => (
                  <Card key={video.id} className="overflow-hidden bg-white border-neutral-200 shadow-sm rounded-2xl group cursor-pointer">
                    <a
                      href={video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden">
                        {video.youtubeId ? (
                          <>
                            <img
                              src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-[#008080] ml-1" fill="currentColor" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                            <span className="text-sm">Video coming soon</span>
                          </div>
                        )}
                      </div>
                    </a>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section id="faq" aria-label="Frequently asked questions" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
              {faq.title}
            </h2>
            {faq.subtitle && (
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
                {faq.subtitle}
              </p>
            )}
          </div>
          <Accordion>
            {faq.items.map((item, index) => (
              <AccordionItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                defaultOpen={index === 0}
              />
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
