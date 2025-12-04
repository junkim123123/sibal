// Config for Use Cases page
import { ShoppingCart, Store, Building2, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SellerType {
  label: string;
  outcomeStatement: string;
  description: string;
  keyProjects: Array<{
    title: string;
    decision: string;
  }>;
  icon: LucideIcon;
  recommendedAction: string;
}

export interface ProjectGoal {
  title: string;
  body: string;
  scope: string;
  timeline: string;
  positioning: string;
}

export interface WorkflowStep {
  title: string;
  body: string;
}

export interface Testimonial {
  segmentTag: string;
  context: string;
  quote: string;
  attribution: string;
}

export interface UseCasesPageConfig {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
  };
  sellerTypes: {
    title: string;
    items: SellerType[];
  };
  projectGoals: {
    title: string;
    items: ProjectGoal[];
  };
  workflow: {
    title: string;
    subtitle: string;
    items: WorkflowStep[];
  };
  pricing: {
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      items: string[];
    }>;
  };
  testimonials: {
    title: string;
    subtitle: string;
    note: string;
    items: Testimonial[];
  };
  cta: {
    title: string;
    description: string;
    note: string;
    buttonLabel: string;
    buttonHref: string;
  };
}

export const useCasesPageConfig: UseCasesPageConfig = {
  hero: {
    title: 'Who NexSupply helps',
    subtitle: 'Use cases for Amazon sellers, DTC brands, offline retail buyers, and trading companies—all in one place.',
    ctaLabel: 'Start a project',
  },
  sellerTypes: {
    title: 'Who NexSupply is for',
    items: [
      {
        label: 'Amazon FBA private label',
        outcomeStatement: 'Sellers who want to validate margins and duty risks before launching a new PL product.',
        description: 'For sellers who want to launch or re-source SKUs with clear landed cost and compliance.',
        keyProjects: [
          {
            title: 'Launch a new FBA brand or product line',
            decision: 'Confirm whether a new product still makes profit after FBA fees, shipping, and duties',
          },
          {
            title: 'Re-source an existing SKU to improve margin',
            decision: 'Compare keeping current factory vs switching to a new supplier for better unit economics',
          },
          {
            title: 'Check AD/CVD and restricted category risk',
            decision: 'Identify compliance flags before committing to inventory in a new category',
          },
          {
            title: 'Compare FBA vs 3PL landed costs',
            decision: 'Choose the most cost-effective fulfillment channel for your product',
          },
        ],
        icon: ShoppingCart,
        recommendedAction: 'If this matches your situation, start with one of the projects below.',
      },
      {
        label: 'DTC / Shopify brands',
        outcomeStatement: 'Founders who need to protect margin while scaling into new products or regions.',
        description: 'For founders who need to protect margin while scaling into new products or regions.',
        keyProjects: [
          {
            title: 'Per unit cost analysis with DTC fees in mind',
            decision: 'See true margins after ad spend, fulfillment, and platform fees before scaling',
          },
          {
            title: 'Packaging and fulfillment that works with 3PLs',
            decision: 'Optimize packaging and case packs for 3PL-friendly shipping and storage',
          },
          {
            title: 'Adding new SKUs without breaking cash flow',
            decision: 'Test new products with small pilot orders before committing to large inventory',
          },
          {
            title: 'Planning a move into US or EU markets',
            decision: 'Understand landed cost differences and compliance requirements for new markets',
          },
        ],
        icon: Store,
        recommendedAction: 'If this matches your situation, start with one of the projects below.',
      },
      {
        label: 'Offline retail / wholesale',
        outcomeStatement: 'Buyers making container-level decisions who need numbers they can defend internally.',
        description: 'For buyers making container-level decisions who need numbers they can defend internally.',
        keyProjects: [
          {
            title: 'Case pack and master carton optimization',
            decision: 'Determine optimal case pack sizes for retail shelf space and shipping efficiency',
          },
          {
            title: 'Pallet and container level shipping scenarios',
            decision: 'Compare different shipping methods and volumes to find the best cost structure',
          },
          {
            title: 'Bulk pricing and supplier negotiation support',
            decision: 'Benchmark factory quotes and negotiate better terms with data-backed analysis',
          },
          {
            title: 'Comparing multiple factories for the same item',
            decision: 'Evaluate suppliers on cost, quality, and risk to make an informed choice',
          },
        ],
        icon: Building2,
        recommendedAction: 'If this matches your situation, start with one of the projects below.',
      },
      {
        label: 'Importers / trading companies',
        outcomeStatement: 'Teams managing many SKUs who need fast, structured checks instead of ad-hoc spreadsheets.',
        description: 'For teams managing many SKUs who need fast, structured checks instead of ad-hoc spreadsheets.',
        keyProjects: [
          {
            title: 'Multi-product portfolio cost and risk review',
            decision: 'Get a unified view of costs and risks across your entire product line',
          },
          {
            title: 'Cross-border compliance checks by HS code',
            decision: 'Verify duty rates and compliance requirements for multiple products at once',
          },
          {
            title: 'Supplier relationship and performance review',
            decision: 'Standardize how you evaluate and compare suppliers across different projects',
          },
          {
            title: 'Standardized pilot process for new factories',
            decision: 'Test new suppliers with a consistent, low-risk pilot process',
          },
        ],
        icon: Globe,
        recommendedAction: 'If this matches your situation, start with one of the projects below.',
      },
    ],
  },
  projectGoals: {
    title: 'Common projects we help with',
    items: [
      {
        title: 'Launch a new product',
        body: 'Quickly test if a new idea still makes sense after landed cost, duties and fees.',
        scope: '1 SKU, 1 market',
        timeline: 'Typically 1 week for initial report',
        positioning: 'Best for first-time clients',
      },
      {
        title: 'Re-source an existing SKU',
        body: 'Benchmark new factories and routes when your current supplier is too expensive or risky.',
        scope: '1 SKU, multiple supplier options',
        timeline: 'Typically 1–2 weeks for comparison',
        positioning: 'When you need to improve margins',
      },
      {
        title: 'Test a higher-risk category',
        body: 'Explore products with extra compliance or AD/CVD risk without committing to a huge order.',
        scope: '1 SKU, risk-focused analysis',
        timeline: 'Typically 1 week for risk assessment',
        positioning: 'Before entering a new category',
      },
      {
        title: 'Clean up a messy supply chain',
        body: 'Bring quotes, duties, QC and logistics into one view so you can make decisions faster.',
        scope: 'Multiple SKUs, unified view',
        timeline: 'Typically 2 weeks for full review',
        positioning: 'When you need clarity across projects',
      },
    ],
  },
  workflow: {
    title: 'How NexSupply fits into your workflow',
    subtitle: 'Every use case follows the same simple path from idea to first shipment.',
    items: [
      {
        title: 'Share your idea',
        body: 'Pick a seller type and project from this page, then share your product idea. We capture the key details in a structured brief.',
      },
      {
        title: 'Get a cost and risk snapshot',
        body: 'We generate a snapshot tailored to your use case—whether it\'s Amazon FBA, DTC, retail, or trading. The format clearly shows your channel-specific costs.',
      },
      {
        title: 'Decide how far to go',
        body: 'You can stop at the analysis, book a call to go deeper, or move forward to factory search and a pilot order.',
      },
    ],
  },
  pricing: {
    title: 'What does it cost',
    subtitle: 'Simple pricing while we are in alpha.',
    cards: [
      {
        title: 'Analysis and planning',
        items: [
          'From $149 per product analysis during alpha',
          'Includes AI report and one review call (typically 30+ minutes of analysis)',
          'No subscription or long term contract during alpha',
        ],
      },
      {
        title: 'When orders go through NexSupply',
        items: [
          'Transparent project-based success fee only when you place orders through us',
          'Fee cap on per unit margin so your upside stays protected',
          'Currently focused on imports into the US and selected EU markets',
        ],
      },
    ],
  },
  testimonials: {
    title: 'What importers are saying',
    subtitle: 'Early projects use NexSupply to get clarity on landed cost, lead times and risk before committing.',
    note: 'Results from actual projects',
    items: [
      {
        segmentTag: 'Amazon FBA seller',
        context: 'When launching a new snack category, we were worried about duties and AD/CVD risks.',
        quote: 'Finally a way to sanity check margins and duties before we commit to inventory.',
        attribution: 'FBA seller, CPG category',
      },
      {
        segmentTag: 'Retail buyer',
        context: 'We were exploring a new hardlines category with complex compliance requirements.',
        quote: 'The compliance flags helped us avoid a very expensive mistake on a new category.',
        attribution: 'Retail buyer, hardlines',
      },
      {
        segmentTag: 'Food & Beverage brand manager',
        context: 'We needed to test a new snack product quickly without committing to a large order.',
        quote: 'We used NexSupply to test a new snack product. The whole process felt fast and contained.',
        attribution: 'Brand manager, food and beverage',
      },
    ],
  },
  cta: {
    title: 'Ready to analyze your product?',
    description: 'Pick your seller type and project goal above, then request your first analysis.',
    note: 'We typically respond within 24 hours via email, and schedule a call if needed.',
    buttonLabel: 'Analyze a product',
    buttonHref: '/analyze',
  },
};

