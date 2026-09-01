# MODEMO LANDING CONTENT PACK

> Google Studio Builder 리뉴얼용. **기존 LinkConnect 코드베이스에 존재하는 자료만** 정리.
> 임의 카피·가짜 수치·가짜 후기 추가 금지.
> Source of Truth: `merchant/modemo-onepage/` → 배포물 `plugin/onoff-builder-bridge/imports/modemo/`

---

## Brand

| 항목 | 값 | 출처 |
|------|-----|------|
| 서비스명 | 모두의철거 | Footer / JSON-LD / 카피 전반 |
| 광고주 코드 | ADV-0008 | `LC_LANDING_CONTEXT.merchant_id`, `campaign_modemo.php` |
| 캠페인 코드 | CPA-MODEMO | `campaign_modemo.php`, landing inject |
| 캠페인 상품명 | 철거·원상복구 상담 DB | `lc_modemo_campaign_definition()` |
| 상호(법인) | 파밍시티 | `Footer.tsx` 하드코드 |
| 대표자(기본) | 김장수 | Footer fallback / landing_context |
| 사업자번호(기본) | 206-47-92777 | Footer fallback (context 비면) |
| 소재지(기본) | 경기도 과천시 과천대로7나길 37, 디엠 303호 | Footer fallback |
| 슬로건 | 철거의 새로운 기준, 철거의 모든 것 | Footer |
| SEO title | 철거 업체 | `layout.tsx` / `page.tsx` |
| 공개 URL | https://linkconnect.co.kr/merchant/modemo/ | PHP wrapper |
| 트래킹 도메인 | https://yevely.kr | `campaign_modemo` / CF worker |

### Logos

| 파일 | 경로 |
|------|------|
| 화이트 로고 | `merchant/modemo-onepage/public/images/logo_white.png` |
| 블랙 로고 | `merchant/modemo-onepage/public/images/logo_black.png` |
| 스몰 로고 | `merchant/modemo-onepage/public/images/logo_small.png` |

런타임 URL: `/plugin/linkconnect/api/merchant-static.php?m=modemo&p=images%2Flogo_*.png`

---

## Existing Headlines

| 섹션 | Headline |
|------|----------|
| Hero H1 | 거품은 빼고, 안전은 더했습니다 |
| Hero 서브 | 더 이상 발품 팔며 시간 낭비하지 마세요. 간편 신청 한 번으로 3곳 비교부터 추가금 없는 책임 시공까지. |
| Hero 3無 | 모두의철거 3無 원칙으로 부담없이 견적부터 받아보세요. (출장비/견적비/추가금 0원) |
| Stats | 이미 수많은 사장님들이 직접 경험하셨습니다 |
| Logos | **700여곳**이 넘는 고객사가 모두의철거를 선택했습니다. |
| Worry | 철거 전, 이런 걱정 때문에 밤잠 설치고 계신가요? |
| Market | 철거 시장이 유독 불투명한 3가지 본질적인 이유 |
| System | 부르는 게 값인 불투명한 시장, 모두의철거가 선명한 기준이 됩니다. |
| Process | 막막한 철거, 혼자 고민하지 마세요. 전담 매니저가 전 과정을 함께합니다. |
| Verified | 진짜 믿고 맡길 수 있는 파트너만 남겼습니다. |
| Pricing | 모두만의 노하우로 가격은 낮추고 투명성은 높였습니다 |
| Safety | 추가금, 먹튀, 하자 분쟁 모두의철거에서는 걱정 안 하셔도 됩니다 |
| Region | 사장님 동네를 잘 아는 이웃 전문가가 우선 배정됩니다 |
| Quote | 신청 한 번으로 비교부터 책임 시공까지 / 간편 견적 신청 |
| Footer CTA | 현장 견적, 고민만 한다고 나오지 않습니다 |
| Success | 신청이 완료되었습니다 / 상담신청이 접수되었습니다 |

---

## Existing Copy

### Hero form
- 제목: 이름·연락처만 남겨주세요
- CTA: 빠른 상담신청
- 힌트: 회원가입 없이 30초면 완료
- 성공: 전담 매니저가 영업시간 기준 빠르게 연락드립니다.

### Worry (6 items)
1. 정보 비대칭 — 눈탱이 걱정
2. 깜깜이 견적 — 뭉뚱그린 견적서
3. 업체 신뢰 — 계약금 후 연락 두절
4. 일정 지연 — 임대차 만료
5. 추가금 요구 — 공사 중 추가 청구
6. 사후 책임 — AS / 건물주 검수

### Process (3 steps)
1. 신청 당일 — 전담 매니저 배정 및 밀착 관리
2. 일정 조율 — 스케줄에 맞춘 방문 상담
3. 비교 후 확정 — 견적 모아보기부터 결정까지 단번에

### Verified (4)
1. 신원 인증 업체
2. 자가 장비 보유
3. 무사고/AS 이행률 100%
4. 평점 및 고객후기

