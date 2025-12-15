// Config for Use Cases page
import { ShoppingCart, Store, Building2, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Segment {
  id: string;
  label: string;
  description: string;
  bullets: string[];
  outputChips: string[];
  icon: LucideIcon;
}

export interface CommonProject {
  id: string;
  badge: string;
  title: string;
  summary: string;
  decisionLine: string;
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
    title: 'Sourcing intelligence for your business model',
    subtitle:
      'From Amazon FBA to retail and trading, NexSupply helps you validate margin, duties, and compliance before you commit.',
    ctaLabel: 'Start free audit',
    ctaHref: '/chat',
  },
  segments: [
    {
      id: 'amazon-fba',
      label: 'Amazon FBA private label',
      description: 'Validate true profit after FBA fees, freight, and duties before you spend on inventory.',
      bullets: [
        'See net margin with fees and landed cost included',
        'Compare your current factory vs alternatives for better unit economics',
      ],
      outputChips: [
        'Landed cost breakdown',
        'Duty estimate',
        'Margin snapshot',
      ],
      icon: ShoppingCart,
    },
    {
      id: 'dtc-shopify',
      label: 'DTC and Shopify brands',
      description: 'Know your landed cost so you can protect ROAS and test new SKUs with control.',
      bullets: [
        'Calculate unit economics before scaling ad spend',
        'Stress test scenarios without breaking cash flow',
      ],
      outputChips: [
        'Landed cost breakdown',
        'Scenario comparison',
        'Risk flags',
      ],
      icon: Store,
    },
    {
      id: 'offline-retail',
      label: 'Offline retail and wholesale',
      description: 'Make container level decisions you can defend in internal reviews.',
      bullets: [
        'Optimize cartons and pallets to reduce freight and handling cost',
        'Compare pallet vs container shipping structures',
      ],
      outputChips: [
        'Packing and pallet plan',
        'Freight scenarios',
        'Unit landed cost',
      ],
      icon: Building2,
    },
    {
      id: 'importers-trading',
      label: 'Importers and trading companies',
      description: 'Replace ad hoc spreadsheets with a structured workflow for quotes, compliance, and logistics.',
      bullets: [
        'Standardize supplier evaluation and pilots',
        'Track decisions across SKUs and factories',
      ],
      outputChips: [
        'Quote comparison',
        'Compliance check',
        'Risk summary',
      ],
      icon: Globe,
    },
  ],
  commonProjects: {
    title: 'Common projects we help with',
    items: [
      {
        id: 'launch-new-product',
        badge: 'Best for first time projects',
        title: 'Launch a new product',
        summary:
          'Validate margin feasibility and duty risk before ordering samples.',
        decisionLine: 'Decision: Go or no go before you commit',
        scope: 'Typical scope: 1 SKU, 1 market',
        timeline: 'Typical timeline: Snapshot in 1 business day, factory matching in about 1 week',
      },
      {
        id: 're-source-existing-sku',
        badge: 'Improve margins',
        title: 'Re source an existing SKU',
        summary: 'Benchmark new factories and trade terms against your current supplier.',
        decisionLine: 'Decision: Stay, switch, or renegotiate',
        scope: 'Typical scope: 1 SKU, multiple factory options',
        timeline: 'Typical timeline: Snapshot in 1 business day, comparison in 1 to 2 weeks',
      },
      {
        id: 'test-higher-risk-category',
        badge: 'Before expanding',
        title: 'Test a higher risk category',
        summary:
          'Understand compliance and AD CVD risk before entering a regulated category.',
        decisionLine: 'Decision: Proceed with a clear risk plan',
        scope: 'Typical scope: 1 SKU in a regulated category',
        timeline: 'Typical timeline: Snapshot in 1 business day, compliance mapping in about 1 week',
      },
      {
        id: 'clean-up-messy-supply-chain',
        badge: 'Portfolio clarity',
        title: 'Consolidate fragmented operations',
        summary:
          'Align terms, logistics, and supplier decisions across multiple SKUs.',
        decisionLine: 'Decision: Standardize your supply chain plan',
        scope: 'Typical scope: Multiple SKUs and factories',
        timeline: 'Typical timeline: Snapshot in 1 business day, portfolio analysis in about 2 weeks',
      },
    ],
  },
  workflow: {
    title: 'Your path from concept to container',
    subtitle: 'A simple workflow from first idea to first shipment.',
    steps: [
      {
        id: 1,
        title: 'Submit a project brief',
        body:
          'Pick your path, then share product details. We capture what matters so the analysis fits real constraints.',
      },
      {
        id: 2,
        title: 'Get a cost and risk snapshot',
        body:
          'Receive a channel specific snapshot showing landed cost, duties, and key compliance flags.',
      },
      {
        id: 3,
        title: 'Execute with confidence',
        body:
          'Stop at the snapshot, book a call, or move into factory search and a pilot order. You control pace and budget.',
      },
    ],
  },
  pricing: {
    title: 'Flexible pricing',
    subtitle: 'Start with a free audit. Pay only when you place orders through us.',
    analysis: {
      chip: 'Analysis only',
      title: 'Sourcing intelligence audit',
      bullets: [
        'Free audit with an AI assisted snapshot',
        'Includes one review call, typically 30 minutes',
        'No subscription required',
      ],
    },
    orders: {
      chip: 'When you place orders',
      title: 'End to end execution',
      bullets: [
        '5 percent service fee only when you place orders through us',
        'Fee cap so your per unit upside stays protected',
        'Focused on imports into the US and selected EU markets',
      ],
    },
  },
  testimonials: {
    title: 'What teams are saying',
    subtitle: 'Teams use NexSupply to validate margin and reduce risk before committing.',
    items: [
      {
        id: 'amazon-seller',
        role: 'Amazon FBA seller',
        quote:
          'When launching a new snack category, we were worried about duties and AD/CVD risk. NexSupply gave us a way to validate unit profitability and duties before we committed to inventory.',
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
    title: 'Get your landed cost reality check',
    subtitle:
      'Stop guessing on duties and freight. Share your product and get a strategic audit in 1 business day.',
    subtitle2: undefined,
    ctaLabel: 'Start free audit',
    ctaHref: '/chat',
  },
} as const;

