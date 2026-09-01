# 모두의 철거 — LinkConnect MODEMO Integration Plan

**Phase:** 1 — READ-ONLY Integration Audit  
**Date:** 2026-08-31  
**Builder Source (fixed):** `/Volumes/onoff/cursor/customer/linkconnect/merchant/모두의-철거`  
**Production URL:** https://linkconnect.co.kr/merchant/modemo/  
**Brand (UI):** 모두의 철거  
**Internal IDs (keep):** `modemo` / `MODEMO` / `CPA-MODEMO` / `ADV-0008`  
**Prior docs:** [modemo-builder-content-pack.md](./modemo-builder-content-pack.md), [modemo-renewal-analysis.md](./modemo-renewal-analysis.md)

**Safety:** 본 문서는 계획만 기록. Production 수정·배포·push·DB/API 변경 없음.

---

## A. Builder Source

**Path verified:** `merchant/모두의-철거/` (exists)

```
merchant/모두의-철거/
├── package.json          # Vite + React 19 + Tailwind 4 + lucide-react + motion
├── vite.config.ts
├── tsconfig.json
├── index.html
├── metadata.json
├── .env.example
├── README.md
├── public/assets/        # aistudio meta only (no hero photos)
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    └── components/
        ├── Header.tsx
        ├── Hero.tsx                 # Quick form + BUILDER_PREVIEW_ONLY
        ├── CoreStrengths.tsx
        ├── DemolitionTypes.tsx
        ├── ProcessSteps.tsx
        ├── RealCases.tsx            # REAL_CASE_IMAGE_01..04 slots
        ├── CostGuide.tsx
        ├── ConsultationForm.tsx     # Detail form + BUILDER_PREVIEW_ONLY
        ├── Footer.tsx               # Hammer icon placeholder
        ├── FloatingMobileBar.tsx
        ├── PrivacyModal.tsx         # BUILDER_PLACEHOLDER
        └── SuccessModal.tsx
```

### Section map (App.tsx order)

| ID | Section | Component |
|----|---------|-----------|
| A | Header | `Header.tsx` — Hammer icon + 「견적 상담 신청」 |
| B | Hero | `Hero.tsx` — H1 + trust pills + 2-field form |
| C | Hero Quick Form | inside Hero — name/phone/privacy |
| D | Core Strengths | `CoreStrengths.tsx` — 3 pillars |
| E | Service Types | `DemolitionTypes.tsx` |
| F | Process | `ProcessSteps.tsx` — 4 steps |
| G | Case slots | `RealCases.tsx` — `[REAL_CASE_IMAGE_01..04]` |
| H | Cost Guide | `CostGuide.tsx` — 4 cost factors |
| I | Detail Quote | `ConsultationForm.tsx` `#consultation-form` |
| J | Privacy Modal | `PrivacyModal.tsx` |
| K | Sticky CTA | `FloatingMobileBar.tsx` |
| L | Footer | `Footer.tsx` — no legal biz fields yet |
| M | Success | `SuccessModal.tsx` |
| N | Submit | `setTimeout` mock only |
| O | Mock | `BUILDER_PREVIEW_ONLY` comments in Hero + ConsultationForm |
| P | Mobile | Tailwind `sm:`/`lg:`; `pb-16` for sticky bar |

### BUILDER_PREVIEW_ONLY (confirmed)

- `Hero.tsx` L86–98: `setTimeout` → fake success (no receive.php)
- `ConsultationForm.tsx` L112–127: same
- **No fabricated defaults** in Hero state (name/phone empty; agree=false)
- **No** hardcoded `10~25평` / `긴급` / `서울` / `빠른 상담 희망` as form defaults
- Quote: region/type start `''` (unselected) — comment L36–43

---

## B. Existing Production Architecture

