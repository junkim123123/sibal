'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import type { NexSupplyAIReportV2 } from '@/lib/types/ai-report';

function AnalyzePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams?.get('leadId') || null;
  const [aiReport, setAiReport] = useState<NexSupplyAIReportV2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) {
      // No leadId, redirect to chat flow
      router.push('/chat');
      return;
    }

    // Fetch AI report
    setLoading(true);
    fetch(`/api/ai-report?leadId=${leadId}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.aiReport) {
          setAiReport(data.aiReport);
        } else {
          setError(data.error || 'Failed to load report');
        }
      })
      .catch(err => {
        console.error('Error loading report:', err);
        setError('Failed to load report');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [leadId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Loading AI report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/start')}
            className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm hover:bg-neutral-800"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (!aiReport) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50 border-green-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'high': return 'bg-red-50 border-red-200';
      default: return 'bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">NexSupply AI Report</h1>
          <p className="text-neutral-600">
            {aiReport.meta.overallSummary}
          </p>
        </div>

        {/* Summary Box */}
        <Card className="mb-8 p-6 bg-neutral-50 border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Estimated DDP per unit</p>
              <p className="text-2xl font-bold text-neutral-900">
                ${aiReport.costOverview.ddpPerUnitRange.low.toFixed(2)} – ${aiReport.costOverview.ddpPerUnitRange.high.toFixed(2)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{aiReport.meta.targetMarket}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Risk level</p>
              <p className={`text-2xl font-bold capitalize ${getRiskColor(aiReport.riskAnalysis.overallRiskLevel)}`}>
                {aiReport.riskAnalysis.overallRiskLevel}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Overall risk assessment</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Confidence</p>
              <p className="text-2xl font-bold text-neutral-900 capitalize">
                {aiReport.meta.confidenceLevel}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{aiReport.dataQuality.overallReliability} reliability</p>
            </div>
          </div>
        </Card>

        {/* Product Summary */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Product Summary</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Title:</span> {aiReport.productSummary.title}</p>
            <p><span className="font-medium">Category:</span> {aiReport.productSummary.category}</p>
            <p className="text-neutral-600">{aiReport.productSummary.shortDescription}</p>
            {aiReport.productSummary.exampleUseCases.length > 0 && (
              <div>
                <p className="font-medium mb-1">Example use cases:</p>
                <ul className="list-disc list-inside text-neutral-600">
                  {aiReport.productSummary.exampleUseCases.map((useCase, idx) => (
                    <li key={idx}>{useCase}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Cost Breakdown */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
          <div className="space-y-4">
            {aiReport.costBreakdown.fobPerUnitRange && (
              <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                <span className="text-sm text-neutral-600">FOB per unit</span>
                <span className="font-medium">
                  ${aiReport.costBreakdown.fobPerUnitRange.low.toFixed(2)} – ${aiReport.costBreakdown.fobPerUnitRange.high.toFixed(2)}
                </span>
              </div>
            )}
            {aiReport.costBreakdown.freightPerUnitRange && (
              <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                <span className="text-sm text-neutral-600">Freight per unit</span>
                <span className="font-medium">
                  ${aiReport.costBreakdown.freightPerUnitRange.low.toFixed(2)} – ${aiReport.costBreakdown.freightPerUnitRange.high.toFixed(2)}
                </span>
              </div>
            )}
            {aiReport.costBreakdown.dutyPerUnitRange && (
              <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                <span className="text-sm text-neutral-600">Duty per unit</span>
                <span className="font-medium">
                  ${aiReport.costBreakdown.dutyPerUnitRange.low.toFixed(2)} – ${aiReport.costBreakdown.dutyPerUnitRange.high.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 font-semibold">
              <span>Total DDP per unit</span>
              <span>
                ${aiReport.costOverview.ddpPerUnitRange.low.toFixed(2)} – ${aiReport.costOverview.ddpPerUnitRange.high.toFixed(2)}
              </span>
            </div>
          </div>
          {aiReport.costBreakdown.notes && (
            <p className="text-xs text-neutral-500 mt-4">{aiReport.costBreakdown.notes}</p>
          )}
        </Card>

        {/* Key Assumptions */}
        {aiReport.costOverview.keyAssumptions.length > 0 && (
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Key Assumptions</h2>
            <ul className="space-y-2 text-sm">
              {aiReport.costOverview.keyAssumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="text-neutral-600">{assumption}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Volume Scenarios */}
        {aiReport.volumeScenarios && aiReport.volumeScenarios.length > 0 && (
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Volume Scenarios</h2>
            <div className="space-y-4">
              {aiReport.volumeScenarios.map((scenario, idx) => (
                <div key={idx} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                  <p className="font-medium mb-2">{scenario.scenarioName}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {scenario.units !== null && (
                      <div>
                        <span className="text-neutral-600">Units:</span> {scenario.units.toLocaleString()}
                      </div>
                    )}
                    {scenario.ddpPerUnitEstimate !== null && (
                      <div>
                        <span className="text-neutral-600">DDP/unit:</span> ${scenario.ddpPerUnitEstimate.toFixed(2)}
                      </div>
                    )}
                    {scenario.totalDdpEstimate !== null && (
                      <div>
                        <span className="text-neutral-600">Total DDP:</span> ${scenario.totalDdpEstimate.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {scenario.comment && (
                    <p className="text-xs text-neutral-500 mt-2">{scenario.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Risk Analysis */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
          <div className="space-y-4">
            {/* Compliance Risks */}
            {aiReport.riskAnalysis.complianceRisks.length > 0 && (
              <div className={`p-4 rounded-lg border ${getRiskBgColor(aiReport.riskAnalysis.overallRiskLevel)}`}>
                <h3 className="font-semibold mb-2">Compliance Risks</h3>
                <ul className="space-y-1 text-sm">
                  {aiReport.riskAnalysis.complianceRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Logistics Risks */}
            {aiReport.riskAnalysis.logisticsRisks.length > 0 && (
              <div className={`p-4 rounded-lg border ${getRiskBgColor(aiReport.riskAnalysis.overallRiskLevel)}`}>
                <h3 className="font-semibold mb-2">Logistics Risks</h3>
                <ul className="space-y-1 text-sm">
                  {aiReport.riskAnalysis.logisticsRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Commercial Risks */}
            {aiReport.riskAnalysis.commercialRisks.length > 0 && (
              <div className={`p-4 rounded-lg border ${getRiskBgColor(aiReport.riskAnalysis.overallRiskLevel)}`}>
                <h3 className="font-semibold mb-2">Commercial Risks</h3>
                <ul className="space-y-1 text-sm">
                  {aiReport.riskAnalysis.commercialRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Must Check Before Order */}
            {aiReport.riskAnalysis.mustCheckBeforeOrder.length > 0 && (
              <div className="p-4 rounded-lg border border-neutral-300 bg-neutral-50">
                <h3 className="font-semibold mb-2">Must Check Before Order</h3>
                <ul className="space-y-1 text-sm">
                  {aiReport.riskAnalysis.mustCheckBeforeOrder.map((check, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Data Quality */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Data Quality</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Overall reliability:</span>{' '}
              <span className="capitalize">{aiReport.dataQuality.overallReliability}</span>
            </div>
            <div>
              <span className="font-medium">Price data source:</span>{' '}
              <span className="capitalize">{aiReport.dataQuality.priceDataSource.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="font-medium">Freight data source:</span>{' '}
              <span className="capitalize">{aiReport.dataQuality.freightDataSource.replace(/_/g, ' ')}</span>
            </div>
            {aiReport.dataQuality.caveats.length > 0 && (
              <div>
                <p className="font-medium mb-2">Caveats:</p>
                <ul className="space-y-1 text-neutral-600">
                  {aiReport.dataQuality.caveats.map((caveat, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{caveat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Recommended Next Steps */}
        {aiReport.recommendedNextSteps.length > 0 && (
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Recommended Next Steps</h2>
            <div className="space-y-4">
              {aiReport.recommendedNextSteps
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((step, idx) => (
                  <div key={idx} className="border-l-4 border-neutral-300 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-700 capitalize">
                        {step.priority}
                      </span>
                      <span className="font-semibold">{step.label}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{step.detail}</p>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="mb-8 p-6 bg-neutral-50 border-neutral-200">
          <p className="text-xs text-neutral-600 text-center">
            NexSupply AI is in early alpha.
            <br />
            All estimates are directional only and not legal or customs advice.
          </p>
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={async () => {
              try {
                await router.push('/contact');
              } catch (error) {
                console.error('[Analyze] Navigation error:', error);
              }
            }}
            className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Talk to NexSupply about this project
          </button>
          <button
            onClick={async () => {
              try {
                await router.push('/start');
              } catch (error) {
                console.error('[Analyze] Navigation error:', error);
              }
            }}
            className="px-6 py-3 rounded-full border border-neutral-300 bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start a new project
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Loading...</p>
      </div>
    }>
      <AnalyzePageContent />
    </Suspense>
  );
}
