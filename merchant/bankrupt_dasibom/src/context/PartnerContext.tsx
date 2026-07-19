import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  applyPhoneVisibility,
  fetchLandingContext,
  getPartnerData,
  hasPartnerPhone,
  persistTrackingParams,
  type PartnerData,
} from '../lib/partnerData';
import { resolveLkCode } from '../lib/linkconnect';

interface PartnerContextValue {
  data: PartnerData;
  hasPhone: boolean;
  ready: boolean;
}

const PartnerContext = createContext<PartnerContextValue>({
  data: getPartnerData(),
  hasPhone: false,
  ready: false,
});

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PartnerData>(() => getPartnerData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function init() {
      persistTrackingParams();
      resolveLkCode();

      let next = getPartnerData();
      if (!hasPartnerPhone(next)) {
        await fetchLandingContext();
        next = getPartnerData();
      }

      if (!active) return;
      setData(next);
      applyPhoneVisibility(next.partner_phone);
      setReady(true);
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      data,
      hasPhone: hasPartnerPhone(data),
      ready,
    }),
    [data, ready],
  );

  return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>;
}

export function usePartnerContext(): PartnerContextValue {
  return useContext(PartnerContext);
}
