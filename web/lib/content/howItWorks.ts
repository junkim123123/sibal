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
      helperText?: string;
    };
    chips?: Array<{ text: string }>;
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
    description: 'Start with a free AI cost and risk snapshot. Deposit $49 only if you want a dedicated manager and real factory quotes. Fully refundable and credited if you proceed.',
    note: '',
    cta: {
      primary: {
        label: 'Get an analysis',
        href: '/chat',
      },
      secondary: {
        label: 'Talk to a manager',
        href: '/chat',
      },
      helperText: 'No credit card required for the free snapshot.',
    },
    chips: [
      { text: 'Step 1: Project brief 10 minutes' },
      { text: 'Step 2: Free AI cost and risk snapshot within 1 business day' },
      { text: 'Step 3: Deposit $49 to unlock manager plus 3 factory quotes within 7 days' },
    ],
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
        title: 'Free AI Cost & Risk Snapshot',
        body: 'Receive a comprehensive landed cost and risk assessment within 1 business day.',
        icon: TrendingUp,
        deliverables: [
          'Estimated DDP (delivered cost) per unit breakdown',
          'Compliance and AD/CVD (anti-dumping duties) risk flags',
          'Go / Pause / Drop recommendation',
        ],
      },
      {
        title: 'Deposit $49 to Unlock Manager & Factory Quotes',
        body: 'Deposit $49 to unlock a dedicated manager and receive 3 factory quote options within 7 days.',
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
        title: 'Submit project brief',
        timeEstimate: '10 minutes',
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
        title: 'Free AI cost and risk snapshot',
        timeEstimate: 'Within 1 business day',
        body: 'Review the AI-generated cost and risk snapshot with DDP (delivered cost) breakdown, compliance flags, and risk assessment.',
        bullets: [
          'Estimated DDP per unit including factory, freight, duty, and extras',
          'Compliance and AD/CVD (anti-dumping duties) risk flags',
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
        title: 'Deposit $49 to unlock manager and factory quotes',
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
        answer: 'No. We work with first time importers. The AI snapshot helps you sanity check costs before you commit.',
      },
      {
        question: 'Can I use NexSupply if I already have suppliers?',
        answer: 'Yes. We can benchmark your current supplier against alternatives and flag compliance or duty risks early.',
      },
      {
        question: 'Do you handle shipping and customs?',
        answer: 'We coordinate logistics planning and documentation support. We are not a customs broker.',
      },
      {
        question: 'How long does the whole process take?',
        answer: 'Brief takes 10 minutes. Snapshot within 1 business day. Factory quotes 7 days after deposit.',
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

