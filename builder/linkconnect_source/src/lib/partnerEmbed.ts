import { getLcAuth } from './auth';

/** 파트너 홍보코드로 워드프레스 등에 붙일 상담폼 설치 스니펫 */
export function leadEmbedOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const site = (getLcAuth().siteUrl || '').replace(/\/$/, '');
  if (site) {
    try {
      return new URL(site).origin;
    } catch {
      return site;
    }
  }
  return window.location.origin;
}

export function buildLeadEmbedSnippet(lkCode: string, origin = leadEmbedOrigin()): string {
  const code = lkCode.trim();
  const safe = code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'form';
  const id = `lc-lead-${safe}`;
  const base = origin.replace(/\/$/, '');
  const scriptSrc = `${base}/plugin/linkconnect/assets/js/lead-embed.js`;

  return [
    '<!-- LinkConnect 상담신청 폼 -->',
    `<div id="${id}"></div>`,
    `<script src="${scriptSrc}" data-lk-code="${code}" data-target="#${id}" async></script>`,
  ].join('\n');
}
