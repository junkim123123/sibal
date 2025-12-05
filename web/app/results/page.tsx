/**
 * Professional Sourcing Intelligence Dashboard
 * 
 * 8-Section Actionable Intelligence:
 * 1. Hero Metric Card
 * 2. Cost Breakdown (Detailed)
 * 3. Profitability Simulator (Interactive)
 * 4. Scale Analysis (Decision Support)
 * 5. Risk Assessment (5 Cards)
 * 6. Market Positioning (Visual)
 * 7. Action Roadmap (Timeline)
 * 8. CTA & Services (3 Tiers)
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle, Download, TrendingUp, Factory, Shield, Truck, Check, Package, DollarSign, BarChart3, HelpCircle, Calendar, Rocket } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { loadOnboardingState, clearOnboardingState } from '@/lib/onboardingStorage';
import type { OnboardingState } from '@/lib/types/onboarding';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

type Answers = Record<string, string>;

// Dynamic Calculation Functions
function calculateInsurance(factoryCost: number, units: number): number {
  // Insurance = Factory Cost * 0.01 (1%) OR minimum $30 divided by units
  const percentageBased = factoryCost * 0.01;
  const minimumBased = 30 / units;
  return Math.max(percentageBased, minimumBased);
}

function calculateCustomsFee(units: number): number {
  // Fixed customs entry fee: $100 flat
  // For low volume, this significantly impacts per-unit cost
  const fixedFee = 100;
  const perUnitFee = fixedFee / units;
  
  // Additional variable fees (estimated $0.10 per unit)
  const variableFee = 0.10;
  
  return perUnitFee + variableFee;
}

function extractVolumeFromAnswer(volumeAnswer: string): number {
  // Parse volume from answer like "Test run (< 50 units)" or "Scale (1000+ units)"
  if (volumeAnswer.includes('50') || volumeAnswer.includes('Test')) return 50;
  if (volumeAnswer.includes('100-500') || volumeAnswer.includes('Small')) return 300;
  if (volumeAnswer.includes('1000') || volumeAnswer.includes('Scale')) return 1000;
  return 100; // default
}

function inferShippingMethod(priority: string, timeline: string): 'Air' | 'Sea' {
  // If priority is "Fastest Speed" or timeline is "Within 1 month", use Air
  if (priority?.includes('Speed') || timeline?.includes('1 month')) {
    return 'Air';
  }
  // If priority is "Lowest Cost" or timeline is "Flexible", prefer Sea
  if (priority?.includes('Cost') || timeline?.includes('Flexible')) {
    return 'Sea';
  }
  // Default to Air for safety
  return 'Air';
}

// Comprehensive Mock Data (Bluetooth Earphones Example)
const BASE_MOCK_DATA = {
  productName: 'Bluetooth Noise-Cancelling Earphones',
  asin: 'B08XYZ1234',
  factoryCost: 5.50, // Base factory cost
  estimatedMargin: { min: 15, max: 25 },
};

// Generate dynamic cost breakdown based on user answers
function generateCostBreakdown(answers: Answers) {
  const factoryCost = BASE_MOCK_DATA.factoryCost;
  const volume = extractVolumeFromAnswer(answers.volume || 'Test run (< 50 units)');
  const shippingMethod = inferShippingMethod(answers.priority || '', answers.timeline || '');
  
  // Calculate dynamic values
  const insurance = calculateInsurance(factoryCost, volume);
  const customs = calculateCustomsFee(volume);
  
  // Shipping cost varies by method
  const shippingCost = shippingMethod === 'Air' ? 3.50 : 1.50; // Sea is cheaper
  const duty = factoryCost * 0.15; // 15% duty rate (example)
  const packaging = 0.95; // Fixed packaging cost
  
  const totalLandedCost = factoryCost + shippingCost + duty + packaging + customs + insurance;
  
  // Calculate percentages
  const calculatePercentage = (value: number) => (value / totalLandedCost) * 100;
  
  return {
    factory: { 
      value: factoryCost, 
      percentage: Math.round(calculatePercentage(factoryCost)), 
      label: 'Factory (EXW)', 
      tooltip: 'Ex-Works price from factory in Shenzhen, China' 
    },
    shipping: { 
      value: shippingCost, 
      percentage: Math.round(calculatePercentage(shippingCost)), 
      label: `Shipping (${shippingMethod})`, 
      tooltip: `${shippingMethod === 'Air' ? 'Air' : 'Sea'} freight from China to US West Coast (DDP terms)` 
    },
    duty: { 
      value: duty, 
      percentage: Math.round(calculatePercentage(duty)), 
      label: 'Duty (15%)', 
      tooltip: 'Based on HS Code 8518.30 - Headphones. Standard US import duty rate.' 
    },
    packaging: { 
      value: packaging, 
      percentage: Math.round(calculatePercentage(packaging)), 
      label: 'Packaging', 
      tooltip: 'Custom branded packaging and inserts' 
    },
    customs: { 
      value: customs, 
      percentage: Math.round(calculatePercentage(customs)), 
      label: 'Customs & Fees', 
      tooltip: `Customs clearance, port fees, and handling charges (Fixed $100 entry fee divided by ${volume} units)` 
    },
    insurance: { 
      value: insurance, 
      percentage: Math.round(calculatePercentage(insurance)), 
      label: 'Insurance', 
      tooltip: `Cargo insurance coverage (1% of factory cost or minimum $30/${volume} units)` 
    },
    totalLandedCost,
  };
}

// Generate category-based risks
function generateRisks(category: string) {
  const baseRisks = [
    {
      id: 'duty',
      category: 'Duty Risk',
      level: 'Low' as const,
      impact: '$0',
      description: 'Standard duty rate applies. No special regulations expected.',
      mitigation: 'Monitor 2025 Trade Policy changes. Consider DDP terms for predictability.',
      icon: Shield,
    },
    {
      id: 'supplier',
      category: 'Supplier Risk',
      level: 'Medium' as const,
      impact: '$500-1,000',
      description: 'Category requires supplier verification and quality control.',
      mitigation: 'Request ISO 9001 certification. Conduct factory audit before first order.',
      icon: Factory,
    },
    {
      id: 'logistics',
      category: 'Logistics Risk',
      level: 'Low' as const,
      impact: '$0',
      description: 'Standard shipping routes available. No major port congestion expected.',
      mitigation: 'Book shipping 2 weeks in advance. Consider LCL for volumes under 5 CBM.',
      icon: Truck,
    },
  ];
  
  // Category-specific compliance risk
  let complianceRisk;
  if (category?.toLowerCase().includes('electronic') || category?.toLowerCase().includes('battery')) {
    complianceRisk = {
      id: 'compliance',
      category: 'Compliance Risk',
      level: 'Medium' as const,
      impact: '$800',
      description: 'FCC / UL certification required for electronics in US market.',
      mitigation: 'Budget for FCC certification costs upfront. Factor into launch timeline.',
      icon: AlertCircle,
    };
  } else if (category?.toLowerCase().includes('home') || category?.toLowerCase().includes('kitchen') || category?.toLowerCase().includes('food')) {
    complianceRisk = {
      id: 'compliance',
      category: 'Compliance Risk',
      level: 'Medium' as const,
      impact: '$600-1,200',
      description: 'FDA / Food Contact Safety certification required.',
      mitigation: 'Ensure food-grade materials. Budget for FDA compliance testing.',
      icon: AlertCircle,
    };
  } else if (category?.toLowerCase().includes('fashion') || category?.toLowerCase().includes('textile')) {
    complianceRisk = {
      id: 'compliance',
      category: 'Compliance Risk',
      level: 'Low' as const,
      impact: '$200-400',
      description: 'Fabric Labeling / Flammability standards apply.',
      mitigation: 'Ensure proper care labels and flammability testing for textiles.',
      icon: AlertCircle,
    };
  } else {
    // Default compliance risk
    complianceRisk = {
      id: 'compliance',
      category: 'Compliance Risk',
      level: 'Low' as const,
      impact: '$200-500',
      description: 'Standard compliance requirements apply.',
      mitigation: 'Review category-specific regulations before launch.',
      icon: AlertCircle,
    };
  }
  
  return [...baseRisks, complianceRisk, {
    id: 'quality',
    category: 'Quality Risk',
    level: 'Low' as const,
    impact: '$200-500',
    description: 'Low risk for established category. Standard QC protocols apply.',
    mitigation: 'Request pre-shipment inspection. Set AQL 2.5 for critical components.',
    icon: CheckCircle2,
  }];
}

// Generate roadmap based on shipping method
function generateRoadmap(shippingMethod: 'Air' | 'Sea', category: string) {
  const baseRoadmap = [
    { week: 'Wk 1-2', title: 'Supplier Verification', description: 'Verify credentials, certifications, and factory audit', completed: false },
  ];
  
  // Compliance step varies by category
  let complianceStep;
  if (category?.toLowerCase().includes('electronic')) {
    complianceStep = { week: 'Wk 2-3', title: 'Compliance (FCC)', description: 'Obtain FCC certification for Bluetooth devices', completed: false };
  } else if (category?.toLowerCase().includes('home') || category?.toLowerCase().includes('food')) {
    complianceStep = { week: 'Wk 2-3', title: 'Compliance (FDA)', description: 'Obtain FDA certification for food contact products', completed: false };
  } else {
    complianceStep = { week: 'Wk 2-3', title: 'Compliance Check', description: 'Verify category-specific compliance requirements', completed: false };
  }
  
  const orderStep = { week: 'Wk 4', title: 'Place Order', description: 'Finalize order details, payment terms, and production schedule', completed: false };
  
  // Launch timing depends on shipping method
  const launchWeek = shippingMethod === 'Air' ? 'Wk 8' : 'Wk 12-14';
  const launchStep = { 
    week: launchWeek, 
    title: 'Launch', 
    description: `Receive shipment via ${shippingMethod === 'Air' ? 'air freight' : 'sea freight'}, quality check, and launch to Amazon`, 
    completed: false 
  };
  
  return [...baseRoadmap, complianceStep, orderStep, launchStep];
}

const MOCK_DATA = {
  ...BASE_MOCK_DATA,
  scaleScenarios: [
    { units: 100, method: 'Air', cost: 12.45, margin: 48, label: 'Safe Start', recommended: false },
    { units: 500, method: 'Air', cost: 10.95, margin: 55, label: 'Steady Growth', recommended: false },
    { units: 1000, method: 'Sea', cost: 8.95, margin: 62, label: 'Scale Up', recommended: true, savings: 3.50 },
  ],
  competitorPrices: {
    budget: 18,
    mid: 35,
    premium: 79,
  },
  risks: [
    {
      id: 'duty',
      category: 'Duty Risk',
      level: 'Low' as const,
      impact: '$0',
      description: 'Standard duty rate applies. No special regulations expected.',
      mitigation: 'Monitor 2025 Trade Policy changes. Consider DDP terms for predictability.',
      icon: Shield,
    },
    {
      id: 'supplier',
      category: 'Supplier Risk',
      level: 'Medium' as const,
      impact: '$500-1,000',
      description: 'Electronics category requires supplier verification and quality control.',
      mitigation: 'Request ISO 9001 certification. Conduct factory audit before first order.',
      icon: Factory,
    },
    {
      id: 'compliance',
      category: 'Compliance Risk',
      level: 'Medium' as const,
      impact: '$800',
      description: 'FCC certification required for Bluetooth devices in US market.',
      mitigation: 'Budget for FCC certification costs upfront. Factor into launch timeline.',
      icon: AlertCircle,
    },
    {
      id: 'logistics',
      category: 'Logistics Risk',
      level: 'Low' as const,
      impact: '$0',
      description: 'Standard shipping routes available. No major port congestion expected.',
      mitigation: 'Book shipping 2 weeks in advance. Consider LCL for volumes under 5 CBM.',
      icon: Truck,
    },
    {
      id: 'quality',
      category: 'Quality Risk',
      level: 'Low' as const,
      impact: '$200-500',
      description: 'Low risk for established electronics category. Standard QC protocols apply.',
      mitigation: 'Request pre-shipment inspection. Set AQL 2.5 for critical components.',
      icon: CheckCircle2,
    },
  ],
  amazonFees: {
    referral: 0.15, // 15%
    fulfillment: 3.50,
    storage: 0.20,
  },
  monthlySalesVelocity: 100, // units per month
  roadmap: [
    { week: 'Wk 1-2', title: 'Supplier Verification', description: 'Verify credentials, certifications, and factory audit', completed: false },
    { week: 'Wk 2-3', title: 'Compliance (FCC)', description: 'Obtain FCC certification for Bluetooth devices', completed: false },
    { week: 'Wk 4', title: 'Place Order', description: 'Finalize order details, payment terms, and production schedule', completed: false },
    { week: 'Wk 8', title: 'Launch', description: 'Receive shipment, quality check, and launch to Amazon', completed: false },
  ],
  serviceTiers: [
    { 
      name: 'Self-Service', 
      price: 0, 
      features: ['Basic supplier verification', 'Email support', 'Standard templates', 'Access to dashboard'],
      recommended: false,
    },
    { 
      name: 'Basic', 
      price: 299, 
      features: ['Full supplier verification', 'Compliance checklist', 'Priority email support', '1 revision'],
      recommended: false,
    },
    { 
      name: 'Premium', 
      price: 999, 
      features: ['Full supplier audit', 'Compliance guarantee', 'Dedicated manager', 'Priority support', 'Unlimited revisions'],
      recommended: true,
    },
  ],
};

// Helper function to generate chart data from cost breakdown
function generateChartData(costBreakdown: ReturnType<typeof generateCostBreakdown>) {
  return Object.entries(costBreakdown)
    .filter(([key, data]) => key !== 'totalLandedCost' && typeof data === 'object' && 'label' in data)
    .map(([key, data]) => {
      if (typeof data === 'object' && 'label' in data && 'value' in data) {
        return {
          name: data.label.split('(')[0].trim(),
          value: data.value,
          color: key === 'factory' ? '#208094' : key === 'shipping' ? '#34D399' : key === 'duty' ? '#FBBF24' : key === 'packaging' ? '#60A5FA' : key === 'customs' ? '#A78BFA' : '#F472B6',
        };
      }
      return null;
    })
    .filter((item): item is { name: string; value: number; color: string } => item !== null);
}

// Component: Hero Metric Card
function HeroMetricCard({ productName, asin, totalLandedCost, margin }: { 
  productName: string; 
  asin: string;
  totalLandedCost: number; 
  margin: { min: number; max: number } 
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{productName}</h1>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>ASIN: {asin}</span>
            <span>•</span>
            <span>Sourcing Intelligence Report</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-zinc-400 text-sm mb-1">Estimated Landed Cost</p>
            <p className="text-5xl md:text-6xl font-mono font-bold tabular-nums tracking-tight text-[#208094]">
              ${totalLandedCost.toFixed(2)}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <p className="text-emerald-400 font-semibold text-sm">
              Margin {margin.min}-{margin.max}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Component: Cost Breakdown Card with Tooltips
function CostBreakdownCard({ answers }: { answers: Answers }) {
  const [tooltipKey, setTooltipKey] = useState<string | null>(null);
  const costBreakdown = generateCostBreakdown(answers);
  const costChartData = generateChartData(costBreakdown);
  
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-[#208094]" />
        <h2 className="text-xl font-semibold text-white">Cost Breakdown</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costChartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
              >
                {costChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost List with Tooltips */}
        <div className="space-y-3">
          {Object.entries(costBreakdown)
            .filter(([key, data]) => key !== 'totalLandedCost' && typeof data === 'object' && 'label' in data)
            .map(([key, data]) => {
              if (typeof data !== 'object' || !('label' in data) || !('value' in data) || !('percentage' in data) || !('tooltip' in data)) {
                return null;
              }
              
              const icons: Record<string, any> = {
                factory: Factory,
                shipping: Truck,
                duty: Shield,
                packaging: Package,
                customs: DollarSign,
                insurance: Shield,
              };
              const Icon = icons[key] || DollarSign;
              
              return (
                <div 
                  key={key} 
                  className="relative p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-[#208094]/50 transition-colors"
                  onMouseEnter={() => setTooltipKey(key)}
                  onMouseLeave={() => setTooltipKey(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400">{data.label}</span>
                          <div className="relative">
                            <HelpCircle className="h-3 w-3 text-zinc-500 cursor-help" />
                            {tooltipKey === key && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 z-10 shadow-xl">
                                {data.tooltip}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-zinc-500">{data.percentage}% of total</span>
                      </div>
                    </div>
                    <span className="text-lg font-mono font-semibold tabular-nums text-white">${data.value.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          <div className="mt-4 p-4 rounded-lg bg-[#208094]/10 border border-[#208094]/30">
            <p className="text-xs text-zinc-400 mb-1">💡 Insight</p>
            <p className="text-sm text-white">
              {typeof costBreakdown.shipping === 'object' && 'label' in costBreakdown.shipping && costBreakdown.shipping.label.includes('Air')
                ? `Shipping (Air) is ${typeof costBreakdown.shipping === 'object' && 'percentage' in costBreakdown.shipping ? costBreakdown.shipping.percentage : 0}% of your total cost. Consider Sea Freight for volumes above 500 units.`
                : `Shipping (Sea) is ${typeof costBreakdown.shipping === 'object' && 'percentage' in costBreakdown.shipping ? costBreakdown.shipping.percentage : 0}% of your total cost. Good choice for cost optimization.`
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Component: Profitability Simulator with Monthly View
function ProfitabilitySimulator({ totalLandedCost }: { totalLandedCost: number }) {
  const [retailPrice, setRetailPrice] = useState(49.99);
  
  const referralFee = retailPrice * MOCK_DATA.amazonFees.referral;
  const totalAmazonFees = referralFee + MOCK_DATA.amazonFees.fulfillment + MOCK_DATA.amazonFees.storage;
  const netProfit = retailPrice - totalLandedCost - totalAmazonFees;
  const profitMargin = (netProfit / retailPrice) * 100;
  const monthlyProfit = netProfit * MOCK_DATA.monthlySalesVelocity;

  const waterfallData = [
    { name: 'Retail Price', value: retailPrice, color: '#208094' },
    { name: 'Product Cost', value: -totalLandedCost, color: '#EF4444' },
    { name: 'Amazon Fees', value: -totalAmazonFees, color: '#F59E0B' },
    { name: 'Net Profit', value: netProfit, color: '#10B981' },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-[#208094]" />
        <h2 className="text-xl font-semibold text-white">Profitability Simulator</h2>
      </div>

      <div className="space-y-6">
        {/* Slider */}
        <div>
          <label className="block text-sm text-zinc-400 mb-3">
            Target Retail Price: <span className="text-white font-mono font-semibold">${retailPrice.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="18"
            max="80"
            step="0.01"
            value={retailPrice}
            onChange={(e) => setRetailPrice(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#208094]"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>$18</span>
            <span>$80</span>
          </div>
        </div>

        {/* Waterfall Calculation */}
        <div className="space-y-3">
          {waterfallData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-sm text-zinc-400">{item.name}</span>
              <span className={`text-lg font-mono font-semibold tabular-nums ${
                item.value >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {item.value >= 0 ? '+' : ''}${item.value.toFixed(2)}
              </span>
            </div>
          ))}
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mt-4">
            <div>
              <p className="text-sm font-semibold text-emerald-400">Net Profit per Unit</p>
              <p className="text-xs text-zinc-400 mt-1">Profit Margin: {profitMargin.toFixed(1)}%</p>
            </div>
            <span className={`text-2xl font-mono font-bold tabular-nums ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${netProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Monthly View */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
          <p className="text-xs text-zinc-400 mb-2">Monthly Projection (at {MOCK_DATA.monthlySalesVelocity} units/month)</p>
          <p className="text-2xl font-mono font-bold tabular-nums text-[#208094]">
            ${monthlyProfit.toFixed(2)}/month
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Annual: ${(monthlyProfit * 12).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Component: Scale Analysis with Savings Insight
function ScaleAnalysisCard() {
  const recommendedScenario = MOCK_DATA.scaleScenarios.find(s => s.recommended);
  
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-5 w-5 text-[#208094]" />
        <h2 className="text-xl font-semibold text-white">Scale Analysis</h2>
      </div>

      <div className="space-y-3">
        {MOCK_DATA.scaleScenarios.map((scenario, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 ${
              scenario.recommended
                ? 'bg-[#208094]/10 border-[#208094] shadow-lg shadow-[#208094]/20'
                : 'bg-zinc-950 border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">{scenario.units} Units</span>
                <span className="text-zinc-400 text-sm">({scenario.method})</span>
                <span className="text-zinc-500 text-xs">{scenario.label}</span>
                {scenario.recommended && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-[#208094] text-white flex items-center gap-1">
                    <Rocket className="h-3 w-3" />
                    Recommended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Cost/Unit</p>
                  <p className="text-lg font-mono font-semibold tabular-nums text-white">${scenario.cost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Margin</p>
                  <p className="text-lg font-mono font-semibold tabular-nums text-emerald-400">{scenario.margin}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {recommendedScenario && recommendedScenario.savings && (
        <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-xs text-zinc-400 mb-1">💡 Decision Support</p>
          <p className="text-sm text-white">
            Switching to Sea Freight saves you <span className="font-semibold text-emerald-400">${recommendedScenario.savings.toFixed(2)}/unit</span> at scale.
          </p>
        </div>
      )}
    </Card>
  );
}

// Component: Risk Assessment (5 Cards)
function RiskAssessmentCard({ category }: { category: string }) {
  const risks = generateRisks(category);
  
  const getRiskStyles = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'High') return 'bg-red-500/10 border-red-500/30 text-red-400';
    if (level === 'Medium') return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  };

  const getRiskIcon = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'High') return <XCircle className="h-4 w-4" />;
    if (level === 'Medium') return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-[#208094]" />
        <h2 className="text-xl font-semibold text-white">Risk Assessment</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {risks.map((risk) => {
          const Icon = risk.icon;
          return (
            <div
              key={risk.id}
              className={`p-4 rounded-lg border-2 ${getRiskStyles(risk.level)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">{risk.category}</h3>
                </div>
                {getRiskIcon(risk.level)}
              </div>
              <p className="text-xs text-zinc-400 mb-2">{risk.description}</p>
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">
                  Impact: <span className="font-semibold text-white">{risk.impact}</span>
                </p>
                <p className="text-xs text-zinc-400">💡 {risk.mitigation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Component: Market Positioning with Strategy
function MarketPositioningCard() {
  const [retailPrice] = useState(49.99);
  const minPrice = MOCK_DATA.competitorPrices.budget;
  const maxPrice = MOCK_DATA.competitorPrices.premium;
  const range = maxPrice - minPrice;
  const userPosition = ((retailPrice - minPrice) / range) * 100;
  const budgetPosition = 0;
  const midPosition = ((MOCK_DATA.competitorPrices.mid - minPrice) / range) * 100;
  const premiumPosition = 100;
  const launchPrice = 44.99;
  const launchPosition = ((launchPrice - minPrice) / range) * 100;

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-[#208094]" />
        <h2 className="text-xl font-semibold text-white">Market Positioning</h2>
      </div>

      <div className="space-y-6">
        {/* Price Ladder */}
        <div className="relative">
          <div className="relative h-16 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-emerald-500/20" />
            
            {/* Budget Marker */}
            <div className="absolute top-0 bottom-0" style={{ left: `${budgetPosition}%` }}>
              <div className="relative h-full w-0.5 bg-red-400">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-zinc-400 whitespace-nowrap">
                  Budget ${minPrice}
                </div>
              </div>
            </div>

            {/* Mid Marker */}
            <div className="absolute top-0 bottom-0" style={{ left: `${midPosition}%` }}>
              <div className="relative h-full w-0.5 bg-yellow-400">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-zinc-400 whitespace-nowrap">
                  Mid ${MOCK_DATA.competitorPrices.mid}
                </div>
              </div>
            </div>

            {/* Launch Price Marker */}
            <div className="absolute top-0 bottom-0" style={{ left: `${launchPosition}%` }}>
              <div className="relative h-full w-1 bg-yellow-500">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <div className="px-2 py-1 rounded bg-yellow-500 text-black text-xs font-semibold whitespace-nowrap">
                    Launch ${launchPrice}
                  </div>
                </div>
              </div>
            </div>

            {/* User Target Marker */}
            <div className="absolute top-0 bottom-0" style={{ left: `${userPosition}%` }}>
              <div className="relative h-full w-1 bg-[#208094]">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <div className="px-2 py-1 rounded bg-[#208094] text-white text-xs font-semibold whitespace-nowrap">
                    Target ${retailPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Marker */}
            <div className="absolute top-0 bottom-0" style={{ left: `${premiumPosition}%` }}>
              <div className="relative h-full w-0.5 bg-emerald-400">
                <div className="absolute -top-6 right-0 text-xs text-zinc-400 whitespace-nowrap">
                  Premium ${maxPrice}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Insight */}
        <div className="p-4 rounded-lg bg-[#208094]/10 border border-[#208094]/30">
          <p className="text-xs text-zinc-400 mb-1">💡 Launch Strategy</p>
          <p className="text-sm text-white">
            Launch at <span className="font-semibold text-[#208094]">${launchPrice}</span> to build reviews, then raise to ${retailPrice.toFixed(2)} after 50+ reviews. Position as "Value Leader" in mid-market segment.
          </p>
        </div>
      </div>
    </Card>
  );
}

// Component: Action Roadmap with Weeks
function ActionRoadmap({ shippingMethod, category }: { shippingMethod: 'Air' | 'Sea', category: string }) {
  const roadmap = generateRoadmap(shippingMethod, category);
  
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="h-5 w-5 text-[#208094]" />
        <h2 className="text-xl font-semibold text-white">Action Roadmap</h2>
      </div>

      <div className="space-y-4">
        {roadmap.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs ${
                step.completed 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-zinc-950 border-2 border-zinc-800 text-zinc-400'
              }`}>
                {step.completed ? <Check className="h-5 w-5" /> : step.week}
              </div>
              {index < roadmap.length - 1 && (
                <div className="w-0.5 h-16 bg-zinc-800 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">{step.title}</h3>
                <span className="text-xs text-zinc-500">{step.week}</span>
              </div>
              <p className="text-sm text-zinc-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Component: CTA & Services (3 Tiers)
function CTAServicesCard() {
  const router = useRouter();
  
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-[#208094]" />
        <h2 className="text-xl font-semibold text-white">Get Started</h2>
      </div>

      {/* Primary CTA */}
      <div className="mb-6 p-6 rounded-lg bg-[#208094]/10 border-2 border-[#208094]">
        <h3 className="text-lg font-semibold text-white mb-2">Schedule Free Consultation</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Talk to our sourcing experts about your project. No commitment required.
        </p>
        <Button
          variant="primary"
          className="w-full sm:w-auto bg-[#208094] hover:bg-[#1a6b7a] text-white"
          onClick={() => router.push('/contact')}
          size="lg"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Free Consultation
        </Button>
      </div>

      {/* Service Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_DATA.serviceTiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-4 rounded-lg border-2 ${
              tier.recommended
                ? 'bg-[#208094]/10 border-[#208094]'
                : 'bg-zinc-950 border-zinc-800'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-white">{tier.name}</h3>
                <p className="text-2xl font-mono font-bold tabular-nums text-[#208094] mt-1">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                </p>
              </div>
              {tier.recommended && (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-[#208094] text-white">
                  Recommended
                </span>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                  <Check className="h-3 w-3 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={tier.recommended ? 'primary' : 'outline'}
              className="w-full"
              onClick={() => router.push('/contact')}
            >
              Select {tier.name}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Main Component
function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Answers>({});
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    
    try {
      const chatData = localStorage.getItem('nexsupply_onboarding_data');
      if (chatData) {
        const parsed = JSON.parse(chatData);
        setAnswers(parsed);
      }
    } catch (error) {
      console.error('Failed to load chat onboarding data:', error);
    }
    
    const savedOnboarding = loadOnboardingState();
    if (savedOnboarding) {
      setOnboardingState(savedOnboarding);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    const paramsAnswers: Answers = {};
    searchParams?.forEach((value, key) => {
      try {
        paramsAnswers[key] = JSON.parse(value);
      } catch {
        paramsAnswers[key] = value;
      }
    });

    if (Object.keys(paramsAnswers).length > 0) {
      setAnswers(paramsAnswers);
    }
  }, [searchParams]);

  const productName = answers.product_desc?.split(',')[0] || answers.project_name || BASE_MOCK_DATA.productName;
  const category = answers.category || 'Electronics'; // Default category
  const shippingMethod = inferShippingMethod(answers.priority || '', answers.timeline || '');
  const costBreakdown = generateCostBreakdown(answers);
  const totalLandedCost = costBreakdown.totalLandedCost;

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section 1: Hero Metric Card (Full Width) */}
        <HeroMetricCard
          productName={productName}
          asin={BASE_MOCK_DATA.asin}
          totalLandedCost={totalLandedCost}
          margin={BASE_MOCK_DATA.estimatedMargin}
        />

        {/* Bento Grid: Sections 2-8 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Section 2: Cost Breakdown (2 columns) */}
          <div className="md:col-span-2">
            <CostBreakdownCard answers={answers} />
          </div>

          {/* Section 3: Profitability Simulator (1 column) */}
          <div className="md:col-span-1">
            <ProfitabilitySimulator totalLandedCost={totalLandedCost} />
          </div>

          {/* Section 4: Scale Analysis (1 column) */}
          <div className="md:col-span-1">
            <ScaleAnalysisCard />
          </div>

          {/* Section 5: Risk Assessment (2 columns) */}
          <div className="md:col-span-2">
            <RiskAssessmentCard category={category} />
          </div>

          {/* Section 6: Market Positioning (Full Width) */}
          <div className="md:col-span-3">
            <MarketPositioningCard />
          </div>

          {/* Section 7: Action Roadmap (Full Width) */}
          <div className="md:col-span-3">
            <ActionRoadmap shippingMethod={shippingMethod} category={category} />
          </div>

          {/* Section 8: CTA & Services (Full Width) */}
          <div className="md:col-span-3">
            <CTAServicesCard />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => alert('PDF download feature coming soon!')}
            className="border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearOnboardingState();
              router.push('/chat');
            }}
            className="text-zinc-400 hover:text-white"
          >
            Start New Project
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
