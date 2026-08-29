import common from "@/components/home/home.module.css";
import HeroSection from "@/components/home/HeroSection";
import EvidenceStrip from "@/components/home/EvidenceStrip";
import DeferredLandingSections from "@/components/home/DeferredLandingSections";
import { Metadata } from "next";

const SITE_TITLE = "철거 업체";
const SITE_DESCRIPTION =
  "철거 업체 모두의철거에서 상가, 사무실, 주택, 공장 등 다양한 공간의 철거 서비스를 알아보세요. 현장 상황에 맞춰 철거 범위와 작업 방법을 확인하고, 원상복구 및 폐기물 처리까지 편리하게 진행할 수 있습니다. 전문 철거업체를 통해 안전하고 체계적인 철거 작업을 상담받아보세요.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
    description: SITE_DESCRIPTION,
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
      <DeferredLandingSections />
    </div>
  );
}
