/**
 * Product Name Suggestions API
 * 
 * Uses LLM to generate standardized product name suggestions based on user input
 */

import { NextRequest, NextResponse } from 'next/server';

async function getApiKey(): Promise<string> {
  if (typeof process === 'undefined' || !process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return process.env.GEMINI_API_KEY;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;
    
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter a product name or link.' },
        { status: 400 }
      );
    }

    // Only generate suggestions if input is substantial (not just a few characters)
    if (input.trim().length < 3) {
      return NextResponse.json({
        suggestions: [],
      });
    }

    try {
      const apiKey = await getApiKey();
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });

      const prompt = `
Analyze the user's product information and generate standardized product name suggestions.

User input: "${input}"

Return only JSON in the following format:
{
  "suggestions": [
    "Standardized product name 1",
    "Standardized product name 2",
    "Standardized product name 3"
  ]
}

Rules:
- Generate only 2-3 suggestions
- Suggestions should be concise and clear
- If a link is provided, extract product information from the link to generate suggestions
- If a product name is provided, suggest in standardized format
- Each suggestion should be within 50 characters
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          suggestions: parsed.suggestions || [],
        });
      }
      
      // Fallback: return empty suggestions
      return NextResponse.json({
        suggestions: [],
      });
    } catch (aiError) {
      console.error('[ProductSuggest] AI error:', aiError);
      // Return empty suggestions on error (non-blocking)
      return NextResponse.json({
        suggestions: [],
      });
    }
  } catch (error) {
    console.error('Error generating product suggestions:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating suggestions.' },
      { status: 500 }
    );
  }
}