### Pricing (3)
1. 업계 최저 수수료
2. 마케팅 비용 최소화
3. 투명한 비교 경쟁 (지역 파트너 3곳)

### Safety (3)
1. 추가금 방지 특약
2. 표준 계약서 의무화
3. AS 끝까지 책임

### Quote desk steps
1. 신청 접수 — 이름·연락처만으로 30초 신청
2. 당일 매니저 배정 — 유선으로 현장 확인
3. 3사 비교 견적 — 검증 파트너만 연결 · 추가금 원칙 준수

### Footer disclaimer
> 모두의철거는 중개 플랫폼으로 철거, 원상복구 공사의 주 거래 당사자가 아닙니다. 시공, 거래에 관한 의무와 책임은 철거 파트너에게 있습니다.

---

## Existing Benefits

- 3곳 비교 견적
- 추가금 없는 책임 시공 (3無: 출장비/견적비/추가금 0원 표기)
- 전담 매니저 밀착
- 검증 상위 10% 파트너 연결
- 추가금 방지 특약 / 표준 계약서 / AS
- 타업체 견적서 첨부 비교 분석
- 파트너 전화(안심번호) — `has_partner_phone`일 때만 UI 노출

---

## Existing Images

### 현장 사진 (`merchant/modemo-onepage/public/images/`)

| 파일 | 사용처 |
|------|--------|
| `1_천안상가.jpg` | Hero |
| `1_용인주택.jpg` | Hero, Pricing |
| `1_신림상가.jpg` | Hero, Process, Verified |
| `1_일산카페.jpg` | Safety |
| `2_수원상가.jpg` | Hero, Verified |
| `2_성북구상가.jpg` | Hero, Process, Safety |
| `2_여의도사무실.jpg` | Hero, Process, System |
| `2_일산상가.jpg` | Pricing |
| `3_동탄상가.jpg` | Pricing |
| `3_동탄상가2.jpg` | (에셋 보유) |
| `3_목동상가.jpg` | Verified |
| `3_목동상가2.jpg` | Safety |
| `3_사당상가.jpg` | Verified |

### 아이콘/일러스트 (동일 `public/images/`)
`donut.png`, `fork.png`, `ladder.png`, `trash_can.png`, `chat.png` (+ 다수 unused: `safehat.png`, `truck.png`, `worker.png` 등)

### 고객사 로고 (`public/images/business_logos/` — 25개)
현대백화점, 롯데백화점, 현대아이파크, 스타벅스, 이마트, 에쓰오일1/2, GS칼텍스, 투썸플레이스, 이디야커피, 더벤티, 서울라이티움, 노브랜드피자, 아주대학교, 아모레퍼시픽, 홈플러스, 한양대학교, 앰배서더서울, 세브란스병원, 예술의전당, 아시아나컨트리클럽, HD현대오일뱅크, 하이트진로, IFCMall, 한국기계연구원

### 런타임 이미지 URL 규칙
```
/plugin/linkconnect/api/merchant-static.php?m=modemo&p=images/{filename}
```
독립도메인(yevely)에서는 Worker가 동일 프록시로 rewrite.

---

## Form Fields

### A. HeroLeadForm (`#hero-lead-form`) — 순서 고정
1. 이름 * (text)
2. 연락처 * (tel, `010-` 자동 포맷)
3. 개인정보 수집·이용 동의 * (checkbox + `/privacy` 링크)
4. Submit: **빠른 상담신청**
5. (조건부) 전화상담 CallButton

- inquiry 고정값: `"히어로 빠른상담신청"`
- 성공: 인라인 UI (success 페이지 미이동)
- API: `POST /plugin/linkconnect/api/receive.php` (JSON)

### B. SimpleQuoteSection (`#quote-request`) — 순서 고정
1. 이름 *
2. 연락처 *
3. 철거 유형 (select: 상가 철거 / 주택 철거 / 사무실 원상복구 / 학원·교육시설 / 폐기물 처리 / 기타)
4. 지역 (text)
5. 요청사항 (textarea)
6. 타업체 견적서 첨부 (file, image/PDF, max 10MB)
7. Submit: **무료 견적 신청하기**

- **개인정보 체크박스 없음** (안내 문구만: “연락처는 상담 목적에만…”)
- inquiry: `buildInquiryText()` → `철거유형: … | 지역: … | 문의: … | 견적서첨부: …`
- API: multipart + `attachment` 또는 JSON

### C. success 페이지
- 경로: `merchant/modemo-onepage/src/app/success/page.tsx`
- 현재 폼 플로우는 **인라인 성공**이 기본. success URL은 보조.

---

## Privacy Text

| 위치 | 내용 |
|------|------|
| Hero | “상담 접수를 위한 개인정보 수집·이용에 동의합니다.” + 내용 보기 → `privacy_policy_url` 또는 `/privacy` |
| Quote | “연락처는 상담 목적에만 사용되며, 제3자에게 판매하지 않습니다.” (동의 체크 없음) |
| 약관 본문 | 사이트 `/privacy` (`privacy/index.php`, `page/privacy.php`) — 랜딩 내부 전문 없음 |
| 제3자 제공/마케팅 동의 | **별도 체크박스 없음** |

