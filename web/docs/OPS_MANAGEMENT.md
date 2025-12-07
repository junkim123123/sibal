# NexSupply AI - Operations & Cost Management Guide

This document provides a crucial overview of the operational costs, service limits, and emergency procedures for the NexSupply AI application.

## 1. Gemini API (Google AI)

-   **Service:** Provides the core AI analysis capabilities.
-   **Current Tier:** `[PLEASE CONFIRM - Free Tier or Paid Plan]`
-   **Rate Limits:**
    -   **Free Tier:** Typically has limits on requests per minute (RPM). Please check the [Google AI Studio documentation](https://ai.google.dev/docs/intro) for the most current free tier limits.
    -   **Paid Plan:** Limits are significantly higher.
-   **Cost Implications:**
    -   Exceeding free tier limits will result in API errors until the limit resets.
    -   If on a paid plan, monitor usage in the Google Cloud Console to avoid unexpected costs.
-   **Action Required:** Confirm the current plan and set up billing alerts in the Google Cloud Console.

## 2. Supabase

-   **Service:** Provides the database and authentication services.
-   **Current Tier:** `[PLEASE CONFIRM - Free, Pro, or Team Plan]`
-   **Key Limits (Free Tier):**
    -   **DB Size:** Up to 500MB
    -   **Bandwidth:** Up to 5GB
    -   **API Requests:** 2 million per month
-   **Cost Implications:**
    -   Exceeding the free tier limits may result in the service being paused or requiring an upgrade to a paid plan. Supabase will typically notify you before this happens.
    -   The Pro plan offers "spend protection" to prevent runaway costs, but it's important to set a budget.
-   **Action Required:**
    -   Confirm the current Supabase plan.
    -   Set up usage alerts in the Supabase dashboard to be notified when you are approaching the limits.

## 3. Vercel

-   **Service:** Hosts the Next.js frontend application.
-   **Current Tier:** `[PLEASE CONFIRM - Hobby, Pro, or Enterprise Plan]`
-   **Key Limits:**
    -   **Function Execution Timeout:**
        -   **Hobby Plan:** 10 seconds
        -   **Pro Plan:** 60 seconds (default), can be increased.
    -   **Bandwidth (Hobby Plan):** 100GB/month
-   **Cost Implications:**
    -   The Hobby plan is free, but has stricter limits.
    -   The Pro plan is usage-based, so costs can vary. It's important to monitor bandwidth and function execution time.
-   **Action Required:**
    -   Confirm the current Vercel plan.
    -   Review the Vercel usage dashboard regularly.

## 4. Emergency Contact

In the event of a billing issue, service outage, or other critical problem, please contact:

-   **Name:** `[PLEASE ADD USER'S NAME]`
-   **Email:** `[PLEASE ADD USER'S EMAIL]`
-   **Phone:** `[PLEASE ADD USER'S PHONE NUMBER]`