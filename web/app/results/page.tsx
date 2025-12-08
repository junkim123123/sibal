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
import { AlertCircle, CheckCircle2, XCircle, TrendingUp, Factory, Shield, Truck, Package, DollarSign, BarChart3, Calendar, Rocket, Download, Info, Check, Loader2, Sparkles } from 'lucide-react';
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
  onRequestClick,
  hasCriticalRisk,
  onCriticalRiskClick
}: { 
  productName: string; 
  landedCost: number; 
  margin: { min: number; max: number };
  projectId?: string | null;
  onRequestClick?: () => void;
  hasCriticalRisk?: boolean;
  onCriticalRiskClick?: () => void;
}) {
  // Format product name: English first, Korean in parentheses if present
  const formatProductName = (name: string) => {
    // Check if name contains Korean characters
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name);
    if (!hasKorean) return name;
    
    // Try to extract English and Korean parts
    const koreanMatch = name.match(/[가-힣\s]+/g);
    const englishMatch = name.match(/[a-zA-Z\s]+/g);
    
    if (englishMatch && koreanMatch) {
      // If both exist, prioritize English
      const english = englishMatch[0].trim();
      const korean = koreanMatch.join(' ').trim();
      return `${english} (${korean})`;
    }
    
    // If only Korean, try to transliterate or keep as is
    return name;
  };

  return (
    <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{formatProductName(productName)}</h1>
          <p className="text-gray-500 text-sm">Sourcing Intelligence Report</p>
        </div>
        <div className="flex items-baseline gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1 tracking-wide">Estimated Landed Cost</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold font-mono text-blue-600">${landedCost.toFixed(2)}</p>
              {hasCriticalRisk && (
                <button
                  onClick={onCriticalRiskClick}
                  className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                >
                  ⚠️ CRITICAL RISK
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1 tracking-wide">Margin</p>
            <p className="text-3xl font-bold font-mono text-gray-900">{margin.min}% ~ {margin.max}%</p>
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
            const isShipping = item.name === 'Shipping';
            const isFactory = item.name === 'Factory';
            const showVolumetricAlert = isShipping && item.value > (costBreakdown?.factory_exw || 0);
            
            return (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-sm text-gray-700 truncate">{item.name}</span>
                    {showVolumetricAlert && (
                      <div className="group relative flex-shrink-0">
                        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          High Volumetric Weight Alert: This product requires more space, increasing shipping costs relative to factory cost.
                        </div>
                      </div>
                    )}
                  </div>
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
  // CRITICAL: Factory cost only decreases 5-15% with volume. Most savings come from shipping/duty per-unit reduction.
  const completeScenarios = requiredQuantities.map(qty => {
    if (existingScenarios.has(qty)) {
      const existing = existingScenarios.get(qty);
      // Validate: Factory cost should not drop more than 15% even at high volumes
      const factoryCost = costBreakdown?.factory_exw || 0;
      if (factoryCost > 0 && existing.unit_cost < factoryCost * 0.85) {
        // If AI returned unrealistic cost, recalculate properly
        return calculateRealisticUnitCost(qty, costBreakdown, totalLandedCost, existing);
      }
      return existing;
    }
    
    return calculateRealisticUnitCost(qty, costBreakdown, totalLandedCost);
  });
  
  // Helper function to calculate realistic unit cost
  function calculateRealisticUnitCost(
    qty: number, 
    costBreakdown?: any, 
    totalLandedCost?: number,
    existing?: any
  ) {
    const factoryExw = costBreakdown?.factory_exw || 0;
    const shipping = costBreakdown?.shipping || 0;
    const duty = costBreakdown?.duty || 0;
    const packaging = costBreakdown?.packaging || 0;
    const customs = costBreakdown?.customs || 0;
    const insurance = costBreakdown?.insurance || 0;
    
    // Factory cost reduction: Only 5-15% max even at 100k units
    let factoryCostPerUnit = factoryExw;
    if (qty === 500) {
      factoryCostPerUnit = factoryExw * 1.05; // Small batch: 5% premium
    } else if (qty === 5000) {
      factoryCostPerUnit = factoryExw * 0.98; // Launch: 2% discount
    } else if (qty === 10000) {
      factoryCostPerUnit = factoryExw * 0.93; // Growing: 7% discount
    } else if (qty === 100000) {
      factoryCostPerUnit = factoryExw * 0.90; // High scale: 10% discount (MAX)
    }
    
    // Shipping cost per unit (decreases significantly with volume)
    let shippingPerUnit = shipping;
    if (qty === 500) {
      shippingPerUnit = shipping * 1.5; // Air freight premium
    } else if (qty === 5000) {
      shippingPerUnit = shipping * 0.8; // Mix Air/Sea
    } else if (qty === 10000) {
      shippingPerUnit = shipping * 0.5; // Sea freight
    } else if (qty === 100000) {
      shippingPerUnit = shipping * 0.2; // Container load, very low per-unit
    }
    
    // Duty, packaging, customs, insurance scale with quantity (per-unit decreases)
    const fixedCostsPerUnit = (duty + packaging + customs + insurance) / Math.max(qty / 500, 1);
    
    // Total unit cost
    const estimatedUnitCost = factoryCostPerUnit + shippingPerUnit + fixedCostsPerUnit;
    
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
      unit_cost: Math.max(estimatedUnitCost, factoryExw * 0.85), // Never below 85% of factory cost
      margin: estimatedMargin,
      isEstimated: !existing
    };
  }
  
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
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-gray-900">
                {osintRiskScore.toFixed(0)}/100
              </span>
              <div className="mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  osintRiskScore >= 67 
                    ? 'bg-green-100 text-green-700' 
                    : osintRiskScore >= 34 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  Risk Level: {
                    osintRiskScore >= 67 
                      ? 'Low' 
                      : osintRiskScore >= 34 
                      ? 'Medium' 
                      : 'High'
                  }
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            (Based on 500 supplier database & web OSINT signals. Lower score = Higher risk)
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
            <div className="relative flex-shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                className="peer w-5 h-5 appearance-none border-2 border-gray-300 rounded-md cursor-pointer transition-all checked:bg-neutral-900 checked:border-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
                checked={item.required}
              />
              <svg 
                className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-900 font-semibold text-sm">{item.item}</span>
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
      <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">🔍 Deep-Tier Supply Chain Intelligence</h2>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        Recommended suppliers based on actual export history and OEM relationships
      </p>
      
      <div className="space-y-3">
        {shadowSourcing.recommended_suppliers.map((supplier, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-gray-900 font-bold text-base">{supplier.name}</span>
                {supplier.oem_history && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {supplier.oem_history}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed font-medium">{supplier.reason}</p>
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
    <div id="action-roadmap" className={`col-span-2 bg-white border ${hasImmediateHalt ? 'border-red-200' : 'border-gray-200'} rounded-lg p-6 shadow-sm`}>
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
    </div>
  );
}

// Results Action Buttons Component (Enhanced with Service Value Props & Agreement)
function ResultsActionButtons({ projectId, answers, aiAnalysis }: { projectId?: string | null; answers: Answers; aiAnalysis?: AIAnalysisResult | null }) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [gumroadUrl, setGumroadUrl] = useState<string | null>(null);
  // Agreement is now implicit (caption text only, no checkbox)
  const isAgreed = true;

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

  // Start Sourcing Request 핸들러 - 결제 모달 표시
  const handleStartSourcing = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/results';
      return;
    }

    // 결제 유도 모달 표시
    setShowPaymentModal(true);
  };

  // 결제 진행 핸들러 - Gumroad 결제 페이지로 이동
  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/results';
      return;
    }

    setIsProcessingPayment(true);
    setShowPaymentModal(false);
    
    try {
      // 프로젝트가 없으면 먼저 생성
      let finalProjectId = projectId;
      
      if (!finalProjectId) {
        // 프로젝트 이름 추출
        const productName = answers?.product_info?.split('-')[0]?.trim() || 
                           answers?.product_info?.split(',')[0]?.trim() ||
                           answers?.product_desc?.split(',')[0] || 
                           answers?.project_name || 
                           'New Sourcing Project';

        // 프로젝트 생성
        const projectResponse = await fetch('/api/projects/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productName,
            answers: answers,
            ai_analysis: aiAnalysis,
          }),
        });

        const projectData = await projectResponse.json();
        if (projectData.ok && projectData.projectId) {
          finalProjectId = projectData.projectId;
        } else {
          throw new Error('Failed to create project');
        }
      }

      // Gumroad 결제 페이지로 리다이렉트 (프로젝트 ID를 URL 파라미터로 전달)
      const gumroadUrl = new URL('https://junkim82.gumroad.com/l/wmtnuv');
      if (finalProjectId) {
        gumroadUrl.searchParams.set('custom_field1', finalProjectId);
      }
      
      // Gumroad 결제 페이지로 이동
      window.location.href = gumroadUrl.toString();
    } catch (error) {
      console.error('[Payment] Failed to proceed:', error);
      alert(`Failed to proceed with payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="col-span-2 w-full">
      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-start justify-between gap-8">
            {/* Left: Service Scope (Included) */}
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Included</p>
              <div className="space-y-3">
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
            </div>

            {/* Right: Action Zone */}
            <div className="flex flex-col items-end gap-3 min-w-[360px]">
              {/* Secondary Actions Row */}
              <div className="w-full">
                <Link href="/chat" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-gray-900 text-gray-900 hover:bg-gray-50"
                  >
                    Analyze Another
                  </Button>
                </Link>
              </div>

              {/* Main CTA Button */}
              <div className="w-full">
                <Button
                  onClick={handleStartSourcing}
                  disabled={isProcessingPayment}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3.5 px-6"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="text-base">Request Official Quote</span>
                  )}
                </Button>
                {/* Info Badge */}
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Start chatting with your dedicated agent immediately. Pay later when you approve the quote.
                  </span>
                </div>
                {/* Agreement Caption (Small text below button) */}
                <div className="mt-2 text-center">
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    By proceeding, I agree that design/marketing services are excluded.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Modal */}
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Start Your Official Sourcing Project
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Get real factory quotes and dedicated support for your sourcing project
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Value Proposition */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Real Factory Quotes</p>
                      <p className="text-sm text-gray-600">
                        AI 추정치가 아닌, 실제 공장 3곳의 확정 견적을 48시간 내 제공
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Dedicated Sourcing Agent</p>
                      <p className="text-sm text-gray-600">
                        전담 매니저 배정 (영어/한국어/중국어 지원)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">100% Credit Back</p>
                      <p className="text-sm text-gray-600">
                        본 발주(Order) 진행 시, 이 $49는 수수료에서 전액 차감됩니다. (사실상 무료)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Bonus: 30-Day Unlimited AI Analysis</p>
                      <p className="text-sm text-gray-600">
                        결제 즉시 30일간 AI 분석 무제한 혜택 잠금 해제
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">One-time fee</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-gray-400 line-through">$299</span>
                    <span className="text-3xl font-bold text-gray-900">$49</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-col gap-3">
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isProcessingPayment}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    'Pay $49 & Start Sourcing'
                  )}
                </Button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={isProcessingPayment}
                >
                  Cancel
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            {/* Service Scope (Included) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Included</p>
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
            </div>

            {/* Action Buttons Row */}
            <div className="space-y-2">
              <Link href="/chat" className="block">
                <Button
                  variant="outline"
                  className="w-full border-gray-900 text-gray-900 hover:bg-gray-50 text-xs py-2"
                >
                  Analyze Another
                </Button>
              </Link>
              <div>
                <Button
                  onClick={handleStartSourcing}
                  disabled={isProcessingPayment}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs py-2.5"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin text-[10px]">⏳</span>
                      <span>Unlocking...</span>
                    </span>
                  ) : (
                    <span>Request Official Quote</span>
                  )}
                </Button>
                {/* Info Badge (Mobile) */}
                <div className="mt-1.5 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Chat now, pay later
                  </span>
                </div>
                {/* Agreement Caption (Small text below button) */}
                <div className="mt-1.5 text-center">
                  <p className="text-[9px] text-gray-500 leading-relaxed">
                    By proceeding, I agree that design/marketing services are excluded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 모달 제거됨 - 즉시 프로젝트 생성으로 변경 */}
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

  // 프로젝트 분석 데이터 로드 (project_id가 있을 때)
  useEffect(() => {
    const loadProjectAnalysis = async () => {
      if (!projectId) {
        setIsInitialized(true);
        return;
      }
      
      try {
        console.log('[Results] Loading project analysis data for project:', projectId);
        
        // 프로젝트 분석 데이터 API 호출
        const response = await fetch(`/api/projects/${projectId}/analysis`);
        const data = await response.json();
        
        if (data.ok) {
          console.log('[Results] Project analysis data loaded:', {
            hasAnswers: !!data.answers,
            hasAiAnalysis: !!data.ai_analysis,
          });
          
          // answers 복원
          if (data.answers && Object.keys(data.answers).length > 0) {
            console.log('[Results] Restoring answers:', Object.keys(data.answers));
            setAnswers(data.answers);
          }
          
          // ai_analysis 복원
          if (data.ai_analysis) {
            console.log('[Results] Restoring AI analysis');
            setAiAnalysis(data.ai_analysis);
          }
          
          // answers나 ai_analysis가 없으면 경고
          if (!data.answers || Object.keys(data.answers).length === 0) {
            console.warn('[Results] No answers data found in project analysis');
          }
          if (!data.ai_analysis) {
            console.warn('[Results] No AI analysis data found in project analysis');
          }
        } else {
          console.error('[Results] Failed to load project analysis:', data.error);
        }
      } catch (error) {
        console.error('[Results] Failed to load project analysis:', error);
      }
      
      setIsInitialized(true);
    };
    
    loadProjectAnalysis();
  }, [projectId]);

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
    
    // 3. project_id가 있으면 저장된 프로젝트 데이터 불러오기
    if (projectId && Object.keys(paramsAnswers).length === 0) {
      console.log('[Results] Loading saved project data for project_id:', projectId);
      
      const loadSavedProject = async () => {
        try {
          console.log('[Results] Fetching saved project data...', { projectId });
          
          const response = await fetch(`/api/projects/${projectId}/analysis`, {
            method: 'GET',
            credentials: 'include', // 쿠키 포함
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('[Results] API response status:', response.status);
          
          const data = await response.json();
          console.log('[Results] API response data:', data);
          
          if (!response.ok) {
            if (response.status === 401) {
              console.error('[Results] Unauthorized - user not authenticated');
              // 인증되지 않은 경우 로그인 페이지로 리다이렉트
              window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
              return;
            }
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
          }
          
          if (data.ok) {
            console.log('[Results] Saved project data loaded:', {
              hasAnswers: !!data.answers,
              hasAiAnalysis: !!data.ai_analysis,
              messagesCount: data.messages ? data.messages.length : 0,
            });
            
            // answers 복원
            if (data.answers && Object.keys(data.answers).length > 0) {
              setAnswers(data.answers);
            }
            
            // ai_analysis 복원
            if (data.ai_analysis) {
              setAiAnalysis(data.ai_analysis);
            }
            
            setIsInitialized(true);
          } else {
            console.error('[Results] Failed to load saved project:', data.error);
            setError(data.error || 'Failed to load saved project');
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('[Results] Error loading saved project:', error);
          setError(error instanceof Error ? error.message : 'Failed to load saved project');
          setIsInitialized(true);
        }
      };
      
      loadSavedProject();
      return;
    }
    
    // 4. project_id도 없고 answers도 없으면 경고
    if (!projectId && Object.keys(paramsAnswers).length === 0) {
      console.warn('[Results] No project_id and no answers data found.');
    }
    
    setIsInitialized(true);
  }, [isInitialized, searchParams, projectId]);

  useEffect(() => {
    if (!isInitialized) return;
    
    // 이미 aiAnalysis가 있으면 (저장된 데이터에서 불러온 경우) 재분석 불필요
    if (aiAnalysis) {
      console.log('[Results] AI analysis already loaded, skipping fetch');
      return;
    }
    
    const hasAnswers = Object.keys(answers).length > 0;
    if (!hasAnswers) {
      console.warn('[Results] No answers data available. Please complete the chat flow first.');
      return;
    }
    if (!answers.project_name && !answers.product_info) {
      console.warn('[Results] Missing required fields: project_name or product_info');
      return;
    }

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
  }, [isInitialized, answers, aiAnalysis, projectId]);

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

  // 로딩 중이면 로더 표시
  if (isLoading) {
    return <AnalysisLoader />;
  }

  // project_id가 있지만 아직 초기화 중이면 로딩 표시
  if (projectId && !isInitialized) {
    return <AnalysisLoader />;
  }

  // answers가 없거나 필수 필드가 없으면 안내 메시지 표시
  // 단, project_id가 있고 아직 데이터를 불러오는 중이 아닐 때만
  if (isInitialized && !isLoading && !error && Object.keys(answers).length === 0 && !projectId) {
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

  // project_id가 있지만 분석 데이터를 불러오지 못한 경우
  if (isInitialized && projectId && !aiAnalysis && !isLoading && !error) {
    // answers가 있으면 분석을 다시 생성할 수 있음
    const canRegenerate = Object.keys(answers).length > 0 && 
                          (answers.project_name || answers.product_info);
    
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-white text-xl mb-2">No Analysis Available</div>
          <div className="text-zinc-400 text-sm mb-4">
            {canRegenerate 
              ? 'This saved project does not have analysis data. You can regenerate the analysis using the saved information.'
              : 'This saved project does not have analysis data. Please complete the chat flow first.'
            }
          </div>
          <div className="flex flex-col gap-3">
            {canRegenerate ? (
              <button
                onClick={async () => {
                  // answers가 있으면 분석 재생성
                  setIsLoading(true);
                  setError(null);
                  
                  try {
                    const response = await fetch('/api/analyze', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        userContext: answers,
                        project_id: projectId,
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok || !data.ok) {
                      if (data.error_code === 'CRITICAL_RISK') {
                        setCriticalRisk(true);
                        setBlacklistDetails(data.blacklist_details);
                        setIsLoading(false);
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
                    console.error('[Results] Failed to regenerate analysis:', err);
                    setError(err instanceof Error ? err.message : 'Failed to load analysis');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Regenerate Analysis
              </button>
            ) : null}
            <Link 
              href="/chat"
              className="inline-block px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              {canRegenerate ? 'Start New Analysis' : 'Go to Chat'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // aiAnalysis가 없고 answers도 없으면 안내 메시지
  if (!aiAnalysis && !isLoading && !error && Object.keys(answers).length === 0) {
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

  // aiAnalysis가 없으면 로딩 또는 에러 상태
  if (!aiAnalysis && !isLoading && !error) {
    // answers가 있으면 분석 중이거나 대기 중
    if (Object.keys(answers).length > 0) {
      return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-white text-xl mb-2">Generating Analysis...</div>
            <div className="text-zinc-400 text-sm mb-4">
              Please wait while we analyze your product.
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  if (!aiAnalysis) return null;
  
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

  // Check for critical risk
  const executiveSummary = aiAnalysis?.executive_summary || '';
  const strategicAdvice = aiAnalysis?.strategic_advice?.key_action || '';
  const osintRiskScore = aiAnalysis?.osint_risk_score || 0;
  const complianceRisk = aiAnalysis?.risks?.compliance?.level || '';
  
  const hasCriticalRisk = 
    executiveSummary.toLowerCase().includes('immediate halt') ||
    executiveSummary.toLowerCase().includes('do not proceed') ||
    strategicAdvice.toLowerCase().includes('halt') ||
    strategicAdvice.toLowerCase().includes('stop') ||
    osintRiskScore >= 90 ||
    (complianceRisk.toLowerCase() === 'high' && osintRiskScore >= 70);

  const scrollToRoadmap = () => {
    const roadmapElement = document.getElementById('action-roadmap');
    if (roadmapElement) {
      roadmapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
            hasCriticalRisk={hasCriticalRisk}
            onCriticalRiskClick={scrollToRoadmap}
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
