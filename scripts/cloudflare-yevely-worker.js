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
 *    (또는 Route: yevely.kr/* , www.yevely.kr/*  Zone: yevely.kr)
 * 3. DNS에서 기존 A(115.68.168.238) 레코드는 Worker 도메인 연결 시
 *    자동으로 Worker 형식으로 바뀌거나, A를 제거하고 Worker 레코드만 두면 됩니다.
 * 4. SSL/TLS → Overview → Full (또는 Full strict)
 *
 * 참고: origin에 yevely.kr 가상호스트가 없어도 Worker가 Host: linkconnect.co.kr
 * 로 요청하므로 403이 발생하지 않습니다.
 */
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const originHost = 'linkconnect.co.kr';
    const publicHost = incoming.hostname; // yevely.kr

    const target = new URL(request.url);
    target.protocol = 'https:';
    target.hostname = originHost;

    // 루트 → 모두의철거(modemo) 랜딩
    if (target.pathname === '/' || target.pathname === '') {
      target.pathname = '/merchant/modemo/';
      if (!target.pathname.endsWith('/')) {
        target.pathname += '/';
      }
    }

    const headers = new Headers(request.headers);
    headers.set('Host', originHost);
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
      outHeaders.set(
        'Location',
        location
          .replaceAll('https://linkconnect.co.kr', `https://${publicHost}`)
          .replaceAll('http://linkconnect.co.kr', `https://${publicHost}`)
          .replaceAll('https://www.linkconnect.co.kr', `https://${publicHost}`)
      );
    }

    const contentType = (outHeaders.get('Content-Type') || '').toLowerCase();
    if (contentType.includes('text/html')) {
      let html = await upstream.text();
      html = html
        .replaceAll('https://linkconnect.co.kr', `https://${publicHost}`)
        .replaceAll('http://linkconnect.co.kr', `https://${publicHost}`)
        .replaceAll('https://www.linkconnect.co.kr', `https://${publicHost}`);
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
