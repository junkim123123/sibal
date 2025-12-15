// Config for How It Works page
import { MessageSquare, FileText, Package, Upload, Brain, Users, Truck, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface JourneyCard {
  title: string;
  body: string;
  icon: LucideIcon;
  deliverables?: string[];
}

export interface Step {
  stepNumber: string;
  title: string;
  timeEstimate: string;
  body: string;
  bullets: string[];
  deliverables?: string[];
  icon: LucideIcon;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface HowItWorksPageConfig {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    note: string;
    cta: {
      primary: {
        label: string;
        href: string;
      };
      secondary: {
        label: string;
        href: string;
      };
    };
  };
  journey: {
    title: string;
    subtitle?: string;
    cards: JourneyCard[];
  };
  steps: {
    title: string;
    items: Step[];
  };
  pricing: {
    title: string;
    cards: Array<{
      title: string;
      items: string[];
    }>;
  };
  faq: {
    title: string;
    items: FAQ[];
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
  };
}

export const howItWorksPageConfig: HowItWorksPageConfig = {
  hero: {
    title: 'How NexSupply Works',
    subtitle: 'AI-powered sourcing reports. Real factory quotes. Transparent pricing.',
    description: 'Start with a free analysis. When the numbers work, deposit $49 to unlock factory quotes within 7 days.',
    note: '',
    cta: {
      primary: {
        label: 'Get an analysis',
        href: '/chat',
      },
      secondary: {
        label: 'Talk to a Manager ($49 deposit)',
        href: '/chat',
      },
    },
  },
  journey: {
    title: 'Your sourcing journey in three moves',
    cards: [
      {
        title: 'Submit Project Brief',
        body: 'Share your product idea, target market, and volume requirements.',
        icon: MessageSquare,
        deliverables: [
          'Structured sourcing brief',
          'Shared project documentation',
          'Clear starting point for the team',
        ],
      },
      {
        title: 'Get AI Cost & Risk Snapshot',
        body: 'Receive a comprehensive landed cost and risk assessment within 1 business day.',
        icon: TrendingUp,
        deliverables: [
          'Estimated DDP per unit breakdown',
          'Compliance and AD/CVD risk flags',
          'Go / Pause / Drop recommendation',
        ],
      },
      {
        title: 'Deposit & Get Factory Quotes',
        body: 'Deposit $49 to unlock manager and receive 3 factory quotes within 7 days.',
        icon: Package,
        deliverables: [
          '3 factory quote options',
          'Dedicated manager assigned',
          'Factory FOB locked for 3 months',
        ],
      },
    ],
  },
  steps: {
    title: 'What happens in each step',
    items: [
      {
        stepNumber: '1',
        title: 'Describe your product',
        timeEstimate: '~10 minutes',
        body: 'Upload your product idea or reference listing. Share target market, sales channel, volume, and timing.',
        bullets: [
          'Create structured sourcing brief',
          'Document project requirements',
          'Establish shared starting point',
        ],
        icon: Upload,
      },
      {
        stepNumber: '2',
        title: 'AI cost and risk check',
        timeEstimate: 'Within 1 business day',
        body: 'Review the AI-generated cost and risk snapshot with DDP breakdown, compliance flags, and risk assessment.',
        bullets: [
          'Estimated DDP per unit including factory, freight, duty, and extras',
          'Compliance and AD/CVD risk flags',
          'Margin assumption testing and alternative scenario suggestions',
        ],
        deliverables: [
          'DDP per unit breakdown',
          'Duty assumptions',
          'Early risk flags',
        ],
        icon: Brain,
      },
      {
        stepNumber: '3',
        title: 'Deposit & factory quotes',
        timeEstimate: 'Real factory quotes within 7 days',
        body: 'Deposit $49 to unlock your dedicated manager. The deposit is 100% credited to your first order and refundable if you choose not to proceed. Receive 3 real factory quotes within 7 days with FOB prices locked for 3 months.',
        bullets: [
          'Shortlist and compare qualified factories',
          'Deliver 3 real factory quotes within 7 days',
          'Assign dedicated manager within 1 business day',
          'Align QC and logistics to match your risk level',
          'Factory FOB locked for 3 months once quoted',
          'Deposit 100% credited to first order',
        ],
        icon: Truck,
      },
    ],
  },
  pricing: {
    title: 'What you pay and where we work',
    cards: [
      {
        title: 'Analysis and planning',
        items: [
          'Free AI cost and risk snapshot within 1 business day.',
          'Includes detailed report and one review call.',
          'No subscription or commitment required.',
        ],
      },
      {
        title: 'When orders go through NexSupply',
        items: [
          '$49 deposit credited 100% to your first order (refundable if not proceeding).',
          'Factory FOB price locked for 3 months once quoted.',
          'All logistics, customs, duties, packaging materials, labeling, and kitting costs are pass-through at cost with zero markup.',
          'NexSupply charges a transparent 5% management fee on FOB for production management and QC coordination.',
          'Hub locations: Seoul, Yiwu, Shantou, Vung Tau.',
          'We help plan freight and customs but are not a customs broker or law firm.',
        ],
      },
    ],
  },
  faq: {
    title: 'More questions before you start?',
    items: [
      {
        question: 'Do I have to be an experienced seller?',
        answer: 'No. Many of our early users are launching their first or second product. We focus on helping you understand landed cost and risk before you commit.',
      },
      {
        question: 'Can I use NexSupply if I already have suppliers?',
        answer: 'Yes. You can bring your own suppliers and use NexSupply only for cost and risk checks or to benchmark new options.',
      },
      {
        question: 'Do you handle shipping and customs?',
        answer: 'We help you plan freight and customs but we are not a customs broker or law firm. We can coordinate with your partners or recommend specialists.',
      },
      {
        question: 'How long does the whole process take?',
        answer: 'Most projects receive an initial analysis within 1 business day and a first pilot supplier plan within one to two weeks, depending on category.',
      },
    ],
  },
  cta: {
    title: 'Ready to test your next import?',
    description: 'Start with one product, one box and see how NexSupply fits your workflow.',
    buttonLabel: 'Get an analysis',
    buttonHref: '/chat',
  },
};

