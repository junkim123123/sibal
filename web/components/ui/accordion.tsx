'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-neutral-200 last:border-b-0 transition-colors ${
      isOpen ? 'bg-blue-50/30 border-blue-200' : ''
    }`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-5 px-4 flex items-center justify-between text-left hover:text-neutral-900 transition-colors rounded-lg ${
          isOpen ? 'bg-blue-50/50' : ''
        }`}
      >
        <span className="font-medium text-neutral-900 pr-8 text-base flex-1">{question}</span>
        <span className={`flex-shrink-0 text-lg transition-colors ${
          isOpen ? 'text-blue-600' : 'text-neutral-500'
        }`}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 px-4 text-base">
          {answer.split('\n').map((line, idx) => {
            if (idx === 0) {
              return (
                <p key={idx} className="font-semibold text-neutral-900 mb-2 leading-relaxed">
                  {line}
                </p>
              );
            }
            return (
              <p key={idx} className="text-neutral-600 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

