// Home layout overview:
// 1) Hero
// 2) Use cases
// 3) Social proof strip
// 4) Benefits grid
// 5) Impact band
// 6) Footer (handled in layout)

import { getHomePage, getSiteSettings } from '@/lib/sanity/client';
import HomeHero from './components/HomeHero';
import HomeUseCases from './components/HomeUseCases';
import HomeSocialProofStrip from './components/HomeSocialProofStrip';
import HomeBenefitsGrid from './components/HomeBenefitsGrid';
import HomeImpactBand from './components/HomeImpactBand';
import ExpertPanelSection from '@/components/marketing/ExpertPanelSection';
import { ReviewsSection } from '@/components/marketing/home/ReviewsSection';
import { ProTeamSection } from '@/components/marketing/home/ProTeamSection';
import { homePageConfig } from '@/lib/content/homePage';

export const revalidate = 60;

export default async function HomePage() {
  const [site, page] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
  ]);

  return (
    <div className="bg-white">
      <HomeHero page={page} />
      <HomeUseCases />
      <HomeSocialProofStrip />
      <HomeBenefitsGrid />
      <ReviewsSection section={homePageConfig.reviewsSection} />
      <ProTeamSection section={homePageConfig.teamSection} />
      <ExpertPanelSection panel={page?.expertPanel} />
      <HomeImpactBand />
    </div>
  );
}