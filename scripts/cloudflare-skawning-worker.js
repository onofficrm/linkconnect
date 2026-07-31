/**
 * Cloudflare Worker — skawning.co.kr → linkconnect hasugu_cpa(하수구) + tracking paths
 *
 * 브라우저 주소는 항상 https://skawning.co.kr 로 유지하고,
 * 실제 콘텐츠/트래킹은 https://linkconnect.co.kr 에서 가져옵니다.
 *
 * Cloudflare 설정 (air911 과 동일 — SSL 안정성 우선):
 * 1. Workers & Pages → skawningcokr → 코드 편집 → 이 파일 전체 붙여넣기 → Deploy
 * 2. 도메인 연결 (둘 중 하나, SSL이 안 되면 Routes 방식 권장)
 *    A) Routes (권장):
 *       - Workers → Domains & Routes → Add route
 *       - Route: skawning.co.kr/*   Zone: skawning.co.kr
 *       - Route: www.skawning.co.kr/*   Zone: skawning.co.kr
 *       - SSL/TLS → Overview → Full (strict)
 *       - SSL/TLS → Edge Certificates → Universal SSL = Active
 *    B) Custom domain: skawning.co.kr / www.skawning.co.kr
 *       (인증서 Pending / HTTPS handshake failure 이면 A로 전환)
 * 3. "Always Use HTTPS" 켜기 (Edge Certificates)
 */
const ORIGIN_HOST = 'linkconnect.co.kr';
const HASUGU_IMPORT = '/plugin/onoff-builder-bridge/imports/hasugu_cpa';

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

    // 잘못된 루트 /assets/* → import 경로
    if (target.pathname === '/assets' || target.pathname.startsWith('/assets/')) {
      target.pathname = `${HASUGU_IMPORT}${target.pathname}`;
    }

    const headers = new Headers(request.headers);
    headers.set('Host', ORIGIN_HOST);
    headers.set('X-Forwarded-Host', publicHost);
    headers.set('X-LC-Public-Host', publicHost);
    // Cafe24 핫링크(외부 Referer) 403 방지 — 이미지가 깨지지 않도록
    headers.delete('Origin');
    headers.set('Referer', `https://${ORIGIN_HOST}/`);

    const init = {
      method: request.method,
      headers,
      redirect: 'manual',
      cf: { cacheTtl: 0 },
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
    }

    let upstream;
    try {
      upstream = await fetch(target.toString(), init);
    } catch (err) {
      return new Response('Upstream fetch failed: ' + String(err), { status: 502 });
    }

    const outHeaders = new Headers(upstream.headers);
    // 브라우저가 workers.dev / 독립도메인에서 모듈·이미지 로드 가능하도록
    if (!outHeaders.has('Access-Control-Allow-Origin')) {
      outHeaders.set('Access-Control-Allow-Origin', '*');
    }

    const location = outHeaders.get('Location');
    if (location) {
      outHeaders.set('Location', rewritePublicHost(location, publicHost));
    }

    const contentType = (outHeaders.get('Content-Type') || '').toLowerCase();
    if (contentType.includes('text/html')) {
      let html = await upstream.text();
      html = rewriteHtml(html, publicHost);
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

/**
 * HTML 재작성:
 * - /plugin/* 정적 에셋·API 는 공개 도메인(Worker) 경유 (Cafe24 외부 Referer 403 회피)
 * - 그 외 linkconnect 절대 URL은 공개 도메인으로 치환
 */
function rewriteHtml(html, publicHost) {
  const publicOrigin = `https://${publicHost}`;
  const keep = '___LC_KEEP_PUBLIC___';

  // 1) 이미 절대경로인 /plugin/* 는 공개 도메인으로
  html = html.replace(
    /https:\/\/(?:www\.)?linkconnect\.co\.kr(\/plugin\/[^"'\\\s>]*)/gi,
    (_, path) => `${keep}${path}`
  );

  // 2) 상대 /plugin/* → 공개 도메인 절대경로
  html = html
    .replaceAll('src="/plugin/', `src="${keep}/plugin/`)
    .replaceAll("src='/plugin/", `src='${keep}/plugin/`)
    .replaceAll('href="/plugin/', `href="${keep}/plugin/`)
    .replaceAll("href='/plugin/", `href='${keep}/plugin/`)
    .replaceAll('url(/plugin/', `url(${keep}/plugin/`)
    .replaceAll('url("/plugin/', `url("${keep}/plugin/`)
    .replaceAll("url('/plugin/", `url('${keep}/plugin/`);

  // 3) 공개 도메인으로 나머지 치환
  html = rewritePublicHost(html, publicHost);

  // 4) keep 토큰 → 공개 도메인 복원
  html = html.split(keep).join(publicOrigin);

  return html;
}

function rewritePublicHost(text, publicHost) {
  return text
    .replaceAll('https://linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('http://linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('https://www.linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('http://www.linkconnect.co.kr', `https://${publicHost}`);
}
