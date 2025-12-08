// web/lib/types/resources.ts

export interface CTA {
  id: string;
  label: string;
  href: string;
}

export interface SimpleCard {
  id: string;
  title: string;
  description: string;
  cta?: CTA;
  badge?: string;
  tag?: string;
}

export interface ResourceHeroSection {
  title: string;
  subtitle: string;
}

export interface StartHereSection {
  title: string;
  cards: SimpleCard[];
}

export interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  tag: string;
  image: {
    src: string;
    alt: string;
  };
}

export interface FeaturedProjectsSection {
  title: string;
  subtitle?: string;
  projects: FeaturedProject[];
}

export interface VideoGuide {
  id: string;
  title: string;
  description: string;
  youtubeId?: string; // 특정 비디오 ID (예: "dQw4w9WgXcQ")
  youtubeChannel?: string; // 채널 핸들 (예: "@nexsupply.global") - 비디오 ID가 없을 때 사용
  thumbnail?: string;
}

export interface KnowledgeHubSection {
  title: string;
  subtitle?: string;
  videos: VideoGuide[];
}

export interface DeepDiveSection {
  title: string;
  subtitle?: string;
  cards: SimpleCard[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSection {
  title: string;
  subtitle?: string;
  items: FAQItem[];
}

export interface ResourcePageConfig {
  hero: ResourceHeroSection;
  startHere: StartHereSection;
  featuredProjects: FeaturedProjectsSection;
  knowledgeHub: KnowledgeHubSection;
  faq: FAQSection;
}