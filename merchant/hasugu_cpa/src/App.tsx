/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Symptoms from './components/Symptoms';
import DeferredMount from './components/DeferredMount';
import StickyCallButton from './components/StickyCallButton';
import Footer from './components/Footer';
import { PartnerProvider } from './context/PartnerContext';

const Services = lazy(() => import('./components/Services'));
const TrustChecklist = lazy(() => import('./components/TrustChecklist'));
const Equipment = lazy(() => import('./components/Equipment'));
const BeforeAfter = lazy(() => import('./components/BeforeAfter'));
const Process = lazy(() => import('./components/Process'));
const SiteTypes = lazy(() => import('./components/SiteTypes'));
const CommonPipeGuide = lazy(() => import('./components/CommonPipeGuide'));
const ExpertiseBanner = lazy(() => import('./components/ExpertiseBanner'));
const WorkCases = lazy(() => import('./components/WorkCases'));
const Reviews = lazy(() => import('./components/Reviews'));
const Pricing = lazy(() => import('./components/Pricing'));
const ServiceAreas = lazy(() => import('./components/ServiceAreas'));
const Faq = lazy(() => import('./components/Faq'));
const FormSection = lazy(() => import('./components/FormSection'));
const FinalCTA = lazy(() => import('./components/FinalCTA'));

function LazyBlock({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export default function App() {
  return (
    <PartnerProvider>
      <div
        id="hasugu-cpa-merchant-page"
        className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden no-partner-phone"
      >
        <Header />
        <main>
          <Hero />
          <Symptoms />

          <DeferredMount minHeight={200}>
            <LazyBlock>
              <Services />
              <TrustChecklist />
              <Equipment />
            </LazyBlock>
          </DeferredMount>

          <DeferredMount minHeight={220}>
            <LazyBlock>
              <BeforeAfter />
              <Process />
              <SiteTypes />
              <CommonPipeGuide />
              <ExpertiseBanner />
            </LazyBlock>
          </DeferredMount>

          <DeferredMount minHeight={240}>
            <LazyBlock>
              <WorkCases />
              <Reviews />
              <Pricing />
              <ServiceAreas />
              <Faq />
            </LazyBlock>
          </DeferredMount>

          <DeferredMount minHeight={280} idleFallbackMs={400}>
            <LazyBlock>
              <FormSection />
              <FinalCTA />
            </LazyBlock>
          </DeferredMount>
        </main>
        <Footer />
        <StickyCallButton />
      </div>
    </PartnerProvider>
  );
}
