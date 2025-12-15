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
  title: string;
  summary: string;
  footnote: string;
  deliverables?: string;
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
    badge: string;
    title: string;
    body: string;
    ctaPrimary: {
      label: string;
      href: string;
    };
    ctaSecondary: {
      label: string;
      href: string;
    };
    ctaHelperText?: string;
  };
  threeSteps: {
    items: Array<{
      title: string;
      subtitle: string;
    }>;
  };
  commonProjects: {
    title: string;
    subtitle?: string;
    items: CommonProject[];
  };
  socialProof: {
    title: string;
    rating: {
      badge: string;
      value: string;
      label: string;
    };
    subtitle: string;
    quotes: Array<{
      quote: string;
      author: string;
      outcome?: string;
    }>;
  };
  benefits: {
    title: string;
    items: Array<{
      title: string;
      body: string;
    }>;
  };
  cta: {
    title: string;
    body: string;
    buttonLabel: string;
    buttonHref: string;
    disclaimer: string;
  };
}

export const useCasesPageContent: UseCasesPageContent = {
  hero: {
    badge: 'Predictable Sourcing for Modern Brands',
    title: 'De-risk your next import in 1 business day',
    body: 'See your landed cost and compliance risks in one place. If you want, we can connect you to real factory quotes with a $49 refundable deposit.',
    ctaPrimary: {
      label: 'Get free snapshot',
      href: '/chat',
    },
    ctaSecondary: {
      label: 'Talk to a manager',
      href: '/chat',
    },
    ctaHelperText: '$49 deposit is refundable until outreach begins. Credited if you proceed.',
  },
  threeSteps: {
    items: [
      {
        title: 'AI Cost and Risk Snapshot',
        subtitle: 'Within 1 business day',
      },
      {
        title: 'Deposit to Unlock Manager',
        subtitle: 'Real factory quotes within 7 days',
      },
      {
        title: 'Execute',
        subtitle: '5% service fee, packaging and labeling quoted separately',
      },
    ],
  },
  commonProjects: {
    title: 'Choose your starting point',
    subtitle: 'Pick the fastest starting point for your situation.',
    items: [
      {
        id: 'launch-new-product',
        title: 'Launch a new FBA brand',
        summary: 'Check margin and risk before your first order.',
        footnote: 'Typical users: New FBA sellers and early-stage brands',
        deliverables: 'Estimated delivered cost range and key DDP drivers\nDuty and compliance red flags\nClear go or no-go recommendation',
      },
      {
        id: 're-source-existing-sku',
        title: 'Re-source an existing SKU',
        summary: 'Compare your current supplier with alternatives side-by-side on cost and risk.',
        footnote: 'Typical users: Established sellers optimizing margins',
        deliverables: 'Side-by-side landed cost comparison\nSupplier tradeoffs and risk flags\nSavings estimate with assumptions',
      },
      {
        id: 'test-higher-risk-category',
        title: 'Test a higher-risk category',
        summary: 'Check AD/CVD and required documents before you import.',
        footnote: 'Typical users: Brands entering regulated categories',
        deliverables: 'AD/CVD risk screen and scope\nRequired documents checklist\nMitigation steps before you place a PO',
      },
    ],
  },
  socialProof: {
    title: 'Results from recent pilot projects',
    rating: {
      badge: 'Pilot users',
      value: '4.6 / 5',
      label: 'based on 50+ pilot projects',
    },
    subtitle: 'Examples are directional and vary by category and volume',
    quotes: [
      {
        quote: 'Finally, I can see landed cost before I wire any money.',
        author: 'FBA Seller, CPG Category',
        outcome: 'Saved $0.18 per unit',
      },
      {
        quote: 'The compliance check prevented a very expensive mistake.',
        author: 'Retail Buyer, Hardlines',
        outcome: 'Avoided customs hold',
      },
      {
        quote: 'We used NexSupply to test a new snack product. The process was simple and fast.',
        author: 'Brand Manager, Food & Beverage',
        outcome: 'Reduced lead time by 2 weeks',
      },
    ],
  },
  benefits: {
    title: 'Why teams work with NexSupply',
    items: [
      {
        title: 'Transparent pricing',
        body: 'Pass-through at actual cost. 5% fee on FOB only',
      },
      {
        title: 'Real quotes, fast',
        body: '3 factory quotes within 7 days after deposit.',
      },
      {
        title: 'Price lock',
        body: 'FOB held for 90 days after quote',
      },
      {
        title: 'Risk controls',
        body: 'Compliance and AD/CVD screening before you commit',
      },
      {
        title: 'On-the-ground QC',
        body: 'QC hubs in Seoul, Yiwu, Shantou, and Vung Tau.',
      },
      {
        title: 'Execution support',
        body: 'Packaging, labeling, kitting, and forwarding billed at cost.',
      },
    ],
  },
  cta: {
    title: 'Ready to test your next import?',
    body: 'Start with one product. Get a full landed cost and risk snapshot in 1 business day.',
    buttonLabel: 'Get free snapshot',
    buttonHref: '/chat',
    disclaimer: 'NexSupply is not a customs broker or legal advisor. Estimates are for directional planning only.',
  },
} as const;

