/**
 * NexSupply Copilot - Primary Entry Point
 * 
 * This is now the primary entrypoint for NexSupply. All product analysis flows
 * should be anchored in this chat UI.
 * 
 * The chat-first UX allows users to:
 * - Type natural language product descriptions
 * - Get instant analysis with structured cards
 * - See multiple analyses in conversation history
 * - Handle limits and errors gracefully within chat
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Send, AlertTriangle, Camera } from 'lucide-react';
import Link from 'next/link';
import type { ProductAnalysis } from '@/lib/product-analysis/schema';
import { ProductAnalysisCard } from '@/components/ProductAnalysisCard';
import LimitReachedCard from '@/components/LimitReachedCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import SignInModal from '@/components/sign-in-modal';
import { logEvent } from '@/lib/analytics/telemetry';
import { logCategoryUsage, buildCategoryUsageEvent } from '@/lib/analytics/categoryUsage';
import { QuickReplyButtons } from '@/components/copilot/QuickReplyButtons';
import { SuggestedQuestions } from '@/components/copilot/SuggestedQuestions';
import { ContractCTACard } from '@/components/copilot/ContractCTACard';
import { CategoryQuestionsFlow } from '@/components/copilot/CategoryQuestionsFlow';
import { getHighPriorityQuestions, hasCategoryQuestions } from '@/lib/ai/categoryQuestions';
import type { CategoryQuestion } from '@/lib/types/categoryQuestions';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  analysis?: ProductAnalysis;
  error?: string;
  errorReason?: string;
  isLoading?: boolean;
  showCTACard?: boolean; // Flag to show contract CTA card
  categoryQuestions?: CategoryQuestion[]; // Category-specific questions to ask
  categoryQuestionAnswers?: Record<string, string>; // Answers to category questions
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading, userId } = useAuth();
  const limitHitLoggedRef = useRef(false);
  // Store category question answers for future analysis
  const categoryAnswersRef = useRef<Record<string, Record<string, string>>>({});

  // Initialize with welcome message
  useEffect(() => {
    if (!isAuthLoading && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your NexSupply sourcing assistant. I'll ask a few quick questions to understand your product, then generate a detailed landed cost and risk analysis.\n\nWhat product would you like to analyze? Select a category below or describe it in your own words.",
      }]);
      logEvent('copilot_viewed', {});
    }
  }, [isAuthLoading, messages.length]);

  // Helper to check if user has started analyzing (not just welcome message)
  const hasUserInteraction = messages.some(m => m.role === 'user' || (m.role === 'assistant' && m.id !== 'welcome' && !m.isLoading));

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickReply = async (text: string) => {
    // Directly call handleSubmit with the text
    await handleSubmit(undefined, text);
  };

  const handleNeedHelp = () => {
    // Add helpful guide message when user clicks "Not sure"
    const helpMessage: ChatMessage = {
      id: `help-${Date.now()}`,
      role: 'assistant',
      content: "No problem! You can start in any of these ways:\n\n• **Describe your product idea** in your own words\n• **Paste an Alibaba link** for instant analysis\n• **Upload a product photo** and I'll help identify it\n\nOr select one of the category examples above to get started!",
    };
    setMessages(prev => [...prev, helpMessage]);
  };

  const handleSubmit = async (e?: React.FormEvent, inputText?: string) => {
    if (e) {
      e.preventDefault();
    }
    const textToAnalyze = inputText || input.trim();
    if (!textToAnalyze || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToAnalyze.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!inputText) {
      setInput('');
    } else {
      setInput('');
    }
    setIsLoading(true);
    limitHitLoggedRef.current = false;

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Prepare request body
      const body = new FormData();
      body.append('input', userMessage.content || '');
      if (productImage) {
        body.append('image', productImage);
        setProductImage(null);
      }

      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      if (!res.ok) {
        if (data.error === 'quota_exceeded') {
          // Handle limit reached
          const errorReason = data.reason || 'unknown';
          const userType = isAuthenticated ? 'user' : 'anonymous';

          // Log limit hit (only once per attempt)
          if (!limitHitLoggedRef.current) {
            limitHitLoggedRef.current = true;
            fetch('/api/limit-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'limit_hit',
                reason: errorReason,
                userType,
                input: userMessage.content || '',
              }),
            }).catch((err) => {
              console.error('[Copilot] Failed to log limit_hit event:', err);
            });
          }

          // Add error message and limit card
          setMessages(prev => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: "I've reached my daily analysis limit for today. Don't worry—you can sign up for a free account to get more analyses, or book a consultation to discuss your sourcing needs.",
            },
            {
              id: `limit-${Date.now()}`,
              role: 'system',
              errorReason,
            },
          ]);
        } else {
          // Other errors
          setMessages(prev => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: "I had trouble analyzing that. Could you try rephrasing your product description? You can also paste an Alibaba link or upload a photo if that helps.",
              error: data.message || data.error || 'Analysis failed',
            },
          ]);
        }
      } else {
        // Success - Triple-step pattern: summary, analysis card, follow-up
        const analysis = data.analysis as ProductAnalysis;

        // Extract category ID from compliance hints if available
        const categoryId = analysis.compliance_hints?.id;

        // Log category usage for analytics (fire-and-forget)
        const usageEvent = buildCategoryUsageEvent(
          userMessage.content || '',
          analysis,
          categoryId
        );
        logCategoryUsage(usageEvent).catch(err => {
          console.error('[Copilot] Failed to log category usage:', err);
        });

        // Check if we have category-specific questions
        const categoryQuestions = categoryId && hasCategoryQuestions(categoryId)
          ? getHighPriorityQuestions(categoryId)
          : [];

        // Build summary text
        const summary = buildAnalysisSummary(analysis);
        const followUp = getFollowUpQuestion(analysis);
        const now = Date.now();

        // Build messages array
        const newMessages: ChatMessage[] = [
          {
            id: `summary-${now}`,
            role: 'assistant',
            content: summary,
          },
          {
            id: `analysis-${now}`,
            role: 'assistant',
            analysis,
          },
          {
            id: `followup-${now}`,
            role: 'assistant',
            content: followUp,
          },
        ];

        // Add category questions if available (before CTA)
        if (categoryQuestions.length > 0) {
          newMessages.push({
            id: `category-questions-${now}`,
            role: 'assistant',
            categoryQuestions,
          });
        }

        // Add CTA card
        newMessages.push({
          id: `cta-${now}`,
          role: 'assistant',
          showCTACard: true,
          analysis,
        });

        // Add all messages
        setMessages(prev => [...prev, ...newMessages]);

        // Log event
        logEvent('copilot_analysis_completed', {
          source: 'copilot',
          has_compliance_hints: !!analysis.compliance_hints,
          has_factory_vetting: !!analysis.factory_vetting_hints,
        });
      }
    } catch (err) {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Something went wrong on my end. Please try again in a moment, or describe your product differently.",
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildAnalysisSummary = (analysis: ProductAnalysis): string => {
    const { product_name, landed_cost_breakdown, risk_assessment, testing_cost_estimate, regulation_reasoning } = analysis;
    const riskLevel = risk_assessment.overall_score >= 80 ? 'Low' : risk_assessment.overall_score >= 60 ? 'Medium' : 'High';
    
    // Build concise 2-4 line conversational summary
    let summary = `I've analyzed **${product_name}**. The estimated landed cost is **${landed_cost_breakdown.landed_cost}**, with a **${riskLevel} Risk** score (${risk_assessment.overall_score}/100).`;

    // Add key risk insight (one sentence)
    const primaryRisk = 
      risk_assessment.compliance_risk === 'High' ? 'compliance' :
      risk_assessment.supplier_risk === 'High' ? 'supplier reliability' :
      risk_assessment.logistics_risk === 'High' ? 'logistics' :
      null;
    
    if (primaryRisk) {
      summary += ` The main concern is ${primaryRisk} risk.`;
    }

    // Add testing requirement mention if applicable (2nd paragraph)
    if (testing_cost_estimate && testing_cost_estimate.length > 0) {
      const totalLow = testing_cost_estimate.reduce((sum, t) => sum + t.low, 0);
      const totalHigh = testing_cost_estimate.reduce((sum, t) => sum + t.high, 0);
      summary += `\n\nThis product requires mandatory lab testing (estimated $${totalLow}-$${totalHigh}) to meet compliance standards.`;
    } else if (regulation_reasoning && regulation_reasoning.length > 0) {
      summary += `\n\nStandard import requirements apply with no major testing hurdles expected.`;
    }

    return summary;
  };

  const getFollowUpQuestion = (analysis: ProductAnalysis): string => {
    const { risk_assessment, testing_cost_estimate, landed_cost_breakdown, compliance_hints } = analysis;
    
    // Priority 1: High compliance risk or testing needed
    if (risk_assessment.compliance_risk === 'High' || (testing_cost_estimate && testing_cost_estimate.length > 0)) {
      if (testing_cost_estimate && testing_cost_estimate.length > 3) {
        return "Should we estimate a detailed lab testing budget for your launch? This product will need multiple certifications.";
      }
      return "Should we estimate a detailed lab testing budget for your launch?";
    }

    // Priority 2: High supplier risk
    if (risk_assessment.supplier_risk === 'High') {
      return "Do you want me to help you find a pre-vetted supplier with better credentials?";
    }

    // Priority 3: High logistics risk
    if (risk_assessment.logistics_risk === 'High') {
      return "Shipping costs look volatile. Should we compare freight rates from different ports?";
    }

    // Priority 4: High duty rate (check if duty cost is significant)
    const dutyRateMatch = landed_cost_breakdown.duty_rate.match(/(\d+)/);
    if (dutyRateMatch && parseInt(dutyRateMatch[1]) > 15) {
      return "The duty rate is quite high. Do you want to compare this with a non-China supplier to see if we can lower costs?";
    }

    // Priority 5: Has compliance hints but low risk
    if (compliance_hints) {
      return "This looks like a solid opportunity. Do you want to dive deeper into compliance requirements or start sourcing quotes?";
    }

    // Default conversation starter
    return "Want to explore other sourcing options or refine this analysis further?";
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProductImage(file);
  };

  const handleLimitCardClick = (action: 'primary' | 'secondary', errorReason: string) => {
    const userType = isAuthenticated ? 'user' : 'anonymous';
    const input = messages.find(m => m.role === 'user')?.content || '';

    fetch('/api/limit-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: action === 'primary' ? 'cta_primary_click' : 'cta_secondary_click',
        reason: errorReason,
        userType,
        input,
      }),
    }).catch((err) => {
      console.error('[Copilot] Failed to log CTA click:', err);
    });
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SignInModal open={showSignInModal} onClose={() => setShowSignInModal(false)} />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <Card className="max-w-md w-full text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome to NexSupply Copilot</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to start analyzing product sourcing opportunities.
            </p>
            <Button onClick={() => setShowSignInModal(true)} size="lg" className="w-full">
              Sign In to Continue
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {showSignInModal && <SignInModal open={showSignInModal} onClose={() => setShowSignInModal(false)} />}
      <div className="flex flex-col h-screen max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-subtle-border p-4 sm:p-6">
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity inline-block">
            <h1 className="text-2xl font-bold">NexSupply Copilot</h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-1.5">
            I'll ask 3-5 quick questions about your product, then generate a comprehensive landed cost and risk report. Just describe your product or paste an Alibaba link to get started.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {messages.map((message, messageIndex) => {
            // Determine if this and next message are part of same triple-step response
            const nextMessage = messageIndex < messages.length - 1 ? messages[messageIndex + 1] : null;
            const isTripleStep = message.id?.startsWith('summary-') || 
                                message.id?.startsWith('analysis-') || 
                                message.id?.startsWith('followup-');
            const isNextTripleStep = nextMessage && (
              nextMessage.id?.startsWith('summary-') || 
              nextMessage.id?.startsWith('analysis-') || 
              nextMessage.id?.startsWith('followup-')
            );
            
            // Check if same timestamp (same analysis response)
            const currentTimestamp = isTripleStep ? message.id.split('-').slice(1).join('-') : null;
            const nextTimestamp = isNextTripleStep && nextMessage ? nextMessage.id.split('-').slice(1).join('-') : null;
            const areRelated = currentTimestamp && nextTimestamp && currentTimestamp === nextTimestamp;
            
            // Reduce spacing for related messages in triple-step pattern
            const spacingClass = areRelated ? 'mb-1.5' : 
                                message.role === 'user' || (nextMessage && nextMessage.role === 'user') ? 'mb-4' :
                                'mb-3';

            if (message.isLoading) {
              return (
                <div key={message.id} className={spacingClass}>
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-lg bg-surface border border-subtle-border">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            }

            if (message.role === 'user') {
              return (
                <div key={message.id} className={spacingClass}>
                  <div className="flex justify-end">
                    <div className="px-4 py-3 rounded-lg bg-primary text-black max-w-[85%] sm:max-w-lg">
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (message.role === 'assistant') {
              const isFollowUp = message.id?.startsWith('followup-');
              const isSummary = message.id?.startsWith('summary-');
              const isWelcome = message.id === 'welcome';
              
              return (
                <div key={message.id} className={spacingClass}>
                  {message.content && (
                    <div className="flex justify-start">
                      <div className={`px-4 py-3 rounded-lg max-w-[85%] sm:max-w-lg ${
                        isFollowUp 
                          ? 'bg-primary/5 border border-primary/20' 
                          : 'bg-surface border border-subtle-border'
                      }`}>
                        <p className={`whitespace-pre-wrap break-words leading-relaxed ${
                          isFollowUp ? 'text-sm text-foreground italic' : 'text-sm leading-relaxed'
                        }`}>
                          {message.content.split('**').map((part, i) => 
                            i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part
                          )}
                        </p>
                        {/* Show quick reply buttons and suggested questions only on welcome message */}
                        {isWelcome && !hasUserInteraction && (
                          <div className="mt-4">
                            <QuickReplyButtons 
                              onSelect={handleQuickReply} 
                              onNeedHelp={handleNeedHelp}
                              disabled={isLoading} 
                            />
                            <SuggestedQuestions onSelect={handleQuickReply} disabled={isLoading} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {message.analysis && (
                    <div className="max-w-full">
                      <ProductAnalysisCard analysis={message.analysis} />
                    </div>
                  )}
                  {message.categoryQuestions && message.categoryQuestions.length > 0 && (
                    <div className="max-w-full mt-4">
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground">
                          To provide a more accurate analysis, I have a few additional questions about this product category:
                        </p>
                      </div>
                      <CategoryQuestionsFlow
                        questions={message.categoryQuestions}
                        onComplete={(answers) => {
                          // Update the message with answers
                          setMessages(prev => prev.map(msg => 
                            msg.id === message.id
                              ? { ...msg, categoryQuestionAnswers: answers }
                              : msg
                          ));
                          // Store answers for future reference
                          const categoryId = message.analysis?.compliance_hints?.id;
                          if (categoryId) {
                            categoryAnswersRef.current[categoryId] = answers;
                          }

                          // Log the answers
                          logEvent('category_questions_answered', {
                            category_id: categoryId,
                            question_count: message.categoryQuestions?.length || 0,
                            answer_count: Object.keys(answers).length,
                            answers: answers, // Store full answers for future analysis
                          });

                          // Show confirmation message
                          setMessages(prev => [
                            ...prev,
                            {
                              id: `category-answers-thanks-${Date.now()}`,
                              role: 'assistant',
                              content: "Thank you for those details! I've saved your answers. This information will help me provide more accurate analysis for similar products in the future.",
                            },
                          ]);
                        }}
                        onSkip={() => {
                          const categoryId = message.analysis?.compliance_hints?.id;
                          logEvent('category_questions_skipped', {
                            category_id: categoryId,
                            question_count: message.categoryQuestions?.length || 0,
                          });
                          // Optionally remove the questions message if skipped
                          // setMessages(prev => prev.filter(msg => msg.id !== message.id));
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  {message.showCTACard && message.analysis && (
                    <div className="max-w-full mt-4">
                      <ContractCTACard
                        bookingUrl={process.env.NEXT_PUBLIC_BOOKING_URL}
                        contractUrl={process.env.NEXT_PUBLIC_CONTRACT_URL}
                        onBookingClick={() => {
                          logEvent('cta_booking_click', {
                            source: 'copilot',
                            product_name: message.analysis?.product_name,
                          });
                        }}
                        onContractClick={() => {
                          logEvent('cta_contract_click', {
                            source: 'copilot',
                            product_name: message.analysis?.product_name,
                          });
                        }}
                      />
                    </div>
                  )}
                  {message.error && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 max-w-[85%] sm:max-w-lg">
                        <p className="text-sm text-destructive">{message.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (message.role === 'system' && message.errorReason) {
              return (
                <div key={message.id} className="mb-4">
                  <LimitReachedCard
                    variant={message.errorReason === 'anonymous_daily_limit' ? 'anonymous' : 'user'}
                    alphaSignupUrl={process.env.NEXT_PUBLIC_ALPHA_SIGNUP_URL}
                    bookingUrl={process.env.NEXT_PUBLIC_BOOKING_URL}
                    onPrimaryClick={() => handleLimitCardClick('primary', message.errorReason!)}
                    onSecondaryClick={() => handleLimitCardClick('secondary', message.errorReason!)}
                  />
                </div>
              );
            }

            return null;
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-subtle-border p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer or tap one of the options above..."
                className="w-full h-12 pl-12 pr-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <Camera className="h-5 w-5 text-muted-foreground" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          {productImage && (
            <p className="text-xs text-muted-foreground mt-2">
              Image attached: {productImage.name}
            </p>
          )}
          {/* Show suggested questions below input when no user interaction yet */}
          {!hasUserInteraction && messages.length > 0 && (
            <SuggestedQuestions onSelect={handleQuickReply} disabled={isLoading} />
          )}
        </div>
      </div>
    </>
  );
}
