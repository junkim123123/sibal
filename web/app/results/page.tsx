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
  if (priority?.includes('Speed') || timeline?.includes('1 month') || timeline?.includes('4 weeks')) {
    return 'Air';
  }
  // If priority is "Lowest Cost" or timeline is "Flexible" or "3-6 months", prefer Sea
  if (priority?.includes('Cost') || timeline?.includes('Flexible') || timeline?.includes('3-6 months')) {
    return 'Sea';
  }
  // Default to Air for safety
  return 'Air';
}

// Infer channel type from user answers
function inferChannelType(channel: string, businessModel: string): 'Amazon' | 'Shopify' | 'Wholesale' | 'B2B' | 'Marketplace' | 'Other' {
  if (!channel && !businessModel) return 'Other';
  
  const channelLower = (channel || '').toLowerCase();
  const businessLower = (businessModel || '').toLowerCase();
  
  // Check for Amazon
  if (channelLower.includes('amazon') || channelLower.includes('marketplace')) {
    return 'Amazon';
  }
  
  // Check for Shopify/DTC
  if (channelLower.includes('shopify') || channelLower.includes('woo') || channelLower.includes('direct-to-consumer') || channelLower.includes('dtc')) {
    return 'Shopify';
  }
  
  // Check for Wholesale/B2B
  if (channelLower.includes('wholesale') || channelLower.includes('b2b') || channelLower.includes('distributor') || 
      businessLower.includes('wholesale') || businessLower.includes('b2b') || businessLower.includes('distributor')) {
    return 'Wholesale';
  }
  
  // Check for B2B Marketplaces
  if (channelLower.includes('alibaba') || channelLower.includes('faire') || channelLower.includes('b2b marketplace')) {
    return 'B2B';
  }
  
  return 'Other';
}

