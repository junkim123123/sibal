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
  badge?: string;
  ctaLabel?: string;
  outcomeExample?: string;
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
    metrics?: Array<{
      label: string;
      value: string;
      subtitle?: string;
    }>;
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
  snapshotPreview?: {
    title: string;
    subtitle?: string;
    items: Array<{
      label: string;
      value: string;
    }>;
    disclaimer?: string;
  };
  freeVsDeposit?: {
    title: string;
    free: {
      title: string;
      items: string[];
    };
    deposit: {
      title: string;
      items: string[];
    };
    helperText?: string;
  };
  trustElements?: {
    whatWeCheck: {
      title: string;
      items: string;
    };
    whereWeOperate: {
      title: string;
      items: string;
    };
  };
  cta: {
    title: string;
    body: string;
    buttonLabel: string;
    buttonHref: string;
    disclaimer: string;
    helperText?: string;
  };
}

export const useCasesPageContent: UseCasesPageContent = {
  hero: {
    badge: 'Predictable Sourcing for Modern Brands',
    title: 'De-risk your next import in under a minute',
    body: 'Get an instant landed cost estimate, duty range, and compliance flags. Upgrade for real factory quotes with a refundable $49 deposit.',
    ctaPrimary: {
      label: 'Get a free snapshot',
      href: '/chat',
    },
    ctaSecondary: {
      label: 'Talk to a manager',
      href: '/chat',
    },
    ctaHelperText: 'Most snapshots generate in under a minute. Deposit is refundable and credited if you proceed.',
  },
  threeSteps: {
    items: [
      {
        title: 'AI Cost and Risk Snapshot',
        subtitle: 'In under a minute',
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
    subtitle: 'Pick the fastest workflow for your situation.',
    items: [
      {
        id: 'launch-new-product',
        title: 'Launch a new FBA brand',
        summary: 'Check margin and duty risk before your first PO.',
        footnote: 'Typical users: New FBA sellers and early-stage brands',
        deliverables: 'Landed cost range and key drivers\nDuty range and HS code guess\nCompliance flags and required docs\nGo or no-go recommendation',
        badge: 'Best for first order',
        ctaLabel: 'Start this workflow',
        outcomeExample: 'Typical turnaround under 1 minute',
      },
      {
        id: 're-source-existing-sku',
        title: 'Re-source an existing SKU',
        summary: 'Compare your current supplier against alternatives.',
        footnote: 'Typical users: Established sellers optimizing margins',
        deliverables: 'Side by side landed cost estimate\nSupplier tradeoffs and risk flags\nSavings estimate with assumptions\nNext steps and sample plan',
        badge: 'Best for cost down',
        ctaLabel: 'Start this workflow',
        outcomeExample: 'Typical savings 5 to 15 percent',
      },
      {
        id: 'test-higher-risk-category',
        title: 'Test a higher risk category',
        summary: 'Screen AD CVD and document requirements early.',
        footnote: 'Typical users: Brands entering regulated categories',
        deliverables: 'AD CVD screen with scope notes\nRequired documents checklist\nMitigation steps before you place a PO\nFlags that trigger manual review',
        badge: 'Best for compliance',
        ctaLabel: 'Start this workflow',
        outcomeExample: 'Catch gaps before your first shipment',
      },
    ],
  },
  snapshotPreview: {
    title: 'Snapshot preview',
    subtitle: 'A one page report you get instantly.',
    items: [
      {
        label: 'Landed cost range',
        value: 'Example: $2.18 to $2.74 per unit DDP',
      },
      {
        label: 'Cost drivers',
        value: 'Factory $1.45 | Freight $0.38 | Duties $0.21 | Packaging $0.09',
      },
      {
        label: 'Compliance flags',
        value: 'Labeling and safety doc required',
      },
      {
        label: 'AD/CVD screen',
        value: 'Flagged or not flagged with scope notes',
      },
      {
        label: 'Go or no go',
        value: 'Proceed with sample or re-source recommended',
      },
    ],
    disclaimer: 'Examples vary by category, volume, and ship mode.',
  },
  freeVsDeposit: {
    title: 'Two ways to start',
    free: {
      title: 'Free snapshot',
      items: [
        'Instant delivery',
        'Landed cost range and DDP drivers',
        'Compliance and AD/CVD screen',
        'Required docs checklist',
        'Go or no-go recommendation',
      ],
    },
    deposit: {
      title: '$49 refundable deposit',
      items: [
        'Manager assigned',
        'Factory outreach starts',
        '3 real quotes within 7 days',
        'Price lock for 90 days once quoted',
        'Credited if you proceed',
      ],
    },
    helperText: 'Deposit is refundable until outreach begins',
  },
  trustElements: {
    whatWeCheck: {
      title: 'What we check in every snapshot',
      items: 'HS code guess, duty range, AD/CVD screen, compliance docs, landed cost drivers',
    },
    whereWeOperate: {
      title: 'Where we operate',
      items: 'QC hubs in Seoul, Yiwu, Shantou, Vung Tau',
    },
  },
  socialProof: {
    title: 'Results from pilot projects',
    rating: {
      badge: 'Pilot users',
      value: '4.6 out of 5',
      label: 'from 50 plus pilots',
    },
    subtitle: 'Examples vary by category and volume.',
    metrics: [
      {
        label: 'Average time to first snapshot',
        value: 'Under 1 minute',
        subtitle: 'Typical time to first snapshot',
      },
      {
        label: 'Fewer customs surprises',
        value: 'Fewer holds',
        subtitle: 'Catch doc gaps before customs',
      },
      {
        label: 'Typical savings',
        value: '$0.10 to $0.30 per unit',
        subtitle: 'Typical savings range',
      },
    ],
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
        body: 'Pass through at cost plus a 5 percent FOB fee.',
      },
      {
        title: 'Real quotes, fast',
        body: 'Three factory quotes within 7 days after deposit.',
      },
      {
        title: 'Price lock',
        body: 'FOB held for 90 days after quote.',
      },
      {
        title: 'Risk controls',
        body: 'Compliance and AD CVD screening before you commit.',
      },
      {
        title: 'On the ground QC',
        body: 'QC hubs in Seoul, Yiwu, Shantou, and Vung Tau.',
      },
      {
        title: 'Execution support',
        body: 'Packaging, labeling, kitting, and forwarding at cost.',
      },
    ],
  },
  cta: {
    title: 'Ready to test your next import?',
    body: 'Start with one product and get a snapshot in under a minute.',
    buttonLabel: 'Get a free snapshot',
    buttonHref: '/chat',
    disclaimer: 'NexSupply is not a customs broker or law firm. Estimates are directional only.',
    helperText: 'Complex products may take a bit longer.',
  },
} as const;

