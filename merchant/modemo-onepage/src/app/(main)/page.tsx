import common from "@/components/home/home.module.css";
import HeroSection from "@/components/home/HeroSection";
import EvidenceStrip from "@/components/home/EvidenceStrip";
import StatsSection from "@/components/home/StatsSection";
import CustomerLogosSection from "@/components/home/CustomerLogosSection";
import DeferredLandingSections from "@/components/home/DeferredLandingSections";
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
      <EvidenceStrip />
      <StatsSection />
      <CustomerLogosSection />
      <DeferredLandingSections />
    </div>
  );
}
