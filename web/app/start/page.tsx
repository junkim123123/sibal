'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NexSupplyAIReportV2 } from '@/lib/types/ai-report';

interface Answers {
  businessType?: string;
  productCategory?: string;
  productDescription?: string;
  targetMarket?: string;
  volume?: string;
  email?: string;
  companyName?: string;
  additionalNotes?: string;
}

export default function StartPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showThanks, setShowThanks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReport, setAiReport] = useState<NexSupplyAIReportV2 | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalSteps = 4;

  const steps = [
    {
      id: 'intro',
      type: 'message',
      content: '👋 Welcome to NexSupply. Let\'s plan your next import.\n\nWe\'ll start with a few quick questions about your business and product.\nIt should take less than a minute.',
    },
    {
      id: 'businessType',
      type: 'question',
      question: 'Which best describes your business?',
      options: [
        'Amazon FBA private label',
        'Shopify / DTC brand',
        'Retail / wholesale buyer',
        'Importer / trading company',
        'I\'m just exploring',
      ],
    },
    {
      id: 'product',
      type: 'question',
      question: 'Great. What product are you thinking about?\n\nYou can share a link, a short description, or pick a category.',
      options: [
        'Snacks / confectionery',
        'Beverages',
        'Toys / novelties',
        'Household goods',
        'Seasonal / character goods',
        'Other light consumer products',
      ],
      hasInput: true,
      inputPlaceholder: 'Paste an Amazon / Shopify / Alibaba link or describe your product',
    },
    {
      id: 'market',
      type: 'question',
      question: 'Where will you sell this product, and at what scale?',
      options: [
        'US – Amazon FBA',
        'US – Retail / wholesale',
        'Korea / Japan',
        'Other markets',
      ],
    },
    {
      id: 'volume',
      type: 'question',
      question: 'What volume are you considering for your first test order?',
      options: [
        'Under 1 pallet (test only)',
        '1–3 pallets',
        '1 container +',
        'Not sure yet',
      ],
    },
    {
      id: 'contact',
      type: 'form',
      question: 'Last step – how can we follow up with a concrete quote or next steps?',
      fields: [
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'companyName', label: 'Company or brand name', type: 'text', required: false },
        { id: 'additionalNotes', label: 'Anything else we should know?', type: 'textarea', required: false },
      ],
    },
  ];

  useEffect(() => {
    // Auto-advance from intro message
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setCurrentStep(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    // Auto-scroll to bottom when new message appears
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep, answers, showThanks]);

  const handleOptionSelect = (stepId: string, value: string) => {
    // For product step, check if it's a category or description
    if (stepId === 'product') {
      const isCategory = steps[2].options?.includes(value);
      const newAnswers = {
        ...answers,
        [isCategory ? 'productCategory' : 'productDescription']: value,
        product: value, // For display
      };
      setAnswers(newAnswers);
    } else {
      const newAnswers = { ...answers, [stepId]: value };
      setAnswers(newAnswers);
    }

    // Show user's selection as a message
    setTimeout(() => {
      // Move to next step
      if (stepId === 'businessType') {
        setCurrentStep(2); // product step
      } else if (stepId === 'product') {
        setCurrentStep(3); // market step
      } else if (stepId === 'market') {
        setCurrentStep(4); // volume step
      } else if (stepId === 'volume') {
        setCurrentStep(5); // contact form step
      }
    }, 300);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setAnswers({ ...answers, [fieldId]: value });
  };

  const handleFormSubmit = async () => {
    if (!answers.email) {
      return; // Email is required
    }

    setIsSubmitting(true);

    // Collect all answers into JSON
    const submissionData = {
      businessType: answers.businessType || '',
      productCategory: answers.productCategory,
      productDescription: answers.productDescription,
      targetMarket: answers.market,
      volumePlan: answers.volume,
      email: answers.email,
      companyName: answers.companyName,
      extraNote: answers.additionalNotes,
    };

    try {
      const response = await fetch('/api/start-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.ok) {
        setLeadId(result.leadId);
        if (result.aiReport) {
          setAiReport(result.aiReport);
        }
        setShowThanks(true);
      } else {
        // Show error message
        console.error('Submission failed:', result.error);
        setShowThanks(true); // Still show thanks, but without AI report
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setShowThanks(true); // Still show thanks, but without AI report
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.push('/');
    } else if (currentStep === 1) {
      setCurrentStep(0);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    }
  };

  const getProgressPercentage = () => {
    if (currentStep === 0) return 0;
    if (currentStep <= 5) return ((currentStep) / totalSteps) * 100;
    return 100;
  };

  const renderStep = (stepIndex: number) => {
    if (stepIndex === 0) {
      const step = steps[0];
      return (
        <div key="intro" className="flex justify-start mb-6">
          <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-6 py-4">
            <p className="text-neutral-900 whitespace-pre-line leading-relaxed">
              {step.content}
            </p>
          </div>
        </div>
      );
    }

    if (stepIndex >= 1 && stepIndex <= 5) {
      const step = steps[stepIndex];
      
      // Show question bubble
      const questionBubble = (
        <div key={`question-${stepIndex}`} className="flex justify-start mb-4">
          <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-6 py-4">
            <p className="text-neutral-900 whitespace-pre-line leading-relaxed">
              {step.question}
            </p>
          </div>
        </div>
      );

      // Show user's answer if selected
      let answerBubble = null;
      if (step.id === 'product' && (answers.productCategory || answers.productDescription)) {
        answerBubble = (
          <div key={`answer-${stepIndex}`} className="flex justify-end mb-4">
            <div className="max-w-[85%] rounded-2xl bg-neutral-700 text-white px-6 py-3">
              <p className="text-sm">{answers.productCategory || answers.productDescription}</p>
            </div>
          </div>
        );
      } else if (answers[step.id as keyof Answers]) {
        answerBubble = (
          <div key={`answer-${stepIndex}`} className="flex justify-end mb-4">
            <div className="max-w-[85%] rounded-2xl bg-neutral-700 text-white px-6 py-3">
              <p className="text-sm">{answers[step.id as keyof Answers]}</p>
            </div>
          </div>
        );
      }

      // Show options or form
      let optionsOrForm = null;
      const hasAnswer = step.id === 'product' 
        ? (answers.productCategory || answers.productDescription)
        : answers[step.id as keyof Answers];
      
      if (step.type === 'question' && !hasAnswer) {
        optionsOrForm = (
          <div key={`options-${stepIndex}`} className="mb-6">
            <div className="flex flex-wrap gap-3">
              {step.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(step.id, option)}
                  className="px-6 py-3 rounded-full bg-[#FBF3E5] text-neutral-900 font-medium hover:bg-[#F5E6D3] transition-colors text-sm"
                >
                  {option}
                </button>
              ))}
            </div>
            {step.hasInput && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder={step.inputPlaceholder}
                  value={answers.productDescription || ''}
                  onChange={(e) => handleInputChange('productDescription', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleOptionSelect('product', e.currentTarget.value);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 text-sm"
                />
                {answers.productDescription && !answers.productCategory && (
                  <button
                    onClick={() => handleOptionSelect('product', answers.productDescription)}
                    className="mt-3 px-6 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Continue
                  </button>
                )}
              </div>
            )}
          </div>
        );
      } else if (step.type === 'form' && stepIndex === 5) {
        optionsOrForm = (
          <div 
            key={`form-${stepIndex}`} 
            className="mb-6 space-y-4"
            onKeyDown={(e) => {
              // Prevent form submission on any key except explicit button click
              // Only allow Enter on email field when it's focused
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type === 'email') {
                // Allow Enter to submit only if email is valid
                if (answers.email && answers.email.includes('@')) {
                  e.preventDefault();
                  handleFormSubmit();
                }
              } else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
                // Prevent default form submission for other Enter presses
                e.preventDefault();
              }
            }}
          >
            {step.fields?.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={answers[field.id as keyof Answers] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.label}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 text-sm resize-none"
                  />
                ) : (
                  <input
                    type={field.type === 'email' ? 'email' : field.type}
                    inputMode={field.type === 'email' ? 'email' : undefined}
                    autoComplete={field.type === 'email' ? 'email' : undefined}
                    name={field.id}
                    id={field.id}
                    value={answers[field.id as keyof Answers] || ''}
                    onChange={(e) => {
                      // Allow free typing - no auto-submit
                      handleInputChange(field.id, e.target.value);
                    }}
                    placeholder={field.label}
                    required={field.required}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 text-sm"
                  />
                )}
              </div>
            ))}
            <Button
              onClick={handleFormSubmit}
              disabled={!answers.email || isSubmitting}
              className="w-full sm:w-auto mt-4"
              type="button"
            >
              {isSubmitting ? 'Processing...' : 'Start Sourcing'}
            </Button>
          </div>
        );
      }

      return (
        <div key={`step-${stepIndex}`}>
          {questionBubble}
          {answerBubble}
          {optionsOrForm}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header with progress bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 mx-4">
              <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {/* Render all steps up to current step */}
          {Array.from({ length: currentStep + 1 }).map((_, idx) => renderStep(idx))}
          
          {/* Show thanks message */}
          {showThanks && (
            <>
              <div className="flex justify-start mb-6">
                <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-6 py-4">
                  <p className="text-neutral-900 leading-relaxed">
                    Thanks! We've received your project details.
                    <br /><br />
                    {aiReport ? (
                      <>
                        Here's a quick AI estimate based on what you shared.
                        <br />
                        These numbers are directional only, not a formal quote.
                      </>
                    ) : (
                      <>
                        We've saved your project details. Our team will review them and follow up with suggested landed costs, risks, and next steps for your product via email.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* AI Report Card - Quick Snapshot */}
              {aiReport && (
                <div className="flex justify-start mb-6">
                  <div className="max-w-[85%] rounded-2xl bg-neutral-900 text-white px-6 py-6">
                    <h3 className="text-lg font-semibold mb-4">NexSupply AI – Quick DDP / Risk Snapshot</h3>
                    
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-semibold mb-1">Estimated DDP per unit</p>
                        <p className="text-neutral-200">
                          ${aiReport.costOverview.ddpPerUnitRange.low.toFixed(2)} – ${aiReport.costOverview.ddpPerUnitRange.high.toFixed(2)} to {aiReport.meta.targetMarket}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold mb-1">Risk level</p>
                        <p className="text-neutral-200 capitalize">
                          {aiReport.riskAnalysis.overallRiskLevel}
                          {aiReport.riskAnalysis.mustCheckBeforeOrder.length > 0 && (
                            <span>, mainly {aiReport.riskAnalysis.mustCheckBeforeOrder[0].toLowerCase()}</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">Key drivers</p>
                        <ul className="space-y-1 text-neutral-200">
                          {aiReport.costOverview.mainCostDrivers.slice(0, 3).map((driver, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{driver}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {aiReport.riskAnalysis.mustCheckBeforeOrder.length > 0 && (
                        <div>
                          <p className="font-semibold mb-2">Before you order</p>
                          <ul className="space-y-1 text-neutral-200">
                            {aiReport.riskAnalysis.mustCheckBeforeOrder.slice(0, 2).map((check, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{check}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 mt-4 pt-4 border-t border-neutral-700">
                      NexSupply AI is in alpha. Estimates are directional only and may change after detailed sourcing.
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              {aiReport && leadId && (
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    onClick={() => router.push(`/analyze?leadId=${leadId}`)}
                    variant="primary"
                    className="rounded-full"
                  >
                    View full AI report
                  </Button>
                  <Button
                    onClick={() => router.push('/contact')}
                    variant="outline"
                    className="rounded-full bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                  >
                    Book a call
                  </Button>
                </div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

