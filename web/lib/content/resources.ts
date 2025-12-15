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
  subtitle: 'Guides, examples, and FAQs to plan smarter imports with NexSupply.',
};

const startHereSection: StartHereSection = {
  title: 'Start here',
  cards: [
    {
      id: 'how-it-works',
      title: 'How NexSupply works',
      description: 'See how we turn a product idea into a landed cost and risk snapshot.',
      cta: {
        id: 'view-guide',
        label: 'View guide',
        href: '/how-it-works',
      },
    },
    {
      id: 'faq-page',
      title: 'Pricing, scope, and process FAQ',
      description: 'Quick answers on what is included, how pricing works, and what to expect next.',
      cta: {
        id: 'view-faqs',
        label: 'View all FAQs',
        href: '/resources#faq',
      },
    },
    {
      id: 'analyze-product',
      title: 'Ready to analyze a product',
      description: 'Share a link or short description and we will generate a cost and risk snapshot.',
      cta: {
        id: 'start-analysis',
        label: 'Start free audit',
        href: '/chat',
      },
    },
  ],
};

const featuredProjectsSection: FeaturedProjectsSection = {
  title: 'Featured projects',
  subtitle: 'Real projects across retail, export, and e commerce.',
  projects: [
    {
      id: 'pokemon-7eleven',
      title: 'Verified IP Sourcing for 7-Eleven',
      description: 'Navigated complex IP licensing and food safety compliance to deliver Pokemon-branded confectioneries to 7-Eleven shelves.',
      tag: 'Retail Sourcing / IP Licensing',
      result: 'IP cleared and QC approved',
      country: 'US',
      image: {
        src: '/images/projects/pokemon-7eleven.png',
        alt: 'Pokemon jelly beans at 7-Eleven store',
      },
    },
    {
      id: 'donquijote-marshmallow',
      title: 'Strict QA for Don Quijote Japan',
      description: 'Met rigorous Japanese food safety standards to supply seasonal confectionery to Don Quijote retail chain.',
      tag: 'Japan Export / Food Safety',
      result: 'Passed Japan food safety requirements',
      country: 'JP',
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
      result: 'Certified and scaled to top rankings',
      country: 'SEA',
      image: {
        src: '/images/projects/amazon-fingerboard.png',
        alt: 'Fingerboard toy set for Amazon FBA',
      },
    },
  ],
};

const knowledgeHubSection: KnowledgeHubSection = {
  title: 'Sourcing insights',
  subtitle: 'Video guides and market notes to help you make better sourcing decisions.',
  videos: [
    {
      id: 'inside-nexsupply',
      title: 'Virtual tour: Shenzhen packing hub',
      description: 'See how our on-ground team manages QC and logistics in real-time.',
      youtubeId: '1pMa-6muGQ0',
      category: 'operations',
    },
    {
      id: 'service-nexsupply',
      title: 'How we work: Quote to delivery',
      description: 'Learn about our comprehensive sourcing services and how we help importers succeed.',
      youtubeId: 'aJOCT_E0RlE',
      category: 'operations',
    },
    {
      id: 'on-site-nexsupply',
      title: 'On site: NexSupply operations',
      description: 'Get a behind-the-scenes look at our operations and infrastructure.',
      youtubeId: 'iJRGh4Tyhbw',
      category: 'operations',
    },
    {
      id: 'earth-conquest-01',
      title: 'Earth Conquest Report #01: The Peelable Virus',
      description: 'Market intelligence and product scouting for emerging categories.',
      youtubeId: 'VJNJC-8Fwtk',
      category: 'trends',
    },
    {
      id: 'earth-conquest-02',
      title: 'Earth Conquest Report #02: The Labor Paradox',
      description: 'Market intelligence and product scouting for emerging categories.',
      youtubeId: 'EdP6Wrd6Tug',
      category: 'trends',
    },
    {
      id: 'long-long-man-scam',
      title: 'The "Long Long Man" Candy Scam?',
      description: 'Market intelligence and product scouting for emerging categories.',
      youtubeId: 'VkRKPXEwRQs',
      category: 'trends',
    },
  ],
};

const faqSection: FAQSection = {
  title: 'Frequently asked questions',
  subtitle: 'Short answers on scope, pricing, and how NexSupply fits into your workflow.',
  items: [
    {
      id: 'what-does-nexsupply-do',
      question: 'What does NexSupply do',
      answer:
        "NexSupply uses AI plus real-world trade data to turn a rough product idea into a landed cost and risk report.\n\nWe don't just find factories – we show you margin, freight, duties, and key compliance flags so you can make a clean go or no go decision.",
    },
    {
      id: 'what-do-i-need-to-submit',
      question: 'What do I need to submit to start',
      answer:
        'Share a product link, photo, or short description. We capture key details in a structured brief so the analysis fits your real constraints.',
    },
    {
      id: 'shipping-or-analysis',
      question: 'Do you handle shipping or only analysis',
      answer:
        'Our main product is analysis and planning. We help you compare scenarios, pick suppliers, and understand landed cost. For selected projects, we can also support shipping and execution with our existing freight and QC partners.',
    },
    {
      id: 'can-you-work-with-current-supplier',
      question: 'Can you work with my current supplier',
      answer:
        'Yes. You can bring your own suppliers and use NexSupply only for cost and risk checks or to benchmark new options.',
    },
    {
      id: 'replacement-for-sourcing-agent',
      question: 'Is this a replacement for a sourcing agent',
      answer:
        'NexSupply can replace some of the heavy spreadsheet and quote-chasing work a sourcing agent usually does. Some clients use us instead of an agent, others use us on top of existing partners when they need clearer numbers and documentation for internal decisions.',
    },
    {
      id: 'how-accurate-are-numbers',
      question: 'How accurate are the numbers',
      answer:
        "We combine supplier quotes, reference transactions, and live duty and freight data. The output is an estimate, not a guaranteed quote, but it's designed to be directionally accurate enough for budgeting, pricing, and go or no go decisions.",
    },
    {
      id: 'how-long-analysis-take',
      question: 'How long does an audit take',
      answer:
        "After you submit a product brief, the initial AI-assisted snapshot is usually ready within 1 business day. If we need to collect extra quotes or documents for your category, we'll let you know and share an updated timeline.",
    },
    {
      id: 'what-happens-after-audit',
      question: 'What happens after the audit',
      answer:
        'You can stop at the snapshot, book a call to go deeper, or move into factory search and a pilot order. You control pace and budget.',
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