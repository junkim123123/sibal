// Config for Home page
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
}

export const homePageConfig: HomePageConfig = {
  hero: {
    headline: 'Know your landed cost before you buy inventory',
    subheadline: 'NexSupply runs the numbers on freight, duties, and compliance so you can test products with confidence, not guesswork.',
    target: 'For Amazon FBA sellers, DTC brands, and importers bringing goods into the United States.',
    cta: {
      primary: {
        label: 'Start with one product',
        href: '/analyze',
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
        body: 'Validate margin and duty risk before you launch your first private label product.',
        target: 'Typical users: CPG brands and FBA aggregators',
      },
      {
        title: 'Re-source an existing SKU',
        body: 'Compare your current factory to vetted alternatives on landed cost and risk.',
        target: 'Typical users: Established sellers optimizing margins',
      },
      {
        title: 'Test a higher-risk category',
        body: 'Get an AD or CVD and compliance check before you import into a new category.',
        target: 'Typical users: Brands entering regulated categories',
      },
    ],
  },
  socialProof: {
    title: 'See what importers are saying about NexSupply',
    rating: {
      value: '4.8 / 5',
      label: 'from early beta projects',
      badge: 'Early beta projects',
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
    buttonHref: '/analyze',
  },
};

