import { getParam } from './partnerData';

const LK_CODE_STORAGE = 'lc_dotrak_lkCode';
const DEFAULT_CAMPAIGN_ID = 'CPA-00015';

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
  const fromQuery = getParam('cid') || getParam('campaign_id');
  if (fromQuery) return fromQuery;
  const injected = window.LC_LANDING_CONTEXT?.campaign_id;
  return typeof injected === 'string' && injected !== '' ? injected : DEFAULT_CAMPAIGN_ID;
}

export type LeadCta = 'price' | 'consult';

export interface LeadPayload {
  branch: string;
  areas: string[];
  region: string;
  name: string;
  phone: string;
  marketingConsent: boolean;
  cta: LeadCta;
  /** 허니팟 — 사람은 비워 둔다 */
  website: string;
}

export interface LeadResult {
  ok: boolean;
  message: string;
  duplicate?: boolean;
}

function trimInquiry(text: string, max = 500): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > max ? normalized.slice(0, max - 1) + '…' : normalized;
}

export function buildInquiryText(payload: LeadPayload): string {
  const parts = [
    `신청: ${payload.cta === 'price' ? '가격 알아보기' : '상담 신청'}`,
    `방문 지점: ${payload.branch}`,
    `고민 부위: ${payload.areas.join(', ')}`,
    `거주 지역: ${payload.region}`,
    `마케팅 동의: ${payload.marketingConsent ? 'Y' : 'N'}`,
  ];
  return trimInquiry(parts.join(' | '));
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  const lkCode = resolveLkCode();

  const body: Record<string, string> = {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    region: payload.region,
    inquiry: buildInquiryText(payload),
    page_url: window.location.href.slice(0, 500),
    website: payload.website,
  };

  if (lkCode) {
    body.lkCode = lkCode;
  } else {
    body.campaignId = resolveCampaignId();
    body.channel = 'SEO';
  }

  const subId = getParam('sub_id') || getParam('utm_campaign');
  if (subId) body.sub_id = subId;
  (['utm_source', 'utm_medium', 'utm_campaign'] as const).forEach((key) => {
    const value = getParam(key);
    if (value) body[key] = value;
  });

  try {
    const res = await fetch('/plugin/linkconnect/api/receive.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    const result =
      data && typeof data === 'object' && data.data && typeof data.data === 'object'
        ? (data.data as Record<string, unknown>)
        : (data as Record<string, unknown>);

    if (!res.ok || data.ok === false) {
      const msg =
        (typeof result.message === 'string' && result.message) ||
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error) ||
        '신청 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      return { ok: false, message: msg };
    }

    return {
      ok: true,
      duplicate: result.duplicate === true,
      message: '신청이 접수되었습니다.\n영업일 24시간 이내 1:1 연락드리겠습니다.',
    };
  } catch {
    return { ok: false, message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }
}
