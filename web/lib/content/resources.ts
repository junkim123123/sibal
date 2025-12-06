// web/lib/content/resources.ts

import {
  ResourcePageConfig,
  ResourceHeroSection,
  StartHereSection,
  DeepDiveSection,
  FAQSection,
} from '@/lib/types/resources';

const resourceHeroSection: ResourceHeroSection = {
  title: 'Resources',
  subtitle: 'Guides, examples, and FAQs to help you plan smarter imports with NexSupply.',
};

const startHereSection: StartHereSection = {
  title: 'Start here',
  cards: [
    {
      id: 'how-it-works',
      title: 'How NexSupply works',
      description: 'See how NexSupply turns a rough product idea into a landed cost and risk report.',
      cta: {
        id: 'view-guide',
        label: 'View guide →',
        href: '/how-it-works',
      },
    },
    {
      id: 'faq-page',
      title: 'Pricing, scope, and process FAQ',
      description: "Quick answers to what's included, how we charge, and where NexSupply fits into your workflow.",
      cta: {
        id: 'view-faqs',
        label: 'View all FAQs →',
        href: '/resources#faq',
      },
    },
    {
      id: 'analyze-product',
      title: 'Ready to analyze a product?',
      description: "Share a link or short description and we'll generate an AI-assisted cost and risk snapshot.",
      cta: {
        id: 'start-analysis',
        label: 'Start an analysis →',
        href: '/chat',
      },
    },
  ],
};

const deepDiveSection: DeepDiveSection = {
  title: 'Deep dive examples (coming soon)',
    subtitle: 'In-depth case studies that walk through real landed cost and compliance decisions.',
  cards: [
    {
      id: 'article-1',
      title: 'Case study: Launching a new snack on Amazon FBA (US)',
      description: 'How an importer tested a new snack SKU, compared AD/CVD scenarios, and chose a supplier they could scale with.',
      badge: 'Case study · Coming soon',
      tag: 'Amazon FBA',
    },
    {
      id: 'article-2',
      title: 'Case study: Hardlines category with complex compliance',
      description: 'A step-by-step look at mapping HS codes, duties, and safety requirements for a new retail hardlines program.',
      badge: 'Case study · Coming soon',
      tag: 'Retail',
    },
    {
      id: 'article-3',
      title: 'Case study: Cleaning up a messy multi-SKU supply chain',
      description: 'How a trading company consolidated quotes, freight, QC, and duties into one view to make faster decisions.',
      badge: 'Playbook · Coming soon',
      tag: 'Trading',
    },
  ],
};

const faqSection: FAQSection = {
  title: 'Frequently Asked Questions',
  subtitle: 'Short answers to the most common questions about scope, pricing, and how NexSupply fits into your import workflow.',
  items: [
    {
      id: 'what-does-nexsupply-do',
      question: 'What does NexSupply actually do?',
      answer:
        "NexSupply uses AI plus real-world trade data to turn a rough product idea into a landed cost and risk report.\n\nWe don't just find factories – we show you margin, freight, duties, and key compliance flags so you can make a clean go / no-go decision.",
    },
    {
      id: 'shipping-or-analysis',
      question: 'Do you handle shipping or only analysis?',
      answer:
        'During alpha, our main product is analysis and planning. We help you compare scenarios, pick suppliers, and understand landed cost. For selected projects, we can also support shipping and execution with our existing freight and QC partners.',
    },
    {
      id: 'replacement-for-sourcing-agent',
      question: 'Is this a replacement for a sourcing agent?',
      answer:
        'NexSupply can replace some of the heavy spreadsheet and quote-chasing work a sourcing agent usually does. Some clients use us instead of an agent, others use us on top of existing partners when they need clearer numbers and documentation for internal decisions.',
    },
    {
      id: 'how-accurate-are-numbers',
      question: 'How accurate are the numbers?',
      answer:
        "We combine supplier quotes, reference transactions, and live duty and freight data. The output is an estimate, not a guaranteed quote, but it's designed to be directionally accurate enough for budgeting, pricing, and go / no-go decisions.",
    },
    {
      id: 'how-long-analysis-take',
      question: 'How long does an analysis take?',
      answer:
        "After you submit a product brief, the initial AI-assisted snapshot is usually ready within 24–48 hours. If we need to collect extra quotes or documents for your category, we'll let you know and share an updated timeline.",
    },
  ],
};

export const resourcePageConfig: ResourcePageConfig = {
  hero: resourceHeroSection,
  startHere: startHereSection,
  deepDive: deepDiveSection,
  faq: faqSection,
};