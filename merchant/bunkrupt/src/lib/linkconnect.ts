const LK_CODE_STORAGE = 'lc_banktupt_lkCode';

/** URL·세션에서 홍보 링크 코드(lkCode) 추출 */
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

export function receiveApiUrl(): string {
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
}

function trimInquiry(text: string, max = 500): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > max ? normalized.slice(0, max - 1) + '…' : normalized;
}

export function buildInquiryText(fields: {
  debt?: string;
  income?: string;
  status?: string;
  message?: string;
  trackingNote?: string;
}): string {
  const parts: string[] = [];
  if (fields.debt) parts.push(`채무금액: ${fields.debt}`);
  if (fields.income) parts.push(`월소득: ${fields.income}`);
  if (fields.status) parts.push(`연체여부: ${fields.status}`);
  if (fields.message) parts.push(`문의: ${fields.message}`);
  if (fields.trackingNote) parts.push(fields.trackingNote);
  return trimInquiry(parts.join(' | '));
}

export async function submitConsultation(
  payload: ConsultationPayload,
  tracking: ConsultationTracking = {},
): Promise<ConsultationResult> {
  const lkCode = tracking.lkCode || resolveLkCode();
  if (!lkCode) {
    return {
      ok: false,
      message: '유효한 홍보 링크가 필요합니다. 파트너 링크(/r/코드)로 접속해 주세요.',
    };
  }

  const body: Record<string, string> = {
    lkCode,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    inquiry: trimInquiry(payload.inquiry),
  };

  if (tracking.channel) body.channel = tracking.channel;
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
    if (!res.ok) {
      const msg =
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error) ||
        '상담 신청 접수에 실패했습니다.';
      return { ok: false, message: msg };
    }

    return {
      ok: true,
      message:
        (typeof data.message === 'string' && data.message) ||
        '상담 신청이 접수되었습니다. 담당자가 곧 연락드리겠습니다.',
    };
  } catch {
    return { ok: false, message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }
}
