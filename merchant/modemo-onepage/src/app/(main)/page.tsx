import common from "@/components/home/home.module.css";
import HeroSection from "@/components/home/HeroSection";
import WorrySection from "@/components/home/WorrySection";
import MarketDiagnosisSection from "@/components/home/MarketDiagnosisSection";
import SystemSection from "@/components/home/SystemSection";
import ProcessSection from "@/components/home/ProcessSection";
import VerifiedSection from "@/components/home/VerifiedSection";
import PricingSection from "@/components/home/PricingSection";
import SafetySection from "@/components/home/SafetySection";
import StatsSection from "@/components/home/StatsSection";
import CustomerLogosSection from "@/components/home/CustomerLogosSection";
import RegionPartnerSection from "@/components/home/RegionPartnerSection";
import FooterCtaSection from "@/components/home/FooterCtaSection";
import SimpleQuoteSection from "@/components/home/SimpleQuoteSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "모두의철거",
  description: " 상가·학원·주택 철거와 사무실 원상복구, 폐기물 처리까지. 모두의철거에서 검증된 업체 비교견적을 무료로 받아보세요.",
  openGraph: {
    title: "모두의철거",
    description: " 상가·학원·주택 철거와 사무실 원상복구, 폐기물 처리까지. 모두의철거에서 검증된 업체 비교견적을 무료로 받아보세요.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '모두의철거',
    description: '상가·학원·주택 철거와 사무실 원상복구, 폐기물 처리까지. 모두의철거에서 검증된 업체 비교견적을 무료로 받아보세요.',
    areaServed: 'KR',
  };

  return (
    <div className={common.landing}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <StatsSection />
      <CustomerLogosSection />
      <WorrySection />
      <MarketDiagnosisSection />
      <SystemSection />
      <ProcessSection />
      <VerifiedSection />
      <PricingSection />
      <SafetySection />

      <RegionPartnerSection />

      <SimpleQuoteSection />

      <FooterCtaSection />
    </div>
  );
}
