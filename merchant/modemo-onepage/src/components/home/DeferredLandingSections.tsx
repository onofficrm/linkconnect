'use client';

import dynamic from 'next/dynamic';
import DeferredMount from '@/components/DeferredMount';

const WorrySection = dynamic(() => import('@/components/home/WorrySection'));
const MarketDiagnosisSection = dynamic(() => import('@/components/home/MarketDiagnosisSection'));
const SystemSection = dynamic(() => import('@/components/home/SystemSection'));
const ProcessSection = dynamic(() => import('@/components/home/ProcessSection'));
const VerifiedSection = dynamic(() => import('@/components/home/VerifiedSection'));
const PricingSection = dynamic(() => import('@/components/home/PricingSection'));
const SafetySection = dynamic(() => import('@/components/home/SafetySection'));
const RegionPartnerSection = dynamic(() => import('@/components/home/RegionPartnerSection'));
const SimpleQuoteSection = dynamic(() => import('@/components/home/SimpleQuoteSection'));
const FooterCtaSection = dynamic(() => import('@/components/home/FooterCtaSection'));

export default function DeferredLandingSections() {
  return (
    <>
      <DeferredMount minHeight={200}>
        <WorrySection />
        <MarketDiagnosisSection />
        <SystemSection />
      </DeferredMount>

      <DeferredMount minHeight={220}>
        <ProcessSection />
        <VerifiedSection />
        <PricingSection />
        <SafetySection />
      </DeferredMount>

      <DeferredMount minHeight={200}>
        <RegionPartnerSection />
      </DeferredMount>

      <DeferredMount minHeight={280} idleFallbackMs={400}>
        <SimpleQuoteSection />
        <FooterCtaSection />
      </DeferredMount>
    </>
  );
}
