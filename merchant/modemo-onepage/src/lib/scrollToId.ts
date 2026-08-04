/**
 * DeferredMount / lazy 섹션 안의 앵커로 스크롤.
 * 아직 DOM에 없으면 짧게 재시도.
 */
export function scrollToId(
  id: string,
  options?: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition; retries?: number; intervalMs?: number },
): void {
  const behavior = options?.behavior ?? 'smooth';
  const block = options?.block ?? 'start';
  const retries = options?.retries ?? 24;
  const intervalMs = options?.intervalMs ?? 100;

  const tryScroll = (n: number) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior, block });
      return;
    }
    if (n < retries) {
      window.setTimeout(() => tryScroll(n + 1), intervalMs);
    }
  };

  tryScroll(0);
}
