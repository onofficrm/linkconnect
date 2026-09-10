/**
 * Cafe24 핫링크 회피: 독립도메인(skawning 등) Referer 에서도 이미지가 보이도록
 * merchant-static 프록시로 제공한다. hasugu 사진은 imports 루트에 있다.
 */
export const HASUGU_IMPORT_BASE = '/plugin/onoff-builder-bridge/imports/hasugu_cpa';
export const HASUGU_IMAGE_PROXY = '/plugin/linkconnect/api/merchant-static.php';

/**
 * @param rel e.g. "hero-technician.webp" or "hero-technician"
 */
export function hasuguAsset(rel: string): string {
  let path = rel.replace(/^\/+/, '');
  if (path.startsWith(HASUGU_IMPORT_BASE.replace(/^\//, ''))) {
    path = path.slice(HASUGU_IMPORT_BASE.replace(/^\//, '').length).replace(/^\/+/, '');
  }
  if (path.includes('merchant-static.php')) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  return `${HASUGU_IMAGE_PROXY}?m=hasugu_cpa&p=${encodeURIComponent(path)}`;
}
