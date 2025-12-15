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
    subtitle: 'From first idea to your first controlled shipment, NexSupply keeps your project moving at every step of the sourcing process.',
    description: 'Start with one chat. When the numbers work, scale at your own pace.',
    note: 'Most projects receive an initial landed-cost snapshot within one business day. Packaging and kitting available, billed separately.',
    cta: {
      primary: {
        label: 'Get an analysis',
        href: '/chat',
      },
      secondary: {
        label: 'See use cases',
        href: '/how-it-works',
      },
    },
  },
  journey: {
    title: 'Your sourcing journey in three moves',
    cards: [
      {
        title: 'Submit Project Brief',
        body: 'Tell us what you want to sell, where you want to sell it, and how big you want to go. We capture the key details in a shared project brief.',
        icon: MessageSquare,
      },
      {
        title: 'Get Landed Cost Reality Check',
        body: 'Our AI tools turn that brief into a landed cost and risk view, so you see margins, duties, and red flags before you spend on inventory. Usually within 1 business day. Packaging and kitting available, billed separately.',
        icon: TrendingUp,
      },
      {
        title: 'Run Pilot & Ship',
        body: 'When the numbers look right, deposit $49 to unlock real factory quotes within 7 days. Deposit is 100 percent credited to your first order. We help you line up suppliers, QC and logistics for a first controlled shipment, not a blind leap.',
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
        timeEstimate: '~10 minutes',
        body: 'You do: Upload a product idea, photo or reference listing. Tell us the target market and main sales channel. Share rough volume and timing (test run or ongoing).',
        bullets: [
          'We do: Turn this into a structured sourcing brief.',
          'You get: A clear, shared starting point for everyone on the project.',
        ],
        icon: Upload,
      },
      {
        stepNumber: '2',
        title: 'AI cost and risk check',
        timeEstimate: 'Within 1 business day',
        body: 'You do: Review a first-pass landed cost and risk snapshot. If the numbers look promising, we can discuss alternative scenarios and next steps.',
        bullets: [
          'We do: Estimated DDP per unit (factory, freight, duty, and extras). Flag early signs of compliance or AD/CVD risk. Pressure-test your assumptions on margin and risk. Suggest alternative scenarios (factory options, MOQ, route, etc.).',
          'You get: A sanity check on whether the project makes sense before you commit. Human eyes on the numbers and a clear "go / pause / drop" recommendation.',
          'Packaging and kitting available, billed separately.',
        ],
        icon: Brain,
      },
      {
        stepNumber: '3',
        title: 'Pilot run and beyond',
        timeEstimate: 'Real factory quotes within 7 days',
        body: 'You do: Decide when you\'re ready to move from analysis into a first test order.',
        bullets: [
          'We do: Shortlist and compare qualified factories. Real factory quotes within 7 days after deposit. Deposit is 100 percent credited to your first order. Align QC and logistics to match your risk level. Use the pilot to learn, then translate those lessons into a repeatable playbook.',
          'You get: A controlled first shipment instead of jumping straight into a huge PO.',
          '5% execution fee covers: Production management and QC coordination. 5% execution fee does NOT cover: Packaging, labeling, and kitting costs (quoted separately as pass-through line items).',
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
          'Free analysis with instant AI reports.',
          'Includes AI report and one review call.',
          'No subscription required.',
        ],
      },
      {
        title: 'When orders go through NexSupply',
        items: [
          '5% execution fee covers: Production management and QC coordination.',
          '5% execution fee does NOT cover: Packaging, labeling, and kitting costs (quoted separately as pass-through line items).',
          'Currently focused on imports into the US and selected EU markets.',
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

