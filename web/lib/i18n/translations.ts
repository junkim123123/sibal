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
      title: string;
      subtitle: string;
      cta: string;
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
        title: 'Stop Guessing. Start Sourcing with Confidence.',
        subtitle: 'AI-powered sourcing platform that helps you find the right suppliers, calculate landed costs, and manage your global supply chain.',
        cta: 'Get Started',
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
        title: '추측하지 마세요. 자신 있게 소싱을 시작하세요.',
        subtitle: '올바른 공급업체를 찾고, 랜딩 비용을 계산하며, 글로벌 공급망을 관리하는 AI 기반 소싱 플랫폼입니다.',
        cta: '시작하기',
      },
    },
  },
};

