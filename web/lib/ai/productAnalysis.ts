import {
  type ProductAnalysis,
  ProductAnalysisSchema,
} from "../product-analysis/schema";
import type { ChannelOption, MarketOption, YearlyVolumePlan, TimelinePlan } from "../types/onboarding";
import type { ProductIntake } from '@/lib/types/productIntake';

async function getApiKey(): Promise<string> {
  if (typeof process === 'undefined' || !process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return process.env.GEMINI_API_KEY;
}

/**
 * Convert channel code to human-readable description with context
 */
function getChannelDescription(channel: string, otherText?: string): string {
  const channelValue = channel as ChannelOption;
  
  switch (channelValue) {
    case 'amazon_fba':
      return 'Amazon FBA – needs FBA-compliant prep, carton labels, and packaging for Amazon warehouses.';
    case 'shopify_dtc':
      return 'Shopify DTC – mostly parcel shipments direct to consumers, focus on per-unit margin and 3PL-friendly packing.';
    case 'tiktok_shop':
      return 'TikTok Shop or social commerce – similar to DTC but more promo-driven volume swings.';
    case 'retail_wholesale':
      return 'Retail / Wholesale – bulk cartons to retailers or distributors, focus on case-pack, master cartons, and pallet shipping.';
    case 'b2b_distributor':
      return 'B2B distributor channel – larger, less frequent orders focused on stable supply and pallet-level pricing.';
    case 'not_sure':
    case 'multiple':
      return 'Multiple channels or not decided yet – keep the analysis channel-agnostic.';
    case 'other':
      if (otherText) {
        return `Other channel (${otherText}) – treat as a hybrid, and avoid FBA-specific assumptions unless obviously needed.`;
      }
      return 'Other channel – treat as a hybrid, and avoid FBA-specific assumptions unless obviously needed.';
    default:
      return `Channel: ${channel}`;
  }
}

/**
 * Convert market codes to human-readable description with regional context
 */
function getMarketDescription(markets: string[], otherText?: string): string {
  if (!markets || markets.length === 0) {
    return 'Target markets not specified.';
  }

  const marketValues = markets as MarketOption[];
  const marketLabels: string[] = [];
  const hasNorthAmerica = marketValues.some(m => m === 'united_states' || m === 'canada' || m === 'mexico');
  const hasEurope = marketValues.some(m => m === 'europe' || m === 'united_kingdom');
  const hasAsia = marketValues.some(m => 
    m === 'japan' || m === 'south_korea' || m === 'taiwan' || 
    m === 'china_mainland' || m === 'hong_kong' || m === 'philippines' || 
    m === 'southeast_asia'
  );
  const hasOther = marketValues.includes('other');

  // Build market list
  const regularMarkets = marketValues.filter(m => m !== 'other' && m !== 'multiple' && m !== 'not_decided');
  if (regularMarkets.length > 0) {
    const labels = regularMarkets.map(m => {
      switch (m) {
        case 'united_states': return 'United States';
        case 'canada': return 'Canada';
        case 'mexico': return 'Mexico';
        case 'europe': return 'Europe (EU)';
        case 'united_kingdom': return 'United Kingdom';
        case 'japan': return 'Japan';
        case 'south_korea': return 'South Korea';
        case 'taiwan': return 'Taiwan';
        case 'china_mainland': return 'China (Mainland)';
        case 'hong_kong': return 'Hong Kong';
        case 'philippines': return 'Philippines';
        case 'southeast_asia': return 'Southeast Asia';
        case 'middle_east_gulf': return 'Middle East and Gulf';
        case 'australia_new_zealand': return 'Australia and New Zealand';
        case 'latin_america': return 'Latin America';
        default: return m;
      }
    });
    marketLabels.push(...labels);
  }

  if (hasOther && otherText) {
    marketLabels.push(`Other (${otherText})`);
  } else if (hasOther) {
    marketLabels.push('Other');
  }

  const marketList = marketLabels.join(', ');
  
  // Add regional context
  let context = '';
  if (hasNorthAmerica && !hasEurope && !hasAsia) {
    context = 'Primary target markets: ' + marketList + ' (North America). Use this when estimating freight and duties.';
  } else if (hasEurope && !hasNorthAmerica && !hasAsia) {
    context = 'Primary target markets: ' + marketList + ' (Europe/UK). Note that VAT and duties can differ by country.';
  } else if (hasAsia && !hasNorthAmerica && !hasEurope) {
    context = 'Primary target markets: ' + marketList + ' (Asia). Freight might be intra-Asia or export-from-Asia depending on the combination.';
  } else if (hasNorthAmerica || hasEurope || hasAsia) {
    context = 'Primary target markets: ' + marketList + '. Consider regional differences in freight, duties, and regulations.';
  } else {
    context = 'Primary target markets: ' + marketList + '. Use this when estimating freight and duties.';
  }

  return context;
}

/**
 * Convert yearly volume plan to human-readable description with volume estimates
 */
function getVolumeDescription(yearlyVolumePlan: string): string {
  const volumeValue = yearlyVolumePlan as YearlyVolumePlan;
  
  switch (volumeValue) {
    case 'test':
      return 'Test volume – small pilot orders, roughly a few hundred units per year (for example ~50 units/month). Use conservative MOQs and sampling-focused assumptions.';
    case 'small_launch':
      return 'Small launch – around a few thousand units per year (for example ~200 units/month).';
    case 'steady':
      return 'Steady volume – around 10,000–15,000 units per year (for example ~1,000 units/month).';
    case 'aggressive':
      return 'Aggressive growth – tens of thousands of units per year (for example 5,000+ units/month).';
    case 'not_sure':
      return 'Volume not decided yet – assume a reasonable mid-range launch rather than extreme scale.';
    default:
      return `Volume plan: ${yearlyVolumePlan}`;
  }
}

/**
 * Convert timeline plan to human-readable description with urgency context
 */
function getTimelineDescription(timelinePlan: string): string {
  const timelineValue = timelinePlan as TimelinePlan;
  
  switch (timelineValue) {
    case 'within_1_month':
      return 'Needs first shipment as soon as possible (rush timeline – highlight lead time risks).';
    case 'within_3_months':
      return 'Wants first shipment within 1–2 months.';
    case 'after_3_months':
      return 'Okay with 3–4 months if pricing and quality are better.';
    case 'flexible':
      return 'Timeline is flexible – do not over-optimize for speed.';
    default:
      return `Timeline: ${timelinePlan}`;
  }
}

function buildProductAnalysisPrompt(
  input: string,
  onboardingContext?: OnboardingContext,
  intake?: ProductIntake
): string {
  let prompt = `
Role: You are a Senior Sourcing Expert at NexSupply. Your job is to provide a quick, "80% accurate" estimation of landed cost and risk for a given product to help a buyer decide if they should proceed.

Objective: Analyze the User Input (which may be a product description, a messy title, a URL, and/or an image) and generate a Landed Cost + Risk Report.

User Input: ${input}
`;

  // Add onboarding context if available
  if (onboardingContext) {
    prompt += `\n---\n\n### Project Context (from onboarding):\n`;
    
    if (onboardingContext.projectName) {
      prompt += `- **Project Name:** ${onboardingContext.projectName}\n`;
    }
    
    if (onboardingContext.mainChannel) {
      const channelDescription = getChannelDescription(
        onboardingContext.mainChannel,
        onboardingContext.mainChannelOtherText
      );
      prompt += `- **Main Sales Channel:** ${channelDescription}\n`;
    }
    
    if (onboardingContext.targetMarkets && onboardingContext.targetMarkets.length > 0) {
      const marketDescription = getMarketDescription(
        onboardingContext.targetMarkets,
        onboardingContext.targetMarketsOtherText
      );
      prompt += `- **Target Markets:** ${marketDescription}\n`;
    }
    
    if (onboardingContext.yearlyVolumePlan) {
      const volumeDescription = getVolumeDescription(onboardingContext.yearlyVolumePlan);
      prompt += `- **Yearly Volume Plan:** ${volumeDescription}\n`;
    }
    
    if (onboardingContext.timelinePlan) {
      const timelineDescription = getTimelineDescription(onboardingContext.timelinePlan);
      prompt += `- **Timeline:** ${timelineDescription}\n`;
    }
    
    prompt += `\nUse this context to tailor your cost estimates, risk assessment, and recommendations. For example:\n`;
    prompt += `- Adjust freight estimates based on target markets\n`;
    prompt += `- Consider channel-specific requirements (e.g., Amazon FBA needs different packaging)\n`;
    prompt += `- Scale cost estimates based on volume plan\n`;
    prompt += `- Factor in timeline urgency for lead time considerations\n`;
  }

  if (intake) {
    prompt += `\n---\n\n### Product & Sourcing Plan (from conversational intake):\n`;

    if (intake.productName) {
      prompt += `- **Product Name (user label):** ${intake.productName}\n`;
    }
    if (intake.oneLineDescription) {
      prompt += `- **One-line Description & Target Retail:** ${intake.oneLineDescription}\n`;
    }
    if (intake.category) {
      prompt += `- **Category (approx):** ${intake.category}\n`;
    }
    if (intake.productStage) {
      prompt += `- **Stage:** ${intake.productStage} (use this when suggesting MOQs and test order sizes)\n`;
    }
    if (intake.sourceCountry) {
      prompt += `- **Planned Source Country:** ${intake.sourceCountry}\n`;
    }
    if (intake.destinationMarket) {
      prompt += `- **Main Destination Market for this product:** ${intake.destinationMarket}\n`;
    }
    if (intake.tradeTerm) {
      prompt += `- **Preferred Incoterm:** ${intake.tradeTerm}\n`;
    }
    if (intake.speedVsCost) {
      prompt += `- **Priority:** ${intake.speedVsCost} (decide between cheaper ocean vs faster air options)\n`;
    }
    if (typeof intake.monthlyVolume === 'number') {
      prompt += `- **Target Monthly Volume:** ~${intake.monthlyVolume} units/month\n`;
    }
    if (intake.riskTolerance) {
      prompt += `- **Risk Tolerance for Suppliers:** ${intake.riskTolerance}\n`;
    }
    if (intake.specialRequirements) {
      prompt += `- **Special Requirements:** ${intake.specialRequirements}\n`;
    }

    prompt += `\nUse this structured intake to tailor your estimates (MOQ suggestions, freight mode, compliance risk, and supplier strategy).\n`;
  }

  prompt += `\n---\n\n### Instructions:\n\n`;
  prompt += `1.  **Identify the Product:**\n`;
  prompt += `    *   Infer the product type from the input text, URL structure, and/or the provided image.\n`;
  prompt += `    *   If an image is provided, use it to infer category, rough dimensions, material, and packaging type.\n`;
  prompt += `    *   Estimate the likely HTS/HS code.\n\n`;
  prompt += `2.  **Estimate Landed Cost (Unit Economics):**\n`;
  
  if (onboardingContext?.targetMarkets && onboardingContext.targetMarkets.length > 0) {
    prompt += `    *   Use the target market(s) from the project context to estimate shipping costs and duties.\n`;
  } else {
    prompt += `    *   Assume a standard "Minimum Order Quantity" (MOQ) scenario (e.g., 500-1000 units) for a generic version of this product sourced from China to the US.\n`;
  }
  
  prompt += `    *   **FOB Price:** Estimate a realistic factory price.\n`;
  prompt += `    *   **Freight:** Estimate ocean freight per unit based on target market(s).\n`;
  prompt += `    *   **Duty:** Estimate duty rate based on HTS and Section 301 tariffs (if applicable) for the target market(s).\n`;
  prompt += `    *   **Total Landed Cost:** Sum of the above.\n\n`;
  prompt += `3.  **Assess Risk:**\n`;
  prompt += `    *   **Compliance:** Are there safety standards (UL, CE, FDA), restricted materials, or high tariffs? Consider target market regulations.\n`;
  prompt += `    *   **Supplier:** Is this a commodity with many suppliers (Low Risk) or a specialized/IP-heavy product (High Risk)?\n`;
  prompt += `    *   **Logistics:** Is it bulky/heavy (High Freight Risk) or small/light?\n`;
  
  if (onboardingContext?.mainChannel) {
    prompt += `    *   **Channel-Specific:** Consider requirements for ${onboardingContext.mainChannel} (e.g., Amazon FBA labeling, DTC packaging needs).\n`;
  }
  
  prompt += `\n4.  **Recommendation:**\n`;
  prompt += `    *   Give a candid "Should you proceed?" summary. Be opinionated.\n`;
  prompt += `    *   Reference the project context (channel, markets, volume, timeline) when relevant.\n\n`;
  prompt += `---\n\n### Output Format:\n\n`;
  prompt += `You must return a strictly valid JSON object matching this structure:\n\n`;
  prompt += `{\n`;
  prompt += `  "product_name": "Short descriptive name",\n`;
  prompt += `  "hts_code": "Estimated HTS Code",\n`;
  prompt += `  "landed_cost_breakdown": {\n`;
  prompt += `    "fob_price": "$X.XX",\n`;
  prompt += `    "freight_cost": "$X.XX",\n`;
  prompt += `    "duty_rate": "X%",\n`;
  prompt += `    "duty_cost": "$X.XX",\n`;
  prompt += `    "landed_cost": "$X.XX"\n`;
  prompt += `  },\n`;
  prompt += `  "risk_assessment": {\n`;
  prompt += `    "overall_score": number (0-100, 100 = safest),\n`;
  prompt += `    "compliance_risk": "Low" | "Medium" | "High",\n`;
  prompt += `    "supplier_risk": "Low" | "Medium" | "High",\n`;
  prompt += `    "logistics_risk": "Low" | "Medium" | "High",\n`;
  prompt += `    "summary": "Short explanation of the risks."\n`;
  prompt += `  },\n`;
  prompt += `  "narrative_summary": {\n`;
  prompt += `    "executive_summary": "3–5 sentence summary of the analysis",\n`;
  prompt += `    "cost_drivers_explained": "Explanation of FOB / freight / duty / extra cost structure",\n`;
  prompt += `    "channel_specific_notes": "Notes specific to the sales channel (e.g., Amazon FBA, Retail, DTC)",\n`;
  prompt += `    "next_step_recommendations": "3–5 actionable next steps for the user"\n`;
  prompt += `  },\n`;
  prompt += `  "recommendation": "1-2 sentences on whether to proceed and what to watch out for."\n`;
  prompt += `}\n`;

  return prompt;
}

interface OnboardingContext {
  projectName?: string;
  mainChannel?: string;
  mainChannelOtherText?: string;
  targetMarkets?: string[];
  targetMarketsOtherText?: string;
  yearlyVolumePlan?: string;
  timelinePlan?: string;
}

export async function analyzeProduct(
  input: string, 
  image?: string, 
  onboardingContext?: OnboardingContext,
  intake?: ProductIntake
): Promise<ProductAnalysis> {
  try {
    const apiKey = await getApiKey();
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const prompt = buildProductAnalysisPrompt(input, onboardingContext, intake);
    const parts: any[] = [
      { text: prompt },
    ];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: image,
        },
      });
    }
    const result = await model.generateContent(parts);
    const text = result.response.text();
    console.log("[ProductAnalysis][Gemini] Raw response:", text);

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const validation = ProductAnalysisSchema.safeParse(parsed);
    if (validation.success) {
      return validation.data;
    } else {
      console.error("[ProductAnalysis][Gemini] Zod validation failed", validation.error);
      // In a real app, we might fallback or throw. For now, return a safe error object or throw.
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("[ProductAnalysis][Gemini] Failed to analyze product", error);
    // Return a fallback/error state
    return {
      product_name: "Analysis Failed",
      hts_code: "N/A",
      landed_cost_breakdown: {
        fob_price: "$0.00",
        freight_cost: "$0.00",
        duty_rate: "0%",
        duty_cost: "$0.00",
        landed_cost: "$0.00",
      },
      risk_assessment: {
        overall_score: 0,
        compliance_risk: "High",
        supplier_risk: "High",
        logistics_risk: "High",
        summary: "We could not analyze this product. Please try a different description.",
      },
      recommendation: "Please try again with a clearer product description.",
    };
  }
}