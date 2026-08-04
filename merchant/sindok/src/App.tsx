import React, { Suspense, lazy, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustGuarantees } from './components/TrustGuarantees';
import { PainPoints } from './components/PainPoints';
import { Advantages } from './components/Advantages';
import { Process } from './components/Process';
import { ServiceDetails } from './components/ServiceDetails';
import { ConsultationForm } from './components/ConsultationForm';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { LiveLeadNotification } from './components/LiveLeadNotification';
import { PrivacyModal } from './components/PrivacyModal';
import DeferredMount from './components/DeferredMount';

const BeforeAfterSlider = lazy(() =>
  import('./components/BeforeAfterSlider').then((m) => ({ default: m.BeforeAfterSlider })),
);
const EstimateCalculator = lazy(() =>
  import('./components/EstimateCalculator').then((m) => ({ default: m.EstimateCalculator })),
);
const WorkGallery = lazy(() =>
  import('./components/WorkGallery').then((m) => ({ default: m.WorkGallery })),
);
const CustomerReviews = lazy(() =>
  import('./components/CustomerReviews').then((m) => ({ default: m.CustomerReviews })),
);
const FaqSection = lazy(() =>
  import('./components/FaqSection').then((m) => ({ default: m.FaqSection })),
);

function SectionFallback() {
  return <div className="h-40 w-full animate-pulse bg-slate-100" aria-hidden />;
}

export default function App() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <div
      id="sindok-merchant-page"
      className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white pb-16 md:pb-0 relative no-partner-phone"
    >
      <Header />

      <main>
        <Hero />
        <TrustGuarantees />
        <PainPoints />

        <DeferredMount>
          <Suspense fallback={<SectionFallback />}>
            <BeforeAfterSlider />
          </Suspense>
        </DeferredMount>

        <Advantages />

        <DeferredMount>
          <Suspense fallback={<SectionFallback />}>
            <EstimateCalculator />
          </Suspense>
        </DeferredMount>

        <Process />

        <DeferredMount>
          <Suspense fallback={<SectionFallback />}>
            <WorkGallery />
          </Suspense>
        </DeferredMount>

        <ServiceDetails />

        <DeferredMount>
          <Suspense fallback={<SectionFallback />}>
            <CustomerReviews />
          </Suspense>
        </DeferredMount>

        <DeferredMount>
          <Suspense fallback={<SectionFallback />}>
            <FaqSection />
          </Suspense>
        </DeferredMount>

        <ConsultationForm onOpenPrivacyModal={() => setIsPrivacyOpen(true)} />
        <FinalCta />
      </main>

      <Footer onOpenPrivacyModal={() => setIsPrivacyOpen(true)} />
      <MobileStickyBar />
      <LiveLeadNotification />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
