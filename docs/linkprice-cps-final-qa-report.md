# 링크커넥트 × 링크프라이스 CPS — 8단계 최종 검수 보고

검수일: 2026-07-10  
범위: 1~7단계 구현물 코드·스키마·테스트 실측 (추측 완료 처리 없음)

---

## 완료된 기능

1. CPS 전용 DB·설정 (`g5_lc_lp_*`, CPA 분리)
2. CPS 광고주 API 동기화 (`/cps` only)
3. 파트너 홍보 URL `/go/lp/` + 클릭 추적·딥링크·Open Redirect 차단
4. POSTBACK(Reward API) 수신 → 예상 실적
5. translist 실적 동기화(확정/취소/금액변경) + 장부
6. 관리자 CPS 화면 9종 + 파트너 CPS 화면 5종
7. 크론·배포 파이프라인·운영 문서

---

## 수정된 파일 (8단계 검수 중)

| 파일 | 내용 |
|------|------|
| `plugin/linkconnect/inc/linkprice.php` | 장부 INSERT-우선(레이스 수정), POSTBACK Secret 필수(API 활성 시), click secret 하드코딩 제거, link_partner CREDIT, REVERSAL 명시 |
| `plugin/linkconnect/admin/api/linkprice.php` | 관리자 POST CSRF(Origin/Referer) |
| `plugin/linkconnect/partner/api/linkprice.php` | CSRF fail-closed |
| `.github/workflows/deploy.yml` | `partner/api/_common.php` 및 `*.php` 복사 |
| `builder/.../PartnerCpsOrders.tsx` | activeMenu `cps-orders` |
| `builder/.../PartnerCpsEarnings.tsx` | activeMenu `cps-earnings` |

---

## 생성된 파일 (문서·테스트)

| 파일 |
|------|
| `docs/linkprice-cps-ops-deploy.md` |
| `docs/linkprice-cps-admin-partner-ui.md` (7단계) |
| `docs/linkprice-cps-order-sync.md` (6단계) |
| `scripts/test-lp-cps-ui.php` |

(1~7단계 생성분: schema, cron, go/lp, postback, Admin/Partner CPS pages 등 — 상세는 각 단계 문서)

---

## 생성·변경 테이블

`g5_lc_lp_networks`, `g5_lc_lp_merchants`, `g5_lc_lp_clicks`, `g5_lc_lp_postbacks`, `g5_lc_lp_orders`, `g5_lc_lp_order_status_logs`, `g5_lc_lp_sync_logs`, `g5_lc_lp_ledger`  
UNIQUE: `trlog_id`, `idempotency_key`, `merchant_code`, `click_token`  
금액: `decimal(14,2)` · charset: `utf8mb4`

---

## 발견한 문제 → 수정한 문제

| 심각도 | 문제 | 조치 |
|--------|------|------|
| CRITICAL | 장부: `pt_balance` 갱신 후 INSERT → UNIQUE 레이스 시 잔액만 이중 반영 | INSERT 성공 후에만 잔액 갱신 |
| HIGH | API 활성인데 POSTBACK Secret 없으면 개방 | Secret 필수(비상 `lpPostbackAllowOpen`) |
| HIGH | 관리자 POST CSRF 없음 | Origin/Referer 검사 |
| HIGH | 파트너 CSRF Origin/Referer 없으면 통과 | fail-closed |
| HIGH | 미매칭 파트너 연결 시 CREDIT 누락 | `lc_lp_order_link_partner`에서 확정분 CREDIT |
| HIGH | deploy에 `partner/api/_common.php` 누락 | deploy.yml 수정 |
| MEDIUM | click HMAC 고정 문자열 | 설치별 파생 해시 |
| MEDIUM | REVERSAL이 reason 문자열에만 의존 | entry_type override |
| LOW | 파트너 사이드바 activeMenu 불일치 | 수정 |

---

## 아직 확인이 필요한 항목

1. **`pt_balance` CPA 공유** — CPS CREDIT이 CPA 출금 잔액에 합산됨. 장기적으로 CPS 전용 잔액/출금 분리 검토.
2. **실서버 POSTBACK IP allowlist** — LP 발신 IP를 Affiliate Center에 확인 후 등록.
3. **실주문 E2E** — 스테이징에서 실제 LP 테스트 주문·확정·취소 1회.
4. **관리자 CSV** — 세션 쿠키로 다운로드; SPA `credentials`와 동일 오리진 확인.
5. **파트너 POST CSRF** — 브라우저 fetch는 Origin 자동 전송. 구형 클라이언트/앱 웹뷰 검증.
6. **CPA 회귀** — 코드상 `conversion.php`/`wallet.php`에 LP 참조 없음. 실서버에서 CPA 전환·정산 스모크 권장.

---

## 링크프라이스 측에 요청할 항목

1. A코드·auth_key 발급 및 CPS 머천트 APR
2. 리워드(POSTBACK) URL 등록 + 재전송 정책 안내
3. POSTBACK 발신 IP 대역 (allowlist용)
4. 배치/미배치 정산 방식(해당 머천트) — trlog 재생성 시 매칭 확인
5. 테스트 모드(`test=Y`) 사용 가능 여부

---

## 운영 배포 순서

1. DB 마이그레이션/스키마 적용  
2. 코드·SPA 배포  
3. `/admin/cps/settings` — A코드·auth_key·Secret·API 활성  
4. 연결 테스트 → 광고주 동기화  
5. Affiliate Center POSTBACK URL(+secret) 등록  
6. 크론 등록 (광고주 일1회, 실적 20분)  
7. 테스트 클릭 → POSTBACK → 실적 동기화(확정/취소)  
8. 장부 확인 후 실운영  

상세: [docs/linkprice-cps-ops-deploy.md](linkprice-cps-ops-deploy.md)

---

## 롤백 순서

1. 크론 중지  
2. API 비활성 + POSTBACK URL 제거  
3. 이전 빌드 재배포  
4. DB 테이블은 유지(DROP 금지), 필요 시 상쇄 전표  

---

## 최종 테스트 결과

| 스위트 | 결과 |
|--------|------|
| `php scripts/test-lp-click.php` | **19 PASS** |
| `php scripts/test-lp-postback.php` | **21 PASS** |
| `php scripts/test-lp-order-sync.php` | **37 PASS** |
| `php scripts/test-lp-cps-ui.php` | **9 PASS** |
| PHP lint (linkprice/cron/postback/go) | **OK** |
| CPA 코드 교차참조 (`conversion`/`wallet` ↔ LP) | **참조 없음** |

총 **86 PASS / 0 FAIL** (단위·시나리오 스텁 기준). 실서버 E2E는 체크리스트 항목으로 남김.
