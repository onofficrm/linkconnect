# 모두의 철거 — Phase 2 Local Hybrid Integration Report

**Date:** 2026-09-01  
**Strategy:** OPTION C Hybrid (신규 Builder UI + 기존 receive.php Contract)  
**Safety:** LOCAL / DEVELOPMENT ONLY — no Production deploy, FTP, git push, or Production DB write  
**Verdict:** see final line

---

## A. Backup

| Item | Value |
|------|-------|
| Backup dir | `backups/modu-demolition-phase2-20260901-000249/` |
| Manifest | `backups/modu-demolition-phase2-20260901-000249/BACKUP.md` |
| Scope | `merchant/modemo-onepage/`, `imports/modemo/`, wrapper, sync scripts, pre-edit Builder snapshot |
| Production | **not** backed up / **not** modified |

Rollback: restore from `BACKUP.md` instructions (rsync backup → original paths). Local `imports/modemo` can be restored from backup before re-syncing Vite dist.

---

## B. Builder Components Integrated

From `merchant/모두의-철거/` into LinkConnect `imports/modemo` pipeline:

| Section | Component | Status |
|---------|-----------|--------|
| Header | `Header.tsx` | Real logo |
| Hero + Quick Form | `Hero.tsx` | Adapter + real hero photo |
| Core Strengths | `CoreStrengths.tsx` | Copy softened |
| Service Types | `DemolitionTypes.tsx` | Copy softened |
| Process | `ProcessSteps.tsx` | Copy softened |
| Cases | `RealCases.tsx` | Real JPGs |
| Cost Guide | `CostGuide.tsx` | Softened |
| Quote Form | `ConsultationForm.tsx` | Adapter + attachment |
| Privacy | `PrivacyModal.tsx` | Production-aligned + `/privacy` |
| Sticky CTA | `FloatingMobileBar.tsx` | Kept (hide on form) |
| Footer | `Footer.tsx` | Legal entity + brand |
| Success / Error | `SuccessModal` + `ErrorToast` | Adapter-driven |

**Not imported:** React Router, Vite preview-only bootstrap extras, Pretendard CDN, Builder fake success.

---

## C. Hero Form Adapter

| Field | Mapping |
|-------|---------|
| 이름 | `name` |
| 연락처 | `phone` |
| 동의 | FE-only (unchecked default) |
| inquiry | fixed `"히어로 빠른상담신청"` |
| campaign | `CPA-MODEMO` (no lkCode) |
| tracking | `lkCode` session, UTM, `page_url`, `referer` |

**No fabricated** region / type / pyeong / schedule on Hero submit.  
`assertHeroPayloadClean()` enforces in dry-run path.

---

## D. Quote Form Adapter

| Builder UI | receive.php | Action |
|------------|-------------|--------|
| name / phone | direct | KEEP |
| region chips | `region` + inquiry | ADAPT |
| type chips | via `inquiry` (`철거유형:`) | ADAPT |
| message | inquiry `문의:` | KEEP |
| privacy checkbox | FE-only | IMPROVE vs old Quote |
| attachment | `attachment` multipart | RESTORED |

No new Backend fields.

---

## E. Attachment Restore

- `input type="file" name="attachment"`
- `accept="image/*,.pdf"`
- max 10MB client check
- wording: **「타업체 견적서 첨부」** (+ optional site photo hint)
- Adapter: `FormData` + `attachment` when file present

---

## F. Privacy

- Builder placeholder body replaced with Production-aligned summary (수집/목적/보유/제3자/거부)
- Full policy link: `/privacy` (no new privacy page)
- Checkbox default **unchecked**; required before submit
- Consent not sent as new DB column (same as Production)

---

## G. Logo

- Header: `logo_black.png`
- Footer: `logo_white.png`
- Hammer brand icon **removed**
- Lucide Hammer remains only as decorative service/process icon (not brand mark)

---

## H. Real Assets

| Slot | File |
|------|------|
| Hero BG | `2_여의도사무실.jpg` |
| Case 01 | `1_천안상가.jpg` |
| Case 02 | `2_여의도사무실.jpg` |
| Case 03 | `1_용인주택.jpg` |
| Case 04 | `3_사당상가.jpg` |

Copied under `merchant/모두의-철거/public/images/` and synced to `imports/modemo/images/`.  
No Unsplash / stock / AI / `REAL_CASE_IMAGE_*` placeholders remain.

---

## I. Copy Changes

| Before | After |
|--------|-------|
| 「해체를 진행합니다」 | 「상담·연결을 진행합니다」 |
| 「직접 확인합니다」 | 「확인·안내합니다」 |
| 「정확한 견적」 | 「견적은 상담을 통해…」 |
| Case invented titles/regions | 「철거 현장」 only |
| Meta “전문…빠르고” | Neutralized |

---

## J. Footer

- Brand UI: **모두의 철거**
- Legal: **파밍시티** / 김장수 / `206-47-92777` / 과천 주소
- Platform disclaimer preserved
- Copyright: Farmingcity inc.

---

## K. Campaign Preservation

| Key | Value |
|-----|-------|
| Campaign | `CPA-MODEMO` |
| ADV / merchant_id | `ADV-0008` (context inject; not changed in PHP) |
| Route | `/merchant/modemo/` |
| receive.php | **unchanged** |

