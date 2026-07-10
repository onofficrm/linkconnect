# 링크프라이스 CPS — 광고주 자동 수집 (3단계)

공식 문서: [광고주 조회 오픈 API 1.0](https://github.com/linkprice/AffiliateSetup/blob/master/docs/%EA%B4%91%EA%B3%A0%EC%A3%BC_%EC%A1%B0%ED%9A%8C_%EC%98%A4%ED%94%88_API_1.0.md)

**원칙:** CPA(`/cpa`) 경로는 절대 호출하지 않음. CPS(`/cps`)만 사용.

---

## 1. API 호출 방법

### 엔드포인트 (공식)

| 용도 | URL |
|------|-----|
| CPS 승인 | `http://api.linkprice.com/ci/service/all_merchant/{A코드}/apr/cps` |
| CPS 전체 | `http://api.linkprice.com/ci/service/all_merchant/{A코드}/all/cps` |
| +상세 | 위 URL 뒤에 `/detail` |
| CPA (사용 금지) | `.../apr/cpa`, `.../all/cpa` |

인증: 경로의 **A코드**만 사용 (광고주 조회 API는 auth_key 불필요).  
실적 조회 API만 `auth_key` 쿼리 사용.

### PHP

```php
// 승인 CPS + detail
$res = lc_lp_client_fetch_merchants('apr', true);

// 동기화 (INSERT/UPDATE, 누락 건 비활성, 관리자 필드 보존)
$result = lc_lp_sync_merchants(array(
    'scope'              => 'apr', // 또는 'all'
    'detail'             => true,
    'test_mode'          => false,
    'deactivate_missing' => true,
));
```

### 관리자 API

- `GET  /plugin/linkconnect/admin/api/linkprice.php?view=merchants`
- `POST /plugin/linkconnect/admin/api/linkprice.php` `{ "action": "sync_merchants", "scope": "apr" }`
- `POST ...` `{ "action": "update_merchant", "lpmId": 1, "visible": true, "partnerRate": 70 }`
- `POST ...` `{ "action": "save_config", "affiliateCode": "A100...", "apiAuthKey": "..." }`

---

## 2. 크론 실행 명령

```bash
# CLI (권장)
php cron/linkprice_sync_merchants.php
php cron/linkprice_sync_merchants.php --scope=apr --detail=1
php cron/linkprice_sync_merchants.php --scope=all

# 또는 플러그인 경로 직접
php plugin/linkconnect/cron/linkprice_sync_merchants.php --scope=apr
```

웹 호출 (토큰 필수 — settings `lpCronToken` 또는 env `LC_LP_CRON_TOKEN`):

```
https://linkconnect.co.kr/plugin/linkconnect/cron/linkprice_sync_merchants.php?token=YOUR_TOKEN&scope=apr
```

- 파일 락으로 중복 실행 방지
- 실패 시 기존 광고주 삭제/일괄 비활성 없음 (API 성공 후에만 누락 건 `sync_active=0`)
- 광고주 1건 오류는 스킵 후 계속
- 로그: `{G5_DATA_PATH}/linkconnect/lp_merchant_sync.log` + `g5_lc_lp_sync_logs`

crontab 예:

```
*/30 * * * * /usr/bin/php /path/to/public_html/cron/linkprice_sync_merchants.php --scope=apr >> /dev/null 2>&1
```

(공식 가이드: 과도한 호출 자제 — 15분~30분 간격 권장)

---

## 3. 관리자 화면 경로

SPA: **`/admin/linkprice`**  
메뉴: 관리자 사이드바 → **링크프라이스 CPS**

기능: 목록/승인·활성·딥링크·검색, 노출·지급률, 수동 동기화, 동기화 로그, 원본 JSON·제한사항.

---

## 4. 동기화 필드

| API → DB | 관리자 전용 (동기화 미덮어씀) |
|----------|------------------------------|
| merchant_id → merchant_code | visible |
| merchant_name, logo, category | partner_rate |
| max_commission_pc/mobile | campaign_alias |
| click_url, deeplink_yn | partner_notice |
| deny_ad, deny_product, notice | is_recommended |
| when_trans, trans_reposition, commission_payment_standard | admin_memo |
| subscript, raw_json, synced_at | |
| sync_active=1 (재등장 시 재활성) | |

신규 광고주: `visible=0` (관리자가 노출 ON 해야 파트너에 표시).

---

## 5. 파트너 노출 조건

`lc_lp_merchant_partner_visible()` — 모두 충족 시만:

1. CPS 캐시 테이블 행 (CPA 미수집)
2. `subscript = APR`
3. `visible = 1`
4. `sync_active = 1`
5. `click_url` 비어 있지 않음

---

## 6. CPA 제외 확인

- 클라이언트 URL에 `/cps` 하드코딩, `/cpa` 문자열 없음
- 동기화 시작 시 URL에 `/cpa` 포함 시 즉시 중단
- 결과 플래그 `cpa_excluded: true`

---

## 7. 사전 준비

1. `plugin/linkconnect/install/linkprice_cps_schema.sql` 적용 (또는 플러그인 로드로 마이그레이션)
2. 관리자 화면에서 A코드 저장 후 **승인 CPS 동기화**
