import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { LandingHero } from '@/components/marketing/LandingHero';
import {
  TrustedTechSection,
  CoreModulesShowcase,
  WhatsAppAndAIShowcase,
  PricingSection,
  TestimonialsSection,
  FAQSection,
  FinalCTASection,
} from '@/components/marketing/LandingSections';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E9DFC8] text-[#2C241A]">
      <PublicHeader />
      <main className="flex-1">
        <LandingHero />
        <TrustedTechSection />
        <CoreModulesShowcase />
        <WhatsAppAndAIShowcase />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <PublicFooter />
    </div>
  );
}
