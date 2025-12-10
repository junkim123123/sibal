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
  },
};

