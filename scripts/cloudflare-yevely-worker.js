/**
 * Cloudflare Worker — yevely.kr → linkconnect modemo(철거) + tracking paths
 *
 * 브라우저 주소는 항상 https://yevely.kr 로 유지하고,
 * 실제 콘텐츠/트래킹은 https://linkconnect.co.kr 에서 가져옵니다.
 *
 * Cloudflare 설정 (air911-dasibom 과 동일):
 * 1. Workers & Pages → Create → 이 파일 내용 붙여넣기 → 이름 예: yevely-modemo → Deploy
 * 2. Worker → Settings → Domains & Routes
 *    - Custom domain: yevely.kr
 *    - Custom domain: www.yevely.kr
 * 3. SSL/TLS → Overview → Full (또는 Full strict)
 *
 * 중요: Cafe24 오리진은 외부 Referer 로 /plugin/.../imports/... 정적 파일에 403 을 줍니다.
 * 이미지·파비콘은 반드시 merchant-static.php 프록시로 우회합니다.
 * (Worker 에서 Referer 를 바꿔도 일부 정적 경로는 여전히 403 이 납니다.)
 */
const ORIGIN_HOST = 'linkconnect.co.kr';
const MODEMO_BASE = '/plugin/onoff-builder-bridge/imports/modemo';
const STATIC_PROXY = '/plugin/linkconnect/api/merchant-static.php';

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const publicHost = incoming.hostname;

    const target = new URL(request.url);
    target.protocol = 'https:';
    target.hostname = ORIGIN_HOST;

    // 루트 → 모두의철거(modemo) 랜딩
    if (target.pathname === '/' || target.pathname === '') {
      target.pathname = '/merchant/modemo/';
    }

    // 브라우저 기본 파비콘 요청 → merchant-static 프록시
    const iconFile = ({
      '/favicon.ico': 'favicon.ico',
      '/favicon.svg': 'favicon.svg',
      '/favicon-32x32.png': 'favicon-32x32.png',
      '/apple-touch-icon.png': 'apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png': 'apple-touch-icon.png',
      '/icon.png': 'icon.png',
    })[target.pathname];
    if (iconFile) {
      routeToStaticProxy(target, iconFile);
    }

    // 레거시 /images/* → merchant-static (직접 import 경로는 Cafe24 403)
    if (target.pathname === '/images' || target.pathname.startsWith('/images/')) {
      const rel = target.pathname.replace(/^\/+/, '');
      routeToStaticProxy(target, rel);
    }

    // 직접 import 이미지 경로 → merchant-static
    if (target.pathname.startsWith(`${MODEMO_BASE}/images/`)) {
      const rel = target.pathname.slice(MODEMO_BASE.length + 1); // images/...
      routeToStaticProxy(target, rel);
    }

    const headers = new Headers(request.headers);
    headers.set('Host', ORIGIN_HOST);
    headers.set('X-Forwarded-Host', publicHost);
    headers.set('X-LC-Public-Host', publicHost);
    // Cafe24 핫링크(외부 Referer) 403 방지
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
  target.search = `?m=modemo&p=${encodeURIComponent(rel)}`;
}

function toStaticProxyUrl(imageRel) {
  const rel = String(imageRel).replace(/^\/+/, '');
  return `${STATIC_PROXY}?m=modemo&p=${encodeURIComponent(rel)}`;
}

/**
 * HTML 재작성:
 * - 남은 /images/* · import 직접 이미지 → merchant-static
 * - /plugin/* 는 공개 도메인(Worker) 경유 (오리진 직접 요청 시 Referer 403 회피)
 */
function rewriteHtml(html, publicHost) {
  const publicOrigin = `https://${publicHost}`;
  const keep = '___LC_KEEP_PUBLIC___';

  // 직접 import 이미지 → 프록시
  const baseEsc = MODEMO_BASE.replace(/\//g, '\\/');
  html = html.replace(
    new RegExp(`${baseEsc}\\/images\\/([^"'\\s?#)]+)`, 'g'),
    (_, file) => toStaticProxyUrl(`images/${file}`),
  );

  // 레거시 /images/... → 프록시
  html = html
    .replace(/"\/images\/([^"]+)"/g, (_, file) => `"${toStaticProxyUrl(`images/${file}`)}"`)
    .replace(/'\/images\/([^']+)'/g, (_, file) => `'${toStaticProxyUrl(`images/${file}`)}'`)
    .replace(/url\(\/images\/([^)]+)\)/g, (_, file) => `url(${toStaticProxyUrl(`images/${file}`)})`)
    .replace(/url\("\/images\/([^"]+)"\)/g, (_, file) => `url("${toStaticProxyUrl(`images/${file}`)}")`)
    .replace(/url\('\/images\/([^']+)'\)/g, (_, file) => `url('${toStaticProxyUrl(`images/${file}`)}')`);

  // 절대경로 linkconnect /plugin/* → 공개 도메인 토큰
  html = html.replace(
    /https:\/\/(?:www\.)?linkconnect\.co\.kr(\/plugin\/[^"'\\\s>]*)/gi,
    (_, path) => `${keep}${path}`,
  );

  // 상대 /plugin/* → 공개 도메인 절대경로
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
    .replaceAll('http://www.linkconnect.co.kr', `https://${publicHost}`)
    // 과거 오타 도메인 → 실제 독립도메인
    .replaceAll('https://yevely.jp', `https://${publicHost}`)
    .replaceAll('http://yevely.jp', `https://${publicHost}`)
    .replaceAll('https://www.yevely.jp', `https://${publicHost}`)
    .replaceAll('http://www.yevely.jp', `https://${publicHost}`);
}
