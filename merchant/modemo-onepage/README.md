# 모두의철거 CPA 랜딩 (LinkConnect)

원페이지 소스: `merchant/modemo-onepage/`  
공개 URL: `/merchant/modemo/?lkCode={code}`  
빌드 산출물: `plugin/onoff-builder-bridge/imports/modemo/`

## 연락 채널 (CPA 규칙)

- 필수 CTA: 견적 신청 폼 → `/plugin/linkconnect/api/receive.php`
- 선택: 콜디비 안심번호(`partner_phone`)가 있을 때만 전화 CTA
- 광고주 직통번호·카카오 채널 금지

## 로컬

```bash
cd merchant/modemo-onepage
npm ci
npm run dev          # basePath 없이 보려면 next.config의 basePath를 임시 제거
npm run deploy:imports
```

## 캠페인 등록

```bash
php scripts/apply-modemo-campaign.php
# 또는 관리자: apply_modemo_campaign / ops apply_modemo_campaign
```

ADV-0008(모두의철거)이 있으면 자동 연결. `merchant_price` 45,000원(VAT 제외 계약 기준).
