const LK_CODE_STORAGE = 'lc_hasugu_cpa_lkCode';

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
  return typeof injected === 'string' ? injected : 'CPA-HASUGU';
}

export function receiveApiUrl(): string {
  // 독립도메인(skawning.co.kr Worker)에서도 동일 출처로 접수되도록 상대경로 사용
  return '/plugin/linkconnect/api/receive.php';
}

export interface ConsultationPayload {
  name: string;
  phone: string;
  inquiry: string;
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
}

function trimInquiry(text: string, max = 500): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > max ? normalized.slice(0, max - 1) + '…' : normalized;
}

export function buildInquiryText(fields: {
  area?: string;
  areaDetail?: string;
  serviceType?: string;
  preferredTime?: string;
  message?: string;
  photoCount?: number;
}): string {
  const parts: string[] = [];
  if (fields.area) parts.push(`지역: ${fields.area}`);
  if (fields.areaDetail) parts.push(`상세지역: ${fields.areaDetail}`);
  if (fields.serviceType) parts.push(`증상: ${fields.serviceType}`);
  if (fields.preferredTime) parts.push(`상담가능시간: ${fields.preferredTime}`);
  if (fields.message) parts.push(`문의: ${fields.message}`);
  if (fields.photoCount && fields.photoCount > 0) {
    parts.push(`현장사진: ${fields.photoCount}장(상담 시 전달)`);
  }
  return trimInquiry(parts.join(' | '));
}

export async function submitConsultation(
  payload: ConsultationPayload,
  tracking: ConsultationTracking = {},
): Promise<ConsultationResult> {
  const lkCode = tracking.lkCode || resolveLkCode();
  const campaignId = tracking.campaign_id || resolveCampaignId();

  const body: Record<string, string> = {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    inquiry: trimInquiry(payload.inquiry),
  };

  if (lkCode) {
    body.lkCode = lkCode;
    if (tracking.channel) body.channel = tracking.channel;
  } else {
    if (campaignId) body.campaignId = campaignId;
    body.channel = 'SEO';
  }

  if (tracking.sub_id) body.sub_id = tracking.sub_id;
  if (tracking.utm_source) body.utm_source = tracking.utm_source;
  if (tracking.utm_medium) body.utm_medium = tracking.utm_medium;
  if (tracking.utm_campaign) body.utm_campaign = tracking.utm_campaign;

  try {
    const res = await fetch(receiveApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

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
        '상담 신청이 접수되었습니다. 담당자가 곧 연락드리겠습니다.',
    };
  } catch {
    return { ok: false, message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }
}
