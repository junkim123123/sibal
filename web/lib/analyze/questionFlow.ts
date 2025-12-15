/**
 * Question Flow Schema for Dr B style conversational intake
 * 
 * This defines the structure and flow of questions asked during
 * the product analysis intake process.
 * 
 * TODO: Move question logic to backend API for dynamic flows
 * TODO: Add conditional branching based on answers
 */

export type InputType = "text" | "number" | "singleChoice" | "multiChoice" | "upload";

export type Choice = {
  label: string;
  value: string;
};

export type QuestionNode = {
  id: string;
  step: number;
  question: string;
  inputType: InputType;
  choices?: Choice[];
  optional?: boolean;
  next?: (answer: any) => string | null;
  helpText?: string;
};

/**
 * Helper function to determine next question based on answer
 * Handles conditional branching based on user responses
 */
export function getNextQuestionId(currentId: string, answer?: any, allAnswers?: Record<string, any>): string | null {
  // Static flow for product/logistics intake (q1-q12)
  const staticFlow: Record<string, string> = {
    q1: 'q2',
    q2: 'q3',
    q3: 'q4',
    q4: 'q5',
    q5: 'q6',
    q6: 'q7',
    q7: 'q8',
    q8: 'q9',
    q9: 'q10',
    q10: 'q11',
    q11: 'q12',
    q12: 'summary',
    summary: 'q13', // After summary, branch into sales consultation
  };

  // Sales consultation flow with conditional branching
  if (currentId === 'q13') {
    return 'q14'; // Always go to q14 after q13
  }

  if (currentId === 'q14') {
    // Branch based on q14 answer
    if (answer === 'yes_call') {
      // Strong positive path: continue to q15, q16, q17
      return 'q15';
    } else if (answer === 'maybe_later' || answer === 'no_call') {
      // Hesitant or negative: still ask for contact info but softer
      // For now, we can skip to final message, or still ask q15 optionally
      // Let's still ask for contact info but make it optional
      return 'q15';
    }
    return null;
  }

  if (currentId === 'q15') {
    // Check q14 answer to determine if we continue or end
    const q14Answer = allAnswers?.q14;
    if (q14Answer === 'yes_call') {
      return 'q16_budget'; // Continue full flow
    } else {
      // Hesitant path: skip budget/timeline and consult question
      return 'final_thanks'; // Go to final message
    }
  }

  if (currentId === 'q16_budget') {
    return 'q16_timeline';
  }

  if (currentId === 'q16_timeline') {
    return 'q17';
  }

  if (currentId === 'q17') {
    return 'final_thanks'; // End of flow
  }

  // Use static flow for product intake questions
  return staticFlow[currentId] || null;
}

/**
 * Main question flow array
 * Questions are asked in order, one at a time
 */
