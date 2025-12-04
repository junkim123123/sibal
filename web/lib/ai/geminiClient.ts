import 'server-only';
import type { SampleRequestPayload, NexSupplyLeadAnalysis } from '@/lib/sample-request/schema';

async function getApiKey(): Promise<string> {
  if (typeof process === 'undefined' || !process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in your .env.local file.');
  }
  return process.env.GEMINI_API_KEY;
}

/**
 * Calls the Gemini 2.5 Pro model with a specific prompt to get a JSON response.
 * This is a server-side only function.
 * @param prompt The prompt to send to the model.
 * @returns A promise that resolves to the raw JSON string from the model.
 */
export async function callGeminiJSON(prompt: string): Promise<string> {
  try {
    const apiKey = await getApiKey();
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // The model should return raw JSON, but clean it just in case
    const cleaned = text.replace(/```json|```/g, '').trim();
    return cleaned;
  } catch (error) {
    console.error('[GeminiClient] Failed to generate JSON from prompt', error);
    // Attach the raw response to the error if possible for better debugging
    const newError = new Error('Failed to get a valid response from the AI model.');
    // @ts-ignore
    newError.cause = { rawResponse: error?.response?.text() };
    throw newError;
  }
}

/**
 * Analyzes a sample request payload and returns a structured lead analysis.
 * @param payload The sample request payload to analyze.
 * @returns A promise that resolves to the lead analysis.
 */
export async function analyzeSampleRequest(payload: SampleRequestPayload): Promise<NexSupplyLeadAnalysis> {
  try {
    const apiKey = await getApiKey();
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const { NexSupplyLeadAnalysisSchema } = await import('@/lib/sample-request/schema');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the following sample request and return a structured lead analysis in JSON format.

Sample Request Details:
- Name: ${payload.name}
- Email: ${payload.workEmail}
- Company: ${payload.company}
- Use Case: ${payload.useCase}
${payload.leadSource ? `- Lead Source: ${payload.leadSource}` : ''}

Return a JSON object matching the NexSupplyLeadAnalysis schema with the following structure:
{
  "lead_profile": {
    "inferred_role": "Founder" | "Owner" | "Operations Manager" | "Supply Chain Manager" | "Procurement Manager" | "Solo Seller" | "Unknown",
    "buyer_persona_tag": "Anxious Scaler" | "Established Enterprise" | "Tire Kicker" | "Brand Builder" | "Arbitrage Seller",
    "technical_sophistication_score": number (1-10),
    "email_type": "business" | "prosumer" | "free" | "disposable_or_risky" (optional),
    "email_local_part_type": "role_based" | "person_name" | "suspicious" (optional)
  },
  "firmographics": {
    "industry_vertical": string,
    "supply_chain_complexity": "Low" | "Medium" | "High" | "Enterprise",
    "estimated_annual_volume": string
  },
  "qualification_engine": {
    "_reasoning_trace": string (explain your reasoning),
    "opportunity_score": number (0-100),
    "urgency_signal": "Low" | "Medium" | "High",
    "routing_destination": "Ignore_or_nurture" | "Standard_queue" | "Priority_queue" | "Executive_hand_off",
    "data_completeness": "insufficient" | "partial" | "sufficient" (optional),
    "intent_score_0_to_100": number (optional),
    "fit_score_0_to_100": number (optional),
    "authority_score_0_to_100": number (optional),
    "engagement_score_0_to_100": number (optional),
    "intent_signals": {
      "high_intent_tags": string[] (optional),
      "low_intent_tags": string[] (optional),
      "summary": string (optional)
    } (optional)
  },
  "content_generation": {
    "admin_battlecard_html": string (HTML formatted battlecard for admin),
    "user_email_subject": string,
    "user_email_opening_hook": string,
    "preview_dashboard_headline": string,
    "preview_key_insight": string
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const validation = NexSupplyLeadAnalysisSchema.safeParse(parsed);
    if (validation.success) {
      return validation.data;
    } else {
      console.error('[GeminiClient][analyzeSampleRequest] Validation failed', validation.error);
      throw new Error('Failed to parse AI response with valid schema');
    }
  } catch (error) {
    console.error('[GeminiClient][analyzeSampleRequest] Failed to analyze sample request', error);
    throw error;
  }
}