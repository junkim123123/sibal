async function getApiKey(): Promise<string> {
  if (typeof process === 'undefined' || !process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return process.env.GEMINI_API_KEY;
}
import type { NexSupplyAIReportV2 } from '@/lib/types/ai-report';

interface StartIntakeContext {
  businessType?: string;
  productCategory?: string;
  productDescription?: string;
  targetMarket?: string;
  volumePlan?: string;
  extraNote?: string;
}

function buildAIReportV2Prompt(context: StartIntakeContext): string {
  const prompt = `You are a senior B2B sourcing analyst.

Goal
Given a product description and basic project info, you estimate a directional DDP cost range and risk profile for importing the product into the specified target market.
You never give firm quotes. You only give directional ranges with explicit assumptions.

Output
You must return valid JSON matching the NexSupplyAIReportV2 TypeScript type provided below.

TypeScript type definition:
export type NexSupplyAIReportV2 = {
  meta: {
    version: "2.0";
    generatedAt: string; // ISO datetime
    currency: "USD";
    targetMarket: string; // e.g. "US Amazon FBA"
    confidenceLevel: "low" | "medium" | "high";
    overallSummary: string; // One or two sentence summary
  };

  productSummary: {
    title: string;
    shortDescription: string;
    category: string;
    exampleUseCases: string[];
  };

  costOverview: {
    ddpPerUnitRange: { low: number; high: number };
    ddpPerShipmentRange?: { low: number; high: number };
    mainCostDrivers: string[]; // Max 5
    keyAssumptions: string[]; // Max 6, specs, incoterm, volume assumptions
  };

  costBreakdown: {
    fobPerUnitRange?: { low: number; high: number };
    freightPerUnitRange?: { low: number; high: number };
    dutyPerUnitRange?: { low: number; high: number };
    extraPerUnitRange?: { low: number; high: number };
    notes?: string;
  };

  volumeScenarios?: {
    scenarioName: string; // e.g. "One box pilot"
    units: number | null;
    ddpPerUnitEstimate?: number | null;
    totalDdpEstimate?: number | null;
    comment?: string;
  }[];

  leadTimePlan?: {
    estimatedLeadTimeWeeksRange?: { low: number; high: number };
    criticalMilestones: string[]; // e.g. "Sample approval", "Carton test", "First shipment"
  };

  riskAnalysis: {
    overallRiskLevel: "low" | "medium" | "high";
    complianceRisks: string[];
    logisticsRisks: string[];
    commercialRisks: string[];
    otherRisks?: string[];
    mustCheckBeforeOrder: string[]; // Checklist before ordering
  };

  channelNotes?: {
    amazonFBA?: string[];
    dtcShopify?: string[];
    retailWholesale?: string[];
  };

  dataQuality: {
    priceDataSource: "public_ecommerce" | "reference_transactions" | "internal_assumption" | "mixed";
    freightDataSource: "csv_table" | "market_average" | "rough_assumption";
    dutyDataSource: "hts_lookup" | "benchmark_rate" | "rough_assumption";
    overallReliability: "rough" | "directional" | "good";
    caveats: string[];
  };

  recommendedNextSteps: {
    priority: "high" | "medium" | "low";
    label: string;
    detail: string;
  }[];
};

You must return ONLY a valid JSON object matching this structure. Do not include markdown code blocks, do not include explanations.

Rules
1. Always respect the currency and target market from the user input.
2. Use ranges rather than single numbers when possible.
3. Keep all text fields concise. Avoid marketing copy, focus on decision making.
4. Be explicit about assumptions that materially affect cost or risk.
5. If information is missing, make a conservative assumption and clearly state it in keyAssumptions and dataQuality.caveats.
6. Never say that this is a confirmed quote. Always treat it as directional analysis only.

---

User Input

Business type
${context.businessType || 'Not specified'}

Product description
${context.productDescription || context.productCategory || 'Not specified'}

Category
${context.productCategory || 'Not specified'}

Target market
${context.targetMarket || 'Not specified'}

Volume plan
${context.volumePlan || 'Not specified'}

Extra notes
${context.extraNote || 'None'}

Task
Based on this information, generate a NexSupplyAIReportV2 JSON object.
Return ONLY the JSON object, no markdown, no explanations.`;

  return prompt;
}

export async function generateAIReportV2(context: StartIntakeContext): Promise<NexSupplyAIReportV2> {
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

    const prompt = buildAIReportV2Prompt(context);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("[AIReportV2][Gemini] Raw response:", text);

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Add generatedAt if missing
    if (!parsed.meta?.generatedAt) {
      parsed.meta = {
        ...parsed.meta,
        generatedAt: new Date().toISOString(),
        version: "2.0",
        currency: "USD",
      };
    }

    return parsed as NexSupplyAIReportV2;
  } catch (error) {
    console.error("[AIReportV2][Gemini] Failed to generate report", error);
    throw error;
  }
}

