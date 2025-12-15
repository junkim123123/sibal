// Use Cases Page - Config-driven
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCasesPageContent } from '@/lib/content/useCasesPage';
import { Shield, Lock, DollarSign, Factory, Truck, AlertTriangle, MapPin, Package } from 'lucide-react';

export const revalidate = 60;

export default async function UseCasesPage() {
  const { hero, threeSteps, commonProjects, snapshotPreview, freeVsDeposit, trustElements, socialProof, benefits, cta } = useCasesPageContent;

  const benefitIcons = [DollarSign, Factory, Lock, Shield, MapPin, Package];

  return (
    <div className="bg-white">
      {/* Hero Section - Use Cases Specific */}
      <section aria-label="Hero" className="pt-12 pb-10 sm:pt-16 sm:pb-12 bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-[36px] sm:text-[44px] lg:text-[56px] font-semibold tracking-tight leading-[1.2] text-neutral-900">
              {hero.title}
            </h1>
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-neutral-600 leading-[1.4] max-w-[640px] mx-auto">
              {hero.body}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={hero.ctaPrimary.href} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  {hero.ctaPrimary.label}
                </button>
              </Link>
              <Link href={hero.ctaSecondary.href} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-11 px-6 rounded-xl border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 bg-white font-semibold">
                  Talk to a manager
                </button>
              </Link>
            </div>
            {hero.ctaHelperText && (
              <p className="mt-4 text-[13px] text-neutral-500 leading-5 max-w-md mx-auto">
                {hero.ctaHelperText}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Common ways people start */}
      <section id="projects" aria-label="Common projects" className="py-12 sm:py-16 bg-neutral-50 border-y border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
              {commonProjects.title}
            </h2>
            {commonProjects.subtitle && (
              <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
                {commonProjects.subtitle}
              </p>
            )}
          </div>
          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
            {commonProjects.items.map((project) => (
              <Link
                key={project.id}
                href="/chat"
                className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 sm:p-6 flex flex-col h-full min-h-[360px] sm:min-h-[420px] hover:shadow-md transition-shadow"
              >
                {project.badge && (
                  <span className="inline-flex w-fit text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {project.badge}
                  </span>
                )}
                <h3 className="mt-3 text-lg font-semibold leading-snug text-neutral-900">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 leading-6">
                  {project.summary}
                </p>
                {project.deliverables && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-neutral-500 tracking-wide">Included in the snapshot</p>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-700 leading-6">
                      {project.deliverables.split('\n').slice(0, 4).map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-neutral-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto pt-5 border-t border-neutral-200">
                  {project.outcomeExample && (
                    <p className="text-xs text-neutral-500 leading-5 mb-1.5 line-clamp-2">
                      {project.outcomeExample}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 leading-5 mb-3 line-clamp-2">
                    {project.footnote}
                  </p>
                  {project.ctaLabel && (
                    <Link href="/chat" className="mt-4 inline-flex items-center justify-center h-10 w-full rounded-xl border border-neutral-300 hover:border-blue-600 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      {project.ctaLabel}
                    </Link>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Snapshot Preview */}
      {snapshotPreview && (
        <section aria-label="Snapshot preview" className="py-12 sm:py-16 bg-white border-y border-neutral-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
                {snapshotPreview.title}
              </h2>
              {snapshotPreview.subtitle && (
                <p className="mt-3 text-sm sm:text-base text-neutral-600">
                  {snapshotPreview.subtitle}
                </p>
              )}
            </div>
            <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 lg:grid-cols-2 items-start">
              {/* Left: Preview mockup */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="bg-white rounded-lg">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-3">
                    <div className="h-3 bg-neutral-300 rounded w-24"></div>
                    <div className="h-2 bg-neutral-200 rounded w-12"></div>
                  </div>
                  {/* Title */}
                  <div className="h-3 bg-neutral-200 rounded w-32 mb-2"></div>
                  {/* Main content lines */}
                  <div className="space-y-2 mb-4">
                    <div className="h-2.5 bg-neutral-200 rounded w-full"></div>
                    <div className="h-2.5 bg-neutral-200 rounded w-5/6"></div>
                    <div className="h-2.5 bg-neutral-200 rounded w-4/5"></div>
                    <div className="h-2.5 bg-neutral-200 rounded w-full"></div>
                    <div className="h-2.5 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-2.5 bg-neutral-200 rounded w-5/6"></div>
                  </div>
                  {/* Highlight boxes */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="h-8 bg-blue-50 border border-blue-200 rounded"></div>
                    <div className="h-8 bg-yellow-50 border border-yellow-200 rounded"></div>
                  </div>
                  {/* Badges */}
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-neutral-100 border border-neutral-200 rounded"></div>
                    <div className="h-5 w-20 bg-neutral-100 border border-neutral-200 rounded"></div>
                  </div>
                </div>
              </div>
              {/* Right: Summary */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="space-y-5">
                  {snapshotPreview.items.map((item, i) => (
                    <div key={i}>
                      <div className="text-xs font-semibold text-neutral-500 tracking-wide">
                        {item.label}
                      </div>
                      <div className="mt-1 text-sm text-neutral-800 leading-6">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/chat" className="inline-flex items-center justify-center h-10 px-5 rounded-xl border border-neutral-300 hover:border-blue-600 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View a sample snapshot
                  </Link>
                </div>
                {snapshotPreview.disclaimer && (
                  <p className="mt-4 text-xs text-neutral-500">
                    {snapshotPreview.disclaimer}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social proof summary - Metrics version */}
      <section aria-label="Social proof" className="py-12 sm:py-16 bg-neutral-50 border-y border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
              {socialProof.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600">
              {socialProof.rating.badge} rate {socialProof.rating.value} {socialProof.rating.label}
            </p>
          </div>
          {socialProof.metrics && (
            <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
              {socialProof.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-8 min-h-[180px] sm:min-h-[220px]"
                >
                  <div className="text-[44px] font-semibold tracking-tight leading-tight text-neutral-900">
                    {metric.value}
                  </div>
                  <div className="mt-3 text-sm sm:text-base text-neutral-600 leading-6">
                    {metric.subtitle || metric.label}
                  </div>
                </div>
              ))}
            </div>
          )}
          {socialProof.subtitle && (
            <p className="mt-6 text-xs text-neutral-500 text-center">
              {socialProof.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Why importers work with NexSupply */}
      <section aria-label="Benefits" className="py-12 sm:py-16 bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
              {benefits.title}
            </h2>
          </div>
          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
            {benefits.items.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 sm:p-6 min-h-[140px] sm:min-h-[160px]"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-neutral-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-6">
                    {benefit.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transparent Invoice Preview - Removed to avoid duplication with Home */}

      {/* Final CTA */}
      <section aria-label="Call to action" className="py-12 sm:py-14 bg-black overflow-visible">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {cta.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-6 max-w-2xl mx-auto">
            {cta.body}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={cta.buttonHref || '/chat'} className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Get instant snapshot
              </button>
            </Link>
            <Link href="/chat" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto h-11 px-6 rounded-xl border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 bg-white font-semibold"
              >
                Talk to a manager
              </button>
            </Link>
          </div>
          {cta.helperText && (
            <p className="mt-4 text-xs text-neutral-400">
              {cta.helperText}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
