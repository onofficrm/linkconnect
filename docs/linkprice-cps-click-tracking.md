# 링크프라이스 CPS — 파트너 링크·클릭 추적 (4단계)

CPA `/r/{code}` 와 분리. 파트너에게는 LC 추적 URL만 제공하고, 서버에서 LP로 302합니다.

## URL

```
https://linkconnect.co.kr/go/lp/{merchant_code}?p={partner_token}
https://linkconnect.co.kr/go/lp/{merchant_code}?p={partner_token}&u={urlencoded_product_url}
https://linkconnect.co.kr/s/{short_code}   →  위 /go/lp/... 로 302
```

- `p` = `{pt_id}.{hmac16}` (pt_id 단독 조작 불가)
- `u` = 딥링크 상품 URL (`deeplink_yn=Y` 이고 광고주 도메인 일치 시만)
- `short_code` = 파트너가 숏링크 변환 시 발급 (`g5_lc_lp_shortlinks`)

## 흐름

1. 파트너 `/partner/cps` 또는 머천트 상세에서 홍보링크 복사 (원본 `click.linkprice.com` 비노출)
2. (선택) 숏링크 변환 → `/s/{code}` 로 짧게 만든 뒤 복사
3. 방문자 `/s/...` 또는 `/go/lp/...` 클릭 → `/go/lp` 에서 클릭 로그 후 LP 302

## API

- `GET  partner/api/linkprice.php?view=merchants`
- `POST partner/api/linkprice.php` `{ "action":"deeplink", "merchantCode", "productUrl" }` (세션+Origin CSRF)
- `POST partner/api/linkprice.php` `{ "action":"shortlink", "merchantCode", "productUrl?" }` → `{ shortUrl, promoUrl }`

## 테스트

```bash
php scripts/test-lp-click.php
```
