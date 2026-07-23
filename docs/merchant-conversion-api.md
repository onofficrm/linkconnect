# 광고주 디비 검수 API (v1)

광고주가 **자체 CRM/플랫폼**에서 LinkConnect 디비를 조회하고 승인·취소할 때 사용합니다.  
센터 UI(`merchant/api/conversions.php`)와 **동일한 비즈니스 로직**(`lc_conversion_update_status`)을 호출합니다.

**Base URL:** `https://{도메인}/plugin/linkconnect/api/v1/merchant/conversions.php`  
**스펙 버전:** 1.0 · 2026-07-23

---

## 1. 사전 준비

1. 관리자센터 **API 연동 관리** → **광고주 검수 API**에서 광고주 선택 후 Key 발급
2. 키 형식: `sk_mt_...` (`ac_type=merchant`, `ac_mt_id` 바인딩)
3. 가능하면 **허용 IP**를 등록합니다 (등록 시 해당 IP만 호출 가능)

---

## 2. 인증

아래 중 하나:

```http
Authorization: Bearer sk_mt_xxxxxxxx
```

```http
X-API-KEY: sk_mt_xxxxxxxx
```

Content-Type: `application/json` (POST)

---

## 3. 엔드포인트

### 3.1 목록 조회

`GET .../conversions.php?status=pending&limit=50`

| 파라미터 | 설명 |
|----------|------|
| `status` | `pending` / `approved` / `rejected` |
| `needs_action` | `1` 이면 미처리만 |
| `q` | 이름·전화·코드 검색 |
| `limit` | 1~200 (기본 50) |

### 3.2 단건 조회

`GET .../conversions.php?code=CV-xxxxxxx`

### 3.3 승인

```http
POST .../conversions.php
```

```json
{
  "action": "approve",
  "code": "CV-xxxxxxx",
  "comment": "상담 예약 완료",
  "qualityScore": 5,
  "qualityTags": ["상담예약"],
  "partnerVisible": true
}
```

### 3.4 취소/무효

```json
{
  "action": "reject",
  "code": "CV-xxxxxxx",
  "reason": "연락불가",
  "comment": "3회 부재",
  "partnerVisible": true
}
```

**허용 reason:** `연락불가`, `중복디비`, `장난접수`, `조건불일치`, `지역불가`, `이미상담`, `기타`

---

## 4. 응답 형식

성공:

```json
{
  "ok": true,
  "data": {
    "items": [ /* conversion */ ],
    "total": 1,
    "summary": { "pending": 3, "approved": 10, "rejected": 2 },
    "rejectReasons": ["연락불가", "..."]
  }
}
```

단건/처리 시 `data.conversion` 객체.

실패:

```json
{
  "ok": false,
  "error": "메시지",
  "code": "INSUFFICIENT_BALANCE"
}
```

주요 `code`:

| code | 의미 |
|------|------|
| `UNAUTHORIZED` | 키 없음/잘못됨/IP 거부 |
| `FORBIDDEN` | merchant 키 아님·타 광고주 디비 |
| `NOT_FOUND` | 코드 없음 |
| `INVALID_REASON` | 취소 사유 누락/비허용 |
| `INSUFFICIENT_BALANCE` | 승인 시 광고비 부족 |
| `UPDATE_FAILED` | 이미 잠금 등 |

이미 처리된 디비에 승인/취소를 다시 호출하면 **200 + `alreadyProcessed: true`** 와 현재 상태를 반환합니다(멱등).

---

## 5. conversion 필드

| 필드 | 설명 |
|------|------|
| `code` | 디비 코드 (외부 식별자) |
| `status` | `pending` / `approved` / `rejected` |
| `name`, `phone`, `email`, `region`, `inquiry` | 고객 정보 |
| `campaign`, `campaignId` | 광고상품 |
| `price` | 건당 단가 |
| `channel`, `subId` | 유입 |
| `needsAction` | 미처리 여부 |
| `finalLocked` | 관리자 최종잠금 |

파트너 실명 등은 노출하지 않습니다.

---

## 6. curl 예시

```bash
BASE="https://linkconnect.co.kr/plugin/linkconnect/api/v1/merchant/conversions.php"
KEY="sk_mt_your_key"

# 미처리 목록
curl -sS -H "Authorization: Bearer $KEY" "$BASE?status=pending&limit=20"

# 승인
curl -sS -X POST -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"action":"approve","code":"CV-xxxxxxx","comment":"상담완료"}' "$BASE"

# 취소
curl -sS -X POST -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"action":"reject","code":"CV-xxxxxxx","reason":"연락불가","comment":"부재"}' "$BASE"
```

---

## 7. 주의사항

- 승인 시 LinkConnect에서 **광고비 차감·파트너 적립**이 일어납니다. 광고주 시스템에만 상태를 바꾸면 정산이 어긋납니다.
- `pending`만 승인/취소 가능합니다. 관리자 최종잠금 건은 거부됩니다.
- Webhook(신규 디비 푸시)은 이후 버전에서 추가할 수 있습니다. 현재는 폴링(`status=pending`)을 사용하세요.
