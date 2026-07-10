# 링크프라이스 CPS — DB·설정 모듈 (2단계)

**범위:** 스키마 + Config/Client/Repository/Logger만.  
**3단계(광고주 동기화·관리자·크론):** [linkprice-cps-merchant-sync.md](./linkprice-cps-merchant-sync.md)  
**원칙:** CPA(`conversions`/`campaigns`/`clicks`)와 완전 분리. 운영 DB 자동 적용 없음.

---

## 1. 생성 파일

| 파일 | 역할 |
|------|------|
| `plugin/linkconnect/inc/linkprice.php` | LinkpriceConfig / Client / Repository / Logger |
| `plugin/linkconnect/inc/db.php` | `lc_lp_db_ensure_schema()` 마이그레이션 훅 |
| `plugin/linkconnect/config.php` | `LC_LP_*` 상수 |
| `plugin/linkconnect/inc/settings.php` | `lp*` 설정 키 + API 마스킹 |
| `plugin/linkconnect/_common.php` | `linkprice.php` 로드 |
| `plugin/linkconnect/install/linkprice_cps_schema.sql` | 수동 적용 SQL |
| `docs/linkprice-cps-db-setup.md` | 본 문서 |

---

## 2. 생성 테이블 (`g5_lc_lp_*`)

| 테이블 | 역할 |
|--------|------|
| `g5_lc_lp_networks` | 외부망 설정 (A코드, auth_key, postback_secret, sync 시각) |
| `g5_lc_lp_merchants` | CPS 광고주 캐시 (`merchant_code` UNIQUE) |
| `g5_lc_lp_clicks` | 클릭 토큰·`u_id`·리다이렉트 URL |
| `g5_lc_lp_postbacks` | POSTBACK 원본 수신 로그 |
| `g5_lc_lp_orders` | CPS 실적 (DECIMAL 금액, `trlog_id` UNIQUE) |
| `g5_lc_lp_order_status_logs` | 실적 상태 변경 이력 |
| `g5_lc_lp_sync_logs` | API 동기화 감사 로그 |

---

## 3. 적용 SQL

운영/스테이징에 **수동** 적용:

```bash
# 접두사가 g5_ 가 아니면 SQL 내 테이블명을 환경에 맞게 수정
mysql -u USER -p linkconnect < plugin/linkconnect/install/linkprice_cps_schema.sql
```

또는 플러그인 페이지를 한 번 로드하면 `lc_db_run_migrations()` → `lc_lp_db_ensure_schema()`가  
`CREATE TABLE IF NOT EXISTS`로 동일 스키마를 생성합니다. (이미 있으면 스킵)

### 롤백

```sql
DROP TABLE IF EXISTS
  `g5_lc_lp_sync_logs`,
  `g5_lc_lp_order_status_logs`,
  `g5_lc_lp_orders`,
  `g5_lc_lp_postbacks`,
  `g5_lc_lp_clicks`,
  `g5_lc_lp_merchants`,
  `g5_lc_lp_networks`;
```

CPA 테이블은 영향 없음.

---

## 4. 환경설정 방법

### A. PHP API (권장)

```php
$result = lc_lp_config_save(array(
    'affiliate_code'       => 'A100xxxxxx',
    'api_auth_key'         => '발급받은_32자_키',
    'postback_secret'      => '자체_웹훅_검증용_시크릿',
    'api_enabled'          => 1,
    'default_partner_rate' => 70,
));
```

- 빈 `api_auth_key` / `postback_secret` 제출 시 **기존 값 유지**
- `lc_lp_config_to_api()`는 키를 마스킹 (`****abcd`)

### B. settings 미러 키

| 키 | 설명 |
|----|------|
| `lpEnabled` | 0/1 |
| `lpAffiliateCode` | A코드 |
| `lpAuthKey` | 실적조회 auth_key (빈 값 저장 시 유지) |
| `lpPostbackSecret` | POSTBACK 검증 시크릿 |
| `lpDefaultPartnerRate` | 파트너 지급률 % |

진실 공급원(source of truth)은 **`g5_lc_lp_networks`**. settings는 관리자 화면 연동용 미러.

### C. u_id 규칙

```
L{pt_id}M{lpm_id}T{16hex}
예) L12M34Tabc123def4567890
```

이메일·전화번호 등 PII 금지.

---

## 5. 모듈 역할

| 논리명 | 함수 prefix | 역할 |
|--------|-------------|------|
| LinkpriceConfig | `lc_lp_config_*` | 설정 CRUD, 마스킹, enabled 판정 |
| LinkpriceClient | `lc_lp_client_*` | 광고주/실적 API HTTP, 클릭 URL 조립 |
| LinkpriceRepository | `lc_lp_repo_*` | 머천트 upsert, 클릭 생성, 주문 조회, 상태 매핑 |
| LinkpriceLogger | `lc_lp_log_*` | sync 로그, 상태 변경 이력 |

---

## 6. 테스트 방법 (로컬/스테이징)

1. **스키마**
   ```sql
   SHOW TABLES LIKE 'g5_lc_lp_%';
   SELECT * FROM g5_lc_lp_networks;
   ```

2. **설정 저장**
   ```php
   // 그누보드 부트스트랩 후
   var_export(lc_lp_config_save(array(
     'affiliate_code' => 'A100000131',
     'api_auth_key' => 'test-key',
     'api_enabled' => 0, // 실호출 전엔 0
   )));
   var_export(lc_lp_config_to_api()); // auth 마스킹 확인
   ```

3. **광고주 API (키·A코드 준비 후)**
   ```php
   $r = lc_lp_client_fetch_merchants('apr', true);
   // $r['ok'], count($r['data'])
   ```

4. **클릭 토큰**
   ```php
   // 테스트용 pt_id / lpm_id 필요 (머천트 1건 upsert 후)
   $c = lc_lp_repo_create_click(1, 1, '');
   // $c['click']['u_id'], redirect_url 에 u_id 포함 여부
   ```

5. **실적 API 더미**
   ```php
   $r = lc_lp_client_fetch_orders(date('Ymd'), array('test' => 'Y'));
   ```

---

## 7. 다음 단계 예고

- `api/lp_receive.php` POSTBACK 수신
- 머천트/실적 sync 크론
- 관리자·파트너 UI
- 배포 번들에 `inc/linkprice.php` 포함
