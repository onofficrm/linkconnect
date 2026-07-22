export interface PartnerTracking {
  partner_id: string;
  campaign_id: string;
  merchant_id: string;
  landing_id: string;
  affiliate_id: string;
  sub_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

export interface LandingVars {
  merchant_name: string;
  tracking_phone: string;
  tracking_phone_display: string;
  business_number: string;
  representative_name: string;
  business_address: string;
  privacy_policy_url: string;
  lead_submit_url: string;
  /** 카카오 채널/오픈채팅 URL (없으면 폼 상담으로 유도) */
  kakao_chat_url: string;
}

export interface PartnerData extends PartnerTracking, LandingVars {
  partner_phone: string;
  partner_phone_display: string;
  lkCode: string;
  has_partner_phone?: boolean;
}

declare global {
  interface Window {
    PARTNER_PHONE?: string;
    LC_LANDING_CONTEXT?: Partial<PartnerData>;
  }
}

const TRACK_KEYS = [
  'pid',
  'partner_id',
  'cid',
  'campaign_id',
  'mid',
  'merchant_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'lkCode',
  'code',
  'sub_id',
  'affiliate_id',
  'landing_id',
] as const;

const PAGE_ROOT_ID = 'hasugu-cpa-merchant-page';
const DEFAULT_MERCHANT_ID = 'hasugu_cpa';
const DEFAULT_MERCHANT_NAME = '하수구·배관 전문센터';
const DEFAULT_PRIVACY_URL = '/privacy';
const DEFAULT_LEAD_SUBMIT_URL = '/plugin/linkconnect/api/receive.php';

export function getParam(name: string): string {
  const url = new URL(window.location.href);
  const fromSearch = url.searchParams.get(name);
  if (fromSearch) {
    persistParam(name, fromSearch);
    return fromSearch;
  }

  const hash = window.location.hash;
  if (hash.includes('?')) {
    const hashParams = new URLSearchParams(hash.split('?')[1] || '');
    const fromHash = hashParams.get(name);
    if (fromHash) {
      persistParam(name, fromHash);
      return fromHash;
    }
  }

  return sessionStorage.getItem(`lc_track_${name}`) || '';
}

function persistParam(name: string, value: string): void {
  if (value) {
    sessionStorage.setItem(`lc_track_${name}`, value);
  }
}

export function persistTrackingParams(): void {
  TRACK_KEYS.forEach((key) => {
    const url = new URL(window.location.href);
    const v = url.searchParams.get(key);
    if (v) persistParam(key, v);
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const hp = new URLSearchParams(hash.split('?')[1] || '');
      const hv = hp.get(key);
      if (hv) persistParam(key, hv);
    }
  });
}

function injectedString(key: keyof PartnerData): string {
  const injected = window.LC_LANDING_CONTEXT || {};
  const value = injected[key];
  return typeof value === 'string' ? value : '';
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone.trim();
}

export function phoneTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '#';
}

