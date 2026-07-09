export type NavMenuItem = {
  label: string;
  tab: number;
};

export type NavSection = {
  id: 'rehabilitation' | 'bankruptcy' | 'debt-collection';
  label: string;
  basePath: string;
  title: string;
  description: string;
  items: NavMenuItem[];
};

export const SITE_NAV_SECTIONS: NavSection[] = [
  {
    id: 'rehabilitation',
    label: '개인회생',
    basePath: '/rehabilitation/info',
    title: '개인회생 안내',
    description: '과도한 채무로 고통받는 분들을 위한 합법적인 채무조정 제도',
    items: [
      { label: '개인회생이란?', tab: 0 },
      { label: '개인회생 신청자격', tab: 1 },
      { label: '개인회생 준비서류', tab: 2 },
      { label: '개인회생 절차', tab: 3 },
      { label: '개인회생 경험담', tab: 4 },
      { label: '개인회생 FAQ', tab: 5 },
    ],
  },
  {
    id: 'bankruptcy',
    label: '개인파산',
    basePath: '/bankruptcy',
    title: '개인파산 안내',
    description: '현재 자신의 모든 재산으로 모든 채무를 변제할 수 없는 지급불능 상태일 때',
    items: [
      { label: '개인파산이란?', tab: 0 },
      { label: '개인파산 신청자격', tab: 1 },
      { label: '개인파산 준비서류', tab: 2 },
      { label: '개인파산 절차', tab: 3 },
      { label: '개인파산 경험담', tab: 4 },
      { label: '개인파산 FAQ', tab: 5 },
    ],
  },
  {
    id: 'debt-collection',
    label: '채권추심정보',
    basePath: '/debt-collection',
    title: '채권추심 대처안내',
    description: '불법 채권추심으로부터 안전하게 보호받고 대처하는 방법',
    items: [
      { label: '채권추심이란?', tab: 0 },
      { label: '불법 채권추심 대처방법', tab: 1 },
      { label: '독촉전화 대처방법', tab: 2 },
      { label: '지급명령을 받았을 때', tab: 3 },
      { label: '급여압류·통장압류 대처', tab: 4 },
      { label: '내용증명을 받았을 때', tab: 5 },
      { label: '채권추심 FAQ', tab: 6 },
    ],
  },
];

export function navItemHref(section: NavSection, tab: number): string {
  if (tab <= 0) return section.basePath;
  return `${section.basePath}?tab=${tab}`;
}

export function getNavSection(id: NavSection['id']): NavSection {
  const section = SITE_NAV_SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown nav section: ${id}`);
  return section;
}
