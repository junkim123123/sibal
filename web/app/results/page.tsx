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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, XCircle, TrendingUp, Factory, Shield, Truck, Package, DollarSign, BarChart3, Calendar, Rocket, Download, Info, Check } from 'lucide-react';
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
  compliance_checklist?: Array<{
    item: string;
    description: string;
    link?: string;
    required: boolean;
  }>;
  market_trends?: {
    trending_keywords: string[];
    recommendation: string;
    ctr_boost?: string;
  };
  shadow_sourcing?: {
    recommended_suppliers: Array<{
      name: string;
      reason: string;
      oem_history?: string;
    }>;
  };
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
function ProfitabilitySimulator({ totalLandedCost, answers, costBreakdown, aiAnalysis }: { 
  totalLandedCost: number; 
  answers: Answers;
  costBreakdown?: any;
  aiAnalysis?: AIAnalysisResult | null;
}) {
  // Product Cost: Use factory_exw from cost_breakdown if available, otherwise use totalLandedCost
  const productCost = costBreakdown?.factory_exw || totalLandedCost;
  
  // Calculate price range based on product cost (min: 1.2x, max: 5x product cost, but at least $10-$100)
  const minPrice = Math.max(10, Math.ceil(productCost * 1.2));
  const maxPrice = Math.max(100, Math.ceil(productCost * 5));
  const defaultPrice = Math.max(minPrice, Math.min(maxPrice, productCost * 2.5));
  
  const [retailPrice, setRetailPrice] = useState(defaultPrice);
  
  // Calculate Channel & Fulfillment costs based on sales channel
  const salesChannel = answers.sales_channel?.toLowerCase() || answers.channel?.toLowerCase() || '';
  let channelFees = 0;
  let channelFeeLabel = 'Channel & Fulfillment';
  
  if (salesChannel.includes('amazon') || salesChannel.includes('fba')) {
    // Amazon: 15% referral + $3-5 FBA fees (use $4 as average)
    const referralFee = retailPrice * 0.15;
    const fbaFee = 4; // Average FBA fee
    channelFees = referralFee + fbaFee;
    channelFeeLabel = 'Amazon Fees (15% + FBA)';
  } else if (salesChannel.includes('shopify') || salesChannel.includes('dtc') || salesChannel.includes('direct')) {
    // Shopify/DTC: 2.9% payment processing + $3-5 3PL fulfillment (use $4 as average)
    const paymentFee = retailPrice * 0.029;
    const fulfillmentFee = 4; // Average 3PL fulfillment fee
    channelFees = paymentFee + fulfillmentFee;
    channelFeeLabel = 'Payment & Fulfillment';
  } else if (salesChannel.includes('wholesale') || salesChannel.includes('b2b')) {
    // Wholesale/B2B: 2-5% handling fees (use 3.5% as average)
    channelFees = retailPrice * 0.035;
    channelFeeLabel = 'Wholesale Fees';
  } else {
    // Default: 15% channel fees (fallback)
    channelFees = retailPrice * 0.15;
  }
  
  // Use product cost (factory_exw) instead of totalLandedCost for profitability calculation
  const netProfit = retailPrice - productCost - channelFees;
  const profitMargin = retailPrice > 0 ? (netProfit / retailPrice) * 100 : 0;
  
  // Calculate Break-Even ROAS: (Net Profit / Retail Price) * 100
  const breakEvenROAS = netProfit > 0 ? ((netProfit / retailPrice) * 100).toFixed(1) : '0.0';
  
  // Calculate Min. Sell Price: The price where profit becomes $0
  // netProfit = price - productCost - channelFees = 0
  // For percentage-based fees: price - productCost - (price * feeRate) = 0
  // price * (1 - feeRate) = productCost + fixedFee
  // price = (productCost + fixedFee) / (1 - feeRate)
  let minSellPrice = 0;
  if (salesChannel.includes('amazon') || salesChannel.includes('fba')) {
    // Amazon: price - productCost - (price * 0.15 + 4) = 0
    // price * 0.85 = productCost + 4
    minSellPrice = (productCost + 4) / 0.85;
  } else if (salesChannel.includes('shopify') || salesChannel.includes('dtc') || salesChannel.includes('direct')) {
    // Shopify: price - productCost - (price * 0.029 + 4) = 0
    // price * 0.971 = productCost + 4
    minSellPrice = (productCost + 4) / 0.971;
  } else if (salesChannel.includes('wholesale') || salesChannel.includes('b2b')) {
    // Wholesale: price - productCost - (price * 0.035) = 0
    // price * 0.965 = productCost
    minSellPrice = productCost / 0.965;
  } else {
    // Default: price - productCost - (price * 0.15) = 0
    minSellPrice = productCost / 0.85;
  }

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm h-full min-h-[400px] flex flex-col">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3 tracking-wide">Profitability Simulator</h2>
      
      <div className="space-y-3 flex-1 flex flex-col">
        <div>
          <label className="text-sm text-gray-700 mb-2 block font-medium">Target Retail Price</label>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step="0.01"
            value={retailPrice}
            onChange={(e) => setRetailPrice(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${minPrice}</span>
            <span className="text-blue-600 font-bold font-mono">${retailPrice.toFixed(2)}</span>
            <span>${maxPrice}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-gray-200 flex-1">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Retail Price</span>
            <span className="text-gray-900 font-mono">+${retailPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Product Cost</span>
            <span className="text-red-600 font-mono">-${productCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">{channelFeeLabel}</span>
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
                <span className="text-orange-600 font-bold font-mono text-sm">${minSellPrice.toFixed(2)}</span>
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
function ScaleAnalysis({ scaleAnalysis, totalLandedCost, costBreakdown }: { 
  scaleAnalysis: any[];
  totalLandedCost?: number;
  costBreakdown?: any;
}) {
  // Ensure we have 4 scenarios: 500, 5,000, 10,000, 100,000
  const requiredQuantities = [500, 5000, 10000, 100000];
  
  // Create a map of existing scenarios by quantity
  const existingScenarios = new Map(
    (scaleAnalysis || []).map(s => [s.qty, s])
  );
  
  // Fill in missing scenarios with estimated values
  const completeScenarios = requiredQuantities.map(qty => {
    if (existingScenarios.has(qty)) {
      return existingScenarios.get(qty);
    }
    
    // Estimate unit cost based on volume (economies of scale)
    // Higher volume = lower per-unit cost
    const baseCost = totalLandedCost || (costBreakdown?.factory_exw || 0);
    let estimatedUnitCost = baseCost;
    
    if (qty === 500) {
      // Small batch: higher per-unit cost (Air freight, no volume discount)
      estimatedUnitCost = baseCost * 1.2;
    } else if (qty === 5000) {
      // Launch volume: moderate cost (mix of Air/Sea)
      estimatedUnitCost = baseCost * 0.95;
    } else if (qty === 10000) {
      // Growing scale: lower cost (Sea freight, some volume discount)
      estimatedUnitCost = baseCost * 0.85;
    } else if (qty === 100000) {
      // High scale: lowest cost (Sea freight, significant volume discount)
      estimatedUnitCost = baseCost * 0.70;
    }
    
    // Determine shipping mode
    const mode = qty >= 10000 ? 'Sea' : qty >= 5000 ? 'Sea/Air' : 'Air';
    
    // Estimate margin (assuming retail price around 3x cost)
    const estimatedRetailPrice = estimatedUnitCost * 3;
    const estimatedMargin = estimatedRetailPrice > 0 
      ? ((estimatedRetailPrice - estimatedUnitCost) / estimatedRetailPrice) * 100 
      : 0;
    
    return {
      qty,
      mode,
      unit_cost: estimatedUnitCost,
      margin: estimatedMargin,
      isEstimated: true
    };
  });
  
  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Scale Analysis</h2>
      <div className="space-y-3">
        {completeScenarios.map((scenario, index) => (
          <div 
            key={index} 
            className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${
              scenario.isEstimated ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-medium">{scenario.qty?.toLocaleString() || 'N/A'} Units</span>
                <span className="text-gray-500 text-xs">({scenario.mode || 'N/A'})</span>
                {scenario.isEstimated && (
                  <span className="text-xs text-gray-400 italic">(estimated)</span>
                )}
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

// Interactive Compliance Checklist Component (Level 2 Feature)
function ComplianceChecklist({ checklist, hsCode, market }: { 
  checklist?: Array<{ item: string; description: string; link?: string; required: boolean }>;
  hsCode?: string;
  market?: string;
}) {
  if (!checklist || checklist.length === 0) return null;

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">🇺🇸 Compliance Checklist</h2>
      <p className="text-xs text-gray-500 mb-4">
        Required documents and certifications for {market || 'target market'} import
      </p>
      
      <div className="space-y-3">
        {checklist.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-900 font-medium text-sm">{item.item}</span>
                {item.required && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">Required</span>
                )}
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-2">{item.description}</p>
              {item.link && (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs inline-flex items-center gap-1"
                >
                  Learn more <span>→</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Market Trend Component (Level 2 Feature)
function MarketTrend({ marketTrends }: { marketTrends?: { trending_keywords: string[]; recommendation: string; ctr_boost?: string } }) {
  if (!marketTrends || !marketTrends.trending_keywords || marketTrends.trending_keywords.length === 0) return null;

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">📈 Real-Time Market Trends</h2>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-gray-500 uppercase mb-2 tracking-wide">Current Trending Keywords</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {marketTrends.trending_keywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm font-medium text-blue-700"
              >
                {keyword}
              </span>
            ))}
          </div>
          {marketTrends.ctr_boost && (
            <div className="bg-emerald-100 border border-emerald-300 rounded p-2 mb-2">
              <p className="text-emerald-800 text-xs font-semibold">
                Expected CTR Boost: {marketTrends.ctr_boost}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-gray-500 text-xs font-medium mb-1">AI Recommendation</p>
          <p className="text-gray-700 text-sm leading-relaxed">{marketTrends.recommendation}</p>
        </div>
      </div>
    </Card>
  );
}

// Shadow Sourcing Component (Level 2 Feature)
function ShadowSourcing({ shadowSourcing }: { 
  shadowSourcing?: { recommended_suppliers: Array<{ name: string; reason: string; oem_history?: string }> }
}) {
  if (!shadowSourcing || !shadowSourcing.recommended_suppliers || shadowSourcing.recommended_suppliers.length === 0) return null;

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">🕵️ Shadow Sourcing Intelligence</h2>
      <p className="text-xs text-gray-500 mb-4">
        Recommended suppliers based on actual export history and OEM relationships
      </p>
      
      <div className="space-y-3">
        {shadowSourcing.recommended_suppliers.map((supplier, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-gray-900 font-semibold text-sm">{supplier.name}</span>
                {supplier.oem_history && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {supplier.oem_history}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">{supplier.reason}</p>
          </div>
        ))}
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
function ActionRoadmap({ answers, aiAnalysis }: { answers: Answers; aiAnalysis?: AIAnalysisResult | null }) {
  // Check for IMMEDIATE HALT conditions
  const executiveSummary = aiAnalysis?.executive_summary || '';
  const strategicAdvice = aiAnalysis?.strategic_advice?.key_action || '';
  const osintRiskScore = aiAnalysis?.osint_risk_score || 0;
  const complianceRisk = aiAnalysis?.risks?.compliance?.level || '';
  
  const hasImmediateHalt = 
    executiveSummary.toLowerCase().includes('immediate halt') ||
    executiveSummary.toLowerCase().includes('do not proceed') ||
    strategicAdvice.toLowerCase().includes('halt') ||
    strategicAdvice.toLowerCase().includes('stop') ||
    osintRiskScore >= 90 ||
    (complianceRisk.toLowerCase() === 'high' && osintRiskScore >= 70);

  // Critical Risk Roadmap (when IMMEDIATE HALT is detected)
  const criticalRoadmapSteps: Array<{ week: string; task: string; description: string; icon?: string; color?: string }> = [
    { 
      week: 'Immediate', 
      task: 'Stop Sourcing', 
      description: 'Do not proceed with this product. The regulatory and financial risks are too high.',
      icon: '🚫',
      color: 'bg-red-600'
    },
    { 
      week: 'Wk 1-2', 
      task: 'Pivot Strategy', 
      description: 'Consider alternative product categories with lower regulatory barriers. Review similar non-regulated items.',
      icon: '🔄',
      color: 'bg-orange-600'
    },
    { 
      week: 'Wk 2-3', 
      task: 'Legal Consult', 
      description: 'Consult with a trade attorney specializing in your target market regulations before any sourcing decision.',
      icon: '⚖️',
      color: 'bg-yellow-600'
    },
    { 
      week: 'Wk 4+', 
      task: 'Alternative Research', 
      description: 'Use our platform to analyze alternative products that meet your business goals without regulatory risks.',
      icon: '🔍',
      color: 'bg-blue-600'
    },
  ];

  // Normal Roadmap Steps
  const normalRoadmapSteps: Array<{ week: string; task: string; description: string; icon?: string; color?: string }> = [
    { week: 'Wk 1-2', task: 'Supplier Verification', description: 'Verify credentials, certifications, and factory audit' },
    { week: 'Wk 2-3', task: 'Compliance & Certifications', description: 'Obtain required certifications for target market' },
    { week: 'Wk 4', task: 'Place Order', description: 'Finalize order details, payment terms, and production schedule' },
    { week: 'Wk 8', task: 'Channel Launch & Fulfillment', description: 'Receive shipment, quality check, and launch to sales channel' },
  ];

  const roadmapSteps = hasImmediateHalt ? criticalRoadmapSteps : normalRoadmapSteps;

  return (
    <Card className={`col-span-2 bg-white border ${hasImmediateHalt ? 'border-red-200' : 'border-gray-200'} p-6 shadow-sm`}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Action Roadmap</h2>
        {hasImmediateHalt && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">CRITICAL RISK</span>
        )}
      </div>
      
      {hasImmediateHalt && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="text-red-900 font-semibold text-sm mb-1">IMMEDIATE HALT RECOMMENDED</p>
              <p className="text-red-700 text-sm leading-relaxed">
                This product category has critical regulatory or compliance risks that make it unsuitable for sourcing at this time. 
                Please review the risk assessment above and consider alternative products.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {roadmapSteps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${hasImmediateHalt && step.color ? step.color : 'bg-blue-600'} flex items-center justify-center text-white font-bold text-sm`}>
                {hasImmediateHalt && step.icon ? step.icon : (index + 1)}
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className={`w-0.5 h-full ${hasImmediateHalt ? 'bg-red-300' : 'bg-gray-300'} mt-2`} />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 font-medium">{step.week}</span>
                <span className={`font-semibold ${hasImmediateHalt ? 'text-red-900' : 'text-gray-900'}`}>{step.task}</span>
              </div>
              <p className={`text-sm ${hasImmediateHalt ? 'text-red-700' : 'text-gray-600'}`}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Results Action Buttons Component (Enhanced with Service Value Props & Agreement)
function ResultsActionButtons({ projectId, answers, aiAnalysis }: { projectId?: string | null; answers: Answers; aiAnalysis?: AIAnalysisResult | null }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Save Report 핸들러
  const handleSaveReport = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/results';
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('[Save Report] Starting save process...', {
        projectId,
        hasAnswers: !!answers && Object.keys(answers).length > 0,
        hasAiAnalysis: !!aiAnalysis,
      });

      // 프로젝트 저장 API 호출
      const response = await fetch('/api/projects/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          answers: answers,
          ai_analysis: aiAnalysis, // AI 분석 결과 전달
        }),
      });

      console.log('[Save Report] API response status:', response.status);

      const data = await response.json();
      console.log('[Save Report] API response data:', data);

      if (data.ok) {
        console.log('[Save Report] Project saved successfully:', data.project_id);
        // 대시보드의 Saved Products 탭으로 이동 (전체 페이지 리로드로 확실히 새로고침)
        window.location.href = '/dashboard?tab=products&refresh=true';
      } else {
        console.error('[Save Report] Save failed:', data);
        const errorMessage = data.details 
          ? `${data.error}\n\nDetails: ${JSON.stringify(data.details, null, 2)}`
          : data.error || 'Failed to save report. Please try again.';
        alert(errorMessage);
        setIsSaving(false);
      }
    } catch (error) {
      console.error('[Save Report] Failed to save:', error);
      alert(`Failed to save report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSaving(false);
    }
  };

  // Hire 버튼 클릭 핸들러 (모달 열기)
  const handleRequestQuote = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/results';
      return;
    }

    if (!isAgreed) {
      alert('Please agree to the service scope before proceeding.');
      return;
    }

    // 모달 열기
    setIsModalOpen(true);
  };

  // 구독 결제 프로세스 시작 (모달 내부에서 호출)
  const handleSubscribe = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Lemon Squeezy 구독 체크아웃 URL 생성 API 호출
      const response = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
        }),
      });

      const data = await response.json();

      if (data.ok && data.checkout_url) {
        // Lemon Squeezy 결제 페이지로 리다이렉트
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || 'Failed to create checkout URL. Please try again.');
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('[Subscribe] Failed to create checkout URL:', error);
      alert('Payment system error. Please contact support.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="col-span-2 w-full">
      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-start justify-between gap-6">
            {/* Left: Service Value Props List */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Sourcing & Negotiation</p>
                  <p className="text-xs text-gray-600">Factory finding, Price bargaining</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Manage QC, Labeling & Kitting</p>
                  <p className="text-xs text-gray-600">Using our owned Packing Hub</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">End-to-End Logistics</p>
                  <p className="text-xs text-gray-600">DDP Shipping setup</p>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons & Agreement */}
            <div className="flex flex-col items-end gap-3 min-w-[320px]">
              {/* Secondary Actions Row */}
              <div className="flex items-center gap-3 w-full">
                <Link
                  href="/chat"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Analyze Another</span>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="flex-1 border-gray-900 text-gray-900 hover:bg-gray-50"
                >
                  {isSaving ? 'Saving...' : '💾 Save Report'}
                </Button>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2 w-full">
                <input
                  type="checkbox"
                  id="service-agreement"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor="service-agreement" className="text-xs text-gray-700 leading-relaxed cursor-pointer">
                  I understand this service covers <strong>Ops & Logistics only</strong>. (Design/Marketing excluded)
                </label>
              </div>

              {/* Main CTA Button */}
              <div className="w-full">
                <Button
                  onClick={handleRequestQuote}
                  disabled={isProcessingPayment || !isAgreed}
                  className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 ${
                    !isAgreed ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">👔 Hire My Sourcing Expert</span>
                    <span className="text-sm font-bold">$50/mo</span>
                  </div>
                </Button>
                {/* Credit Badge */}
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Credited to first order
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            {/* Service Value Props List (Top) */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Sourcing & Negotiation</p>
                  <p className="text-[10px] text-gray-600">Factory finding, Price bargaining</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Manage QC, Labeling & Kitting</p>
                  <p className="text-[10px] text-gray-600">Using our owned Packing Hub</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">End-to-End Logistics</p>
                  <p className="text-[10px] text-gray-600">DDP Shipping setup</p>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="service-agreement-mobile"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-1"
              />
              <label htmlFor="service-agreement-mobile" className="text-[10px] text-gray-700 leading-relaxed cursor-pointer">
                I understand this service covers <strong>Ops & Logistics only</strong>. (Design/Marketing excluded)
              </label>
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveReport}
                disabled={isSaving}
                className="flex-[3] border-gray-900 text-gray-900 hover:bg-gray-50 text-xs py-2"
              >
                {isSaving ? 'Saving...' : '💾 Save'}
              </Button>
              <div className="flex-[7]">
                <Button
                  onClick={handleRequestQuote}
                  disabled={isProcessingPayment || !isAgreed}
                  className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs py-2 ${
                    !isAgreed ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>👔 Hire My Expert</span>
                    <span className="font-bold">$50/mo</span>
                  </div>
                </Button>
                {/* Credit Badge (Mobile) */}
                <div className="mt-1.5 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    100% Credited
                  </span>
                </div>
              </div>
            </div>

            {/* Analyze Another Link */}
            <div className="text-center pt-1">
              <Link
                href="/chat"
                className="text-gray-600 hover:text-gray-900 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <span>🔄</span>
                <span>Analyze Another Product</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 pb-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Confirm Expert Hiring
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              Secure your dedicated sourcing manager today.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Price Section */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $50 <span className="text-lg font-normal text-gray-600">/ month</span>
              </div>
            </div>

            {/* Benefit Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                <span className="text-lg">✨</span>
                <span className="text-sm">100% Credited back on your first order</span>
              </div>
            </div>

            {/* Policy */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                No lock-in contract. Cancel anytime.
              </p>
            </div>

            {/* Scope of Work */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Scope of Work</h4>
              
              {/* Included Services */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-1.5">Included (✅):</p>
                <ul className="space-y-1.5 text-xs text-gray-600 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Factory Sourcing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Negotiation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>QC Management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Logistics Setup</span>
                  </li>
                </ul>
              </div>

              {/* Not Included Services */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-700 mb-1.5">Not Included (❌):</p>
                <ul className="space-y-1.5 text-xs text-gray-600 ml-4">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Logo/Package Design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Marketing Strategy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isProcessingPayment}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={isProcessingPayment}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isProcessingPayment ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Proceed to Checkout
                  <span>→</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
  const isCriticalRisk = criticalRisk || (error && (error.includes("CRITICAL_RISK") || error.includes("blacklist") || error.includes("This supplier")));
  
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
              ? "This supplier has been registered on NexSupply's blacklist due to quality and delivery issues. Transactions are immediately unavailable. AI analysis cannot proceed."
              : error
            }
          </div>
          
          {blacklistDetails && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-red-900 mb-2">
                Supplier: {blacklistDetails.company_name}
              </p>
              <p className="text-sm text-red-700 mb-2">
                Risk Score: {blacklistDetails.risk_score}/100
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
              Request Expert Sourcing Connection (Immediate Alternative Supplier Recommendation)
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

  if (!aiAnalysis) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-gray-900 text-xl mb-2">No Analysis Available</div>
          <div className="text-gray-500 text-sm mb-4">
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
            costBreakdown={cost_breakdown}
            aiAnalysis={aiAnalysis}
          />

          {/* Scale Analysis */}
          <ScaleAnalysis 
            scaleAnalysis={scale_analysis || []}
            totalLandedCost={totalLandedCost}
            costBreakdown={cost_breakdown}
          />

          {/* Risk Assessment */}
          <RiskAssessment
            risks={risks || {}}
            osintRiskScore={aiAnalysis?.osint_risk_score}
          />

          {/* Level 2 Features: Compliance Checklist */}
          <ComplianceChecklist
            checklist={aiAnalysis?.compliance_checklist}
            hsCode={duty_analysis?.hs_code}
            market={answers.market}
          />

          {/* Level 2 Features: Market Trend */}
          <MarketTrend marketTrends={aiAnalysis?.market_trends} />

          {/* Level 2 Features: Shadow Sourcing */}
          <ShadowSourcing shadowSourcing={aiAnalysis?.shadow_sourcing} />

          {/* Competitor Benchmark - Full Width (Market Positioning 대체) */}
          <CompetitorBenchmark
            marketBenchmark={market_benchmark}
            refLink={answers.ref_link}
          />

          {/* Action Roadmap - Full Width */}
          <ActionRoadmap answers={answers} aiAnalysis={aiAnalysis} />

          {/* Results Action Buttons - 3-Button Layout */}
          <ResultsActionButtons projectId={projectId} answers={answers} aiAnalysis={aiAnalysis} />
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