---

## CTA

| 위치 | 라벨 | 동작 |
|------|------|------|
| Header | 무료 견적 신청 | scroll `#quote-request` |
| Hero form | 빠른 상담신청 | submit receive |
| Hero (조건부) | 전화상담 | tel: partner phone |
| Quote | 무료 견적 신청하기 | submit receive |
| FooterCta | (섹션 CTA) | 견적/전화 |
| StickyCallBar 모바일 | 견적신청 / 전화상담 | scroll form / call |
| StickyCallBar 데스크톱 | 전화상담 연결 | call (hasPhone일 때) |

Dead code: `CallScrollPopup.tsx` (미마운트)

---

## Trust Elements

### 하드코드 수치 (광고주 검증 전제 — Builder에서 새로 만들지 말 것)
| 수치 | 라벨 | 위치 |
|------|------|------|
| 4,130+ | 누적 비교 견적 | EvidenceStrip / Stats |
| 13% | 평균 비용 절감 | EvidenceStrip / Stats |
| 4.9/5 | 서비스 만족도 | EvidenceStrip / Stats |
| 상위 10% | 검증 파트너만 연결 | EvidenceStrip / Verified |
| 700여곳 | 고객사 | CustomerLogos |
| 100% | 무사고/AS 이행률 | Verified |

### 후기 (기존 JSON — 마스킹 이름)
파일: `merchant/modemo-onepage/src/data/statsReviews.json`  
저자: 이*민, 유*랑, 김*섭, 김*훈, 최*호  
(+ RegionPartnerSection 내 추가 후기 카피 존재)

### 고객사 로고 마퀴
25개 PNG — 위 business_logos 목록

---

## FAQ Source

**없음.** FAQ 컴포넌트/섹션 미존재. Builder에서 새 FAQ를 넣으려면 광고주 제공 질의응답만 사용.

---

## Existing Footer

- 로고 텍스트: merchant_name \|\| 모두의철거
- 슬로건, 상호 파밍시티, 대표/사업자번호/주소
- 상담전화 (hasPhone)
- 중개 플랫폼 면책
- Copyright: 2026 Farmingcity inc.

---

## Tracking/API Constraints

| 항목 | 제약 |
|------|------|
| Lead API | `POST /plugin/linkconnect/api/receive.php` — 변경 금지 |
| Context API | `GET /plugin/linkconnect/api/landing_context.php` |
| Image proxy | `merchant-static.php?m=modemo&p=` |
| lkCode | query `lkCode`/`code`/`lk_code` → sessionStorage `lc_modemo_lkCode` |
| Defaults | `campaign_id=CPA-MODEMO`, `merchant_id=ADV-0008` |
| UTM | utm_source/medium/campaign, sub_id |
| Channel | SEO (도메인 직유입) / 파트너 링크 |
| Events | `lead_submit_click`, `lead_submit_success`, `lead_submit_error` CustomEvent |
| GA/GTM | env `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID` (lazyOnload) |
| Naver CTS | 컴포넌트 존재하나 **layout 미연결** |
| 완료 UX | 인라인 성공 + `sessionStorage.modemo_lead_submitted` |
| 첨부 | `cv_attachment_*` 저장 — multipart `attachment` 필드명 유지 |

---

## Must Keep

- CPA-MODEMO / ADV-0008 / lkCode / receive.php 계약
- Hero 단축 폼 + Quote 상세 폼 이중 전환 (또는 동일 API 계약)
- 파트너 전화 조건부 노출 (`has_partner_phone`)
- 개인정보 동의(최소 Hero) + `/privacy` 링크
- 현장 실사 이미지·로고 실물 에셋
- Footer 면책(중개 플랫폼)
- yevely / merchant-static 핫링크 우회
- 첨부파일 업로드 필드(견적서) — 이미 광고주 미리보기 연동됨

---

## Can Improve

- 섹션 과다·스크롤 길이 축소 (Worry→Market→System 중복 메시지)
- Quote 폼에 동의 체크 추가(Hero와 일치)
- EvidenceStrip 수치 광고주 검증 후 유지/갱신
- Sticky CTA를 “상담신청” 단일 강조
- Hero priority 이미지 / 폰트 웨이트 (이미 일부 성능 개선됨)
- CallScrollPopup 활용 여부 결정
- NaverAnalytics 마운트 여부
- SEO title “철거 업체” → 브랜드 강화 (카피만, tracking 무관)

---

## Do Not Invent

- 가짜 후기 / 고객수 / 신청수 / 만족도 / 인증 / 수상
- 임의 가격·할인·프로모션·폐업지원금 (벤치마크 카피 복제 금지)
- 임의 회사연혁
- 무촌철거/replyalba 브랜드·비주얼·카피 복제
- receive.php / webhook / DB 스키마 / lkCode 파라미터명 변경
- onoffcpa SPA로 번들 복사
