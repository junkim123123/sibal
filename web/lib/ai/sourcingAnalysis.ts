/**
 * Sourcing Analysis Engine using Google Gemini 1.5 Pro
 * 
 * Analyzes structured user context from chat onboarding flow
 * and returns comprehensive sourcing intelligence.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { getReferenceData } from "@/lib/reference-loader";

// User Context Interface (from chat onboarding)
export interface UserContext {
  project_name: string;
  target_price?: number; // Target retail price
  material_type?: string; // e.g. "Plastic / Silicone", "Electronics / Battery"
  size_tier?: string; // e.g. "XS: Phone Case size", "S: Shoe Box size"
  ref_link?: string; // Competitor URL
  volume?: string; // e.g. "Test (100 units)", "Launch (500 units)"
  timeline?: string; // e.g. "ASAP (1 month)", "Standard (3 months)"
  channel?: string; // Sales channel
  market?: string; // Target market
  origin?: string; // Sourcing origin
}

// Analysis Result Schema
export const AnalysisResultSchema = z.object({
  financials: z.object({
    estimated_landed_cost: z.number(),
    estimated_margin_pct: z.number(),
    net_profit: z.number(),
  }),
  cost_breakdown: z.object({
    factory_exw: z.number(),
    shipping: z.number(),
    duty: z.number(),
    packaging: z.number(),
    insurance: z.number(),
  }),
  scale_analysis: z.array(
    z.object({
      qty: z.number(),
      mode: z.enum(["Air", "Sea"]),
      unit_cost: z.number(),
      margin: z.number(),
    })
  ),
  risks: z.object({
    duty: z.object({
      level: z.enum(["Low", "Medium", "High"]),
      reason: z.string(),
    }),
    supplier: z.object({
      level: z.enum(["Low", "Medium", "High"]),
      reason: z.string(),
    }),
    compliance: z.object({
      level: z.enum(["Low", "Medium", "High"]),
      reason: z.string(),
      cost: z.number(),
    }),
  }),
  executive_summary: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

async function getApiKey(): Promise<string> {
  if (typeof process === 'undefined' || !process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return process.env.GEMINI_API_KEY;
}

/**
 * Build the sourcing expert system prompt
 */
