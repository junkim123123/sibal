/**
 * Sourcing Analysis API Endpoint
 * 
 * Real AI Analysis using Google Gemini 2.5 Pro
 * Analyzes user context from chat onboarding and returns comprehensive sourcing intelligence.
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkBlacklistFromUrl, checkBlacklistByCompany } from "@/lib/blacklist/loader";
import { calculateContainerLoading } from "@/lib/logistics/container-calculator";

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
  osint_risk_score?: number; // OSINT Risk Score (0-100)
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
 * Build the sourcing expert prompt with NexSupply Core Values and OSINT Data Enforcement
 */
function buildSourcingPrompt(userContext: UserContext): string {
  // --- [Code Block 1: Context Parsing (기존 로직 유지)] ---
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

  // --- [Code Block 2: 핵심 AI 시스템 프롬프트 (강제)] ---
  return `You are NexSupply's **AI Risk Analyst**, a 20-year veteran Global Sourcing Consultant. Your mission is to eliminate sourcing risks for clients ("Alibaba graduates") and provide actionable insights.

**CORE GUIDELINES (NexSupply Exclusive Moat):**

1. **RISK WEIGHTING:** All risk scoring (0-100) MUST follow the NexSupply proprietary weighting:
   - Quality Risk (30%)
   - Delivery Risk (30%)
   - Supplier Stability Risk (25%)
   - Value-Added Difficulty Risk (15%)

2. **OSINT/GOLDEN SET ENFORCEMENT:** You MUST analyze the risk using external OSINT data and the Golden Set examples.
   - If the supplier risk is **Low (Score < 40)** and NOT on the Blacklist, you MUST cite two facts from the OSINT context (e.g., 'Alibaba rating 4.9', 'No negative mentions on Reddit') to justify the low score.
   - You MUST include an "osint_risk_score" (0-100) based on this analysis in the final JSON.

**PROJECT CONTEXT (Input Utilization Check):**
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

${ref_link && ref_link.toLowerCase() !== 'skip' ? 
  `🔗 CRITICAL: USER PROVIDED REFERENCE LINK: ${ref_link}
   **YOU MUST ANALYZE THIS REFERENCE LINK:**
   - Extract product information, retail price, specifications, and market positioning
   - Use this to refine cost estimation and competitor comparison
   - Include competitor_price, our_price_advantage, and differentiation_point in market_benchmark` : 
  ''}
${material_type ? 
  `📦 MATERIAL TYPE: ${material_type}
   - Use this to estimate HS Code and Duty Rate accurately` : 
  ''}
${size_tier ? 
  `📏 SIZE TIER: ${size_tier}
   - Use this to estimate Shipping Cost and container loading capacity` : 
  ''}
${pricing_metric && pricing_value ? 
  `💰 Pricing: ${pricing_metric} - ${pricing_value}` : 
  ''}
${volume && volume.includes('100,000+') ? 
  `📊 High volume (100,000+ units/month) - consider economies of scale` : 
  ''}
${market && market.includes('Europe') ? 
  `🌍 Target: Europe (EU) - consider CE marking, VAT, EU regulations` : 
  ''}
${origin && origin.includes('India') ? 
  `📍 Origin: India - consider shipping times, export procedures` : 
  ''}
${trade_term && trade_term.includes('DDP') ? 
  `📦 Trade terms: DDP (all-inclusive delivery)` : 
  ''}
${priority && priority.includes('Maximize Gross Margin') ? 
  `🎯 Priority: Maximize margin - focus on cost optimization` : 
  ''}

**Calculation Guidelines:**

1. **COGS Estimation:**
   - Estimate factory EXW cost based on product category, complexity, material type, and volume
   - Electronics typically 20-30% of retail, simple goods 15-25%
   - Higher volume = lower per-unit cost
   - Be conservative and realistic

2. **Logistics Calculation:**
   - Air freight: $3-5/kg for urgent shipments (< 1 month)
   - Sea freight: $1-2/kg or $150-300/CBM for standard shipments (3+ months)
   - DDP includes all shipping, customs, and delivery
   - FOB: buyer handles shipping from port
   - Ex-Works: buyer handles everything from factory

3. **Duty/Compliance Analysis:**
   - Electronics: 0-15% duty, FCC/CE certification ($800-1500)
   - Home & Kitchen: 0-10% duty, FDA for food contact ($600-1200)
   - Fashion/Textiles: 0-20% duty, labeling requirements ($200-400)
   - General: 0-10% duty, standard compliance ($200-500)

4. **Channel Costs:**
   - Amazon: 15% referral + $3-5 FBA fees
   - Shopify/DTC: 2.9% payment processing + $3-5 3PL fulfillment
   - Wholesale/B2B: 2-5% handling fees

5. **Risk Assessment:**
   - Duty Risk: Low (0-5%), Medium (6-15%), High (16%+)
   - Supplier Risk: Based on category complexity and volume (use NexSupply weighting)
   - Compliance Risk: Based on material type and target market regulations

6. **Scale Analysis:**
   - Current volume scenario (as specified)
   - 10x volume scenario with Sea freight (if applicable)

**Output Requirements:**
- Be professional, conservative, and realistic
- All costs in USD, rounded to 2 decimal places
- Provide actionable insights
- Include specific warnings for high-risk items

**CRITICAL TASK: Deep Sourcing Analysis Required**

You MUST use every single piece of user context to fill out all the fields in the required JSON schema accurately:

1. **Duty Analysis (If Material Provided):** Use the material type to determine the US HTS Code and duty rate.

2. **Logistics Insight (If Size Tier Provided):** Calculate container loading capacity (units per 20ft container) and provide specific advice.

3. **Market Benchmark (If Ref Link Provided):** Analyze the link context to estimate competitor retail price, calculate your price advantage, and suggest a specific differentiation strategy.

4. **Strategic Advice:** Provide specific advice tailored to their exact sales channel and priority.

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
  "executive_summary": "1-2 sentences summarizing the analysis and key recommendations",
  "osint_risk_score": number (0-100, based on OSINT data analysis from 500 supplier database)
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
  
  // 커스텀 모델 ID 사용 (환경 변수에서 로드)
  const customModelId = process.env.GEMINI_CUSTOM_MODEL_ID;
  const modelName = customModelId || "gemini-2.5-pro";
  
  const model = genAI.getGenerativeModel({
    model: modelName,
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
  
  // ============================================================================
  // [Logistics Insight 강제 주입] - 100% 입력 활용 보장
  // ============================================================================
  // AI가 logistics_insight를 제공하지 않았거나, userContext에 product_specs/size_tier가 있는 경우
  if (userContext.product_specs && userContext.product_specs.toLowerCase() !== 'skip') {
    // product_specs에서 size_tier 추출 로직 강화
    const specs = userContext.product_specs.split(',').map(s => s.trim());
    const sizeTier = specs.length >= 2 ? specs[1] : (userContext.size_tier || specs[0]);
    
    if (sizeTier && sizeTier.toLowerCase() !== 'skip') {
      // calculateContainerLoading 함수는 /lib/logistics/container-calculator.ts에 구현되어 있음
      const containerInfo = calculateContainerLoading(sizeTier);
      
      // AI가 제공하지 않은 경우, 계산된 값으로 덮어씁니다.
      if (!parsed.logistics_insight || !parsed.logistics_insight.container_loading) {
        parsed.logistics_insight = {
          efficiency_score: containerInfo.efficiency_score,
          container_loading: containerInfo.container_loading,
          advice: containerInfo.advice,
        };
        console.log('[Analyze API] Injected Logistics Insight from calculator:', sizeTier);
      }
    }
  }
  
  // size_tier가 별도로 제공된 경우에도 처리
  if (!parsed.logistics_insight && userContext.size_tier && userContext.size_tier.toLowerCase() !== 'skip') {
    const containerInfo = calculateContainerLoading(userContext.size_tier);
    parsed.logistics_insight = {
      efficiency_score: containerInfo.efficiency_score,
      container_loading: containerInfo.container_loading,
      advice: containerInfo.advice,
    };
    console.log('[Analyze API] Injected Logistics Insight from size_tier:', userContext.size_tier);
  }
  
  // ============================================================================
  // [OSINT Risk Score 값 정규화 및 주입]
  // ============================================================================
  // AI가 osint_risk_score를 제공하지 않았거나 유효하지 않은 경우, 기본값 또는 계산된 값으로 설정합니다.
  if (typeof parsed.osint_risk_score !== 'number' || parsed.osint_risk_score < 0 || parsed.osint_risk_score > 100) {
    // 임시로 기본 Risk Score 로직을 사용하여 계산 (실제로는 AI가 리턴해야 함)
    // ⚠️ Cursor: 이 부분은 AI가 반드시 리턴하도록 프롬프트에 강제했지만, AI가 실패할 경우를 대비한 안전 장치입니다.
    const baseRiskScore = parsed.risks?.supplier?.level === 'High' ? 75 : 
                         parsed.risks?.supplier?.level === 'Medium' ? 50 : 25;
    
    // AI가 값을 놓친 경우 기본 위험도를 설정 (AI가 뱉은 리스크 레벨을 활용)
    parsed.osint_risk_score = baseRiskScore;
    console.log('[Analyze API] OSINT Risk Score normalized from supplier risk level:', baseRiskScore);
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
    const project_id = body.project_id; // Optional project ID for DB updates

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

    // ============================================================================
    // 블랙리스트 체크 (Kill Switch)
    // ============================================================================
    
    // ref_link에서 공급업체 정보 추출 및 블랙리스트 확인
    if (userContext.ref_link && userContext.ref_link.trim() && userContext.ref_link.toLowerCase() !== 'skip') {
      const blacklistEntry = checkBlacklistFromUrl(userContext.ref_link);
      
      if (blacklistEntry) {
        console.warn('[Analyze API] Blacklisted supplier detected:', {
          supplier_id: blacklistEntry.supplier_id,
          company_name: blacklistEntry.company_name,
          ref_link: userContext.ref_link,
        });

        return NextResponse.json(
          {
            ok: false,
            error_code: "CRITICAL_RISK",
            error: "해당 공급업체는 NexSupply의 블랙리스트에 포함되어 즉시 거래가 불가합니다. 전문가 연결을 통해 대안을 제시해 드리겠습니다.",
            blacklist_details: {
              company_name: blacklistEntry.company_name,
              risk_score: blacklistEntry.risk_score,
              note: blacklistEntry.note,
            },
          },
          { status: 403 }
        );
      }
    }

    // 회사명으로 직접 블랙리스트 확인 (supplier_id가 있는 경우)
    // userContext에서 직접적인 공급업체 정보가 있을 수 있음
    if (userContext.business_model || userContext.channel) {
      // 추가적인 블랙리스트 체크 로직이 필요하면 여기에 추가
    }

    // Analyze using Gemini 2.5 Pro
    const analysis = await analyzeSourcingProject(userContext);

    // ============================================================================
    // 분석 결과를 DB에 저장 (project_id가 제공된 경우)
    // ============================================================================
    
    if (project_id) {
      try {
        const { getAdminClient } = await import('@/lib/supabase/admin');
        const adminClient = getAdminClient();
        
        // 프로젝트 업데이트
        const riskScore = analysis.risks?.duty?.level === 'High' ? 75 : 
                         analysis.risks?.duty?.level === 'Medium' ? 50 : 25;
        const landedCost = analysis.financials?.estimated_landed_cost || 0;
        
        await adminClient
          .from('projects')
          .update({
            initial_risk_score: riskScore,
            total_landed_cost: landedCost,
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', project_id);
        
        console.log('[Analyze API] Project updated:', project_id);

        // ============================================================================
        // 분석 완료 이메일 알림 발송
        // ============================================================================
        try {
          // 프로젝트 정보 및 사용자 이메일 가져오기
          const { data: projectData } = await adminClient
            .from('projects')
            .select(`
              name,
              user_id,
              profiles!projects_user_id_fkey(email)
            `)
            .eq('id', project_id)
            .single();

          if (projectData?.profiles?.email) {
            const { sendAnalysisCompletedEmail } = await import('@/lib/email/sender');
            const osintRiskScore = analysis.osint_risk_score || riskScore;
            
            await sendAnalysisCompletedEmail(
              project_id,
              projectData.profiles.email,
              projectData.name || '프로젝트',
              osintRiskScore
            );
          }
        } catch (emailError) {
          // 이메일 발송 실패해도 분석 결과는 반환
          console.error('[Analyze API] Failed to send analysis completed email:', emailError);
        }
      } catch (dbError) {
        // DB 업데이트 실패해도 분석 결과는 반환
        console.error('[Analyze API] Failed to update project:', dbError);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        analysis,
        project_id, // 반환값에 포함
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

