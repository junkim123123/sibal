// Use Cases Page Structure (v3 - Product-Level Messaging):
// 1) Hero with people-focused title, concise subtitle, and CTA button
// 2) By seller type (4 large cards with outcome statements and decision-focused projects)
// 3) By project goal (4 small cards with scope, timeline, and positioning)
// 4) How NexSupply fits into your workflow (3 cards - Use cases context)
// 5) What does it cost (2 cards - more specific pricing structure)
// 6) What importers are saying (testimonials with segment tags and context)
// 7) CTA band (enhanced with next steps and timeline)
// 8) Footer (handled in layout)

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Store, Building2, Globe } from 'lucide-react';

export default function UseCasesPage() {

  // Seller type cards with outcome statements and decision-focused projects
  const sellerTypes = [
    {
      label: 'Amazon FBA private label',
      outcomeStatement: 'Sellers who want to validate margins and duty risks before launching a new PL product.',
      description: 'For sellers who want to launch or re-source SKUs with clear landed cost and compliance.',
      keyProjects: [
        {
          title: 'Launch a new FBA brand or product line',
          decision: 'Confirm whether a new product still makes profit after FBA fees, shipping, and duties',
        },
        {
          title: 'Re-source an existing SKU to improve margin',
          decision: 'Compare keeping current factory vs switching to a new supplier for better unit economics',
        },
        {
          title: 'Check AD/CVD and restricted category risk',
          decision: 'Identify compliance flags before committing to inventory in a new category',
        },
        {
          title: 'Compare FBA vs 3PL landed costs',
          decision: 'Choose the most cost-effective fulfillment channel for your product',
        },
      ],
      icon: ShoppingCart,
      bgColor: 'bg-transparent',
      recommendedAction: 'If this matches your situation, start with one of the projects below.',
    },
    {
      label: 'DTC / Shopify brands',
      outcomeStatement: 'Founders who need to protect margin while scaling into new products or regions.',
      description: 'For founders who need to protect margin while scaling into new products or regions.',
      keyProjects: [
        {
          title: 'Per unit cost analysis with DTC fees in mind',
          decision: 'See true margins after ad spend, fulfillment, and platform fees before scaling',
        },
        {
          title: 'Packaging and fulfillment that works with 3PLs',
          decision: 'Optimize packaging and case packs for 3PL-friendly shipping and storage',
        },
        {
          title: 'Adding new SKUs without breaking cash flow',
          decision: 'Test new products with small pilot orders before committing to large inventory',
        },
        {
          title: 'Planning a move into US or EU markets',
          decision: 'Understand landed cost differences and compliance requirements for new markets',
        },
      ],
      icon: Store,
      bgColor: 'bg-transparent',
      recommendedAction: 'If this matches your situation, start with one of the projects below.',
    },
    {
      label: 'Offline retail / wholesale',
      outcomeStatement: 'Buyers making container-level decisions who need numbers they can defend internally.',
      description: 'For buyers making container-level decisions who need numbers they can defend internally.',
      keyProjects: [
        {
          title: 'Case pack and master carton optimization',
          decision: 'Determine optimal case pack sizes for retail shelf space and shipping efficiency',
        },
        {
          title: 'Pallet and container level shipping scenarios',
          decision: 'Compare different shipping methods and volumes to find the best cost structure',
        },
        {
          title: 'Bulk pricing and supplier negotiation support',
          decision: 'Benchmark factory quotes and negotiate better terms with data-backed analysis',
        },
        {
          title: 'Comparing multiple factories for the same item',
          decision: 'Evaluate suppliers on cost, quality, and risk to make an informed choice',
        },
      ],
      icon: Building2,
      bgColor: 'bg-transparent',
      recommendedAction: 'If this matches your situation, start with one of the projects below.',
    },
    {
      label: 'Importers / trading companies',
      outcomeStatement: 'Teams managing many SKUs who need fast, structured checks instead of ad-hoc spreadsheets.',
      description: 'For teams managing many SKUs who need fast, structured checks instead of ad-hoc spreadsheets.',
      keyProjects: [
        {
          title: 'Multi-product portfolio cost and risk review',
          decision: 'Get a unified view of costs and risks across your entire product line',
        },
        {
          title: 'Cross-border compliance checks by HS code',
          decision: 'Verify duty rates and compliance requirements for multiple products at once',
        },
        {
          title: 'Supplier relationship and performance review',
          decision: 'Standardize how you evaluate and compare suppliers across different projects',
        },
        {
          title: 'Standardized pilot process for new factories',
          decision: 'Test new suppliers with a consistent, low-risk pilot process',
        },
      ],
      icon: Globe,
      bgColor: 'bg-transparent',
      recommendedAction: 'If this matches your situation, start with one of the projects below.',
    },
  ];

  // Project goal cards with scope, timeline, and positioning
  const projectGoals = [
    {
      title: 'Launch a new product',
      body: 'Quickly test if a new idea still makes sense after landed cost, duties and fees.',
      scope: '1 SKU, 1 market',
      timeline: 'Typically 1 week for initial report',
      positioning: 'Best for first-time clients',
    },
    {
      title: 'Re-source an existing SKU',
      body: 'Benchmark new factories and routes when your current supplier is too expensive or risky.',
      scope: '1 SKU, multiple supplier options',
      timeline: 'Typically 1–2 weeks for comparison',
      positioning: 'When you need to improve margins',
    },
    {
      title: 'Test a higher-risk category',
      body: 'Explore products with extra compliance or AD/CVD risk without committing to a huge order.',
      scope: '1 SKU, risk-focused analysis',
      timeline: 'Typically 1 week for risk assessment',
      positioning: 'Before entering a new category',
    },
    {
      title: 'Clean up a messy supply chain',
      body: 'Bring quotes, duties, QC and logistics into one view so you can make decisions faster.',
      scope: 'Multiple SKUs, unified view',
      timeline: 'Typically 2 weeks for full review',
      positioning: 'When you need clarity across projects',
    },
  ];

  // Workflow cards - Use cases context
  const workflowSteps = [
    {
      title: 'Share your idea',
      body: 'Pick a seller type and project from this page, then share your product idea. We capture the key details in a structured brief.',
    },
    {
      title: 'Get a cost and risk snapshot',
      body: 'We generate a snapshot tailored to your use case—whether it\'s Amazon FBA, DTC, retail, or trading. The format clearly shows your channel-specific costs.',
    },
    {
      title: 'Decide how far to go',
      body: 'You can stop at the analysis, book a call to go deeper, or move forward to factory search and a pilot order.',
    },
  ];

  // Testimonials with segment tags and context
  const testimonials = [
    {
      segmentTag: 'Amazon FBA seller',
      context: 'When launching a new snack category, we were worried about duties and AD/CVD risks.',
      quote: 'Finally a way to sanity check margins and duties before we commit to inventory.',
      attribution: 'FBA seller, CPG category',
    },
    {
      segmentTag: 'Retail buyer',
      context: 'We were exploring a new hardlines category with complex compliance requirements.',
      quote: 'The compliance flags helped us avoid a very expensive mistake on a new category.',
      attribution: 'Retail buyer, hardlines',
    },
    {
      segmentTag: 'Food & Beverage brand manager',
      context: 'We needed to test a new snack product quickly without committing to a large order.',
      quote: 'We used NexSupply to test a new snack product. The whole process felt fast and contained.',
      attribution: 'Brand manager, food and beverage',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section aria-label="Hero" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 mb-6">
            Who NexSupply helps
          </h1>
          <p className="text-lg sm:text-xl text-neutral-700 font-medium mb-8 max-w-3xl mx-auto leading-relaxed">
            Use cases for Amazon sellers, DTC brands, offline retail buyers, and trading companies—all in one place.
          </p>
          <Link href="/analyze">
            <Button
              variant="primary"
              size="lg"
              className="rounded-full px-8 py-3.5"
            >
              Analyze a product
            </Button>
          </Link>
        </div>
      </section>

      {/* Who NexSupply is for */}
      <section aria-label="Who NexSupply is for" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-12 text-center">
            Who NexSupply is for
          </h2>
          <div className="space-y-8 sm:space-y-12">
            {sellerTypes.map((sellerType, index) => {
              const Icon = sellerType.icon;
              return (
                <Card key={index} className="p-6 sm:p-8 bg-transparent border-neutral-200 shadow-sm">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                          {sellerType.label}
                        </h3>
                      </div>
                      <p className="text-base font-semibold text-neutral-900 mb-3 leading-relaxed">
                        {sellerType.outcomeStatement}
                      </p>
                      <p className="text-base text-neutral-600 leading-relaxed mb-4">
                        {sellerType.description}
                      </p>
                      <p className="text-sm text-neutral-500 italic mt-4">
                        {sellerType.recommendedAction}
                      </p>
                    </div>
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wide">
                        Decisions you can make
                      </h4>
                      {sellerType.keyProjects && sellerType.keyProjects.length > 0 && (
                        <ul className="space-y-4">
                          {sellerType.keyProjects.map((project, i) => (
                            <li key={i} className="space-y-1">
                              <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2.5 flex-shrink-0" />
                                <div>
                                  <span className="text-neutral-900 font-semibold leading-relaxed">
                                    {project.title}
                                  </span>
                                  <p className="text-neutral-600 text-sm leading-relaxed mt-1">
                                    → {project.decision}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common projects we help with */}
      <section aria-label="Common projects" className="py-16 sm:py-20 bg-neutral-50 border-y border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-12 text-center">
            Common projects we help with
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {projectGoals.map((goal, index) => (
              <Card key={index} className="p-6 bg-transparent border-neutral-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-neutral-900">
                    {goal.title}
                  </h3>
                  {goal.positioning && (
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                      {goal.positioning}
                    </span>
                  )}
                </div>
                <p className="text-base text-neutral-600 leading-relaxed mb-4">
                  {goal.body}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-500 pt-4 border-t border-neutral-100">
                  {goal.scope && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Scope:</span> {goal.scope}
                    </span>
                  )}
                  {goal.timeline && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Timeline:</span> {goal.timeline}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How NexSupply fits into your workflow */}
      <section id="how-it-fits" aria-label="How NexSupply fits into your workflow" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 text-center">
            How NexSupply fits into your workflow
          </h2>
          <p className="text-base text-neutral-600 mb-12 text-center max-w-2xl mx-auto">
            Every use case follows the same simple path from idea to first shipment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {workflowSteps.map((step, index) => (
              <Card key={index} className="p-6 bg-transparent border-neutral-200 shadow-sm">
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  {step.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What does it cost */}
      <section aria-label="Pricing" className="py-16 sm:py-20 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 text-center">
            What does it cost
          </h2>
          <p className="text-base text-neutral-600 mb-12 text-center max-w-2xl mx-auto">
            Simple pricing while we are in alpha.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Card */}
            <Card className="p-6 sm:p-8 bg-transparent border-neutral-200 shadow-sm">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Analysis and planning</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2.5 flex-shrink-0" />
                  <span className="text-neutral-600 leading-relaxed">
                    <strong className="text-neutral-900">Flat project fee</strong> for each analysis during alpha
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2.5 flex-shrink-0" />
                  <span className="text-neutral-600 leading-relaxed">
                    Includes AI report and one review call (typically 30+ minutes of analysis)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2.5 flex-shrink-0" />
                  <span className="text-neutral-600 leading-relaxed">
                    No subscription or long term contract during alpha
                  </span>
                </li>
              </ul>
            </Card>

            {/* Right Card */}
            <Card className="p-6 sm:p-8 bg-transparent border-neutral-200 shadow-sm">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">When orders go through NexSupply</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2.5 flex-shrink-0" />
                  <span className="text-neutral-600 leading-relaxed">
                    <strong className="text-neutral-900">Transparent project-based success fee</strong> only when you place orders through us
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2.5 flex-shrink-0" />
                  <span className="text-neutral-600 leading-relaxed">
                    <strong className="text-neutral-900">Fee cap on per unit margin</strong> so your upside stays protected
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2.5 flex-shrink-0" />
                  <span className="text-neutral-600 leading-relaxed">
                    Currently focused on imports into the US and selected EU markets
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* What importers are saying */}
      <section aria-label="Testimonials" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 text-center">
            What importers are saying
          </h2>
          <p className="text-base text-neutral-600 mb-3 text-center max-w-2xl mx-auto">
            Early projects use NexSupply to get clarity on landed cost, lead times and risk before committing.
          </p>
          <p className="text-sm text-neutral-500 mb-12 text-center italic">
            Results from actual projects
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-transparent border-neutral-200 shadow-sm">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    {testimonial.segmentTag}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                  {testimonial.context}
                </p>
                <blockquote className="mb-4">
                  <p className="text-base text-neutral-700 leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </blockquote>
                <footer className="text-sm text-neutral-500">
                  — {testimonial.attribution}
                </footer>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section aria-label="Call to action" className="py-16 sm:py-20 bg-neutral-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to analyze your product?
          </h2>
          <p className="text-lg text-neutral-300 mb-2 max-w-2xl mx-auto">
            Pick your seller type and project goal above, then request your first analysis.
          </p>
          <p className="text-base text-neutral-400 mb-8 max-w-2xl mx-auto">
            We typically respond within 24 hours via email, and schedule a call if needed.
          </p>
          <Link href="/analyze">
            <Button
              variant="primary"
              size="lg"
              className="rounded-full px-8 py-3.5 bg-white text-neutral-900 hover:bg-neutral-100"
            >
              Analyze a product
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
