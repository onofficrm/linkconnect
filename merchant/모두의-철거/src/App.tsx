import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CoreStrengths } from './components/CoreStrengths';
import { DemolitionTypes } from './components/DemolitionTypes';
import { ProcessSteps } from './components/ProcessSteps';
import { RealCases } from './components/RealCases';
import { CostGuide } from './components/CostGuide';
import { ConsultationForm } from './components/ConsultationForm';
import { Footer } from './components/Footer';
import { FloatingMobileBar } from './components/FloatingMobileBar';
import { PrivacyModal } from './components/PrivacyModal';
import { SuccessModal } from './components/SuccessModal';
import { ErrorToast } from './components/ErrorToast';
import { DemolitionFormData, FormErrorState } from './types';

export default function App() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<DemolitionFormData | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formError, setFormError] = useState<FormErrorState | null>(null);

  const scrollToForm = useCallback(() => {
    const formElement = document.getElementById('consultation-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = document.getElementById('form-name-input');
        if (input) input.focus();
      }, 400);
    }
  }, []);

  const handleSubmitSuccess = (data: DemolitionFormData) => {
    setFormError(null);
    setSubmittedData(data);
    setIsSuccessModalOpen(true);
    try {
      sessionStorage.setItem('modemo_lead_submitted', '1');
    } catch {
      /* ignore */
    }
  };

  const handleSubmitError = (error: FormErrorState) => {
    setFormError(error);
  };

  return (
    <div className="modu-demolition-landing min-h-screen flex flex-col bg-slate-950 text-slate-900 font-sans pb-16 sm:pb-0">
      <Header onScrollToForm={scrollToForm} />

      <main className="flex-1">
        <Hero
          onSubmitSuccess={handleSubmitSuccess}
          onSubmitError={handleSubmitError}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          onScrollToForm={scrollToForm}
        />
        <CoreStrengths />
        <DemolitionTypes onScrollToForm={scrollToForm} />
        <ProcessSteps />
        <RealCases onScrollToForm={scrollToForm} />
        <CostGuide />
        <ConsultationForm
          onSubmitSuccess={handleSubmitSuccess}
          onSubmitError={handleSubmitError}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        />
      </main>

      <Footer onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />
      <FloatingMobileBar onScrollToForm={scrollToForm} />

      <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        data={submittedData}
      />
      <ErrorToast error={formError} onClose={() => setFormError(null)} />
    </div>
  );
}