---

## L. Tracking Preservation

Adapter preserves: `lkCode` (`lc_modemo_lkCode` session), `campaignId`, `channel`, `utm_*`, `sub_id`, `page_url`, `referer`, `LC_LANDING_CONTEXT` overrides.  
Query params not stripped by SPA (no client router).

---

## M. CSS Isolation

- Root wrapper: `.modu-demolition-landing`
- Font/scrollbar scoped under root
- Pretendard CDN **removed**
- System / Apple SD Gothic / Noto Sans KR stack

---

## N. Mock Removal

Removed all `BUILDER_PREVIEW_ONLY` / `setTimeout` fake success from Hero & ConsultationForm.  
Success UI only after Adapter `ok: true` (dry-run or real).

---

## O. Duplicate Submit Protection

- `isSubmitting` state
- Submit button `disabled`
- Early return if already submitting
- Inputs disabled while submitting

---

## P. Success / Error Flow

| Path | UI |
|------|----|
| Dry-run / real ok | SuccessModal (`로컬 검증 완료` vs `접수 완료`) |
| Validation | ErrorToast `validation` |
| Network | ErrorToast `network` |
| Server | ErrorToast `server` |

No stack traces / DB internals exposed.

---

## Q. Build Pipeline

| Item | Value |
|------|-------|
| Edit SoT (Phase 2 candidate) | `merchant/모두의-철거/` |
| Vite `base` | `/plugin/onoff-builder-bridge/imports/modemo/` |
| Scripts | `lint` / `typecheck` / `build` / `deploy:imports` |
| Sync | `scripts/sync-modemo-builder.sh` → `imports/modemo` |
| Dry-run | `VITE_LC_DRY_RUN=1` (`.env` + `.env.production`) |
| CI `deploy.yml` | **unchanged** (still `modemo-onepage`) — Phase 3 switch |

---

## R. Build Results

| Check | Result |
|-------|--------|
| `npm run lint` (`tsc --noEmit`) | PASS |
| `npm run build` | PASS (`index-*.js` ~258KB, css ~43KB) |
| `npm run deploy:imports` (local) | PASS → `imports/modemo` |
| Payload script | PASS (`scripts/verify-modemo-payload.mjs`) |

---

## S. Local Preview

| Item | Value |
|------|-------|
| URL | http://127.0.0.1:4173/plugin/onoff-builder-bridge/imports/modemo/ |
| HTML | 200 |
| `logo_black.png` | 200 |
| Hero JPG | 200 |
| Submit | **Dry-run only** (no Production POST) |

Manual UI checklist: Hero form, Quote form, Privacy modal, attachment, Sticky CTA, Success/Error — exercise via preview.

---

## T. Payload Verification

Static test passed:

- Hero: `inquiry=히어로 빠른상담신청`, no region/type invention, `campaignId=CPA-MODEMO`
- Quote: `region` + inquiry fold + `attachment` name contract
- ADV-0008 preserved as campaign/merchant identity (server inject)

---

## U. Asset Validation

- No `REAL_CASE_IMAGE_*`
- No unsplash/stock
- Logos + 4 case images + hero present under `dist/images` / `imports/modemo/images`

---

## V. Brand Validation

User-facing components / `index.html`: **0** matches for `MODEMO` / `모데모` / `무촌`.  
Internal path/campaign (`modemo`, `CPA-MODEMO`, `lc_modemo_lkCode`) remain intentionally.

---

## W. Security Check

No new API secrets, DB credentials, private keys, or admin credentials in client source.

---

## X. Git Diff (high level)

**Touched (local):**

- `merchant/모두의-철거/**` (Vite SoT + Adapter + UI)
- `scripts/sync-modemo-builder.sh` (src → `모두의-철거/dist`)
- `plugin/onoff-builder-bridge/imports/modemo/**` (local sync output)
- `backups/modu-demolition-phase2-…/`
- this report

**Not modified:**

- `plugin/linkconnect/api/receive.php`
- Campaign / ADV PHP defs
- `.github/workflows/deploy.yml` (Production still builds `modemo-onepage`)
- No git push

---

## Y. Rollback

1. Restore files per `backups/modu-demolition-phase2-20260901-000249/BACKUP.md`
2. Or re-sync old Next `modemo-onepage/out` after reverting `sync-modemo-builder.sh`
3. Production untouched — rollback is local workspace only

---

## Z. Phase 3 Recommendation

1. Flip `VITE_LC_DRY_RUN=0` for staging smoke **only after** staging receive endpoint exists (or controlled test)
2. Switch CI `deploy.yml` Build modemo step: `merchant/modemo-onepage` → `merchant/모두의-철거`
3. Keep `receive.php` unchanged
4. Staging visual QA (390px + desktop) with real partner `lkCode`
5. Then Production deploy via existing FTP/CI mechanism — **not** ad-hoc rsync
6. Monitor first live leads + attachment preview
7. Do **not** copy SPA to onoffcpa (`no-onoffcpa-spa-copy` rule)

---

## FINAL VERDICT

**MODU_DEMOLITION_PHASE2_LOCAL_READY**

Production deploy was **not** performed.
