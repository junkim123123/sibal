// Reusable marketing card component with consistent styling
import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface MarketingCardProps {
  children: ReactNode;
  className?: string;
}

export function MarketingCard({ children, className = '' }: MarketingCardProps) {
  return (
    <Card className={`bg-transparent border-neutral-200 shadow-sm ${className}`}>
      {children}
    </Card>
  );
}

