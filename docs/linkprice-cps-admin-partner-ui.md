# 링크프라이스 CPS — 관리자·파트너 화면 (7단계)

CPA 메뉴/데이터와 분리. 기존 디자인·반응형 유지.

## 관리자 메뉴: CPS 관리 (`/admin/cps/*`)

| 경로 | 화면 |
|------|------|
| `/admin/cps/settings` | 링크프라이스 설정 |
| `/admin/cps/merchants` | CPS 광고주 관리 |
| `/admin/cps/clicks` | CPS 클릭 통계 |
| `/admin/cps/orders` | CPS 실적 관리 |
| `/admin/cps/unmatched` | 미매칭 실적 |
| `/admin/cps/postbacks` | POSTBACK 로그 |
| `/admin/cps/sync-logs` | API 동기화 로그 |
| `/admin/cps/rates` | 파트너 수익 설정 |
| `/admin/cps/settlements` | CPS 정산 내역 |

레거시 통합 화면: `/admin/linkprice` (유지)

### 설정 화면
- A코드, API 인증키(마스킹·변경 시에만 입력), POSTBACK Secret, API 활성, 테스트 모드, 허용 IP
- 마지막 광고주/실적 동기화, 연결 테스트

### 실적 관리
- 필터: 발생일·확정일·광고주·파트너·주문·상품·상태·미매칭
- 상세: 원본 JSON, 상태 이력, 클릭 정보, 수동 재동기화, 미매칭 파트너 연결, CSV
- **수동 확정/금액변경 UI 없음** (최고관리자 감사로그 절차만 문서화)

## 파트너 메뉴 (`/partner/cps/*`)

| 경로 | 화면 |
|------|------|
| `/partner/cps` | CPS 광고주 + 대시보드 요약 |
| `/partner/cps/links` | 내 홍보링크 |
| `/partner/cps/clicks` | 클릭 현황 |
| `/partner/cps/orders` | CPS 실적 |
| `/partner/cps/earnings` | 수익 현황 |

모든 API 조회에 세션 `pt_id` 강제. 요청 `ptId`/`lpoId` 변조 시 타 파트너 데이터 불가.

예상수익 vs 확정·출금가능수익 구분 표시 + CPS 안내 문구 고정 노출.

## 권한·보안

| 항목 | 처리 |
|------|------|
| 일반회원 관리자 차단 | `AdminRouteGuard` + `lc_api_require_admin` |
| 파트너 간 조회 차단 | `pt_id` WHERE 강제 |
| URL ID 변조 | 파트너 order 상세 `AND pt_id = 세션` |
| CSRF | 파트너 POST Origin/Referer 검사 |
| XSS | React 텍스트 이스케이프 (dangerouslySetInnerHTML 미사용) |
| CSV 수식 삽입 | `lc_lp_csv_safe` (`=` `+` `-` `@` 접두 `'` ) |
| 인증키 노출 | `apiAuthKeyMasked` / password 입력·빈값 시 유지 |

## API

- Admin: `plugin/linkconnect/admin/api/linkprice.php` — views `orders`, `order`, `clicks`, `ledger`, actions `test_connection`, `link_partner`
- Partner: `plugin/linkconnect/partner/api/linkprice.php` — views `dashboard`, `clicks`, `orders`, `order`, `earnings`

## 테스트

```bash
php scripts/test-lp-cps-ui.php
php scripts/test-lp-order-sync.php
```
