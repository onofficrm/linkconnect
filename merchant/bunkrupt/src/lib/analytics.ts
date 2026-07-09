type LandingEvent =
  | 'hero_cta_click'
  | 'hero_mini_form_start'
  | 'form_step1_start'
  | 'form_step1_complete'
  | 'form_submit_success'
  | 'calculator_start'
  | 'calculator_complete'
  | 'calculator_to_form'
  | 'floating_cta_click';

export function trackLandingEvent(event: LandingEvent, detail?: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return;

  const payload = { event, ...detail, ts: Date.now() };
  window.dispatchEvent(new CustomEvent('lc-landing-event', { detail: payload }));
}
