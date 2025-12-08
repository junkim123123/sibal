// Resources Page - Config-driven structure
// All content is managed through resourcePageConfig in lib/content/resources.ts

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { resourcePageConfig } from '@/lib/content/resources';

export const revalidate = 60;

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
            {startHere.cards.map((card) => (
              <Link
                key={card.id}
                href={card.cta?.href || '#'}
                className="block p-6 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all bg-white"
              >
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
            ))}
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
                <div className="relative w-full h-48 bg-neutral-100">
                  <Image
                    src={project.image.src}
                    alt={project.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  {project.tag && (
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 mb-4">
                      {project.tag}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-neutral-900 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </Card>
            ))}
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeHub.videos.map((video) => (
              <Card key={video.id} className="overflow-hidden bg-white border-neutral-200 shadow-sm rounded-2xl">
                <div className="relative w-full aspect-video bg-neutral-900">
                  {video.youtubeId ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : video.youtubeChannel ? (
                    <a
                      href={`https://www.youtube.com/${video.youtubeChannel}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 transition-colors group"
                    >
                      <div className="text-center">
                        <div className="mb-2">
                          <svg className="w-16 h-16 mx-auto text-red-600 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                        <p className="text-white text-sm font-medium">Visit our YouTube channel</p>
                        <p className="text-neutral-400 text-xs mt-1">{video.youtubeChannel}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                      <span className="text-sm">Video coming soon</span>
                    </div>
                  )}
                </div>
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
