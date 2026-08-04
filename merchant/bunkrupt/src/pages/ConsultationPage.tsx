import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import TrustBadges from '../components/TrustBadges';
import UrgencyRouter from '../components/UrgencyRouter';
import DeferredMount from '../components/DeferredMount';
import Empathy from '../components/Empathy';
import BeforeAfter from '../components/BeforeAfter';
import Eligibility from '../components/Eligibility';
import AICalculator from '../components/AICalculator';
import SocialProof from '../components/SocialProof';
import Process from '../components/Process';
import Trust from '../components/Trust';
import ConsultationFAQ from '../components/ConsultationFAQ';
import PhoneSection from '../components/PhoneSection';
import ConsultationForm from '../components/ConsultationForm';

export default function ConsultationPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#consult-form') {
      setTimeout(() => {
        document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <>
      {/* 첫 뷰포트: 히어로·신뢰·긴급 분기만 즉시 */}
      <Hero />
      <TrustBadges />
      <UrgencyRouter />

      {/* 하단 섹션은 뷰포트 근접/idle 후 마운트 */}
      <DeferredMount minHeight={160}>
        <Empathy />
        <BeforeAfter />
        <Eligibility />
      </DeferredMount>

      <DeferredMount minHeight={200}>
        <AICalculator />
        <SocialProof />
        <Process />
        <Trust />
        <ConsultationFAQ />
      </DeferredMount>

      <DeferredMount minHeight={240} idleFallbackMs={400}>
        <ConsultationForm />
        <PhoneSection />
      </DeferredMount>
    </>
  );
}
