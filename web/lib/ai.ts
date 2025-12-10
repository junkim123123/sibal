import 'server-only';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SampleRequestData } from './validation';

/**
 * @fileoverview AI utilities for interacting with Google Gemini.
 * @description This module initializes the Gemini client and provides
 * functions for generating content based on user input.
 *
 * .env.local example:
 * GEMINI_API_KEY="YOUR_GEMINI_KEY"
 */

async function getApiKey(): Promise<string> {
  if (typeof process === 'undefined' || !process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in your .env.local file.');
  }
  return process.env.GEMINI_API_KEY;
}

/**
 * Generates a JSON summary for a sample request using Gemini.
 * @param data The validated sample request data.
 * @returns A promise that resolves to a JSON object with the summary.
 */
export async function generateSampleRequestSummary(data: SampleRequestData): Promise<object> {
  const apiKey = await getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following user request for a sample supply chain report and generate a structured JSON summary.
    The user is interested in NexSupply, a platform for AI-powered global supply chain intelligence.

    User Details:
    - Name: ${data.name}
    - Work Email: ${data.workEmail}
    - Company: ${data.company || 'Not provided'}
    - Use Case: ${data.useCase}

    Generate a JSON object with the following structure:
    {
      "leadName": "string",
      "companyName": "string",
      "contactEmail": "string",
      "primaryInterest": "string (e.g., 'Cost Optimization', 'Compliance', 'Supplier Vetting')",
      "summary": "string (A brief, one-sentence summary of the user's request)",
      "urgency": "'low' | 'medium' | 'high' (Estimate based on their use case)"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Failed to generate AI summary.");
  }
}