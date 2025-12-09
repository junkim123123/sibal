'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Progress-based steps (0.5초마다 변경)
const PROGRESS_STEPS = [
  { min: 0, max: 20, text: 'Scanning Product Image...' },
  { min: 20, max: 40, text: 'Matching 500+ Suppliers in Database...' },
  { min: 40, max: 60, text: 'Calculating Real-time Freight Rates...' },
  { min: 60, max: 80, text: 'Checking US Customs Duty (HTS Codes)...' },
  { min: 80, max: 100, text: 'Finalizing Profit Simulation...' },
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
  const [progress, setProgress] = useState(0);

  // Progress bar animation (smooth and pulsing)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Stop at 95% until actual completion
        return prev + Math.random() * 2.5 + 0.5; // Slower, smoother increment
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Get current step text based on progress (updates every 0.5 seconds)
  const [displayText, setDisplayText] = useState(PROGRESS_STEPS[0].text);
  
  useEffect(() => {
    const getCurrentStep = () => {
      const step = PROGRESS_STEPS.find(
        (s) => progress >= s.min && progress < s.max
      ) || PROGRESS_STEPS[PROGRESS_STEPS.length - 1];
      return step.text;
    };

    // Update immediately when progress changes
    setDisplayText(getCurrentStep());

    // Also update every 0.5 seconds to ensure smooth transitions
    const interval = setInterval(() => {
      setDisplayText(getCurrentStep());
    }, 500);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative">
      {/* Background Pattern */}
      <SubtleGridPattern />
      
      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
          <div className="space-y-8">
            {/* Dynamic Animation: Map Route + Radar Scan */}
            <div className="flex justify-center">
              <div className="relative w-64 h-48">
                {/* Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
                  {/* Origin Point (Factory) */}
                  <div className="absolute left-8 top-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-3 h-3 bg-blue-600 rounded-full"
                    />
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-neutral-500 whitespace-nowrap">
                      Factory
                    </div>
                  </div>

                  {/* Destination Point (Nexy) */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                      }}
                      className="w-3 h-3 bg-green-600 rounded-full"
                    />
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-neutral-500 whitespace-nowrap">
                      Nexy
                    </div>
                  </div>

                  {/* Animated Dashed Line (Route) */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    {/* Base dashed line */}
                    <line
                      x1="32"
                      y1="96"
                      x2="224"
                      y2="96"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                    />
                    {/* Animated path */}
                    <motion.line
                      x1="32"
                      y1="96"
                      x2="224"
                      y2="96"
                      stroke="url(#dashed-gradient)"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    {/* Moving dot along the route */}
                    <motion.circle
                      cx="32"
                      cy="96"
                      r="4"
                      fill="#3b82f6"
                      animate={{
                        cx: [32, 224, 32],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <defs>
                      <linearGradient id="dashed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Radar Scan Effect (overlay) - Multiple layers for depth */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    {/* Primary scan line */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent"
                      animate={{
                        y: [0, 192, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
                      }}
                    />
                    {/* Secondary scan line (trailing) */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
                      animate={{
                        y: [0, 192, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.3,
                      }}
                    />
                    {/* Fade effect behind scan */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-500/10 to-transparent"
                      animate={{
                        y: [0, 192, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                </div>
              </div>
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

            {/* Status Text - Updates based on progress */}
            <div className="h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <p className="text-sm text-neutral-600 font-normal">
                    {displayText}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Smooth Progress Bar with Pulsing Effect */}
            <div className="space-y-2">
              <div className="h-1 bg-neutral-100 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-neutral-700 to-neutral-900 rounded-full relative"
                >
                  {/* Pulsing glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-neutral-900 rounded-full"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

