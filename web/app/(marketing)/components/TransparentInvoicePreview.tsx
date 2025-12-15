'use client';

import { Factory, Truck, Scale, Package, Percent, Info } from 'lucide-react';

export function TransparentInvoicePreview() {
  return (
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Transparent Invoice Preview
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            See exactly how costs are structured. All pass-through costs are billed at cost, 
            with a transparent 5% management fee on FOB.
          </p>
        </div>

        {/* Invoice Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wider">
                  Sample Invoice Breakdown
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Based on $10,000 FOB order
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600 dark:text-blue-400">Total DDP</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 font-mono">
                  $12,850
                </p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {/* Factory FOB */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Factory className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Factory FOB
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Product cost (locked for 3 months)
                  </p>
                </div>
              </div>
              <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                $10,000
              </span>
            </div>

            {/* Logistics */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Logistics
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    At cost (pass-through)
                  </p>
                </div>
              </div>
              <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                $1,200
              </span>
            </div>

            {/* Customs and Duties */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Customs and Duties
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    At cost (pass-through)
                  </p>
                </div>
              </div>
              <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                $850
              </span>
            </div>

            {/* Packaging and Kitting */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Packaging and Kitting
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    At cost (pass-through)
                  </p>
                </div>
              </div>
              <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                $500
              </span>
            </div>

            {/* NexSupply Management Fee */}
            <div className="px-6 py-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                  <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    NexSupply Management Fee
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    5% of FOB ($10,000 × 5%)
                  </p>
                </div>
              </div>
              <span className="text-base font-bold font-mono text-blue-900 dark:text-blue-100">
                $500
              </span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Transparent Pricing Structure
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Logistics, customs, duties, and packaging costs are <strong>pass-through at cost</strong> with no markup. 
                NexSupply charges a <strong>flat 5% management fee on FOB</strong> for production management and QC coordination. 
                This fee covers our services; all other costs are transparently billed at actual cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

