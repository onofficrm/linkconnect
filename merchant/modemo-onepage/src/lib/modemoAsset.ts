/**
 * 독립도메인(yevely.kr)에서도 깨지지 않도록 이미지 경로를 PHP 프록시로 제공한다.
 * Cafe24 핫링크는 Referer 가 linkconnect 가 아니면 /plugin/.../images 직접 접근을 403 한다.
 */
export const MODEMO_IMPORT_BASE = '/plugin/onoff-builder-bridge/imports/modemo';
export const MODEMO_IMAGE_PROXY = '/plugin/linkconnect/api/merchant-static.php';

function toImageProxyPath(path: string): string {
  let rel = path.startsWith('/') ? path : `/${path}`;
  if (rel.startsWith(MODEMO_IMPORT_BASE)) {
    rel = rel.slice(MODEMO_IMPORT_BASE.length) || '/';
  }
  rel = rel.replace(/^\/+/, '');
  if (!rel.startsWith('images/')) {
    rel = `images/${rel.replace(/^images\//, '')}`;
  }
  return `${MODEMO_IMAGE_PROXY}?m=modemo&p=${encodeURIComponent(rel)}`;
}

export function modemoAsset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    // 잘못된 레거시 도메인 교정
    if (normalized.includes('yevely.jp')) {
      return toImageProxyPath(
        normalized.replace(/^https?:\/\/(?:www\.)?yevely\.jp\/plugin\/onoff-builder-bridge\/imports\/modemo\//i, '/')
          .replace(/^https?:\/\/(?:www\.)?yevely\.jp\//i, '/'),
      );
    }
    return normalized;
  }

  if (
    normalized.startsWith('/images/') ||
    normalized.includes('/images/') ||
    normalized.startsWith(`${MODEMO_IMPORT_BASE}/images/`)
  ) {
    return toImageProxyPath(normalized);
  }

  if (normalized.startsWith(MODEMO_IMPORT_BASE)) {
    return normalized;
  }

  return `${MODEMO_IMPORT_BASE}${normalized}`;
}
