'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type DeferredMountProps = {
  children: ReactNode;
  /** 뷰포트에 들어오기 전 미리 로드할 여유 (px) */
  rootMargin?: string;
  /** 최소 플레이스홀더 높이 */
  minHeight?: number;
  /** idle 후 강제 마운트 (ms). 0이면 Intersection만 사용 */
  idleFallbackMs?: number;
  /** 그리드 레이아웃 유지용 (예: lg:col-span-12) */
  className?: string;
};

/**
 * 첫 페인트 이후 또는 뷰포트 진입 시에만 children 마운트.
 * 광고 랜딩 하단 섹션 지연 로딩용. (디자인/마크업은 그대로 두고 마운트 시점만 늦춤)
 * 원본: merchant/_landing-perf/DeferredMount.tsx
 */
export default function DeferredMount({
  children,
  rootMargin = '240px 0px',
  minHeight = 80,
  idleFallbackMs = 1800,
  className,
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          markReady();
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (idleFallbackMs > 0) {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof w.requestIdleCallback === 'function') {
        idleId = w.requestIdleCallback(markReady, { timeout: idleFallbackMs });
      } else {
        timeoutId = setTimeout(markReady, idleFallbackMs);
      }
    }

    return () => {
      cancelled = true;
      io.disconnect();
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== undefined && typeof w.cancelIdleCallback === 'function') {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [ready, rootMargin, idleFallbackMs]);

  return (
    <div ref={ref} className={className} style={ready ? undefined : { minHeight }}>
      {ready ? children : null}
    </div>
  );
}
