import { useEffect, useRef, useState, type ReactNode } from 'react';

export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    observer.observe(el);
    const fallback = window.setTimeout(() => setShown(true), 2200);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal${shown ? ' in' : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
