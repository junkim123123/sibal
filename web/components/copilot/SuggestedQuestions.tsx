'use client';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Can I import baby teethers to the US?',
  'What are the duty and certification costs for stainless steel tumblers?',
  'What tests do I need to sell in Europe?',
  'What should I watch out for when sourcing from China?',
];

export function SuggestedQuestions({ onSelect, disabled = false }: SuggestedQuestionsProps) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-muted-foreground mb-2">💡 Example questions:</p>
      <div className="flex flex-col gap-2">
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="text-left text-sm px-3 py-2 rounded-lg bg-surface border border-subtle-border hover:bg-surface/80 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

