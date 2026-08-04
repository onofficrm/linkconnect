/**
 * Cloudflare Worker — agrio.co.kr → linkconnect sindok(신독환경) + tracking paths
 *
 * 브라우저 주소는 항상 https://agrio.co.kr 로 유지하고,
 * 실제 콘텐츠/트래킹은 https://linkconnect.co.kr 에서 가져옵니다.
 *
 * Cloudflare 설정:
 * 1. Workers & Pages → agriocokr (또는 새 Worker) → 코드 편집
 * 2. 이 파일 전체 붙여넣기 → 저장 → 배포
 * 3. Domains & Routes
 *    - Custom domain: agrio.co.kr
 *    - Custom domain: www.agrio.co.kr
 *    (또는 Route: agrio.co.kr/* / www.agrio.co.kr/*)
 * 4. SSL/TLS → Full (또는 Full strict), Always Use HTTPS ON
 *
 * 관리자: 캠페인 홍보 링크 독립 도메인 = https://agrio.co.kr (경로 없이)
 * 랜딩 URL = https://linkconnect.co.kr/merchant/sindok/
 */
const ORIGIN_HOST = 'linkconnect.co.kr';
const MERCHANT_PATH = '/merchant/sindok/';
const SINDOK_BASE = '/plugin/onoff-builder-bridge/imports/sindok';
const STATIC_PROXY = '/plugin/linkconnect/api/merchant-static.php';

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const publicHost = incoming.hostname;

    const target = new URL(request.url);
    target.protocol = 'https:';
    target.hostname = ORIGIN_HOST;

    // 루트 → 신독환경 랜딩
    if (target.pathname === '/' || target.pathname === '') {
      target.pathname = MERCHANT_PATH;
    }

    // 잘못된 루트 /assets/* → import assets
    if (target.pathname === '/assets' || target.pathname.startsWith('/assets/')) {
      target.pathname = `${SINDOK_BASE}${target.pathname}`;
    }

    // 브라우저 기본 파비콘 → merchant-static
    const iconFile = ({
      '/favicon.ico': 'favicon.ico',
      '/favicon.svg': 'favicon.svg',
      '/favicon-32x32.png': 'favicon-32x32.png',
      '/apple-touch-icon.png': 'apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png': 'apple-touch-icon.png',
      '/icon.png': 'icon.png',
      '/logo.png': 'logo.png',
    })[target.pathname];
    if (iconFile) {
      routeToStaticProxy(target, iconFile);
    }

    // import 정적 이미지(루트 jpg/png 등) → merchant-static (Cafe24 Referer 403 회피)
    if (target.pathname.startsWith(`${SINDOK_BASE}/`)) {
      const rel = target.pathname.slice(SINDOK_BASE.length + 1);
      if (/\.(jpe?g|png|gif|webp|svg|ico)$/i.test(rel) && !rel.includes('..')) {
        routeToStaticProxy(target, rel);
      }
    }

    const headers = new Headers(request.headers);
    headers.set('Host', ORIGIN_HOST);
    headers.set('X-Forwarded-Host', publicHost);
    headers.set('X-LC-Public-Host', publicHost);
    headers.delete('Referer');
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

function routeToStaticProxy(target, relPath) {
  const rel = String(relPath).replace(/^\/+/, '');
  target.pathname = STATIC_PROXY;
  target.search = `?m=sindok&p=${encodeURIComponent(rel)}`;
}

function toStaticProxyUrl(imageRel) {
  const rel = String(imageRel).replace(/^\/+/, '');
  return `${STATIC_PROXY}?m=sindok&p=${encodeURIComponent(rel)}`;
}

function rewriteHtml(html, publicHost) {
  const publicOrigin = `https://${publicHost}`;
  const keep = '___LC_KEEP_PUBLIC___';
  const baseEsc = SINDOK_BASE.replace(/\//g, '\\/');

  // import 이미지 → merchant-static
  html = html.replace(
    new RegExp(`${baseEsc}\\/([^"'\\s?#)]+\\.(?:jpe?g|png|gif|webp|svg|ico))`, 'gi'),
    (_, file) => toStaticProxyUrl(file),
  );

  // 절대경로 linkconnect /plugin/* → 공개 도메인 토큰
  html = html.replace(
    /https:\/\/(?:www\.)?linkconnect\.co\.kr(\/plugin\/[^"'\\\s>]*)/gi,
    (_, path) => `${keep}${path}`,
  );

  // 상대 /plugin/* → 공개 도메인
  html = html
    .replaceAll('src="/plugin/', `src="${keep}/plugin/`)
    .replaceAll("src='/plugin/", `src='${keep}/plugin/`)
    .replaceAll('href="/plugin/', `href="${keep}/plugin/`)
    .replaceAll("href='/plugin/", `href='${keep}/plugin/`)
    .replaceAll('url(/plugin/', `url(${keep}/plugin/`)
    .replaceAll('url("/plugin/', `url("${keep}/plugin/`)
    .replaceAll("url('/plugin/", `url('${keep}/plugin/`);

  html = rewritePublicHost(html, publicHost);
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
