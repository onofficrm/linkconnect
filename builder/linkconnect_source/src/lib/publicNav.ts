import { isCpsUiVisible } from './auth';

export interface NavLinkItem {
  to: string;
  label: string;
  accent?: 'emerald' | 'cyan';
  /** 홈(/)에 있을 때 해당 섹션으로 스크롤 (예: cpa → #cpa) */
  scrollTarget?: string;
}

/**
 * 이벤트/프로모션 공개 메뉴 노출 여부.
 * 나중에 복원: true 로 바꾸면 헤더·푸터 메뉴가 다시 표시됩니다.
 */
export const EVENTS_MENU_ENABLED = false;

/** CPS 메뉴 항목 필터 — CPS_UI_ENABLED=false 이면 /cps 숨김 (복원: auth.ts CPS_UI_ENABLED) */
export function filterCpsNavItems(items: NavLinkItem[]): NavLinkItem[] {
  if (isCpsUiVisible()) return items;
  return items.filter((item) => item.to !== '/cps' && !item.to.startsWith('/cps/'));
}

/** 회사소개 드롭다운 하위 메뉴 */
export const companySubItems: NavLinkItem[] = [
  { to: '/about', label: '회사소개' },
  { to: '/affiliate', label: '제휴마케팅이란?' },
  { to: '/', label: '콜디비란?', scrollTarget: 'call-db' },
  { to: '/notice', label: '공지사항' },
];

/** @deprecated Footer 등 — companySubItems 사용 */
export const companyNavItems = companySubItems;

/** 캠페인·프로모션 — 독립 목록 페이지로 이동 (카테고리 필터는 각 페이지에서) */
const campaignNavItemsAll: NavLinkItem[] = [
  { to: '/cpa-list', label: 'CPA' },
  { to: '/cps', label: 'CPS' },
  // 복원: EVENTS_MENU_ENABLED = true
  ...(EVENTS_MENU_ENABLED
    ? [{ to: '/events', label: '이벤트/프로모션', scrollTarget: 'events' } satisfies NavLinkItem]
    : []),
];

export function getCampaignNavItems(): NavLinkItem[] {
  return filterCpsNavItems(campaignNavItemsAll);
}

/** @deprecated getCampaignNavItems() 사용 */
export const campaignNavItems = campaignNavItemsAll;

/** 커뮤니티 대메뉴 */
export const communityNavItem: NavLinkItem = {
  to: '/community',
  label: '자유게시판',
};

/** 푸터 — 캠페인 */
const footerCampaignNavItemsAll: NavLinkItem[] = [
  { to: '/cpa-list', label: 'CPA' },
  { to: '/cps', label: 'CPS' },
  { to: '/', label: '콜디비란?', scrollTarget: 'call-db' },
];

export function getFooterCampaignNavItems(): NavLinkItem[] {
  return filterCpsNavItems(footerCampaignNavItemsAll);
}

/** @deprecated getFooterCampaignNavItems() 사용 */
export const footerCampaignNavItems = footerCampaignNavItemsAll;

/** CPA/CPS 메뉴 활성 경로 (상세 페이지 포함) */
export function isCampaignNavActive(pathname: string, to: string): boolean {
  if (to === '/cpa-list') {
    return pathname === '/cpa-list' || pathname.startsWith('/cpa/');
  }
  if (to === '/cps') {
    return pathname === '/cps' || pathname.startsWith('/cps/');
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** 푸터 — 서비스 */
export const footerServiceNavItems: NavLinkItem[] = [
  { to: '/partner', label: '파트너센터', accent: 'emerald' },
  { to: '/advertiser', label: '광고주센터', accent: 'cyan' },
  // 복원: EVENTS_MENU_ENABLED = true
  ...(EVENTS_MENU_ENABLED
    ? [{ to: '/events', label: '이벤트/프로모션', scrollTarget: 'events' } satisfies NavLinkItem]
    : []),
  communityNavItem,
];

/** 센터 — 홈에서도 섹션 스크롤이 아니라 센터로 바로 이동 */
export const centerNavItems: NavLinkItem[] = [
  { to: '/partner', label: '파트너센터', accent: 'emerald' },
  { to: '/advertiser', label: '광고주센터', accent: 'cyan' },
];

/** 관리자센터 (헤더 우측 끝 배지) */
export const adminNavItem: NavLinkItem = {
  to: '/admin',
  label: '관리자센터',
  accent: 'cyan',
};

export function isCompanyNavActive(pathname: string): boolean {
  return companySubItems.some((item) => {
    if (item.scrollTarget && item.to === '/') return false;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });
}
