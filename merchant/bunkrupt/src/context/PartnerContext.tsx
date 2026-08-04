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

      // page.php 가 이미 LC_LANDING_CONTEXT 를 주입하면 추가 API 호출 생략
      const injected = window.LC_LANDING_CONTEXT;
      const serverInjected = typeof injected?.has_partner_phone === 'boolean';

      let next = getPartnerData();
      if (!serverInjected) {
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
