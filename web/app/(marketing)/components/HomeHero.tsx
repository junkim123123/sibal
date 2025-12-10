'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Factory, Ship, Scale } from 'lucide-react';

type Props = {
  page: any | null;
};

export default function HomeHero({ page }: Props) {
  const router = useRouter();

  const handleStartAnalysis = () => {
    router.push('/chat');
  };

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center justify-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium text-neutral-700 bg-neutral-100 border border-neutral-200/50">
                Predictable Sourcing for Modern Brands
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
              Stop Guessing.{' '}
              <span className="text-neutral-950 font-extrabold">Start Sourcing with Confidence.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 leading-relaxed max-w-2xl">
              We combine <span className="font-semibold text-neutral-900">AI sourcing intelligence</span> with <span className="font-semibold text-neutral-900">owned packing infrastructure</span> to help FBA sellers and retailers import with <span className="font-semibold text-neutral-900">total clarity and control.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-2 group"
              >
                Start Free Analysis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link
                href="/how-it-works"
                className="text-base font-medium text-neutral-700 hover:text-neutral-900 transition-colors inline-flex items-center gap-1"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Right: Sourcing Intelligence Card */}
          <div className="relative w-full mt-8 lg:mt-0">
            <div className="relative rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200/60 shadow-xl p-6 md:p-8 lg:p-10">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-1">
                  Landed Cost Breakdown
                </h3>
                <div className="h-px bg-gradient-to-r from-neutral-200 to-transparent" />
              </div>

              {/* Main Price */}
              <div className="mb-8 text-center">
                <p className="text-6xl md:text-7xl lg:text-8xl font-bold text-neutral-900 mb-2 font-mono tracking-tight">
                  $2.10
                </p>
                <p className="text-sm font-medium text-neutral-600">
                  per unit landed cost
                </p>
              </div>

              {/* Line Items */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Factory className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Factory Cost</span>
                  </div>
                  <span className="text-base font-bold font-mono text-neutral-900">$1.50</span>
                </div>
                
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <Ship className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Int&apos;l Logistics</span>
                  </div>
                  <span className="text-base font-bold font-mono text-neutral-900">$0.40</span>
                </div>
                
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Est. Duties</span>
                  </div>
                  <span className="text-base font-bold font-mono text-neutral-900">$0.20</span>
                </div>
              </div>

              {/* Compliance Badge - 강조 */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 border-2 border-green-200 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-green-700">
                    Compliance Check: PASSED
                  </span>
                </div>
                <p className="mt-2.5 text-xs font-medium text-green-600">
                  Risk: Low
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}