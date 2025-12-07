'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Scale, Package, DollarSign } from 'lucide-react';

const ANALYSIS_STEPS = [
  {
    icon: Search,
    text: 'Analyzing Product Specifications...',
  },
  {
    icon: Globe,
    text: 'Scanning Global Supplier Network...',
  },
  {
    icon: Scale,
    text: 'Calculating HS Codes & Duty Rates...',
  },
  {
    icon: Package,
    text: 'Estimating Logistics & Shipping Volume...',
  },
  {
    icon: DollarSign,
    text: 'Finalizing Landed Cost Simulation...',
  },
];

// Background Pattern Component (Subtle Grid)
function SubtleGridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-neutral-900"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
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
      <SubtleGridPattern />
      
      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
          <div className="space-y-8">
            {/* Minimal Icon with Subtle Animation */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="relative w-16 h-16 flex items-center justify-center"
              >
                <div className="relative z-10 w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
                </div>
              </motion.div>
            </div>

            {/* Typography: Minimal Percentage Number */}
            <div className="text-center">
              <motion.div
                key={Math.round(progress)}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-semibold text-neutral-900 tracking-tight"
              >
                {Math.round(progress)}%
              </motion.div>
            </div>

            {/* Status Text */}
            <div className="h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <p className="text-sm text-neutral-600 font-normal">
                    {currentStepData.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Minimal Progress Bar */}
            <div className="space-y-2">
              <div className="h-0.5 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full bg-neutral-900 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

