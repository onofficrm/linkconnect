# MODEMO RENEWAL ANALYSIS

**Scope:** READ-ONLY. Production / DB / API / tracking 변경 없음.  
**Target URL:** https://linkconnect.co.kr/merchant/modemo/  
**Benchmark (UX only):** https://replyalba.com/pt/DyLNRfmAkJ → redirects to `/intros/muchon/` (무촌철거)  
**Date:** 2026-08-31  
**Companion:** [modemo-builder-content-pack.md](./modemo-builder-content-pack.md)

---

## A. Current Architecture

```
Browser
  → /merchant/modemo/?lkCode=…
  → merchant/modemo/index.php          ($_GET['id']=modemo)
  → plugin/onoff-builder-bridge/page.php
  → imports/modemo/index.html          (Next static export)
  + window window.LC_LANDING_CONTEXT   (cid=CPA-MODEMO, mid=ADV-0008)
```

| Layer | Path | Role |
|-------|------|------|
| **Edit SoT** | `merchant/modemo-onepage/` | Next.js 16 App Router, `output: 'export'` |
| **Route** | `merchant/modemo/index.php` | GNUBoard/Cafe24 entry |
| **Serve** | `plugin/onoff-builder-bridge/imports/modemo/` | Built HTML/JS/CSS/images |
| **Deploy** | `npm run deploy:imports` → `scripts/sync-modemo-builder.sh` | out → imports |
| **Campaign** | `plugin/linkconnect/inc/campaign_modemo.php` | CPA-MODEMO ↔ ADV-0008 |
| **Lead API** | `plugin/linkconnect/api/receive.php` | POST JSON/multipart |
| **Context** | `plugin/linkconnect/api/landing_context.php` + PHP inject | phone, privacy URL |
| **Images** | `api/merchant-static.php?m=modemo&p=` | Cafe24 hotlink bypass |
| **Domain** | yevely.kr CF Worker | rewrite → `/merchant/modemo/` |
| **Privacy** | `/privacy` (site-wide PHP) | not in Next app |

**Not used for this landing:** LinkConnect SPA (`imports/linkconnect`), WordPress embed plugin (별도 채널).

---

## B. Current Page Sections

Mount order (`page.tsx` + `DeferredLandingSections` + layout):

| # | Section | Eager/Deferred | Component |
|---|---------|----------------|-----------|
| 0 | Header | layout | `Header.tsx` |
| 1 | Hero + HeroLeadForm | eager | `HeroSection.tsx` |
| 2 | EvidenceStrip | eager | stats strip |
| 3 | StatsSection | deferred | counters + reviews |
| 4 | CustomerLogosSection | deferred | logo marquee |
| 5 | WorrySection | deferred | 6 anxieties |
| 6 | MarketDiagnosisSection | deferred | 3 market reasons |
| 7 | SystemSection | deferred | 3-step system |
| 8 | ProcessSection | deferred | how it works |
| 9 | VerifiedSection | deferred | partner quality |
| 10 | PricingSection | deferred | fee/bubble removal |
| 11 | SafetySection | deferred | contract/AS |
| 12 | RegionPartnerSection | deferred | local partners + reviews |
| 13 | SimpleQuoteSection `#quote-request` | deferred | main form |
| 14 | FooterCtaSection | deferred | final CTA |
| 15 | Footer | layout | legal |
| 16 | StickyCallBar | Providers | mobile bar / desktop float |

**Missing vs ideal IA:** FAQ (없음).  
**Dead:** `CallScrollPopup.tsx`, `NaverAnalytics.tsx` (미마운트).

---

## C. Existing Content

요약은 content-pack 참고. 핵심 메시지 축:

1. **신뢰/투명** — 거품 제거, 3곳 비교, 추가금 0
2. **불안 공감** — Worry 6종 → Market 3원인
3. **프로세스** — 전담 매니저 → 방문 → 비교 확정
4. **검증** — 상위 10%, 신원/장비/AS
5. **전환** — Hero 초단축 폼 + 하단 상세 폼

하드코드 수치(4,130+ / 13% / 4.9 / 700여곳 / AS 100%)는 **코드에 존재**하므로 “기존 콘텐츠”로 기록하되, 리뉴얼 시 **광고주 재검증** 필요 (임의 신규 수치는 금지).

후기: `statsReviews.json` + RegionPartner 내 카피 (마스킹 실명 형식).

---

## D. Existing Assets

- **Fonts:** Pretendard (현재 layout preload: 400/700; 파일셋에 Medium/SemiBold 등 잔존)
- **Motion:** framer-motion (`FadeIn`), next/dynamic + DeferredMount
- **Images:** 13 현장 JPG + logos + business_logos 25 + icon PNG 다수  
  경로 목록 → content-pack **Existing Images**
- **Icons UI:** react-icons (Fi*, Io*)

---

## E. Form / API

```
submitConsultation() → POST receive.php
  fields: name, phone, inquiry [, lkCode, channel, campaignId, utm_*, attachment]
  success: inline UI + sessionStorage.modemo_lead_submitted
  NO redirect to /success by default
```

