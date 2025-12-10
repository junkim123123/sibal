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
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT" as any,
          threshold: "BLOCK_ONLY_HIGH" as any,
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH" as any,
          threshold: "BLOCK_ONLY_HIGH" as any,
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
          threshold: "BLOCK_ONLY_HIGH" as any,
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
          threshold: "BLOCK_ONLY_HIGH" as any,
        },
      ] as any,
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
export async function analyzeSampleRequest(
  payload: SampleRequestPayload,
): Promise<NexSupplyLeadAnalysis> {
  console.warn(
    '[analyzeSampleRequest] Stub implementation is running. Replace with real Gemini logic.',
  );
  return {} as unknown as NexSupplyLeadAnalysis;
}