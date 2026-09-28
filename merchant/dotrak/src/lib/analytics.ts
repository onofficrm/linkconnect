import { resolveHeroVariant } from './heroVariant';

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function readUtm(): Record<string, string> {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  keys.forEach((key) => {
    const value = params.get(key) || sessionStorage.getItem(`lc_track_${key}`) || '';
    if (value) out[key] = value;
  });
  return out;
}

/** 폼 시작·2단계·접수·전화 클릭. GA/픽셀이 있으면 함께 보낸다. */
export function trackDotrak(name: string, extra: Record<string, string> = {}): void {
  const payload: Record<string, string> = {
    ...readUtm(),
    hero: resolveHeroVariant(),
    ...extra,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
  }
  if (typeof window.fbq === 'function') {
    if (name === 'generate_lead') window.fbq('track', 'Lead', payload);
    else window.fbq('trackCustom', name, payload);
  }
}
