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
  deepDive: DeepDiveSection;
  faq: FAQSection;
}