export interface PartnerTracking {
  partner_id: string;
  campaign_id: string;
  merchant_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

export interface PartnerData extends PartnerTracking {
  partner_phone: string;
  partner_phone_display: string;
  lkCode: string;
}

declare global {
  interface Window {
    PARTNER_PHONE?: string;
    LC_LANDING_CONTEXT?: Partial<PartnerData & { has_partner_phone?: boolean; partner_phone_display?: string }>;
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
] as const;

/** URL query + hash query 에서 파라미터 읽기 */
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
    if (v) {
      persistParam(key, v);
    }
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const hp = new URLSearchParams(hash.split('?')[1] || '');
      const hv = hp.get(key);
      if (hv) {
        persistParam(key, hv);
      }
    }
  });
}

export function getPartnerData(): PartnerData {
  const injected = window.LC_LANDING_CONTEXT || {};
  return {
    partner_id:
      getParam('pid') ||
      getParam('partner_id') ||
      (typeof injected.partner_id === 'string' ? injected.partner_id : ''),
    campaign_id:
      getParam('cid') ||
      getParam('campaign_id') ||
      (typeof injected.campaign_id === 'string' ? injected.campaign_id : ''),
    merchant_id:
      getParam('mid') ||
      getParam('merchant_id') ||
      (typeof injected.merchant_id === 'string' ? injected.merchant_id : '') ||
      'banktupt',
    utm_source: getParam('utm_source') || (typeof injected.utm_source === 'string' ? injected.utm_source : ''),
    utm_medium: getParam('utm_medium') || (typeof injected.utm_medium === 'string' ? injected.utm_medium : ''),
    utm_campaign:
      getParam('utm_campaign') || (typeof injected.utm_campaign === 'string' ? injected.utm_campaign : ''),
    partner_phone:
      (window.PARTNER_PHONE || '').trim() ||
      (typeof injected.partner_phone === 'string' ? injected.partner_phone : '').trim(),
    partner_phone_display:
      (typeof injected.partner_phone_display === 'string' ? injected.partner_phone_display : '') ||
      formatPhoneDisplay(window.PARTNER_PHONE || injected.partner_phone || ''),
    lkCode:
      getParam('lkCode') ||
      getParam('code') ||
      (typeof injected.lkCode === 'string' ? injected.lkCode : ''),
  };
}

export function hasPartnerPhone(partnerData: Pick<PartnerData, 'partner_phone'>): boolean {
  return Boolean(partnerData.partner_phone && partnerData.partner_phone.trim() !== '');
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
  return digits ? `tel:${digits}` : '';
}

/** DOM 기반 전화번호 조건부 노출 (class 기준) */
export function applyPhoneVisibility(partnerPhone: string): void {
  const root = document.getElementById('banktupt-merchant-page');
  if (!root) return;

  const show = hasPartnerPhone({ partner_phone: partnerPhone });
  const display = formatPhoneDisplay(partnerPhone);
  const tel = phoneTelHref(partnerPhone);

  root.classList.toggle('has-partner-phone', show);
  root.classList.toggle('no-partner-phone', !show);
  root.classList.add('phone-context-ready');

  root.querySelectorAll<HTMLElement>('.phone-only, .partner-phone-section').forEach((el) => {
    el.style.display = show ? '' : 'none';
    el.setAttribute('aria-hidden', show ? 'false' : 'true');
  });

  root.querySelectorAll<HTMLElement>('.partner-phone-text').forEach((el) => {
    if (!show) return;
    if (el.classList.contains('phone-label-only')) {
      const label = el.dataset.phoneLabel || '전화상담';
      if (!el.textContent?.trim() || el.textContent.includes('010-')) {
        el.textContent = label;
      }
      return;
    }
    el.textContent = display || el.textContent;
  });

  root.querySelectorAll<HTMLElement>('.partner-phone-link').forEach((el) => {
    if (show && tel) {
      if (el.tagName === 'A') {
        (el as HTMLAnchorElement).href = tel;
      } else {
        el.dataset.tel = tel;
        el.style.cursor = 'pointer';
      }
    } else if (el.tagName === 'A') {
      (el as HTMLAnchorElement).removeAttribute('href');
    }
  });

  const bottomPhone = root.querySelector<HTMLElement>('.bottom-phone-btn');
  const bottomForm = root.querySelector<HTMLElement>('.bottom-form-btn');
  if (bottomPhone) {
    bottomPhone.style.display = show ? '' : 'none';
  }
  if (bottomForm) {
    if (show) {
      bottomForm.classList.add('flex-1');
      bottomForm.classList.remove('w-full');
      bottomForm.style.width = '';
    } else {
      bottomForm.classList.remove('flex-1');
      bottomForm.classList.add('w-full');
      bottomForm.style.width = '100%';
    }
  }
}

export async function fetchLandingContext(): Promise<Partial<PartnerData> & { has_partner_phone?: boolean }> {
  const params = new URLSearchParams();
  const lk = getParam('lkCode') || getParam('code');
  if (lk) params.set('lkCode', lk);
  const pid = getParam('pid') || getParam('partner_id');
  if (pid) params.set('pid', pid);
  const cid = getParam('cid') || getParam('campaign_id');
  if (cid) params.set('cid', cid);
  const mid = getParam('mid') || getParam('merchant_id');
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
    const payload = data.data || data;
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

export function getTrackingForSubmit(): PartnerTracking & { lkCode: string; channel: string; sub_id: string } {
  const data = getPartnerData();
  return {
    lkCode: data.lkCode,
    partner_id: data.partner_id,
    campaign_id: data.campaign_id,
    merchant_id: data.merchant_id,
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    channel: data.utm_source || data.utm_medium || '',
    sub_id: data.utm_campaign || '',
  };
}
