"use client";

import { useState, useId, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { ProductAnalysis } from '@/lib/product-analysis/schema';
import { createLeadFromAnalysis } from '@/lib/sample-request/fromAnalysis';
import { logEvent } from '@/lib/analytics/telemetry';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductAnalysisFeedback } from '@/components/product-analysis-feedback';
import { CategoryKnowledgeCards } from '@/components/category-knowledge-cards';
import SignInModal from '@/components/sign-in-modal';
import LimitReachedCard from '@/components/LimitReachedCard';
import { QuickAnalyzerInput } from '@/components/analyzer/QuickAnalyzerInput';

export default function ProductAnalyzer({ source }: { source?: string }) {
  const [input, setInput] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [error, setError] = useState('');
  const [errorReason, setErrorReason] = useState('');
  const [sessionId, setSessionId] = useState('');
  const componentId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPresetSubmitting, setIsPresetSubmitting] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { isAuthenticated, userId } = useAuth();
  const limitHitLoggedRef = useRef(false);

  const presets = [
    "Amazon FBA kids water bottle, 500 units to USA",
    "TikTok Shop viral Korean gummy candy, 2,000 units to USA",
    "Retail chain instant ramen, 1 full container to USA",
  ];

  const handlePresetClick = (preset: string) => {
    setInput(preset);
    setIsPresetSubmitting(true);
  };
  
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    logEvent('view_analyzer', { source: source || 'direct' });
  }, [source]);

  useEffect(() => {
    if (isPresetSubmitting) {
      formRef.current?.requestSubmit();
      setIsPresetSubmitting(false);
    }
  }, [isPresetSubmitting]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');
    setAnalysis(null);
    setShowLeadForm(false);
    setLeadStatus('idle');
    setSessionId(`${componentId}-${Date.now()}`);

    try {
      const body = new FormData();
      body.append('input', input);
      if (productImage) {
        body.append('image', productImage);
      }

      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'quota_exceeded') {
          setErrorReason(data.reason);
          if (data.reason !== 'anonymous_daily_limit') {
            setShowSignInModal(true);
          }
        if (!limitHitLoggedRef.current) {
          limitHitLoggedRef.current = true;
          const userType = isAuthenticated ? 'user' : 'anonymous';
          fetch('/api/limit-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'limit_hit',
              reason: data.reason,
              userType,
              input: input.trim(),
            }),
          }).catch(() => {
            // Silently fail - analytics logging should not block user experience
          });
        }
        }
        throw new Error(data.message || data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      logEvent('analyzer_quick_scan_completed', { source, path: 'quick_scan' });
      limitHitLoggedRef.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProductImage(file);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis) return;

    setLeadStatus('submitting');

    try {
      const analyzerPath = 'quick_scan';
      const leadSource = `${source || 'direct'}:${analyzerPath}`;
      
      logEvent('quote_requested', { source: leadSource, path: analyzerPath });

      const res = await createLeadFromAnalysis({
        name: leadName,
        email: leadEmail,
        analysis: analysis,
        leadSource,
        userId,
      });

      if (!res.ok) throw new Error(res.error || 'Failed to submit lead');

      setLeadStatus('success');
    } catch (err) {
      setLeadStatus('error');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderAnalysisSection = () => {
    if (isLoading) {
      return (
        <Card className="text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4 text-primary" />
          <h3 className="card-title mb-2">Analyzing your product...</h3>
          <p className="helper-text">We are estimating freight, duty, and risks.</p>
        </Card>
      );
    }

    if (error) {
      if (errorReason === 'anonymous_daily_limit' || errorReason === 'user_daily_limit') {
        const logLimitEvent = (action: 'cta_primary_click' | 'cta_secondary_click') => {
          const userType = isAuthenticated ? 'user' : 'anonymous';
          fetch('/api/limit-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              reason: errorReason,
              userType,
              input: input.trim(),
            }),
          }).catch(() => {
            // Silently fail - analytics logging should not block user experience
          });
        };

        return (
          <LimitReachedCard
            variant={errorReason === 'anonymous_daily_limit' ? 'anonymous' : 'user'}
            alphaSignupUrl={process.env.NEXT_PUBLIC_ALPHA_SIGNUP_URL}
            bookingUrl={process.env.NEXT_PUBLIC_BOOKING_URL}
            onPrimaryClick={() => logLimitEvent('cta_primary_click')}
            onSecondaryClick={() => logLimitEvent('cta_secondary_click')}
          />
        );
      }
      return (
        <Card className="text-center border-destructive/50">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-4" />
          <h3 className="card-title mb-2">Something went wrong</h3>
          <p className="helper-text mb-6">{error}</p>
          <Button onClick={() => handleAnalyze()}>
            Try Again
          </Button>
        </Card>
      );
    }

    if (analysis) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h3 className="card-title">{analysis.product_name}</h3>
                <p className="card-subtitle mt-1">Est. HTS Code: {analysis.hts_code}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end shrink-0">
                <span className="text-badge text-muted-foreground mb-1">Risk Score</span>
                <span className={`text-4xl font-bold ${getScoreColor(analysis.risk_assessment.overall_score)}`}>
                  {analysis.risk_assessment.overall_score}
                </span>
              </div>
            </div>

            {/* Landed Cost Breakdown */}
            <div className="mb-6 pb-6 border-b border-subtle-border">
              <h4 className="text-lg font-semibold mb-4">Landed Cost Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">FOB Price</p>
                  <p className="text-lg font-semibold">{analysis.landed_cost_breakdown.fob_price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Freight</p>
                  <p className="text-lg font-semibold">{analysis.landed_cost_breakdown.freight_cost}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duty Rate</p>
                  <p className="text-lg font-semibold">{analysis.landed_cost_breakdown.duty_rate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duty Cost</p>
                  <p className="text-lg font-semibold">{analysis.landed_cost_breakdown.duty_cost}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground mb-1">Total Landed Cost</p>
                  <p className="text-xl font-bold text-primary">{analysis.landed_cost_breakdown.landed_cost}</p>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="mb-6 pb-6 border-b border-subtle-border">
              <h4 className="text-lg font-semibold mb-4">Risk Assessment</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Compliance Risk</p>
                  <p className={`text-base font-semibold ${getRiskColor(analysis.risk_assessment.compliance_risk)}`}>
                    {analysis.risk_assessment.compliance_risk}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Supplier Risk</p>
                  <p className={`text-base font-semibold ${getRiskColor(analysis.risk_assessment.supplier_risk)}`}>
                    {analysis.risk_assessment.supplier_risk}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Logistics Risk</p>
                  <p className={`text-base font-semibold ${getRiskColor(analysis.risk_assessment.logistics_risk)}`}>
                    {analysis.risk_assessment.logistics_risk}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Risk Summary</p>
                <p className="text-sm text-foreground leading-relaxed">{analysis.risk_assessment.summary}</p>
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Recommendation</h4>
              <p className="text-sm text-foreground leading-relaxed">{analysis.recommendation}</p>
            </div>
          </Card>

             {!showLeadForm ? (
            <Button 
                onClick={() => setShowLeadForm(true)}
              className="w-full"
              size="lg"
              >
                Get a Sourcing Quote
            </Button>
            ) : (
            <Card>
              <h3 className="card-title mb-4">Talk to a Sourcing Expert</h3>
                {leadStatus === 'success' ? (
                <div className="text-center text-success">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                  <p className="helper-text">Thanks! We've received your request and will get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit}>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      />
                    <Button
                        type="submit"
                        disabled={leadStatus === 'submitting'}
                      className="w-full"
                      size="lg"
                      >
                        {leadStatus === 'submitting' ? (
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                          'Request Sourcing Help'
                        )}
                    </Button>
                    </div>
                  {leadStatus === 'error' && (
                    <p className="mt-2 text-sm text-destructive">Something went wrong. Please try again.</p>
                  )}
                  </form>
                )}
            </Card>
            )}

          <CategoryKnowledgeCards analysis={analysis} />

          <ProductAnalysisFeedback analysis={analysis} mode="quick_scan" source={source} />
        </motion.div>
      );
    }

    return (
      <Card className="text-center">
        <h3 className="card-title mb-2">No analysis yet</h3>
        <p className="helper-text">Describe a product or upload a photo, then we will estimate landed cost and risk.</p>
      </Card>
    );
  };

  const CONTAINER_MAX_WIDTH = 'max-w-4xl';
  const CONTAINER_PADDING = 'px-4 sm:px-6 lg:px-8';

  return (
    <section id="product-analyzer" className="relative w-full bg-background py-12 sm:py-16 lg:py-20 border-t border-subtle-border">
      {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
      <div className={`${CONTAINER_MAX_WIDTH} mx-auto ${CONTAINER_PADDING}`}>
        <motion.div key="form" className="space-y-12">
          <div className="text-center">
            <h2 className="section-title">Start Your Analysis with Copilot</h2>
            <p className="section-description">
              New to importing? Let our AI assistant guide you. We’ll ask 3-5 quick questions to generate a comprehensive landed cost and risk report for your product idea.
            </p>
          </div>

          <Card className="text-center space-y-4 p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="text-xl font-semibold">Let's Analyze Your Product Idea</h3>
            <p className="text-sm text-muted-foreground">
              Our Copilot makes it easy to understand your sourcing risks and opportunities.
            </p>
            <Link href="/chat">
              <Button size="lg" className="text-base px-8 py-6">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start with a Conversation
              </Button>
            </Link>
          </Card>

          <div className="text-center space-y-3">
            <button
              onClick={() => setShowQuickInput(!showQuickInput)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              I already know exactly what I want (quick input)
            </button>
            <AnimatePresence>
              {showQuickInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-6 border-subtle-border mt-2">
                    <QuickAnalyzerInput
                      onSubmit={async (inputText, image) => {
                        setInput(inputText);
                        setProductImage(image || null);
                        setTimeout(() => {
                          formRef.current?.requestSubmit();
                        }, 100);
                      }}
                      placeholder="e.g. 'Noise-cancelling headphones' or AliExpress URL..."
                      isLoading={isLoading}
                      presets={presets}
                      onPresetClick={(preset) => {
                        setInput(preset);
                        handlePresetClick(preset);
                      }}
                    />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={isLoading ? 'loading' : error ? 'error' : analysis ? 'analysis' : 'empty'}>
              {renderAnalysisSection()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}