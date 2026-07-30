"use client";

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

const EMPTY_DATA: PartnerData = {
  partner_id: '',
  campaign_id: '',
  merchant_id: 'modemo',
  landing_id: 'modemo',
  affiliate_id: '',
  sub_id: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  merchant_name: '모두의철거',
  tracking_phone: '',
  tracking_phone_display: '',
  business_number: '',
  representative_name: '',
  business_address: '',
  privacy_policy_url: '/privacy',
  lead_submit_url: '/plugin/linkconnect/api/receive.php',
  partner_phone: '',
  partner_phone_display: '',
  lkCode: '',
};

interface PartnerContextValue {
  data: PartnerData;
  hasPhone: boolean;
  ready: boolean;
}

const PartnerContext = createContext<PartnerContextValue>({
  data: EMPTY_DATA,
  hasPhone: false,
  ready: false,
});

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PartnerData>(EMPTY_DATA);
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
      document.title = `모두의철거 | 상가·주택 철거 비교견적`;
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
