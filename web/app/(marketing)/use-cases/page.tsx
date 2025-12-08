// Use Cases Page - Config-driven
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCasesPageContent } from '@/lib/content/useCasesPage';

export const revalidate = 60;

export default async function UseCasesPage() {
  const { hero, segments, commonProjects, workflow, pricing, testimonials, cta } = useCasesPageContent;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section aria-label="Hero" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
            {hero.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link href={hero.ctaHref}>
              <Button
                variant="primary"
                size="lg"
                className="rounded-full px-6 md:px-8 py-3 md:py-3.5"
              >
                {hero.ctaLabel}
              </Button>
            </Link>
            <Link
              href="#projects"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Find Your Strategy ↓
            </Link>
          </div>
          <div className="mt-12 border-t border-neutral-200"></div>
        </div>
      </section>

      {/* Who NexSupply helps - Segments */}
      <section aria-label="Who NexSupply helps" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-neutral-900">
            Tailored Sourcing Engines for Every Scale
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 text-center max-w-2xl mx-auto">
            NexSupply works for Amazon FBA sellers, DTC brands, offline buyers, and trading companies.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {segments.map((segment) => {
              const Icon = segment.icon;
              return (
                <div
                  key={segment.id}
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm"
                >
                  <div className="grid gap-4 lg:grid-cols-[1.2fr,1.8fr] items-start">
                    {/* Left column */}
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {segment.label}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                        {segment.description}
                      </p>
                    </div>

                    {/* Right column */}
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-3">
                        Your Edge
                      </p>
                      {segment.decisions && segment.decisions.length > 0 && (
                        <ul className="space-y-2">
                          {segment.decisions.map((decision, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 flex-shrink-0" />
                              <span className="text-sm text-neutral-600 leading-relaxed">{decision}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common projects we help with */}
      <section id="projects" aria-label="Common projects" className="py-16 sm:py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-neutral-900">
            {commonProjects.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 text-center max-w-2xl mx-auto">
            Typical ways importers use NexSupply to test ideas, compare options, or clean up supply chains.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {commonProjects.items.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {project.title}
                  </h3>
                  {project.badge && (
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 whitespace-nowrap ml-2">
                      {project.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {project.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <span className="font-medium">Scope:</span> {project.scope}
                    </span>
                    <span>
                      <span className="font-medium">Timeline:</span> {project.timeline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How NexSupply fits into your workflow */}
      <section aria-label="Workflow" className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
              {workflow.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
              {workflow.subtitle}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
            {workflow.steps.map((step) => (
              <div
                key={step.id}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 h-full flex flex-col"
              >
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700 mb-4 w-fit">
                  Step {step.id}
                </span>
                <h3 className="text-base font-semibold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed flex-1 max-w-sm">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What does it cost */}
      <section aria-label="Pricing" className="py-16 sm:py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
              {pricing.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600">
              {pricing.subtitle}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm">
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700 mb-4">
                {pricing.analysis.chip}
              </span>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {pricing.analysis.title}
              </h3>
              <ul className="space-y-3 text-sm text-neutral-600">
                {pricing.analysis.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm">
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700 mb-4">
                {pricing.orders.chip}
              </span>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {pricing.orders.title}
              </h3>
              <ul className="space-y-3 text-sm text-neutral-600">
                {pricing.orders.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What importers are saying */}
      <section aria-label="Testimonials" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
              {testimonials.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
              {testimonials.subtitle}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.items.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm h-full flex flex-col"
              >
                <div className="relative">
                  <span className="text-4xl text-neutral-300 leading-none absolute -top-2 -left-1">"</span>
                  <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase block mb-4 pl-6">
                    {testimonial.role}
                  </span>
                </div>
                <blockquote className="mt-2 pl-6 flex-1">
                  <p className="text-sm sm:text-base text-neutral-800 italic leading-relaxed">
                    {testimonial.quote}
                  </p>
                </blockquote>
                <footer className="mt-4 pl-6 text-xs text-neutral-500">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>— {testimonial.meta}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200/50">
                      <CheckCircle className="w-3 h-3" />
                      Verified Project
                    </span>
                  </div>
                </footer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section aria-label="Call to action" className="py-16 sm:py-20 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            {cta.title}
          </h2>
          <div className="mt-4 space-y-2">
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto">
              {cta.subtitle}
            </p>
            {cta.subtitle2 && (
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto">
                {cta.subtitle2}
              </p>
            )}
          </div>
          <div className="mt-8">
            <Link href={cta.ctaHref}>
              <Button
                variant="primary"
                size="lg"
                className="rounded-full px-6 md:px-8 py-3 md:py-3.5 bg-white text-neutral-900 hover:bg-neutral-100"
              >
                {cta.ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
