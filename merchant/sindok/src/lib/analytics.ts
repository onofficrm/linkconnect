type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: (...args: unknown[]) => void;
    wcs?: { event?: (name: string) => void };
  }
}

function readUtm(): Record<string, string> {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const out: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  keys.forEach((k) => {
    const v = params.get(k) || sessionStorage.getItem(`lc_track_${k}`) || '';
    if (v) out[k] = v;
  });
  return out;
}

/** GA4 generate_lead + 마케팅 픽셀 전환 */
export function trackGenerateLead(extra: Record<string, string> = {}): void {
  const utm = readUtm();
  const payload = { ...utm, ...extra };

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', payload);
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', payload);
  }
  if (window.wcs?.event) {
    window.wcs.event('lead');
  }
}

export function trackCallClick(placement: string): void {
  const utm = readUtm();
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'call_click', { ...utm, placement });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'CallClick', { placement, ...utm });
  }
}
