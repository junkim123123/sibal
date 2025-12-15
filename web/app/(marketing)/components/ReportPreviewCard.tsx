'use client';

import { CheckCircle, AlertTriangle, ArrowRight, Lock, Factory } from 'lucide-react';

export function ReportPreviewCard() {
  return (
    <div className="relative rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-1">
          Sourcing Report Preview
        </h3>
        <div className="h-px bg-gradient-to-r from-neutral-200 to-transparent" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Lock className="w-3 h-3" />
          Product cost locked 3 months
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Factory className="w-3 h-3" />
          3 factory quote options within 7 days
        </span>
      </div>

      {/* Decision Summary */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Decision Summary
        </h4>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 mb-2">
          <span className="text-xs font-semibold text-blue-900">GO</span>
        </div>
        <p className="text-sm text-neutral-700 leading-relaxed mt-2">
          Project shows <span className="font-semibold text-neutral-900">strong viability</span> with manageable compliance requirements. 
          Recommended to proceed with deposit for factory quotes.
        </p>
      </div>

      {/* Cost Range */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Estimated Cost Range
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-bold text-neutral-900 font-mono">$1.85</span>
          <span className="text-sm text-neutral-500">-</span>
          <span className="text-3xl md:text-4xl font-bold text-neutral-900 font-mono">$2.35</span>
          <span className="text-sm text-neutral-600 ml-2">per unit DDP</span>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Based on 3 factory options. Final pricing confirmed after deposit.
        </p>
      </div>

      {/* Risk Highlights */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Risk Highlights
        </h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3 h-3 text-green-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-neutral-700">Compliance: </span>
              <span className="text-xs text-green-600 font-medium">Low risk</span>
              <p className="text-xs text-neutral-500 mt-0.5">Standard certifications required</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-3 h-3 text-yellow-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-neutral-700">Duty: </span>
              <span className="text-xs text-yellow-600 font-medium">Moderate</span>
              <p className="text-xs text-neutral-500 mt-0.5">~8.5% estimated duty rate</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3 h-3 text-green-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-neutral-700">Supply Chain: </span>
              <span className="text-xs text-green-600 font-medium">Stable</span>
              <p className="text-xs text-neutral-500 mt-0.5">Multiple verified factory options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Next Actions
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-neutral-700">
            <ArrowRight className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span>Review detailed cost breakdown and assumptions</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700">
            <ArrowRight className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span>Deposit $49 to unlock manager and factory quotes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700">
            <ArrowRight className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span>Receive 3 factory quotes within 7 days</span>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Key Assumptions
        </h4>
        <ul className="space-y-1.5 text-xs text-neutral-600">
          <li className="flex items-start gap-2">
            <span className="text-neutral-400 mt-0.5">•</span>
            <span>MOQ: 1,000 units | Lead time: 45-60 days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400 mt-0.5">•</span>
            <span>Shipping: LCL from Yiwu to US West Coast</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400 mt-0.5">•</span>
            <span>Category: Consumer goods (snack category)</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500 leading-relaxed">
          Example report preview. Final analysis confirmed by a manager within 1 business day.
        </p>
      </div>
    </div>
  );
}