```
Browser
  → https://linkconnect.co.kr/merchant/modemo/?lkCode=…
  → merchant/modemo/index.php          ($_GET['id']='modemo')
  → plugin/onoff-builder-bridge/page.php
  → imports/modemo/index.html          (Next static export)
  + window window.LC_LANDING_CONTEXT
       campaign_id=CPA-MODEMO, merchant_id=ADV-0008, …
  → HeroLeadForm / SimpleQuoteSection
  → POST /plugin/linkconnect/api/receive.php
       (JSON or multipart + attachment)
  → validation + honeypot
  → campaign: lkCode link OR campaignId/CPA-MODEMO OR tracking host
  → lc_conversion_create_* → DB (g5_lc_conversions)
  → abuse/duplicate flags
  → JSON { ok, message, duplicate?, conversion? }
  → Frontend inline success (no redirect by default)
  → Merchant AdvertiserDb list/detail (+ attachment preview if stored)
```

| Layer | Path |
|-------|------|
| Edit SoT (current) | `merchant/modemo-onepage/` (Next 16 export) |
| Route | `merchant/modemo/index.php` |
| Serve | `plugin/onoff-builder-bridge/imports/modemo/` |
| Campaign def | `plugin/linkconnect/inc/campaign_modemo.php` |
| Lead API | `plugin/linkconnect/api/receive.php` **DO NOT CHANGE in Phase 2 default** |
| Context | `landing_context.php` + PHP inject |
| Images | `merchant-static.php?m=modemo&p=` |
| Domain | yevely.kr Worker → `/merchant/modemo/` |

---

## C. Hero Form Contract

### Existing Production (`HeroLeadForm.tsx` → `submitConsultation`)

| UI | Existing name/key | Type | Required | Hidden / dependency | Notes |
|----|-------------------|------|----------|---------------------|-------|
| 이름 | `name` | text | Y | — | JSON/multipart field |
| 연락처 | `phone` | tel | Y | auto `010-` format | digits 10–11 |
| 동의 | (FE only) | checkbox | Y | link → `/privacy` | **not sent to receive.php** |
| inquiry | `inquiry` | hidden logical | Y | fixed `"히어로 빠른상담신청"` | |
| lkCode | `lkCode` | tracking | if present | session `lc_modemo_lkCode` | |
| campaignId | `campaignId` | tracking | if no lkCode | default `CPA-MODEMO` | |
| channel | `channel` | tracking | SEO path | `SEO` when no lkCode | |
| utm_* | `utm_source/medium/campaign` | tracking | opt | URL + context | |
| sub_id | `sub_id` | tracking | opt | | |
| method | POST | — | — | `receive.php` | JSON |
| success | inline | — | — | no `/success` redirect | |
| action | `/plugin/linkconnect/api/receive.php` | — | — | or `lead_submit_url` inject | |

### Builder Hero (`Hero.tsx`)

| UI | Builder state | Maps to receive | Action |
|----|---------------|-----------------|--------|
| 이름 | `quickData.name` | `name` | KEEP |
| 연락처 | `quickData.phone` | `phone` | KEEP |
| 동의 | `agreedToTerms` | FE-only (same as today) | KEEP (FE validation) |
| Mock submit | `setTimeout` | — | **REMOVE** → call adapter |

**Fabricated defaults check:** PASS — none found in current Builder Hero.  
**Not a blocker.**

---

## D. Quote Form Contract

### Existing Production (`SimpleQuoteSection`)

| Order | UI | Key in receive / inquiry | Required |
|-------|-----|--------------------------|----------|
| 1 | 이름 | `name` | Y |
| 2 | 연락처 | `phone` | Y |
| 3 | 철거 유형 | folded into `inquiry` (`철거유형:`) | N |
| 4 | 지역 | `region` field **and/or** inquiry | N (free text) |
| 5 | 요청사항 | inquiry `문의:` | N |
| 6 | 견적서 첨부 | `attachment` file | N |
| — | privacy checkbox | — | **absent** (text note only) |

Existing type options: `상가 철거 / 주택 철거 / 사무실 원상복구 / 학원·교육시설 / 폐기물 처리 / 기타`