export function getPartnerData(): PartnerData {
  const phone =
    (window.PARTNER_PHONE || '').trim() ||
    injectedString('partner_phone') ||
    injectedString('tracking_phone');

  return {
    partner_id: getParam('pid') || getParam('partner_id') || injectedString('partner_id'),
    campaign_id: getParam('cid') || getParam('campaign_id') || injectedString('campaign_id'),
    merchant_id:
      getParam('mid') ||
      getParam('merchant_id') ||
      injectedString('merchant_id') ||
      DEFAULT_MERCHANT_ID,
    landing_id: getParam('landing_id') || injectedString('landing_id') || DEFAULT_MERCHANT_ID,
    affiliate_id:
      getParam('affiliate_id') ||
      injectedString('affiliate_id') ||
      getParam('pid') ||
      injectedString('partner_id'),
    sub_id:
      getParam('sub_id') ||
      injectedString('sub_id') ||
      getParam('utm_campaign') ||
      injectedString('utm_campaign'),
    utm_source: getParam('utm_source') || injectedString('utm_source'),
    utm_medium: getParam('utm_medium') || injectedString('utm_medium'),
    utm_campaign: getParam('utm_campaign') || injectedString('utm_campaign'),
    partner_phone: phone,
    partner_phone_display:
      injectedString('partner_phone_display') ||
      injectedString('tracking_phone_display') ||
      formatPhoneDisplay(phone),
    tracking_phone: phone,
    tracking_phone_display:
      injectedString('tracking_phone_display') ||
      injectedString('partner_phone_display') ||
      formatPhoneDisplay(phone),
    merchant_name: injectedString('merchant_name') || DEFAULT_MERCHANT_NAME,
    business_number: injectedString('business_number'),
    representative_name: injectedString('representative_name'),
    business_address: injectedString('business_address'),
    privacy_policy_url: injectedString('privacy_policy_url') || DEFAULT_PRIVACY_URL,
    lead_submit_url: injectedString('lead_submit_url') || DEFAULT_LEAD_SUBMIT_URL,
    kakao_chat_url: injectedString('kakao_chat_url'),
    lkCode: getParam('lkCode') || getParam('code') || injectedString('lkCode'),
    has_partner_phone: Boolean(phone),
  };
}

export function hasPartnerPhone(
  partnerData: Pick<PartnerData, 'partner_phone' | 'tracking_phone'>,
): boolean {
  return Boolean((partnerData.partner_phone || partnerData.tracking_phone || '').trim());
}

export function applyPhoneVisibility(partnerPhone: string): void {
  const root = document.getElementById(PAGE_ROOT_ID);
  if (!root) return;

  const show = hasPartnerPhone({ partner_phone: partnerPhone, tracking_phone: partnerPhone });
  const display = formatPhoneDisplay(partnerPhone);
  const tel = phoneTelHref(partnerPhone);

  root.classList.toggle('has-partner-phone', show);
  root.classList.toggle('no-partner-phone', !show);
  root.classList.add('phone-context-ready');

  root.querySelectorAll<HTMLElement>('.phone-only').forEach((el) => {
    el.style.display = show ? '' : 'none';
    el.setAttribute('aria-hidden', show ? 'false' : 'true');
  });

  root.querySelectorAll<HTMLElement>('.partner-phone-text').forEach((el) => {
    if (!show) return;
    el.textContent = display || el.textContent;
  });

  root.querySelectorAll<HTMLAnchorElement>('a.linkconnect-call-button').forEach((el) => {
    if (show && tel !== '#') {
      el.href = tel;
      el.dataset.phone = partnerPhone;
    } else {
      el.removeAttribute('href');
      el.dataset.phone = '';
    }
  });
}

export async function fetchLandingContext(): Promise<Partial<PartnerData>> {
  const params = new URLSearchParams();
  const lk = getParam('lkCode') || getParam('code');
  if (lk) params.set('lkCode', lk);
  const pid = getParam('pid') || getParam('partner_id');
  if (pid) params.set('pid', pid);
  const cid = getParam('cid') || getParam('campaign_id');
  if (cid) params.set('cid', cid);
  const mid = getParam('mid') || getParam('merchant_id') || DEFAULT_MERCHANT_ID;
  if (mid) params.set('mid', mid);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => {
    const v = getParam(k);
    if (v) params.set(k, v);
  });

  try {
    const res = await fetch(`/plugin/linkconnect/api/landing_context.php?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    const payload = (data.data || data) as Partial<PartnerData>;
    if (typeof payload.partner_phone === 'string') {
      window.PARTNER_PHONE = payload.partner_phone;
    }
    if (payload && typeof payload === 'object') {
      window.LC_LANDING_CONTEXT = { ...window.LC_LANDING_CONTEXT, ...payload };
    }
    return payload;
  } catch {
    return {};
  }
}
