import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SCROLL_KEY } from '../lib/navigation';

/**
 * 페이지 이동 시 스크롤을 맨 위로.
 * 해시(#section)나 홈 섹션 스크롤 큐가 있으면 건드리지 않음.
 */
export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    try {
      if (sessionStorage.getItem(SCROLL_KEY)) return;
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash, key]);

  return null;
}