### Builder Detail (`ConsultationForm.tsx`)

| Builder UI | Existing Field | Exact receive name | Required (Builder) | Mapping | Action |
|------------|----------------|--------------------|--------------------|---------|--------|
| 이름 | name | `name` | Y | direct | KEEP |
| 연락처 | phone | `phone` | Y | direct | KEEP |
| 철거 지역 chips | region | `region` (+ inquiry) | Y (Builder) | map chip → `region` | ADAPT (existing optional; Builder requires — OK FE-side) |
| 철거 유형 chips | serviceType | via `inquiry` | Y (Builder) | `buildInquiryText` | ADAPT taxonomy |
| 문의내용 | message | via `inquiry` | N | | KEEP |
| 동의 | FE | not in API | Y | FE validation | KEEP / IMPROVE vs old Quote |
| 첨부파일 | attachment | `attachment` | — | **missing in Builder** | **ADD** in Phase 2 (restore) |
| Mock | — | — | — | | REMOVE |

**Type taxonomy mismatch (ADAPT via inquiry string, not new API fields):**

| Builder | Closest existing |
|---------|------------------|
| 상가/매장 원상복구 | 상가 철거 / 사무실 원상복구 |
| 인테리어 철거 | 기타 or 상가 |
| 사무실/학원/빌딩 | 사무실 원상복구 / 학원·교육시설 |
| 식당/주방 시설철거 | 기타 |
| 주택/빌라/아파트 | 주택 철거 |
| 부분/바닥/천장 | 기타 |
| 기타(상담 시 문의) | 기타 |

**Do not** invent new receive.php columns for `demolitionType`. Fold into `inquiry`.

---

## E. receive.php Contract

**Preserve as-is.** Frontend Adapter strategy.

Accepted body keys (actual code):

| Key | Role |
|-----|------|
| `name`, `phone`, `email`, `region`, `inquiry` | lead core |
| `lkCode` / `lk_code` | partner link |
| `campaignId` / `campaign_id` / `cid` / `campaign_code` / `cpCode` / `cp_code` | campaign |
| `channel`, `source` | attribution |
| `page_url` / `pageUrl`, `referer` / `referrer` | page meta |
| `utm_source`, `utm_medium`, `utm_campaign` (+ camelCase alts) | UTM |
| `sub_id` | sub |
| `widgetKey` / `widget_key` | embed |
| `website` / `company_url` | honeypot |
| `attachment` | multipart file |

Response: `{ ok, data: { message, duplicate?, … } }` or error JSON.

**If receive.php change seems needed:** prefer Adapter. Document WHY/RISK/ALTERNATIVE — **no change in Phase 1–2 default.**

---

## F. Campaign / ADV Mapping

| Identifier | Where | Preserve |
|------------|-------|----------|
| `CPA-MODEMO` | `campaign_modemo.php`, `resolveCampaignId()`, LC inject `campaign_id` | YES |
| `ADV-0008` | inject `merchant_id` / `landing_id`, campaign ensure | YES |
| `modemo` | PHP `id`, import dir, `merchant-static?m=modemo` | YES (do not rename) |
| `lkCode` | URL / session / context | YES |

No `advertiser_id` / `publisher` fields in modemo frontend path — do not invent.

---

## G. Tracking Preservation

| Tracking | Existing Source | Current Flow | New UI Risk | Preservation Method |
|----------|-----------------|--------------|-------------|---------------------|
| lkCode | query/session/LC_LANDING_CONTEXT | receive `lkCode` | lost if Adapter omits | Port `resolveLkCode` + session key |
| campaignId | default CPA-MODEMO | receive when no lk | wrong campaign | Port `resolveCampaignId` |
| merchant_id | LC inject ADV-0008 | context only (not always POSTed) | low if campaign correct | Keep inject; optional pass-through |
| utm_* | URL + context | receive | lost | Read URLSearchParams on submit |
| sub_id | context / utm_campaign | receive | lost | same as modemo-onepage |
| channel | SEO / partner | receive | wrong SEO/link | Keep SEO when no lkCode |
| referer/page_url | optional body | receive | optional loss | Set `page_url=location.href`, `referer=document.referrer` |
| sessionStorage | `lc_modemo_lkCode`, `modemo_lead_submitted` | FE | wipe | Keep keys |
| GA/GTM | layout env lazyOnload | head scripts | drop if Vite shell omits | Re-add in index.html / layout |
| CustomEvent | lead_submit_* | optional | drop | Re-dispatch from Adapter |
| Naver CTS | component unmounted | N/A | — | optional later |

