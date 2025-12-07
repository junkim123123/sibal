/**
 * Professional Sourcing Analysis Dashboard
 * 
 * Dark-mode, grid-based dashboard displaying comprehensive sourcing intelligence
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle, TrendingUp, Factory, Shield, Truck, Package, DollarSign, BarChart3, Calendar, Rocket, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import AnalysisLoader from '@/components/AnalysisLoader';

type Answers = Record<string, string>;

interface AIAnalysisResult {
  financials: {
    estimated_landed_cost: number;
    estimated_margin_pct: number;
    net_profit: number;
  };
  cost_breakdown: {
    factory_exw: number;
    shipping: number;
    duty: number;
    packaging: number;
    customs: number;
    insurance: number;
  };
  scale_analysis: Array<{
    qty: number;
    mode: string;
    unit_cost: number;
    margin: number;
  }>;
  risks: {
    duty?: { level?: string; reason?: string; impact?: string };
    supplier?: { level?: string; reason?: string; impact?: string };
    compliance?: { level?: string; reason?: string; impact?: string; cost?: number };
    logistics?: { level?: string; reason?: string; impact?: string };
    quality?: { level?: string; reason?: string; impact?: string };
  };
  // ✨ Deep Sourcing 2.0: Enhanced Analysis (100% Input Utilization)
  duty_analysis?: {
    hs_code: string; // e.g., "3926.90"
    rate: string; // e.g., "6.5%"
    rationale: string; // "Based on user input 'Plastic'..."
  };
  logistics_insight?: {
    efficiency_score: string; // "High" | "Medium" | "Low"
    container_loading: string; // "Est. 3,500 units per 20ft container"
    advice: string; // "Size is optimized for FBA" or "Reduce box size by 2cm to save fees"
  };
  market_benchmark?: {
    competitor_price: string; // "Est. Retail $30"
    our_price_advantage: string; // "25% Cheaper"
    differentiation_point: string; // "Add eco-packaging to win"
  };
  strategic_advice?: {
    for_business_model: string;
    key_action: string;
  };
  executive_summary?: string;
  osint_risk_score?: number; // OSINT Risk Score (0-100)
  [key: string]: any;
}

// Result Header Component with Request Action Button
function ResultHeader({ 
  productName, 
  landedCost, 
  margin,
  projectId,
  onRequestClick
}: { 
  productName: string; 
  landedCost: number; 
  margin: { min: number; max: number };
  projectId?: string | null;
  onRequestClick?: () => void;
}) {
  return (
    <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{productName}</h1>
          <p className="text-gray-500 text-sm">Sourcing Intelligence Report</p>
        </div>
        <div className="flex items-baseline gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1 tracking-wide">Estimated Landed Cost</p>
            <p className="text-5xl font-bold font-mono text-blue-600">${landedCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1 tracking-wide">Margin</p>
            <p className="text-3xl font-bold font-mono text-gray-900">{margin.min}-{margin.max}%</p>
          </div>
        </div>
      </div>
      {onRequestClick && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={onRequestClick}
            className="w-full md:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-3"
          >
            <Rocket className="w-4 h-4 mr-2 inline" />
            실제 요청 (Get Verified Quote)
          </Button>
        </div>
      )}
    </div>
  );
}

// Cost Breakdown Component (Donut Chart + Table)
function CostBreakdown({ costBreakdown, totalLandedCost }: { costBreakdown: any; totalLandedCost: number }) {
  const chartData = [
    { name: 'Factory', value: costBreakdown.factory_exw || 0, color: '#3b82f6' }, // Blue
    { name: 'Shipping', value: costBreakdown.shipping || 0, color: '#14b8a6' }, // Teal
    { name: 'Duty', value: costBreakdown.duty || 0, color: '#6366f1' }, // Indigo
    { name: 'Packaging', value: costBreakdown.packaging || 0, color: '#64748b' }, // Slate
    { name: 'Customs', value: costBreakdown.customs || 0, color: '#8b5cf6' }, // Purple
    { name: 'Insurance', value: costBreakdown.insurance || 0, color: '#06b6d4' }, // Cyan
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm h-full min-h-[400px] flex flex-col">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Cost Breakdown</h2>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Donut Chart - Left Side (50%) */}
        <div className="flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#111827', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Landed Cost</p>
            <p className="text-2xl font-bold font-mono text-blue-600">${totalLandedCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Data Table - Right Side (50%) */}
        <div className="flex flex-col justify-center space-y-1">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700 truncate">{item.name}</span>
                  <span className="flex-1 border-b border-dotted border-gray-300 mx-2"></span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-gray-900 font-medium font-mono text-sm">${item.value.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-semibold text-sm">Total</span>
              <span className="text-blue-600 font-bold font-mono">${totalLandedCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Profitability Simulator Component
function ProfitabilitySimulator({ totalLandedCost, answers }: { totalLandedCost: number; answers: Answers }) {
  const [retailPrice, setRetailPrice] = useState(49.99);
  
  const channelFees = retailPrice * 0.15; // 15% channel fees (example)
  const netProfit = retailPrice - totalLandedCost - channelFees;
  const profitMargin = (netProfit / retailPrice) * 100;
  
  // Calculate Break-Even ROAS: (Net Profit / Retail Price) * 100
  const breakEvenROAS = netProfit > 0 ? ((netProfit / retailPrice) * 100).toFixed(1) : '0.0';
  
  // Calculate Min. Sell Price: The price where profit becomes $0
  // netProfit = price - totalLandedCost - (price * 0.15) = 0
  // price - price * 0.15 = totalLandedCost
  // price * (1 - 0.15) = totalLandedCost
  // price = totalLandedCost / 0.85
  const minSellPrice = (totalLandedCost / 0.85).toFixed(2);

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm h-full min-h-[400px] flex flex-col">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3 tracking-wide">Profitability Simulator</h2>
      
      <div className="space-y-3 flex-1 flex flex-col">
        <div>
          <label className="text-sm text-gray-700 mb-2 block font-medium">Target Retail Price</label>
          <input
            type="range"
            min="10"
            max="100"
            step="0.01"
            value={retailPrice}
            onChange={(e) => setRetailPrice(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$10</span>
            <span className="text-blue-600 font-bold font-mono">${retailPrice.toFixed(2)}</span>
            <span>$100</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-gray-200 flex-1">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Retail Price</span>
            <span className="text-gray-900 font-mono">+${retailPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Product Cost</span>
            <span className="text-red-600 font-mono">-${totalLandedCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Channel & Fulfillment</span>
            <span className="text-red-600 font-mono">-${channelFees.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 pb-1 border-t border-gray-300">
            <span className="text-gray-900 font-semibold">Net Profit</span>
            <span className="text-emerald-600 font-bold font-mono">+${netProfit.toFixed(2)}</span>
          </div>
          <div className="text-right pb-2">
            <span className="text-xs text-gray-500">Profit Margin: </span>
            <span className="text-emerald-600 font-semibold">{profitMargin.toFixed(1)}%</span>
          </div>
          
          {/* New Metrics Section */}
          <div className="pt-3 mt-3 border-t border-gray-300 space-y-2">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Break-Even ROAS</span>
                <span className="text-blue-600 font-bold font-mono text-sm">{breakEvenROAS}%</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Profit return on ad spend at current price</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Min. Sell Price</span>
                <span className="text-orange-600 font-bold font-mono text-sm">${minSellPrice}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Minimum price to break even (0% profit)</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Scale Analysis Component
function ScaleAnalysis({ scaleAnalysis }: { scaleAnalysis: any[] }) {
  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Scale Analysis</h2>
      <div className="space-y-3">
        {scaleAnalysis.map((scenario, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-gray-900 font-medium">{scenario.qty?.toLocaleString() || 'N/A'} Units</span>
                <span className="text-gray-500 text-xs ml-2">({scenario.mode || 'N/A'})</span>
              </div>
              <div className="text-right">
                <div className="text-blue-600 font-bold font-mono">${scenario.unit_cost?.toFixed(2) || '0.00'}</div>
                <div className="text-emerald-600 text-xs font-medium">{scenario.margin?.toFixed(1) || '0'}% margin</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Risk Assessment Component (2x2 Grid with Left-Border Style)
function RiskAssessment({ risks, osintRiskScore }: { risks: any; osintRiskScore?: number }) {
  const getRiskColor = (level?: string) => {
    if (!level) return { border: 'border-l-gray-400', text: 'text-gray-600', icon: 'text-gray-400' };
    switch (level.toLowerCase()) {
      case 'low':
        return { border: 'border-l-green-500', text: 'text-green-700', icon: 'text-green-600' };
      case 'medium':
        return { border: 'border-l-yellow-500', text: 'text-yellow-700', icon: 'text-yellow-600' };
      case 'high':
        return { border: 'border-l-red-500', text: 'text-red-700', icon: 'text-red-600' };
      default:
        return { border: 'border-l-gray-400', text: 'text-gray-600', icon: 'text-gray-400' };
    }
  };

  const getRiskIcon = (level?: string) => {
    if (!level) return <AlertCircle className="w-5 h-5" />;
    switch (level.toLowerCase()) {
      case 'low':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'high':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const riskItems = [
    { key: 'duty', label: 'Duty Risk', data: risks.duty },
    { key: 'supplier', label: 'Supplier Risk', data: risks.supplier },
    { key: 'compliance', label: 'Compliance Risk', data: risks.compliance },
    { key: 'logistics', label: 'Logistics Risk', data: risks.logistics },
  ].filter(item => item.data);

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Risk Assessment</h2>
      
      {/* ✨ OSINT Risk Score 표시 (새로 추가) */}
      {osintRiskScore !== undefined && (
        <div className="pt-2 pb-4 mb-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-blue-600">
              OSINT Risk Score 
            </span>
            <span className="text-2xl font-bold font-mono text-gray-900">
              {osintRiskScore.toFixed(0)}/100
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            (Based on 500 supplier database & web OSINT signals)
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {riskItems.map((item) => {
          const colors = getRiskColor(item.data?.level);
          const Icon = getRiskIcon(item.data?.level);
          return (
            <div key={item.key} className={`bg-white border-l-4 ${colors.border} rounded-r-lg p-4 border border-gray-200 border-l-0`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={colors.icon}>{Icon}</div>
                <h3 className="text-gray-900 font-medium text-sm">{item.label}</h3>
              </div>
              <p className={`${colors.text} text-xs font-semibold mb-1 uppercase`}>{item.data?.level || 'Unknown'}</p>
              <p className="text-gray-600 text-xs line-clamp-2">{item.data?.reason || 'No details'}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// NexSupply Insight Component (AI 한마디)
function NexSupplyInsight({ strategicAdvice, businessModel }: { strategicAdvice?: any; businessModel?: string }) {
  if (!strategicAdvice) return null;

  return (
    <Card className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <Rocket className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-600 uppercase mb-2 tracking-wide">NexSupply Insight</h3>
          <p className="text-gray-900 font-medium mb-1">{strategicAdvice.for_business_model || `For ${businessModel || 'your business model'}`}</p>
          <p className="text-gray-700 text-sm leading-relaxed">{strategicAdvice.key_action}</p>
        </div>
      </div>
    </Card>
  );
}

// Logistics & Duty Intelligence Component
function LogisticsDutyIntelligence({ 
  dutyAnalysis, 
  logisticsInsight, 
  sizeTier 
}: { 
  dutyAnalysis?: any; 
  logisticsInsight?: any; 
  sizeTier?: string;
}) {
  if (!dutyAnalysis && !logisticsInsight) return null;

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Logistics & Duty Intelligence</h2>
      
      <div className="space-y-4">
        {/* Product Specs */}
        {sizeTier && (
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm">
              <span className="font-medium">Product Specs:</span> {sizeTier}
            </span>
          </div>
        )}

        {/* Container Loading */}
        {logisticsInsight && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-gray-900 font-medium text-sm">Container Loading</span>
            </div>
            <div className="space-y-2 text-sm">
              {logisticsInsight.efficiency_score && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Efficiency Score:</span>
                  <span className={`font-semibold ${
                    logisticsInsight.efficiency_score.toLowerCase() === 'high' ? 'text-green-600' :
                    logisticsInsight.efficiency_score.toLowerCase() === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {logisticsInsight.efficiency_score}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">20ft Container Capacity:</span>
                <span className="text-blue-600 font-bold">
                  {logisticsInsight.container_loading || 'N/A'}
                </span>
              </div>
              {logisticsInsight.advice && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-gray-600 text-xs leading-relaxed">{logisticsInsight.advice}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HS Code & Duty */}
        {dutyAnalysis && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-gray-900 font-medium text-sm">HS Code & Duty Rate</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">HS Code:</span>
                <span className="text-gray-900 font-mono font-medium">{dutyAnalysis.hs_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applied Rate:</span>
                <span className="text-blue-600 font-bold">{dutyAnalysis.rate || 'N/A'}</span>
              </div>
              {dutyAnalysis.rationale && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-gray-600 text-xs leading-relaxed">{dutyAnalysis.rationale}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Competitor Benchmark Component (업그레이드)
function CompetitorBenchmark({ marketBenchmark, refLink }: { marketBenchmark?: any; refLink?: string }) {
  if (!marketBenchmark) return null;

  return (
    <Card className="col-span-2 bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Competitor Benchmark</h2>
      
      <div className="space-y-4">
        {refLink && refLink.toLowerCase() !== 'skip' && (
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm">
              <span className="font-medium">Reference:</span>{' '}
              <a href={refLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {refLink.length > 50 ? refLink.substring(0, 50) + '...' : refLink}
              </a>
            </span>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-gray-900 font-medium">VS Competitor</span>
          </div>
          
          {marketBenchmark?.competitor_price && (
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-gray-500 text-sm">Competitor Price:</span>
              <span className="text-gray-900 font-bold text-lg">{marketBenchmark.competitor_price}</span>
            </div>
          )}
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
            <p className="text-emerald-700 font-semibold text-sm mb-1">Price Advantage</p>
            <p className="text-gray-900 font-medium">{marketBenchmark?.our_price_advantage || 'N/A'}</p>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className="text-gray-500 text-xs font-medium mb-1">Differentiation Strategy</p>
            <p className="text-gray-700 text-sm leading-relaxed">{marketBenchmark?.differentiation_point || 'N/A'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Action Roadmap Component (Full-width Timeline)
function ActionRoadmap({ answers }: { answers: Answers }) {
  const roadmapSteps = [
    { week: 'Wk 1-2', task: 'Supplier Verification', description: 'Verify credentials, certifications, and factory audit' },
    { week: 'Wk 2-3', task: 'Compliance & Certifications', description: 'Obtain required certifications for target market' },
    { week: 'Wk 4', task: 'Place Order', description: 'Finalize order details, payment terms, and production schedule' },
    { week: 'Wk 8', task: 'Channel Launch & Fulfillment', description: 'Receive shipment, quality check, and launch to sales channel' },
  ];

  return (
    <Card className="col-span-2 bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Action Roadmap</h2>
      
      <div className="space-y-4">
        {roadmapSteps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className="w-0.5 h-full bg-gray-300 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 font-medium">{step.week}</span>
                <span className="text-gray-900 font-semibold">{step.task}</span>
              </div>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Pricing CTA Component (Three-column pricing table)
function PricingCTA() {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Validator 결제 버튼 핸들러
  const handleValidatorPayment = async () => {
    if (!isAuthenticated) {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login?redirect=/results';
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Checkout URL 생성 API 호출
      const response = await fetch('/api/payment/create-checkout-url');
      const data = await response.json();

      if (data.ok && data.checkout_url) {
        // Lemon Squeezy 결제 페이지로 리다이렉트
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || 'Failed to create checkout URL. Please try again.');
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('[Payment] Failed to create checkout URL:', error);
      alert('Payment system error. Please contact support.');
      setIsProcessingPayment(false);
    }
  };

  const tiers = [
    {
      name: 'Starter',
      subtitle: 'AI Scout',
      price: '$0',
      period: '/ mo',
      features: [
        'Real-Time Cost & Risk Analysis',
        '30 Reports/month',
        'Platform-neutral insights',
        'Basic supplier database access',
      ],
      cta: 'Start Analysis',
      ctaHref: '/chat',
      onClick: undefined, // 기본 href 사용
    },
    {
      name: 'Validator',
      subtitle: 'Entry',
      price: '$199',
      period: '(Retainer)',
      features: [
        'Get Verified Quote',
        'Supplier Vetting',
        '100% Credited on Order ($5k+)',
        'Priority support',
        'Dedicated quote specialist',
      ],
      cta: 'Request Quote',
      ctaHref: '/contact',
      onClick: handleValidatorPayment, // 커스텀 결제 핸들러
      popular: true,
    },
    {
      name: 'Executor',
      subtitle: 'Full Service',
      price: '3% - 9%',
      period: 'Commission',
      features: [
        'Module A or B Selection',
        'QC & Logistics',
        'Dedicated Manager',
        'Global Sync Time',
        '24-hour response (Mon-Fri)',
      ],
      cta: 'Get Started',
      ctaHref: '/contact',
      onClick: undefined, // 기본 href 사용
    },
  ];

  return (
    <Card className="col-span-2 bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-6 tracking-wide">Get Started</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg p-6 border-2 ${tier.popular ? 'border-blue-600 shadow-md' : 'border-gray-200'}`}
          >
            {tier.popular && (
              <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">Most Popular</div>
            )}
            <h3 className="text-gray-900 font-bold text-lg mb-1">{tier.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{tier.subtitle}</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
              <span className="text-gray-500 text-sm ml-1">{tier.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, fIndex) => (
                <li key={fIndex} className="text-gray-700 text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={tier.popular ? 'primary' : 'outline'}
              className={`w-full ${tier.popular ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              onClick={tier.onClick || (() => window.location.href = tier.ctaHref)}
              disabled={isProcessingPayment && tier.name === 'Validator'}
            >
              {isProcessingPayment && tier.name === 'Validator' ? 'Processing...' : tier.cta}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Main Results Content
function ResultsContent() {
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Answers>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criticalRisk, setCriticalRisk] = useState(false);
  const [blacklistDetails, setBlacklistDetails] = useState<any>(null);
  const projectId = searchParams?.get('project_id') || null;

  // 프로젝트 메시지에서 answers 로드
  useEffect(() => {
    const loadProjectMessages = async () => {
      if (!projectId) {
        setIsInitialized(true);
        return;
      }
      
      try {
        const response = await fetch(`/api/messages?project_id=${projectId}`);
        const data = await response.json();
        
        if (data.ok && data.messages) {
          // 메시지에서 사용자 입력 추출
          const userAnswers: Answers = {};
          data.messages.forEach((msg: any) => {
            if (msg.role === 'user') {
              // 메시지 내용을 answers로 파싱 (간단한 구현)
              // 실제로는 메시지 구조에 따라 다르게 처리해야 함
            }
          });
          
          // 또는 프로젝트 정보에서 answers 로드
          // 임시로 URL 파라미터에서 로드
          const paramsAnswers: Answers = {};
          searchParams?.forEach((value, key) => {
            if (key !== 'project_id') {
              try {
                paramsAnswers[key] = JSON.parse(value);
              } catch {
                paramsAnswers[key] = value;
              }
            }
          });
          
          if (Object.keys(paramsAnswers).length > 0) {
            setAnswers(paramsAnswers);
          }
        }
      } catch (error) {
        console.error('[Results] Failed to load project messages:', error);
      }
      
      setIsInitialized(true);
    };
    
    loadProjectMessages();
  }, [projectId, searchParams]);

  // sessionStorage 또는 URL 파라미터에서 answers 로드
  useEffect(() => {
    if (isInitialized) return;
    
    // 1. sessionStorage에서 데이터 로드 시도 (우선순위)
    if (typeof window !== 'undefined') {
      try {
        const storedData = sessionStorage.getItem('nexsupply_onboarding_data');
        if (storedData) {
          const parsedAnswers = JSON.parse(storedData) as Answers;
          if (Object.keys(parsedAnswers).length > 0) {
            console.log('[Results] Loaded answers from sessionStorage:', parsedAnswers);
            setAnswers(parsedAnswers);
            setIsInitialized(true);
            // sessionStorage 데이터는 한 번 사용 후 삭제
            sessionStorage.removeItem('nexsupply_onboarding_data');
            return;
          }
        }
      } catch (error) {
        console.error('[Results] Failed to parse sessionStorage data:', error);
      }
    }
    
    // 2. URL 파라미터에서 로드 시도
    const paramsAnswers: Answers = {};
    searchParams?.forEach((value, key) => {
      if (key !== 'project_id') {
        try {
          const decodedValue = decodeURIComponent(value);
          paramsAnswers[key] = decodedValue;
        } catch {
          paramsAnswers[key] = value;
        }
      }
    });

    if (Object.keys(paramsAnswers).length > 0) {
      console.log('[Results] Loaded answers from URL params:', paramsAnswers);
      setAnswers(paramsAnswers);
      setIsInitialized(true);
      return;
    }
    
    // 3. project_id가 있지만 answers가 없으면 메시지에서 재구성 시도 (나중에 구현)
    console.warn('[Results] No answers data found in sessionStorage or URL params.');
    setIsInitialized(true);
  }, [isInitialized, searchParams, projectId]);

  useEffect(() => {
    if (!isInitialized) return;
    const hasAnswers = Object.keys(answers).length > 0;
    if (!hasAnswers) {
      console.warn('[Results] No answers data available. Please complete the chat flow first.');
      return;
    }
    if (!answers.project_name && !answers.product_info) {
      console.warn('[Results] Missing required fields: project_name or product_info');
      return;
    }
    if (aiAnalysis) return;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      setCriticalRisk(false);
      setBlacklistDetails(null);

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userContext: answers,
            project_id: projectId, // project_id 전달
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          // CRITICAL_RISK 에러 처리
          if (data.error_code === 'CRITICAL_RISK') {
            setCriticalRisk(true);
            setBlacklistDetails(data.blacklist_details);
            return;
          }
          
          throw new Error(data.error || 'Failed to analyze project');
        }

        if (data.analysis) {
          setAiAnalysis(data.analysis);
        } else {
          throw new Error('No analysis data in response');
        }
      } catch (err) {
        console.error('[Results] Failed to fetch AI analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [isInitialized, answers, aiAnalysis]);

  if (isLoading) {
    return <AnalysisLoader />;
  }

  // CRITICAL_RISK 처리 및 일반 에러 처리
  const isCriticalRisk = criticalRisk || (error && (error.includes("CRITICAL_RISK") || error.includes("해당 공급업체는 NexSupply의 블랙리스트")));
  
  if (error || criticalRisk) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
        <Card className="text-center max-w-lg p-8 shadow-2xl border-l-4 border-red-500">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-bold text-gray-900 mb-4">
            {isCriticalRisk ? "⚠️ CRITICAL SOURCING RISK DETECTED" : "Analysis Failed"}
          </div>
          <div className="text-gray-600 mb-6">
            {isCriticalRisk 
              ? "해당 공급업체는 품질, 납기 문제로 NexSupply의 블랙리스트에 등록되어 즉시 거래가 불가합니다. AI 분석을 진행할 수 없습니다."
              : error
            }
          </div>
          
          {blacklistDetails && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-red-900 mb-2">
                공급업체: {blacklistDetails.company_name}
              </p>
              <p className="text-sm text-red-700 mb-2">
                리스크 스코어: {blacklistDetails.risk_score}/100
              </p>
              {blacklistDetails.note && (
                <p className="text-xs text-red-600">{blacklistDetails.note}</p>
              )}
            </div>
          )}
          
          {isCriticalRisk && (
            <Button 
              onClick={() => window.location.href = '/contact?service=expert_vetted_sourcing'} 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              소싱 전문가에게 연결 요청 (대안 공급처 즉시 추천)
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // answers가 없거나 필수 필드가 없으면 안내 메시지 표시
  if (isInitialized && !isLoading && !error && Object.keys(answers).length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-white text-xl mb-2">No Analysis Available</div>
          <div className="text-zinc-400 text-sm mb-4">
            Please complete the chat flow first to generate analysis.
          </div>
          <Link 
            href="/chat"
            className="inline-block px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Go to Chat
          </Link>
        </div>
      </div>
    );
  }

  if (!aiAnalysis && !isLoading && !error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-white text-xl mb-2">No Analysis Available</div>
          <div className="text-zinc-400 text-sm mb-4">
            Analysis is being generated. Please wait...
          </div>
        </div>
      </div>
    );
  }

  const { 
    financials, 
    cost_breakdown, 
    scale_analysis, 
    risks,
    duty_analysis,
    logistics_insight,
    market_benchmark,
    strategic_advice,
  } = aiAnalysis;
  // Extract product name from new streamlined field or legacy fields
  const productName = answers.product_info?.split('-')[0]?.trim() || 
                      answers.product_info?.split(',')[0]?.trim() ||
                      answers.product_desc?.split(',')[0] || 
                      answers.project_name || 
                      'Product Analysis';
  const totalLandedCost = financials?.estimated_landed_cost || 0;
  const margin = {
    min: Math.max(0, Math.floor((financials?.estimated_margin_pct || 0) - 5)),
    max: Math.ceil((financials?.estimated_margin_pct || 0) + 5),
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6 md:p-8">
      {/* Header with Logo */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/" className="inline-block cursor-pointer hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-bold text-gray-900">NexSupply</h1>
        </Link>
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Header - Full Width */}
          <ResultHeader 
            productName={productName}
            landedCost={totalLandedCost}
            margin={margin}
          />

          {/* NexSupply Insight - Full Width */}
          <NexSupplyInsight 
            strategicAdvice={strategic_advice}
            businessModel={answers.business_model}
          />

          {/* Cost Breakdown */}
          <CostBreakdown 
            costBreakdown={cost_breakdown || {}}
            totalLandedCost={totalLandedCost}
          />

          {/* Logistics & Duty Intelligence */}
          <LogisticsDutyIntelligence 
            dutyAnalysis={duty_analysis}
            logisticsInsight={logistics_insight}
            sizeTier={answers.size_tier}
          />

          {/* Profitability Simulator */}
          <ProfitabilitySimulator 
            totalLandedCost={totalLandedCost}
            answers={answers}
          />

          {/* Scale Analysis */}
          <ScaleAnalysis 
            scaleAnalysis={scale_analysis || []}
          />

          {/* Risk Assessment */}
          <RiskAssessment 
            risks={risks || {}}
            osintRiskScore={aiAnalysis?.osint_risk_score}
          />

          {/* Competitor Benchmark - Full Width (Market Positioning 대체) */}
          <CompetitorBenchmark 
            marketBenchmark={market_benchmark}
            refLink={answers.ref_link}
          />

          {/* Action Roadmap - Full Width */}
          <ActionRoadmap answers={answers} />

          {/* Pricing CTA - Full Width */}
          <PricingCTA />
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
