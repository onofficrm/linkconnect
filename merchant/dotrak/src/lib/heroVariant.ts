export type HeroVariant = 'result' | 'price';

const KEY = 'lc_dotrak_hero';

/** ?hero=price 는 가격 강조, 그 외(기본)는 시술 결과 강조. 한 세션 안에서는 유지한다. */
export function resolveHeroVariant(): HeroVariant {
  const query = new URLSearchParams(window.location.search).get('hero');
  if (query === 'price' || query === 'result') {
    sessionStorage.setItem(KEY, query);
    return query;
  }
  const stored = sessionStorage.getItem(KEY);
  if (stored === 'price' || stored === 'result') return stored;
  return 'result';
}
