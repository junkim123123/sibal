/**
 * Sourcing Analysis API Endpoint
 * 
 * Real AI Analysis using Google Gemini 2.5 Pro
 * Analyzes user context from chat onboarding and returns comprehensive sourcing intelligence.
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// User Context Interface (from chat onboarding)
interface UserContext {
  project_name: string;
  business_model?: string;
  channel?: string;
  market?: string;
  origin?: string;
  stage?: string;
  product_desc?: string;
  pricing_metric?: string;
  pricing_value?: string;
  trade_term?: string;
  priority?: string;
  volume?: string;
  timeline?: string;
}

// Analysis Result Interface
interface AnalysisResult {
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

/**
 * Get Google API Key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY or GEMINI_API_KEY is not configured in environment variables.");
  }
  return apiKey;
}

/**
 * Build the sourcing expert prompt
 */
function buildSourcingPrompt(userContext: UserContext): string {
  const {
    project_name,
    business_model,
    channel,
    market,
    origin,
    stage,
    product_desc,
    pricing_metric,
    pricing_value,
    trade_term,
    priority,
    volume,
    timeline,
  } = userContext;

  return `You are a 20-year veteran Global Sourcing Consultant with deep expertise in:
- Manufacturing cost estimation across Asia (China, Vietnam, Korea, India, Mexico)
- International logistics (Air vs Sea freight, DDP vs FOB vs Ex-Works)
- US/EU/UK import regulations (HS Codes, duty rates, FDA/FCC/CE certifications)
- Platform-neutral channel costs (Amazon, Shopify, Wholesale, B2B)
- Risk assessment for B2B sourcing

**Project Context:**
- Project Name: ${project_name}
- Business Model: ${business_model || 'Not specified'}
- Sales Channel: ${channel || 'Not specified'}
- Target Market: ${market || 'Not specified'}
- Sourcing Origin: ${origin || 'China (default)'}
- Product Stage: ${stage || 'Not specified'}
- Product Description: ${product_desc || 'Not specified'}
- Pricing Target: ${pricing_metric || 'Not specified'} - ${pricing_value || 'Not specified'}
- Trade Term: ${trade_term || 'Not specified'}
- Priority: ${priority || 'Not specified'}
- Volume: ${volume || 'Not specified'}
- Timeline: ${timeline || 'Not specified'}

**Your Task:**
Analyze this sourcing project and provide a comprehensive, realistic analysis.

**Calculation Guidelines:**

1. **COGS Estimation:**
   - If pricing_value is provided, work backwards from target retail price
   - Estimate factory EXW cost based on:
     * Product category and complexity
     * Material type (electronics typically 20-30% of retail, simple goods 15-25%)
     * Volume (higher volume = lower per-unit cost)
   - Be conservative and realistic

2. **Logistics Calculation:**
   - Air freight: $3-5/kg for urgent shipments (< 1 month timeline)
   - Sea freight: $1-2/kg or $150-300/CBM for standard shipments (3+ months)
   - DDP terms include all shipping, customs, and delivery
   - FOB terms: buyer handles shipping from port
   - Ex-Works: buyer handles everything from factory

3. **Duty/Compliance Analysis:**
   - Electronics: 0-15% duty, FCC/CE certification required ($800-1500)
   - Home & Kitchen: 0-10% duty, FDA for food contact items ($600-1200)
   - Fashion/Textiles: 0-20% duty, labeling requirements ($200-400)
   - General: 0-10% duty, standard compliance ($200-500)

4. **Channel Costs:**
   - Amazon: 15% referral + $3-5 FBA fees
   - Shopify/DTC: 2.9% payment processing + $3-5 3PL fulfillment
   - Wholesale/B2B: 2-5% handling fees
   - Calculate based on estimated retail price

5. **Risk Assessment:**
   - Duty Risk: Low (0-5%), Medium (6-15%), High (16%+)
   - Supplier Risk: Based on category complexity and volume
   - Compliance Risk: Based on material type and target market regulations

6. **Scale Analysis:**
   - Current volume scenario (as specified)
   - 10x volume scenario with Sea freight (if applicable)

**Output Requirements:**
- Be professional, conservative, and realistic
- All costs in USD
- Round to 2 decimal places
- Provide actionable insights
- Include specific warnings for high-risk items

Return ONLY valid JSON matching this exact schema (no markdown, no code blocks):
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
    "customs": number,
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
}

/**
 * Analyze sourcing project using Google Gemini 2.5 Pro
 */
async function analyzeSourcingProject(
  userContext: UserContext
): Promise<AnalysisResult> {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = buildSourcingPrompt(userContext);
  
  console.log("[Analyze API] Analyzing project:", userContext.project_name);
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Clean JSON response (remove markdown code blocks if present)
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  
  return parsed as AnalysisResult;
}

/**
 * POST /api/analyze
 * 
 * Analyzes user context and returns AI-powered sourcing analysis
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userContext: UserContext = body.userContext || body;

    // Validate required fields
    if (!userContext.project_name) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "project_name is required" 
        },
        { status: 400 }
      );
    }

    console.log("[Analyze API] Received request for project:", userContext.project_name);

    // Analyze using Gemini 2.5 Pro
    const analysis = await analyzeSourcingProject(userContext);

    return NextResponse.json(
      {
        ok: true,
        analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Analyze API] Server error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle specific API key errors
    if (errorMessage.includes("API_KEY") || errorMessage.includes("not configured")) {
      return NextResponse.json(
        {
          ok: false,
          error: "API key not configured. Please set GOOGLE_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage || "Failed to analyze sourcing project",
      },
      { status: 500 }
    );
  }
}

