/**
 * page.php 가 LC_LANDING_CONTEXT.has_partner_phone 을 주입하면
 * landing_context API 추가 호출을 생략한다.
 */
export function shouldSkipLandingContextFetch(): boolean {
  if (typeof window === 'undefined') return false;
  const injected = window.LC_LANDING_CONTEXT as { has_partner_phone?: boolean } | undefined;
  return typeof injected?.has_partner_phone === 'boolean';
}
