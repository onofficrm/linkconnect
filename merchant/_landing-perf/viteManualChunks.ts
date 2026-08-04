/**
 * Vite rollup manualChunks — 광고 랜딩 공통 벤더 분리.
 * vite.config.ts build.rollupOptions.output.manualChunks 에 연결.
 */
export function landingManualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('react-router')) return 'router';
  if (
    id.includes('react-dom') ||
    id.includes('/react/') ||
    id.includes('scheduler')
  ) {
    return 'react-vendor';
  }
  if (id.includes('lucide-react')) return 'icons';
  // 기타 벤더는 기본 청크에 남겨 circular chunk 경고를 피함
  return undefined;
}
