// Use Cases Page - Config-driven
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCasesPageContent } from '@/lib/content/useCasesPage';
import { ReportPreviewCard } from '@/app/(marketing)/components/ReportPreviewCard';
import { TransparentInvoicePreview } from '@/app/(marketing)/components/TransparentInvoicePreview';
import { HeroSection } from '@/app/(marketing)/components/HeroSection';
import { Shield, Lock, DollarSign, Factory, Truck, AlertTriangle } from 'lucide-react';

export const revalidate = 60;

export default async function UseCasesPage() {
  const { hero, threeSteps, commonProjects, socialProof, benefits, cta } = useCasesPageContent;

  const benefitIcons = [Shield, Lock, Factory, DollarSign, Truck, AlertTriangle];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection
        title={hero.title}
        valueStatement={hero.body}
        cta={{
          primary: hero.ctaPrimary,
          secondary: hero.ctaSecondary,
          helperText: hero.ctaHelperText,
        }}
        showPreviewCard={true}
      />

      {/* Three Step Strip */}
      <section aria-label="Three steps" className="py-12 md:py-16 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {threeSteps.items.map((step, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {step.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common ways people start */}
      <section id="projects" aria-label="Common projects" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-neutral-900">
            {commonProjects.title}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {commonProjects.items.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3">
                  {project.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  {project.summary}
                </p>
                <p className="text-xs text-neutral-500">
                  {project.footnote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof summary */}
      <section aria-label="Social proof" className="py-16 sm:py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-6">
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
            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
              {socialProof.subtitle}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {socialProof.quotes.map((quote, index) => (
              <div
                key={index}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm h-full flex flex-col"
              >
                <div className="relative">
                  <span className="text-4xl text-neutral-300 leading-none absolute -top-2 -left-1">"</span>
                </div>
                <blockquote className="mt-2 pl-6 flex-1">
                  <p className="text-sm sm:text-base text-neutral-800 italic leading-relaxed">
                    {quote.quote}
                  </p>
                </blockquote>
                <footer className="mt-4 pl-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-500">{quote.author}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/50">
                      <CheckCircle className="w-3 h-3" />
                      Completed Project
                    </span>
                  </div>
                </footer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why importers work with NexSupply */}
      <section aria-label="Benefits" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
              {benefits.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Transparent Invoice Preview */}
      <TransparentInvoicePreview />

      {/* Final CTA */}
      <section aria-label="Call to action" className="py-16 sm:py-20 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            {cta.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto">
            {cta.body}
          </p>
          <div className="mt-8">
            <Link href={cta.buttonHref}>
              <Button
                className="rounded-lg px-6 md:px-8 py-3 md:py-3.5 bg-white text-neutral-900 hover:bg-neutral-100"
              >
                {cta.buttonLabel}
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-xs text-neutral-400 text-center max-w-2xl mx-auto">
            {cta.disclaimer}
          </p>
        </div>
      </section>
    </div>
  );
}
