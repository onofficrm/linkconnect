# LinkConnect × 콜디비 솔루션 API 연동 명세

**문서 버전:** 1.0  
**작성일:** 2026-07-09  
**대상:** 콜디비(050/가상번호) 솔루션 업체  
**플랫폼:** [LinkConnect](https://linkconnect.co.kr) CPA/CPS 제휴마케팅

---

## 1. 개요

LinkConnect는 CPA 광고주·파트너·관리자 센터를 운영하는 플랫폼입니다.  
**콜디비(Call DB)** 기능은 파트너에게 배정된 **가상번호**로 유입된 전화를 추적하고, 조건을 충족하면 **CPA DB(전환)** 로 자동 적재합니다.

연동은 **양방향**입니다.

| 방향 | 설명 | 우선순위 |
|------|------|----------|
| **콜업체 → LinkConnect** | 통화 종료 시 **웹훅**으로 통화 결과 전송 | **필수** |
| **LinkConnect → 콜업체** | 가상번호 발급·착신 라우팅·녹취 URL 조회 REST API | **필수** (자동 발급/라우팅 사용 시) |

> 수동으로 가상번호·착신을 운영하는 경우, 웹훅(Part 1)만 먼저 연동해도 DB 적재는 가능합니다.

---

## 2. 연동 흐름

```
[고객] ──전화──▶ [가상번호(050)] ──착신──▶ [광고주 착신번호]
                        │
                        │ 통화 종료
                        ▼
              [콜업체] ──POST 웹훅──▶ [LinkConnect call_receive.php]
                        │
                        ├─ 통화로그 저장
                        └─ 조건 충족 시 CPA DB(conversion) 생성

[LinkConnect 관리자] ──REST──▶ [콜업체 API]
  · 가상번호 발급 (POST /virtual-numbers)
  · 착신 라우팅 등록 (POST /virtual-numbers/{id}/route)
  · 녹취 URL 조회 (GET /recordings/{id})
```

### 역할 분담

| 주체 | 역할 |
|------|------|
| **광고주** | 캠페인별 콜디비 ON/OFF, 착신번호1·2, 상품 별칭 설정 |
| **파트너** | 캠페인별 가상번호 신청 → 관리자 배정 후 랜딩/홍보에 노출 |
| **관리자** | 번호풀 관리, 신청 배정/반려, 녹음·콜설정, 콜DB 최종 승인 |
| **콜업체** | 가상번호 제공, 착신 연결, 통화·녹취 이벤트 웹훅 전송 |

---

## 3. 환경 정보

| 항목 | 값 |
|------|-----|
| 운영 도메인 | `https://linkconnect.co.kr` |
| 통화 웹훅 수신 URL | `https://linkconnect.co.kr/plugin/linkconnect/api/call_receive.php` |
| Content-Type | `application/json; charset=utf-8` |
| HTTP Method | `POST` |
| 콜업체 API Base URL | LinkConnect 관리자센터에 설정 (예: `https://api.{콜업체-domain}/v1`) |

연동 테스트 전, LinkConnect 관리자센터 **설정 → 콜디비 · 콜업체 연동**에서 아래 값을 상호 교환합니다.

- `callApiBaseUrl` — 콜업체 REST API 주소
- `callApiKey` — LinkConnect → 콜업체 호출 시 사용
- `callWebhookToken` — 콜업체 → LinkConnect 웹훅 인증 토큰

---

## 4. Part 1 — 콜업체 → LinkConnect (통화 웹훅) 【필수】

통화가 **종료**(또는 부재중·실패 등 최종 상태 확정)된 시점에 LinkConnect로 POST합니다.  
**실시간(통화 중) 전송은 불필요**하며, 종료 후 1회 전송을 권장합니다.

### 4.1 인증

다음 중 **하나**를 사용합니다 (LinkConnect 관리자가 `callWebhookToken` 설정 시 1번 권장).

#### 방법 A — 웹훅 토큰 (권장)

```
X-CALL-TOKEN: {callWebhookToken}
```

또는 JSON body:

```json
{ "token": "{callWebhookToken}", ... }
```

#### 방법 B — API 클라이언트 키 (토큰 미설정 시)

LinkConnect에 사전 등록된 API Key:

```
X-API-KEY: {발급받은 API Key}
```

또는 body: `"api_key": "..."`

인증 실패 시 `401` + `{ "success": false, "error": "인증 실패", "code": 401 }`

### 4.2 Request Body

| 필드 | 타입 | 필수 | 설명 | LinkConnect 수용 alias |
|------|------|:----:|------|------------------------|
| `providerCallId` | string | **권장** | 콜업체 통화 고유 ID (중복 방지) | `callId` |
| `virtualNumber` | string | **필수** | 착신된 가상번호 (050 등) | `calledNumber`, `did` |
| `caller` | string | 권장 | 발신(고객) 번호 | `from`, `callerNumber` |
| `callee` | string | 선택 | 실제 착신된 번호 | `to` |
| `startedAt` | string | 권장 | 통화 시작 시각 (ISO8601 또는 `Y-m-d H:i:s`) | `startTime`, `calledAt` |
| `duration` | integer | **권장** | 통화 시간(초). 부재중·실패 시 `0` | `durationSec` |
| `result` | string | **권장** | 통화 결과 (아래 표 참고) | `status` |
| `recordingUrl` | string | 선택 | 녹취 파일 URL (있을 경우) | `recordUrl` |
| `recordingId` | string | 선택 | 녹취 ID (URL 대신 ID만 제공 시) | `recordId` |

#### `result` 값 매핑

콜업체 값 → LinkConnect 내부 정규화:

| 콜업체 전송값 (예) | LinkConnect | DB 생성 |
|-------------------|-------------|---------|
| `success`, `answered`, `completed`, `connect` | `success` | 조건부 생성 |
| `missed`, `noanswer`, `no-answer` | `missed` | 기본 제외* |
| `busy` | `busy` | 생성 안 함 |
| `fail`, `failed`, `canceled` | `fail` | 생성 안 함 |

\* LinkConnect 전역 설정 `callCreateOnMissed=1` 시 부재중도 DB 생성 가능

`result` 미전송 시: `duration > 0` → success, 그 외 → missed 로 처리

#### 번호 형식

- 하이픈 포함 가능 (`010-1234-5678`)
- LinkConnect는 숫자만 추출해 저장

### 4.3 Request 예시

```http
POST /plugin/linkconnect/api/call_receive.php HTTP/1.1
Host: linkconnect.co.kr
Content-Type: application/json
X-CALL-TOKEN: your-webhook-token-here

{
  "providerCallId": "CALL-20260709-001234",
  "virtualNumber": "050-7123-4567",
  "caller": "010-9876-5432",
  "callee": "010-1111-2222",
  "startedAt": "2026-07-09T14:22:33+09:00",
  "duration": 127,
  "result": "success",
  "recordingUrl": "https://record.example.com/files/abc123.mp3",
  "recordingId": "REC-abc123"
}
```

### 4.4 Response

#### 성공 (200)

```json
{
  "success": true,
  "message": "통화 기록 및 콜DB 전환이 생성되었습니다.",
  "call_log_id": 42,
  "db_code": "DB260709-A1B2"
}
```

| 필드 | 설명 |
|------|------|
| `call_log_id` | LinkConnect 통화로그 ID |
| `db_code` | CPA DB 접수 코드 (전환 생성된 경우) |

#### 통화만 기록, DB 미생성 (200)

```json
{
  "success": true,
  "message": "통화 기록됨 (전환 생성 제외: 최소 통화시간 미달(45s/60s))",
  "call_log_id": 43
}
```

#### 중복 통화 (200)

동일 `providerCallId` 재전송 시:

```json
{
  "success": true,
  "message": "이미 수신된 통화입니다.",
  "call_log_id": 42
}
```

#### 인증 실패 (401)

```json
{
  "success": false,
  "error": "인증 실패",
  "code": 401
}
```

#### 검증 실패 (400)

```json
{
  "success": false,
  "message": "가상번호(virtualNumber)가 필요합니다."
}
```

### 4.5 CPA DB 자동 생성 조건

LinkConnect는 웹훅 수신 후 아래를 **모두** 만족할 때 `conversions` 테이블에 DB를 생성합니다.

1. `virtualNumber`가 **파트너에게 배정된 활성 가상번호**와 일치
2. 해당 캠페인 **광고주 콜디비 ON** (`cs_enabled = 1`)
3. 해당 캠페인 **관리자 콜설정 활성** (`cs_admin_enabled = 1`)
4. **통화성공** (`result → success`) 이고, `duration ≥ cs_min_duration` (캠페인별 최소 통화시간, 0이면 무시)
5. 부재중·실패·통화중은 기본적으로 DB 생성 **안 함**

생성된 DB:

- `cv_source = call` (콜디비)
- `cv_channel = 콜디비`
- `cv_status = pending` (광고주 승인 대기)
- 단가: 캠페인 콜설정 `cs_price` → 없으면 캠페인 `cp_price`

### 4.6 재시도 정책 (콜업체 권장)

| HTTP | 처리 |
|------|------|
| 200 | 성공 — 재전송 불필요 |
| 401 | 인증 오류 — 토큰 확인 후 재시도 |
| 400 | 필드 오류 — payload 수정 후 재시도 |
| 5xx / timeout | **지수 백오프** 재시도 권장 (최대 24시간, `providerCallId` 동일 유지) |

---

## 5. Part 2 — LinkConnect → 콜업체 (REST API) 【자동 연동 시 필수】

LinkConnect는 아래 REST API를 **콜업체 Base URL**에 대해 호출합니다.  
콜업체는 **동일 경로·스펙**을 제공하거나, 차이가 있으면 **매핑표**를 LinkConnect에 전달해 주세요.

### 5.1 공통

| 항목 | 값 |
|------|-----|
| Base URL | 관리자 설정 `callApiBaseUrl` |
| Content-Type | `application/json` |
| Accept | `application/json` |
| 인증 헤더 | `X-API-KEY: {callApiKey}` **및** `Authorization: Bearer {callApiKey}` |

> LinkConnect는 두 헤더를 동시에 전송합니다. 콜업체는 **하나만** 지원해도 됩니다.

성공: HTTP **2xx**  
실패: HTTP **4xx/5xx** + JSON `{ "message": "..." }` (권장)

---

### 5.2 가상번호 발급

관리자가 「콜업체 API 자동 발급」 실행 시 호출됩니다.

```
POST {baseUrl}/virtual-numbers
```

#### Request

```json
{
  "areaCode": "02",
  "memo": "LinkConnect pool"
}
```

| 필드 | 필수 | 설명 |
|------|:----:|------|
| `areaCode` | 선택 | 지역/번호대 코드 |
| `memo` | 선택 | 메모 |

#### Response (200)

LinkConnect는 아래 필드 중 **하나 이상**을 읽습니다.

```json
{
  "id": "VN-12345",
  "number": "05071234567"
}
```

| LinkConnect 수용 필드 | 설명 |
|----------------------|------|
| `number` / `virtualNumber` / `phone` | 발급된 가상번호 |
| `id` / `numberId` | 콜업체 측 번호 ID (라우팅 API에 사용) |

---

### 5.3 착신 라우팅 등록

파트너에게 가상번호 **배정** 시 호출됩니다.  
해당 가상번호로 전화가 오면 지정 착신번호로 연결되어야 합니다.

```
POST {baseUrl}/virtual-numbers/{providerNumberId}/route
```

`{providerNumberId}` = 발급 API 응답의 `id` (LinkConnect DB `cn_provider_number_id`)

#### Request

```json
{
  "forward1": "01012345678",
  "forward2": "01087654321",
  "recordingMode": "normal",
  "coloring": "",
  "ment": "LinkConnect 상담 연결 중입니다."
}
```

| 필드 | 설명 |
|------|------|
| `forward1` | 1차 착신번호 (광고주 설정) |
| `forward2` | 2차 착신번호 (1차 부재 시) |
| `recordingMode` | `none` / `normal` / `split` (미사용·일반·수발신분리) |
| `coloring` | 컬러링 ID 또는 URL |
| `ment` | 착신 멘트 |

#### Response (200)

```json
{
  "ok": true,
  "message": "route updated"
}
```

> 라우팅 변경(광고주 착신번호 수정) 시 **동일 API 재호출**이 필요합니다.  
> 콜업체에서 PATCH/PUT 별도 API를 쓰는 경우 LinkConnect에 경로를 알려주세요.

---

### 5.4 녹취 URL 조회

웹훅에 `recordingUrl`이 없고 `recordingId`만 있는 경우, 관리자 녹취 재생 시 호출됩니다.

```
GET {baseUrl}/recordings/{recordingId}
```

#### Response (200)

```json
{
  "url": "https://record.example.com/files/abc123.mp3",
  "recordingUrl": "https://record.example.com/files/abc123.mp3"
}
```

LinkConnect는 `url` 또는 `recordingUrl` 필드를 사용합니다.

---

## 6. 데이터 모델 (참고)

LinkConnect 내부 테이블 (콜업체 DB 불필요, 이해용):

| 테이블 | 설명 |
|--------|------|
| `call_numbers` | 가상번호 풀 (`cn_provider_number_id` = 콜업체 번호 ID) |
| `call_requests` | 파트너 가상번호 신청·배정 (`car_virtual_number`) |
| `call_settings` | 캠페인별 착신·녹음·최소통화시간·단가 |
| `call_logs` | 통화 원장 (`clog_provider_call_id` UNIQUE) |
| `conversions` | CPA DB (`cv_source=call`, `cv_call_id` → call_logs) |

**가상번호 → 파트너/캠페인 매핑**은 LinkConnect가 관리합니다.  
웹훅에는 **`virtualNumber`만** 정확히 전달하면 됩니다.

---

## 7. curl 테스트

### 7.1 웹훅 수신 테스트 (콜업체 → LinkConnect)

```bash
curl -X POST 'https://linkconnect.co.kr/plugin/linkconnect/api/call_receive.php' \
  -H 'Content-Type: application/json' \
  -H 'X-CALL-TOKEN: YOUR_WEBHOOK_TOKEN' \
  -d '{
    "providerCallId": "TEST-CALL-001",
    "virtualNumber": "05071234567",
    "caller": "01099998888",
    "startedAt": "2026-07-09 15:00:00",
    "duration": 90,
    "result": "success"
  }'
```

### 7.2 가상번호 발급 테스트 (LinkConnect → 콜업체)

```bash
curl -X POST 'https://api.example-call.com/v1/virtual-numbers' \
  -H 'Content-Type: application/json' \
  -H 'X-API-KEY: YOUR_API_KEY' \
  -d '{"areaCode":"02","memo":"linkconnect-test"}'
```

---

## 8. 콜업체 제공 요청 체크리스트

연동 착수 전 아래 정보를 LinkConnect에 전달해 주세요.

- [ ] **REST API Base URL** (운영 / 스테이징)
- [ ] **API Key** 발급 방식 및 테스트 키
- [ ] **웹훅 인증** 방식 (고정 토큰 / HMAC / IP 화이트리스트)
- [ ] **가상번호 발급 API** 경로·요청/응답 샘플 (Part 2.2와 다를 경우 매핑표)
- [ ] **착신 라우팅 API** 경로·필드명 (Part 2.3과 다를 경우)
- [ ] **통화 웹훅** 전송 시점 (종료 후 / 실시간)
- [ ] **`result` enum** 전체 목록
- [ ] **녹취** URL 제공 방식 (웹훅 inline / 별도 API / 지연 생성)
- [ ] **재시도·멱등** 정책 (`providerCallId` 지원 여부)
- [ ] **IP 대역** (LinkConnect → 콜업체 호출 화이트리스트 필요 시)
- [ ] **장애·점검** 연락처

---

## 9. LinkConnect 제공 정보 (콜업체에 전달)

| 항목 | 값 |
|------|-----|
| 웹훅 URL | `https://linkconnect.co.kr/plugin/linkconnect/api/call_receive.php` |
| 웹훅 Method | `POST` |
| 웹훅 Content-Type | `application/json` |
| 웹훅 인증 | `X-CALL-TOKEN: (LinkConnect 발급)` |
| LinkConnect → 콜업체 인증 | `X-API-KEY` 또는 `Authorization: Bearer` |
| 필수 웹훅 필드 | `virtualNumber`, (`providerCallId` 강력 권장) |
| DB 생성 기준 | 배정된 가상번호 + 통화성공 + 최소통화시간 (캠페인별) |

---

## 10. 문의

- **플랫폼:** LinkConnect (linkconnect.co.kr)
- **기술 담당:** LinkConnect 개발팀
- **관련 소스:** `plugin/linkconnect/inc/call.php`, `plugin/linkconnect/api/call_receive.php`

---

## 부록 A — 필드 alias 전체 (웹훅)

| 표준 (권장) | 수용 alias |
|-------------|------------|
| `providerCallId` | `callId` |
| `virtualNumber` | `calledNumber`, `did` |
| `caller` | `from`, `callerNumber` |
| `callee` | `to` |
| `startedAt` | `startTime`, `calledAt` |
| `duration` | `durationSec` |
| `result` | `status` |
| `recordingUrl` | `recordUrl` |
| `recordingId` | `recordId` |

## 부록 B — LinkConnect → 콜업체 호출 요약

| Method | Path | 용도 |
|--------|------|------|
| POST | `/virtual-numbers` | 가상번호 발급 |
| POST | `/virtual-numbers/{id}/route` | 착신·녹음·멘트 설정 |
| GET | `/recordings/{id}` | 녹취 URL 조회 |

---

*본 문서는 LinkConnect 구현 코드(v0.2.0) 기준입니다. 콜업체 API와 필드명이 다른 경우, 별도 매핑 협의 후 LinkConnect 설정 또는 어댑터를 적용합니다.*
