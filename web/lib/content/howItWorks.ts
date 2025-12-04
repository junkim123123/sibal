// Config for How It Works page
import { MessageSquare, FileText, Package, Upload, Brain, Users, Truck, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface JourneyCard {
  title: string;
  body: string;
  icon: LucideIcon;
}

export interface Step {
  stepNumber: string;
  title: string;
  timeEstimate: string;
  body: string;
  bullets: string[];
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
    subtitle: 'From first idea to your first test shipment, NexSupply keeps your project moving at every step of the sourcing process.',
    description: 'Start with one chat. When the numbers work, scale at your own pace.',
    note: 'Most projects get an initial snapshot within one business day.',
    cta: {
      primary: {
        label: 'Analyze a product',
        href: '/analyze',
      },
      secondary: {
        label: 'See how it works',
        href: '/how-it-works',
      },
    },
  },
  journey: {
    title: 'Your sourcing journey in three moves',
    subtitle: 'Each move breaks down into simple steps:',
    cards: [
      {
        title: 'Start with a chat',
        body: 'Tell us what you want to sell, where you want to sell it, and how big you want to go. We capture the key details in a shared project brief.',
        icon: MessageSquare,
      },
      {
        title: 'Get a cost and risk snapshot',
        body: 'Our tools turn that brief into a landed cost and risk view, so you see margins, duties, and red flags before you spend on inventory.',
        icon: TrendingUp,
      },
      {
        title: 'Run a pilot with NexSupply',
        body: 'When the numbers look right, we help you line up suppliers, QC and logistics for a first controlled shipment, not a blind leap.',
        icon: Package,
      },
    ],
  },
  steps: {
    title: 'What happens in each step',
    items: [
      {
        stepNumber: '1',
        title: 'Describe your product',
        timeEstimate: '~5 minutes',
        body: 'Upload a product idea, photo or reference listing. In a short guided flow, we capture what matters for sourcing.',
        bullets: [
          'Product idea or reference listing',
          'Target market and main sales channel',
          'Rough volume and timing (test run or ongoing)',
        ],
        icon: Upload,
      },
      {
        stepNumber: '2',
        title: 'AI cost and risk check',
        timeEstimate: '~2 minutes',
        body: 'Our toolkit turns your brief into a first pass landed cost and risk picture so you can sanity check the project before you commit.',
        bullets: [
          'Estimated DDP per unit',
          'Simple breakdown of factory, freight, duty and extras',
          'Early flags for compliance or AD/CVD risk',
        ],
        icon: Brain,
      },
      {
        stepNumber: '3',
        title: 'Talk to NexSupply',
        timeEstimate: '15–30 minutes',
        body: 'If it looks promising, you can book a call with our sourcing team to go deeper.',
        bullets: [
          'Human specialist reviews your assumptions',
          'Together you stress test margin and risk scenarios',
          'You decide whether to move into supplier search',
        ],
        icon: Users,
      },
      {
        stepNumber: '4',
        title: 'Pilot run and beyond',
        timeEstimate: 'Weeks, not months',
        body: 'When you are ready to move, we help you run a controlled first order instead of jumping straight to a huge PO.',
        bullets: [
          'Shortlist and compare qualified factories',
          'Align on QC and logistics that match your risk level',
          'Turn lessons from the pilot into a repeatable playbook',
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
          'From $149 per product analysis during alpha',
          'Includes AI report and one review call (typically 30+ minutes)',
          'No subscription or long term contract',
        ],
      },
      {
        title: 'When orders go through NexSupply',
        items: [
          'Transparent project-based success fee only when you place orders',
          'Fee cap on per unit margin so your upside stays protected',
          'Currently focused on imports into the US and selected EU markets',
        ],
      },
    ],
  },
  faq: {
    title: 'More questions',
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
        answer: 'Most projects receive an initial analysis within one business day and a first pilot supplier plan within one to two weeks, depending on category.',
      },
    ],
  },
  cta: {
    title: 'Ready to test your next import?',
    description: 'Start with one product, one box and see how NexSupply fits your workflow.',
    buttonLabel: 'Analyze a product',
    buttonHref: '/analyze',
  },
};

