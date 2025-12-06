// Config for Use Cases page
import { ShoppingCart, Store, Building2, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SellerType {
  label: string;
  summary: string;
  whenYouCall: string[];
  decisionsWeHelp: string[];
  goodStartingProjects: string[];
  icon: LucideIcon;
}

export interface ProjectGoal {
  title: string;
  description: string;
  bestFor: string[];
  whatYouGet: string[];
  scopeAndTimeline: {
    scope: string;
    timeline: string;
  };
}

export interface WorkflowStep {
  title: string;
  body: string;
}

export interface Testimonial {
  segmentTag: string;
  context: string;
  quote: string;
  attribution: string;
}

export interface UseCasesPageConfig {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
  };
  sellerTypes: {
    title: string;
    subtitle?: string;
    items: SellerType[];
  };
  projectGoals: {
    title: string;
    subtitle?: string;
    items: ProjectGoal[];
  };
  workflow: {
    title: string;
    subtitle: string;
    items: WorkflowStep[];
  };
  pricing: {
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      items: string[];
    }>;
  };
  testimonials: {
    title: string;
    subtitle?: string;
    items: Testimonial[];
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
  };
}

export const useCasesPageConfig: UseCasesPageConfig = {
  hero: {
    title: 'Use cases',
    subtitle: 'NexSupply works best with importers who need clear margins, predictable logistics and simple decisions about when to scale. Find the role that fits you, then pick a project to start with.',
    ctaLabel: 'Start a project',
  },
  sellerTypes: {
    title: 'Who we work best with',
    items: [
      {
        label: 'Amazon FBA private label sellers',
        summary: 'You want to launch or re source SKUs with clear landed margins and duty risk before you ship inventory.',
        whenYouCall: [
          'You are planning a new private label line and need to know if the numbers still work.',
          'You want to move an existing SKU to a new factory but are not sure about landed cost.',
          'You are entering a category that might have extra AD or CVD or safety rules.',
        ],
        decisionsWeHelp: [
          'See real per unit margin after FBA fees freight and duty.',
          'Compare your current factory with a new supplier on full landed cost.',
          'Check AD and CVD and restricted category risk before you list on Amazon.',
        ],
        goodStartingProjects: [
          'Launch a new product',
          'Re source an existing SKU',
          'Test a higher risk category',
        ],
        icon: ShoppingCart,
      },
      {
        label: 'DTC and Shopify brands',
        summary: 'You need transparent landed cost and supplier options before you scale a hero product.',
        whenYouCall: [
          'You have a product that sells through online and want to move production closer to your target market.',
          'You are planning new packaging or bundles and need to understand impact on freight and duty.',
          'You are preparing to pitch retailers and want container ready cost numbers.',
        ],
        decisionsWeHelp: [
          'Check unit economics for DTC price points after shipping and fulfillment.',
          'Compare different packaging and pack sizes for 3PL friendly logistics.',
          'Decide which factory or region makes the most sense before signing a long term deal.',
        ],
        goodStartingProjects: [
          'Launch a new product',
          'Clean up a messy supply chain',
        ],
        icon: Store,
      },
      {
        label: 'Offline retail and wholesale buyers',
        summary: 'You make container level decisions and need numbers you can defend to finance and leadership.',
        whenYouCall: [
          'You want to test a new category or private brand without jumping straight to full containers.',
          'You need case pack and master carton plans that match store and DC realities.',
          'You must compare offers from multiple factories and trading companies.',
        ],
        decisionsWeHelp: [
          'Set case pack and master carton plans that hit target shelf price and margin.',
          'Compare container routes and shipping patterns to find the best structure.',
          'Run side by side comparisons of factories on cost quality and risk so you can negotiate with confidence.',
        ],
        goodStartingProjects: [
          'Launch a new product',
          'Test a higher risk category',
        ],
        icon: Building2,
      },
      {
        label: 'Importers and trading companies',
        summary: 'You manage many SKUs and need fast structured checks instead of ad hoc spreadsheets.',
        whenYouCall: [
          'You are re quoting a range of SKUs and want a single view of cost and duty.',
          'You want to standardize how your team checks compliance and logistics risk by HS code.',
          'You are planning new pilot factories and want a simple playbook your team can reuse.',
        ],
        decisionsWeHelp: [
          'Run quick profit and risk reviews on portfolio or key SKUs.',
          'Check cross border compliance and duty by HS code before you pitch a deal.',
          'Standardize pilot order process so every new factory runs through the same checks.',
        ],
        goodStartingProjects: [
          'Re source an existing SKU',
          'Clean up a messy supply chain',
        ],
        icon: Globe,
      },
    ],
  },
  projectGoals: {
    title: 'Projects you can start today',
    subtitle: 'Pick a project that matches where you are. Each one is a small scoped engagement that ends with a clear decision and a simple report you can share with your team.',
    items: [
      {
        title: 'Launch a new product',
        description: 'Quickly test whether a new idea still makes sense once landed cost duties and fees are real.',
        bestFor: [
          'First time imports or new private label SKUs you are not ready to bet a container on.',
        ],
        whatYouGet: [
          'DDP cost per unit by channel.',
          'Basic compliance and risk flags for your target markets.',
          'A short go or no go recommendation you can share in a meeting.',
        ],
        scopeAndTimeline: {
          scope: 'one SKU and one destination market.',
          timeline: 'typically one week from confirmed brief to final report.',
        },
      },
      {
        title: 'Re source an existing SKU',
        description: 'Benchmark new factories and routes against your current supplier so you know if a move is worth it.',
        bestFor: [
          'Brands and importers who already sell the product but want better margin or more stable supply.',
        ],
        whatYouGet: [
          'Side by side landed cost comparison of current and candidate suppliers.',
          'View of changes in duty freight and lead time.',
          'A recommendation on stay or move with notes on risk.',
        ],
        scopeAndTimeline: {
          scope: 'one SKU and multiple supplier options or regions.',
          timeline: 'typically one to two weeks depending on number of options.',
        },
      },
      {
        title: 'Test a higher risk category',
        description: 'Explore products with extra compliance or AD and CVD exposure without committing to a huge order.',
        bestFor: [
          'Teams entering new categories such as food toys or electronics where rules feel unclear.',
        ],
        whatYouGet: [
          'Early view of required tests and certifications.',
          'Duty and trade remedy risk checks by HS code and country pair.',
          'A recommendation on safe price range and practical next steps.',
        ],
        scopeAndTimeline: {
          scope: 'one SKU or small set of related SKUs with similar risk profile.',
          timeline: 'typically one week for initial assessment.',
        },
      },
      {
        title: 'Clean up a messy supply chain',
        description: 'Bring quotes duties quality data and logistics info for a product line into one view so decisions get faster.',
        bestFor: [
          'Importers with multi year products where data sits across emails spreadsheets and freight portals.',
        ],
        whatYouGet: [
          'Consolidated landed cost view across suppliers routes and pack sizes.',
          'Clear list of leaks in margin quality or lead time.',
          'A simple action roadmap such as where to re quote or which routes to retire.',
        ],
        scopeAndTimeline: {
          scope: 'multiple SKUs or one family of SKUs with shared packaging and routes.',
          timeline: 'typically two weeks for full review.',
        },
      },
    ],
  },
  workflow: {
    title: 'How NexSupply fits into your workflow',
    subtitle: 'Every use case follows the same simple path from idea to first shipment.',
    items: [
      {
        title: 'Share your product and target channel',
        body: 'Tell us what you want to import where you plan to sell it and which markets you care about. We capture the key details in a structured brief rather than chat screenshots.',
      },
      {
        title: 'Get a DDP cost and risk snapshot',
        body: 'We combine AI models with our trade playbooks to build a landed cost model and risk summary tailored to your channel and destination. You see factory price freight duty and extra costs in one view.',
      },
      {
        title: 'Choose report only or full pilot run',
        body: 'You can stop after the report book a call to walk through the numbers or move forward with factory search pilot orders and ongoing support. You stay in control of how far to go.',
      },
    ],
  },
  pricing: {
    title: 'What does it cost',
    subtitle: 'Simple pricing while NexSupply is in early alpha.',
    cards: [
      {
        title: 'Analysis and planning',
        items: [
          'Flat project fee for each analysis during alpha so you know your cost before we start.',
          'Includes AI report and one review call which is typically a bit more than half an hour.',
          'No subscription or long term contract during alpha.',
        ],
      },
      {
        title: 'When orders go through NexSupply',
        items: [
          'Transparent success fee only when you place orders through us.',
          'Fee linked to per unit margin with a hard cap so your upside stays protected.',
          'Currently focused on imports into the United States and selected markets in the European Union.',
        ],
      },
    ],
  },
  testimonials: {
    title: 'Results from real projects',
    subtitle: 'Early users rely on NexSupply to get clarity on landed cost lead times and risk before they commit. Here are a few examples.',
    items: [
      {
        segmentTag: 'Amazon FBA seller',
        context: 'When launching a new snack category we were worried about duties and AD and CVD risk.',
        quote: 'Finally we can sanity check margins and duties before we commit to inventory.',
        attribution: 'FBA seller snack category',
      },
      {
        segmentTag: 'Retail buyer',
        context: 'We were exploring a new hardlines category with complex compliance needs.',
        quote: 'The compliance flags helped us avoid a very expensive mistake on a new program.',
        attribution: 'Retail buyer hardlines',
      },
      {
        segmentTag: 'Food and beverage brand manager',
        context: 'We needed to test a new snack product quickly without jumping to a large order.',
        quote: 'We used NexSupply to test a new snack project. The whole process felt fast and contained.',
        attribution: 'Brand manager food and beverage',
      },
    ],
  },
  cta: {
    title: 'Ready to analyze your product',
    description: 'Pick your seller type and project above then request your first analysis. We usually respond within one business day by email and can schedule a call if you prefer.',
    buttonLabel: 'Start a project',
    buttonHref: '/chat',
  },
};

