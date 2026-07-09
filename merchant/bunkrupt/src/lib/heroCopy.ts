import { getPartnerData } from './partnerData';

export type HeroCopy = {
  badge: string;
  title: string;
  subtitle: string;
  hint: string;
  primaryCta: string;
  secondaryCta: string;
};

const defaultCopy: HeroCopy = {
  badge: '개인회생 비공개 무료 자격진단',
  title: '3분 만에 내 가능성\n무료 확인',
  subtitle: '소득은 있지만 채무 상환이 어려운 분들을 위해\n개인회생 가능 여부를 빠르게 확인해드립니다.',
  hint: '상담 전, 현재 채무와 소득 상황을 기준으로\n진행 가능성을 먼저 확인해보세요.',
  primaryCta: '30초 무료 확인',
  secondaryCta: '지금 전화상담하기',
};

export function resolveHeroCopy(): HeroCopy {
  const { utm_source, utm_medium, utm_campaign } = getPartnerData();
  const channel = `${utm_source} ${utm_medium} ${utm_campaign}`.toLowerCase();

  if (channel.includes('blog') || channel.includes('블로그')) {
    return {
      ...defaultCopy,
      badge: '블로그 방문자 전용 무료 진단',
      title: '블로그에서 보신 내용,\n내 상황에도 해당될까요?',
      subtitle: '현재 채무·소득 기준으로 개인회생 검토 가능 여부를 무료로 확인해드립니다.',
    };
  }

  if (channel.includes('cafe') || channel.includes('카페')) {
    return {
      ...defaultCopy,
      badge: '카페 방문자 전용 무료 진단',
      title: '같은 고민, 혼자가 아닙니다',
      subtitle: '비슷한 상황의 많은 분들이 먼저 무료 자격진단을 받고 있습니다.',
    };
  }

  if (
    channel.includes('독촉') ||
    channel.includes('collection') ||
    channel.includes('압류') ||
    channel.includes('연체')
  ) {
    return {
      ...defaultCopy,
      badge: '긴급 상담 · 비밀 보장',
      title: '독촉 전화 받고 계신가요?',
      subtitle: '연체·독촉·압류 상황도 먼저 가능 여부부터 확인할 수 있습니다.',
      hint: '가족·직장에 알리지 않고 조용히 상담받을 수 있습니다.',
    };
  }

  if (channel.includes('search') || channel.includes('naver') || channel.includes('google')) {
    return {
      ...defaultCopy,
      title: '월 변제액부터,\n내 가능성 무료 확인',
      subtitle: '검색하신 개인회생 정보를 바탕으로 현재 상황에 맞는 방향을 안내해드립니다.',
    };
  }

  return defaultCopy;
}

export function isCampaignTraffic(): boolean {
  const data = getPartnerData();
  return Boolean(
    data.lkCode ||
      data.campaign_id ||
      data.partner_id ||
      data.utm_source ||
      data.utm_medium ||
      data.utm_campaign,
  );
}
