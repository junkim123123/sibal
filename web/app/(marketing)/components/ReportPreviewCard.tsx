'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, TrendingUp, Clock, DollarSign } from 'lucide-react';

type TabType = 'summary' | 'costs' | 'risks';

export function ReportPreviewCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const tabListRef = useRef<HTMLDivElement>(null);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle tab change
  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
  };

  // Keyboard navigation for tabs
  const handleKeyDown = (e: React.KeyboardEvent, currentTab: TabType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(currentTab);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs: TabType[] = ['summary', 'costs', 'risks'];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      handleTabChange(tabs[prevIndex]);
      // Focus the previous tab
      const tabButtons = tabListRef.current?.querySelectorAll('button[role="tab"]');
      if (tabButtons && tabButtons[prevIndex]) {
        (tabButtons[prevIndex] as HTMLButtonElement).focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs: TabType[] = ['summary', 'costs', 'risks'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      handleTabChange(tabs[nextIndex]);
      // Focus the next tab
      const tabButtons = tabListRef.current?.querySelectorAll('button[role="tab"]');
      if (tabButtons && tabButtons[nextIndex]) {
        (tabButtons[nextIndex] as HTMLButtonElement).focus();
      }
    }
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'summary', label: 'Summary' },
    { id: 'costs', label: 'Costs' },
    { id: 'risks', label: 'Risks' },
  ];

  return (
    <div className="relative rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden z-10">
      {/* Segmented Control Style Tabs */}
      <div 
        ref={tabListRef}
        className="p-1.5 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700" 
        role="tablist"
      >
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabChange(tab.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              type="button"
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all relative ${
                isReducedMotion ? '' : 'duration-150'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              {tab.label}
              <span 
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full transition-all ${
                  isReducedMotion ? '' : 'duration-150'
                } ${activeTab === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 md:p-6 min-h-[420px]">
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
        <div className="relative min-h-[320px]">
          {/* Summary Tab Panel */}
          {activeTab === 'summary' && (
            <div
              key="summary"
              id="summary-panel"
              role="tabpanel"
              aria-labelledby="summary-tab"
              className={`space-y-4 ${isReducedMotion ? '' : 'animate-[fadeIn_150ms_ease-in-out]'}`}
            >
              {/* Decision Summary */}
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Decision Summary
                </h4>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-2">
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">GO</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1.5 mb-3">
                  Project shows strong viability with manageable compliance requirements.
                </p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  This report helps you decide faster by showing landed cost, duty risk, and compliance flags before you commit to inventory.
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

              {/* CTA */}
              <div className="mt-4">
                <button
                  onClick={() => window.location.href = '/chat'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Get free snapshot
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Costs Tab Panel */}
          {activeTab === 'costs' && (
            <div
              key="costs"
              id="costs-panel"
              role="tabpanel"
              aria-labelledby="costs-tab"
              className={`space-y-4 ${isReducedMotion ? '' : 'animate-[fadeIn_150ms_ease-in-out]'}`}
            >
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  DDP cost breakdown
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                  Example unit economics at 10,000 units
                </p>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Factory FOB</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Quoted from 3 factories</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$1.22</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Freight and origin charges</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Ocean freight, port, docs</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.42</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Last mile to 3PL</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Delivery to your US warehouse</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.12</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Customs and duties</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Based on current HTS estimate</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.17</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Packaging and kitting</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Labeling and carton work if needed</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.08</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Compliance reserve</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Testing, claims review, or labeling fixes</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.03</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">NexSupply management fee</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">5% on FOB only</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.06</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-neutral-300 dark:border-neutral-600">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Total DDP per unit</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white font-mono">$2.10</span>
                  </div>
                </div>
                
                {/* Confidence Band */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Confidence band</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                      Medium
                    </span>
                  </div>
                </div>

                {/* Range Drivers */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Range drivers</p>
                  <ul className="space-y-1.5 text-[10px] text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2">
                      <span className="text-neutral-400 mt-0.5">•</span>
                      <span>Freight routing and seasonality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neutral-400 mt-0.5">•</span>
                      <span>HTS classification and declared value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neutral-400 mt-0.5">•</span>
                      <span>Packaging spec and labor steps</span>
                    </li>
                  </ul>
                </div>

                {/* Note */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Final DDP tightens after product spec and routing are confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Risks Tab Panel */}
          {activeTab === 'risks' && (
            <div
              key="risks"
              id="risks-panel"
              role="tabpanel"
              aria-labelledby="risks-tab"
              className={`space-y-4 ${isReducedMotion ? '' : 'animate-[fadeIn_150ms_ease-in-out]'}`}
            >
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Risk assessment
                </h4>
                
                {/* Top Risk */}
                <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">Top risk</span>
                        <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">Duty and AD CVD exposure</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                          Moderate
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1.5 font-medium">
                        Recommended action: Confirm HTS with a broker, collect material composition, run AD CVD screen before PO
                      </p>
                    </div>
                  </div>
                </div>

                {/* Secondary Risks */}
                <div className="space-y-2.5 mb-4">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-green-900 dark:text-green-100">Compliance</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Low
                          </span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Standard certifications required. No special handling needed.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-green-900 dark:text-green-100">Supply chain</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Stable
                          </span>
                        </div>
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
          <div className={`mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 ${isReducedMotion ? '' : 'animate-[fadeIn_150ms_ease-in-out]'}`}>
            {/* Next Actions */}
            <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
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
          </div>
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