function buildSourcingExpertPrompt(userContext: UserContext, referenceData: ReturnType<typeof getReferenceData>): string {
  const {
    project_name,
    target_price,
    material_type,
    size_tier,
    ref_link,
    volume,
    timeline,
    channel,
    market,
    origin,
  } = userContext;

  // Extract volume number
  const volumeMatch = volume?.match(/(\d+)/);
  const volumeQty = volumeMatch ? parseInt(volumeMatch[1]) : 100;

  // Infer category from project name
  const category = inferCategory(project_name, material_type);

  let prompt = `You are a 20-year veteran Global Sourcing Consultant with deep expertise in:
- Manufacturing cost estimation across Asia (China, Vietnam, Korea)
- International logistics (Air vs Sea freight, DDP vs FOB)
- US import regulations (HS Codes, duty rates, FDA/FCC/CPC certifications)
- Amazon FBA requirements and fee structures
- Risk assessment for B2B sourcing

### Reference Data (2025 Fact Sheet)

**CRITICAL: You MUST use the provided Reference Data below for all calculations. Do NOT guess or estimate rates. Look them up in the provided JSON data.**

${JSON.stringify(referenceData, null, 2)}

**Project Context:**
- Project Name: ${project_name}
- Target Retail Price: ${target_price ? `$${target_price.toFixed(2)}` : 'Not specified'}
- Material Type: ${material_type || 'Not specified'}
- Size Tier: ${size_tier || 'Not specified'}
- Volume: ${volume || 'Not specified'} (${volumeQty} units)
- Timeline: ${timeline || 'Not specified'}
- Sales Channel: ${channel || 'Not specified'}
- Target Market: ${market || 'Not specified'}
- Sourcing Origin: ${origin || 'China (default)'}
${ref_link ? `- Competitor Reference: ${ref_link}` : ''}

**Your Task:**
Analyze this sourcing project and provide a comprehensive, data-backed analysis.

**Calculation Logic (USE REFERENCE DATA ABOVE):**

1. **COGS Estimation:**
   - Check \`cogs_benchmarks_2025.json\` for category-specific factory margin percentages
   - If target retail price is provided: Use the benchmark percentage from the reference data
     * Example: If category is "Electronics", use \`cogs_benchmarks.categories.Electronics.factory_margin_pct\` (30%)
   - Apply material cost multipliers from \`cogs_benchmarks.materialCostMultipliers\` if applicable
   - If no target price: Estimate based on category averages from reference data

2. **Logistics Calculation:**
   - Check \`freight_rates_2025.json\` for exact rates
   - Use \`freight_rates.sizeTierMultipliers\` to get weight/volume for the size_tier
   - Look up route in \`freight_rates.routes\` (e.g., "china_to_us_west_coast")
   - Use Air freight rates (\`per_kg\`) for volumes <500 units
   - Use Sea LCL rates (\`per_cbm\`) for volumes 1000+ units
   - DO NOT guess - use the exact rates from the reference data

3. **Duty/Compliance Analysis:**
   - Infer HS Code based on material_type and category
   - Look up duty rate in \`tariff_rates_2025.json.rates\` using the HS Code
   - If HS Code not found, use \`tariff_rates.defaultRates\` based on material type
   - Check \`compliance_costs_2025.json.materialBasedRequirements\` for required certifications
   - Use exact certification costs from \`compliance_costs.certifications\` (e.g., FCC: $800-1500 average)
   - DO NOT estimate - use the exact costs from reference data

4. **Risk Assessment:**
   - Duty Risk: Use duty rates from \`tariff_rates_2025.json\` - Low if 0%, Medium if 6-10%, High if 16%+
   - Supplier Risk: Based on category complexity and volume (use your expertise)
   - Compliance Risk: Use \`compliance_costs_2025.json.materialBasedRequirements\` to get risk_level and required certifications

5. **Scale Analysis:**
   - Current volume scenario (as specified)
   - 10x volume scenario (if current <1000, show 1000+ units with Sea freight)

**Output Requirements:**
- Be professional, conservative, and data-backed
- All costs in USD
- Round to 2 decimal places
- Provide realistic estimates (not overly optimistic)
- Include specific warnings for high-risk items

Return ONLY valid JSON matching this exact schema:
{
  "financials": {
    "estimated_landed_cost": number,
    "estimated_margin_pct": number,
    "net_profit": number
  },
  "cost_breakdown": {
    "factory_exw": number,
    "shipping": number,
    "duty": number,
    "packaging": number,
    "insurance": number
  },
  "scale_analysis": [
    {
      "qty": number,
      "mode": "Air" | "Sea",
      "unit_cost": number,
      "margin": number
    }
  ],
  "risks": {
    "duty": {
      "level": "Low" | "Medium" | "High",
      "reason": "string"
    },
    "supplier": {
      "level": "Low" | "Medium" | "High",
      "reason": "string"
    },
    "compliance": {
      "level": "Low" | "Medium" | "High",
      "reason": "string",
      "cost": number
    }
  },
  "executive_summary": "1-2 sentences summarizing the analysis and key recommendations"
}`;

  return prompt;
}

/**
 * Infer product category from project name and material type
 */
