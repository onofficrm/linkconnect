const SCROLL_KEY = 'lc-scroll-target';

/** 헤더 바 h-20(80px) — 모바일 드롭다운 높이는 제외 */
export const HOME_SCROLL_OFFSET_PX = 80;

export function queueScrollTo(id: string) {
  try {
    sessionStorage.setItem(SCROLL_KEY, id);
  } catch {
    /* ignore */
  }
}

export function consumeScrollTarget(): string | null {
  try {
    const value = sessionStorage.getItem(SCROLL_KEY);
    if (value) {
      sessionStorage.removeItem(SCROLL_KEY);
      return value;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** 고정 네비 바 높이만 측정 (펼친 모바일 메뉴 제외) */
export function getFixedHeaderOffset(): number {
  const bar = document.querySelector<HTMLElement>('[data-lc-nav-bar]');
  if (bar) {
    const h = Math.ceil(bar.getBoundingClientRect().height);
    if (h > 0) return h;
  }
  return HOME_SCROLL_OFFSET_PX;
}

function syncHash(id: string) {
  try {
    const next = `#${id}`;
    if (window.location.hash !== next) {
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
    }
  } catch {
    /* ignore */
  }
}

/**
 * 홈 섹션 앵커로 스크롤.
 * 앵커는 섹션 패딩 안쪽(제목 바로 위)에 두고 scroll-margin-top과 JS 오프셋을 함께 씀.
 */
export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  const offset = getFixedHeaderOffset();
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior });
  syncHash(id);
  return true;
}

/** 모바일 메뉴 닫힘·레이아웃 반영 후 스크롤 */
export function scrollToSectionAfterPaint(id: string, behavior: ScrollBehavior = 'smooth') {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      scrollToSection(id, behavior);
      // 닫힌 헤더 높이로 한 번 더 보정
      window.setTimeout(() => scrollToSection(id, 'auto'), 80);
    });
  });
}

/**
 * 섹션 미마운트·CPA/CPS 비동기 로딩으로 높이가 바뀌는 경우까지 재보정.
 */
export function scrollToSectionWhenReady(id: string, behavior: ScrollBehavior = 'smooth') {
  let stopped = false;
  let debounce: number | undefined;

  const go = (b: ScrollBehavior) => {
    if (stopped) return;
    scrollToSection(id, b);
  };

  const armResizeSync = () => {
    const root = document.querySelector('main') ?? document.body;
    if (!root || typeof ResizeObserver === 'undefined') {
      [120, 350, 700, 1200].forEach((ms) => {
        window.setTimeout(() => go('auto'), ms);
      });
      return;
    }

    const ro = new ResizeObserver(() => {
      if (stopped) return;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => go('auto'), 40);
    });
    ro.observe(root);

    [120, 350, 700, 1200].forEach((ms) => {
      window.setTimeout(() => go('auto'), ms);
    });

    window.setTimeout(() => {
      ro.disconnect();
      stopped = true;
    }, 2200);
  };

  window.requestAnimationFrame(() => {
    if (!scrollToSection(id, behavior)) {
      [50, 120, 250, 450, 800].forEach((ms) => {
        window.setTimeout(() => {
          if (!stopped && scrollToSection(id, behavior)) {
            armResizeSync();
          }
        }, ms);
      });
      return;
    }
    armResizeSync();
  });
}

export function handleSectionLink(id: string) {
  queueScrollTo(id);
}

export function resolveHashSectionId(hash?: string): string | null {
  const raw = (hash ?? window.location.hash).replace(/^#/, '').trim();
  return raw || null;
}
