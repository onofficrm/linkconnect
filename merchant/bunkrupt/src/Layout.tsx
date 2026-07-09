import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomCTA from './components/BottomCTA';
import { PartnerProvider, usePartnerContext } from './context/PartnerContext';
import { applyPhoneVisibility } from './lib/partnerData';

export default function Layout() {
  return (
    <PartnerProvider>
      <LayoutInner />
    </PartnerProvider>
  );
}

function LayoutInner() {
  const location = useLocation();
  const { data } = usePartnerContext();

  useEffect(() => {
    applyPhoneVisibility(data.partner_phone);
  }, [location.pathname, location.search, location.hash, data.partner_phone]);

  return (
    <div id="banktupt-merchant-page" className="merchant-banktupt-page no-partner-phone">
      <div className="font-sans min-h-screen bg-bg text-gray-900 flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <BottomCTA />
      </div>
    </div>
  );
}
