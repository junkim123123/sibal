/**
 * Dr.B Style Onboarding Chat Interface - Deep Sourcing Flow
 * 
 * A smooth, chat-like experience where the system asks comprehensive questions
 * to collect detailed sourcing information.
 * 
 * Features:
 * - Framer Motion animations for smooth transitions
 * - Pill-shaped option buttons (for select steps)
 * - Text input fields (for text steps)
 * - Typing indicator
 * - Progress bar
 * - Clean, minimal design
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Sourcing Flow 5.0: Streamlined & Non-Redundant
const SOURCING_STEPS = [
  // --- Step 1: Product (통합: Name + Description) ---
  {
    id: 'product_info',
    type: 'text' as const,
    question: "Hi, I'm Nexi. What product are you looking to source? (Describe the product and your project name if you have one)",
    placeholder: "e.g. Premium Pet Treats for US market - organic dog biscuits in 2lb bags"
  },
  
  // --- Step 2: Sales Channel (통합: Business Model + Channel) ---
  {
    id: 'sales_channel',
    type: 'select' as const,
    question: "Where will you primarily sell this product?",
    options: [
      "Direct-to-Consumer (Shopify / My Website)",
      "Online Marketplaces (Amazon / Walmart)",
      "Social Commerce (TikTok Shop / Instagram)",
      "B2B / Wholesale (Alibaba / Faire / Distributors)",
      "Retail Stores (Physical retail)",
      "Multi-channel Mix",
      "Not sure yet"
    ]
  },
  {
    id: 'market',
    type: 'select' as const,
    question: "Which geographic market are you primarily targeting for this product?",
    options: [
      "North America (US / Canada)",
      "Europe (EU)",
      "United Kingdom",
      "East Asia (Korea / Japan)",
      "Southeast Asia",
      "Middle East",
      "Latin America",
      "Global / Multi-region"
    ]
  },

  // --- Phase 2: Product ---
  {
    id: 'origin',
    type: 'select' as const,
    question: "Where do you expect to source or manufacture this product?",
    options: [
      "China (Mainland)",
      "Vietnam",
      "India",
      "Mexico",
      "United States",
      "Canada",
      "South Korea",
      "Taiwan",
      "Thailand",
      "Eastern Europe",
      "Open to recommendations"
    ]
  },
  // --- Step 4: Reference Link (AI 분석의 핵심) ---
  {
    id: 'ref_link',
    type: 'text' as const,
    question: "Do you have a reference link? (Amazon competitor, Alibaba supplier, or similar product). This helps us analyze specs accurately.",
    placeholder: "Paste a URL (Optional - type 'Skip' if none)"
  },
  
  // --- Step 5: Product Specs (통합: Material + Size - 선택사항) ---
  {
    id: 'product_specs',
    type: 'text' as const,
    question: "Product specs (Optional): Material type and packaging size? (e.g., 'Plastic, Shoe box size' or 'Skip if unsure')",
    placeholder: "e.g. Plastic/Silicone, S (Shoe Box size) or type 'Skip'"
  },
  
  // --- Step 10: Pricing (통합 - 하나의 질문으로 최적화) ---
  {
    id: 'pricing_value',
    type: 'text' as const,
    question: "What do you know about your pricing or margin targets?",
    placeholder: "e.g., '$79-99', '$5/unit', '40%', or 'Not sure'"
  },
  
  // --- Step 7: Volume & Timeline ---
  {
    id: 'volume',
    type: 'select' as const,
    question: "Roughly how many units per month?",
    options: [
      "Prototype (< 20 units)",
      "Small Test (20-100 units)",
      "Launch (100-500 units)",
      "Growing (500-2,000 units)",
      "Scaling (2,000-10,000 units)",
      "High Scale (100,000+ units)",
      "No idea"
    ]
  },
  {
    id: 'timeline',
    type: 'select' as const,
    question: "When do you need the first shipment?",
    options: [
      "Under 4 weeks (Urgent/Air)",
      "1-2 months",
      "6 months (Standard)",
      "6-12 months (Focus on economics)",
      "No fixed date (Feasibility check)"
    ]
  },
  
  // --- Step 8: Priority (간소화) ---
  {
    id: 'priority',
    type: 'select' as const,
    question: "What matters most right now?",
    options: [
      "Maximize Gross Margin",
      "Minimize Upfront Cash Risk",
      "Speed to Launch",
      "Balance (Profit/Speed/Risk)",
      "Simplest Operations"
    ]
  }
];

type Step = typeof SOURCING_STEPS[number] & {
  helperText?: string;
};

type Message = {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: number;
};

export default function ChatPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showTyping, setShowTyping] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStep = SOURCING_STEPS[currentStepIndex];
  const progress = isCompleted ? 100 : ((currentStepIndex + 1) / SOURCING_STEPS.length) * 100;

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  // 프로젝트 생성 (첫 번째 질문 답변 후)
  useEffect(() => {
    const createProject = async () => {
      if (!isAuthenticated || !selectedOptions.product_info || projectId) return;
      
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: selectedOptions.product_info.split('-')[0]?.trim() || 
                  selectedOptions.product_info.split(',')[0]?.trim() || 
                  'New Analysis Project'
          }),
        });
        
        const data = await response.json();
        if (data.ok && data.project) {
          setProjectId(data.project.id);
        }
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    };
    
    createProject();
  }, [selectedOptions.product_info, isAuthenticated, projectId]);

  // 메시지 저장 함수
  const saveMessage = async (role: 'user' | 'ai', content: string) => {
    if (!projectId) return;
    
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          role,
          content,
        }),
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  // Initialize with first question (typing effect)
  useEffect(() => {
    if (messages.length === 0 && currentStep) {
      // Split the first message into three parts for natural typing effect
      const firstPart = "Hi, I'm Nexi.";
      
      // Show first part immediately
      setMessages([{
        id: `msg-${currentStep.id}-part1`,
        type: 'system',
        content: firstPart,
        timestamp: Date.now(),
      }]);
      
      // Show typing indicator
      setShowTyping(true);
      
      // After delay, add second part
      setTimeout(() => {
        setShowTyping(false);
        setMessages(prev => [...prev, {
          id: `msg-${currentStep.id}-part2`,
          type: 'system',
          content: " What product are you looking to source?",
          timestamp: Date.now(),
        }]);
        
        // Show typing indicator again
        setShowTyping(true);
        
        // After another delay, add third part
        setTimeout(() => {
          setShowTyping(false);
          setMessages(prev => [...prev, {
            id: `msg-${currentStep.id}-part3`,
            type: 'system',
            content: " (Describe the product and your project name if you have one)",
            timestamp: Date.now(),
          }]);
          setShowInput(true);
        }, 1200);
      }, 1500);
    }
  }, [currentStep]);

  // Focus text input when it appears
  useEffect(() => {
    if (currentStep?.type === 'text' && showInput) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [currentStep, showInput]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping, showInput]);

  const [skipConfirmation, setSkipConfirmation] = useState<{ stepId: string; value: string } | null>(null);
  const [notSureResponse, setNotSureResponse] = useState<string | null>(null);

  const handleTextSubmit = () => {
    if (!currentStep || currentStep.type !== 'text') return;
    if (!textInput.trim()) return;

    // ref_link 유효성 검사 강화
    let displayValue = textInput.trim();
    let finalInputValue = textInput.trim();
    
    if (currentStep.id === 'ref_link') {
      const lower = textInput.trim().toLowerCase();
      
      // Skip 패턴 확인 및 빈 입력 처리
      if (['skip', '없음', '몰라', 'none', ''].includes(lower) || lower.length < 5) {
        // Skip 확인 메시지 표시 (넛지 메시지)
        setSkipConfirmation({ stepId: currentStep.id, value: textInput.trim() });
        return;
      }
    }
    
    // pricing_value에서 "Not sure" 처리
    if (currentStep.id === 'pricing_value') {
      const lower = textInput.trim().toLowerCase();
      if (['not sure', 'not sure yet', '몰라', '모르겠어', 'unsure'].includes(lower)) {
        // Not Sure 응답 처리
        setNotSureResponse(currentStep.id);
        setTextInput('');
        setShowInput(false);
        
        // AI 안심 메시지 추가
        setMessages(prev => [...prev, {
          id: `ai-response-${Date.now()}`,
          type: 'system',
          content: "No worries. I will estimate the market average based on North American sales data.",
          timestamp: Date.now(),
        }]);
        
        // 사용자 메시지 추가
        setMessages(prev => [...prev, {
          id: `user-${Date.now()}`,
          type: 'user',
          content: 'Not sure',
          timestamp: Date.now(),
        }]);
        
        setSelectedOptions(prev => ({
          ...prev,
          [currentStep.id]: 'not_sure',
        }));
        
        saveMessage('user', 'not_sure');
        
        setTimeout(() => {
          setNotSureResponse(null);
          proceedToNextStep();
        }, 1500);
        return;
      }
    }

    // Format price input for pricing_value (optional formatting)
    if (currentStep.id === 'pricing_value') {
      // Try to extract and format price if it looks like a number
      const numValue = parseFloat(textInput.trim().replace(/[$,\s]/g, ''));
      if (!isNaN(numValue) && textInput.trim().match(/\d/)) {
        // If it contains numbers, format it nicely but keep original if it has text
        if (textInput.trim().toLowerCase().includes('retail') || textInput.trim().toLowerCase().includes('landed') || textInput.trim().includes('%')) {
          displayValue = textInput.trim(); // Keep original if it has descriptive text or percentage
        } else {
          displayValue = textInput.trim(); // Keep original format
        }
      }
    }

    // Save input (ref_link는 'skip'으로 정규화)
    const finalValue = currentStep.id === 'ref_link' ? finalInputValue : displayValue;
    
    setSelectedOptions(prev => ({
      ...prev,
      [currentStep.id]: finalValue,
    }));

    // Hide input immediately
    setShowInput(false);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: displayValue,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Save message to DB (실제 저장되는 값은 finalInputValue)
    saveMessage('user', currentStep.id === 'ref_link' ? finalInputValue : displayValue);

    // Clear input
    setTextInput('');

    // Show typing indicator and proceed
    proceedToNextStep();
  };

  // Skip 확인 처리
  const handleSkipConfirm = (confirmed: boolean) => {
    if (!skipConfirmation) return;
    
    if (confirmed) {
      // Skip 확인됨 - 실제로 skip 처리
      const currentStep = SOURCING_STEPS.find(s => s.id === skipConfirmation.stepId);
      if (currentStep) {
        setSelectedOptions(prev => ({
          ...prev,
          [skipConfirmation.stepId]: 'skip',
        }));
        
        setMessages(prev => [...prev, {
          id: `user-${Date.now()}`,
          type: 'user',
          content: 'Skip / Not provided',
          timestamp: Date.now(),
        }]);
        
        saveMessage('user', 'skip');
        setTextInput('');
        setSkipConfirmation(null);
        proceedToNextStep();
      }
    } else {
      // Skip 취소 - 다시 입력 받기
      setSkipConfirmation(null);
      setShowInput(true);
      inputRef.current?.focus();
    }
  };

  // Not Sure 응답 처리
  const handleNotSureResponse = () => {
    if (!notSureResponse) return;
    
    const currentStep = SOURCING_STEPS.find(s => s.id === notSureResponse);
    if (currentStep) {
      // AI 안심 메시지 추가
      setMessages(prev => [...prev, {
        id: `ai-response-${Date.now()}`,
        type: 'system',
        content: "No worries. I will estimate the market average based on North American sales data.",
        timestamp: Date.now(),
      }]);
      
      // 사용자 메시지 추가
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        type: 'user',
        content: 'Not sure',
        timestamp: Date.now(),
      }]);
      
      setSelectedOptions(prev => ({
        ...prev,
        [notSureResponse]: 'not_sure',
      }));
      
      saveMessage('user', 'not_sure');
      setTextInput('');
      setNotSureResponse(null);
      
      setTimeout(() => {
        proceedToNextStep();
      }, 1000);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (!currentStep || currentStep.type !== 'select') return;

    // "Not sure yet" 옵션 처리
    if (option === 'Not sure yet' && currentStep.id === 'sales_channel') {
      setNotSureResponse(currentStep.id);
      setShowInput(false);
      
      // AI 안심 메시지 추가
      setMessages(prev => [...prev, {
        id: `ai-response-${Date.now()}`,
        type: 'system',
        content: "No worries. I will estimate the market average based on North American sales data.",
        timestamp: Date.now(),
      }]);
      
      // 사용자 메시지 추가
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: option,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      saveMessage('user', option);
      setSelectedOptions(prev => ({
        ...prev,
        [currentStep.id]: option,
      }));
      
      setTimeout(() => {
        setNotSureResponse(null);
        proceedToNextStep();
      }, 1500);
      return;
    }

    // Hide options immediately
    setShowInput(false);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: option,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Save message to DB
    saveMessage('user', option);

    // Save selection
    setSelectedOptions(prev => ({
      ...prev,
      [currentStep.id]: option,
    }));

    // Show typing indicator and proceed
    proceedToNextStep();
  };

  const proceedToNextStep = () => {
    // Show typing indicator
    setShowTyping(true);

    // After delay, show next question
    setTimeout(() => {
      setShowTyping(false);
      
      if (currentStepIndex < SOURCING_STEPS.length - 1) {
        let nextIndex = currentStepIndex + 1;
        let nextStep = SOURCING_STEPS[nextIndex];
        
        setCurrentStepIndex(nextIndex);
        
        // Add next system message
        setMessages(prev => [...prev, {
          id: `msg-${nextStep.id}`,
          type: 'system',
          content: nextStep.question,
          timestamp: Date.now(),
        }]);
        
        // Show input for next step
        setShowInput(true);
      } else {
        // All steps complete - show calculation messages
        setShowInput(false);
        
        // Show calculation progress messages with loading indicators
        setShowTyping(true);
        setMessages(prev => [...prev, {
          id: 'calculating-1',
          type: 'system',
          content: "Scanning HTS Codes...",
          timestamp: Date.now(),
        }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'calculating-2',
            type: 'system',
            content: "Checking Duty Rates...",
            timestamp: Date.now(),
          }]);
        }, 1200);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'calculating-3',
            type: 'system',
            content: "Optimizing Route...",
            timestamp: Date.now(),
          }]);
        }, 2400);
        
        setTimeout(() => {
          setShowTyping(false);
          setMessages(prev => [...prev, {
            id: 'complete',
            type: 'system',
            content: "Perfect! We have all the information we need. Your analysis report is ready.",
            timestamp: Date.now(),
          }]);
          
          // localStorage 제거 - project_id를 URL로 전달
          // 데이터는 이미 Supabase DB에 저장됨
          
          // Mark as completed (will show button instead of auto-redirect)
          setIsCompleted(true);
        }, 3600);
      }
    }, 1500); // Typing indicator duration
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }),
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  const typingVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-serif font-bold text-neutral-900">NexSupply</h1>
            </Link>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-neutral-100">
          <motion.div
            className="h-full bg-neutral-900"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </header>

      {/* Chat Area */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={messageVariants}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-lg rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {/* Loading spinner for calculating messages */}
                    {(message.id.startsWith('calculating-') || message.content.includes('Scanning') || message.content.includes('Checking') || message.content.includes('Optimizing')) && (
                      <motion.div
                        className="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {showTyping && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={typingVariants}
                className="flex justify-start"
              >
                <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="w-2 h-2 bg-neutral-600 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-neutral-600 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-neutral-600 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area - Select Options or Text Input */}
          <AnimatePresence mode="wait">
            {showInput && currentStep && !isCompleted && (
              <motion.div
                key={currentStep.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={inputVariants}
              >
                {currentStep.type === 'select' ? (
                  // Pill-shaped option buttons
                  <div className="flex flex-wrap gap-3 justify-start">
                    {currentStep.options.map((option, index) => {
                      const isSkipOption = option.toLowerCase().includes('skip') || option.toLowerCase().includes('not sure') || option === 'Not sure yet' || option === 'No idea' || option === 'Open to recommendations';
                      return (
                        <motion.button
                          key={option}
                          custom={index}
                          variants={optionVariants}
                          onClick={() => handleOptionSelect(option)}
                          className={`px-6 py-3 h-auto rounded-full text-sm font-medium transition-all whitespace-normal text-left max-w-full sm:max-w-[80%] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isSkipOption
                              ? 'border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-600 focus:ring-neutral-300'
                              : 'border-2 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 focus:ring-neutral-900'
                          }`}
                        >
                          {option}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  // Text input field
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && textInput.trim()) {
                            e.preventDefault();
                            handleTextSubmit();
                          }
                        }}
                        placeholder={currentStep.placeholder || "Type your answer..."}
                        className="flex-1 px-4 py-3 rounded-full border-2 border-neutral-300 bg-white text-neutral-900 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all"
                      />
                      <motion.button
                        onClick={handleTextSubmit}
                        disabled={!textInput.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-full bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                    {/* Skip link for ref_link - 숨겨진 스타일 */}
                    {currentStep.id === 'ref_link' && (
                      <button
                        onClick={() => {
                          setTextInput('skip');
                          handleTextSubmit();
                        }}
                        className="text-xs text-neutral-400 hover:text-neutral-500 underline ml-2"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip Confirmation Dialog */}
          <AnimatePresence>
            {skipConfirmation && skipConfirmation.stepId === 'ref_link' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => handleSkipConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Skip Reference Link?
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Without a link, cost accuracy drops by 30%. Are you sure? (Better to use an Amazon/Alibaba link)
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSkipConfirm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => handleSkipConfirm(true)}
                      className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Skip Anyway
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion State - Reveal My Sourcing Strategy Button */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={inputVariants}
                className="flex justify-center pt-4"
              >
                <motion.button
                  onClick={() => {
                    // selectedOptions를 sessionStorage에 저장 (URL 길이 제한 회피)
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('nexsupply_onboarding_data', JSON.stringify(selectedOptions));
                    }
                    
                    // URL에는 project_id만 전달
                    const params = new URLSearchParams();
                    if (projectId) {
                      params.set('project_id', projectId);
                    }
                    
                    const queryString = params.toString();
                    router.push(`/results${queryString ? `?${queryString}` : ''}`);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-full bg-neutral-900 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                >
                  Reveal My Sourcing Strategy
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>
    </div>
  );
}
