/**
 * MODEMO / 모두의 철거 — receive.php Frontend Adapter
 * Contract mirrors merchant/modemo-onepage/src/lib/linkconnect.ts
 * Does NOT modify receive.php.
 */

const LK_CODE_STORAGE = 'lc_modemo_lkCode';

declare global {
  interface Window {
    LC_LANDING_CONTEXT?: {
      lkCode?: string;
      campaign_id?: string;
      merchant_id?: string;
      partner_id?: string;
      sub_id?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      partner_phone?: string;
      partner_phone_display?: string;
      has_partner_phone?: boolean;
      privacy_policy_url?: string;
      lead_submit_url?: string;
      merchant_name?: string;
      representative_name?: string;
      business_number?: string;
      business_address?: string;
    };
  }
}

export function resolveLkCode(): string {
  const params = new URLSearchParams(window.location.search);
  const fromQuery =
    params.get('lkCode') || params.get('code') || params.get('lk_code') || '';
  if (fromQuery) {
    sessionStorage.setItem(LK_CODE_STORAGE, fromQuery);
    return fromQuery;
  }

  const hash = window.location.hash;
  if (hash.includes('?')) {
    const hashParams = new URLSearchParams(hash.split('?')[1] || '');
    const fromHash =
      hashParams.get('lkCode') || hashParams.get('code') || hashParams.get('lk_code') || '';
    if (fromHash) {
      sessionStorage.setItem(LK_CODE_STORAGE, fromHash);
      return fromHash;
    }
  }

  const stored = sessionStorage.getItem(LK_CODE_STORAGE) || '';
  if (stored) return stored;

  const injected = window.LC_LANDING_CONTEXT?.lkCode;
  return typeof injected === 'string' ? injected : '';
}

export function resolveCampaignId(): string {
  const params = new URLSearchParams(window.location.search);
  const fromQuery =
    params.get('cid') || params.get('campaign_id') || params.get('campaignId') || '';
  if (fromQuery) return fromQuery;
  const injected = window.LC_LANDING_CONTEXT?.campaign_id;
  return typeof injected === 'string' ? injected : 'CPA-MODEMO';
}

export function resolveMerchantId(): string {
  const injected = window.LC_LANDING_CONTEXT?.merchant_id;
  return typeof injected === 'string' && injected ? injected : 'ADV-0008';
}

export function receiveApiUrl(): string {
  const injected = window.LC_LANDING_CONTEXT?.lead_submit_url;
  if (typeof injected === 'string' && injected && !injected.includes('{{') && injected.startsWith('/')) {
    return injected;
  }
  return '/plugin/linkconnect/api/receive.php';
}

export function privacyPolicyUrl(): string {
  const injected = window.LC_LANDING_CONTEXT?.privacy_policy_url;
  if (typeof injected === 'string' && injected) return injected;
  return '/privacy';
}

export interface ConsultationPayload {
  name: string;
  phone: string;
  inquiry: string;
  region?: string;
}

export interface ConsultationTracking {
  lkCode?: string;
  channel?: string;
  sub_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  partner_id?: string;
  campaign_id?: string;
  merchant_id?: string;
}

export interface ConsultationResult {
  ok: boolean;
  message: string;
  duplicate?: boolean;
  dryRun?: boolean;
  /** Inspectable payload for local contract tests (never logged in prod UI) */
  debugPayload?: Record<string, string>;
}

function trimInquiry(text: string, max = 500): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > max ? normalized.slice(0, max - 1) + '…' : normalized;
}

export function buildInquiryText(fields: {
  serviceType?: string;
  region?: string;
  message?: string;
  fileName?: string;
}): string {
  const parts: string[] = [];
  if (fields.serviceType) parts.push(`철거유형: ${fields.serviceType}`);
  if (fields.region) parts.push(`지역: ${fields.region}`);
  if (fields.message) parts.push(`문의: ${fields.message}`);
  if (fields.fileName) parts.push(`견적서첨부: ${fields.fileName}`);
  return trimInquiry(parts.join(' | ') || '철거 견적 상담 신청');
}

function collectUtmFromLocation(): { utm_source: string; utm_medium: string; utm_campaign: string } {
  const params = new URLSearchParams(window.location.search);
  const ctx = window.LC_LANDING_CONTEXT || {};
  return {
    utm_source: params.get('utm_source') || ctx.utm_source || '',
    utm_medium: params.get('utm_medium') || ctx.utm_medium || '',
    utm_campaign: params.get('utm_campaign') || ctx.utm_campaign || '',
  };
}

