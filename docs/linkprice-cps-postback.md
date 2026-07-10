# 링크프라이스 CPS — POSTBACK 수신 (5단계)

공식: [리워드 오픈 API](https://github.com/linkprice/AffiliateSetup/blob/master/docs/%EB%A6%AC%EC%9B%8C%EB%93%9C_%EC%98%A4%ED%94%88_API.md)

- **방식:** POST, JSON (server-to-server)
- **타임아웃:** 최대 10초 → 수신기는 8초 `set_time_limit`, 원본 저장 후 빠른 200
- **필드:** 공식 오타 `commision` 사용 (`commission` 도 허용)
- **서명:** 공식 문서에 없음 → 선택적 `X-LP-SECRET` / `postback_secret`

## 엔드포인트

```
POST https://linkconnect.co.kr/api/external/linkprice/postback
POST https://linkconnect.co.kr/plugin/linkconnect/api/lp_postback.php
```

Affiliate Center 리워드 URL에 위 주소 등록.

선택 인증:
```
X-LP-SECRET: {postback_secret}
```

선택 IP 제한: settings `lpPostbackIpEnabled=1`, `lpPostbackIpAllowlist`

## 처리 흐름

1. POST만 허용, 본문 ≤ 512KB  
2. 헤더(시크릿 마스킹) + 원본 JSON → `g5_lc_lp_postbacks`  
3. 라인별 검증 → 중복(trlog) → 클릭/`u_id` 매칭 → `g5_lc_lp_orders` (`lc_status=expected`)  
4. `partner_confirmed=0`, 잔액 미반영  
5. LP 응답: `{ "result": "success" }` (유효 JSON 수신 시)

## 금액

`partner_expected = lp_commission × partner_rate / 100`  
`platform_margin = lp_commission − partner_expected`

## 관리자

`/admin/linkprice` → **POSTBACK 수신** 탭  
상태: 정상 / 미매칭 / 중복 / 오류 · 원본 JSON · 재처리

## 테스트

```bash
php scripts/test-lp-postback.php
```