| Form | Required | Optional | Consent |
|------|----------|----------|---------|
| Hero | name, phone, privacy ✓ | call button | checkbox |
| Quote | name, phone | type, region, message, file | text note only |

Attachment: multipart field name `attachment` → `cv_attachment_*` (광고주 미리보기 연동).

---

## F. Tracking

| Param | Source |
|-------|--------|
| lkCode | URL / session / LC_LANDING_CONTEXT |
| campaign_id | default CPA-MODEMO |
| merchant_id | ADV-0008 |
| utm_* / sub_id | URL + context |
| partner phone | landing_context (`has_partner_phone`) |
| GA / GTM | env lazyOnload |
| CustomEvent | lead_submit_* |

Production inject sample (루트 `/merchant/modemo/`):  
`campaign_id":"CPA-MODEMO","merchant_id":"ADV-0008","privacy_policy_url":"/privacy","has_partner_phone":false` (lkCode 없을 때).

---

## G. Privacy / Compliance

- Hero: 수집·이용 동의 체크 + `/privacy` 링크 — **KEEP**
- Quote: 동의 체크 없음 — **IMPROVE** (컴플라이언스 리스크)
- 제3자 제공 / 마케팅 동의: 미구현 — 광고주 요구 시에만 ADD
- Footer 중개 플랫폼 면책 — **KEEP**
- 벤치마크의 “폐업지원금” 등 타사 프로모션 문구 — **복사 금지**

---

## H. UX Problems (KEEP / IMPROVE / REMOVE / ADD)

### Desktop

| 항목 | 판정 | 메모 |
|------|------|------|
| 첫 화면 서비스 이해 | **KEEP** | H1+3無+Hero form으로 이해 가능 |
| 핵심 혜택 속도 | **IMPROVE** | EvidenceStrip 직후 또 Stats 중복 |
| CTA 가시성 | **KEEP** | Header + Hero + Sticky |
| 신청폼 접근 | **KEEP** | Hero 즉시 + `#quote-request` |
| 정보 과다 | **IMPROVE** | Worry/Market/System 메시지 중첩 |
| 긴 문장 | **IMPROVE** | 여러 h2가 2~3줄 |
| 섹션 순서 | **IMPROVE** | 문제→진단→시스템 길이 과다 후 폼 |
| 신뢰 요소 | **KEEP** | 로고·현장사진·수치(검증 전제) |
| 전환 방해 | **IMPROVE** | 폼까지 스크롤 깊음; Quote 동의 누락 |
| 폰트/여백 | **IMPROVE** | Pretendard OK; 섹션 간격 큼 |
| Footer | **KEEP** | 법적 필수 |
| Sticky CTA | **KEEP** | 전화는 hasPhone 조건부 |
| 로딩 | **IMPROVE** | TTFB ~1.6s (실측); 이미지 프록시 의존 |
| 이미지 크기 | **IMPROVE** | merchant-static WebP 적용됨, 히어로 다수 |

### Mobile

| 항목 | 판정 | 메모 |
|------|------|------|
| 스크롤 길이 | **IMPROVE** | DeferredMount로 완화됐으나 섹션 수 여전히 많음 |
| 버튼 크기 | **KEEP** | Sticky bar 충분 |
| 입력폼 | **KEEP** | Hero 2필드 우수 |
| 개인정보 UX | **IMPROVE** | Quote에 체크 없음 |
| Hero 마퀴 이미지 | **IMPROVE** | 대역폭; priority 1장 권장(일부 적용) |
| CallScrollPopup | **ADD or REMOVE** | 미사용 — 채택하거나 정리 |

### Classification summary

- **KEEP:** Hero 단축폼, 3無, 실사 이미지, 로고 마퀴, receive/lkCode, Footer 면책, Sticky 견적
- **IMPROVE:** 섹션 압축, Quote 동의, 수치 검증, 스크롤·로딩, SEO title
- **REMOVE:** 중복 Stats(Evidence와 겹침 가능), 미사용 CallScrollPopup/미연결 Naver(결정 후)
- **ADD:** FAQ(광고주 제공 시만), Quote privacy checkbox, (선택) 단일 sticky “상담신청”

---

## I. Benchmark Findings

**URL chain:** `/pt/DyLNRfmAkJ` → JS redirect → `/intros/muchon/`  
**Brand:** 무촌철거 (주식회사 무촌) — **복제 금지**

### Observed structure (READ-ONLY)

