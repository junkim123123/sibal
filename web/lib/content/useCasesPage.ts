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
    title: 'Stop Guessing. Start Sourcing with Confidence.',
    body: 'Get AI cost and risk snapshot within 1 business day. Review the numbers, then deposit $49 to unlock a dedicated manager and real factory quotes within 7 days. All logistics, customs, duties, and packaging costs are pass-through at cost with zero markup. Transparent 5% management fee on FOB.',
    ctaPrimary: {
      label: 'Get an analysis',
      href: '/chat',
    },
    ctaSecondary: {
      label: 'Talk to a Manager',
      href: '/chat',
    },
    ctaHelperText: '$49 deposit credited to first order, refundable if you do not proceed.',
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
    title: 'Common ways people start with NexSupply',
    items: [
      {
        id: 'launch-new-product',
        title: 'Launch a new FBA brand',
        summary:
          'Validate margin and duty risk before you launch your first private label product.',
        footnote: 'Typical users  CPG brands and FBA aggregators',
      },
      {
        id: 're-source-existing-sku',
        title: 'Re-source an existing SKU',
        summary: 'Compare your current factory to vetted alternatives on landed cost and risk. Many projects see significant cost savings when switching to optimized suppliers.',
        footnote: 'Typical users  Established sellers optimizing margins',
      },
      {
        id: 'test-higher-risk-category',
        title: 'Test a higher-risk category',
        summary:
          'Get an AD or CVD and compliance check before you import into a new category.',
        footnote: 'Typical users  Brands entering regulated categories',
      },
    ],
  },
  socialProof: {
    title: 'See what importers are saying about NexSupply',
    rating: {
      badge: 'Internal Pilot Users',
      value: '4.6 / 5',
      label: 'from internal pilot users',
    },
    subtitle: 'Faster landed-cost clarity, fewer surprises at customs.',
    quotes: [
      {
        quote: 'Finally, I can see landed cost before I wire any money.',
        author: 'FBA Seller, CPG Category',
      },
      {
        quote: 'The compliance check prevented a very expensive mistake.',
        author: 'Retail Buyer, Hardlines',
      },
      {
        quote: 'We used NexSupply to test a new snack product. The process was simple and fast.',
        author: 'Brand Manager, Food & Beverage',
      },
    ],
  },
  benefits: {
    title: 'Why importers work with NexSupply',
    items: [
      {
        title: 'Transparent Pricing',
        body: 'All logistics, customs, duties, and packaging costs are pass-through at cost with zero markup. Transparent 5% management fee on FOB.',
      },
      {
        title: 'Price Lock Guarantee',
        body: 'Factory FOB locked for 3 months once quoted. No surprise price increases during your production window.',
      },
      {
        title: 'Hub Operations',
        body: 'Owned quality control hubs in Seoul, Yiwu, Shantou, and Vung Tau. Rigorous QC processes to minimize defects.',
      },
      {
        title: 'Pass-Through Billing',
        body: 'Logistics, customs, duties, packaging materials, labeling, kitting, and forwarding billed at actual cost with no markup.',
      },
      {
        title: 'Manager Execution',
        body: 'Dedicated manager assigned within 1 business day after deposit. Real factory quotes from 3 options within 7 days.',
      },
      {
        title: 'Risk Controls',
        body: 'AI-powered risk assessment flags compliance issues, AD/CVD risks, and supply chain concerns before you commit.',
      },
    ],
  },
  cta: {
    title: 'Ready to test your next import?',
    body: 'Start with one product. We will run a full landed cost and risk review, usually within 1 business day.',
    buttonLabel: 'Calculate My Profit',
    buttonHref: '/chat',
    disclaimer: 'NexSupply is not a customs broker or legal advisor. Estimates are for directional planning only.',
  },
} as const;

