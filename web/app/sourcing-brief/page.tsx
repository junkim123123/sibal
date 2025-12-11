/**
 * Sourcing Brief - Hybrid Chat-Form Experience
 * 
 * Phase 1 MVP: Welcome, Section A (Product Basics), Section D (Contact), Submit
 * 
 * This interface collects product sourcing information through a conversational
 * flow with form-like input cards.
 * 
 * Layout Structure:
 * - Top Header: NexSupply logo, progress indicator
 * - Main Chat Area: Scrollable message timeline (bot bubbles on left, user bubbles on right)
 * - Right Side Panel: Summary panel with collected information (desktop)
 * - Bottom Input Area: Dynamic input based on current step
 */

'use client';

import { useState, useRef, useEffect, ReactNode, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Send, Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sourcingBriefSteps, getStepById, getNextStep, getFirstStep } from './sourcingBriefSteps';
import type { SourcingBriefStep } from '@/lib/types/sourcingBriefSteps';
import type { SourcingBriefState, QuantityRange, PackagingType, Incoterms, TemperatureHandling, Certification } from '@/lib/types/sourcingBrief';
import { getQuantityLabel, getPackagingLabel, getIncotermsLabel, getTemperatureLabel, getCertificationLabel } from '@/lib/types/sourcingBrief';
import { GenericChipGroup } from '@/components/chat/GenericChipGroup';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string | ReactNode;
  isTyping?: boolean;
};

function SourcingBriefPageContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [briefState, setBriefState] = useState<SourcingBriefState>({
    completedSections: [],
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load resume state if token provided
  useEffect(() => {
    const resumeToken = searchParams?.get('resume');
    if (resumeToken && messages.length === 0) {
      loadResumeState(resumeToken);
    } else if (messages.length === 0) {
      const firstStep = getFirstStep();
      setCurrentStepId(firstStep.id);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: firstStep.nexMessage,
        isTyping: false,
      }]);
    }
  }, [searchParams]);

  // Auto-scroll to bottom when messages change (모바일에서는 조건부로만)
  useEffect(() => {
    // 모바일 감지
    const isMobile = window.innerWidth < 768;
    
    // 모바일에서는 입력 필드가 포커스되어 있지 않을 때만 스크롤
    if (isMobile) {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                            activeElement?.tagName === 'TEXTAREA' ||
                            activeElement?.getAttribute('contenteditable') === 'true';
      
      // 입력 필드가 포커스되어 있으면 스크롤하지 않음
      if (isInputFocused) {
        return;
      }
      
      // 사용자가 이미 하단 근처에 있는지 확인
      const container = messagesEndRef.current?.parentElement?.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (!isNearBottom) {
          // 사용자가 위쪽을 보고 있으면 자동 스크롤하지 않음
          return;
        }
      }
    }
    
    const timeoutId = setTimeout(() => {
      // 모바일에서는 scrollIntoView 대신 scrollTop 사용 (더 부드럽게)
      if (isMobile) {
        const container = messagesEndRef.current?.parentElement?.parentElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, currentStepId]);

  // Load product suggestions when product_name input changes
  useEffect(() => {
    if (currentStepId === 'product_name' && input.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        fetchProductSuggestions(input);
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setProductSuggestions([]);
    }
  }, [input, currentStepId]);

  // Get current step
  const currentStep: SourcingBriefStep | undefined = currentStepId ? getStepById(currentStepId) : undefined;

  // Compute progress
  const totalSteps = sourcingBriefSteps.filter(s => s.section !== 'welcome' && s.section !== 'review').length;
  const currentStepIndex = currentStep 
    ? sourcingBriefSteps.filter(s => s.section !== 'welcome' && s.section !== 'review')
        .findIndex(s => s.id === currentStep.id)
    : -1;
  const completedSteps = currentStepIndex + 1;

  /**
   * Check if current step is complete
   */
  const isCurrentStepComplete = (step: SourcingBriefStep | undefined, state: SourcingBriefState, input: string): boolean => {
    if (!step) return false;

    if (step.answerKind === 'text' || step.answerKind === 'text_with_suggestions' || step.answerKind === 'email') {
      if (step.required) {
        return input.trim().length > 0;
      }
      return true; // Optional fields are always "complete"
    } else if (step.answerKind === 'chips_single') {
      if (step.id === 'welcome') {
        return true; // Welcome step always allows proceeding
      } else if (step.id === 'quantity') {
        return !!state.quantity;
      } else if (step.id === 'packaging_type') {
        return !!state.packagingType;
      } else if (step.id === 'incoterms') {
        return !!state.incoterms;
      } else if (step.id === 'hazardous') {
        return state.isHazardous !== undefined;
      } else if (step.id === 'temperature') {
        return !!state.temperatureHandling;
      }
      return true;
    } else if (step.answerKind === 'chips_multi') {
      if (step.id === 'certifications') {
        return true; // Optional
      }
      return true;
    } else if (step.answerKind === 'file_upload') {
      return true; // File upload is optional
    }

    return false;
  };

  /**
   * Handle moving to next step
   */
  const handleNext = () => {
    if (!currentStep) return;

    // Handle welcome step
    if (currentStep.id === 'welcome') {
      const nextStep = getNextStep(currentStep.id);
      if (nextStep) {
        setCurrentStepId(nextStep.id);
        // Add typing indicator
        setMessages(prev => [...prev, {
          id: `assistant-${nextStep.id}-${Date.now()}`,
          role: 'assistant',
          content: nextStep.nexMessage,
          isTyping: false,
        }]);
      }
      return;
    }

    // Validate current step
    if (!isCurrentStepComplete(currentStep, briefState, input)) {
      return;
    }

    // Save answer to state
    if (currentStep.id === 'product_name') {
      setBriefState(prev => ({ ...prev, productName: input.trim() }));
    } else if (currentStep.id === 'quantity') {
      // Quantity is handled by chip selection
    } else if (currentStep.id === 'packaging_type') {
      // Packaging type is handled by chip selection
    } else if (currentStep.id === 'incoterms') {
      // Incoterms is handled by chip selection
    } else if (currentStep.id === 'hazardous') {
      // Hazardous is handled by chip selection
    } else if (currentStep.id === 'certifications') {
      // Certifications is handled by chip selection
    } else if (currentStep.id === 'temperature') {
      // Temperature is handled by chip selection
    } else if (currentStep.id === 'email') {
      setBriefState(prev => ({ ...prev, email: input.trim() }));
    } else if (currentStep.id === 'name') {
      setBriefState(prev => ({ ...prev, name: input.trim() }));
    } else if (currentStep.id === 'company') {
      setBriefState(prev => ({ ...prev, company: input.trim() }));
    }

    // Add user message to chat
    let userMessageContent = '';
    if (currentStep.answerKind === 'text' || currentStep.answerKind === 'text_with_suggestions' || currentStep.answerKind === 'email') {
      userMessageContent = input.trim();
    } else if (currentStep.id === 'quantity') {
      userMessageContent = briefState.quantity ? getQuantityLabel(briefState.quantity) : '';
    } else if (currentStep.id === 'packaging_type') {
      userMessageContent = briefState.packagingType ? getPackagingLabel(briefState.packagingType) : '';
    } else if (currentStep.id === 'incoterms') {
      userMessageContent = briefState.incoterms ? getIncotermsLabel(briefState.incoterms) : '';
    } else if (currentStep.id === 'hazardous') {
      userMessageContent = briefState.isHazardous === true ? 'Yes' : briefState.isHazardous === false ? 'No' : '';
    } else if (currentStep.id === 'certifications') {
      userMessageContent = briefState.certifications && briefState.certifications.length > 0
        ? briefState.certifications.map(c => getCertificationLabel(c)).join(', ')
        : '';
    } else if (currentStep.id === 'temperature') {
      userMessageContent = briefState.temperatureHandling ? getTemperatureLabel(briefState.temperatureHandling) : '';
    } else if (currentStep.id === 'image_upload') {
      userMessageContent = uploadedFiles.length > 0 
        ? `${uploadedFiles.length} file(s) uploaded`
        : 'Skip';
    }

    if (userMessageContent) {
      setMessages(prev => [...prev, {
        id: `user-${currentStep.id}-${Date.now()}`,
        role: 'user',
        content: userMessageContent,
      }]);
    }

    // Clear input
    setInput('');

    // Advance to next step
    const nextStep = getNextStep(currentStep.id);
    if (nextStep) {
      setCurrentStepId(nextStep.id);
      
      // Add section completion message if moving to new section
      if (nextStep.section !== currentStep.section) {
        const sectionMessages: Record<string, string> = {
          product_basics: 'Product basic information saved. Next: Packaging & Logistics.',
          packaging_logistics: 'Logistics data saved. Next: Compliance & Special Handling.',
          compliance: 'Compliance check complete. Next: Budget, Schedule & Contact.',
        };
        const sectionMessage = sectionMessages[currentStep.section];
        if (sectionMessage) {
          setMessages(prev => [...prev, {
            id: `section-complete-${Date.now()}`,
            role: 'assistant',
            content: sectionMessage,
            isTyping: false,
          }]);
        }
      }

      // Add next question with typing indicator
      setMessages(prev => [...prev, {
        id: `assistant-${nextStep.id}-${Date.now()}`,
        role: 'assistant',
        content: nextStep.nexMessage,
        isTyping: false,
      }]);
    } else {
      // All steps complete - show review
      setCurrentStepId('review');
      setMessages(prev => [...prev, {
        id: 'review',
        role: 'assistant',
        content: (
          <div className="space-y-4">
            <div>
              <p className="mb-2">Please review your information.</p>
              <div className="space-y-2 text-sm">
                {briefState.productName && (
                  <p><strong>Product:</strong> {briefState.productName}</p>
                )}
                {briefState.quantity && (
                  <p><strong>Quantity:</strong> {getQuantityLabel(briefState.quantity)}</p>
                )}
                {briefState.email && (
                  <p><strong>Email:</strong> {briefState.email}</p>
                )}
                {briefState.name && (
                  <p><strong>Name:</strong> {briefState.name}</p>
                )}
                {briefState.company && (
                  <p><strong>Company:</strong> {briefState.company}</p>
                )}
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        ),
      }]);
    }
  };

  /**
   * Fetch product suggestions from LLM
   */
  const fetchProductSuggestions = async (inputText: string) => {
    if (inputText.trim().length < 3) {
      setProductSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/sourcing-brief/suggest-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText }),
      });
      
      const data = await response.json();
      if (data.suggestions) {
        setProductSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setProductSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  /**
   * Load resume state from token
   */
  const loadResumeState = async (token: string) => {
    try {
      const response = await fetch(`/api/sourcing-brief/save-resume?token=${token}`);
      const data = await response.json();
      
      if (data.success && data.state) {
        setBriefState(data.state);
        // Reconstruct messages from state
        // TODO: Reconstruct full conversation history
        const firstStep = getFirstStep();
        setCurrentStepId(firstStep.id);
        setMessages([{
          id: 'resume-loaded',
          role: 'assistant',
          content: 'Your previous information has been loaded. Please continue.',
        }]);
      }
    } catch (error) {
      console.error('Error loading resume state:', error);
      // Fallback to normal flow
      const firstStep = getFirstStep();
      setCurrentStepId(firstStep.id);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: firstStep.nexMessage,
      }]);
    }
  };

  /**
   * Save and resume
   */
  const handleSaveResume = async () => {
    if (!briefState.email) {
      alert('Please enter your email address.');
      return;
    }

    try {
      const response = await fetch('/api/sourcing-brief/save-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: briefState,
          email: briefState.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: 'save-success',
          role: 'assistant',
          content: `Saved! We've sent you a resume link via email. Link: ${data.resumeUrl}`,
        }]);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  /**
   * Handle file upload with API
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      return file.size <= maxSize && validTypes.includes(file.type);
    });
    
    if (validFiles.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/sourcing-brief/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      setUploadedFiles(prev => [...prev, ...validFiles]);
      setUploadedFileUrls(prev => [...prev, ...uploadedUrls]);
      setBriefState(prev => ({
        ...prev,
        uploadedFiles: [...(prev.uploadedFiles || []), ...validFiles],
        uploadedFileUrls: [...(prev.uploadedFileUrls || []), ...uploadedUrls],
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('An error occurred while uploading files.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle file removal
   */
  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setBriefState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles?.filter((_, i) => i !== index),
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/sourcing-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefState),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      
      setMessages(prev => [...prev, {
        id: 'submit-success',
        role: 'assistant',
        content: (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">Request received!</p>
            </div>
            <p className="text-sm">We'll send you a quote within 24–48 hours.</p>
          </div>
        ),
      }]);
      
      setCurrentStepId(null);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'submit-error',
        role: 'assistant',
        content: (
          <div className="text-red-600">
            <p>An error occurred during submission. Please try again.</p>
            {error instanceof Error && (
              <p className="text-xs mt-1">{error.message}</p>
            )}
          </div>
        ),
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render input component based on current step
   */
  const renderStepInput = () => {
    if (!currentStep) return null;

    // Welcome step - show action chips
    if (currentStep.id === 'welcome') {
      return (
        <div className="space-y-3">
          <GenericChipGroup
            options={currentStep.options || []}
            value="start"
            onChange={(value) => {
              if (value === 'start' || value === 'new_request') {
                handleNext();
              }
            }}
          />
        </div>
      );
    }

    // Review step - no input needed
    if (currentStep.id === 'review') {
      return null;
    }

    // Product name step with LLM suggestions
    if (currentStep.id === 'product_name') {
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentStep.placeholder || 'Enter product name or link...'}
              className="flex-1 h-12 px-4 rounded-lg bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepComplete(currentStep, briefState, input)}
              className="h-12 px-6"
            >
              Next
            </Button>
          </div>
          {isLoadingSuggestions && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating suggestions...</span>
            </div>
          )}
          {productSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {productSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(suggestion);
                      setProductSuggestions([]);
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 bg-white hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Quantity step - show chips
    if (currentStep.id === 'quantity') {
      return (
        <div className="space-y-3">
          <GenericChipGroup
            options={currentStep.options || []}
            value={briefState.quantity}
            onChange={(value) => {
              setBriefState(prev => ({ ...prev, quantity: value as QuantityRange }));
            }}
          />
          <Button
            onClick={handleNext}
            disabled={!isCurrentStepComplete(currentStep, briefState, input)}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      );
    }

    // Packaging type step
    if (currentStep.id === 'packaging_type') {
      return (
        <div className="space-y-3">
          <GenericChipGroup
            options={currentStep.options || []}
            value={briefState.packagingType}
            onChange={(value) => {
              setBriefState(prev => ({ ...prev, packagingType: value as PackagingType }));
            }}
          />
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      );
    }

    // Incoterms step
    if (currentStep.id === 'incoterms') {
      return (
        <div className="space-y-3">
          <GenericChipGroup
            options={currentStep.options || []}
            value={briefState.incoterms}
            onChange={(value) => {
              setBriefState(prev => ({ ...prev, incoterms: value as Incoterms }));
            }}
          />
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      );
    }

    // Hazardous step
    if (currentStep.id === 'hazardous') {
      return (
        <div className="space-y-3">
          <GenericChipGroup
            options={currentStep.options || []}
            value={briefState.isHazardous === true ? 'yes' : briefState.isHazardous === false ? 'no' : undefined}
            onChange={(value) => {
              setBriefState(prev => ({ 
                ...prev, 
                isHazardous: value === 'yes' ? true : value === 'no' ? false : undefined 
              }));
            }}
          />
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      );
    }

    // Certifications step (multi-select)
    if (currentStep.id === 'certifications') {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(currentStep.options || []).map((option) => {
              const isSelected = briefState.certifications?.includes(option.value as Certification);
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setBriefState(prev => {
                      const current = prev.certifications || [];
                      const newCerts = isSelected
                        ? current.filter(c => c !== option.value)
                        : [...current, option.value as Certification];
                      return { ...prev, certifications: newCerts };
                    });
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-neutral-900'
                      : 'border-neutral-200 bg-white hover:border-primary/50 hover:bg-neutral-50 text-neutral-900'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      );
    }

    // Temperature step
    if (currentStep.id === 'temperature') {
      return (
        <div className="space-y-3">
          <GenericChipGroup
            options={currentStep.options || []}
            value={briefState.temperatureHandling}
            onChange={(value) => {
              setBriefState(prev => ({ ...prev, temperatureHandling: value as TemperatureHandling }));
            }}
          />
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      );
    }

    // File upload step
    if (currentStep.id === 'image_upload') {
      return (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Card className="p-4 border-2 border-dashed border-neutral-300 hover:border-primary transition-colors">
            <div className="flex flex-col items-center justify-center gap-4">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-neutral-400" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium mb-1">
                  {isUploading ? 'Uploading...' : 'Drag and drop files or click to upload'}
                </p>
                <p className="text-xs text-neutral-500">JPG, PNG, PDF, max 10MB</p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto"
                disabled={isUploading}
              >
                Select Files
              </Button>
            </div>
          </Card>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileRemove(index)}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto"
            disabled={isUploading}
          >
            {uploadedFiles.length > 0 ? 'Next' : 'Skip'}
          </Button>
        </div>
      );
    }

    // Text/Email input steps
    return (
      <div className="flex gap-2">
        <input
          type={currentStep.answerKind === 'email' ? 'email' : 'text'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentStep.placeholder || 'Enter...'}
          className="flex-1 h-12 px-4 rounded-lg bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && isCurrentStepComplete(currentStep, briefState, input)) {
              e.preventDefault();
              handleNext();
            }
          }}
        />
        <Button
          onClick={handleNext}
          disabled={!isCurrentStepComplete(currentStep, briefState, input)}
          className="h-12 px-6"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">NexSupply</h1>
          </Link>
          {currentStepIndex >= 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
              <span>•</span>
              <span>In Progress ({completedSteps} / {totalSteps})</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {briefState.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveResume}
              className="text-xs"
            >
              Save & Resume Later
            </Button>
          )}
          <div className="text-xs text-neutral-500">
            Sourcing Brief
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStepIndex >= 0 && (
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-lg rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-neutral-200 text-neutral-900'
                  }`}
                >
                  {typeof message.content === 'string' ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                    </p>
                  ) : (
                    <div className="text-sm leading-relaxed">
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Current step input */}
            {currentStep && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-lg w-full">
                  {renderStepInput()}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Right Side Summary Panel (Desktop) */}
        <aside className="hidden lg:block w-80 border-l border-neutral-200 bg-white overflow-y-auto">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Product Information</h3>
              <div className="space-y-2 text-sm">
                {briefState.productName ? (
                  <p><span className="text-neutral-500">Product:</span> {briefState.productName}</p>
                ) : (
                  <p className="text-neutral-400">Not entered yet</p>
                )}
                {briefState.quantity && (
                  <p><span className="text-neutral-500">Quantity:</span> {getQuantityLabel(briefState.quantity)}</p>
                )}
              </div>
            </Card>

            {(briefState.packagingType || briefState.incoterms) && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Packaging & Logistics</h3>
                <div className="space-y-2 text-sm">
                  {briefState.packagingType && (
                    <p><span className="text-neutral-500">Packaging:</span> {getPackagingLabel(briefState.packagingType)}</p>
                  )}
                  {briefState.incoterms && (
                    <p><span className="text-neutral-500">Incoterms:</span> {getIncotermsLabel(briefState.incoterms)}</p>
                  )}
                </div>
              </Card>
            )}

            {(briefState.isHazardous !== undefined || briefState.certifications?.length || briefState.temperatureHandling) && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Compliance & Special Handling</h3>
                <div className="space-y-2 text-sm">
                  {briefState.isHazardous !== undefined && (
                    <p><span className="text-neutral-500">Hazardous:</span> {briefState.isHazardous ? 'Yes' : 'No'}</p>
                  )}
                  {briefState.certifications && briefState.certifications.length > 0 && (
                    <p><span className="text-neutral-500">Certifications:</span> {briefState.certifications.map(c => getCertificationLabel(c)).join(', ')}</p>
                  )}
                  {briefState.temperatureHandling && (
                    <p><span className="text-neutral-500">Temperature:</span> {getTemperatureLabel(briefState.temperatureHandling)}</p>
                  )}
                </div>
              </Card>
            )}

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                {briefState.email ? (
                  <p><span className="text-neutral-500">Email:</span> {briefState.email}</p>
                ) : (
                  <p className="text-neutral-400">Not entered yet</p>
                )}
                {briefState.name && (
                  <p><span className="text-neutral-500">Name:</span> {briefState.name}</p>
                )}
                {briefState.company && (
                  <p><span className="text-neutral-500">Company:</span> {briefState.company}</p>
                )}
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SourcingBriefPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-neutral-50 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    }>
      <SourcingBriefPageContent />
    </Suspense>
  );
}
