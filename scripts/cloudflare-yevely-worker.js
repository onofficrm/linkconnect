/**
 * Cloudflare Worker — yevely.jp → linkconnect modemo(철거) + tracking paths
 *
 * 브라우저 주소는 항상 https://yevely.jp 로 유지하고,
 * 실제 콘텐츠/트래킹은 https://linkconnect.co.kr 에서 가져옵니다.
 *
 * Cloudflare 설정 (air911 / skawning 과 동일):
 * 1. Workers & Pages → yevely Worker → 코드 편집 → 이 파일 전체 붙여넣기 → Deploy
 * 2. Domains & Routes
 *    A) Routes (권장): yevely.jp/* , www.yevely.jp/*
 *    B) Custom domain: yevely.jp / www.yevely.jp
 * 3. SSL/TLS → Full (strict), Universal SSL = Active
 *
 * 이미지 깨짐 방지: HTML의 /plugin/* 정적 경로를 linkconnect 절대 URL로 고정.
 * (독립도메인에 파일이 없고, 상대경로 프록시·한글파일명 인코딩 이슈를 우회)
 */
const ORIGIN_HOST = 'linkconnect.co.kr';
const MODEMO_IMPORT = '/plugin/onoff-builder-bridge/imports/modemo';

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
      target.pathname = `${MODEMO_IMPORT}${target.pathname}`;
    }

    // 잘못된 루트 /assets/* → import 경로
    if (target.pathname === '/assets' || target.pathname.startsWith('/assets/')) {
      target.pathname = `${MODEMO_IMPORT}${target.pathname}`;
    }

    const headers = new Headers(request.headers);
    headers.set('Host', ORIGIN_HOST);
    headers.set('X-Forwarded-Host', publicHost);
    headers.set('X-LC-Public-Host', publicHost);

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

/**
 * HTML 재작성:
 * - /plugin/* 정적 에셋·API → 오리진(linkconnect) 절대경로 고정
 * - /images/* → modemo import 경로로 보정 후 오리진 고정
 * - 그 외 linkconnect 절대 URL은 공개 도메인으로 치환
 */
function rewriteHtml(html, publicHost) {
  const origin = `https://${ORIGIN_HOST}`;
  const keep = '___LC_KEEP_ORIGIN___';

  // 0) 레거시 /images → import 경로
  html = html
    .replaceAll('src="/images/', `src="${MODEMO_IMPORT}/images/`)
    .replaceAll("src='/images/", `src='${MODEMO_IMPORT}/images/`)
    .replaceAll('url("/images/', `url("${MODEMO_IMPORT}/images/`)
    .replaceAll("url('/images/", `url('${MODEMO_IMPORT}/images/`)
    .replaceAll('url(/images/', `url(${MODEMO_IMPORT}/images/`);

  // 1) 이미 절대경로인 /plugin/* 는 오리진 고정
  html = html.replace(
    /https:\/\/(?:www\.)?linkconnect\.co\.kr(\/plugin\/[^"'\\\s>]*)/gi,
    (_, path) => `${keep}${path}`
  );

  // 2) 상대 /plugin/* → 오리진 절대경로 (JS/CSS/이미지/폰트/API)
  html = html
    .replaceAll('src="/plugin/', `src="${keep}/plugin/`)
    .replaceAll("src='/plugin/", `src='${keep}/plugin/`)
    .replaceAll('href="/plugin/', `href="${keep}/plugin/`)
    .replaceAll("href='/plugin/", `href='${keep}/plugin/`)
    .replaceAll('url(/plugin/', `url(${keep}/plugin/`)
    .replaceAll('url("/plugin/', `url("${keep}/plugin/`)
    .replaceAll("url('/plugin/", `url('${keep}/plugin/`)
    .replaceAll('srcset="/plugin/', `srcset="${keep}/plugin/`)
    .replaceAll("srcset='/plugin/", `srcset='${keep}/plugin/`);

  // 3) 공개 도메인으로 나머지 치환
  html = rewritePublicHost(html, publicHost);

  // 4) keep 토큰 → 오리진 복원
  html = html.split(keep).join(origin);

  return html;
}

function rewritePublicHost(text, publicHost) {
  return text
    .replaceAll('https://linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('http://linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('https://www.linkconnect.co.kr', `https://${publicHost}`)
    .replaceAll('http://www.linkconnect.co.kr', `https://${publicHost}`);
}
