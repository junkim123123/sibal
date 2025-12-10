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
    },
  },
};

