/** GNUBoard LinkConnect 플러그인 경로 (운영·관리 화면) */
export const LC_PLUGIN_BASE = '/plugin/linkconnect';

/** GNUBoard 게시판 기본 경로 */
export const G5_BBS_BASE = '/bbs';

export function lcPluginUrl(path = '') {
  const normalized = path.replace(/^\//, '');
  return normalized ? `${LC_PLUGIN_BASE}/${normalized}` : LC_PLUGIN_BASE;
}

export function g5BbsUrl(path: string) {
  return `${G5_BBS_BASE}/${path.replace(/^\//, '')}`;
}

/** HashRouter SPA 복귀 URL (예: /#/select-center) */
export function spaReturnUrl(hashPath = '/') {
  if (typeof window === 'undefined') {
    return '/';
  }
  const hash = hashPath.startsWith('#') ? hashPath : `#${hashPath}`;
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

/** 현재 SPA 해시 경로 기준 로그인 복귀 URL */
export function currentSpaReturnUrl(fallback = '/select-center') {
  if (typeof window === 'undefined') {
    return spaReturnUrl(fallback);
  }
  const hashPath = window.location.hash.replace(/^#/, '') || fallback;
  return spaReturnUrl(hashPath.startsWith('/') ? hashPath : `/${hashPath}`);
}

/** GNUBoard 로그인 — url 파라미터로 로그인 후 복귀 */
export function g5LoginUrl(returnUrl?: string) {
  const url = returnUrl || (typeof window !== 'undefined' ? window.location.href : spaReturnUrl('/'));
  return `${g5BbsUrl('login.php')}?url=${encodeURIComponent(url)}`;
}

export function g5RegisterUrl() {
  return g5BbsUrl('register.php');
}

export function g5LogoutUrl() {
  return g5BbsUrl('logout.php');
}
