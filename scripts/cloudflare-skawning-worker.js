/**
 * Cloudflare Worker — skawning.co.kr → linkconnect hasugu_cpa(하수구) + tracking paths
 *
 * 브라우저 주소는 항상 https://skawning.co.kr 로 유지하고,
 * 실제 콘텐츠/트래킹은 https://linkconnect.co.kr 에서 가져옵니다.
 *
 * 설정 방법은 air911 / yevely 와 동일 (Custom Domain → Worker).
 */
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const originHost = 'linkconnect.co.kr';
    const publicHost = incoming.hostname; // skawning.co.kr

    const target = new URL(request.url);
    target.protocol = 'https:';
    target.hostname = originHost;

    // 루트 → 하수구·배관(hasugu_cpa) 랜딩
    if (target.pathname === '/' || target.pathname === '') {
      target.pathname = '/merchant/hasugu_cpa/';
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
