"use client";

import { PartnerProvider } from "@/context/PartnerContext";
import StickyCallBar from "@/components/StickyCallBar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PartnerProvider>
      <div id="modemo-merchant-page" className="no-partner-phone">
        {children}
        <StickyCallBar />
      </div>
    </PartnerProvider>
  );
}