---

## H. Privacy Contract

### Production (source of truth)

| Item | Source |
|------|--------|
| Hero consent copy | “상담 접수를 위한 개인정보 수집·이용에 동의합니다.” + `/privacy` |
| Quote note | “연락처는 상담 목적에만… 제3자에게 판매하지 않습니다.” (no checkbox) |
| Full policy | `/privacy` (`privacy/index.php`) — 수집항목/목적/보유/제3자/권리 |
| Backend store of consent | **No dedicated DB column** — FE gate only |

### Builder PrivacyModal

Marked `[BUILDER_PLACEHOLDER]`. Contains draft items (성함, 연락처, 지역, 유형, 문의).  
**Phase 2:** replace body with Production `/privacy` summary **or** iframe/link to `/privacy` only.  
Checkbox default: **false** (already). Do not invent marketing / third-party checkboxes unless Production has them (it does not).

---

## I. Real Asset Mapping

Source dir: `merchant/modemo-onepage/public/images/`  
Runtime: `merchant-static.php?m=modemo&p=images/...`

| Builder Slot | Existing Asset (candidate) | Dims (sample) | Current Usage | Recommendation |
|--------------|----------------------------|---------------|---------------|----------------|
| REAL_CASE_IMAGE_01 | `1_천안상가.jpg` or `2_수원상가.jpg` | 634×800 / similar | Hero / Verified | 상가 슬롯 — **photo only**, no invented 평수/지역 labels beyond filename |
| REAL_CASE_IMAGE_02 | `2_여의도사무실.jpg` | 960×720 | Hero / Process / System | 사무실 슬롯 |
| REAL_CASE_IMAGE_03 | `1_용인주택.jpg` | (hero) | Hero / Pricing | 주거/부분 — or `3_목동상가` |
| REAL_CASE_IMAGE_04 | `3_사당상가.jpg` or waste-adjacent site photo | 1400×1866 | Verified | 폐기물/마감 — **do not invent** “반출 톤수” |
| Mid CTA visual | optional | — | — | text CTA OK without new stock |

**Forbidden:** stock Unsplash / AI fill; inventing region/pyeong/cost/duration from photo.

---

## J. Hero Image Candidates

Priority (actual files, demolition-readable):

1. **`2_여의도사무실.jpg`** (960×720) — interior demo clear; good desktop half-bleed  
2. **`1_천안상가.jpg`** (634×800) — portrait; mobile crop friendly  
3. **`3_사당상가.jpg`** (1400×1866) — high-res; watch mobile weight  

Builder Hero currently uses **gradient/dot pattern only** (no photo). Phase 2 may add one candidate as background via merchant-static — optional.

---

## K. Logo

| File | Path | Notes |
|------|------|-------|
| Black | `merchant/modemo-onepage/public/images/logo_black.png` (~17KB) | CustomerLogos title |
| White | `…/logo_white.png` (~17KB) | Header on dark |
| Small | `…/logo_small.png` (~35KB) | |

Builder uses **lucide `Hammer` in blue square** — replace with `logo_black.png` / `logo_white.png` in Phase 2.  
**Do not generate a new logo.**

---

## L. Footer / Business Info

### Production Footer (`modemo-onepage` Footer.tsx + context)

