/**
 * Reference Data Loader
 * 
 * Loads structured reference data from JSON files for use in AI analysis.
 * This ensures fact-based calculations instead of AI hallucinations.
 */

import tariffRates from '@/data/tariff_rates_2025.json';
import freightRates from '@/data/freight_rates_2025.json';
import complianceCosts from '@/data/compliance_costs_2025.json';
import amazonFees from '@/data/amazon_fees_2025.json';
import cogsBenchmarks from '@/data/cogs_benchmarks_2025.json';

export interface ReferenceData {
  tariff_rates: typeof tariffRates;
  freight_rates: typeof freightRates;
  compliance_costs: typeof complianceCosts;
  amazon_fees: typeof amazonFees;
  cogs_benchmarks: typeof cogsBenchmarks;
}

/**
 * Get all reference data as a single object
 * 
 * This function loads all reference JSON files and returns them
 * in a structured format for injection into AI prompts.
 */
export function getReferenceData(): ReferenceData {
  return {
    tariff_rates: tariffRates,
    freight_rates: freightRates,
    compliance_costs: complianceCosts,
    amazon_fees: amazonFees,
    cogs_benchmarks: cogsBenchmarks,
  };
}

/**
 * Get tariff rate for a specific HS code and origin country
 */
export function getTariffRate(hsCode: string, origin: string = 'china'): number {
  const code = hsCode.replace(/\./g, '');
  const rateEntry = tariffRates.rates[code as keyof typeof tariffRates.rates];
  
  if (rateEntry) {
    const originKey = origin.toLowerCase().replace(/\s+/g, '_') as keyof typeof rateEntry;
    return (rateEntry as any)[originKey] ?? rateEntry.china ?? 0;
  }
  
  // Fallback to category-based default
  return 0;
}

/**
 * Get freight rate for a route and shipping method
 */
export function getFreightRate(
  route: string = 'china_to_us_west_coast',
  method: 'air' | 'sea_lcl' | 'sea_fcl' = 'air',
  sizeTier?: string
): { rate: number; transitDays: number } {
  const routeData = freightRates.routes[route as keyof typeof freightRates.routes];
  
  if (!routeData) {
    // Default to China route
    const defaultRoute = freightRates.routes.china_to_us_west_coast;
    const methodData = defaultRoute[method];
    return {
      rate: methodData.per_kg || methodData.per_cbm || 5.5,
      transitDays: methodData.transit_days || 5,
    };
  }
  
  const methodData = routeData[method];
  if (!methodData) {
    return { rate: 5.5, transitDays: 5 };
  }
  
  // Calculate rate based on size tier if provided
  if (sizeTier && method === 'air') {
    const tier = freightRates.sizeTierMultipliers[sizeTier as keyof typeof freightRates.sizeTierMultipliers];
    if (tier) {
      return {
        rate: methodData.per_kg * tier.weight_kg,
        transitDays: methodData.transit_days,
      };
    }
  }
  
  return {
    rate: methodData.per_kg || methodData.per_cbm || 5.5,
    transitDays: methodData.transit_days || 5,
  };
}

/**
 * Get compliance costs for a material type
 */
export function getComplianceCosts(materialType?: string): {
  certifications: string[];
  totalCost: number;
  riskLevel: 'Low' | 'Medium' | 'High';
} {
  if (!materialType) {
    return { certifications: [], totalCost: 0, riskLevel: 'Low' };
  }
  
  const materialKey = Object.keys(complianceCosts.materialBasedRequirements).find(
    key => materialType.includes(key.split(' / ')[0]) || materialType.includes(key.split(' / ')[1])
  );
  
  if (!materialKey) {
    return { certifications: [], totalCost: 0, riskLevel: 'Low' };
  }
  
  const requirements = complianceCosts.materialBasedRequirements[
    materialKey as keyof typeof complianceCosts.materialBasedRequirements
  ];
  
  let totalCost = 0;
  const certNames: string[] = [];
  
  requirements.certifications.forEach(certName => {
    const cert = complianceCosts.certifications[certName as keyof typeof complianceCosts.certifications];
    if (cert) {
      totalCost += cert.cost_range.average;
      certNames.push(certName);
    }
  });
  
  return {
    certifications: certNames,
    totalCost,
    riskLevel: requirements.risk_level,
  };
}

/**
 * Get COGS benchmark for a category
 */
export function getCOGSBenchmark(category: string): number {
  const categoryData = cogsBenchmarks.categories[category as keyof typeof cogsBenchmarks.categories];
  return categoryData?.factory_margin_pct ?? cogsBenchmarks.categories.General.factory_margin_pct;
}

/**
 * Get Amazon referral fee for a category
 */
export function getAmazonReferralFee(category: string): number {
  return amazonFees.referralFees[category as keyof typeof amazonFees.referralFees] 
    ?? amazonFees.referralFees.Default;
}

