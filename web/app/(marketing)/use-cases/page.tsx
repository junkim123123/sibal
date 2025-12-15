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
      <section aria-label="Hero" className="py-12 md:py-[72px] bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-[52px] md:text-[56px] font-bold tracking-tight text-neutral-900 leading-tight mb-4">
              {hero.title}
            </h1>
            <p className="text-base text-neutral-600 leading-relaxed mb-6">
              {hero.body}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-3">
              <Link href={hero.ctaPrimary.href} className="w-full sm:w-auto">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto">
                  {hero.ctaPrimary.label}
                </Button>
              </Link>
              <Link href={hero.ctaSecondary.href} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto"
                >
                  Talk to a manager
                </Button>
              </Link>
            </div>
            {hero.ctaHelperText && (
              <div className="mt-3 space-y-1">
                {hero.ctaHelperText.split('. ').filter(Boolean).map((line, i, arr) => (
                  <p key={i} className="text-xs text-neutral-500">
                    {line}
                    {i < arr.length - 1 ? '.' : ''}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Common ways people start */}
      <section id="projects" aria-label="Common projects" className="py-12 md:py-[72px] bg-white border-b border-neutral-100">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-[34px] md:text-[38px] font-semibold text-neutral-900 mb-3">
              {commonProjects.title}
            </h2>
            {commonProjects.subtitle && (
              <p className="text-base text-neutral-600 max-w-2xl mx-auto">
                {commonProjects.subtitle}
              </p>
            )}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
            {commonProjects.items.map((project) => (
              <Link
                key={project.id}
                href="/chat"
                className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all h-full flex flex-col group cursor-pointer"
              >
                {project.badge && (
                  <span className="inline-block text-xs font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full mb-3 w-fit">
                    {project.badge}
                  </span>
                )}
                <h3 className="text-[20px] md:text-[22px] font-semibold text-neutral-900 mb-3">
                  {project.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                  {project.summary}
                </p>
                {project.deliverables && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Included in the snapshot</p>
                    <ul className="space-y-1 text-xs text-neutral-600 leading-relaxed">
                      {project.deliverables.split('\n').map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-neutral-400 mt-0.5 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto pt-4 border-t border-neutral-100">
                  {project.outcomeExample && (
                    <p className="text-xs font-medium text-neutral-700 mb-2">
                      {project.outcomeExample}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400 mb-3">
                    {project.footnote}
                  </p>
                  {project.ctaLabel && (
                    <Link href="/chat" className="mt-3">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center font-semibold transition-all rounded-lg px-4 py-2 text-sm border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 bg-white"
                      >
                        {project.ctaLabel}
                      </button>
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
        <section aria-label="Snapshot preview" className="py-12 md:py-[72px] bg-neutral-50 border-b border-neutral-100">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-[34px] md:text-[38px] font-semibold text-neutral-900 mb-2">
                {snapshotPreview.title}
              </h2>
              {snapshotPreview.subtitle && (
                <p className="text-base text-neutral-600">
                  {snapshotPreview.subtitle}
                </p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left: Preview mockup */}
              <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-full"></div>
                  <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="h-2 bg-neutral-100 rounded w-full mb-2"></div>
                    <div className="h-2 bg-neutral-100 rounded w-4/5 mb-2"></div>
                    <div className="h-2 bg-neutral-100 rounded w-3/4"></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-yellow-100 border border-yellow-200 rounded"></div>
                      <div className="h-6 w-20 bg-blue-100 border border-blue-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: Summary */}
              <div className="space-y-4">
                {snapshotPreview.items.map((item, i) => (
                  <div key={i} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm text-neutral-700">
                      {item.value}
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Link href="/chat">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center font-semibold transition-all rounded-lg px-5 py-2.5 text-sm border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 bg-white"
                    >
                      View a sample snapshot
                    </button>
                  </Link>
                </div>
                {snapshotPreview.disclaimer && (
                  <p className="text-xs text-neutral-400">
                    {snapshotPreview.disclaimer}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social proof summary - Metrics version */}
      <section aria-label="Social proof" className="py-12 md:py-[72px] bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-[34px] md:text-[38px] font-semibold text-neutral-900 mb-4">
              {socialProof.title}
            </h2>
            <p className="text-base text-neutral-600 mb-4">
              {socialProof.rating.value} {socialProof.rating.label}
            </p>
          </div>
          {socialProof.metrics && (
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-6">
              {socialProof.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">
                    {metric.subtitle || metric.label}
                  </div>
                  {metric.subtitle && (
                    <div className="text-xs text-neutral-500">
                      {metric.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {socialProof.subtitle && (
            <p className="text-center text-xs text-neutral-500">
              {socialProof.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Why importers work with NexSupply */}
      <section aria-label="Benefits" className="py-12 md:py-[72px] bg-white border-t border-neutral-100">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-[34px] md:text-[38px] font-semibold text-neutral-900">
              {benefits.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.items.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-neutral-600" />
                  </div>
                  <h3 className="text-[20px] md:text-[22px] font-semibold text-neutral-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
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
      <section aria-label="Call to action" className="py-12 md:py-[72px] bg-black overflow-visible">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-[34px] md:text-[38px] font-semibold text-white mb-3">
            {cta.title}
          </h2>
          <p className="text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto">
            {cta.body}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href={cta.buttonHref || '/chat'} className="w-full sm:w-auto">
              <button
                type="button"
                className="inline-flex items-center justify-center font-semibold transition-all rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get a free snapshot
              </button>
            </Link>
            <Link href="/chat" className="w-full sm:w-auto">
              <button
                type="button"
                className="inline-flex items-center justify-center font-semibold transition-all rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 bg-white"
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
