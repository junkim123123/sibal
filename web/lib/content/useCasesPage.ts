// Config for Use Cases page
import { ShoppingCart, Store, Building2, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Segment {
  id: string;
  label: string;
  description: string;
  decisions: string[];
  icon: LucideIcon;
}

export interface CommonProject {
  id: string;
  badge: string;
  title: string;
  summary: string;
  scope: string;
  timeline: string;
}

export interface WorkflowStep {
  id: number;
  title: string;
  body: string;
}

export interface Testimonial {
  id: string;
  role: string;
  quote: string;
  meta: string;
}

export interface UseCasesPageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  segments: Segment[];
  commonProjects: {
    title: string;
    items: CommonProject[];
  };
  workflow: {
    title: string;
    subtitle: string;
    steps: WorkflowStep[];
  };
  pricing: {
    title: string;
    subtitle: string;
    analysis: {
      chip: string;
      title: string;
      bullets: string[];
    };
    orders: {
      chip: string;
      title: string;
      bullets: string[];
    };
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: Testimonial[];
  };
  cta: {
    title: string;
    subtitle: string;
    subtitle2?: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

export const useCasesPageContent: UseCasesPageContent = {
  hero: {
    title: 'Use cases for real import decisions',
    subtitle:
      'From Amazon sellers to retail buyers and trading teams, NexSupply gives each channel a clear view of margin, risk, and execution—all in one place.',
    ctaLabel: 'Start a project',
    ctaHref: '/chat',
  },
  segments: [
    {
      id: 'amazon-fba',
      label: 'Amazon FBA private label',
      description: 'For sellers who want to validate margins and duty risk before launching a new PL product.',
      decisions: [
        'Decide whether a new product still makes sense once FBA fees, shipping, and duties are included.',
        'Compare staying with your current factory vs. moving to a new one for better unit economics.',
      ],
      icon: ShoppingCart,
    },
    {
      id: 'dtc-shopify',
      label: 'DTC and Shopify brands',
      description: 'For brands where ad spend and 3PL fees are a big part of unit economics.',
      decisions: [
        'See true per-unit margins after ads, fulfillment, and platform fees.',
        'Decide how aggressively to test new SKUs without breaking cash flow.',
      ],
      icon: Store,
    },
    {
      id: 'offline-retail',
      label: 'Offline retail and wholesale',
      description: 'For buyers who need container-level decisions they can defend in internal meetings.',
      decisions: [
        'Optimize case-pack and master carton setups for retail shelf space and shipping efficiency.',
        'Compare pallet and container-level shipping scenarios for the best cost structure.',
      ],
      icon: Building2,
    },
    {
      id: 'importers-trading',
      label: 'Importers and trading companies',
      description: 'For teams managing many SKUs who need fast, structured checks instead of ad-hoc spreadsheets.',
      decisions: [
        'Get a portfolio-level view of cost and risk across your entire import line.',
        'Standardize how you evaluate suppliers and pilot new factories.',
      ],
      icon: Globe,
    },
  ],
  commonProjects: {
    title: 'Common projects we help with',
    items: [
      {
        id: 'launch-new-product',
        badge: 'Best for first-time clients',
        title: 'Launch a new product',
        summary:
          'You have a new category idea and want to sanity-check margin and duty risk before ordering samples.',
        scope: '1 SKU, 1 primary market.',
        timeline: 'Typically within 1 week for the first report.',
      },
      {
        id: 're-source-existing-sku',
        badge: 'When you need to improve margins',
        title: 'Re-source an existing SKU',
        summary: 'You want to benchmark new factories or trade terms against your current supplier.',
        scope: '1 SKU with multiple factory options.',
        timeline: 'Usually 1–2 weeks for a comparison view.',
      },
      {
        id: 'test-higher-risk-category',
        badge: 'Before entering a new category',
        title: 'Test a higher-risk category',
        summary:
          "You're interested in a more regulated category but want to understand the compliance and AD/CVD risk first.",
        scope: '1 SKU in a higher-risk or regulated category.',
        timeline: 'Roughly 1 week to map mandatory tests and documents.',
      },
      {
        id: 'clean-up-messy-supply-chain',
        badge: 'When you need clarity across projects',
        title: 'Clean up a messy supply chain',
        summary:
          'You have similar products across multiple factories with different terms and logistics routes.',
        scope: 'Multiple SKUs and factories, using your existing quotes and contract data.',
        timeline: 'Usually about 2 weeks for a full portfolio view and improvement plan.',
      },
    ],
  },
  workflow: {
    title: 'How NexSupply fits into your workflow',
    subtitle: 'Each use case follows the same simple path from idea to first shipment.',
    steps: [
      {
        id: 1,
        title: 'Share your idea',
        body:
          'Pick a seller type and project from this page, then share your product idea. We capture the key details in a structured brief so the analysis fits your real-world constraints.',
      },
      {
        id: 2,
        title: 'Get a cost and risk snapshot',
        body:
          "We generate a snapshot tailored to your use case—whether it's Amazon FBA, DTC, retail, or trading. The report clearly shows channel-specific costs, duties, and key risks.",
      },
      {
        id: 3,
        title: 'Decide how far to go',
        body:
          'You can stop at the AI report, book a call to go deeper, or move forward with factory search and a pilot order. You stay in control of pace, budget, and next steps.',
      },
    ],
  },
  pricing: {
    title: 'What does it cost',
    subtitle: 'Simple project-based pricing while we are in alpha.',
    analysis: {
      chip: 'Analysis only',
      title: 'Analysis and planning',
      bullets: [
        'Flat project fee for each analysis during alpha.',
        'Includes AI report and one review call (typically 30+ minutes).',
        'No subscription or long-term contract during alpha.',
      ],
    },
    orders: {
      chip: 'When you place orders',
      title: 'When orders go through NexSupply',
      bullets: [
        'Transparent project-based success fee only when you place orders through us.',
        'Fee cap on per-unit margin so your upside stays protected.',
        'Currently focused on imports into the US and selected EU markets.',
      ],
    },
  },
  testimonials: {
    title: 'What importers are saying',
    subtitle: 'Early projects use NexSupply to get clarity on landed cost, lead times, and risk before committing.',
    items: [
      {
        id: 'amazon-seller',
        role: 'Amazon FBA seller',
        quote:
          'When launching a new snack category, we were worried about duties and AD/CVD risk. NexSupply gave us a way to sanity-check margins and duties before we committed to inventory.',
        meta: 'FBA seller, CPG category',
      },
      {
        id: 'retail-buyer',
        role: 'Retail buyer',
        quote:
          'We were exploring a new hardlines category with complex compliance requirements. The compliance flags helped us avoid a very expensive mistake on a new category.',
        meta: 'Retail buyer, hardlines',
      },
      {
        id: 'brand-manager',
        role: 'Food & beverage brand manager',
        quote:
          'We needed to test a new snack product quickly without committing to a large order. NexSupply handled the pilot through to a larger order—the process felt fast and contained.',
        meta: 'Brand manager, food and beverage',
      },
    ],
  },
  cta: {
    title: 'Ready to analyze your product?',
    subtitle:
      'Pick your seller type and project goal above, then request your first analysis.',
    subtitle2: 'We typically respond within 24 hours via email, and schedule a call if needed.',
    ctaLabel: 'Start a project',
    ctaHref: '/chat',
  },
} as const;

