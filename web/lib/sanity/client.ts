import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';

// Sanity client configuration
export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm4g1dr67',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN, // Optional: for write operations
};

export const sanityClient = createClient(sanityConfig);

// Image URL builder
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  if (!source) {
    return {
      width: () => ({ height: () => ({ url: () => '' }) }),
      height: () => ({ width: () => ({ url: () => '' }) }),
      url: () => '',
    };
  }
  return builder.image(source);
}

// Type definitions
export interface SiteSettings {
  brandName?: string;
  mainNav?: Array<{ label: string; href: string }>;
  footerIntro?: string;
  footerColumns?: Array<{
    title?: string;
    links?: Array<{ label: string; href: string }>;
  }>;
  contactEmail?: string;
  disclaimer?: string;
}

export interface HomePage {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaLabel?: string;
  heroBadge?: string;
  heroImage?: any; // Sanity image type
  highlights?: Array<{
    title?: string;
    body?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }>;
  reviewsTitle?: string;
  reviews?: Array<{
    headline?: string;
    quote?: string;
    author?: string;
    date?: string;
    rating?: number;
  }>;
  ratingText?: string;
  benefitsTitle?: string;
  benefits?: Array<{
    title?: string;
    body?: string;
  }>;
  trustedTitle?: string;
  trustedLogos?: Array<{
    label?: string;
    logo?: any;
    textOnly?: boolean;
  }>;
  impactTitle?: string;
  impactBody?: string;
  impactStatLabel?: string;
  impactStatBody?: string;
  impactCtaLabel?: string;
  impactCtaUrl?: string;
  categoriesTitle?: string;
  categories?: string[];
  faqTeaserTitle?: string;
  faqTeaserBody?: string;
  faqItems?: Array<{
    question?: string;
    answer?: string;
  }>;
  expertPanel?: {
    title?: string;
    subtitle?: string;
    experts?: Array<{
      name: string;
      role: string;
      bio: string;
      organizations?: string[];
      photo?: any;
    }>;
  };
}

export interface HowItWorksPage {
  title?: string;
  subtitle?: string;
  steps?: Array<{
    stepNumber?: string;
    title?: string;
    body?: string;
    bullets?: string[];
  }>;
  ctaTitle?: string;
  ctaLines?: string[];
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
}

export interface UseCasesPage {
  title?: string;
  subtitle?: string;
  useCases?: Array<{
    label?: string;
    description?: string;
    keyFeaturesTitle?: string;
    keyFeatures?: string[];
  }>;
  ctaTitle?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
}

// Helper function to add timeout to fetch operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// Helper functions
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    if (!sanityConfig.projectId) {
      return null;
    }
    const query = `*[_type == "siteSettings"][0]`;
    const data = await withTimeout(
      sanityClient.fetch<SiteSettings>(query),
      5000 // 5 second timeout
    );
    return data || null;
  } catch (error) {
    console.error('[Sanity] Failed to fetch site settings:', error);
    return null;
  }
}

export async function getHomePage(): Promise<HomePage | null> {
  try {
    if (!sanityConfig.projectId) {
      return null;
    }
    const query = `*[_type == "homePage"][0]{
      ...,
      expertPanel{
        title,
        subtitle,
        experts[] | order(priority desc){
          name,
          role,
          bio,
          organizations,
          photo
        }
      }
    }`;
    const data = await withTimeout(
      sanityClient.fetch<HomePage>(query),
      5000 // 5 second timeout
    );
    return data || null;
  } catch (error) {
    console.error('[Sanity] Failed to fetch home page:', error);
    return null;
  }
}

export async function getHowItWorksPage(): Promise<HowItWorksPage | null> {
  try {
    if (!sanityConfig.projectId) {
      return null;
    }
    const query = `*[_type == "howItWorksPage"][0]`;
    const data = await withTimeout(
      sanityClient.fetch<HowItWorksPage>(query),
      5000 // 5 second timeout
    );
    return data || null;
  } catch (error) {
    console.error('[Sanity] Failed to fetch how it works page:', error);
    return null;
  }
}

export async function getUseCasesPage(): Promise<UseCasesPage | null> {
  try {
    if (!sanityConfig.projectId) {
      return null;
    }
    const query = `*[_type == "useCasesPage"][0]`;
    const data = await withTimeout(
      sanityClient.fetch<UseCasesPage>(query),
      5000 // 5 second timeout
    );
    return data || null;
  } catch (error) {
    console.error('[Sanity] Failed to fetch use cases page:', error);
    return null;
  }
}
