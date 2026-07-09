import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingCTA from './components/FloatingCTA';
import { PartnerProvider, usePartnerContext } from './context/PartnerContext';
import { ConsultationDraftProvider } from './context/ConsultationDraftContext';
import { applyPhoneVisibility } from './lib/partnerData';
import { isCampaignTraffic } from './lib/heroCopy';

export default function Layout() {
  return (
    <PartnerProvider>
      <ConsultationDraftProvider>
        <LayoutInner />
      </ConsultationDraftProvider>
    </PartnerProvider>
  );
}

function LayoutInner() {
  const location = useLocation();
  const { data } = usePartnerContext();

  useEffect(() => {
    applyPhoneVisibility(data.partner_phone);
  }, [location.pathname, location.search, location.hash, data.partner_phone]);

  if (location.pathname === '/' && isCampaignTraffic()) {
    return <Navigate to="/consultation" replace />;
  }

  return (
    <div id="banktupt-merchant-page" className="merchant-banktupt-page no-partner-phone">
      <div className="font-sans min-h-screen bg-bg text-gray-900 flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <FloatingCTA />
      </div>
    </div>
  );
}
