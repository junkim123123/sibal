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
    title: 'Sourcing Intelligence Built for Your Business Model',
    subtitle:
      'From Amazon FBA to Enterprise Retail, NexSupply equips your team with precision data on margin, compliance, and logistics—unified in one command center.',
    ctaLabel: 'Start a project',
    ctaHref: '/chat',
  },
  segments: [
    {
      id: 'amazon-fba',
      label: 'Amazon FBA private label',
      description: 'For sellers who want to validate margins and duty risk before launching a new PL product.',
      decisions: [
        'Validate Net Margins Instantly: See true profit after FBA fees, duties, and shipping before spending $1.',
        'Compare staying with your current factory vs. moving to a new one for better unit economics.',
      ],
      icon: ShoppingCart,
    },
    {
      id: 'dtc-shopify',
      label: 'DTC and Shopify brands',
      description: 'For brands where ad spend and 3PL fees are a big part of unit economics.',
      decisions: [
        'Secure Margins for ROAS: Calculate landed costs precisely to know exactly how much ad spend you can afford.',
        'Decide how aggressively to test new SKUs without breaking cash flow.',
      ],
      icon: Store,
    },
    {
      id: 'offline-retail',
      label: 'Offline retail and wholesale',
      description: 'For buyers who need container-level decisions they can defend in internal meetings.',
      decisions: [
        'Shelf-Ready Optimization: Customize master cartons and pallet configurations at our hubs to minimize freight and handling costs.',
        'Compare pallet and container-level shipping scenarios for the best cost structure.',
      ],
      icon: Building2,
    },
    {
      id: 'importers-trading',
      label: 'Importers and trading companies',
      description: 'For teams managing many SKUs who need fast, structured checks instead of ad-hoc spreadsheets.',
      decisions: [
        'Centralized Sourcing OS: Replace ad-hoc spreadsheets with a single dashboard for quotes, compliance, and logistics tracking.',
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
          'You have a new category idea and want to validate margin feasibility and duty risk before ordering samples.',
        scope: '1 SKU, 1 primary market.',
        timeline: 'Initial AI Audit: 24 Hours / Full Factory Matching: 1 Week',
      },
      {
        id: 're-source-existing-sku',
        badge: 'When you need to improve margins',
        title: 'Re-source an existing SKU',
        summary: 'You want to benchmark new factories or trade terms against your current supplier.',
        scope: '1 SKU with multiple factory options.',
        timeline: 'Initial AI Audit: 24 Hours / Factory Comparison: 1–2 Weeks',
      },
      {
        id: 'test-higher-risk-category',
        badge: 'Before entering a new category',
        title: 'Test a higher-risk category',
        summary:
          "You're interested in a more regulated category but want to understand the compliance and AD/CVD risk first.",
        scope: '1 SKU in a higher-risk or regulated category.',
        timeline: 'Initial AI Audit: 24 Hours / Compliance Mapping: 1 Week',
      },
      {
        id: 'clean-up-messy-supply-chain',
        badge: 'When you need clarity across projects',
        title: 'Consolidate Fragmented Operations',
        summary:
          'You have similar products across multiple factories with different terms and logistics routes.',
        scope: 'Multiple SKUs and factories, using your existing quotes and contract data.',
        timeline: 'Initial AI Audit: 24 Hours / Portfolio Analysis: 2 Weeks',
      },
    ],
  },
  workflow: {
    title: 'Your Roadmap from Concept to Container',
    subtitle: 'Each use case follows the same simple path from idea to first shipment.',
    steps: [
      {
        id: 1,
        title: 'Submit Project Brief',
        body:
          'Pick a seller type and project from this page, then share your product specs. We capture the key details in a structured brief so the analysis fits your real-world constraints.',
      },
      {
        id: 2,
        title: 'Get a cost and risk snapshot',
        body:
          "We generate a snapshot tailored to your use case—whether it's Amazon FBA, DTC, retail, or trading. The report clearly shows channel-specific costs, duties, and key risks.",
      },
      {
        id: 3,
        title: 'Execute with Confidence',
        body:
          'You can stop at the AI report, book a call to go deeper, or seamlessly transition to factory search and a pilot order. You stay in control of pace, budget, and next steps.',
      },
    ],
  },
  pricing: {
    title: 'Flexible Pricing Models',
    subtitle: 'Transparent, Pay-as-you-Scale Pricing.',
    analysis: {
      chip: 'Analysis only',
      title: 'Sourcing Intelligence Audit',
      bullets: [
        'Flat project fee for each analysis during pilot period.',
        'Includes AI report and one review call (typically 30+ minutes).',
        'Pay-Per-Project (No Commitments)',
      ],
    },
    orders: {
      chip: 'When you place orders',
      title: 'End-to-End Execution',
      bullets: [
        'Performance-Based Management Fee only when you place orders through us.',
        'Margin Protection Guarantee: Fee cap on per-unit margin so your upside stays protected.',
        'Currently focused on imports into the US and selected EU markets.',
      ],
    },
  },
  testimonials: {
    title: 'What importers are saying',
    subtitle: 'Leading importers use NexSupply to de-risk their supply chain and validate margins before committing.',
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
    title: 'Get Your Landed Cost Reality Check.',
    subtitle:
      'Stop guessing on duties and freight. Submit your product details now and receive a comprehensive strategic audit within 24 hours.',
    subtitle2: undefined,
    ctaLabel: 'Request My Sourcing Audit',
    ctaHref: '/chat',
  },
} as const;