| Field | Value |
|-------|-------|
| Brand UI | 모두의철거 / 모두의 철거 |
| Legal entity | **파밍시티** |
| Representative | 김장수 (context / fallback) |
| Biz no. | 206-47-92777 (fallback) |
| Address | 경기도 과천시 과천대로7나길 37, 디엠 303호 |
| Phone | partner tracking phone when `has_partner_phone` |
| Disclaimer | 중개 플랫폼 — 시공 책임은 파트너 |
| Copyright | 2026 Farmingcity inc. |

### Builder Footer

Brand + privacy button only; **no** 상호/사업자번호. Slot comment for Cursor.  
Phase 2: inject Production legal block; keep brand 「모두의 철거」.

---

## M. Copy Verification

| Copy | Class | Note |
|------|-------|------|
| 모두의 철거 / 철거 견적 상담 | VERIFIED | brand |
| 현장 맞춤 견적 | SAFE_REWRITE | OK if soft |
| 상가·사무실·주택 철거 / 원상복구 / 폐기물 | VERIFIED | matches campaign desc |
| 철거 상담 신청 / 견적 상담 | VERIFIED | |
| Process 4 steps | SAFE_REWRITE | align with “중개+매니저” if needed |
| CoreStrengths 「해체를 진행합니다」 | **UNVERIFIED / REVIEW** | sounds like direct contractor; Production disclaimer = **platform**. Soften to “상담·연결” wording |
| Process 「직접 확인합니다」 | REVIEW | existing often 유선/방문 파트너 — avoid overclaim |
| CostGuide 4 factors | SAFE_REWRITE | educational, no prices |
| RealCases titles | SAFE_REWRITE | after real photos attached |
| PrivacyModal draft | REMOVE → replace with Production | |
| 무료/최저/100%/당일/전국/지원금/완벽/보장 | **absent in Builder** | good |
| Old landing EvidenceStrip 4,130+/13%/4.9 | — | **do not port** unless advertiser re-verifies |

---

## N. Tech Stack Compatibility

| | Builder `모두의-철거` | Current `modemo-onepage` | Other LC landings |
|--|----------------------|--------------------------|-------------------|
| Framework | Vite 6 + React 19 | Next 16 App Router export | mostly Vite |
| CSS | Tailwind 4 (`@tailwindcss/vite`) | CSS Modules + some TW tooling | Vite+TW common |
| Icons | lucide-react | react-icons | mixed |
| Motion | `motion` pkg | framer-motion | — |
| Deploy | none yet | `deploy:imports` → `imports/modemo` | same pattern |
| basePath | unset | `/plugin/.../imports/modemo` | required for Cafe24 |

**Prefer not** to add a second parallel Production app URL.  
Integrate into **existing** `/merchant/modemo/` + `imports/modemo/` pipeline.

---

## O. CSS Isolation

`src/index.css` currently:

- `@import "tailwindcss"`
- `@layer base { html { font-family Pretendard…; scroll-behavior } }`
- global `::-webkit-scrollbar*`

**Risk:** If Builder CSS is loaded globally outside import shell, scrollbar/`html` font could leak.  
Inside `imports/modemo/` SPA-only page, risk is limited to that landing.

**Phase 2 recommendation:** wrap root `div.modu-demolition-landing` and prefer scoped utilities; avoid unscoped `button{}`/`input{}` resets (Builder currently uses Tailwind utilities — good). Keep Pretendard via link or local font like current modemo.

---

## P. Mobile Risks

| Viewport | Risk |
|----------|------|
| 390 | Hero form card OK; sticky bar `pb-16` — verify Quote submit not covered (`FloatingMobileBar` already IO-hides near form) |
| 360–375 | chip grids 2-col may wrap long type labels (`상가/매장 원상복구`) — truncate already |
| 768 | layout switches |
| 1024+ | Hero 12-col grid |

Watch: SuccessModal + PrivacyModal scroll lock; keyboard open + sticky bar overlap.

---

## Q. Builder Mock Removal

