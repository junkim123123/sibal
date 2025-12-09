'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ContractCTACardProps {
  bookingUrl?: string;
  contractUrl?: string;
  onBookingClick?: () => void;
  onContractClick?: () => void;
}

/**
 * ContractCTACard
 * 
 * CTA card shown after analysis results to guide users to next steps:
 * - Schedule a consultation
 * - Request a custom quote/contract
 */
export function ContractCTACard({ 
  bookingUrl, 
  contractUrl,
  onBookingClick,
  onContractClick,
}: ContractCTACardProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Ready to turn this into a real sourcing project?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          NexSupply can handle factory search, negotiation, testing, QC, and logistics for this exact product based on the answers you just provided. Get a detailed quote and contract to move forward.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {bookingUrl && (
            <Button 
              asChild 
              className="flex-1"
              onClick={onBookingClick}
            >
              <a 
                href={bookingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Book a sourcing call
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          {contractUrl && (
            <Button 
              asChild 
              variant="outline"
              className="flex-1"
              onClick={onContractClick}
            >
              <a 
                href={contractUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Request a full quote and contract
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

