/**
 * Sourcing Analysis API Endpoint
 * 
 * Real AI Analysis using Google Gemini 2.5 Pro
 * Analyzes user context from chat onboarding and returns comprehensive sourcing intelligence.
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// User Context Interface (from chat onboarding - Sourcing Flow 5.0)
interface UserContext {
  // New streamlined fields
  product_info?: string; // Combined: project name + description
  sales_channel?: string; // Combined: business model + channel
  product_specs?: string; // Combined: material + size (optional)
  
  // Legacy fields (for backward compatibility)
  project_name?: string;
  business_model?: string;
  channel?: string;
  market?: string;
  origin?: string;
  stage?: string;
  ref_link?: string;
  material_type?: string;
  size_tier?: string;
  pricing_metric?: string;
  pricing_value?: string;
  trade_term?: string;
  priority?: string;
  volume?: string;
  timeline?: string;
}

// Analysis Result Interface (Deep Sourcing 2.0)
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
  // ✨ Deep Sourcing 2.0: Enhanced Analysis (100% Input Utilization)
  duty_analysis?: {
    hs_code: string; // e.g., "3926.90"
    rate: string; // e.g., "6.5%"
    rationale: string; // "Based on user input 'Plastic/Silicone' material type, this product falls under HS Code 3926.90..."
  };
  logistics_insight?: {
    efficiency_score: string; // "High" | "Medium" | "Low"
    container_loading: string; // "Est. 3,500 units per 20ft container"
    advice: string; // "Size is optimized for FBA" or "Reduce box size by 2cm to save fees"
  };
  market_benchmark?: {
    competitor_price: string; // "Est. Retail $30" based on link context
    our_price_advantage: string; // "25% Cheaper"
    differentiation_point: string; // "Add eco-packaging to win"
  };
  strategic_advice?: {
    for_business_model: string; // "For Amazon FBA Sellers..."
    key_action: string; // "Focus on reducing package volume to save FBA fees."
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
  // Map new streamlined fields to legacy fields for compatibility
  const project_name = userContext.project_name || userContext.product_info || 'Unnamed Project';
  const channel = userContext.channel || userContext.sales_channel;
  const business_model = userContext.business_model; // May be inferred from sales_channel
  
  // Parse product_specs if provided (format: "Material, Size" or "Skip")
  let material_type = userContext.material_type;
  let size_tier = userContext.size_tier;
  if (userContext.product_specs && userContext.product_specs.toLowerCase() !== 'skip') {
    const specs = userContext.product_specs.split(',').map(s => s.trim());
    if (specs.length >= 1 && !material_type) {
      material_type = specs[0];
    }
    if (specs.length >= 2 && !size_tier) {
      size_tier = specs[1];
    }
  }
  
  const {
    market,
    origin,
    ref_link,
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
- Product Info: ${project_name}
- Sales Channel: ${channel || 'Not specified'}
- Target Market: ${market || 'Not specified'}
- Sourcing Origin: ${origin || 'China (default)'}
- Reference Link: ${ref_link && ref_link.toLowerCase() !== 'skip' ? ref_link : 'Not provided'}
- Material Type: ${material_type || 'Not specified'}
- Size Tier: ${size_tier || 'Not specified'}
- Pricing Information: ${pricing_metric || 'Not specified'}${pricing_value ? ` - ${pricing_value}` : ''}
- Trade Term: ${trade_term || 'Not specified'}
- Priority: ${priority || 'Not specified'}
- Volume: ${volume || 'Not specified'}
- Timeline: ${timeline || 'Not specified'}

**Additional Context:**
${ref_link && ref_link.toLowerCase() !== 'skip' ? 
  `🔗 CRITICAL: USER PROVIDED REFERENCE LINK: ${ref_link}
   
   **YOU MUST ANALYZE THIS REFERENCE LINK:**
   1. Analyze the provided URL to extract product information
   2. Extract from the link context:
      - Actual retail price (if available on the page or in the URL context)
      - Product specifications (dimensions, weight, materials)
      - Product features and packaging details
      - Market positioning (budget, mid, premium)
   3. Use this information to refine your cost estimation and competitor comparison
   4. In your "market_benchmark" response, include:
      - competitor_price: "Est. Retail $[X]" (estimate based on the reference link context)
      - our_price_advantage: "X% Cheaper" or "X% More Expensive" (calculate based on estimated competitor price)
      - differentiation_point: Specific actionable advice based on the reference product analysis (e.g., "Competitor uses basic packaging, upgrade to premium unboxing experience")
   
   **IMPORTANT:** Use the reference link context to provide accurate competitor analysis.` : 
  ''}
${material_type ? 
  `📦 MATERIAL TYPE: ${material_type}
   - Use this to estimate HS Code and Duty Rate accurately
   - Different materials have different duty rates (e.g., Electronics: 0-15%, Textiles: 0-20%, Food: varies by product)
   - Consider material-specific compliance requirements (FDA for food, FCC for electronics, etc.)` : 
  ''}
${size_tier ? 
  `📏 SIZE TIER: ${size_tier}
   - Use this to estimate Shipping Cost (Air/Sea freight)
   - XS/S: Lightweight, low shipping cost per unit
   - M/L: Moderate weight, standard shipping rates
   - XL: Heavy/bulky, higher shipping costs, may require special handling
   - Consider dimensional weight vs actual weight for freight calculations` : 
  ''}
${pricing_metric === 'I know my Current Landed Cost' && pricing_value ? 
  `- User's current landed cost: ${pricing_value} (for reference)` : 
  ''}
${pricing_metric === 'I know my Target Retail Price' && pricing_value ? 
  `- User's target retail price: ${pricing_value}` : 
  ''}
${pricing_metric === 'I know my Target Margin %' && pricing_value ? 
  `- User's target margin: ${pricing_value}` : 
  ''}
${volume && volume.includes('100,000+') ? 
  `- Very high volume (100,000+ units/month) - consider economies of scale` : 
  ''}
${market && market.includes('Europe') ? 
  `- Target market: Europe (EU) - consider CE marking, VAT, EU regulations` : 
  ''}
${origin && origin.includes('India') ? 
  `- Sourcing from: India - consider shipping times, export procedures, trade agreements` : 
  ''}
${trade_term && trade_term.includes('DDP') ? 
  `- Trade terms: DDP (all-inclusive delivery)` : 
  ''}
${priority && priority.includes('Maximize Gross Margin') ? 
  `- Priority: Maximize margin - focus on cost optimization` : 
  ''}

**Your Task:**
Analyze this sourcing project and provide a comprehensive, realistic analysis.

**Calculation Guidelines:**

1. **COGS Estimation:**
   - Estimate factory EXW cost based on:
     * Product category and complexity
     * Material type (electronics typically 20-30% of retail, simple goods 15-25%)
     * Volume (higher volume = lower per-unit cost)
   - If user provided pricing information (current landed cost, target retail price, or target margin), use it as a reference point in your analysis
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

**CRITICAL: Deep Sourcing Analysis Required - 100% Input Utilization**

You MUST use every piece of user input to provide specific, actionable insights:

1. **Duty Analysis (REQUIRED if material_type provided):**
   - Use the EXACT material_type the user specified to find the precise US HTS Code
   - Look up the exact duty rate for that HS Code
   - Provide rationale explaining how the material type led to this classification
   - Example: "User specified 'Plastic/Silicone' → HS Code 3926.90 → 6.5% duty rate"

2. **Logistics Insight (REQUIRED if size_tier provided):**
   - Calculate exact units per CBM based on the size_tier
   - Calculate exact number of units that fit in a 20ft container
   - Provide efficiency score (High/Medium/Low)
   - Give specific, actionable advice (e.g., "Shoe Box size → Est. 3,500 units per 20ft container. Size is optimized for FBA.")

3. **Market Benchmark (REQUIRED if ref_link provided):**
   - Analyze the reference link to infer competitor's retail price
   - Calculate exact price advantage percentage
   - Suggest specific differentiation strategy based on competitor analysis
   - Example: "Reference link shows competitor at $30 → You can source at $22 → 25% cheaper. Add eco-packaging to differentiate."

4. **Strategic Advice (REQUIRED based on business_model and channel):**
   - Provide specific advice tailored to their exact business model
   - Give actionable key actions based on their channel (e.g., "For Amazon FBA Sellers: Reduce package volume by 1cm to save $0.50/unit in FBA fees")

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
  "duty_analysis": {
    "hs_code": "string (e.g., '3926.90')",
    "rate": "string (e.g., '6.5%')",
    "rationale": "string explaining how material_type led to this HS code and rate"
  },
  "logistics_insight": {
    "efficiency_score": "string ('High' | 'Medium' | 'Low')",
    "container_loading": "string (e.g., 'Est. 3,500 units per 20ft container')",
    "advice": "string with actionable logistics advice (e.g., 'Size is optimized for FBA' or 'Reduce box size by 2cm to save fees')"
  },
  "market_benchmark": {
    "competitor_price": "string (e.g., 'Est. Retail $30')",
    "our_price_advantage": "string (e.g., '25% Cheaper')",
    "differentiation_point": "string with specific differentiation strategy (e.g., 'Add eco-packaging to win')"
  },
  "strategic_advice": {
    "for_business_model": "string identifying the business model",
    "key_action": "string with specific actionable advice"
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
    // Note: Google Search Grounding may require different configuration
    // For now, we'll rely on the prompt to instruct Gemini to use web search capabilities
  });

  const prompt = buildSourcingPrompt(userContext);
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Clean JSON response (remove markdown code blocks if present)
  const cleaned = text.replace(/```json|```/g, "").trim();
  
  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    console.error("[Analyze API] JSON parse error:", parseError);
    console.error("[Analyze API] Failed to parse:", cleaned);
    throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
  }
  
  // Validate required fields
  if (!parsed.financials || !parsed.cost_breakdown) {
    console.error("[Analyze API] Invalid response structure:", parsed);
    throw new Error("AI response missing required fields (financials or cost_breakdown)");
  }
  
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
    if (!userContext.project_name && !userContext.product_info) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "project_name or product_info is required" 
        },
        { status: 400 }
      );
    }

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

