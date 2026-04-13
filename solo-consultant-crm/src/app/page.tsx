import type { Metadata } from 'next';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { Hero } from '@/components/marketing/hero';
import { ServicesGrid } from '@/components/marketing/services-grid';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { PricingTiers } from '@/components/marketing/pricing-tiers';
import { Testimonials } from '@/components/marketing/testimonials';
import { CtaSection } from '@/components/marketing/cta-section';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata: Metadata = {
  title: 'AI Dev Squad — Websites, Apps, CRMs & ERPs Built by AI in Days',
  description: 'Your AI development team, on demand. White-glove consulting with a 7-phase delivery process. Get a free quote today.',
  openGraph: {
    title: 'AI Dev Squad — Built by AI in Days',
    description: 'Your AI development team, on demand. White-glove consulting with a 7-phase delivery process.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <main id="main-content">
        <Hero />
        <ServicesGrid />
        <HowItWorks />
        <PricingTiers />
        <Testimonials />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
