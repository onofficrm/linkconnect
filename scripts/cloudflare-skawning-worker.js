/**
 * Cloudflare Worker — skawning.co.kr → linkconnect hasugu_cpa(하수구) + tracking paths
 *
 * 브라우저 주소는 항상 https://skawning.co.kr 로 유지하고,
 * 실제 콘텐츠/트래킹은 https://linkconnect.co.kr 에서 가져옵니다.
 *
 * Cloudflare 설정 (yevely / air911 과 동일):
 * 1. Workers & Pages → Create → 이 파일 내용 붙여넣기 → 이름 예: skawning-hasugu → Deploy
 * 2. Worker → Settings → Domains & Routes
 *    - Custom domain: skawning.co.kr
 *    - Custom domain: www.skawning.co.kr
 * 3. SSL/TLS → Overview → Full (또는 Full strict)
 * 4. SSL/TLS → Edge Certificates → Universal SSL Active 확인
 *    (HTTPS handshake failure / no peer certificate 이면 인증서 발급 대기·재발급)
 */
const ORIGIN_HOST = 'linkconnect.co.kr';
const HASUGU_BASE = '/plugin/onoff-builder-bridge/imports/hasugu_cpa';

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const publicHost = incoming.hostname;

    const target = new URL(request.url);
    target.protocol = 'https:';
    target.hostname = ORIGIN_HOST;

    // 루트 → 하수구·배관(hasugu_cpa) 랜딩
    if (target.pathname === '/' || target.pathname === '') {
      target.pathname = '/merchant/hasugu_cpa/';
    }

    // 정적 에셋이 /assets 루트로 요청되는 경우 import 경로로 보정
    if (target.pathname === '/assets' || target.pathname.startsWith('/assets/')) {
      target.pathname = `${HASUGU_BASE}${target.pathname}`;
    }

    const headers = new Headers(request.headers);
    headers.set('Host', ORIGIN_HOST);
    headers.set('X-Forwarded-Host', publicHost);
    headers.set('X-LC-Public-Host', publicHost);

    const init = {
      method: request.method,
      headers,
      redirect: 'manual',
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
    }

    const upstream = await fetch(target.toString(), init);
    const outHeaders = new Headers(upstream.headers);

    const location = outHeaders.get('Location');
    if (location) {
      outHeaders.set('Location', rewritePublicHost(location, publicHost));
    }

    const contentType = (outHeaders.get('Content-Type') || '').toLowerCase();
    if (contentType.includes('text/html')) {
      let html = await upstream.text();
      // /plugin 정적·API 절대 URL은 오리진 호스트 유지 (독립도메인에 파일이 없음)
      const assetToken = '___LC_KEEP_ORIGIN___';
      html = html.replace(
        /https:\/\/(?:www\.)?linkconnect\.co\.kr(\/plugin\/[^"'\\\s>]*)/gi,
        (_, path) => `${assetToken}${path}`
      );
      html = rewritePublicHost(html, publicHost);
      html = html.split(assetToken).join(`https://${ORIGIN_HOST}`);
      outHeaders.delete('Content-Length');
      return new Response(html, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: outHeaders,
      });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  },
};

function rewritePublicHost(text, publicHost) {
  return text
    .replaceAll('https://linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('http://linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('https://www.linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('http://www.linkconnect.co.kr', `https://${publicHost}`);
}