| File | Function / block | Phase 2 change |
|------|------------------|----------------|
| `Hero.tsx` | `handleQuickSubmit` `setTimeout` L86–98 | Replace with `submitConsultation` Adapter; real success/error |
| `ConsultationForm.tsx` | `handleSubmit` `setTimeout` L112–127 | same |
| `SuccessModal.tsx` | preview data display | Keep UX; trigger only on API ok |
| `App.tsx` | `handleSubmitSuccess` | Wire error toast/state (currently success-only) |

Add: error UI (inline or modal) for API fail / network.

---

## R. Duplicate Submit

| Layer | Status |
|-------|--------|
| Backend | `lc_abuse_check_recent_duplicate` / `lc_abuse_check_duplicate` — may still create with flags; returns `duplicate: true` in some paths |
| Builder FE | `isSubmitting` + button `disabled` during mock | KEEP and extend until response settles |
| Existing FE | loading state on buttons | Port |

Phase 2 FE minimum: disable on submit → await fetch → re-enable on error; success stay disabled or show modal.

---

## S. Recommended Integration Strategy

### **OPTION C — Hybrid (recommended)**

1. Keep **route / PHP wrapper / imports/modemo / receive.php / CPA-MODEMO / ADV-0008 / merchant-static / yevely** unchanged.  
2. Replace UI SoT: either  
   - **C1 (preferred for velocity):** Evolve `merchant/모두의-철거` into the build source that syncs to `imports/modemo` (Vite like hasugu/bunkrupt), **or**  
   - **C2:** Port Builder components into `modemo-onepage` (Next) — higher rewrite cost.  
3. Add **Frontend Adapter** (port of `modemo-onepage/src/lib/linkconnect.ts` + PartnerContext/LC_LANDING_CONTEXT).  
4. Do **not** modify `receive.php`.

**Why not pure A:** Builder is React SPA, not PHP form markup.  
**Why not pure B alone:** Needs deploy-path + LC inject + image proxy anyway → Hybrid.

**Code grounds:** Other merchant landings already Vite→imports; modemo is the outlier Next app. receive.php already accepts the Adapter field set.

---

## T. Exact File Change Plan (Phase 2 — not executed now)

### Modify / replace (planned)

| Path | CURRENT | CHANGE | WHY | RISK | ROLLBACK |
|------|---------|--------|-----|------|----------|
| `imports/modemo/*` | Next export | New Vite build output | UI renewal | High if broken | Restore backup tree |
| `scripts/sync-modemo-builder.sh` | sync from modemo-onepage/out | Point to 모두의-철거 `dist` **or** keep Next | pipeline | Medium | Revert script |
| `.github/workflows/deploy.yml` | build `modemo-onepage` | build new SoT | CI | Medium | Revert workflow |
| Builder `Hero.tsx` / `ConsultationForm.tsx` | mock | Adapter POST | conversion | Medium | git |
| Builder `Footer.tsx` / `Header.tsx` | Hammer | real logos + legal | compliance | Low | git |
| Builder `PrivacyModal.tsx` | placeholder | Production copy/link | compliance | Low | git |
| Builder `RealCases.tsx` | slots | merchant-static images | trust | Low | git |
| `vite.config.ts` (Builder) | no base | `base` = imports path | assets 404 | High if wrong | fix base |

### NEW (planned)

| Path | WHY |
|------|-----|
| `src/lib/linkconnect.ts` (in Builder) | Adapter from modemo-onepage |
| `src/lib/landingContext.ts` / Partner hooks | phone + privacy URL |
| optional `src/components/ErrorToast.tsx` | fail UX |

### DO NOT TOUCH (Phase 2 default)

- `plugin/linkconnect/api/receive.php`
- `campaign_modemo.php` codes
- DB schema
- yevely Worker (unless asset rewrite needs verify)
- `imports/linkconnect` SPA

---

## U. Backup / Rollback

**Before any Phase 2 write (future):**

