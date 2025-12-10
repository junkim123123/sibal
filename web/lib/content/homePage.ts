// Config for Home page

export type HomeReview = {
  id: string;
  headline: string;
  quote: string;
  name: string;
  role?: string;
  date: string;
};

export type HomeReviewsSection = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  averageRating: number;
  ratingLabel: string; // e.g. "4.6 average rating based on internal pilot users"
  reviews: HomeReview[];
};

export type HomeTeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  badges?: string[]; // e.g. "Amazon FBA", "Korean snacks", etc.
};

export type HomeTeamSection = {
  eyebrow?: string;
  title: string;
  body: string;
  members: HomeTeamMember[];
};

export interface HomePageConfig {
  hero: {
    headline: string;
    subheadline: string;
    target: string;
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
    snapshot: {
      badge: string;
      mainValue: string;
      mainLabel: string;
      details: string;
      disclaimer: string;
    };
  };
  useCases: {
    title: string;
    cards: Array<{
      title: string;
      body: string;
      target?: string;
    }>;
  };
  socialProof: {
    title: string;
    rating: {
      value: string;
      label: string;
      badge: string;
    };
    summary: string;
    quotes: Array<{
      quote: string;
      author: string;
    }>;
  };
  benefits: {
    title: string;
    pillars: Array<{
      title: string;
      items: Array<{
        title: string;
        body: string;
      }>;
    }>;
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
  };
  reviewsSection: HomeReviewsSection;
  teamSection: HomeTeamSection;
}

export const homePageConfig: HomePageConfig = {
  hero: {
    headline: 'Know your landed cost before you buy inventory',
    subheadline: 'NexSupply runs the numbers on freight, duties, and compliance so you can test products with confidence, not guesswork.',
    target: 'For Amazon FBA sellers, DTC brands, and importers bringing goods into the United States.',
    cta: {
      primary: {
        label: 'Start with one product',
        href: '/chat',
      },
      secondary: {
        label: 'See how NexSupply fits into your workflow',
        href: '/how-it-works',
      },
    },
    snapshot: {
      badge: 'Example estimate',
      mainValue: '$2.10',
      mainLabel: 'Landed cost per unit',
      details: 'Includes factory cost, sea freight, duties, and handling',
      disclaimer: 'Illustrative example, not a live quote',
    },
  },
  useCases: {
    title: 'Common ways people start with NexSupply',
    cards: [
      {
        title: 'Launch a new FBA brand',
        body: '<strong>Validate margin</strong> and duty risk before you launch your first private label product.',
        target: 'Typical users: CPG brands and FBA aggregators',
      },
      {
        title: 'Re-source an existing SKU',
        body: 'Compare your current factory to vetted alternatives on landed cost and risk. Often <strong>70% cheaper</strong> than current suppliers.',
        target: 'Typical users: Established sellers optimizing margins',
      },
      {
        title: 'Test a higher-risk category',
        body: 'Get an AD or CVD and <strong>compliance check</strong> before you import into a new category.',
        target: 'Typical users: Brands entering regulated categories',
      },
    ],
  },
  socialProof: {
    title: 'See what importers are saying about NexSupply',
    rating: {
      value: '4.8 / 5',
      label: 'from verified sourcing projects',
      badge: 'Verified Sourcing Projects',
    },
    summary: 'Faster landed-cost clarity, fewer surprises at customs.',
    quotes: [
      {
        quote: 'Finally, I can see landed cost before I wire any money.',
        author: 'FBA Seller, CPG Category',
      },
      {
        quote: 'The compliance check prevented a very expensive mistake.',
        author: 'Retail Buyer, Hardlines',
      },
      {
        quote: 'We used NexSupply to test a new snack product. The process was simple and fast.',
        author: 'Brand Manager, Food & Beverage',
      },
    ],
  },
  benefits: {
    title: 'Why importers work with NexSupply',
    pillars: [
      {
        title: 'Better information before you commit',
        items: [
          {
            title: 'Owned Quality Control Hubs',
            body: 'We don\'t just \'screen\' partners. We operate our own packing hubs to ensure 0% defect rates before shipping.',
          },
          {
            title: 'Smaller first tests',
            body: 'Start with small DDP runs to test the market before committing to big orders.',
          },
        ],
      },
      {
        title: 'Less friction for your team',
        items: [
          {
            title: '24/7 Async Trade Desk',
            body: 'Expert guidance that moves at the speed of software. No hourly billings, just answers.',
          },
          {
            title: 'One inbox for your project',
            body: 'Keep quotes, compliance documents, and shipping updates in one place.',
          },
        ],
      },
      {
        title: 'Cleaner unit economics',
        items: [
          {
            title: 'Landed cost clarity, not guesses',
            body: 'See duties, freight, and other extras in one estimate before you commit.',
          },
          {
            title: 'Flexible, Pay-as-you-Scale',
            body: 'Start with a single SKU pilot and scale to containers. Our pricing adapts to your volume.',
          },
        ],
      },
    ],
  },
  cta: {
    title: 'Ready to test your next import?',
    description: 'Start with one product. We will run a full landed cost and risk review, usually within one day.',
    buttonLabel: 'Calculate My Profit',
    buttonHref: '/chat',
  },
  reviewsSection: {
    eyebrow: 'Showing featured reviews',
    title: 'See what importers are saying about NexSupply',
    subtitle: undefined,
    averageRating: 4.6,
    ratingLabel: 'Four point six average rating based on internal pilot users',
    reviews: [
      {
        id: 'verified-fba',
        headline: 'Great partner for test orders',
        quote:
          'We used NexSupply to ship only a few cartons of a new snack. Once it sold through they scaled us to pallets without any drama.',
        name: 'Verified FBA Seller',
        role: 'Miami-based Importer',
        date: 'November 25, 2025',
      },
      {
        id: 'ashley',
        headline: 'DDP costs that finally made sense',
        quote:
          'For the first time we saw factory price, freight, duty, and extra fees in one place. It made our go or no go meetings much faster.',
        name: 'Ashley Gomez',
        role: 'DTC brand operator',
        date: 'November 22, 2025',
      },
    ],
  },
  teamSection: {
    eyebrow: 'NexSupply behind the scenes',
    title: 'Built by 2nd-Gen Traders & FBA Veterans',
    body:
      "NexSupply is built by sourcing agents, logistics managers, and compliance specialists who have actually run containers between Asia and the US. We don't just quote landed costs — we've dealt with the factories, trucks, and customs paperwork ourselves.",
    members: [
      {
        id: 'mj',
        name: 'Myungjun Kim',
        title: 'Founder & Supply Chain Lead',
        bio: 'Leveraging a 20-year family manufacturing network in East Asia. Connecting heritage sourcing with modern tech.',
        badges: ['Snacks & confectionery', 'Japan & Korea', 'Amazon FBA'],
      },
      {
        id: 'kevin-ops',
        name: 'Kevin Park',
        title: 'Amazon FBA Operator',
        bio: 'Scaled multiple private label brands from test cartons to full containers. Obsessed with margin math and keeping prep simple.',
        badges: ['Amazon FBA', 'Margin analysis'],
      },
      {
        id: 'daniel-compliance',
        name: 'Daniel Lee',
        title: 'Compliance & Risk Advisor',
        bio: '10+ years helping importers navigate duties, HTS classification, and product safety requirements for US retail.',
        badges: ['Tariffs & HTS', 'Product safety'],
      },
    ],
  },
};

