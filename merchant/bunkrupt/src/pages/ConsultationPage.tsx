import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import TrustBadges from '../components/TrustBadges';
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
      <Hero />
      <TrustBadges />
      <Empathy />
      <BeforeAfter />
      <Eligibility />
      <AICalculator />
      <SocialProof />
      <Process />
      <Trust />
      <ConsultationFAQ />
      <ConsultationForm />
      <PhoneSection />
    </>
  );
}
