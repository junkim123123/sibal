// web/lib/content/resources.ts

import {
  ResourcePageConfig,
  ResourceHeroSection,
  StartHereSection,
  FeaturedProjectsSection,
  KnowledgeHubSection,
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

const featuredProjectsSection: FeaturedProjectsSection = {
  title: 'Featured Projects',
  subtitle: 'Real sourcing projects that showcase our capabilities across retail, export, and e-commerce channels.',
  projects: [
    {
      id: 'pokemon-7eleven',
      title: 'Verified IP Sourcing for 7-Eleven',
      description: 'Navigated complex IP licensing and food safety compliance to deliver Pokemon-branded confectioneries to 7-Eleven shelves.',
      tag: 'Retail Sourcing / IP Licensing',
      image: {
        src: '/images/projects/pokemon-7eleven.png',
        alt: 'Pokemon jelly beans at 7-Eleven store',
      },
    },
    {
      id: 'donquijote-marshmallow',
      title: 'Strict QA for Don Quijote Japan',
      description: 'Passed rigorous Japanese food safety standards to supply seasonal confectionery to Don Quijote retail chain.',
      tag: 'Japan Export / Food Safety',
      image: {
        src: '/images/projects/donquijote-marshmallow.png',
        alt: 'Marshmallow skewers for Don Quijote Japan',
      },
    },
    {
      id: 'amazon-fingerboard',
      title: 'High-Volume Toy Sourcing for FBA',
      description: 'Managed end-to-end production and CPC certification for a top-ranking toy category in Southeast Asia.',
      tag: 'Amazon FBA / Toy Compliance',
      image: {
        src: '/images/projects/amazon-fingerboard.png',
        alt: 'Fingerboard toy set for Amazon FBA',
      },
    },
  ],
};

const knowledgeHubSection: KnowledgeHubSection = {
  title: 'Sourcing Insights',
  subtitle: 'Video guides and market intelligence to help you make smarter sourcing decisions.',
  videos: [
    {
      id: 'inside-nexsupply',
      title: 'Inside NexSupply',
      description: 'See how our on-ground team manages QC and logistics in real-time.',
      youtubeId: '1pMa-6muGQ0',
    },
    {
      id: 'service-nexsupply',
      title: 'Service NexSupply',
      description: 'Learn about our comprehensive sourcing services and how we help importers succeed.',
      youtubeId: 'aJOCT_E0RlE',
    },
    {
      id: 'on-site-nexsupply',
      title: 'On Site NexSupply',
      description: 'Get a behind-the-scenes look at our operations and infrastructure.',
      youtubeId: 'iJRGh4Tyhbw',
    },
    {
      id: 'earth-conquest-01',
      title: 'Earth Conquest Report #01: The Peelable Virus 🦠',
      description: 'Market intelligence and trend analysis for innovative products.',
      youtubeId: 'VJNJC-8Fwtk',
    },
    {
      id: 'earth-conquest-02',
      title: 'Earth Conquest Report #02: The Labor Paradox 🍣',
      description: 'Deep dive into manufacturing and labor market insights.',
      youtubeId: 'EdP6Wrd6Tug',
    },
    {
      id: 'long-long-man-scam',
      title: 'The "Long Long Man" Candy Scam? 👽📏',
      description: 'Product analysis and market trend scouting.',
      youtubeId: 'VkRKPXEwRQs',
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
  featuredProjects: featuredProjectsSection,
  knowledgeHub: knowledgeHubSection,
  faq: faqSection,
};