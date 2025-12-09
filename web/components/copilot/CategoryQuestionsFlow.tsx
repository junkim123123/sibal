/**
 * CategoryQuestionsFlow
 * 
 * Manages the flow of category-specific questions after analysis.
 * Shows one question at a time and collects answers.
 */

'use client';

import { useState, useEffect } from 'react';
import type { CategoryQuestion } from '@/lib/types/categoryQuestions';
import { CategoryQuestionCard } from './CategoryQuestionCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface CategoryQuestionsFlowProps {
  questions: CategoryQuestion[];
  onComplete: (answers: Record<string, string>) => void;
  onSkip?: () => void;
  disabled?: boolean;
}

export function CategoryQuestionsFlow({ 
  questions, 
  onComplete, 
  onSkip,
  disabled = false 
}: CategoryQuestionsFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion?.id] !== undefined;

  useEffect(() => {
    // Reset if questions change
    setCurrentIndex(0);
    setAnswers({});
    setCompleted(false);
  }, [questions]);

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All questions answered
        setCompleted(true);
        onComplete(newAnswers);
      }
    }, 500);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      // Default: skip to next question or complete
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete(answers);
      }
    }
  };

  if (completed) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <div className="p-6 text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold mb-2">Thank you for your answers!</h3>
          <p className="text-sm text-muted-foreground">
            Your responses will help us provide more accurate analysis in the future.
          </p>
        </div>
      </Card>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </p>
        {onSkip && (
          <button
            onClick={handleSkip}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Skip
          </button>
        )}
      </div>

      {/* Current question */}
      <CategoryQuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        disabled={disabled}
      />

      {/* Manual navigation (optional) */}
      {hasAnsweredCurrent && !isLastQuestion && (
        <div className="flex justify-end">
          <Button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            variant="outline"
            disabled={disabled}
            className="text-sm"
          >
            Next Question
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

