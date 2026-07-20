/**
 * Cloudflare Worker — air911.co.kr → linkconnect dasibom + tracking paths
 *
 * 브라우저 주소는 항상 https://air911.co.kr 로 유지하고,
 * 실제 콘텐츠/트래킹은 https://linkconnect.co.kr 에서 가져옵니다.
 *
 * Cloudflare 설정:
 * 1. Workers & Pages → Create → 이 파일 내용 붙여넣기 → Deploy
 * 2. Worker → Settings → Domains & Routes →
 *    Route: air911.co.kr/*
 *    Zone: air911.co.kr
 * 3. SSL/TLS → Overview → Full (또는 Full strict)
 * 4. DNS: A/AAAA 또는 CNAME은 Cloudflare 프록시(주황구름) 유지
 *    (Worker Route가 있으면 origin 403과 무관하게 Worker가 응답)
 */
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const originHost = 'linkconnect.co.kr';
    const publicHost = incoming.hostname; // air911.co.kr

    const target = new URL(request.url);
    target.protocol = 'https:';
    target.hostname = originHost;

    // 루트 → 다시봄 랜딩
    if (target.pathname === '/' || target.pathname === '') {
      target.pathname = '/merchant/dasibom/';
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

    // HTML 본문의 절대 링크도 독립 도메인으로 치환 (미리보기·자산)
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
