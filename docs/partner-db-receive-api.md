# 외부 DB 수신 API

링크커넥트 링크로 유입된 고객의 **신규 상담 접수**를 외부 서버에서 링크커넥트로 전달할 때 사용합니다. 계약·결제 같은 최종 결과 통보는 이 API의 범위가 아닙니다.

**Base URL:** `https://linkconnect.co.kr/plugin/linkconnect/api/db_receive.php`

---

## 상대방에게 보낼 답장 초안

안녕하세요, 링크커넥트입니다.
링크커넥트는 외부 서버에서 상담 DB(전환 데이터)를 바로 받을 수 있는 수신 API를 운영하고 있습니다. 아래 연동 문서를 보내드리니 개발팀에서 확인해 주세요.

연동 전에 몇 가지 여쭤보겠습니다.

1. 보내주실 데이터가 신규 상담 접수(이름·연락처)인지, 계약·결제 같은 최종 결과인지 알려주세요.
2. 링크커넥트 링크로 들어온 고객을 구분할 수 있게, 랜딩 URL에 붙는 링크 코드(lkCode)를 함께 보내주실 수 있는지 확인 부탁드립니다.
3. 호출하실 서버의 고정 IP를 알려주세요. 해당 IP를 등록한 뒤 API Key를 발급해 드립니다.
4. 예상 일일 발송량과 실시간 전송 여부도 알려주시면 운영에 참고하겠습니다.

확인해 주시면 API Key를 발급하고 테스트 일정을 잡겠습니다. 감사합니다.

---

## 1. 주소

`POST https://linkconnect.co.kr/plugin/linkconnect/api/db_receive.php`

요청 본문은 `Content-Type: application/json`을 권장합니다. `application/x-www-form-urlencoded`로 보내도 받습니다.

## 2. 인증

관리자센터 **API 연동 관리**에서 발급한 키를 헤더로 보냅니다.

```http
X-API-Key: sk_live_xxxxxxxx
```

본문의 `api_key` 또는 `apiKey`로도 인증할 수 있습니다. 헤더 방식을 권장합니다.

허용 IP가 등록된 키는 그 IP에서 온 요청만 받습니다. 그 외 IP는 `401 IP not allowed`입니다.

## 3. 요청 항목

| 항목 | 필수 | 설명 |
|---|---|---|
| `lkCode` | 둘 중 하나 | 파트너 링크 코드. 파트너·캠페인 연결에 이 값을 씁니다. |
| `campaign_code` | 둘 중 하나 | 캠페인 코드 (예: `CPA-00015`). `lkCode`가 없을 때만 사용합니다. |
| `name` | 필수 | 고객 이름 |
| `phone` | 필수 | 휴대폰 번호. 숫자 10~11자리. 하이픈은 있어도 됩니다. |
| `email` | 선택 | 이메일 |
| `region` | 선택 | 지역 |
| `inquiry` | 선택 | 문의 내용. `question`도 같은 값으로 받습니다. |
| `ext_id` | 선택 | 보내는 쪽 고유번호. 연동 로그에 남아 서로 대조할 때 씁니다. 중복 판정에는 쓰이지 않습니다. |

`lkCode`를 권장합니다. `campaign_code`만 보내면 파트너 귀속 없이 캠페인 DB로만 접수됩니다.

## 4. 요청 예시

```bash
curl -X POST "https://linkconnect.co.kr/plugin/linkconnect/api/db_receive.php" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_xxxxxxxx" \
  -d '{"lkCode":"LK-XXXX","name":"홍길동","phone":"010-1234-5678","inquiry":"상담 희망","ext_id":"ORDER-1001"}'
```

## 5. 성공 응답

HTTP 200

```json
{ "success": true, "db_code": "CV-XXXXXX", "message": "..." }
```

`db_code`는 링크커넥트 DB 번호입니다. 보내는 쪽 DB에 함께 저장하면 이후 조회와 대조가 쉬워집니다.

## 6. 에러 응답

```json
{ "success": false, "error": "...", "code": 400 }
```

| HTTP | error | 의미 |
|---|---|---|
| 401 | Invalid API Key | 키가 없거나 맞지 않음 |
| 401 | IP not allowed | 등록되지 않은 IP |
| 400 | Missing required field: phone | 연락처 없음 |
| 400 | lkCode or campaign_code required | 링크 코드와 캠페인 코드가 모두 없음 |
| 400 | 이름과 연락처는 필수입니다. | 이름 없음 |
| 400 | 연락처 형식을 확인해 주세요. | 숫자가 10~11자리가 아님 |
| 404 | Invalid link code | 링크 코드가 없거나 운영 중이 아님 |
| 404 | Invalid campaign code | 캠페인 코드가 없거나 운영 중이 아님 |
| 409 | 이미 접수된 연락처입니다. ... | 같은 캠페인·같은 연락처가 24시간 안에 다시 들어옴 |

## 7. 운영 기준

- 같은 캠페인에 같은 연락처가 24시간 안에 다시 들어오면 접수하지 않고 409를 돌려줍니다.
- 시간 초과나 5xx일 때만 같은 요청을 다시 보내 주세요. 400·404는 데이터를 고친 뒤 보내 주세요.
