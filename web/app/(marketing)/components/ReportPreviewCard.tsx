'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export function ReportPreviewCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'costs' | 'risks'>('summary');
  
  return (
    <div className="relative rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
      {/* Faux Top Bar with Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50" role="tablist">
        <div className="flex">
          <button
            onClick={() => setActiveTab('summary')}
            role="tab"
            aria-selected={activeTab === 'summary'}
            aria-controls="summary-panel"
            id="summary-tab"
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'summary'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-neutral-800'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('costs')}
            role="tab"
            aria-selected={activeTab === 'costs'}
            aria-controls="costs-panel"
            id="costs-tab"
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'costs'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-neutral-800'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            Costs
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            role="tab"
            aria-selected={activeTab === 'risks'}
            aria-controls="risks-panel"
            id="risks-tab"
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'risks'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-neutral-800'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            Risks
          </button>
        </div>
      </div>

      <div className="p-5 md:p-6 min-h-[400px]">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Sourcing Report Preview
            </h3>
            <span className="text-xs text-neutral-400">Example preview</span>
          </div>
        </div>

        {/* Tab Panels with transition */}
        <div className="transition-opacity duration-200">
          {/* Summary Tab Panel */}
          {activeTab === 'summary' && (
            <div
              id="summary-panel"
              role="tabpanel"
              aria-labelledby="summary-tab"
              className="space-y-4"
            >
              {/* Decision Summary */}
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Decision Summary
                </h4>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-2">
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">GO</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1.5">
                  Project shows strong viability with manageable compliance requirements.
                </p>
              </div>

              {/* Cost Range */}
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Estimated Cost Range
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white font-mono">$1.85</span>
                  <span className="text-sm text-neutral-500">-</span>
                  <span className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white font-mono">$2.35</span>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-2">per unit DDP</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                  Based on 3 factory options. Final pricing confirmed after deposit.
                </p>
              </div>

              {/* Risk Highlights */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Risk Highlights
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Compliance </span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Low risk</span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Standard certifications required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-2.5 h-2.5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Duty </span>
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Moderate</span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">~8.5% estimated duty rate</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Supply Chain </span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Stable</span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Multiple verified factory options</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Costs Tab Panel */}
          {activeTab === 'costs' && (
            <div
              id="costs-panel"
              role="tabpanel"
              aria-labelledby="costs-tab"
              className="space-y-4"
            >
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  DDP Cost Breakdown
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Factory FOB</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">$1.20</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Logistics</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">$0.35</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Customs and Duties</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">$0.15</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Packaging</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">$0.10</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Management Fee (5%)</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">$0.06</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-neutral-300 dark:border-neutral-600">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Total DDP per unit</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white font-mono">$1.86</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                  All pass-through costs billed at cost. 5% management fee on FOB only.
                </p>
              </div>
            </div>
          )}

          {/* Risks Tab Panel */}
          {activeTab === 'risks' && (
            <div
              id="risks-panel"
              role="tabpanel"
              aria-labelledby="risks-tab"
              className="space-y-4"
            >
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Risk Assessment
                </h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-green-900 dark:text-green-100">Compliance</span>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Standard certifications required. No special handling needed.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">AD/CVD Risk</span>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">No active AD/CVD orders. Monitor for category changes.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-green-900 dark:text-green-100">Supply Chain</span>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Multiple verified factory options. Stable production capacity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Section - Only show on Summary tab */}
        {activeTab === 'summary' && isExpanded && (
          <>
            {/* Next Actions */}
            <div className="mb-4 pb-4 border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
              <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                Next Actions
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Review detailed cost breakdown and assumptions</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Deposit $49 to unlock manager and factory quotes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Receive 3 factory quotes within 7 days</span>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                Key Assumptions
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-400 mt-0.5">•</span>
                  <span>MOQ  1,000 units  Lead time  45-60 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-400 mt-0.5">•</span>
                  <span>Shipping  LCL from Yiwu to US West Coast</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-400 mt-0.5">•</span>
                  <span>Category  Consumer goods  snack category</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Expand/Collapse Button - Only show on Summary tab */}
        {activeTab === 'summary' && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-all border border-blue-200 dark:border-blue-800 mt-4"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>View full sample report</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
            Final analysis confirmed by a manager within 1 business day.
          </p>
        </div>
      </div>
    </div>
  );
}