/** Dry-run only when explicitly enabled, or during Vite DEV. Production builds POST for real. */
export function isDryRunSubmit(): boolean {
  if (import.meta.env.VITE_LC_DRY_RUN === '0' || import.meta.env.VITE_LC_DRY_RUN === 'false') {
    return false;
  }
  if (import.meta.env.VITE_LC_DRY_RUN === '1' || import.meta.env.VITE_LC_DRY_RUN === 'true') {
    return true;
  }
  return import.meta.env.DEV === true;
}

function buildFields(
  payload: ConsultationPayload,
  tracking: ConsultationTracking,
): Record<string, string> {
  const lkCode = tracking.lkCode || resolveLkCode();
  const campaignId = tracking.campaign_id || resolveCampaignId();
  const utm = collectUtmFromLocation();

  const fields: Record<string, string> = {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    inquiry: trimInquiry(payload.inquiry),
  };

  if (payload.region && payload.region.trim()) {
    fields.region = payload.region.trim();
  }

  fields.page_url = window.location.href;
  if (document.referrer) {
    fields.referer = document.referrer;
  }

  if (lkCode) {
    fields.lkCode = lkCode;
    if (tracking.channel) fields.channel = tracking.channel;
  } else {
    if (campaignId) fields.campaignId = campaignId;
    fields.channel = 'SEO';
  }

  const subId = tracking.sub_id || window.LC_LANDING_CONTEXT?.sub_id || utm.utm_campaign;
  if (subId) fields.sub_id = subId;

  const utmSource = tracking.utm_source || utm.utm_source;
  const utmMedium = tracking.utm_medium || utm.utm_medium;
  const utmCampaign = tracking.utm_campaign || utm.utm_campaign;
  if (utmSource) fields.utm_source = utmSource;
  if (utmMedium) fields.utm_medium = utmMedium;
  if (utmCampaign) fields.utm_campaign = utmCampaign;

  return fields;
}

/**
 * Assert Hero payload has no fabricated customer attributes.
 * Throws in dry-run/dev if forbidden keys appear.
 */
export function assertHeroPayloadClean(fields: Record<string, string>): void {
  const forbidden = ['pyeong', '평수', '긴급', 'schedule', 'demolitionType'];
  const inquiry = fields.inquiry || '';
  // Hero inquiry must stay short fixed phrase — no auto region/type
  if (inquiry.includes('철거유형:') || inquiry.includes('지역:')) {
    throw new Error('Hero payload must not invent region/type in inquiry');
  }
  for (const key of Object.keys(fields)) {
    if (forbidden.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      throw new Error(`Hero payload forbidden key: ${key}`);
    }
  }
}

export async function submitConsultation(
  payload: ConsultationPayload,
  tracking: ConsultationTracking = {},
  file?: File | null,
): Promise<ConsultationResult> {
  const fields = buildFields(payload, tracking);

  if (isDryRunSubmit()) {
    // Contract static test — do not hit Production
    if (!fields.name || !fields.phone || !fields.inquiry) {
      return { ok: false, message: '이름과 연락처를 확인해 주세요.', dryRun: true, debugPayload: fields };
    }
    if (!fields.campaignId && !fields.lkCode) {
      return { ok: false, message: '캠페인/링크 정보가 없습니다.', dryRun: true, debugPayload: fields };
    }
    if (fields.campaignId && fields.campaignId !== 'CPA-MODEMO' && !fields.lkCode) {
      // allow override via query but flag in message for tests
    }
    return {
      ok: true,
      dryRun: true,
      message: '[DRY-RUN] 로컬 검증만 수행했습니다. Production DB에 저장되지 않았습니다.',
      debugPayload: { ...fields, ...(file ? { attachmentName: file.name } : {}) },
    };
  }

  try {
    let res: Response;
    if (file) {
      const form = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== '') form.append(key, value);
      });
      form.append('attachment', file);
      res = await fetch(receiveApiUrl(), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: form,
      });
    } else {
      res = await fetch(receiveApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(fields),
      });
    }

    const data = await res.json().catch(() => ({}));
    const resultPayload =
      data && typeof data === 'object' && data.data && typeof data.data === 'object'
        ? (data.data as Record<string, unknown>)
        : (data as Record<string, unknown>);

    if (!res.ok || data.ok === false) {
      const msg =
        (typeof resultPayload.message === 'string' && resultPayload.message) ||
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error) ||
        '상담 신청 접수에 실패했습니다.';
      return { ok: false, message: msg };
    }

    return {
      ok: true,
      duplicate: resultPayload.duplicate === true,
      message:
        (typeof resultPayload.message === 'string' && resultPayload.message) ||
        (typeof data.message === 'string' && data.message) ||
        '견적 신청이 접수되었습니다. 담당자가 곧 연락드리겠습니다.',
    };
  } catch {
    return { ok: false, message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }
}