```
merchant/modemo-onepage/                          # full tree
plugin/onoff-builder-bridge/imports/modemo/       # full tree
merchant/modemo/index.php
scripts/sync-modemo-builder.sh
scripts/fix-modemo-asset-paths.mjs
.github/workflows/deploy.yml
```

Rollback goal: restore `imports/modemo` + sync script → Production URL identical.

**This Phase:** backup **not** executed.

---

## V. Staging / Preview

**Findings:** No dedicated staging host/URL for modemo in repo workflows. Deploy is FTP to `linkconnect.co.kr` `public_html` on `main` push.

**Safe preview options (Phase 2):**

1. **Local:** `vite preview` / `npm run dev` with Adapter pointed at Production receive (**no test PII**) or mock  
2. **Isolated import (preferred before cutover):** build to e.g. `imports/modemo_preview/` + temporary PHP id — **only if** page.php allows; else local-only  
3. **Do not** ship straight to Production URL without backup + E2E

---

## W. E2E Test Matrix (Phase 2+)

- [ ] Desktop load `/merchant/modemo/`
- [ ] 390px mobile load
- [ ] Hero name validation
- [ ] Hero phone validation
- [ ] Hero privacy validation (unchecked default)
- [ ] Hero successful POST → AdvertiserDb row
- [ ] Hero failed POST → error UI
- [ ] Quote validation (region/type)
- [ ] Quote successful POST
- [ ] Quote failed POST
- [ ] Duplicate / double-click blocked (FE)
- [ ] UTM preservation on lead
- [ ] CPA-MODEMO attribution
- [ ] ADV-0008 merchant visibility
- [ ] Admin/Advertiser list shows lead
- [ ] Privacy Modal = Production-aligned
- [ ] Sticky CTA → form; no cover submit
- [ ] Success UX (modal/inline)
- [ ] Error UX
- [ ] No fabricated defaults in payload
- [ ] No external stock images
- [ ] No Builder mock success path in Production build
- [ ] Attachment (if restored) preview for advertiser
- [ ] yevely.kr images via merchant-static
- [ ] lkCode partner path

---

## X. Risks / Blockers

### Hard BLOCKERS for planning
**None** for Phase 1 READY.

### Soft risks (must resolve in Phase 2 before Production cutover)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Mock submit still in Builder | High | Remove before deploy |
| PrivacyModal ≠ Production | High | Replace with `/privacy` SoT |
| Missing attachment field | Medium | Re-add optional file → `attachment` |
| Type labels ≠ existing select | Low | inquiry mapping |
| Platform vs “해체 진행” copy | Medium | Soften CoreStrengths/Process |
| Next → Vite pipeline switch | High | Backup + staged preview |
| Footer legal missing in Builder | High | Port Production footer |
| RealCases empty slots | Medium | Map existing JPGs only |
| EvidenceStrip fake-feeling stats | — | Do not import unverified numbers |

**Fabricated Hero defaults (10~25평 etc.):** not present → **not a blocker**.

---

## Y. Recommended Phase 2

1. Backup `modemo-onepage` + `imports/modemo` + sync/deploy scripts.  
2. Implement Adapter (`linkconnect.ts`) in Builder; remove `BUILDER_PREVIEW_ONLY`.  
3. Wire logos, footer legal, privacy, real case images via merchant-static.  
4. Soften contractor-implying copy; restore optional attachment.  
5. Configure Vite `base` + sync → `imports/modemo`; update CI.  
6. Local E2E against receive.php with test leads; verify CPA-MODEMO / ADV-0008.  
7. Preview gate → then Production cutover (separate approval).  
8. Keep `receive.php` untouched.

---

## Appendix: receive payload Adapter sketch (documentation only)

```ts
// Hero
{ name, phone, inquiry: '히어로 빠른상담신청' | '철거 상담 신청', lkCode?, campaignId?, channel?, utm_* }

// Quote
{ name, phone, region, inquiry: buildInquiryText({ serviceType, region, message, fileName }), attachment? }
```

---

**Phase 1 complete. No Production files modified for cutover.**
