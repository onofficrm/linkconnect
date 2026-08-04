/**
 * 템플릿: 각 랜딩의 src/components/DeferredMount.tsx 로 복사해서 사용.
 * (Vite는 프로젝트 밖 JSX 모듈의 react resolve를 보장하지 않음)
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

type DeferredMountProps = {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: number;
  idleFallbackMs?: number;
  className?: string;
};

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
