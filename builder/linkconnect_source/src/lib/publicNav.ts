export interface NavLinkItem {
  to: string;
  label: string;
  accent?: 'emerald' | 'cyan';
  /** 홈 섹션 앵커 (예: call-db → /#call-db) */
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

/** 캠페인·프로모션 */
export const campaignNavItems: NavLinkItem[] = [
  { to: '/cpa-list', label: 'CPA' },
  { to: '/cps', label: 'CPS' },
  { to: '/events', label: '이벤트/프로모션' },
];

/** 커뮤니티 대메뉴 */
export const communityNavItem: NavLinkItem = {
  to: '/community',
  label: '자유게시판',
};

/** 푸터 — 캠페인 */
export const footerCampaignNavItems: NavLinkItem[] = [
  { to: '/cpa-list', label: 'CPA' },
  { to: '/cps', label: 'CPS' },
  { to: '/', label: '콜디비란?', scrollTarget: 'call-db' },
];

/** 푸터 — 서비스 */
export const footerServiceNavItems: NavLinkItem[] = [
  { to: '/partner', label: '파트너센터', accent: 'emerald' },
  { to: '/advertiser', label: '광고주센터', accent: 'cyan' },
  { to: '/events', label: '이벤트/프로모션' },
  communityNavItem,
];

/** 센터 */
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
    if (item.scrollTarget) return false;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });
}
