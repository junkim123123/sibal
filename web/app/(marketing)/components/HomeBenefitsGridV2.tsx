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
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
            {t.home.benefits.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

