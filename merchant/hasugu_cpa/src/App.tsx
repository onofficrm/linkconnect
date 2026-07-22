/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from './components/Header';
import Hero from './components/Hero';
import Symptoms from './components/Symptoms';
import Services from './components/Services';
import TrustChecklist from './components/TrustChecklist';
import Equipment from './components/Equipment';
import BeforeAfter from './components/BeforeAfter';
import Process from './components/Process';
import SiteTypes from './components/SiteTypes';
import ExpertiseBanner from './components/ExpertiseBanner';
import WorkCases from './components/WorkCases';
import Reviews from './components/Reviews';
import Pricing from './components/Pricing';
import ServiceAreas from './components/ServiceAreas';
import FormSection from './components/FormSection';
import FinalCTA from './components/FinalCTA';
import StickyCallButton from './components/StickyCallButton';
import Footer from './components/Footer';
import { PartnerProvider } from './context/PartnerContext';

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
          <Services />
          <TrustChecklist />
          <Equipment />
          <BeforeAfter />
          <Process />
          <SiteTypes />
          <ExpertiseBanner />
          <WorkCases />
          <Reviews />
          <Pricing />
          <ServiceAreas />
          <FormSection />
          <FinalCTA />
        </main>
        <Footer />
        <StickyCallButton />
      </div>
    </PartnerProvider>
  );
}