export const QUESTION_FLOW: QuestionNode[] = [
  {
    id: 'q1',
    step: 1,
    question: 'What product would you like to analyze? You can share an image, an Alibaba/Aliexpress link, or describe it in your own words.',
    inputType: 'upload',
    optional: false,
  },
  {
    id: 'q2',
    step: 2,
    question: 'Which category best matches your product?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Electronics & Tech', value: 'electronics' },
      { label: 'Home & Kitchen', value: 'home_kitchen' },
      { label: 'Health & Beauty', value: 'health_beauty' },
      { label: 'Baby & Kids', value: 'baby_kids' },
      { label: 'Fashion & Accessories', value: 'fashion' },
      { label: 'Sports & Outdoors', value: 'sports' },
      { label: 'Not sure', value: 'not_sure' },
    ],
    optional: false,
  },
  {
    id: 'q3',
    step: 3,
    question: 'Please provide a one-line description of your product and your intended retail price or price range.',
    inputType: 'text',
    optional: false,
    helpText: 'Example: "Wireless noise-cancelling headphones, target retail $79-99"',
  },
  {
    id: 'q4',
    step: 4,
    question: 'What stage is this product at?',
    inputType: 'singleChoice',
    choices: [
      { label: 'New test product - exploring feasibility', value: 'new_test' },
      { label: 'Existing product - checking cost structure', value: 'existing' },
      { label: 'Scaling up an already working product', value: 'scaling' },
    ],
    optional: false,
  },
  {
    id: 'q5',
    step: 5,
    question: 'What is your main sales channel?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Amazon FBA', value: 'amazon_fba' },
      { label: 'Amazon FBM', value: 'amazon_fbm' },
      { label: 'TikTok Shop', value: 'tiktok' },
      { label: 'Shopify / DTC', value: 'shopify' },
      { label: 'Retail / Wholesale', value: 'retail' },
      { label: 'Multiple channels', value: 'multiple' },
    ],
    optional: false,
  },
  {
    id: 'q6',
    step: 6,
    question: 'What is your main destination market?',
    inputType: 'singleChoice',
    choices: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
      { label: 'United Kingdom', value: 'UK' },
      { label: 'European Union', value: 'EU' },
      { label: 'Australia', value: 'AU' },
      { label: 'Other', value: 'other' },
    ],
    optional: false,
  },
  {
    id: 'q7',
    step: 7,
    question: 'Where do you expect to source this product from?',
    inputType: 'singleChoice',
    choices: [
      { label: 'China', value: 'CN' },
      { label: 'South Korea', value: 'KR' },
      { label: 'Vietnam', value: 'VN' },
      { label: 'Other Asia', value: 'other_asia' },
      { label: 'Not sure', value: 'unknown' },
    ],
    optional: false,
  },
  {
    id: 'q8',
    step: 8,
    question: 'What trade term do you prefer?',
    inputType: 'singleChoice',
    choices: [
      { label: 'FOB (Free On Board) - You handle shipping from port', value: 'FOB' },
      { label: 'CIF (Cost, Insurance, Freight) - Supplier handles shipping to your port', value: 'CIF' },
      { label: 'DDP (Delivered Duty Paid) - Door-to-door delivery, all-inclusive', value: 'DDP' },
      { label: 'Not sure - help me decide', value: 'not_sure' },
    ],
    optional: false,
  },
  {
    id: 'q9',
    step: 9,
    question: 'What matters more to you: speed or cost?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Speed - fastest delivery possible', value: 'speed' },
      { label: 'Cost - lowest landed cost', value: 'cost' },
      { label: 'Balanced - good mix of both', value: 'balanced' },
    ],
    optional: false,
  },
  {
    id: 'q10',
    step: 10,
    question: 'What is your rough monthly volume?',
    inputType: 'number',
    optional: false,
    helpText: 'Enter the number of units you plan to order per month',
  },
  {
    id: 'q11',
    step: 11,
    question: 'What is your risk tolerance when selecting suppliers?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Safe suppliers - proven track record, higher cost', value: 'safe' },
      { label: 'Lowest cost - willing to work with newer suppliers', value: 'lowest_cost' },
      { label: 'Balanced - good quality at reasonable price', value: 'balanced' },
    ],
    optional: false,
  },
  {
    id: 'q12',
    step: 12,
    question: 'Any special requirements or notes? (optional)',
    inputType: 'text',
    optional: true,
    helpText: 'Certifications, customizations, packaging requirements, etc.',
  },
  {
    id: 'summary',
    step: 13,
    question: 'Summary',
    inputType: 'text',
    optional: false,
    helpText: 'Review your answers below and click "Run analysis" to proceed.',
  },
  {
    id: 'q13',
    step: 14,
    question: 'Is this product something you seriously might place a real order for, or is it more of an idea you are exploring?',
    inputType: 'singleChoice',
    choices: [
      { label: 'This is a serious candidate for a real order', value: 'serious' },
      { label: 'It is an idea now but could become a real project later', value: 'idea_later' },
      { label: 'I am just playing with the numbers for now', value: 'exploring' },
    ],
    optional: false,
  },
  {
    id: 'q14',
    step: 15,
    question: 'Based on this analysis, would you be open to a short call with the NexSupply team within 1 business day to turn this into a real sourcing project?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Yes, let us schedule a call', value: 'yes_call' },
      { label: 'Maybe later - I am interested but not ready yet', value: 'maybe_later' },
      { label: 'No call for now - just show me the analysis', value: 'no_call' },
    ],
    optional: false,
  },
  {
    id: 'q15',
    step: 16,
    question: 'Where is the best place for us to contact you about this project? Email or a messaging app handle is both fine.',
    inputType: 'text',
    optional: true, // Can be optional if user is hesitant
  },
  {
    id: 'q16_budget',
    step: 17,
    question: 'Roughly what scale do you have in mind for this project?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Test level - under $5k total manufacturing cost', value: 'under_5k' },
      { label: 'Mid level - about $5k to $20k', value: '5k_to_20k' },
      { label: 'Scale up - above $20k is possible', value: 'above_20k' },
    ],
    optional: false,
    helpText: 'This helps NexSupply prioritize projects and tailor the quote.',
  },
  {
    id: 'q16_timeline',
    step: 18,
    question: 'When would you ideally like this project to launch?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Within 3 months', value: '3_months' },
      { label: 'Within 6 months', value: '6_months' },
      { label: 'Timeline is flexible', value: 'flexible' },
    ],
    optional: false,
    helpText: 'This helps NexSupply prioritize projects and tailor the quote.',
  },
  {
    id: 'q17',
    step: 19,
    question: 'Do you want to move forward to this paid consult with the NexSupply team?',
    inputType: 'singleChoice',
    choices: [
      { label: 'Yes, continue to the paid consult', value: 'yes_consult' },
      { label: 'Not now - just keep the report', value: 'no_consult' },
    ],
    optional: false,
  },
];

/**
 * Get question node by ID
 */
export function getQuestionById(id: string): QuestionNode | undefined {
  return QUESTION_FLOW.find(q => q.id === id);
}

/**
 * Get all question IDs in order
 */
export function getAllQuestionIds(): string[] {
  return QUESTION_FLOW.map(q => q.id);
}

