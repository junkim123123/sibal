/**
 * Results page for product analysis
 * 
 * Shows a placeholder "Landed Cost and Risk Report" with mock data.
 * Reads answers from URL search params or uses hardcoded example.
 * 
 * TODO: Integrate with Nexi analysis API to generate real reports
 * TODO: Add loading states while analysis is running
 * TODO: Add error handling for failed analysis
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { loadOnboardingState, clearOnboardingState } from '@/lib/onboardingStorage';
import type { OnboardingState } from '@/lib/types/onboarding';
import { getChannelLabel, getMarketLabel } from '@/lib/types/onboarding';

type Answers = Record<string, string>;

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Answers>({});
  const [showJson, setShowJson] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load onboarding state from localStorage
  useEffect(() => {
    if (isInitialized) return;
    
    // Try to load from new chat flow (nexsupply_onboarding_data)
    try {
      const chatData = localStorage.getItem('nexsupply_onboarding_data');
      if (chatData) {
        const parsed = JSON.parse(chatData);
        // Convert chat data format to OnboardingState format if needed
        // For now, we'll use it as answers
        setAnswers(parsed);
      }
    } catch (error) {
      console.error('Failed to load chat onboarding data:', error);
    }
    
    // Also try to load from existing onboarding state
    const savedOnboarding = loadOnboardingState();
    if (savedOnboarding) {
      setOnboardingState(savedOnboarding);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    // Read answers from URL params
    const paramsAnswers: Answers = {};
    searchParams?.forEach((value, key) => {
      try {
        // Try to parse as JSON first (for arrays/objects)
        paramsAnswers[key] = JSON.parse(value);
      } catch {
        // If not JSON, use as-is
        paramsAnswers[key] = value;
      }
    });

    // If no params, use example data
    if (Object.keys(paramsAnswers).length === 0) {
      setAnswers({
        q1: 'Wireless noise-cancelling headphones',
        q2: 'electronics',
        q3: 'Premium wireless headphones with active noise cancellation, target retail $79-99',
        q4: 'new_test',
        q5: 'amazon_fba',
        q6: 'US',
        q7: 'CN',
        q8: 'DDP',
        q9: 'balanced',
        q10: '500',
        q11: 'balanced',
        q12: 'Need Bluetooth 5.0 and minimum 20hr battery life',
      });
    } else {
      setAnswers(paramsAnswers);
    }
  }, [searchParams]);

  // Mock analysis data - TODO: Replace with real API response
  const mockAnalysis = {
    landedCost: '$12.45',
    marginRange: '15-25%',
    risks: {
      duty: {
        level: 'Low',
        score: 25,
        description: 'Standard duty rate applies. No special regulations expected.',
      },
      supplier: {
        level: 'Medium',
        score: 45,
        description: 'Electronics category requires supplier verification and quality control.',
      },
      logistics: {
        level: 'Low',
        score: 30,
        description: 'Standard shipping routes available. No major port congestion expected.',
      },
    },
  };

  const getRiskColor = (level: string) => {
    if (level === 'Low') return 'text-green-600 dark:text-green-400';
    if (level === 'Medium') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskIcon = (level: string) => {
    if (level === 'Low') return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (level === 'Medium') return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  // Helper functions for Project context card
  const getVolumePlanDisplay = (plan?: string): string => {
    if (!plan) return 'Not set';
    switch (plan) {
      case 'test':
        return 'Test run (~50 units/month)';
      case 'small_launch':
        return 'Small launch (~200 units/month)';
      case 'steady':
        return 'Steady volume (~1,000 units/month)';
      case 'aggressive':
        return 'Aggressive scale (~5,000 units/month)';
      case 'not_sure':
        return 'Not sure yet';
      default:
        return 'Not set';
    }
  };

  const getTimelineDisplay = (plan?: string): string => {
    if (!plan) return 'Not set';
    switch (plan) {
      case 'within_1_month':
        return 'First box within 1 month';
      case 'within_3_months':
        return 'First box within 3 months';
      case 'after_3_months':
        return 'Flexible / not urgent';
      case 'flexible':
        return 'Flexible / not urgent';
      default:
        return 'Not set';
    }
  };

  // Check if we should show the Project context card
  const shouldShowProjectContext = onboardingState && (
    onboardingState.projectName ||
    onboardingState.sellingContext.mainChannel ||
    (onboardingState.sellingContext.targetMarkets && onboardingState.sellingContext.targetMarkets.length > 0)
  );

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] text-muted-foreground mb-1">
            DEBUG: New Results v2
          </p>
          <h1 className="text-3xl font-bold mb-2">Landed Cost and Risk Report</h1>
          <p className="text-muted-foreground">
            Analysis based on your product requirements
          </p>
        </div>

        {/* Project Context Card */}
        {shouldShowProjectContext && onboardingState && (
          <Card className="mb-6 p-4 sm:p-6">
            <h2 className="text-sm font-semibold mb-4 text-foreground">Project context</h2>
            <div className="space-y-3 text-sm">
              {/* Project Name */}
              <div>
                <div className="text-muted-foreground mb-1">Project</div>
                <div className="text-foreground font-medium">
                  {onboardingState.projectName || (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>

              {/* Channel */}
              <div>
                <div className="text-muted-foreground mb-1">Channel</div>
                <div className="text-foreground font-medium">
                  {onboardingState.sellingContext.mainChannel ? (
                    onboardingState.sellingContext.mainChannel === 'other' && onboardingState.sellingContext.mainChannelOtherText ? (
                      `Other (${onboardingState.sellingContext.mainChannelOtherText})`
                    ) : (
                      getChannelLabel(onboardingState.sellingContext.mainChannel)
                    )
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>

              {/* Markets */}
              <div>
                <div className="text-muted-foreground mb-1">Markets</div>
                <div className="text-foreground font-medium">
                  {onboardingState.sellingContext.targetMarkets && onboardingState.sellingContext.targetMarkets.length > 0 ? (
                    (() => {
                      const marketLabels = onboardingState.sellingContext.targetMarkets
                        .slice(0, 2)
                        .map(m => getMarketLabel(m));
                      const hasMore = onboardingState.sellingContext.targetMarkets.length > 2;
                      return marketLabels.join(', ') + (hasMore ? '...' : '');
                    })()
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>

              {/* Volume Plan */}
              <div>
                <div className="text-muted-foreground mb-1">Volume plan</div>
                <div className="text-foreground font-medium">
                  {getVolumePlanDisplay(onboardingState.yearlyVolumePlan)}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="text-muted-foreground mb-1">Timeline</div>
                <div className="text-foreground font-medium">
                  {getTimelineDisplay(onboardingState.timelinePlan)}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Report Card */}
        <Card className="mb-6">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Landed Cost */}
            <div className="border-b border-subtle-border pb-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                Estimated Landed Cost per Unit (DDP)
              </h2>
              <p className="text-3xl font-bold text-primary">{mockAnalysis.landedCost}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Includes product cost, shipping, duties, and all fees
              </p>
            </div>

            {/* Margin Range */}
            <div className="border-b border-subtle-border pb-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                Estimated Margin Range
              </h2>
              <p className="text-2xl font-bold text-foreground">{mockAnalysis.marginRange}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Based on target retail price and estimated landed cost
              </p>
            </div>

            {/* Risk Indicators */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
              <div className="space-y-4">
                {/* Duty Risk */}
                <div className="p-4 rounded-lg bg-surface border border-subtle-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(mockAnalysis.risks.duty.level)}
                      <h3 className="font-semibold text-foreground">Duty Risk</h3>
                    </div>
                    <span className={`font-semibold ${getRiskColor(mockAnalysis.risks.duty.level)}`}>
                      {mockAnalysis.risks.duty.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {mockAnalysis.risks.duty.description}
                  </p>
                </div>

                {/* Supplier Risk */}
                <div className="p-4 rounded-lg bg-surface border border-subtle-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(mockAnalysis.risks.supplier.level)}
                      <h3 className="font-semibold text-foreground">Supplier Risk</h3>
                    </div>
                    <span className={`font-semibold ${getRiskColor(mockAnalysis.risks.supplier.level)}`}>
                      {mockAnalysis.risks.supplier.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {mockAnalysis.risks.supplier.description}
                  </p>
                </div>

                {/* Logistics Risk */}
                <div className="p-4 rounded-lg bg-surface border border-subtle-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(mockAnalysis.risks.logistics.level)}
                      <h3 className="font-semibold text-foreground">Logistics Risk</h3>
                    </div>
                    <span className={`font-semibold ${getRiskColor(mockAnalysis.risks.logistics.level)}`}>
                      {mockAnalysis.risks.logistics.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {mockAnalysis.risks.logistics.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Debug: Show JSON */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowJson(!showJson)}
            className="w-full sm:w-auto"
          >
            {showJson ? 'Hide' : 'Show'} Collected Answers (Debug)
          </Button>
        </div>

        {showJson && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Raw Answers JSON</h3>
            <pre className="text-xs bg-surface p-4 rounded-lg overflow-auto border border-subtle-border">
              {JSON.stringify(answers, null, 2)}
            </pre>
          </Card>
        )}

        {/* Action Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            What would you like to do next with this project?
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => router.push('/contact')}
            >
              Talk to NexSupply about this project
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push('/analyze/chat')}
            >
              Analyze another product for this project
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                clearOnboardingState();
                router.push('/chat');
              }}
            >
              Start a new project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

