/**
 * Sourcing Brief Step Model
 * 
 * Defines the structure for sourcing brief conversation steps.
 * Each step knows its question, answer type, and which UI component to render.
 */

export type SourcingBriefAnswerKind =
  | "text"
  | "text_with_suggestions"
  | "chips_single"
  | "chips_multi"
  | "number"
  | "file_upload"
  | "email"
  | "date_range";

export type SourcingBriefStepId =
  | "welcome"
  | "product_name"
  | "quantity"
  | "image_upload"
  | "packaging_type"
  | "dimensions"
  | "incoterms"
  | "hazardous"
  | "certifications"
  | "temperature"
  | "email"
  | "name"
  | "company"
  | "review";

export interface SourcingBriefStep {
  id: SourcingBriefStepId;
  section: "welcome" | "product_basics" | "packaging_logistics" | "compliance" | "budget_schedule_contact" | "review";
  order: number;
  nexMessage: string;
  helperText?: string;
  answerKind: SourcingBriefAnswerKind;
  // Optional configs
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  skipIfEmpty?: boolean;
}