// Calculate channel & fulfillment costs based on channel type
function calculateChannelFees(retailPrice: number, channelType: ReturnType<typeof inferChannelType>): number {
  switch (channelType) {
    case 'Amazon':
      // Amazon: Referral (15%) + FBA ($3.50) + Storage ($0.20)
      return (retailPrice * 0.15) + 3.50 + 0.20;
    
    case 'Shopify':
      // Shopify: Credit card fees (2.9% + $0.30) + 3PL fulfillment (~$3-5)
      return (retailPrice * 0.029) + 0.30 + 3.50;
    
    case 'Wholesale':
    case 'B2B':
      // Wholesale/B2B: Very low - just logistics handling (2-5%)
      return retailPrice * 0.03; // 3% for handling
    
    case 'Marketplace':
      // Other marketplaces: Moderate fees
      return (retailPrice * 0.10) + 2.00;
    
    default:
      // Default: Moderate estimate
      return (retailPrice * 0.08) + 2.50;
  }
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
    complianceStep = { week: 'Wk 2-3', title: 'Compliance & Certifications', description: 'Obtain FCC/UL certifications for electronics in target market', completed: false };
  } else if (category?.toLowerCase().includes('home') || category?.toLowerCase().includes('food')) {
    complianceStep = { week: 'Wk 2-3', title: 'Compliance & Certifications', description: 'Obtain FDA/food safety certifications for food contact products', completed: false };
  } else {
    complianceStep = { week: 'Wk 2-3', title: 'Compliance & Certifications', description: 'Verify category-specific compliance requirements and certifications', completed: false };
  }
  
  const orderStep = { week: 'Wk 4', title: 'Place Order', description: 'Finalize order details, payment terms, and production schedule', completed: false };
  
  // Launch timing depends on shipping method
  const launchWeek = shippingMethod === 'Air' ? 'Wk 8' : 'Wk 12-14';
  const launchStep = { 
    week: launchWeek, 
    title: 'Channel Launch & Fulfillment', 
    description: `Receive shipment via ${shippingMethod === 'Air' ? 'air freight' : 'sea freight'}, quality check, and launch to your sales channel`, 
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
  monthlySalesVelocity: 100, // units per month
  roadmap: [
    { week: 'Wk 1-2', title: 'Supplier Verification', description: 'Verify credentials, certifications, and factory audit', completed: false },
    { week: 'Wk 2-3', title: 'Compliance (FCC)', description: 'Obtain FCC certification for Bluetooth devices', completed: false },
    { week: 'Wk 4', title: 'Place Order', description: 'Finalize order details, payment terms, and production schedule', completed: false },
    { week: 'Wk 8', title: 'Launch', description: 'Receive shipment, quality check, and launch to Amazon', completed: false },
  ],
  serviceTiers: [
    { 
      name: 'Starter (AI Scout)', 
      tag: 'Free Tool',
      price: 0, 
      priceDisplay: '$0 / mo',
      features: [
        'Real-Time Cost & Risk Analysis',
        '30 Reports/month',
        'Platform-neutral insights',
        'Basic supplier database access'
      ],
      recommended: false,
      ctaLabel: 'Start Analysis',
      ctaHref: '/chat',
    },
    { 
      name: 'Validator (Entry)', 
      tag: 'Start with One Box',
      price: 199, 
      priceDisplay: '$199 (Retainer)',
      features: [
        'Get Verified Quote',
        'Supplier Vetting',
        '100% Credited on Order ($5k+)',
        'Priority support',
        'Dedicated quote specialist'
      ],
      recommended: false,
      ctaLabel: 'Request Quote',
      ctaHref: '/contact',
    },
    { 
      name: 'Executor (Full Service)', 
      tag: 'End-to-End Solution',
      price: null, 
      priceDisplay: '3% - 9% Commission',
      features: [
        'Module A or B Selection',
        'QC & Logistics',
        'Dedicated Manager',
        'Global Sync Time',
        '24-hour response (Mon-Fri)'
      ],
      recommended: true,
      note: 'Min. service fee $500 applies.',
      ctaLabel: 'Get Started',
      ctaHref: '/contact',
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
          color: key === 'factory' ? '#22d3ee' : key === 'shipping' ? '#34d399' : key === 'duty' ? '#fbbf24' : key === 'packaging' ? '#a78bfa' : key === 'customs' ? '#8b5cf6' : '#ec4899',
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
    <Card className="bg-[#18181b] border-zinc-800/50 p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">{productName}</h1>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>ASIN: {asin}</span>
            <span>•</span>
            <span>Sourcing Intelligence Report</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">Estimated Landed Cost</p>
            <p className="text-6xl md:text-7xl lg:text-8xl font-mono font-bold tabular-nums tracking-tight text-[#22d3ee]">
              ${totalLandedCost.toFixed(2)}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700">
            <p className="text-zinc-400 font-semibold text-sm">
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
    <Card className="bg-[#18181b] border-zinc-800/50 p-8">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Cost Breakdown</h2>
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
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#fff', fontSize: '12px' }}
                formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
              />
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
                  className="relative p-4 rounded-lg bg-[#09090b] border border-zinc-800/50 hover:border-[#22d3ee]/30 transition-colors"
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
          <div className="mt-4 p-4 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/20">
            <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">💡 Insight</p>
            <p className="text-sm text-zinc-300">
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
function ProfitabilitySimulator({ totalLandedCost, answers }: { totalLandedCost: number; answers: Answers }) {
  const [retailPrice, setRetailPrice] = useState(49.99);
  
  const channelType = inferChannelType(answers.channel || '', answers.business_model || '');
  const channelFees = calculateChannelFees(retailPrice, channelType);
  const netProfit = retailPrice - totalLandedCost - channelFees;
  const profitMargin = (netProfit / retailPrice) * 100;
  const monthlyProfit = netProfit * MOCK_DATA.monthlySalesVelocity;

  const waterfallData = [
    { name: 'Retail Price', value: retailPrice, color: '#22d3ee' },
    { name: 'Product Cost', value: -totalLandedCost, color: '#ef4444' },
    { name: 'Channel & Fulfillment Costs', value: -channelFees, color: '#fbbf24' },
    { name: 'Net Profit', value: netProfit, color: '#10b981' },
  ];

  return (
    <Card className="bg-[#18181b] border-zinc-800/50 p-8">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Profitability Simulator</h2>
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
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#22d3ee]"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>$18</span>
            <span>$80</span>
          </div>
        </div>

        {/* Waterfall Calculation */}
        <div className="space-y-3">
          {waterfallData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-[#09090b] border border-zinc-800/50">
              <span className="text-sm text-zinc-400">{item.name}</span>
              <span className={`text-lg font-mono font-semibold tabular-nums ${
                item.value >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {item.value >= 0 ? '+' : ''}${item.value.toFixed(2)}
              </span>
            </div>
          ))}
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 mt-4">
            <div>
              <p className="text-sm font-semibold text-[#10b981]">Net Profit per Unit</p>
              <p className="text-xs text-zinc-500 mt-1">Profit Margin: {profitMargin.toFixed(1)}%</p>
            </div>
            <span className={`text-2xl font-mono font-bold tabular-nums ${netProfit >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
              ${netProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Monthly View */}
        <div className="p-4 rounded-lg bg-[#09090b] border border-zinc-800/50">
          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Monthly Projection (at {MOCK_DATA.monthlySalesVelocity} units/month)</p>
          <p className="text-3xl font-mono font-bold tabular-nums text-[#22d3ee]">
            ${monthlyProfit.toFixed(2)}/month
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Annual: ${(monthlyProfit * 12).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Component: Scale Analysis with Savings Insight
function ScaleAnalysisCard({ aiAnalysis }: { aiAnalysis?: AIAnalysisResult | null }) {
  type ScenarioType = {
    units: number;
    method: string;
    cost: number;
    margin: number;
    label: string;
    recommended: boolean;
    savings?: number;
  };
  
  const scenarios: ScenarioType[] = aiAnalysis?.scale_analysis 
    ? aiAnalysis.scale_analysis.map((s, idx) => {
        const prevCost = idx > 0 ? aiAnalysis.scale_analysis[idx - 1].unit_cost : 0;
        return {
          units: s.qty,
          method: s.mode,
          cost: s.unit_cost,
          margin: Math.round(s.margin),
          label: s.qty < 100 ? 'Safe Start' : s.qty < 1000 ? 'Steady Growth' : 'Scale Up',
          recommended: idx === aiAnalysis.scale_analysis.length - 1,
          savings: idx > 0 ? prevCost - s.unit_cost : undefined,
        };
      })
    : MOCK_DATA.scaleScenarios;
  
  const recommendedScenario = scenarios.find(s => s.recommended);
  
  return (
    <Card className="bg-[#18181b] border-zinc-800/50 p-8">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Scale Analysis</h2>
      </div>

      <div className="space-y-3">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 ${
              scenario.recommended
                ? 'bg-[#22d3ee]/10 border-[#22d3ee] shadow-lg shadow-[#22d3ee]/20'
                : 'bg-[#09090b] border-zinc-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">{scenario.units} Units</span>
                <span className="text-zinc-400 text-sm">({scenario.method})</span>
                <span className="text-zinc-500 text-xs">{scenario.label}</span>
                {scenario.recommended && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-[#22d3ee] text-black flex items-center gap-1">
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
        <div className="mt-4 p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">💡 Decision Support</p>
          <p className="text-sm text-zinc-300">
            Switching to Sea Freight saves you <span className="font-semibold text-[#10b981]">${recommendedScenario.savings.toFixed(2)}/unit</span> at scale.
          </p>
        </div>
      )}
    </Card>
  );
}

// Component: Risk Assessment (5 Cards)
function RiskAssessmentCard({ category, aiAnalysis }: { category: string; aiAnalysis?: AIAnalysisResult | null }) {
  const risks = aiAnalysis 
    ? [
        {
          id: 'duty',
          category: 'Duty Risk',
          level: aiAnalysis.risks.duty.level,
          impact: '$0',
          description: aiAnalysis.risks.duty.reason,
          mitigation: 'Monitor 2025 Trade Policy changes. Consider DDP terms for predictability.',
          icon: Shield,
        },
        {
          id: 'supplier',
          category: 'Supplier Risk',
          level: aiAnalysis.risks.supplier.level,
          impact: '$500-1,000',
          description: aiAnalysis.risks.supplier.reason,
          mitigation: 'Request ISO 9001 certification. Conduct factory audit before first order.',
          icon: Factory,
        },
        {
          id: 'compliance',
          category: 'Compliance Risk',
          level: aiAnalysis.risks.compliance.level,
          impact: `$${aiAnalysis.risks.compliance.cost}`,
          description: aiAnalysis.risks.compliance.reason,
          mitigation: 'Budget for certification costs upfront. Factor into launch timeline.',
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
          description: 'Low risk for established category. Standard QC protocols apply.',
          mitigation: 'Request pre-shipment inspection. Set AQL 2.5 for critical components.',
          icon: CheckCircle2,
        },
      ]
    : generateRisks(category);
  
  const getRiskStyles = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'High') return 'bg-[#09090b] border-red-500/50 text-red-400';
    if (level === 'Medium') return 'bg-[#09090b] border-yellow-500/50 text-yellow-400';
    return 'bg-[#09090b] border-[#10b981]/50 text-[#10b981]';
  };

  const getRiskIcon = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'High') return <XCircle className="h-4 w-4" />;
    if (level === 'Medium') return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  return (
    <Card className="bg-[#18181b] border-zinc-800/50 p-8">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Risk Assessment</h2>
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
              <div className="mt-3 pt-3 border-t border-zinc-800/50">
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
    <Card className="bg-[#18181b] border-zinc-800/50 p-8">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Market Positioning</h2>
      </div>

      <div className="space-y-6">
        {/* Price Ladder */}
        <div className="relative">
          <div className="relative h-16 bg-[#09090b] rounded-lg border border-zinc-800/50 overflow-hidden">
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
              <div className="relative h-full w-1 bg-[#22d3ee]">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <div className="px-2 py-1 rounded bg-[#22d3ee] text-black text-xs font-semibold whitespace-nowrap">
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
        <div className="p-4 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/20">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">💡 Launch Strategy</p>
          <p className="text-sm text-zinc-300">
            Launch at <span className="font-semibold text-[#22d3ee]">${launchPrice}</span> to build reviews, then raise to ${retailPrice.toFixed(2)} after 50+ reviews. Position as "Value Leader" in mid-market segment.
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
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-xs ${
                step.completed 
                  ? 'bg-[#10b981] text-black' 
                  : 'bg-[#09090b] border-2 border-zinc-800/50 text-zinc-400'
              }`}>
                {step.completed ? <Check className="h-5 w-5" /> : (
                  <span className="text-[10px] leading-tight text-center px-1">{step.week}</span>
                )}
              </div>
              {index < roadmap.length - 1 && (
                <div className="w-0.5 h-16 bg-zinc-800/50 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">{step.title}</h3>
                <span className="text-xs text-zinc-500 font-mono">{step.week}</span>
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
    <Card className="bg-[#18181b] border-zinc-800/50 p-8">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Get Started</h2>
      </div>

      {/* Primary CTA */}
      <div className="mb-6 p-6 rounded-lg bg-[#09090b] border-2 border-[#22d3ee]/30">
        <h3 className="text-lg font-semibold text-white mb-2">Schedule Free Consultation</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Talk to our sourcing experts about your project. No commitment required.
        </p>
        <Button
          variant="primary"
          className="w-full sm:w-auto bg-[#22d3ee] hover:bg-[#06b6d4] text-black font-bold"
          onClick={() => router.push('/contact')}
          size="lg"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Free Consultation
        </Button>
      </div>

      {/* Service Tiers - Model 4.0 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_DATA.serviceTiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative p-4 sm:p-6 rounded-lg border-2 ${
              tier.recommended
                ? 'bg-[#22d3ee]/10 border-[#22d3ee] shadow-lg'
                : 'bg-[#09090b] border-zinc-800/50'
            }`}
          >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#22d3ee] text-black px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

            <div className="mb-4">
              {tier.tag && (
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide mb-3 ${
                  tier.name.includes('Starter') ? 'bg-neutral-700 text-neutral-300' :
                  tier.name.includes('Validator') ? 'bg-blue-500/20 text-blue-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {tier.tag}
                </span>
              )}
              <h3 className="font-semibold text-white text-lg mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <p className="text-xl sm:text-2xl font-mono font-bold tabular-nums text-[#208094]">
                  {tier.priceDisplay}
                </p>
              </div>
              {tier.note && (
                <p className="text-xs text-zinc-500 mt-2">{tier.note}</p>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <Check className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={tier.recommended ? 'primary' : 'outline'}
              className="w-full"
              onClick={() => router.push(tier.ctaHref || '/contact')}
            >
              {tier.ctaLabel || `Select ${tier.name}`}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// AI Analysis Result Interface
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
    mode: "Air" | "Sea";
    unit_cost: number;
    margin: number;
  }>;
  risks: {
    duty: {
      level: "Low" | "Medium" | "High";
      reason: string;
    };
    supplier: {
      level: "Low" | "Medium" | "High";
      reason: string;
    };
    compliance: {
      level: "Low" | "Medium" | "High";
      reason: string;
      cost: number;
    };
  };
  executive_summary: string;
}

// Main Component
function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Answers>({});
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Call AI API when answers are available
  useEffect(() => {
    if (!isInitialized || !answers.project_name) return;
    if (aiAnalysis) return; // Don't call again if we already have analysis

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userContext: answers,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Failed to analyze project');
        }

        if (data.analysis) {
          setAiAnalysis(data.analysis);
        }
      } catch (err) {
        console.error('[Results] Failed to fetch AI analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
        // Continue with mock data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [isInitialized, answers.project_name, aiAnalysis]);

  const productName = answers.product_desc?.split(',')[0] || answers.project_name || BASE_MOCK_DATA.productName;
  const category = answers.category || 'Electronics'; // Default category
  const shippingMethod = inferShippingMethod(answers.priority || '', answers.timeline || '');
  
  // Use AI analysis if available, otherwise use generated cost breakdown
  const costBreakdown = aiAnalysis 
    ? {
        factory: { 
          value: aiAnalysis.cost_breakdown.factory_exw, 
          percentage: 0, 
          label: 'Factory (EXW)', 
          tooltip: 'Ex-Works price from factory' 
        },
        shipping: { 
          value: aiAnalysis.cost_breakdown.shipping, 
          percentage: 0, 
          label: `Shipping (${shippingMethod})`, 
          tooltip: 'Shipping cost' 
        },
        duty: { 
          value: aiAnalysis.cost_breakdown.duty, 
          percentage: 0, 
          label: 'Duty', 
          tooltip: 'Import duty' 
        },
        packaging: { 
          value: aiAnalysis.cost_breakdown.packaging, 
          percentage: 0, 
          label: 'Packaging', 
          tooltip: 'Packaging cost' 
        },
        customs: { 
          value: aiAnalysis.cost_breakdown.customs, 
          percentage: 0, 
          label: 'Customs & Fees', 
          tooltip: 'Customs clearance fees' 
        },
        insurance: { 
          value: aiAnalysis.cost_breakdown.insurance, 
          percentage: 0, 
          label: 'Insurance', 
          tooltip: 'Cargo insurance' 
        },
        totalLandedCost: aiAnalysis.financials.estimated_landed_cost,
      }
    : generateCostBreakdown(answers);
  
  const totalLandedCost = costBreakdown.totalLandedCost;
  
  // Calculate percentages for AI analysis
  if (aiAnalysis && typeof costBreakdown === 'object' && 'totalLandedCost' in costBreakdown) {
    const total = costBreakdown.totalLandedCost;
    Object.keys(costBreakdown).forEach((key) => {
      if (key !== 'totalLandedCost' && typeof costBreakdown[key as keyof typeof costBreakdown] === 'object') {
        const item = costBreakdown[key as keyof typeof costBreakdown] as { value: number; percentage: number };
        item.percentage = Math.round((item.value / total) * 100);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#09090b] py-8">
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
            <ProfitabilitySimulator totalLandedCost={totalLandedCost} answers={answers} />
          </div>

          {/* Section 4: Scale Analysis (1 column) */}
          <div className="md:col-span-1">
            <ScaleAnalysisCard aiAnalysis={aiAnalysis} />
          </div>

          {/* Section 5: Risk Assessment (2 columns) */}
          <div className="md:col-span-2">
            <RiskAssessmentCard category={category} aiAnalysis={aiAnalysis} />
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
            className="border-zinc-800/50 text-zinc-400 hover:bg-[#18181b]"
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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
