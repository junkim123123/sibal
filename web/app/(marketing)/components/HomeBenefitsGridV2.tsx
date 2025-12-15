'use client';

import { Shield, Lock, DollarSign, Factory, Truck, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';

const features = [
  {
    icon: Shield,
    title: 'Transparent Pricing',
    body: 'All logistics, customs, duties, and packaging costs are pass-through at cost with zero markup. Transparent 5% management fee on FOB.',
  },
  {
    icon: Lock,
    title: 'Price Lock Guarantee',
    body: 'Factory FOB locked for 3 months once quoted. No surprise price increases during your production window.',
  },
  {
    icon: Factory,
    title: 'Hub Operations',
    body: 'Owned quality control hubs in Seoul, Yiwu, Shantou, and Vung Tau. Rigorous QC processes to minimize defects.',
  },
  {
    icon: DollarSign,
    title: 'Pass-Through Billing',
    body: 'Logistics, customs, duties, packaging materials, labeling, kitting, and forwarding billed at actual cost with no markup.',
  },
  {
    icon: Truck,
    title: 'Manager Execution',
    body: 'Dedicated manager assigned within 1 business day after deposit. Real factory quotes from 3 options within 7 days.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Controls',
    body: 'AI-powered risk assessment flags compliance issues, AD/CVD risks, and supply chain concerns before you commit.',
  },
];

export default function HomeBenefitsGridV2() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-neutral-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
            {t.home.benefits.title}
          </h2>
          <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            See how transparent pricing works in practice. All pass-through costs are billed at cost with zero markup.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {feature.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
