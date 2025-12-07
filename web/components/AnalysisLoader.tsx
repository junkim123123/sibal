'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Scale, Package, DollarSign } from 'lucide-react';

const ANALYSIS_STEPS = [
  {
    icon: Search,
    text: 'Analyzing Product Specifications...',
    emoji: '🔍',
  },
  {
    icon: Globe,
    text: 'Scanning Global Supplier Network...',
    emoji: '🌏',
  },
  {
    icon: Scale,
    text: 'Calculating HS Codes & Duty Rates...',
    emoji: '⚖️',
  },
  {
    icon: Package,
    text: 'Estimating Logistics & Shipping Volume...',
    emoji: '📦',
  },
  {
    icon: DollarSign,
    text: 'Finalizing Landed Cost Simulation...',
    emoji: '💰',
  },
];

// Background Pattern Component (Hex Grid)
function HexGridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexGrid" width="40" height="34.64" patternUnits="userSpaceOnUse">
            <path
              d="M20 0L30 8.66V25.98L20 34.64L10 25.98V8.66L20 0ZM20 5L12.5 10.5V23.5L20 29L27.5 23.5V10.5L20 5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-neutral-900"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>
    </div>
  );
}

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through steps every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Fake progress bar (up to 90%)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 3;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const currentStepData = ANALYSIS_STEPS[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative">
      {/* Background Pattern */}
      <HexGridPattern />
      
      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <div className="space-y-6">
            {/* Pulsing Radar Icon with Multiple Rings */}
        <div className="flex justify-center">
          <motion.div
            animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
                className="relative w-24 h-24 flex items-center justify-center"
          >
                {/* Icon Container */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
              <Icon className="w-10 h-10 text-blue-600" />
            </div>
                
                {/* Pulsing Ring 1 (Inner) */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1.3],
                    opacity: [0.5, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 0,
                  }}
                  className="absolute inset-0 rounded-full border border-blue-300"
                />
                
                {/* Pulsing Ring 2 (Middle) */}
                <motion.div
                  animate={{
                    scale: [1, 1.6, 1.6],
                    opacity: [0.3, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 0.4,
                  }}
                  className="absolute inset-0 rounded-full border border-blue-200"
                />
                
                {/* Pulsing Ring 3 (Outer) */}
            <motion.div
              animate={{
                    scale: [1, 1.9, 1.9],
                    opacity: [0.2, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                    delay: 0.8,
              }}
                  className="absolute inset-0 rounded-full border border-blue-100"
            />
          </motion.div>
        </div>

            {/* Typography: Large Percentage Number */}
            <div className="text-center">
              <motion.div
                key={Math.round(progress)}
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-5xl font-bold text-blue-600 font-mono tracking-tight"
              >
                {Math.round(progress)}%
              </motion.div>
            </div>

            {/* Status Text */}
            <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
                  <p className="text-sm text-neutral-600 font-medium tracking-wide">
                  {currentStepData.text}
                  </p>
            </motion.div>
          </AnimatePresence>
        </div>

            {/* Refined Progress Bar */}
        <div className="space-y-2">
              <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            />
          </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

