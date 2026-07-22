# CPA 머천트 랜딩 — 연락 채널 규칙

LinkConnect CPA 플랫폼에 올리는 **모든** 머천트 랜딩(`/merchant/*`, builder imports)에 공통으로 적용한다.

## 왜 이 규칙인가

홍보(파트너 링크) 성과를 **측정**해야 한다.  
카카오채널·광고주 직통번호로 유입되면 클릭·콜·상담 DB가 플랫폼 밖에서 발생해 **CPA 전환으로 집계되지 않는다.**

## 허용되는 연락 수단

| 수단 | 허용 | 설명 |
|------|------|------|
| **상담신청 폼** | ✅ 필수 | `/plugin/linkconnect/api/receive.php` 등으로 DB 접수. `lkCode` 기반 추적 |
| **콜디비 안심번호(추적용)** | ✅ 선택 | 파트너·캠페인에 배정된 **콜디비 가상번호**만 노출. `LC_LANDING_CONTEXT.partner_phone` / `tracking_phone` |
| 카카오채널 / 오픈채팅 / 카톡 버튼 | ❌ 금지 | 전 상품 공통. URL·버튼·문구 모두 넣지 않음 |
| 광고주 대표·휴대전화 | ❌ 금지 | 사업자 정보(상호·사업자번호·주소 등)와 별개. **전화 연결용 번호로 넣지 않음** |
| 일반 고객센터·외부 메신저 | ❌ 금지 | 랜딩 CTA로 쓰지 않음 |

## UI 동작

- **안심번호가 있을 때만** 전화 CTA·헤더 번호·플로팅 콜 버튼을 보여준다 (`has_partner_phone` / `partner_phone` 존재 시).
- 안심번호가 없으면 **상담신청 폼만** CTA로 쓴다. “전화 불가” 안내로 카카오를 대체하지 않는다.
- 푸터·히어로·최종 CTA에 카카오·광고주 직통 링크를 추가하지 않는다.

## 데이터 소스

- 전화 표시값: `lc_call_partner_phone_for_assignment()` 등 **콜디비 배정 번호**만 (`plugin/linkconnect/inc/landing.php`).
- 광고주(`merchants`) 테이블의 연락처·계약서 상 전화는 **랜딩 `tel:` / 콜 버튼에 매핑하지 않는다.**

## 신규 랜딩 체크리스트

- [ ] 카카오·오픈채팅·외부 메신저 CTA 없음
- [ ] 광고주 직통번호 / 하드코딩 `010-…` / `tel:` 고정값 없음
- [ ] 전화 UI는 `partner_phone` / `tracking_phone`(콜디비) 조건부
- [ ] 기본·필수 CTA는 상담신청 폼(`#consultation-form` 등)
- [ ] 폼 접수는 `lkCode` 등 추적 파라미터와 연동

## 관련 경로 예시

- `merchant/hasugu_cpa/`, `merchant/bunkrupt/`, `merchant/bankrupt_dasibom/`
- `plugin/onoff-builder-bridge/imports/*`
- `plugin/linkconnect/inc/landing.php`
