'use client';

import { Button } from '@/components/ui/button';

interface QuickReplyButtonsProps {
  onSelect: (text: string) => void;
  onNeedHelp?: () => void;
  disabled?: boolean;
}

const QUICK_REPLIES = [
  { label: 'Baby Products', text: 'US baby teether toy (silicone)' },
  { label: 'Kitchenware', text: 'Stainless steel tumbler water bottle' },
  { label: 'Electronics', text: 'Wireless phone charger' },
  { label: 'Apparel', text: 'Cotton t-shirt' },
];

export function QuickReplyButtons({ onSelect, onNeedHelp, disabled = false }: QuickReplyButtonsProps) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_REPLIES.map((reply) => (
          <Button
            key={reply.label}
            variant="outline"
            size="sm"
            onClick={() => onSelect(reply.text)}
            disabled={disabled}
            className="text-sm"
          >
            {reply.label}
          </Button>
        ))}
      </div>
      {onNeedHelp && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onNeedHelp}
          disabled={disabled}
          className="text-sm text-muted-foreground"
        >
          Not sure?
        </Button>
      )}
    </div>
  );
}

