'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, TrendingUp, Clock, DollarSign, Check, Info } from 'lucide-react';

type TabType = 'summary' | 'costs' | 'risks';

type ChecklistItemStatus = 'not-started' | 'in-progress' | 'done';

export function ReportPreviewCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [checklistStatus, setChecklistStatus] = useState<Record<string, ChecklistItemStatus>>({
    'spec-sheet': 'not-started',
    'label-draft': 'not-started',
    'hts-confirm': 'not-started',
  });
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
              Sourcing report preview
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
                  Decision summary
                </h4>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-2">
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">GO</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1.5 mb-2">
                  Based on your inputs, this project looks viable with manageable compliance requirements.
                </p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                  You will see landed cost drivers, duty exposure, and top risks before you commit to inventory.
                </p>
              </div>

              {/* Cost Range */}
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Estimated cost range
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white font-mono">$1.85</span>
                  <span className="text-sm text-neutral-500">to</span>
                  <span className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white font-mono">$2.35</span>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-2">per unit, DDP</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                  Range reflects three factory options and shipping assumptions. Final pricing is confirmed after deposit.
                </p>
              </div>

              {/* Next Step */}
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Next step
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Upload a product link or photo. We will return a snapshot with three sourcing options.
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => window.location.href = '/chat'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Get free snapshot
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-all border border-blue-200 dark:border-blue-800"
                >
                  View full sample report
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
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Confidence band
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Confidence level,</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                    Medium
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                  Factory quotes are stable, shipping and packaging assumptions can shift with order size and routing.
                </p>

                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 mt-4">
                  DDP cost breakdown
                </h4>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Factory FOB</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$1.20</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Logistics</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.35</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Customs and duties</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.15</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Packaging and labeling</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.10</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Management fee, 5% of FOB</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white font-mono ml-4">$0.06</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-neutral-300 dark:border-neutral-600">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Total DDP per unit</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white font-mono">$1.86</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-3">
                  Pass through costs are billed at cost. Management fee applies to FOB only.
                </p>
                
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-3">
                  Assumptions include destination, carton specs, and target incoterms. Updating these tightens the range.
                </p>
                
                {/* Confidence Band */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Confidence band</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                      Medium confidence
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mb-3">
                    This range reflects remaining unknowns that tighten after manager confirmation.
                  </p>
                  
                  {/* Confidence Bar */}
                  <div className="mb-2">
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 relative overflow-hidden">
                      <div className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400">What drives the range</span>
                      <div className="flex items-center gap-1" title="Confidence is based on how stable the lane and specs are, and how many inputs are confirmed.">
                        <Info className="w-3 h-3 text-neutral-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Range Driver Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {['Freight variance', 'Packaging assumptions', 'Duty classification', 'Customs exam tail risk', 'Local delivery zone', 'MOQ and packout'].map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mb-4">
                    Most inputs stable. One or two variables can move the total.
                  </p>
                  
                  {/* How to Tighten */}
                  <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">How to tighten this range</p>
                    <ul className="space-y-1.5 text-[10px] text-neutral-600 dark:text-neutral-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Confirm carton dimensions and pack count</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Confirm product materials and usage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Share target port and delivery zip</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Upload label and ingredient list if applicable</span>
                      </li>
                    </ul>
                  </div>
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
                
                {/* Top Risk + Recommended Action */}
                <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Risk Card */}
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Top risk</span>
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">Duty classification uncertainty</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                              Moderate
                            </span>
                          </div>
                          <p className="text-[10px] text-yellow-700 dark:text-yellow-300 mt-1">
                            HTS classification may change the duty rate and impact the landed cost range.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Action Checklist */}
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Recommended action</span>
                      </div>
                      <p className="text-[10px] text-blue-700 dark:text-blue-300 mb-3">
                        Share product photos, materials, and use case. We will confirm HTS and screen AD or CVD exposure.
                      </p>
                      <ul className="space-y-2">
                        {[
                          { id: 'spec-sheet', label: 'Share spec sheet and materials list' },
                          { id: 'label-draft', label: 'Approve label draft and carton marks' },
                          { id: 'hts-confirm', label: 'Confirm HTS assumption with product description' },
                        ].map((item) => {
                          const status = checklistStatus[item.id];
                          return (
                            <li key={item.id} className="flex items-start gap-2">
                              <button
                                onClick={() => {
                                  const nextStatus: ChecklistItemStatus = 
                                    status === 'not-started' ? 'in-progress' :
                                    status === 'in-progress' ? 'done' : 'not-started';
                                  setChecklistStatus(prev => ({ ...prev, [item.id]: nextStatus }));
                                }}
                                className="flex-shrink-0 mt-0.5"
                                aria-label={`${item.label} - ${status}`}
                              >
                                {status === 'done' ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : status === 'in-progress' ? (
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 dark:border-blue-400 bg-blue-100 dark:bg-blue-900/30" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-400" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <span className={`text-[10px] ${status === 'done' ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                  {item.label}
                                </span>
                                {status !== 'not-started' && (
                                  <span className="ml-2 text-[9px] text-neutral-500 dark:text-neutral-400 capitalize">
                                    {status === 'in-progress' ? 'In progress' : 'Done'}
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                        <button
                          onClick={() => window.location.href = '/chat'}
                          className="w-full text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-center"
                        >
                          Send to manager →
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-3 italic">
                    We flag risks early so you can decide before committing funds.
                  </p>
                </div>

                {/* Other Risks */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <h4 className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                    Other checks
                  </h4>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-green-900 dark:text-green-100">Compliance</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                              Low risk
                            </span>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Standard certifications likely. No special handling expected.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">AD or CVD</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                              Monitor
                            </span>
                          </div>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">No active orders detected for the assumed classification. Recheck if category or materials change.</p>
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
                          <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Multiple qualified factories. Lead time risk depends on MOQ and packaging complexity.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    We flag risks early, then document the decision path so you can move fast with fewer surprises.
                  </p>
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

        {/* Footer - Only show on Summary tab */}
        {activeTab === 'summary' && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
              Final analysis is confirmed by a manager within 1 business day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
