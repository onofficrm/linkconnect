# 링크프라이스 CPS — 파트너 링크·클릭 추적 (4단계)

CPA `/r/{code}` 와 분리. 파트너에게는 LC 추적 URL만 제공하고, 서버에서 LP로 302합니다.

## URL

```
https://linkconnect.co.kr/go/lp/{merchant_code}?p={partner_token}
https://linkconnect.co.kr/go/lp/{merchant_code}?p={partner_token}&u={urlencoded_product_url}
```

- `p` = `{pt_id}.{hmac16}` (pt_id 단독 조작 불가)
- `u` = 딥링크 상품 URL (`deeplink_yn=Y` 이고 광고주 도메인 일치 시만)

## 흐름

1. 파트너 `/partner/cps` 에서 홍보링크 복사 (원본 `click.linkprice.com` 비노출)
2. 방문자 `/go/lp/...` 클릭
3. 파트너·광고주 유효성 → 클릭 로그 → `u_id=L{pt}M{lpm}T{token}` → LP 302

## API

- `GET  partner/api/linkprice.php?view=merchants`
- `POST partner/api/linkprice.php` `{ "action":"deeplink", "merchantCode", "productUrl" }` (세션+Origin CSRF)

## 테스트

```bash
php scripts/test-lp-click.php
```
