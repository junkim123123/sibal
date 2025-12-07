# NexSupply AI - Prompt Engineering Guide

This guide provides an overview of the prompt engineering logic for the NexSupply AI Analyzer. Understanding this system is crucial for tuning the AI's behavior, improving accuracy, and debugging unexpected responses.

## 1. System Prompt Location

The core "personality" and instructions for the AI are defined in a system prompt. This prompt is the foundation of all AI interactions.

-   **Primary Location:** [`web/utils/prompts.py`](web/utils/prompts.py)

Inside this file, you will find the following key variables:

-   `HYBRID_SYSTEM_PROMPT`: This is the main system prompt that instructs the AI on its role as a sourcing analyst, its core principles (transparency, honesty, etc.), and the JSON format it must output.
-   `HYBRID_USER_PROMPT_TEMPLATE`: This template structures the input that is sent to the AI, combining the user's query with pre-calculated data from our system.
-   `build_hybrid_prompt`: This function assembles the final prompt sent to the Gemini API.

The system prompt is loaded and used in:

-   **Service Layer:** [`web/services/gemini_service.py`](web/services/gemini_service.py)

This service is responsible for all communication with the Gemini API. The `analyze_with_hybrid_system` function is the key method that orchestrates the AI analysis.

## 2. Landed Cost Calculation Logic

NexSupply uses a **hybrid model** for calculating the Landed Cost. This is designed to provide more accurate and reliable results than a pure AI-based approach.

**The process is as follows:**

1.  **Rule-Based Calculation First:** The system first calculates the Landed Cost using a rule-based calculator defined in [`web/utils/cost_calculator.py`](web/utils/cost_calculator.py). This calculator uses predefined tables and formulas to estimate costs for FOB, freight, customs, and other fees. This provides a baseline, transparent, and reproducible cost estimate.
2.  **AI for Insights, Not Calculation:** The pre-calculated Landed Cost JSON is then passed to the AI as "ground truth". The AI is explicitly instructed **not to change** these numbers.
3.  **AI's Role:** The AI's job is to provide qualitative insights based on the calculated costs. This includes:
    *   Market analysis (demand, competition)
    *   Margin estimation
    *   Risk analysis
    *   Supplier recommendations
    *   Actionable next steps

This hybrid approach prevents the AI from "hallucinating" costs and ensures that the financial calculations are grounded in a predictable model.

## 3. Tuning the AI (Hallucination and Bad Responses)

When the AI produces strange or inaccurate responses (hallucinations), follow these steps to tune its behavior:

**Step 1: Analyze the System Prompt**

-   The first place to look is the `HYBRID_SYSTEM_PROMPT` in [`web/utils/prompts.py`](web/utils/prompts.py).
-   Are the instructions clear? Is there any ambiguity that could lead to misinterpretation?
-   Often, making the instructions more explicit or adding constraints can solve the problem. For example, the prompt explicitly tells the AI to *never* invent supplier names.

**Step 2: Check the Input Template**

-   Review the `HYBRID_USER_PROMPT_TEMPLATE` in the same file.
-   Is the data being presented to the AI in a clear and structured way?
-   Ensure that the labels and descriptions are unambiguous.

**Step 3: Add "Guard Rails" or Constraints**

-   If the AI is consistently making a specific type of error, add a direct instruction to the system prompt to prevent it.
-   For example, if the AI starts generating HTML in its responses, you could add a line like: `"You MUST NOT include any HTML tags in your output."`

**Step 4: Refine the JSON Schema**

-   The AI is instructed to return a JSON object that matches a specific schema. This schema is defined for each "mode" of analysis (e.g., `JSON_SCHEMA_COST`, `JSON_SCHEMA_VERIFY`).
-   If the AI is returning data in the wrong format, you may need to adjust the schema to be more precise or to better match the desired output.

**Step 5: Provide Better "Ground Truth"**

-   The AI's insights are only as good as the data it's given. If the rule-based cost calculator is producing inaccurate numbers, the AI's analysis will be flawed.
-   Ensure that the data in [`web/utils/cost_tables.py`](web/utils/cost_tables.py) is up-to-date and accurate.

By following this structured approach, you can effectively tune the AI's behavior and improve the quality of its responses.