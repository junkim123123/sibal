export type Language = 'en' | 'ko';

export interface Translations {
  // Navigation
  nav: {
    solutions: string;
    useCases: string;
    resources: string;
    pricing: string;
    dashboard: string;
    support: string;
    account: string;
  };
  // Common
  common: {
    getStarted: string;
    signIn: string;
    signOut: string;
    myDashboard: string;
    loading: string;
  };
  // Homepage
  home: {
    hero: {
      badge: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      subtitleHighlight1: string;
      subtitleHighlight2: string;
      subtitleHighlight3: string;
      cta: string;
      ctaSecondary: string;
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
    useCases: {
      title: string;
      cards: Array<{
        title: string;
        body: string;
        target: string;
      }>;
    };
    cta: {
      title: string;
      description: string;
      buttonLabel: string;
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
      verifiedShipment: string;
    };
    reviews: {
      eyebrow: string;
      title: string;
      ratingLabel: string;
    };
    team: {
      eyebrow: string;
      title: string;
      body: string;
    };
  };
  pricing: {
    hero: {
      title: string;
      subtitle: string;
    };
    tiers: {
      starter: {
        tag: string;
        title: string;
        price: string;
        pricePeriod: string;
        features: string[];
        cta: string;
      };
      validator: {
        tag: string;
        title: string;
        price: string;
        pricePeriod: string;
        features: string[];
        cta: string;
      };
      executor: {
        tag: string;
        title: string;
        price: string;
        pricePeriod: string;
        features: string[];
        cta: string;
      };
    };
    howItWorks: {
      title: string;
      steps: Array<{
        title: string;
        description: string;
      }>;
    };
    guarantee: {
      title: string;
      description: string;
    };
    globalSync: {
      title: string;
      description: string;
    };
    disclaimer: string;
    mostPopular: string;
    sslSecure: string;
  };
  dashboard: {
    greeting: string;
    greetingWithName: string;
    subtitle: string;
    newAnalysisRequest: string;
    newAnalysisRequestShort: string;
    tabs: {
      overview: string;
      sourcingEstimates: string;
      activeOrders: string;
    };
    stats: {
      actionRequired: string;
      inTransit: string;
      activeOrders: string;
    };
    overview: {
      recentActivity: string;
      noRecentActivity: string;
      noRecentActivityDesc: string;
      createFirstRequest: string;
      quickActions: string;
      settings: string;
      allEstimates: string;
    };
    estimates: {
      noEstimates: string;
      noEstimatesDesc: string;
      createFirstRequest: string;
      productInfo: string;
      date: string;
      estUnitCost: string;
      status: string;
      action: string;
      connectAgent: string;
      connect: string;
      connecting: string;
      awaitingAgent: string;
      awaiting: string;
      viewReport: string;
      view: string;
    };
    orders: {
      noOrders: string;
      noOrdersDesc: string;
      viewEstimates: string;
      messageAgent: string;
      agentReviewing: string;
      managerWillBeAssigned: string;
      startChattingWithAgent: string;
      viewQuoteApprove: string;
      unlockQuote: string;
      new: string;
    };
    payment: {
      connectWithAgent: string;
      connectAgentDesc: string;
      sourcingRetainer: string;
      oneTimeFee: string;
      creditedUponOrder: string;
      creditedUponOrderDesc: string;
      dedicatedAgent: string;
      dedicatedAgentDesc: string;
      factoryVerification: string;
      factoryVerificationDesc: string;
      officialQuote: string;
      officialQuoteDesc: string;
      ndaAgreement: string;
      ndaAgreementDesc: string;
      viewNDATerms: string;
      nonRefundableNotice: string;
      proceedToPayment: string;
      processing: string;
      cancel: string;
      paymentSuccessful: string;
      paymentSuccessfulDesc: string;
    };
  };
  account: {
    title: string;
    subtitle: string;
    tabs: {
      myProfile: string;
      companyDetails: string;
      warehouseDestination: string;
    };
    profile: {
      changePhoto: string;
      photoHint: string;
      fullName: string;
      jobTitle: string;
      jobTitlePlaceholder: string;
      email: string;
      emailCannotChange: string;
      phoneNumber: string;
      phonePlaceholder: string;
      updatePassword: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      updating: string;
      saveChanges: string;
      saving: string;
      profileSaved: string;
      loginRequired: string;
      saveFailed: string;
      saveError: string;
    };
    company: {
      companyName: string;
      companyNamePlaceholder: string;
      taxId: string;
      taxIdOptional: string;
      taxIdPlaceholder: string;
      taxIdHint: string;
      storefrontUrl: string;
      storefrontUrlPlaceholder: string;
      storefrontUrlHint: string;
      expectedVolume: string;
      selectVolume: string;
      volumeLcl: string;
      volumeSmall: string;
      volumeMedium: string;
      volumeLarge: string;
      volumeEnterprise: string;
    };
    shipping: {
      fbaWarehouse: string;
      fbaWarehouseDesc: string;
      fbaLabelingRequired: string;
      fbaLabelingDesc: string;
      fbaShipmentId: string;
      fbaShipmentIdPlaceholder: string;
      fbaShipmentIdHint: string;
      storeName: string;
      storeNamePlaceholder: string;
      storeNameHint: string;
      country: string;
      address: string;
      addressPlaceholder: string;
      aptSuite: string;
      aptSuitePlaceholder: string;
      city: string;
      cityPlaceholder: string;
      state: string;
      selectState: string;
      zipCode: string;
      zipCodePlaceholder: string;
    };
  };
  support: {
    title: string;
    subtitle: string;
    critical: {
      title: string;
      description: string;
      avgResponse: string;
      email: string;
    };
    agent: {
      title: string;
      description: string;
      button: string;
    };
    operations: {
      title: string;
      description: string;
      hours: string;
      asyncSupport: string;
      email: string;
    };
    business: {
      title: string;
      description: string;
      email: string;
    };
    chat: {
      needHelp: string;
      chatSupport: string;
      startConversation: string;
      emailSupport: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      solutions: 'Solutions',
      useCases: 'Use Cases',
      resources: 'Resources',
      pricing: 'Pricing',
      dashboard: 'Dashboard',
      support: 'Support',
      account: 'Account',
    },
    common: {
      getStarted: 'Get Started',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      myDashboard: 'My dashboard',
      loading: 'Loading...',
    },
    home: {
      hero: {
        badge: 'Predictable Sourcing for Modern Brands',
        title: 'Stop Guessing.',
        titleHighlight: 'Start Sourcing with Confidence.',
        subtitle: 'We combine AI sourcing intelligence with owned packing infrastructure to help FBA sellers and retailers import with total clarity and control.',
        subtitleHighlight1: 'AI sourcing intelligence',
        subtitleHighlight2: 'owned packing infrastructure',
        subtitleHighlight3: 'total clarity and control',
        cta: 'Start Free Analysis',
        ctaSecondary: 'See How It Works',
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
      cta: {
        title: 'Ready to test your next import?',
        description: 'Start with one product. We will run a full landed cost and risk review, usually within one day.',
        buttonLabel: 'Calculate My Profit',
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
        verifiedShipment: 'Verified Shipment',
      },
      reviews: {
        eyebrow: 'Showing featured reviews',
        title: 'See what importers are saying about NexSupply',
        ratingLabel: 'Four point six average rating based on internal pilot users',
      },
      team: {
        eyebrow: 'NexSupply behind the scenes',
        title: 'Built by 2nd-Gen Traders & FBA Veterans',
        body: "NexSupply is built by sourcing agents, logistics managers, and compliance specialists who have actually run containers between Asia and the US. We don't just quote landed costs — we've dealt with the factories, trucks, and customs paperwork ourselves.",
      },
    },
    pricing: {
      hero: {
        title: 'Simple Pricing, Zero Hidden Costs',
        subtitle: 'From instant AI analysis to door-to-door delivery. Scale your sourcing without the guesswork.',
      },
      tiers: {
        starter: {
          tag: 'Free Tool',
          title: 'Market Intelligence',
          price: 'Free',
          pricePeriod: ' / Forever',
          features: [
            'Instant Landed Cost Simulation',
            'Regulatory Risk Check (FDA/CPSIA)',
            '30 AI Reports per month',
            'No credit card required',
          ],
          cta: 'Start Free Analysis',
        },
        validator: {
          tag: 'Start with One Box',
          title: 'Verified Sourcing Plan',
          price: '$49',
          pricePeriod: ' / Refundable Deposit',
          features: [
            'Real Factory Quotes (48h)',
            'Sample Consolidation',
            '100% Credited to Your Order',
            'Dedicated Sourcing Expert assigned',
            'Supplier Background Check',
          ],
          cta: 'Start Risk-Free Project',
        },
        executor: {
          tag: 'End-to-End Solution',
          title: 'End-to-End Execution',
          price: 'Flat 5%',
          pricePeriod: ' Service Fee',
          features: [
            'Production Management & QC',
            'Labeling & Packaging (Kitting)',
            'DDP Logistics Coordination',
            'Net-30 Payment Terms (Qualified)',
          ],
          cta: 'Contact Sales',
        },
      },
      howItWorks: {
        title: 'How Our Pricing Works',
        steps: [
          {
            title: 'Place Deposit',
            description: 'Confirm your seriousness with a $49 fully refundable deposit. This activates your dedicated team.',
          },
          {
            title: 'Receive Quotes',
            description: 'We negotiate directly with verified manufacturers to secure the best FOB pricing and MOQ.',
          },
          {
            title: '100% Credit Back',
            description: 'When you place the production order, the $49 is fully deducted from your invoice. You lose nothing.',
          },
        ],
      },
      guarantee: {
        title: 'Response Guarantee',
        description: 'We guarantee a response within 24 business hours. No more ghosting factories.',
      },
      globalSync: {
        title: 'Global Sync',
        description: 'Our local teams bridge the time zone gap, ensuring communication flows while you sleep.',
      },
      disclaimer: 'Service fees are based on FOB value. AI estimates are for reference only. Final pricing is confirmed upon retainer payment.',
      mostPopular: 'Most Popular',
      sslSecure: 'SSL Secure Payment',
    },
    dashboard: {
      greeting: 'Welcome back.',
      greetingWithName: 'Welcome back, {name}.',
      subtitle: 'Manage your sourcing estimates and track shipments.',
      newAnalysisRequest: '+ New Analysis Request',
      newAnalysisRequestShort: '+ New',
      tabs: {
        overview: 'Overview',
        sourcingEstimates: 'Sourcing Estimates',
        activeOrders: 'Active Orders',
      },
      stats: {
        actionRequired: 'Action Required',
        inTransit: 'In Transit',
        activeOrders: 'Active Orders',
      },
      overview: {
        recentActivity: 'Recent Activity',
        noRecentActivity: 'No recent activity',
        noRecentActivityDesc: 'Get started by creating your first sourcing request to see activity here.',
        createFirstRequest: 'Create First Request',
        quickActions: 'Quick Actions',
        settings: 'Settings',
        allEstimates: 'All Estimates',
      },
      estimates: {
        noEstimates: 'No estimates yet',
        noEstimatesDesc: 'Start by analyzing your first product to see your estimates here.',
        createFirstRequest: 'Create first request',
        productInfo: 'Product Info',
        date: 'Date',
        estUnitCost: 'Est. Unit Cost',
        status: 'Status',
        action: 'Action',
        connectAgent: 'Connect Agent',
        connect: 'Connect',
        connecting: 'Connecting...',
        awaitingAgent: 'Awaiting Agent...',
        awaiting: 'Awaiting...',
        viewReport: 'View Report',
        view: 'View',
      },
      orders: {
        noOrders: 'No active orders yet',
        noOrdersDesc: 'Request an agent from your estimates to see active orders here.',
        viewEstimates: 'View estimates',
        messageAgent: 'Message Agent',
        agentReviewing: 'Agent is reviewing your request',
        managerWillBeAssigned: '⏰ Manager will be assigned within 24 hours',
        startChattingWithAgent: 'Start chatting with your agent to discuss requirements',
        viewQuoteApprove: 'View Quote & Approve',
        unlockQuote: 'Unlock Quote - $49',
        new: 'New',
      },
      payment: {
        connectWithAgent: 'Connect with a Dedicated Agent',
        connectAgentDesc: 'Get official quotes and negotiate with suppliers.',
        sourcingRetainer: '$49 Sourcing Retainer',
        oneTimeFee: 'One-time sourcing initiation fee',
        creditedUponOrder: 'Credited Upon Order',
        creditedUponOrderDesc: 'This fee covers the agent\'s labor for negotiation and is non-refundable. However, it will be fully deducted from your final 5% service fee when you proceed with the order.',
        dedicatedAgent: 'Dedicated Agent Assignment',
        dedicatedAgentDesc: 'Your personal sourcing specialist assigned to your project',
        factoryVerification: 'Factory Verification & Price Negotiation',
        factoryVerificationDesc: 'We find and verify trusted factories, then negotiate the best prices',
        officialQuote: 'Official Quote (PI) Issuance',
        officialQuoteDesc: 'Receive formal Proforma Invoice from verified manufacturers',
        ndaAgreement: 'I agree to the NexSupply Standard NDA (Non-Disclosure Agreement)',
        ndaAgreementDesc: 'By proceeding, you acknowledge that all project information will be kept confidential and protected under our standard NDA terms.',
        viewNDATerms: 'View NDA Terms',
        nonRefundableNotice: 'The sourcing fee is non-refundable once the official quote has been delivered.',
        proceedToPayment: 'Proceed to Payment',
        processing: 'Processing...',
        cancel: 'Cancel',
        paymentSuccessful: 'Payment Successful!',
        paymentSuccessfulDesc: 'An agent will be assigned shortly.',
      },
    },
    account: {
      title: 'Account Settings',
      subtitle: 'Manage your profile, company information, and shipping preferences.',
      tabs: {
        myProfile: 'My Profile',
        companyDetails: 'Company Details',
        warehouseDestination: 'Warehouse / Destination',
      },
      profile: {
        changePhoto: 'Change Photo',
        photoHint: 'JPG, PNG or GIF. Max size 2MB',
        fullName: 'Full Name',
        jobTitle: 'Job Title',
        jobTitlePlaceholder: 'e.g. CEO, Purchasing Manager',
        email: 'Email',
        emailCannotChange: 'Email cannot be changed. Contact support if you need to update it.',
        phoneNumber: 'Phone Number',
        phonePlaceholder: '+1 (555) 123-4567',
        updatePassword: 'Update Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm New Password',
        updating: 'Updating...',
        saveChanges: 'Save Changes',
        saving: 'Saving...',
        profileSaved: 'Profile saved successfully.',
        loginRequired: 'Login required.',
        saveFailed: 'Failed to save profile. Please try again.',
        saveError: 'An error occurred while saving profile.',
      },
      company: {
        companyName: 'Company Name',
        companyNamePlaceholder: 'Acme Corporation',
        taxId: 'Tax ID / EIN',
        taxIdOptional: '(Optional)',
        taxIdPlaceholder: 'e.g. EIN, VAT Number, or Business Reg. ID',
        taxIdHint: 'Required for invoicing and tax documentation',
        storefrontUrl: 'Storefront / Sales Channel URL',
        storefrontUrlPlaceholder: 'https://www.amazon.com/shops/yourstore or https://yourstore.com',
        storefrontUrlHint: 'Your Amazon store, Shopify store, or other sales channel',
        expectedVolume: 'Expected Import Volume',
        selectVolume: 'Select volume...',
        volumeLcl: 'Less than 1 container (LCL / Air Freight)',
        volumeSmall: '1-5 containers/year',
        volumeMedium: '6-20 containers/year',
        volumeLarge: '21-50 containers/year',
        volumeEnterprise: '50+ containers/year',
      },
      shipping: {
        fbaWarehouse: 'This is an Amazon FBA Warehouse',
        fbaWarehouseDesc: 'Check this if you\'re shipping directly to an Amazon fulfillment center',
        fbaLabelingRequired: '⚠️ Amazon FBA Labeling Required',
        fbaLabelingDesc: 'Make sure you have your FBA Shipment ID ready for proper labeling',
        fbaShipmentId: 'FBA Shipment ID / Reference Code',
        fbaShipmentIdPlaceholder: 'e.g. FBA123456789 or Shipment Reference',
        fbaShipmentIdHint: 'Optional: Your Amazon shipment reference for labeling',
        storeName: 'Store Name (for Labeling)',
        storeNamePlaceholder: 'e.g. My Amazon Store',
        storeNameHint: 'Optional: Store name for FBA shipment labeling',
        country: 'Country / Region',
        address: 'Address',
        addressPlaceholder: '123 Main Street',
        aptSuite: 'Apt / Suite',
        aptSuitePlaceholder: 'Suite 100',
        city: 'City',
        cityPlaceholder: 'Los Angeles',
        state: 'State',
        selectState: 'Select State',
        zipCode: 'Zip Code',
        zipCodePlaceholder: '90001',
      },
    },
    support: {
      title: 'Get in touch',
      subtitle: 'Choose the right channel for your inquiry.',
      critical: {
        title: 'Critical Logistics Escalation',
        description: 'For customs holds or shipping emergencies. This inbox is monitored by our senior logistics team.',
        avgResponse: 'Avg. Response: < 2 Hours',
        email: 'urgent@nexsupply.net',
      },
      agent: {
        title: 'Talk to your Sourcing Agent',
        description: 'Need updates on an active quote or sample? The fastest way is to message your agent directly through the dashboard.',
        button: 'Open Agent Chat',
      },
      operations: {
        title: 'Trade Operations Desk',
        description: 'For billing, platform usage, and account management.',
        hours: 'Hours: 9am to 6pm EST, Mon-Fri.',
        asyncSupport: 'Async support available during Asia business hours.',
        email: 'support@nexsupply.net',
      },
      business: {
        title: 'Business & Press',
        description: 'For factory partnerships or media inquiries.',
        email: 'partners@nexsupply.net',
      },
      chat: {
        needHelp: 'Need Help?',
        chatSupport: 'Chat Support',
        startConversation: 'Start a conversation with our support team.',
        emailSupport: 'Email Support',
      },
    },
  },
  ko: {
    nav: {
      solutions: '솔루션',
      useCases: '사용 사례',
      resources: '리소스',
      pricing: '가격',
      dashboard: '대시보드',
      support: '지원',
      account: '계정',
    },
    common: {
      getStarted: '시작하기',
      signIn: '로그인',
      signOut: '로그아웃',
      myDashboard: '내 대시보드',
      loading: '로딩 중...',
    },
    home: {
      hero: {
        badge: '현대 브랜드를 위한 예측 가능한 소싱',
        title: '추측하지 마세요.',
        titleHighlight: '자신 있게 소싱을 시작하세요.',
        subtitle: 'AI 소싱 인텔리전스와 자체 패킹 인프라를 결합하여 FBA 판매자와 소매업체가 완전한 명확성과 통제력을 가지고 수입할 수 있도록 돕습니다.',
        subtitleHighlight1: 'AI 소싱 인텔리전스',
        subtitleHighlight2: '자체 패킹 인프라',
        subtitleHighlight3: '완전한 명확성과 통제력',
        cta: '무료 분석 시작하기',
        ctaSecondary: '작동 방식 보기',
      },
      benefits: {
        title: '수입업체가 NexSupply와 협력하는 이유',
        pillars: [
          {
            title: '약속하기 전에 더 나은 정보',
            items: [
              {
                title: '자체 품질 관리 허브',
                body: '우리는 단순히 파트너를 \'선별\'하는 것이 아닙니다. 자체 패킹 허브를 운영하여 배송 전 0% 불량률을 보장합니다.',
              },
              {
                title: '더 작은 첫 테스트',
                body: '큰 주문을 약속하기 전에 작은 DDP 런으로 시장을 테스트하세요.',
              },
            ],
          },
          {
            title: '팀을 위한 더 적은 마찰',
            items: [
              {
                title: '24/7 비동기 무역 데스크',
                body: '소프트웨어 속도로 움직이는 전문가 가이드. 시간당 청구 없이 답변만 제공합니다.',
              },
              {
                title: '프로젝트를 위한 하나의 받은 편지함',
                body: '견적, 규정 준수 문서 및 배송 업데이트를 한 곳에 보관하세요.',
              },
            ],
          },
          {
            title: '더 깔끔한 단위 경제',
            items: [
              {
                title: '추측이 아닌 랜딩 비용 명확성',
                body: '약속하기 전에 관세, 운송료 및 기타 추가 비용을 한 번의 견적에서 확인하세요.',
              },
              {
                title: '유연한, 규모에 따라 지불',
                body: '단일 SKU 파일럿으로 시작하여 컨테이너로 확장하세요. 우리의 가격은 귀하의 규모에 맞춰 조정됩니다.',
              },
            ],
          },
        ],
      },
      useCases: {
        title: 'NexSupply로 시작하는 일반적인 방법',
        cards: [
          {
            title: '새로운 FBA 브랜드 출시',
            body: '첫 번째 자체 브랜드 제품을 출시하기 전에 <strong>마진을 검증</strong>하고 관세 위험을 확인하세요.',
            target: '일반 사용자: CPG 브랜드 및 FBA 집계업체',
          },
          {
            title: '기존 SKU 재소싱',
            body: '현재 공장을 검증된 대안과 랜딩 비용 및 위험 측면에서 비교하세요. 종종 현재 공급업체보다 <strong>70% 저렴</strong>합니다.',
            target: '일반 사용자: 마진을 최적화하는 기존 판매자',
          },
          {
            title: '더 높은 위험 카테고리 테스트',
            body: '새 카테고리로 수입하기 전에 AD 또는 CVD 및 <strong>규정 준수 확인</strong>을 받으세요.',
            target: '일반 사용자: 규제 카테고리에 진입하는 브랜드',
          },
        ],
      },
      cta: {
        title: '다음 수입을 테스트할 준비가 되셨나요?',
        description: '하나의 제품으로 시작하세요. 일반적으로 하루 이내에 전체 랜딩 비용 및 위험 검토를 실행합니다.',
        buttonLabel: '내 수익 계산하기',
      },
      socialProof: {
        title: '수입업체가 NexSupply에 대해 말하는 것',
        rating: {
          value: '4.8 / 5',
          label: '검증된 소싱 프로젝트에서',
          badge: '검증된 소싱 프로젝트',
        },
        summary: '더 빠른 랜딩 비용 명확성, 세관에서 더 적은 놀라움.',
        quotes: [
          {
            quote: '드디어 돈을 송금하기 전에 랜딩 비용을 볼 수 있습니다.',
            author: 'FBA 판매자, CPG 카테고리',
          },
          {
            quote: '규정 준수 확인이 매우 비싼 실수를 방지했습니다.',
            author: '소매 구매자, 하드라인',
          },
          {
            quote: '우리는 NexSupply를 사용하여 새로운 스낵 제품을 테스트했습니다. 프로세스가 간단하고 빠릅니다.',
            author: '브랜드 매니저, 식음료',
          },
        ],
        verifiedShipment: '검증된 배송',
      },
      reviews: {
        eyebrow: '추천 리뷰 표시',
        title: '수입업체가 NexSupply에 대해 말하는 것',
        ratingLabel: '내부 파일럿 사용자를 기반으로 한 평균 4.6점 평가',
      },
      team: {
        eyebrow: 'NexSupply 배경',
        title: '2세대 무역업자 및 FBA 베테랑이 구축',
        body: 'NexSupply는 실제로 아시아와 미국 사이에서 컨테이너를 운영한 소싱 에이전트, 물류 관리자 및 규정 준수 전문가가 구축했습니다. 우리는 단순히 랜딩 비용을 견적하는 것이 아닙니다 — 우리는 공장, 트럭 및 세관 서류를 직접 처리했습니다.',
      },
    },
    pricing: {
      hero: {
        title: '간단한 가격, 숨겨진 비용 없음',
        subtitle: '즉각적인 AI 분석부터 문앞 배송까지. 추측 없이 소싱을 확장하세요.',
      },
      tiers: {
        starter: {
          tag: '무료 도구',
          title: '시장 인텔리전스',
          price: '무료',
          pricePeriod: ' / 영구',
          features: [
            '즉각적인 랜딩 비용 시뮬레이션',
            '규제 위험 확인 (FDA/CPSIA)',
            '월 30개의 AI 보고서',
            '신용카드 불필요',
          ],
          cta: '무료 분석 시작하기',
        },
        validator: {
          tag: '한 박스로 시작',
          title: '검증된 소싱 플랜',
          price: '$49',
          pricePeriod: ' / 환불 가능한 예치금',
          features: [
            '실제 공장 견적 (48시간)',
            '샘플 통합',
            '주문 시 100% 크레딧',
            '전담 소싱 전문가 배정',
            '공급업체 배경 조사',
          ],
          cta: '리스크 없는 프로젝트 시작하기',
        },
        executor: {
          tag: '엔드투엔드 솔루션',
          title: '엔드투엔드 실행',
          price: '고정 5%',
          pricePeriod: ' 서비스 수수료',
          features: [
            '생산 관리 및 QC',
            '라벨링 및 패키징 (키팅)',
            'DDP 물류 조정',
            'Net-30 결제 조건 (자격 있는 경우)',
          ],
          cta: '영업팀에 문의',
        },
      },
      howItWorks: {
        title: '가격 작동 방식',
        steps: [
          {
            title: '예치금 납입',
            description: '$49 완전 환불 가능한 예치금으로 진지함을 확인하세요. 이것이 전담 팀을 활성화합니다.',
          },
          {
            title: '견적 수신',
            description: '검증된 제조업체와 직접 협상하여 최고의 FOB 가격 및 MOQ를 확보합니다.',
          },
          {
            title: '100% 크레딧 반환',
            description: '생산 주문을 하면 $49가 인보이스에서 완전히 공제됩니다. 손실이 없습니다.',
          },
        ],
      },
      guarantee: {
        title: '응답 보장',
        description: '24 영업일 이내에 응답을 보장합니다. 더 이상 공장이 사라지지 않습니다.',
      },
      globalSync: {
        title: '글로벌 동기화',
        description: '우리 현지 팀은 시간대 차이를 연결하여 수면 중에도 커뮤니케이션이 흐르도록 보장합니다.',
      },
      disclaimer: '서비스 수수료는 FOB 가치를 기반으로 합니다. AI 추정치는 참고용입니다. 최종 가격은 예치금 결제 시 확인됩니다.',
      mostPopular: '가장 인기',
      sslSecure: 'SSL 보안 결제',
    },
    dashboard: {
      greeting: '다시 오신 것을 환영합니다.',
      greetingWithName: '{name}님, 다시 오신 것을 환영합니다.',
      subtitle: '소싱 견적을 관리하고 배송을 추적하세요.',
      newAnalysisRequest: '+ 새 분석 요청',
      newAnalysisRequestShort: '+ 새로 만들기',
      tabs: {
        overview: '개요',
        sourcingEstimates: '소싱 견적',
        activeOrders: '진행 중인 주문',
      },
      stats: {
        actionRequired: '조치 필요',
        inTransit: '배송 중',
        activeOrders: '진행 중인 주문',
      },
      overview: {
        recentActivity: '최근 활동',
        noRecentActivity: '최근 활동이 없습니다',
        noRecentActivityDesc: '첫 번째 소싱 요청을 만들어 활동을 확인하세요.',
        createFirstRequest: '첫 요청 만들기',
        quickActions: '빠른 작업',
        settings: '설정',
        allEstimates: '모든 견적',
      },
      estimates: {
        noEstimates: '아직 견적이 없습니다',
        noEstimatesDesc: '첫 번째 제품을 분석하여 여기에 견적을 확인하세요.',
        createFirstRequest: '첫 요청 만들기',
        productInfo: '제품 정보',
        date: '날짜',
        estUnitCost: '예상 단위 비용',
        status: '상태',
        action: '작업',
        connectAgent: '에이전트 연결',
        connect: '연결',
        connecting: '연결 중...',
        awaitingAgent: '에이전트 대기 중...',
        awaiting: '대기 중...',
        viewReport: '보고서 보기',
        view: '보기',
      },
      orders: {
        noOrders: '아직 진행 중인 주문이 없습니다',
        noOrdersDesc: '견적에서 에이전트를 요청하여 진행 중인 주문을 확인하세요.',
        viewEstimates: '견적 보기',
        messageAgent: '에이전트에게 메시지',
        agentReviewing: '에이전트가 요청을 검토 중입니다',
        managerWillBeAssigned: '⏰ 24시간 이내에 매니저가 배정됩니다',
        startChattingWithAgent: '에이전트와 대화를 시작하여 요구사항을 논의하세요',
        viewQuoteApprove: '견적 보기 및 승인',
        unlockQuote: '견적 잠금 해제 - $49',
        new: '새로',
      },
      payment: {
        connectWithAgent: '전담 에이전트와 연결',
        connectAgentDesc: '공식 견적을 받고 공급업체와 협상하세요.',
        sourcingRetainer: '$49 소싱 유지비',
        oneTimeFee: '일회성 소싱 시작 수수료',
        creditedUponOrder: '주문 시 크레딧',
        creditedUponOrderDesc: '이 수수료는 협상을 위한 에이전트의 노동력을 포함하며 환불 불가입니다. 그러나 주문을 진행하면 최종 5% 서비스 수수료에서 완전히 공제됩니다.',
        dedicatedAgent: '전담 에이전트 배정',
        dedicatedAgentDesc: '프로젝트에 배정된 개인 소싱 전문가',
        factoryVerification: '공장 검증 및 가격 협상',
        factoryVerificationDesc: '신뢰할 수 있는 공장을 찾아 검증한 후 최고의 가격을 협상합니다',
        officialQuote: '공식 견적서(PI) 발행',
        officialQuoteDesc: '검증된 제조업체로부터 정식 Proforma Invoice 수신',
        ndaAgreement: 'NexSupply 표준 비밀유지협정(NDA)에 동의합니다',
        ndaAgreementDesc: '진행하면 모든 프로젝트 정보가 비밀로 유지되고 표준 NDA 조건에 따라 보호됨을 인정합니다.',
        viewNDATerms: 'NDA 조건 보기',
        nonRefundableNotice: '공식 견적서가 전달되면 소싱 수수료는 환불되지 않습니다.',
        proceedToPayment: '결제 진행',
        processing: '처리 중...',
        cancel: '취소',
        paymentSuccessful: '결제 완료!',
        paymentSuccessfulDesc: '곧 에이전트가 배정됩니다.',
      },
    },
    account: {
      title: '계정 설정',
      subtitle: '프로필, 회사 정보 및 배송 설정을 관리하세요.',
      tabs: {
        myProfile: '내 프로필',
        companyDetails: '회사 정보',
        warehouseDestination: '창고 / 배송지',
      },
      profile: {
        changePhoto: '사진 변경',
        photoHint: 'JPG, PNG 또는 GIF. 최대 2MB',
        fullName: '성명',
        jobTitle: '직책',
        jobTitlePlaceholder: '예: CEO, 구매 관리자',
        email: '이메일',
        emailCannotChange: '이메일은 변경할 수 없습니다. 업데이트가 필요하면 지원팀에 문의하세요.',
        phoneNumber: '전화번호',
        phonePlaceholder: '+82 10-1234-5678',
        updatePassword: '비밀번호 변경',
        currentPassword: '현재 비밀번호',
        newPassword: '새 비밀번호',
        confirmPassword: '새 비밀번호 확인',
        updating: '업데이트 중...',
        saveChanges: '변경 사항 저장',
        saving: '저장 중...',
        profileSaved: '프로필이 성공적으로 저장되었습니다.',
        loginRequired: '로그인이 필요합니다.',
        saveFailed: '프로필 저장에 실패했습니다. 다시 시도해주세요.',
        saveError: '프로필 저장 중 오류가 발생했습니다.',
      },
      company: {
        companyName: '회사명',
        companyNamePlaceholder: 'Acme Corporation',
        taxId: '세금 ID / EIN',
        taxIdOptional: '(선택사항)',
        taxIdPlaceholder: '예: EIN, VAT 번호 또는 사업자 등록 번호',
        taxIdHint: '인보이스 및 세금 문서에 필요합니다',
        storefrontUrl: '상점 / 판매 채널 URL',
        storefrontUrlPlaceholder: 'https://www.amazon.com/shops/yourstore 또는 https://yourstore.com',
        storefrontUrlHint: 'Amazon 상점, Shopify 상점 또는 기타 판매 채널',
        expectedVolume: '예상 수입 물량',
        selectVolume: '물량 선택...',
        volumeLcl: '컨테이너 1개 미만 (LCL / 항공 운송)',
        volumeSmall: '연간 1-5개 컨테이너',
        volumeMedium: '연간 6-20개 컨테이너',
        volumeLarge: '연간 21-50개 컨테이너',
        volumeEnterprise: '연간 50개 이상 컨테이너',
      },
      shipping: {
        fbaWarehouse: 'Amazon FBA 창고입니다',
        fbaWarehouseDesc: 'Amazon 이행 센터로 직접 배송하는 경우 체크하세요',
        fbaLabelingRequired: '⚠️ Amazon FBA 라벨링 필요',
        fbaLabelingDesc: '적절한 라벨링을 위해 FBA 배송 ID를 준비하세요',
        fbaShipmentId: 'FBA 배송 ID / 참조 코드',
        fbaShipmentIdPlaceholder: '예: FBA123456789 또는 배송 참조',
        fbaShipmentIdHint: '선택사항: 라벨링을 위한 Amazon 배송 참조',
        storeName: '상점명 (라벨링용)',
        storeNamePlaceholder: '예: 내 Amazon 상점',
        storeNameHint: '선택사항: FBA 배송 라벨링용 상점명',
        country: '국가 / 지역',
        address: '주소',
        addressPlaceholder: '메인 스트리트 123',
        aptSuite: '아파트 / 스위트',
        aptSuitePlaceholder: '스위트 100',
        city: '도시',
        cityPlaceholder: '서울',
        state: '주/도',
        selectState: '주/도 선택',
        zipCode: '우편번호',
        zipCodePlaceholder: '12345',
      },
    },
    support: {
      title: '문의하기',
      subtitle: '문의 유형에 맞는 채널을 선택하세요.',
      critical: {
        title: '긴급 물류 에스컬레이션',
        description: '세관 보류 또는 배송 비상 상황용. 이 받은 편지함은 우리 고급 물류 팀이 모니터링합니다.',
        avgResponse: '평균 응답: 2시간 이내',
        email: 'urgent@nexsupply.net',
      },
      agent: {
        title: '소싱 에이전트와 대화',
        description: '진행 중인 견적 또는 샘플에 대한 업데이트가 필요하신가요? 가장 빠른 방법은 대시보드를 통해 에이전트에게 직접 메시지를 보내는 것입니다.',
        button: '에이전트 채팅 열기',
      },
      operations: {
        title: '무역 운영 데스크',
        description: '청구, 플랫폼 사용 및 계정 관리용.',
        hours: '운영 시간: 오전 9시 - 오후 6시 EST, 월-금.',
        asyncSupport: '아시아 영업 시간 동안 비동기 지원 제공.',
        email: 'support@nexsupply.net',
      },
      business: {
        title: '비즈니스 및 언론',
        description: '공장 파트너십 또는 미디어 문의용.',
        email: 'partners@nexsupply.net',
      },
      chat: {
        needHelp: '도움이 필요하신가요?',
        chatSupport: '채팅 지원',
        startConversation: '지원 팀과 대화를 시작하세요.',
        emailSupport: '이메일 지원',
      },
    },
  },
};

