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
    subtitle?: string;
    cards: Array<{
      title: string;
      body: string;
      target?: string;
      icon?: string;
      badgeColor?: string;
    }>;
  };
  socialProof: {
    badge?: string;
    title: string;
    subtitle?: string;
    rating: {
      value: string;
      label: string;
      badge?: string;
    };
    summary?: string;
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
    headline: 'Stop Guessing. Start Sourcing with Confidence.',
    subheadline: 'We combine AI-powered landed cost analysis with ground-level logistics to help Amazon FBA sellers and retailers import without the risk.',
    target: 'The Operating System for Global Sourcing',
    cta: {
      primary: {
        label: 'Start Free Analysis',
        href: '/chat',
      },
      secondary: {
        label: 'See How It Works',
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
    title: 'Built for every stage of your import journey',
    subtitle: 'Whether you are launching day one or scaling to containers, we de-risk the process.',
    cards: [
      {
        title: 'Launch Your First Private Label',
        body: 'Validate profit margins and calculate duty risks instantly before you buy inventory. Don\'t launch blind.',
        target: 'For Amazon FBA',
        icon: 'Rocket',
        badgeColor: 'amber',
      },
      {
        title: 'Re-Source & Optimize Margins',
        body: 'Factories get expensive over time. Benchmark your current supplier against vetted alternatives to reclaim lost profit.',
        target: 'For Established Brands',
        icon: 'TrendingUp',
        badgeColor: 'blue',
      },
      {
        title: 'Enter Regulated Categories',
        body: 'Avoid customs seizures. Get a roadmap for FDA, CPC, and compliance requirements before you ship a single unit.',
        target: 'For Retail & Wholesale',
        icon: 'ShieldCheck',
        badgeColor: 'emerald',
      },
    ],
  },
  socialProof: {
    badge: 'Trusted by Importers',
    title: 'Don\'t just take our word for it.',
    subtitle: 'From 7-figure Amazon sellers to retail procurement teams, see why smart importers are switching to NexSupply.',
    rating: {
      value: '4.9',
      label: 'Based on successful pilot shipments.',
    },
    quotes: [
      {
        quote: 'Finally, I can see landed cost before I wire any money. It\'s like having a sourcing expert in my pocket.',
        author: 'FBA Seller, CPG Category',
      },
      {
        quote: 'The compliance check prevented a very expensive mistake on a toy import. NexSupply saved us months of headache.',
        author: 'Retail Buyer, Hardlines',
      },
      {
        quote: 'We used NexSupply to test a new snack product. The process was simple, fast, and transparent.',
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
            title: 'Verified factory partners',
            body: 'We pre-screen suppliers and QC partners so you can focus on your product.',
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
            title: 'Anywhere support in your time zone',
            body: 'Get async advice from trade experts in your time zone, without the costly retainers.',
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
            title: 'No long term lock in',
            body: 'Our project-based engagement comes with clear pricing and no surprises.',
          },
        ],
      },
    ],
  },
  cta: {
    title: 'Ready to test your next import?',
    description: 'Start with one product. We will run a full landed cost and risk review, usually within one day.',
    buttonLabel: 'Get an analysis',
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
        id: 'kevin',
        headline: 'Great partner for test orders',
        quote:
          'We used NexSupply to ship only a few cartons of a new snack. Once it sold through they scaled us to pallets without any drama.',
        name: 'Kevin Park',
        role: 'Amazon FBA seller',
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
      {
        id: 'daniel',
        headline: 'Helped us avoid a compliance mess',
        quote:
          'NexSupply flagged a potential safety test issue on a toy project. Fixing it early probably saved us months.',
        name: 'Daniel Lee',
        role: 'Retail buyer',
        date: 'November 18, 2025',
      },
    ],
  },
  teamSection: {
    eyebrow: 'NexSupply behind the scenes',
    title: 'Trade crafted by world-class operators',
    body:
      "NexSupply is built by sourcing agents, logistics managers, and compliance nerds who have actually run containers between Asia and the US. We don't just quote landed costs — we've dealt with the factories, trucks, and customs paperwork ourselves.",
    members: [
      {
        id: 'mj',
        name: 'Myungjun Kim',
        title: 'Founder & Supply Chain Lead',
        bio: 'Grew up inside a family-run sourcing agency in Korea and Japan. Specializes in snacks, toys, and seasonal goods for US and Japanese retailers.',
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

