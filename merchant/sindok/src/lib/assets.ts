/** Vite base 경로를 포함한 정적 에셋 URL */
export function publicAsset(filename: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}${filename.replace(/^\//, '')}`;
}
