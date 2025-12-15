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
      <section aria-label="Hero" className="py-10 md:py-12 lg:py-14 bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight mb-6">
              {hero.title}
            </h1>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed mb-6">
              {hero.body}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
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
                  {hero.ctaSecondary.label}
                </Button>
              </Link>
            </div>
            {hero.ctaHelperText && (
              <p className="mt-4 text-xs text-neutral-500">
                {hero.ctaHelperText}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Free vs Deposit Comparison */}
      {freeVsDeposit && (
        <section aria-label="Free vs Deposit" className="py-8 md:py-12 bg-neutral-50 border-b border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
                {freeVsDeposit.title}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Snapshot Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  {freeVsDeposit.free.title}
                </h3>
                <ul className="space-y-2 mb-6">
                  {freeVsDeposit.free.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-blue-600 mt-0.5 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/chat" className="block w-full">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center font-semibold transition-all rounded-lg px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Get free snapshot
                  </button>
                </Link>
              </div>
              {/* Deposit Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  {freeVsDeposit.deposit.title}
                </h3>
                <ul className="space-y-2 mb-6">
                  {freeVsDeposit.deposit.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-blue-600 mt-0.5 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/chat" className="block w-full">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center font-semibold transition-all rounded-lg px-6 py-3 border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 bg-white"
                  >
                    Talk to a manager
                  </button>
                </Link>
              </div>
            </div>
            {freeVsDeposit.helperText && (
              <p className="text-center text-xs text-neutral-500 mt-4">
                {freeVsDeposit.helperText}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Snapshot Preview */}
      {snapshotPreview && (
        <section aria-label="Snapshot preview" className="py-8 md:py-12 bg-white border-b border-neutral-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-2">
                {snapshotPreview.title}
              </h2>
              <p className="text-base text-neutral-600">
                {snapshotPreview.subtitle}
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
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
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <Link href="/chat" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                  View a sample snapshot
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {snapshotPreview.disclaimer && (
                <p className="mt-4 text-xs text-neutral-400 text-center">
                  {snapshotPreview.disclaimer}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Common ways people start */}
      <section id="projects" aria-label="Common projects" className="py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
              {commonProjects.title}
            </h2>
            {commonProjects.subtitle && (
              <p className="text-base text-neutral-600 max-w-2xl mx-auto">
                {commonProjects.subtitle}
              </p>
            )}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {commonProjects.items.map((project) => (
              <Link
                key={project.id}
                href="/chat"
                className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all h-full flex flex-col group cursor-pointer"
              >
                {project.badge && (
                  <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-3 w-fit">
                    {project.badge}
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 group-hover:text-blue-600 transition-colors">
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
                          <span className="text-blue-600 mt-0.5 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto pt-4 border-t border-neutral-100">
                  {project.outcomeExample && (
                    <p className="text-xs font-medium text-blue-600 mb-2">
                      {project.outcomeExample}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400 mb-3">
                    {project.footnote}
                  </p>
                  {project.ctaLabel && (
                    <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      {project.ctaLabel}
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof summary - Metrics version */}
      <section aria-label="Social proof" className="py-8 md:py-12 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
              {socialProof.title}
            </h2>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-neutral-200 rounded-lg shadow-sm mb-4">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                {socialProof.rating.badge}
              </span>
              <span className="text-2xl font-bold text-neutral-900">
                {socialProof.rating.value}
              </span>
              <span className="text-sm text-neutral-600">
                {socialProof.rating.label}
              </span>
            </div>
          </div>
          {socialProof.metrics && (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {socialProof.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm text-center"
                >
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {metric.label}
                  </div>
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

      {/* Trust Elements */}
      {trustElements && (
        <section aria-label="Trust elements" className="py-8 md:py-12 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                <h3 className="text-base font-semibold text-neutral-900 mb-2">
                  {trustElements.whatWeCheck.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {trustElements.whatWeCheck.items}
                </p>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                <h3 className="text-base font-semibold text-neutral-900 mb-2">
                  {trustElements.whereWeOperate.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {trustElements.whereWeOperate.items}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why importers work with NexSupply */}
      <section aria-label="Benefits" className="py-8 md:py-12 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
              {benefits.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.items.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
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
      <section aria-label="Call to action" className="pt-16 pb-16 md:pt-20 md:pb-20 bg-black overflow-visible">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-0">
            {cta.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto">
            {cta.body}
          </p>
          {cta.helperText && (
            <p className="mt-2 text-xs text-neutral-400">
              {cta.helperText}
            </p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href={cta.buttonHref || '/chat'} className="w-full sm:w-auto">
              <button
                type="button"
                className="inline-flex items-center justify-center font-semibold transition-all rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto bg-white text-neutral-900 hover:bg-neutral-100"
              >
                Get free snapshot
              </button>
            </Link>
            <Link href="/chat" className="w-full sm:w-auto">
              <button
                type="button"
                className="inline-flex items-center justify-center font-semibold transition-all rounded-lg px-6 md:px-8 py-3 md:py-3.5 w-full sm:w-auto border-2 border-white bg-transparent text-white hover:bg-white hover:text-neutral-900"
              >
                Talk to a manager
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
