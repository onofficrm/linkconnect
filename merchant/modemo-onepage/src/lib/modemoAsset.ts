/**
 * 독립도메인(yevely.kr 등)에서도 깨지지 않도록
 * public/images → 빌드 basePath 기준 루트 상대경로로 변환.
 * (절대 오리진을 쓰면 Worker가 host만 바꿔 /images 없는 경로로 깨질 수 있음)
 */
export const MODEMO_IMPORT_BASE = '/plugin/onoff-builder-bridge/imports/modemo';

export function modemoAsset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  if (normalized.startsWith(MODEMO_IMPORT_BASE)) {
    return normalized;
  }
  if (normalized.startsWith('/images/')) {
    return `${MODEMO_IMPORT_BASE}${normalized}`;
  }
  return `${MODEMO_IMPORT_BASE}${normalized}`;
}
