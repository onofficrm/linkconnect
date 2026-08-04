# 광고 랜딩 성능 기준

시각 디자인·카피는 그대로 두고, **로드/마운트 전략**만 맞춘다.

## 필수 체크리스트 (신규·개편 랜딩)

1. **첫 뷰포트만 즉시** — 헤더·히어로·주요 CTA(또는 퀴즈/폼 진입).
2. **하단은 `DeferredMount`** — `merchant/_landing-perf/DeferredMount.tsx` 를 `src/components/` 로 **복사**해 사용(Vite는 프로젝트 밖 JSX를 resolve하지 못함).
3. **라우트/대형 섹션은 lazy** — Vite: `React.lazy` + `Suspense` / Next: `next/dynamic`.
4. **벤더 청크** — Vite `landingManualChunks` 적용 (`viteManualChunks.ts`).
5. **랜딩 컨텍스트** — `LC_LANDING_CONTEXT.has_partner_phone` 이 있으면 `landing_context` API 생략 (`skipLandingContextFetch`).
6. **앵커 스크롤** — 지연 마운트된 폼은 `scrollToId` 로 재시도.
7. **배포** — `npm run deploy:imports` → `imports/<slug>/`. 캐시·gzip 은 `imports/.htaccess` 가 전 랜딩 공통.

## Vite 예시

```ts
import { landingManualChunks } from '../_landing-perf/viteManualChunks';

build: {
  cssCodeSplit: true,
  rollupOptions: {
    output: { manualChunks: landingManualChunks },
  },
}
```

## PartnerContext 예시

```ts
import { shouldSkipLandingContextFetch } from '../../_landing-perf/skipLandingContextFetch';

if (!shouldSkipLandingContextFetch()) {
  await fetchLandingContext();
}
```

## Next(static export) 예시

- 히어로 아래 섹션: `next/dynamic` + 클라이언트 `DeferredMount`.
- `basePath` / `assetPrefix` 는 imports 경로 유지.
