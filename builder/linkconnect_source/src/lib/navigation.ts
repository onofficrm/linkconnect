const SCROLL_KEY = 'lc-scroll-target';
/** 헤더 h-20(80px)과 동일 — JS 오프셋 기준 */
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

export function getFixedHeaderOffset(): number {
  const header = document.querySelector<HTMLElement>('header[data-lc-nav]');
  if (header) {
    const h = Math.ceil(header.getBoundingClientRect().height);
    if (h > 0) return h;
  }
  return HOME_SCROLL_OFFSET_PX;
}

/**
 * 고정 헤더 높이를 빼서 섹션 상단이 헤더 바로 아래에 오도록 스크롤.
 */
export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  const offset = getFixedHeaderOffset();
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior });

  try {
    const next = `#${id}`;
    if (window.location.hash !== next) {
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
    }
  } catch {
    /* ignore */
  }

  return true;
}

/** 섹션이 아직 없거나 레이아웃이 변하는 경우를 대비해 재시도·재보정 */
export function scrollToSectionWhenReady(id: string, behavior: ScrollBehavior = 'smooth') {
  let found = false;

  const attempt = (b: ScrollBehavior) => {
    if (scrollToSection(id, b)) {
      found = true;
      return true;
    }
    return false;
  };

  if (attempt(behavior)) {
    window.setTimeout(() => scrollToSection(id, 'auto'), 200);
    window.setTimeout(() => scrollToSection(id, 'auto'), 450);
    return;
  }

  [50, 120, 250, 450, 800].forEach((ms) => {
    window.setTimeout(() => {
      if (!found) {
        attempt(behavior);
      } else {
        scrollToSection(id, 'auto');
      }
    }, ms);
  });
}

export function handleSectionLink(id: string) {
  queueScrollTo(id);
}

export function resolveHashSectionId(hash?: string): string | null {
  const raw = (hash ?? window.location.hash).replace(/^#/, '').trim();
  return raw || null;
}