1. **Hero:** 이미지 중심 (`main1.jpg`, `main2.jpg`) — 카피가 이미지에 베이킹된 형태로 보임  
2. **Headline / Benefit:** HTML 텍스트보다 섹션 이미지(`sec2~8`, `point.jpg`) 의존  
3. **CTA:** 상단·폼 **「상담신청하기」** 반복  
4. **신청폼 위치:** 페이지 초반/고정 강조 — 필드 짧음  
5. **신청폼 길이:** 이름* / 연락처* / 철거 주소* / 기타 문의 — **4필드**  
6. **CTA 반복:** 헤더형 sticky + 폼 하단 버튼  
7. **Sticky CTA:** 「상담신청하기」  
8. **Social proof:** 후기 이미지 세트 `r1~r10.jpg` (텍스트 후기 HTML 최소)  
9. **숫자/통계:** HTML에서 추출 불가(이미지 내 가능) — 벤치 수치를 LC에 가져오지 말 것  
10. **이용 방법 / 장점:** `s1~s20` 갤러리형 비주얼 섹션  
11. **후기/사례:** 이미지 카드  
12. **FAQ:** HTML상 명확 FAQ 텍스트 없음  
13. **약관:** 모달 — 수집주체/항목/목적/3년 보유 + 취급위탁  
14. **모바일:** 폼 우선·짧은 입력  
15. **컬러/타이포/카드:** 이미지 랜딩 특성상 코드 기반 디자인 시스템 아님  
16. **섹션 순서:** 비주얼 스토리 → (상시) 짧은 폼

실측 TTFB(참고): replyalba ~1.0s / modemo ~1.6s.

### 복사하면 안 되는 요소
- 무촌/replyalba 로고·사진·후기 이미지·「1등 철거 플랫폼」·「특가견적 & 폐업지원금」 카피
- 타사 개인정보 문구(수집주체·목적에 타 상호 표기됨)
- 레이아웃 픽셀 복제 / 동일 색·카드 패턴 카피

### LinkConnect에서 차용하면 좋은 UX 패턴
- **폼 필드 최소화** (주소가 필요하면 Quote에 선택→필수로 승격 검토; 현재 LC는 지역이 선택)
- **Sticky CTA = 상담신청 단일 액션**
- **동의 체크 + 자세히보기 모달**을 Quote에도 적용
- **비주얼 스토리텔링**은 *자사 현장 사진*으로 (벤치 이미지 금지)
- 긴 설명 텍스트 대신 **짧은 혜택 블록 + 이미지** 비중 조절

---

## J. Recommended New IA

기존 자료만 사용. 빈 섹션은 생략.

| # | Section | 콘텐츠 소스 |
|---|---------|-------------|
| 01 | Header | logo_white/black, 무료 견적, 전화(조건부) |
| 02 | Hero + Primary CTA | 기존 H1/3無 + **HeroLeadForm 유지** |
| 03 | 핵심 혜택 | EvidenceStrip 수치(검증 후) 또는 3無/3곳 비교 3줄 |
| 04 | 고객 문제 | Worry **상위 3~4개만** |
| 05 | 주요 특징 | System 또는 Pricing+Safety 압축 1블록 |
| 06 | 이용방법 | Process 3 steps + 기존 현장사진 |
| 07 | 신뢰 | Logos 마퀴 + Verified 요약 (수치 검증) |
| 08 | 기존 이미지 | Hero/Process 실사 그리드 (신규 촬영 없이) |
| 09 | 신청폼 | SimpleQuote 필드 계약 유지 + **동의 체크 추가 권장** |
| 10 | FAQ | **자료 없으면 생략** |
| 11 | 개인정보/안내 | `/privacy` + Footer 면책 |
| 12 | Final CTA | FooterCta 카피 재사용 |
| 13 | Footer | 기존 Footer |

StatsSection과 MarketDiagnosis는 Hero/Worry와 중복되면 **병합 또는 삭제 후보**.

---

## K. Builder Content Pack

작성 완료: [`docs/modemo-builder-content-pack.md`](./modemo-builder-content-pack.md)

포함: Brand, Headlines, Copy, Benefits, Images(+경로), Form Fields, Privacy, CTA, Trust, FAQ(없음), Footer, Tracking constraints, Must Keep / Can Improve / Do Not Invent.

---

## L. Development Constraints

1. **ANALYSIS ONLY 단계** — Production 수정·배포·push·DB·API·webhook·tracking 변경 금지 (본 문서 작성만 수행).
2. 이후 구현 시에도 **receive.php / lkCode / CPA-MODEMO / ADV-0008 / attachment 필드명** 유지.
3. `imports/linkconnect` ↔ onoffcpa SPA **교차 복사 금지** (워크스페이스 룰).
4. Builder 산출물은 `merchant/modemo-onepage` 또는 별도 소스 → `deploy:imports`로만 `imports/modemo` 반영.
5. 가짜 소셜프루프·임의 프로모션 금지.
6. yevely Worker / merchant-static 프록시 전제 유지 (이미지 직접 import 경로 금지).
7. 개인정보: Quote 폼 개선 시에도 `/privacy` URL 및 서버측 저장 필드 계약 준수.

---

## Appendix: Key file index

```
merchant/modemo/index.php
merchant/modemo-onepage/src/app/(main)/page.tsx
merchant/modemo-onepage/src/components/home/*
merchant/modemo-onepage/src/lib/linkconnect.ts
merchant/modemo-onepage/public/images/*
plugin/onoff-builder-bridge/imports/modemo/
plugin/onoff-builder-bridge/lib/renderer.php
plugin/linkconnect/api/receive.php
plugin/linkconnect/api/landing_context.php
plugin/linkconnect/api/merchant-static.php
plugin/linkconnect/inc/campaign_modemo.php
scripts/cloudflare-yevely-worker.js
docs/modemo-builder-content-pack.md
```
