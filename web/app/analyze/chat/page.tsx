/**
 * Dr B style conversational intake flow for Nexi.ai
 * 
 * This is a chat-based interface that asks structured questions
 * one at a time, then shows a summary before proceeding to analysis.
 * 
 * TODO: Integrate with Nexi analysis API
 * TODO: Persist conversation to database
 * TODO: Add support for file uploads (images, links)
 */

'use client';

import { useState, useRef, useEffect, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QUESTION_FLOW, getQuestionById, getNextQuestionId, type QuestionNode } from '@/lib/analyze/questionFlow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Send, CheckCircle2 } from 'lucide-react';
import { loadOnboardingState } from '@/lib/onboardingStorage';
import type { OnboardingState } from '@/lib/types/onboarding';
import { getChannelLabel, getMarketLabel } from '@/lib/types/onboarding';
import { getOnboardingContextForAnalysis } from '@/lib/onboardingHelpers';
import type { ProductIntake } from '@/lib/types/productIntake';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: ReactNode;
};

type Answers = Record<string, any>;

function AnalyzeChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams?.get('leadId') || null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('q1');
  const [answers, setAnswers] = useState<Answers>({});
  const [draftAnswer, setDraftAnswer] = useState<any>('');
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [leadDataLoaded, setLeadDataLoaded] = useState(false);

  // Load lead data if leadId is present
  useEffect(() => {
    if (leadId && !leadDataLoaded) {
      // Fetch lead data from API
      fetch(`/api/start-intake?leadId=${leadId}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.lead) {
            const lead = data.lead;
            // Pre-fill answers from lead data
            const preFilledAnswers: Answers = {};
            if (lead.productDescription) {
              preFilledAnswers.q1 = lead.productDescription;
            } else if (lead.productCategory) {
              preFilledAnswers.q1 = lead.productCategory;
            }
            setAnswers(preFilledAnswers);
            setLeadDataLoaded(true);
          }
        })
        .catch(err => {
          console.error('Failed to load lead data:', err);
        });
    }
  }, [leadId, leadDataLoaded]);

  // Load onboarding state and pre-fill answers
  useEffect(() => {
    if (isInitialized) return;

    const savedOnboarding = loadOnboardingState();
    if (savedOnboarding) {
      setOnboardingState(savedOnboarding);
      
      // Map onboarding state to Analyze form answers
      const preFilledAnswers: Answers = {};
      
      // Map main channel (q5)
      if (savedOnboarding.sellingContext.mainChannel) {
        const channel = savedOnboarding.sellingContext.mainChannel;
        // Map onboarding channel options to Analyze channel options
        const channelMap: Record<string, string> = {
          'amazon_fba': 'amazon_fba',
          'shopify_dtc': 'shopify',
          'tiktok_shop': 'tiktok',
          'retail_wholesale': 'retail',
          'b2b_distributor': 'retail', // Closest match
          'not_sure': 'multiple',
          'other': 'multiple', // Default to multiple if other
        };
        preFilledAnswers.q5 = channelMap[channel] || 'multiple';
      }
      
      // Map target markets (q6) - use first market or default to US
      if (savedOnboarding.sellingContext.targetMarkets.length > 0) {
        const firstMarket = savedOnboarding.sellingContext.targetMarkets[0];
        // Map onboarding market options to Analyze market options
        const marketMap: Record<string, string> = {
          'united_states': 'US',
          'canada': 'CA',
          'united_kingdom': 'UK',
          'europe': 'EU',
          'australia_new_zealand': 'AU',
          'japan': 'other',
          'south_korea': 'other',
          'taiwan': 'other',
          'china_mainland': 'other',
          'hong_kong': 'other',
          'philippines': 'other',
          'southeast_asia': 'other',
          'middle_east_gulf': 'other',
          'latin_america': 'other',
          'mexico': 'other',
          'multiple': 'other',
          'not_decided': 'other',
          'other': 'other',
        };
        preFilledAnswers.q6 = marketMap[firstMarket] || 'US';
      }
      
      // Map yearly volume to monthly volume (q10)
      // Rough conversion: divide yearly by 12, or use estimates
      if (savedOnboarding.yearlyVolumePlan) {
        const volumeMap: Record<string, number> = {
          'test': 50, // ~600 units/year / 12
          'small_launch': 200, // ~2400 units/year / 12
          'steady': 1000, // ~12000 units/year / 12
          'aggressive': 5000, // ~60000 units/year / 12
          'not_sure': 500, // Default estimate
        };
        preFilledAnswers.q10 = volumeMap[savedOnboarding.yearlyVolumePlan] || 500;
      }
      
      setAnswers(preFilledAnswers);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Initialize with first question
  useEffect(() => {
    if (!isInitialized) return;
    
    const firstQuestion = getQuestionById('q1');
    if (firstQuestion && messages.length === 0) {
      const welcomeContent = onboardingState ? (
        <div>
          <p className="font-semibold mb-2">Welcome back to Nexi.ai!</p>
          <p className="mb-3">I see you've already set up your project. Let me ask you a few questions about this specific product.</p>
          {onboardingState.projectName && (
            <p className="text-sm text-muted-foreground">Project: {onboardingState.projectName}</p>
          )}
        </div>
      ) : (
        <div>
          <p className="font-semibold mb-2">Welcome to Nexi.ai!</p>
          <p>I'll ask you a few quick questions to understand your product and sourcing needs. Let's get started!</p>
        </div>
      );
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
      }]);
      showQuestion(firstQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showQuestion = (question: QuestionNode, allAnswers?: Answers) => {
    // Special handling for q17 - show explanation before question
    if (question.id === 'q17') {
      setMessages(prev => [...prev, {
        id: `q17-explanation`,
        role: 'assistant',
        content: (
          <div className="space-y-3">
            <p className="font-semibold mb-2">How NexSupply Works</p>
            <div className="text-sm space-y-2 text-foreground">
              <p>NexSupply will contact you within 24 hours for a first meeting. The team will design manufacturing, packaging, and assembly together with you.</p>
              <p>NexSupply will contact factories in Asia and build a real manufacturing plan. They will send a real quote that is guaranteed for one month.</p>
              <p>NexSupply keeps working on the project with you for that month. If you want to move forward, you can start sampling. Sampling costs depend on the product and NexSupply does not add margin on the sample itself.</p>
              <p>NexSupply has teams and packing rooms across several Asian countries and manages QC, factory visits, packing, and logistics end-to-end.</p>
              <p>The fee model is a commission between 5 and 9 percent of manufacturing cost - the exact percentage is confirmed after the first consult and never exceeds that range.</p>
              <p className="font-semibold">The first consult is a small fixed fee around $10.</p>
            </div>
          </div>
        ),
      }]);
    }
    
    // Handle q15 for hesitant users - softer tone
    const isHesitant = allAnswers?.q14 && allAnswers.q14 !== 'yes_call';
    const questionText = question.id === 'q15' && isHesitant
      ? 'If you change your mind later, where would be the best place for us to reach you? (Optional)'
      : question.question;
    
    // Check if we have a pre-filled answer from onboarding
    const hasPrefilledAnswer = answers[question.id] !== undefined;
    const prefilledNote = hasPrefilledAnswer && (question.id === 'q5' || question.id === 'q6' || question.id === 'q10') 
      ? <p className="text-xs text-primary mt-2 italic">💡 Pre-filled from your onboarding settings. You can change it if needed.</p>
      : null;

    setMessages(prev => [...prev, {
      id: `question-${question.id}`,
      role: 'assistant',
      content: (
        <div>
          <p className="mb-2">{questionText}</p>
          {question.helpText && (
            <p className="text-sm text-muted-foreground mt-2">{question.helpText}</p>
          )}
          {/* Show inline note for q16 questions */}
          {(question.id === 'q16_budget' || question.id === 'q16_timeline') && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              This helps NexSupply prioritize projects and tailor the quote.
            </p>
          )}
          {prefilledNote}
        </div>
      ),
    }]);
    
    // Reset draft state, but use pre-filled answer if available
    const existingAnswer = answers[question.id];
    if (existingAnswer !== undefined) {
      if (question.inputType === 'multiChoice' && Array.isArray(existingAnswer)) {
        setSelectedChoices(existingAnswer);
      } else if (question.inputType === 'singleChoice' && typeof existingAnswer === 'string') {
        setSelectedChoices([existingAnswer]);
        setDraftAnswer(existingAnswer);
      } else {
        setDraftAnswer(existingAnswer);
      }
    } else {
      setDraftAnswer('');
      setSelectedChoices([]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const currentQuestion = getQuestionById(currentQuestionId);
    if (!currentQuestion) return;

    // Validate required fields
    if (!currentQuestion.optional && !draftAnswer && selectedChoices.length === 0) {
      return;
    }

    // Store answer
    let answerValue: any;
    
    if (currentQuestion.inputType === 'multiChoice') {
      answerValue = selectedChoices;
    } else if (currentQuestion.inputType === 'singleChoice') {
      answerValue = selectedChoices[0] || draftAnswer;
    } else if (currentQuestion.inputType === 'upload') {
      answerValue = draftAnswer; // For now, just text. TODO: Handle file uploads
    } else {
      answerValue = draftAnswer;
    }

    // Add user message
    const userContent = currentQuestion.inputType === 'singleChoice' || currentQuestion.inputType === 'multiChoice'
      ? currentQuestion.choices?.find(c => c.value === answerValue)?.label || answerValue
      : answerValue;

    setMessages(prev => [...prev, {
      id: `answer-${currentQuestionId}-${Date.now()}`,
      role: 'user',
      content: <p>{String(userContent)}</p>,
    }]);

    // Store answer (q15 should be stored as contact_info)
    const answerKey = currentQuestionId === 'q15' ? 'contact_info' : currentQuestionId;
    const newAnswers = { ...answers, [answerKey]: answerValue };
    setAnswers(newAnswers);

    // Handle summary case - show summary but don't redirect yet
    if (currentQuestionId === 'summary') {
      showSummary(newAnswers);
      return;
    }

    // Handle final_thanks case
    if (currentQuestionId === 'q17') {
      handleFinalThanks(newAnswers, answerValue);
      return;
    }

    // Get next question (pass allAnswers for conditional branching)
    const nextId = getNextQuestionId(currentQuestionId, answerValue, newAnswers);
    
    if (nextId) {
      // Handle final_thanks special case
      if (nextId === 'final_thanks') {
        handleFinalThanks(newAnswers, newAnswers.q14 || newAnswers.q17);
        return;
      }
      
      const nextQuestion = getQuestionById(nextId);
      if (nextQuestion) {
        if (nextId === 'summary') {
          showSummary(newAnswers);
        } else {
          // Add visual separator before q13 (sales consultation section)
          if (nextId === 'q13') {
            setMessages(prev => [...prev, {
              id: 'section-separator',
              role: 'assistant',
              content: (
                <div className="w-full text-center py-4">
                  <div className="border-t border-subtle-border"></div>
                </div>
              ),
            }]);
          }
          
          setCurrentQuestionId(nextId);
          setTimeout(() => showQuestion(nextQuestion, newAnswers), 300);
        }
      }
    }
  };

  const showSummary = (allAnswers: Answers) => {
    setCurrentQuestionId('summary');
    
    setMessages(prev => [...prev, {
      id: 'summary-question',
      role: 'assistant',
      content: (
        <div>
          <p className="font-semibold mb-4">Review your answers</p>
          <SummaryCard answers={allAnswers} />
        </div>
      ),
    }]);
    
    // Auto-advance to sales consultation after showing summary
    // Add a small delay to let user see the summary
    setTimeout(() => {
      const q13 = getQuestionById('q13');
      if (q13) {
        setMessages(prev => [...prev, {
          id: 'section-separator',
          role: 'assistant',
          content: (
            <div className="w-full text-center py-4">
              <div className="border-t border-subtle-border"></div>
            </div>
          ),
        }]);
        setCurrentQuestionId('q13');
        showQuestion(q13);
      }
    }, 1000);
  };

  const handleFinalThanks = async (allAnswers: Answers, lastAnswer?: any) => {
    // Mark lead intent based on answers
    const q14Answer = allAnswers.q14;
    const q17Answer = allAnswers.q17;
    const leadIntent = (q17Answer === 'yes_consult' || q14Answer === 'yes_call') 
      ? 'high_intent' 
      : 'report_only';
    
    // Add lead intent to answers
    const finalAnswers = { ...allAnswers, lead_intent: leadIntent };
    setAnswers(finalAnswers);
    
    // Determine contact message
    const willBeContacted = q17Answer === 'yes_consult' || q14Answer === 'yes_call';
    
    // Show loading message while running analysis
    setMessages(prev => [...prev, {
      id: 'analyzing',
      role: 'assistant',
      content: (
        <div className="space-y-2">
          <p className="font-semibold mb-2">Analyzing your product...</p>
          <p className="text-sm text-muted-foreground">This will just take a moment.</p>
        </div>
      ),
    }]);
    
    // Run the product analysis with onboarding context
    await handleRunAnalysis(finalAnswers);
    
    // Show thank you message after analysis
    setMessages(prev => [...prev, {
      id: 'final-thanks',
      role: 'assistant',
      content: (
        <div className="space-y-3">
          <p className="font-semibold mb-2">Thank you!</p>
          <div className="text-sm space-y-2 text-foreground">
            {willBeContacted ? (
              <p>Great! The NexSupply team will contact you within 24 hours to schedule your consultation.</p>
            ) : (
              <p>Thank you for your interest! We've saved your analysis.</p>
            )}
            <p>You can always come back and analyze another product anytime.</p>
          </div>
        </div>
      ),
    }]);
    
    // TODO: Post lead data to API/CRM
    // TODO: Send email/notification to NexSupply team
    // TODO: Process payment if q17 answer is 'yes_consult'
  };

  const handleRunAnalysis = async (allAnswers: Answers) => {
    // Extract product input from answers (q1 is the product description)
    const productInput = allAnswers.q1 || '';
    if (!productInput) {
      console.error('[AnalyzeChat] No product input found in answers');
      return;
    }

    try {
      // Get onboarding context for API request
      const onboardingContext = getOnboardingContextForAnalysis(onboardingState);

      // Answers + Onboarding -> ProductIntake mapping
      const intake: ProductIntake = {
        projectName: onboardingContext?.projectName,

        // Channel / Market (onboarding or current session)
        mainChannel: onboardingContext?.mainChannel,
        destinationMarket: allAnswers.q6 || onboardingContext?.targetMarkets?.[0],
        sourceCountry: allAnswers.q7,

        // Product Description
        productName: allAnswers.q1,
        category: allAnswers.q2,
        oneLineDescription: allAnswers.q3,
        productStage: allAnswers.q4,

        // Trade Terms / Strategy
        tradeTerm: allAnswers.q8,
        speedVsCost: allAnswers.q9,
        monthlyVolume: allAnswers.q10 ? Number(allAnswers.q10) : undefined,
        riskTolerance: allAnswers.q11,

        // Other
        specialRequirements: allAnswers.q12,
      };

      // Call the product analysis API with onboarding context and intake
      const requestBody: any = {
        input: productInput,
        onboarding_context: onboardingContext,
        intake,
      };

      // Add image if available (from q1 upload)
      // TODO: Handle image upload properly when implemented

      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        // Try to parse error response, but handle gracefully if it fails
        let errorMessage = 'Analysis failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        console.error('[AnalyzeChat] Analysis failed:', errorMessage);
        // Still navigate to results page with answers
        const params = new URLSearchParams();
        Object.entries(allAnswers).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          }
        });
        router.push(`/results?${params.toString()}`);
        return;
      }

      const data = await res.json();

      // Analysis successful - navigate to results with both answers and analysis
      const params = new URLSearchParams();
      Object.entries(allAnswers).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      // Add analysis result
      params.append('analysis', JSON.stringify(data.analysis));
      router.push(`/results?${params.toString()}`);
    } catch (error) {
      console.error('[AnalyzeChat] Failed to run analysis:', error);
      // Fallback: navigate to results page with answers only
      const params = new URLSearchParams();
      Object.entries(allAnswers).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      router.push(`/results?${params.toString()}`);
    }
  };

  const currentQuestion = getQuestionById(currentQuestionId);
  const isSummary = currentQuestionId === 'summary';

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background">
      {/* Header */}
      <div className="border-b border-subtle-border p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Product Analysis Intake</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentQuestion?.step || 0} of {QUESTION_FLOW.length}
            </p>
          </div>
          {/* Project Summary from Onboarding */}
          {onboardingState && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Project Summary</div>
              {onboardingState.projectName && (
                <div className="text-sm font-medium text-foreground">{onboardingState.projectName}</div>
              )}
              {onboardingState.sellingContext.mainChannel && (
                <div className="text-xs text-muted-foreground mt-1">
                  Channel: {getChannelLabel(onboardingState.sellingContext.mainChannel)}
                  {onboardingState.sellingContext.mainChannel === 'other' && onboardingState.sellingContext.mainChannelOtherText && (
                    <span> ({onboardingState.sellingContext.mainChannelOtherText})</span>
                  )}
                </div>
              )}
              {onboardingState.sellingContext.targetMarkets.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Markets: {onboardingState.sellingContext.targetMarkets.slice(0, 2).map(m => getMarketLabel(m)).join(', ')}
                  {onboardingState.sellingContext.targetMarkets.length > 2 && '...'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-lg rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-black'
                  : 'bg-surface border border-subtle-border text-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Current question input */}
        {currentQuestion && !isSummary && (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-lg w-full">
                {renderInput(currentQuestion)}
              </div>
            </div>
          </form>
        )}

        {/* Summary no longer has action button - auto-advances to sales consultation */}

        <div ref={messagesEndRef} />
      </div>

      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setDraftAnswer(file.name);
          }
        }}
      />
    </div>
  );

  function renderInput(question: QuestionNode) {
    switch (question.inputType) {
      case 'text':
        return (
          <div className="space-y-3">
            <textarea
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full min-h-[100px] p-3 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              required={!question.optional}
            />
            <div className="flex gap-2">
              {question.optional && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Skip this question
                    const newAnswers = { ...answers, [question.id]: null };
                    setAnswers(newAnswers);
                    
                    // Use the same logic as handleSubmit to determine next question
                    const skipAnswer = question.optional ? null : '';
                    const nextId = getNextQuestionId(question.id, skipAnswer, newAnswers);
                    
                    if (nextId) {
                      if (nextId === 'final_thanks') {
                        handleFinalThanks(newAnswers);
                        return;
                      }
                      const nextQuestion = getQuestionById(nextId);
                      if (nextQuestion) {
                        setCurrentQuestionId(nextId);
                        setTimeout(() => showQuestion(nextQuestion, newAnswers), 300);
                      }
                    } else {
                      // No next question, go to final thanks
                      handleFinalThanks(newAnswers);
                    }
                  }}
                  className="flex-1"
                >
                  Skip
                </Button>
              )}
              <Button 
                type="submit" 
                className={question.optional ? "flex-1" : "w-full"}
                disabled={!question.optional && !draftAnswer.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-3">
            <input
              type="number"
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              placeholder="Enter a number..."
              className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required={!question.optional}
            />
            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
        );

      case 'singleChoice':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {question.choices?.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => {
                    setSelectedChoices([choice.value]);
                    setDraftAnswer(choice.value);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedChoices.includes(choice.value)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-subtle-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-foreground'
                  }`}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <Button
              type="submit"
              disabled={selectedChoices.length === 0}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>
        );

      case 'multiChoice':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {question.choices?.map((choice) => (
                <label
                  key={choice.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedChoices.includes(choice.value)
                      ? 'border-primary bg-primary/10'
                      : 'border-subtle-border bg-surface hover:border-primary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChoices.includes(choice.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedChoices([...selectedChoices, choice.value]);
                      } else {
                        setSelectedChoices(selectedChoices.filter(v => v !== choice.value));
                      }
                    }}
                    className="mr-3"
                  />
                  <span className="text-foreground">{choice.label}</span>
                </label>
              ))}
            </div>
            <Button
              type="submit"
              disabled={selectedChoices.length === 0}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-3">
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <textarea
                value={draftAnswer}
                onChange={(e) => setDraftAnswer(e.target.value)}
                placeholder="Or paste a link or describe your product..."
                className="w-full min-h-[100px] p-3 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                required={!question.optional && !draftAnswer}
              />
            </div>
            <Button
              type="submit"
              disabled={!draftAnswer && !question.optional}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>
        );

      default:
        return null;
    }
  }
}

export default function AnalyzeChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyzeChatPageContent />
    </Suspense>
  );
}

function SummaryCard({ answers }: { answers: Answers }) {
  const questions = QUESTION_FLOW.filter(q => q.id !== 'summary');
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {questions.map((q) => {
          const answer = answers[q.id];
          if (!answer && q.optional) return null;
          
          const displayAnswer = q.inputType === 'singleChoice' || q.inputType === 'multiChoice'
            ? Array.isArray(answer)
              ? q.choices?.filter(c => answer.includes(c.value)).map(c => c.label).join(', ')
              : q.choices?.find(c => c.value === answer)?.label || answer
            : answer;

          return (
            <div key={q.id} className="border-b border-subtle-border pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-foreground mb-1">{q.question}</p>
              <p className="text-sm text-muted-foreground">
                {displayAnswer || <span className="italic">Not answered</span>}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

