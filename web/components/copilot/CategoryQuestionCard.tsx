/**
 * CategoryQuestionCard
 * 
 * Displays category-specific questions to gather additional context
 * for more accurate analysis. Used after initial analysis is complete.
 */

'use client';

import { useState } from 'react';
import type { CategoryQuestion } from '@/lib/types/categoryQuestions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle2 } from 'lucide-react';

interface CategoryQuestionCardProps {
  question: CategoryQuestion;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

export function CategoryQuestionCard({ question, onAnswer, disabled = false }: CategoryQuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [numberAnswer, setNumberAnswer] = useState('');
  const [answered, setAnswered] = useState(false);

  const handleSubmit = () => {
    let answer = '';
    
    if (question.type === 'multiple_choice' || question.type === 'yes_no') {
      answer = selectedAnswer || '';
    } else if (question.type === 'text') {
      answer = textAnswer.trim();
    } else if (question.type === 'number') {
      answer = numberAnswer.trim();
    }

    if (answer) {
      onAnswer(question.id, answer);
      setAnswered(true);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (disabled || answered) return;
    setSelectedAnswer(option);
  };

  if (answered) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <div className="p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">{question.question}</p>
            <p className="text-sm text-muted-foreground">
              Answer: <span className="font-medium text-foreground">
                {selectedAnswer || textAnswer || numberAnswer}
              </span>
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-base font-semibold text-foreground flex-1">{question.question}</h3>
            {question.importance === 'high' && (
              <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                Important
              </span>
            )}
          </div>
          {question.helpText && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{question.helpText}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {question.type === 'multiple_choice' && question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  disabled={disabled}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedAnswer === option
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-subtle-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-foreground'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-sm font-medium">{option}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === 'yes_no' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleOptionSelect('Yes')}
                disabled={disabled}
                className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                  selectedAnswer === 'Yes'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-subtle-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-foreground'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-base font-semibold">Yes</span>
              </button>
              <button
                onClick={() => handleOptionSelect('No')}
                disabled={disabled}
                className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                  selectedAnswer === 'No'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-subtle-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-foreground'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-base font-semibold">No</span>
              </button>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={disabled}
              placeholder="Type your answer here..."
              className="w-full min-h-[100px] p-3 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          )}

          {question.type === 'number' && (
            <input
              type="number"
              value={numberAnswer}
              onChange={(e) => setNumberAnswer(e.target.value)}
              disabled={disabled}
              placeholder="Enter a number..."
              className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}

          {(selectedAnswer || (question.type === 'text' && textAnswer.trim()) || (question.type === 'number' && numberAnswer.trim())) && (
            <Button
              onClick={handleSubmit}
              disabled={disabled}
              className="w-full"
            >
              Submit Answer
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

