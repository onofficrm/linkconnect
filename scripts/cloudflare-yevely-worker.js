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
 * 중요: Cafe24 오리진은 외부 Referer 로 정적 파일에 403 을 줍니다.
 * 따라서 Worker 가 업스트림 요청 시 Referer/Origin 을 제거해야 이미지가 보입니다.
 */
const ORIGIN_HOST = 'linkconnect.co.kr';
const MODEMO_BASE = '/plugin/onoff-builder-bridge/imports/modemo';

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
    // Cafe24 핫링크(Referer) 403 을 피하고, Host rewrite 로 PHP 게이트가 못 잡는 것도 보완
    const iconFile = ({
      '/favicon.ico': 'favicon.ico',
      '/favicon.svg': 'favicon.svg',
      '/favicon-32x32.png': 'favicon-32x32.png',
      '/apple-touch-icon.png': 'apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png': 'apple-touch-icon.png',
      '/icon.png': 'icon.png',
    })[target.pathname];
    if (iconFile) {
      target.pathname = '/plugin/linkconnect/api/merchant-static.php';
      target.search = `?m=modemo&p=${encodeURIComponent(iconFile)}`;
    }

    // 레거시 /images/* → modemo import 경로
    if (target.pathname === '/images' || target.pathname.startsWith('/images/')) {
      target.pathname = `${MODEMO_BASE}${target.pathname}`;
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
      // /plugin 정적 에셋은 공개 도메인(Worker) 경유 — 오리진 직접 요청 시 Referer 403
      html = html.replace(
        /https:\/\/(?:www\.)?linkconnect\.co\.kr(\/plugin\/[^"'\\\s>]*)/gi,
        (_, path) => `https://${publicHost}${path}`
      );
      html = rewritePublicHost(html, publicHost);
      // 남은 상대 /images/ 도 보정
      html = html
        .replaceAll('src="/images/', `src="${MODEMO_BASE}/images/`)
        .replaceAll("src='/images/", `src='${MODEMO_BASE}/images/`)
        .replaceAll('url("/images/', `url("${MODEMO_BASE}/images/`)
        .replaceAll("url('/images/", `url('${MODEMO_BASE}/images/`)
        .replaceAll('url(/images/', `url(${MODEMO_BASE}/images/`);
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
    .replaceAll('http://www.linkconnect.co.kr', `https://${publicHost}`)
    // 과거 오타 도메인 → 실제 독립도메인
    .replaceAll('https://yevely.jp', `https://${publicHost}`)
    .replaceAll('http://yevely.jp', `https://${publicHost}`)
    .replaceAll('https://www.yevely.jp', `https://${publicHost}`)
    .replaceAll('http://www.yevely.jp', `https://${publicHost}`);
}
