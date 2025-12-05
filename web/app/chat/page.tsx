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

// Precision Data Collection Flow - High-Fidelity Questions for Calculation Engine
const ONBOARDING_STEPS = [
  // Phase 1: Setup
  {
    id: 'project_name',
    type: 'text' as const,
    question: "Hi, I'm Nexi! Let's analyze your product. What would you like to call this project?",
    placeholder: "e.g. Japanese Gummy Expansion"
  },
  {
    id: 'channel',
    type: 'select' as const,
    question: "What is your main sales channel?",
    options: ["Amazon FBA", "Shopify / DTC", "TikTok Shop", "Retail / Wholesale"]
  },
  {
    id: 'market',
    type: 'select' as const,
    question: "Which market are you primarily targeting?",
    options: ["United States", "Canada", "Europe (EU)", "United Kingdom", "Korea/Japan"]
  },
  // Phase 2: Product (SPLIT into Description & Price)
  {
    id: 'origin',
    type: 'select' as const,
    question: "Where do you expect to source this product from?",
    options: ["China", "South Korea", "Vietnam", "Other Asia", "Not sure"]
  },
  {
    id: 'stage',
    type: 'select' as const,
    question: "What stage is this product at?",
    options: ["New test product (Feasibility)", "Existing product (Cost check)", "Scaling up"]
  },
  {
    id: 'product_desc', // Step 6-A: Description only
    type: 'text' as const,
    question: "Please describe your product in detail. (What is it? What are the key features?)",
    placeholder: "e.g. Wireless noise-cancelling headphones, black color, foldable..."
  },
  {
    id: 'target_price', // Step 6-B: Price only
    type: 'text' as const,
    question: "What is your target retail price (or target landed cost)?",
    placeholder: "e.g. Retail $79-99, or Landed <$15"
  },
  // Phase 3: Logistics & Strategy
  {
    id: 'trade_term',
    type: 'select' as const,
    question: "What trade term do you prefer? (DDP is easiest for beginners)",
    options: ["DDP (Door-to-door, Duty Paid)", "FOB (Port only)", "Ex-Works (Factory pickup)", "Not sure"]
  },
  {
    id: 'priority',
    type: 'select' as const,
    question: "What matters more to you right now?",
    options: ["Lowest Cost", "Fastest Speed", "Balanced"]
  },
  {
    id: 'volume',
    type: 'select' as const,
    question: "Roughly what is your monthly volume plan?",
    options: ["Test run (< 50 units)", "Small launch (100-500 units)", "Scale (1000+ units)"]
  },
  {
    id: 'timeline',
    type: 'select' as const,
    question: "When do you need the first shipment to arrive?",
    options: ["Within 1 month", "2-3 months", "Flexible"]
  }
];

type Step = typeof ONBOARDING_STEPS[number] & {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = isCompleted ? 100 : ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  // Initialize with first question
  useEffect(() => {
    if (messages.length === 0 && currentStep) {
      setMessages([{
        id: `msg-${currentStep.id}`,
        type: 'system',
        content: currentStep.question,
        timestamp: Date.now(),
      }]);
    }
  }, []);

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

  const handleTextSubmit = () => {
    if (!currentStep || currentStep.type !== 'text') return;
    if (!textInput.trim()) return;

    // Validate link for ref_link step
    if (currentStep.id === 'ref_link') {
      const link = textInput.trim();
      if (!link.includes('http') && !link.includes('www') && !link.includes('amazon') && !link.includes('alibaba')) {
        // Show validation message (optional - for now just proceed)
        // In production, you might want to show an error message
      }
    }

    // Format price input for target_price (optional formatting)
    let displayValue = textInput.trim();
    if (currentStep.id === 'target_price') {
      // Try to extract and format price if it looks like a number
      const numValue = parseFloat(textInput.trim().replace(/[$,\s]/g, ''));
      if (!isNaN(numValue) && textInput.trim().match(/\d/)) {
        // If it contains numbers, format it nicely but keep original if it has text
        if (textInput.trim().toLowerCase().includes('retail') || textInput.trim().toLowerCase().includes('landed')) {
          displayValue = textInput.trim(); // Keep original if it has descriptive text
        } else {
          displayValue = textInput.trim(); // Keep original format
        }
      }
    }

    // Save input
    setSelectedOptions(prev => ({
      ...prev,
      [currentStep.id]: textInput.trim(),
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

    // Clear input
    setTextInput('');

    // Show typing indicator and proceed
    proceedToNextStep();
  };

  const handleOptionSelect = (option: string) => {
    if (!currentStep || currentStep.type !== 'select') return;

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
      
      if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
        const nextStep = ONBOARDING_STEPS[currentStepIndex + 1];
        setCurrentStepIndex(prev => prev + 1);
        
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
        
        // Show calculation progress messages
        setMessages(prev => [...prev, {
          id: 'calculating-1',
          type: 'system',
          content: "Calculating Logistics...",
          timestamp: Date.now(),
        }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'calculating-2',
            type: 'system',
            content: "Checking Duty Rates...",
            timestamp: Date.now(),
          }]);
        }, 1000);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'complete',
            type: 'system',
            content: "Perfect! We have all the information we need. Your analysis report is ready.",
            timestamp: Date.now(),
          }]);
          
          // Save to localStorage
          try {
            const onboardingData = {
              ...selectedOptions,
              timestamp: Date.now(),
            };
            localStorage.setItem('nexsupply_onboarding_data', JSON.stringify(onboardingData));
          } catch (error) {
            console.error('Failed to save onboarding data:', error);
          }
          
          // Mark as completed (will show button instead of auto-redirect)
          setIsCompleted(true);
        }, 2000);
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
            <h1 className="text-2xl font-serif font-bold text-neutral-900">NexSupply</h1>
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
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
                <div className="bg-neutral-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="w-2 h-2 bg-neutral-400 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-neutral-400 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-neutral-400 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
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
                  <div className="flex flex-wrap gap-3">
                    {currentStep.options.map((option, index) => (
                      <motion.button
                        key={option}
                        custom={index}
                        variants={optionVariants}
                        onClick={() => handleOptionSelect(option)}
                        className="px-6 py-3 rounded-full border-2 border-neutral-300 bg-white text-neutral-900 text-sm font-medium transition-all hover:bg-neutral-900 hover:text-white hover:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  // Text input field
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
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion State - View Analysis Report Button */}
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
                  onClick={() => router.push('/results')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-full bg-neutral-900 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                >
                  View Analysis Report
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
