/**
 * Sourcing Analysis API Endpoint
 * 
 * Analyzes structured user context from chat onboarding flow
 * and returns comprehensive sourcing intelligence for the dashboard.
 */

import { NextResponse } from "next/server";
import { analyzeSourcingProject, type UserContext } from "@/lib/ai/sourcingAnalysis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userContext: UserContext = body.userContext || body;

    // Validate required fields
    if (!userContext.project_name) {
      return NextResponse.json(
        { ok: false, error: "project_name is required" },
        { status: 400 }
      );
    }

    console.log("[AnalyzeSourcing] Analyzing project:", userContext.project_name);

    // Analyze using Gemini 1.5 Pro
    const analysis = await analyzeSourcingProject(userContext);

    return NextResponse.json(
      {
        ok: true,
        analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AnalyzeSourcing] Server error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage || "Failed to analyze sourcing project",
      },
      { status: 500 }
    );
  }
}

