/**
 * page.php 가 파트너 전화 또는 lkCode 를 이미 해석해 주입하면
 * landing_context API 추가 호출을 생략한다.
 * has_partner_phone:false 만으로 스킵하면 루트 리다이렉트 등으로
 * lkCode 가 유실된 뒤 클라이언트 재조회가 막힌다.
 */
export function shouldSkipLandingContextFetch(): boolean {
  if (typeof window === 'undefined') return false;
  const injected = window.LC_LANDING_CONTEXT as
    | { has_partner_phone?: boolean; lkCode?: string }
    | undefined;
  if (!injected || typeof injected.has_partner_phone !== 'boolean') {
    return false;
  }
  if (injected.has_partner_phone === true) {
    return true;
  }
  return Boolean(injected.lkCode && String(injected.lkCode).trim());
}
