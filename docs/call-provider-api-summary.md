# LinkConnect 콜디비 연동 요약 (콜업체용)

**버전:** 1.0 · **일자:** 2026-07-09  
**상세 명세:** [call-provider-api-integration.md](./call-provider-api-integration.md)

---

## 1. 연동 개요

LinkConnect는 CPA 제휴마케팅 플랫폼입니다. 파트너에게 배정된 **가상번호(050 등)** 로 들어온 전화를 추적하고, 조건 충족 시 **CPA DB(전환)** 로 자동 적재합니다.

| 방향 | 내용 | 필수 |
|------|------|:----:|
| **콜업체 → LinkConnect** | 통화 종료 후 웹훅 POST | ✅ |
| **LinkConnect → 콜업체** | 가상번호 발급·착신 라우팅·녹취 조회 REST | ✅ (자동 발급 시) |

**운영 도메인:** `https://linkconnect.co.kr`

---

## 2. 사전 준비 (상호 교환)

LinkConnect 관리자센터 **설정 → 콜디비 · 콜업체 연동**에서 아래 값을 교환합니다.

| 설정키 | 용도 |
|--------|------|
| `callWebhookToken` | 콜업체 → LinkConnect 웹훅 인증 |
| `callApiBaseUrl` | LinkConnect → 콜업체 REST Base URL |
| `callApiKey` | LinkConnect → 콜업체 API 인증 |

---

## 3. 웹훅 (필수) — 통화 종료 시 1회 POST

**URL:** `POST https://linkconnect.co.kr/plugin/linkconnect/api/call_receive.php`  
**Content-Type:** `application/json`

### 인증 (택 1)

```
X-CALL-TOKEN: {callWebhookToken}
```

또는 JSON body `"token": "..."`  
(토큰 미설정 시 LinkConnect 발급 `X-API-KEY` 사용)

### 필수·권장 필드

| 필드 | 필수 | 설명 |
|------|:----:|------|
| `virtualNumber` | ✅ | 착신 가상번호 (`calledNumber`, `did` alias 가능) |
| `providerCallId` | 권장 | 통화 고유 ID (중복 방지) |
| `caller` | 권장 | 발신(고객) 번호 |
| `duration` | 권장 | 통화 시간(초), 부재중 시 `0` |
| `result` | 권장 | `success` / `missed` / `busy` / `fail` |
| `startedAt` | 권장 | ISO8601 또는 `Y-m-d H:i:s` |
| `recordingUrl` | 선택 | 녹취 URL |

### 요청 예시

```json
{
  "providerCallId": "CALL-20260709-001234",
  "virtualNumber": "050-7123-4567",
  "caller": "010-9876-5432",
  "startedAt": "2026-07-09T14:22:33+09:00",
  "duration": 127,
  "result": "success",
  "recordingUrl": "https://record.example.com/files/abc123.mp3"
}
```

### 응답

- **200 + `"success": true`** — 통화 기록 완료 (`call_log_id`, DB 생성 시 `db_code` 포함)
- **401** — 인증 실패
- 동일 `providerCallId` 재전송 → `"이미 수신된 통화입니다."` (200)

> **DB 생성 조건:** `result=success` + 최소 통화시간(기본 60초, 관리자 설정) 충족 + 해당 가상번호에 배정된 파트너·캠페인 존재

---

## 4. LinkConnect → 콜업체 REST (자동 발급·라우팅 시)

Base URL = `callApiBaseUrl`, 인증 = `callApiKey` (헤더명은 콜업체와 협의)

| Method | Path | 용도 |
|--------|------|------|
| POST | `/virtual-numbers` | 가상번호 발급 |
| POST | `/virtual-numbers/{id}/route` | 착신번호 라우팅 등록 |
| GET | `/recordings/{id}` | 녹취 URL 조회 |

상세 Request/Response는 [전체 명세](./call-provider-api-integration.md) Part 2 참고.

---

## 5. 연동 체크리스트

- [ ] `callWebhookToken` 교환 및 스테이징/운영 URL 확인
- [ ] 통화 **종료 후** 웹훅 1회 전송 (통화 중 실시간 불필요)
- [ ] `providerCallId` 중복 전송 방지
- [ ] `virtualNumber` ↔ LinkConnect 배정 번호 일치 확인
- [ ] 최소 통화시간 미달·부재중 시 DB 미생성 동작 확인
- [ ] (자동 발급 시) REST API Base URL·Key 및 3개 엔드포인트 제공

---

## 6. 테스트

로컬/스테이징에서 아래 스크립트로 웹훅을 검증할 수 있습니다.

```bash
CALL_WEBHOOK_TOKEN=your-token \
VIRTUAL_NUMBER=050-7123-4567 \
./scripts/test-call-webhook.sh
```

---

## 7. 문의

LinkConnect 운영팀 — 연동 착수 시 관리자센터에서 테스트 가상번호·캠페인 정보를 함께 전달합니다.
