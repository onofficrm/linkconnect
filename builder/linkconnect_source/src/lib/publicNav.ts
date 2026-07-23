export interface NavLinkItem {
  to: string;
  label: string;
  accent?: 'emerald' | 'cyan';
  /** 홈(/)에 있을 때 해당 섹션으로 스크롤 (예: cpa → #cpa) */
  scrollTarget?: string;
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

/** 캠페인·프로모션 — 홈에서는 섹션 스크롤, 그 외 경로에서는 전용 페이지 */
export const campaignNavItems: NavLinkItem[] = [
  { to: '/cpa-list', label: 'CPA', scrollTarget: 'cpa' },
  { to: '/cps', label: 'CPS', scrollTarget: 'cps' },
  { to: '/events', label: '이벤트/프로모션', scrollTarget: 'events' },
];

/** 커뮤니티 대메뉴 */
export const communityNavItem: NavLinkItem = {
  to: '/community',
  label: '자유게시판',
};

/** 푸터 — 캠페인 */
export const footerCampaignNavItems: NavLinkItem[] = [
  { to: '/cpa-list', label: 'CPA', scrollTarget: 'cpa' },
  { to: '/cps', label: 'CPS', scrollTarget: 'cps' },
  { to: '/', label: '콜디비란?', scrollTarget: 'call-db' },
];

/** 푸터 — 서비스 */
export const footerServiceNavItems: NavLinkItem[] = [
  { to: '/partner', label: '파트너센터', accent: 'emerald', scrollTarget: 'partner' },
  { to: '/advertiser', label: '광고주센터', accent: 'cyan', scrollTarget: 'advertiser' },
  { to: '/events', label: '이벤트/프로모션', scrollTarget: 'events' },
  communityNavItem,
];

/** 센터 */
export const centerNavItems: NavLinkItem[] = [
  { to: '/partner', label: '파트너센터', accent: 'emerald', scrollTarget: 'partner' },
  { to: '/advertiser', label: '광고주센터', accent: 'cyan', scrollTarget: 'advertiser' },
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
