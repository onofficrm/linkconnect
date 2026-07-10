# 링크프라이스 CPS — 실적 확정·취소 동기화 (6단계)

공식: [실적 조회 오픈 API v1.6](https://github.com/linkprice/AffiliateSetup/blob/master/docs/%EC%8B%A4%EC%A0%81_%EC%A1%B0%ED%9A%8C_%EC%98%A4%ED%94%88_API_v1.6.md)

## 공식 API 요약

| 항목 | 내용 |
|------|------|
| 주소 | `https://api.linkprice.com/affiliate/translist.php` |
| 인증 | Query `a_id` + `auth_key` + `yyyymmdd` |
| 조회 기간 | 일(`YYYYMMDD`) 또는 월(`YYYYMM`) |
| 페이지네이션 | `page`, `per_page` (기본 1000) |
| 권장 주기 | 과도 호출 자제 (15~30분, 일/월 재조회) |

### 상태코드 (raw_status에 원본 저장)

| LP status | 의미 | 링크커넥트 `lc_status` |
|-----------|------|------------------------|
| 100 | 일반 | `pending` |
| 200 | 정산대기 | `review` |
| 210 | 정산완료(확정) | `approved` |
| 300 | 취소신청 | `cancel_pending` |
| 310 | 취소완료 | `canceled` |
| (기타) | 미정의 | `error` (+ 알림) |

매핑 구현: `lc_lp_status_map()` in `plugin/linkconnect/inc/linkprice.php`

하위호환 별칭: `expected`≈pending, `confirmed`≈approved, `cancelled`≈canceled

## 크론

```bash
# 최근 7일 (권장)
php cron/linkprice_sync_conversions.php --mode=last7

# 특정일
php cron/linkprice_sync_conversions.php --mode=day --date=20260709

# 이번 달 / 이전 달 (월 단위 YYYYMM)
php cron/linkprice_sync_conversions.php --mode=this_month
php cron/linkprice_sync_conversions.php --mode=prev_month
php cron/linkprice_sync_conversions.php --mode=month --date=202606

# 광고주·주문 필터
php cron/linkprice_sync_conversions.php --mode=last7 --merchant=shopA --order=ORD123

# Web (토큰 필요)
# GET /plugin/linkconnect/cron/linkprice_sync_conversions.php?token=...&mode=last7
```

- Lock: `orders` (중복 실행 방지)
- 로그: `data/linkconnect/lp_order_sync.log` + `g5_lc_lp_sync_logs`
- 한 날짜/한 건 실패해도 전체 중단하지 않음

## 매칭 우선순위

1. `trlog_id`
2. `uniq_id` (POSTBACK 연계)
3. `merchant_code` + `order_code` + `product_code` + `u_id`

## 수익금(장부) 반영

테이블: `g5_lc_lp_ledger` (`UNIQUE idempotency_key`)

| 상황 | 처리 |
|------|------|
| 예상(100/200) | 장부 미반영 (`partner_confirmed=0`) |
| 확정(210) | `partner_confirmed` 갱신 + CREDIT (차액) |
| 확정 전 취소(310) | 예상수익 0, 장부 없음 |
| 확정 후 취소 | REVERSAL, `cancelled_at` 저장, 알림 |
| 커미션 증가/감소 | 차액 CREDIT / DEBIT |
| 동일 동기화 반복 | unchanged + 동일 idempotency_key로 중복 전표 방지 |

파트너 잔액: `pt_balance`에 원 단위 정수 델타 반영 (CPA 지갑과 분리)

## 관리자 재동기화

`/admin/linkprice` → **실적 동기화** 탭

- 최근 7일 / 오늘 / 이번 달 / 이전 달
- 특정일(YYYYMMDD), 광고주·주문번호 필터
- API: `POST admin/api/linkprice.php` `action=sync_orders` / `sync_order_one`

## 알림 타입

`lp_auth_fail`, `lp_sync_fail`, `lp_unmatched`, `lp_cancel_after_confirm`, `lp_commission_change`, `lp_negative_commission`, `lp_unknown_status`, `lp_schema_change`

## 테스트

```bash
php scripts/test-lp-order-sync.php
```

시나리오: 대기→확정, 대기→취소, 확정→취소, 커미션±, 멱등 재동기화, trlog 재등록, API 부분실패, 페이지네이션, 월 경계
