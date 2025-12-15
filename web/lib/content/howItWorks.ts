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
    title: 'How NexSupply works in 3 moves',
    subtitle: 'Free snapshot in 1 business day. Refundable $49 deposit only if you want real factory quotes.',
    description: '',
    note: '',
    cta: {
      primary: {
        label: 'Get free snapshot',
        href: '/chat',
      },
      secondary: {
        label: 'Talk to a manager',
        href: '/chat',
      },
      helperText: 'No credit card for the free snapshot.',
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
        title: 'Submit your brief',
        body: '10 minutes to replace 10 hours of back and forth.',
        icon: MessageSquare,
        deliverables: [
          'Structured sourcing brief',
          'Clear assumptions',
          'Shared project doc',
        ],
      },
      {
        title: 'Free cost and risk snapshot',
        body: 'Get the DDP breakdown, duty assumptions, and early red flags in 1 business day.',
        icon: TrendingUp,
        deliverables: [
          'DDP per unit breakdown',
          'AD CVD and compliance flags',
          'Go, Hold, Pass recommendation',
        ],
      },
      {
        title: 'Refundable deposit to start factory outreach',
        body: 'Pay $49 only when you want real quotes. Applied to your first order or refunded if you walk away.',
        icon: Package,
        deliverables: [
          '3 real quote options in 7 days',
          'Dedicated manager assigned',
          'FOB locked for 3 months',
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
          'Free snapshot in 1 business day.',
          'No subscription. No commitment. No payment until you see a "Go" signal.',
        ],
      },
      {
        title: 'When orders go through NexSupply',
        items: [
          '$49 deposit triggers factory outreach.',
          'Pass through at cost for logistics and duties.',
          'We charge 5 percent on FOB for production management and QC.',
        ],
      },
    ],
  },
  faq: {
    title: 'More questions before you start?',
    items: [
      {
        question: 'Do I have to be an experienced seller?',
        answer: 'No. This is built for people who cannot afford a bad first import. We surface the hidden costs before you send money to a factory.',
      },
      {
        question: 'Can I use NexSupply if I already have suppliers?',
        answer: 'Yes. Most sellers overpay because they never benchmark. We compare your current supplier against real quotes and landed cost.',
      },
      {
        question: 'Do you handle shipping and customs?',
        answer: 'We coordinate logistics planning and documentation support. We are not a customs broker, but we catch duty and compliance surprises early.',
      },
      {
        question: 'How long does the whole process take?',
        answer: 'Free snapshot in 1 business day. Factory quotes in 7 days after deposit.',
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

