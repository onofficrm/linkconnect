import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import Empathy from '../components/Empathy';
import Eligibility from '../components/Eligibility';
import Process from '../components/Process';
import Trust from '../components/Trust';
import PhoneSection from '../components/PhoneSection';
import ConsultationForm from '../components/ConsultationForm';
import AICalculator from '../components/AICalculator';

export default function ConsultationPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#consult-form') {
      setTimeout(() => {
        document.getElementById("consult-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [location.hash]);

  return (
    <>
      <Hero />
      <Empathy />
      <Eligibility />
      <AICalculator />
      <Process />
      <Trust />
      <PhoneSection />
      <ConsultationForm />
    </>
  );
}
