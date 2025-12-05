/**
 * Sourcing Brief Steps Configuration
 * 
 * Phase 1 MVP: Welcome, Section A (Product Basics), Section D (Contact)
 * 
 * This is the single source of truth for the sourcing brief conversation flow.
 */

import type { SourcingBriefStep } from '@/lib/types/sourcingBriefSteps';

export const sourcingBriefSteps: SourcingBriefStep[] = [
  // Welcome
  {
    id: 'welcome',
    section: 'welcome',
    order: 0,
    nexMessage: 'Hi! I\'ll help you create a sourcing brief. This usually takes 3–4 minutes. Ready to start?',
    helperText: 'About 3 minutes',
    answerKind: 'chips_single',
    options: [
      { value: 'start', label: 'Get Started' },
      { value: 'new_request', label: 'New Sourcing Request' },
      { value: 'shipping_check', label: 'Check Shipping Cost' },
      { value: 'compliance_check', label: 'Check Regulations' },
    ],
  },
  
  // Section A: Product Basics
  {
    id: 'product_name',
    section: 'product_basics',
    order: 1,
    nexMessage: 'What product are you looking for? Please paste the product name or link. (e.g., "wireless mouse" or Alibaba link)',
    helperText: 'Our AI will analyze the product and provide standardized suggestions.',
    answerKind: 'text_with_suggestions',
    placeholder: 'Enter product name or link...',
    required: true,
  },
  {
    id: 'quantity',
    section: 'product_basics',
    order: 2,
    nexMessage: 'What quantity do you need?',
    helperText: 'Providing an approximate quantity helps us give you an accurate quote.',
    answerKind: 'chips_single',
    options: [
      { value: '<100', label: '<100' },
      { value: '100-999', label: '100–999' },
      { value: '1k-5k', label: '1k–5k' },
      { value: '5k+', label: '5k+' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    required: false,
  },
  {
    id: 'image_upload',
    section: 'product_basics',
    order: 3,
    nexMessage: 'Upload product images or product page links. (Optional)',
    helperText: 'JPG, PNG, PDF, max 10MB',
    answerKind: 'file_upload',
    required: false,
  },
  
  // Section B: Packaging & Logistics
  {
    id: 'packaging_type',
    section: 'packaging_logistics',
    order: 4,
    nexMessage: 'Please select the packaging type.',
    helperText: 'Knowing the packaging method helps us calculate accurate costs.',
    answerKind: 'chips_single',
    options: [
      { value: 'retail_box', label: 'Retail box' },
      { value: 'polybag', label: 'Polybag' },
      { value: 'bulk', label: 'Bulk' },
      { value: 'custom', label: 'Custom' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    required: false,
  },
  {
    id: 'dimensions',
    section: 'packaging_logistics',
    order: 5,
    nexMessage: 'Please provide the product dimensions and weight.',
    helperText: 'Enter W × H × D (width × height × depth) and weight.',
    answerKind: 'number',
    placeholder: 'Enter dimensions',
    required: false,
  },
  {
    id: 'incoterms',
    section: 'packaging_logistics',
    order: 6,
    nexMessage: 'Please select the Incoterms (trade terms).',
    helperText: 'Also let us know the origin and destination information.',
    answerKind: 'chips_single',
    options: [
      { value: 'EXW', label: 'EXW (Ex Works)' },
      { value: 'FOB', label: 'FOB (Free On Board)' },
      { value: 'CIF', label: 'CIF (Cost, Insurance, Freight)' },
      { value: 'DDP', label: 'DDP (Delivered Duty Paid)' },
      { value: 'DDU', label: 'DDU (Delivered Duty Unpaid)' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    required: false,
  },
  
  // Section C: Compliance & Special Handling
  {
    id: 'hazardous',
    section: 'compliance',
    order: 7,
    nexMessage: 'Is this a hazardous material?',
    helperText: 'Does it contain batteries, liquids, powders, or other hazardous materials?',
    answerKind: 'chips_single',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    required: false,
  },
  {
    id: 'certifications',
    section: 'compliance',
    order: 8,
    nexMessage: 'Please select the required certifications.',
    helperText: 'Select certifications required by your target market.',
    answerKind: 'chips_multi',
    options: [
      { value: 'FDA', label: 'FDA' },
      { value: 'CE', label: 'CE' },
      { value: 'RoHS', label: 'RoHS' },
      { value: 'UL', label: 'UL' },
      { value: 'FCC', label: 'FCC' },
      { value: 'other', label: 'Other' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    required: false,
  },
  {
    id: 'temperature',
    section: 'compliance',
    order: 9,
    nexMessage: 'Please provide temperature and handling requirements.',
    helperText: 'Does it require special temperature control?',
    answerKind: 'chips_single',
    options: [
      { value: 'room_temp', label: 'Room Temperature' },
      { value: 'refrigerated', label: 'Refrigerated' },
      { value: 'frozen', label: 'Frozen' },
      { value: 'sensitive', label: 'Sensitive Items' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    required: false,
  },
  
  // Section D: Contact
  {
    id: 'email',
    section: 'budget_schedule_contact',
    order: 10,
    nexMessage: 'Please provide your email address. We\'ll send you a quote.',
    helperText: 'Email is required.',
    answerKind: 'email',
    placeholder: 'your@email.com',
    required: true,
  },
  {
    id: 'name',
    section: 'budget_schedule_contact',
    order: 11,
    nexMessage: 'Please provide your name. (Optional)',
    helperText: 'Used to provide personalized service.',
    answerKind: 'text',
    placeholder: 'Name',
    required: false,
  },
  {
    id: 'company',
    section: 'budget_schedule_contact',
    order: 12,
    nexMessage: 'Please provide your company name. (Optional)',
    helperText: 'Company information helps us provide more accurate quotes.',
    answerKind: 'text',
    placeholder: 'Company name',
    required: false,
  },
  
  // Review
  {
    id: 'review',
    section: 'review',
    order: 13,
    nexMessage: 'Please review your information. Verify that all details are correct before submitting.',
    answerKind: 'chips_single',
    options: [
      { value: 'submit', label: 'Submit Request' },
      { value: 'edit', label: 'Edit' },
    ],
  },
];

/**
 * Get step by ID
 */
export function getStepById(stepId: string): SourcingBriefStep | undefined {
  return sourcingBriefSteps.find(step => step.id === stepId);
}

/**
 * Get next step in sequence
 */
export function getNextStep(currentStepId: string): SourcingBriefStep | null {
  const currentStep = getStepById(currentStepId);
  if (!currentStep) return null;
  
  const currentIndex = sourcingBriefSteps.findIndex(s => s.id === currentStep.id);
  if (currentIndex === -1 || currentIndex === sourcingBriefSteps.length - 1) {
    return null;
  }
  
  return sourcingBriefSteps[currentIndex + 1];
}

/**
 * Get first step
 */
export function getFirstStep(): SourcingBriefStep {
  return sourcingBriefSteps[0];
}

