# 링크커넥트 × 링크프라이스 CPS — 운영 배포 가이드 (8단계)

공식: https://github.com/linkprice/AffiliateSetup  
프로덕션: https://linkconnect.co.kr

CPA(`g5_lc_conversions`, `/r/`, 캠페인 지갑)와 CPS(`g5_lc_lp_*`, `/go/lp/`)는 데이터·URL이 분리되어 있습니다.  
단, 파트너 `pt_balance`는 현재 CPA와 공유되므로 출금 시 CPS 전표(`g5_lc_lp_ledger`)를 함께 확인하세요.

---

## 1. 설치 방법

1. 코드 배포 (GitHub Actions FTP 또는 수동 업로드)
2. 플러그인 부트스트랩이 마이그레이션을 실행: `lc_db_run_migrations()` → `lc_lp_db_ensure_schema()`
3. 수동 스키마 적용(필요 시):

```bash
# MySQL
mysql -u USER -p DB < plugin/linkconnect/install/linkprice_cps_schema.sql
```

4. SPA 빌드 산출물이 `plugin/onoff-builder-bridge/imports/linkconnect/` 에 포함되는지 확인

---

## 2. DB 적용

생성/보장 테이블 (`utf8mb4`, 금액 `decimal(14,2)`):

| 테이블 | 용도 | 주요 UNIQUE |
|--------|------|-------------|
| `g5_lc_lp_networks` | A코드·auth_key | `network_code` |
| `g5_lc_lp_merchants` | CPS 광고주 | `merchant_code` |
| `g5_lc_lp_clicks` | 클릭 | `click_token` |
| `g5_lc_lp_postbacks` | POSTBACK 원본 | — |
| `g5_lc_lp_orders` | 실적 | `trlog_id` |
| `g5_lc_lp_order_status_logs` | 상태 이력 | — |
| `g5_lc_lp_sync_logs` | API 동기화 로그 | — |
| `g5_lc_lp_ledger` | 수익 전표 | `idempotency_key` |

삭제 정책: 광고주 동기화 시 미수신 건은 `sync_active=0` (물리 삭제 없음). 실적·전표는 삭제하지 않고 상태/조정 전표로 보존.

---

## 3. 환경설정

관리자: `/admin/cps/settings`

| 항목 | 설명 |
|------|------|
| A코드 / 제휴 코드 | Affiliate Center 사이트 코드 |
| API 인증키 | 마스킹 저장, 변경 시에만 재입력 |
| POSTBACK Secret | API 활성 시 **필수** (헤더 `X-LP-SECRET` 또는 URL `?secret=`) |
| API 활성 | 켜야 동기화·연결테스트 가능 |
| 테스트 모드 | translist `test=Y` |
| 허용 IP | POSTBACK IP 제한 (권장) |
| 크론 토큰 | settings `lpCronToken` 또는 env `LC_LP_CRON_TOKEN` |

비상으로 Secret 없이 수신하려면 settings `lpPostbackAllowOpen=1` (비권장).

---

## 4. 링크프라이스 인증정보 등록

1. Affiliate Center에서 A코드·auth_key 발급
2. `/admin/cps/settings`에 입력 → 저장 → **연결 테스트**
3. CPS 광고주 제휴 승인(APR) 확인 후 광고주 동기화

---

## 5. POSTBACK URL

```
https://linkconnect.co.kr/api/external/linkprice/postback
https://linkconnect.co.kr/plugin/linkconnect/api/lp_postback.php
```

Secret 사용 시:

```
https://linkconnect.co.kr/api/external/linkprice/postback?secret=YOUR_SECRET
```

또는 헤더: `X-LP-SECRET: YOUR_SECRET`

Affiliate Center → 리워드 API URL에 등록.

---

## 6. 크론 등록

```cron
# 광고주 동기화 — 1일 1회 권장
15 3 * * * cd /path/to/public_html && php cron/linkprice_sync_merchants.php >> /tmp/lp_merchant_cron.log 2>&1

# 실적 동기화 — 15~30분 (공식 과도 호출 자제)
*/20 * * * * cd /path/to/public_html && php cron/linkprice_sync_conversions.php --mode=last7 >> /tmp/lp_order_cron.log 2>&1
```

Web 호출(토큰 필요):

```
/plugin/linkconnect/cron/linkprice_sync_conversions.php?token=TOKEN&mode=last7
```

Lock: flock (`orders` / `merchants`) — 중복 실행 방지.

---

## 7. 권장 동기화 주기

| 작업 | 주기 |
|------|------|
| 광고주 | 일 1회 (또는 수동) |
| 실적 | 15~30분, `--mode=last7` |
| 월 마감 | `--mode=this_month` / `prev_month` |

---

## 8. 장애 시 재처리

| 상황 | 방법 |
|------|------|
| POSTBACK 실패 | `/admin/cps/postbacks` → 재처리 |
| 실적 상태 불일치 | `/admin/cps/orders` 상세 → 수동 재동기화, 또는 크론 `--mode=day --date=YYYYMMDD` |
| 미매칭 | `/admin/cps/unmatched` → 파트너 연결 |
| API 인증 실패 | 설정 재확인 + 연결 테스트 |
| 동기화 Lock 잔류 | 프로세스 종료 후 lock 파일 자동 해제(flock) |

---

## 9. 롤백

1. 크론 비활성화
2. `/admin/cps/settings` → API 비활성
3. Affiliate Center POSTBACK URL 제거/이전
4. 코드: 이전 배포 태그로 FTP 재배포
5. DB: 테이블 DROP은 권장하지 않음. 필요 시 `api_enabled=0`만으로 수신·동기화 중단
6. 잘못 반영된 장부: `g5_lc_lp_ledger` 확인 후 관리자 조정(직접 DELETE 금지, 상쇄 전표)

---

## 10. 로그 위치

| 로그 | 위치 |
|------|------|
| 실적 크론 | `data/linkconnect/lp_order_sync.log` |
| 광고주 크론 | (크론 stdout / 서버 cron log) |
| DB 동기화 | `g5_lc_lp_sync_logs` |
| POSTBACK 원본 | `g5_lc_lp_postbacks` |
| 상태 이력 | `g5_lc_lp_order_status_logs` |
| 관리자 알림 | 알림센터 (`lp_*` 타입) |

URL 로그의 `auth_key`는 `***` 마스킹.

---

## 11. 관리자 사용

사이드바 **CPS 관리** → 하위 탭:

설정 · 광고주 · 클릭 · 실적 · 미매칭 · POSTBACK · 동기화 로그 · 수익 설정 · 정산 내역

수동 확정/금액변경 UI 없음. 재동기화·미매칭 연결만 제공.

---

## 12. 파트너 사용

**CPS 쇼핑** → 광고주 링크 복사 / 딥링크  
**CPS 실적** · **CPS 수익** — 예상 vs 확정·출금가능 구분  
안내 문구: 예상은 변동·취소 가능, 확정만 출금 가능

---

## 13. 배포 전 체크리스트

- [ ] A코드·API 인증키 발급
- [ ] CPS 광고주 제휴 승인(APR)
- [ ] POSTBACK URL + Secret 등록
- [ ] HTTPS 확인
- [ ] 크론 등록 + `lpCronToken`
- [ ] 테스트 클릭 → POSTBACK → 실적 동기화(확정/취소)
- [ ] 장부 CREDIT/REVERSAL 확인 후 실운영 출금 승인

---

## 14. 테스트 명령

```bash
php scripts/test-lp-click.php
php scripts/test-lp-postback.php
php scripts/test-lp-order-sync.php
php scripts/test-lp-cps-ui.php
```
