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

    // 레거시 /images/* → modemo import 경로
    if (target.pathname === '/images' || target.pathname.startsWith('/images/')) {
      target.pathname = `${MODEMO_BASE}${target.pathname}`;
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
      // /plugin 정적 에셋은 오리진 호스트를 유지 (독립도메인에 파일이 없음)
      const assetToken = '___LC_KEEP_ORIGIN___';
      html = html.replace(
        /https:\/\/(?:www\.)?linkconnect\.co\.kr(\/plugin\/[^"'\\\s>]*)/gi,
        (_, path) => `${assetToken}${path}`
      );
      html = rewritePublicHost(html, publicHost);
      html = html.split(assetToken).join(`https://${ORIGIN_HOST}`);
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
    .replaceAll('http://www.linkconnect.co.kr', `https://${publicHost}`);
}
