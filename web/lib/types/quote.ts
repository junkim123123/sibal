/**
 * Factory Quote Types
 * 
 * Visual Quote Comparison 기능을 위한 TypeScript 타입 정의
 */

export type QuoteRiskLevel = 'Low' | 'Medium' | 'High';
export type QuoteStatus = 'pending' | 'selected' | 'rejected';

/**
 * Factory Quote (공장 견적)
 */
export interface FactoryQuote {
  id: string;
  project_id: string;
  factory_name: string;
  is_recommended: boolean;
  unit_price: number;
  moq: number; // Minimum Order Quantity
  lead_time_days: number;
  sample_cost: number | null;
  pros: string[];
  cons: string[];
  risk_level: QuoteRiskLevel;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Create Factory Quote Input
 */
export interface CreateFactoryQuoteInput {
  project_id: string;
  factory_name: string;
  is_recommended?: boolean;
  unit_price: number;
  moq: number;
  lead_time_days: number;
  sample_cost?: number;
  pros?: string[];
  cons?: string[];
  risk_level?: QuoteRiskLevel;
}

/**
 * Create Multiple Quotes Input (배치 생성)
 */
export interface CreateQuotesInput {
  project_id: string;
  quotes: CreateFactoryQuoteInput[];
}

/**
 * Select Quote Input
 */
export interface SelectQuoteInput {
  project_id: string;
  quote_id: string;
}
