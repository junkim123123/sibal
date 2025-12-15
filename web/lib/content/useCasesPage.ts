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
    title: 'Pick the fastest way to de-risk your next import',
    body: 'Get a landed cost and compliance snapshot in 1 business day. Upgrade to real factory quotes with a refundable $49 deposit.',
    ctaPrimary: {
      label: 'Get free snapshot',
      href: '/chat',
    },
    ctaSecondary: {
      label: 'Talk to a manager',
      href: '/chat',
    },
    ctaHelperText: '$49 deposit is refundable until outreach begins and credited if you proceed.',
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
    title: 'Choose your workflow',
    items: [
      {
        id: 'launch-new-product',
        title: 'Launch a new FBA brand',
        summary: 'Validate margin and duty risk before you buy inventory',
        footnote: 'Typical users: CPG brands and FBA aggregators',
        deliverables: 'Estimated delivered cost range and DDP drivers\nDuty and compliance flags\nGo or no-go recommendation',
      },
      {
        id: 're-source-existing-sku',
        title: 'Re-source an existing SKU',
        summary: 'Compare your current supplier with vetted alternatives on cost and risk',
        footnote: 'Typical users: Established sellers optimizing margins',
        deliverables: 'Side-by-side landed cost comparison\nRisk flags and supplier tradeoffs\nSavings estimate with assumptions',
      },
      {
        id: 'test-higher-risk-category',
        title: 'Test a higher-risk category',
        summary: 'Check AD CVD and compliance risk before you import',
        footnote: 'Typical users: Brands entering regulated categories',
        deliverables: 'AD and CVD risk screen\nRequired documents checklist\nMitigation steps before you place a PO',
      },
    ],
  },
  socialProof: {
    title: 'See what importers are saying about NexSupply',
    rating: {
      badge: 'Pilot users',
      value: '4.6 / 5',
      label: 'based on 50+ pilot projects',
    },
    subtitle: 'Faster landed-cost clarity, fewer surprises at customs.',
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
    title: 'Why importers work with NexSupply',
    items: [
      {
        title: 'Transparent pricing',
        body: 'Pass-through at actual cost. 5% fee on FOB only.',
      },
      {
        title: 'Real quotes fast',
        body: '3 factory quotes within 7 days after deposit.',
      },
      {
        title: 'Price lock',
        body: 'FOB locked for 90 days once quoted.',
      },
      {
        title: 'Risk controls',
        body: 'Compliance, AD/CVD, and supply chain flags before you commit.',
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