function inferCategory(projectName: string, materialType?: string): string {
  const name = projectName.toLowerCase();
  
  if (materialType?.includes('Electronics') || materialType?.includes('Battery')) {
    return 'Electronics';
  }
  if (name.includes('headphone') || name.includes('earphone') || name.includes('speaker') || 
      name.includes('charger') || name.includes('cable') || name.includes('electronic')) {
    return 'Electronics';
  }
  if (name.includes('yoga') || name.includes('mat') || name.includes('fitness') || 
      name.includes('workout') || name.includes('exercise')) {
    return 'Sports & Outdoors';
  }
  if (name.includes('kitchen') || name.includes('cook') || name.includes('utensil') ||
      name.includes('container') || name.includes('storage')) {
    return 'Home & Kitchen';
  }
  if (name.includes('clothing') || name.includes('apparel') || name.includes('fabric') ||
      name.includes('textile') || name.includes('bag') || name.includes('backpack')) {
    return 'Fashion';
  }
  if (name.includes('beauty') || name.includes('skincare') || name.includes('cosmetic') ||
      name.includes('health') || name.includes('supplement')) {
    return 'Health & Beauty';
  }
  
  return 'General';
}

/**
 * Analyze sourcing project using Gemini 1.5 Pro
 */
export async function analyzeSourcingProject(
  userContext: UserContext
): Promise<AnalysisResult> {
  try {
    const apiKey = await getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    // Load reference data
    const referenceData = getReferenceData();
    const prompt = buildSourcingExpertPrompt(userContext, referenceData);
    
    console.log("[SourcingAnalysis] Analyzing project:", userContext.project_name);
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean JSON response
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    
    // Validate with Zod schema
    const validation = AnalysisResultSchema.safeParse(parsed);
    
    if (!validation.success) {
      console.error("[SourcingAnalysis] Schema validation failed:", validation.error);
      throw new Error("AI response does not match expected schema");
    }
    
    return validation.data;
  } catch (error) {
    console.error("[SourcingAnalysis] Failed to analyze:", error);
    
    // Return fallback analysis if API fails
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return getFallbackAnalysis(userContext);
    }
    
    throw error;
  }
}

/**
 * Fallback analysis when API key is missing (for development)
 */
function getFallbackAnalysis(userContext: UserContext): AnalysisResult {
  const targetPrice = userContext.target_price || 49.99;
  const estimatedFactoryCost = targetPrice * 0.25; // 25% default margin
  const shipping = 3.50;
  const duty = 0.83;
  const packaging = 0.95;
  const insurance = 1.00;
  const totalLandedCost = estimatedFactoryCost + shipping + duty + packaging + insurance;
  const netProfit = targetPrice - totalLandedCost;
  const margin = (netProfit / targetPrice) * 100;

  return {
    financials: {
      estimated_landed_cost: totalLandedCost,
      estimated_margin_pct: margin,
      net_profit: netProfit,
    },
    cost_breakdown: {
      factory_exw: estimatedFactoryCost,
      shipping: shipping,
      duty: duty,
      packaging: packaging,
      insurance: insurance,
    },
    scale_analysis: [
      {
        qty: 100,
        mode: "Air",
        unit_cost: totalLandedCost,
        margin: margin,
      },
      {
        qty: 1000,
        mode: "Sea",
        unit_cost: totalLandedCost - 3.50, // Sea freight savings
        margin: margin + 7,
      },
    ],
    risks: {
      duty: {
        level: "Low",
        reason: "Standard duty rate applies based on material type",
      },
      supplier: {
        level: "Medium",
        reason: "Requires supplier verification and quality control",
      },
      compliance: {
        level: userContext.material_type?.includes("Electronics") || 
               userContext.material_type?.includes("Battery") ? "High" : "Medium",
        reason: userContext.material_type?.includes("Electronics") 
          ? "FCC certification required for electronics in US market"
          : "Standard compliance checks needed",
        cost: userContext.material_type?.includes("Electronics") ? 1000 : 500,
      },
    },
    executive_summary: `Based on your project "${userContext.project_name}", estimated landed cost is $${totalLandedCost.toFixed(2)} per unit with ${margin.toFixed(1)}% margin. ${userContext.material_type?.includes("Electronics") ? "FCC certification required - budget $1,000." : "Proceed with standard compliance checks."}`,
  };
}

