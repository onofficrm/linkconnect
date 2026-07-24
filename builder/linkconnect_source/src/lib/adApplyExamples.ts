/** i-light 스타일 광고등록 신청서 예시 템플릿 */

export type AdApplyExampleKey =
  | 'campaignTitle'
  | 'landingUrl'
  | 'intro'
  | 'sellingPoints'
  | 'recommendedKeywords'
  | 'forbiddenKeywords'
  | 'precautions'
  | 'banner'
  | 'extras'
  | 'section1'
  | 'section2'
  | 'section3'
  | 'section4';

export type AdApplyExample = {
  key: AdApplyExampleKey;
  title: string;
  body: string;
  apply?: Partial<{
    campaignTitle: string;
    landingUrl: string;
    intro: string;
    sellingPoints: string;
    recommendedKeywords: string;
    forbiddenKeywords: string;
    precautions: string;
  }>;
};

export const AD_APPLY_ALLOWED_CHANNELS = [
  { id: 'seo_blog', label: 'SEO 블로그' },
  { id: 'naver_cafe', label: '네이버 카페' },
  { id: 'sns', label: '인스타그램 / SNS' },
  { id: 'youtube', label: '유튜브' },
] as const;

export const AD_APPLY_FORBIDDEN_CHANNELS = [
  { id: 'brand_sa', label: '브랜드 키워드 SA Bidding' },
  { id: 'reward_app', label: '리워드/캐시 앱' },
  { id: 'macro', label: '자동 매크로 프로그램' },
  { id: 'fake_review', label: '허위 후기 / 스팸 쪽지' },
] as const;

export const AD_APPLY_EXAMPLES: Record<AdApplyExampleKey, AdApplyExample> = {
  section1: {
    key: 'section1',
    title: '1. 머천트 소개 및 셀링 포인트',
    body: '캠페인 제목·랜딩 URL·소개글·혜택을 마케터가 바로 이해할 수 있게 구체적으로 적어 주세요.',
  },
  campaignTitle: {
    key: 'campaignTitle',
    title: '캠페인 제목 예시',
    body: '지역 + 서비스 + 핵심 혜택을 한 줄로 요약합니다.',
    apply: { campaignTitle: '부산 흥신소 | 사람찾기·비밀보장 · 상담 DB' },
  },
  landingUrl: {
    key: 'landingUrl',
    title: '랜딩페이지 URL 예시',
    body: '실제 전환이 일어나는 랜딩(또는 홈페이지) 주소를 입력합니다. https:// 를 포함해 주세요.',
    apply: { landingUrl: 'https://example.com/landing' },
  },
  intro: {
    key: 'intro',
    title: '머천트/행사 소개글 예시',
    body: '상세페이지 최상단에 노출되는 소개입니다. 신뢰·전문성·차별점을 3~6문장으로 작성하세요.',
    apply: {
      intro:
        '링크커넥트 제휴 캠페인으로 진행하는 CPA 상담 DB 모집입니다.\n\n전문 상담사가 신속히 응대하며, 개인정보 보호와 비밀 보장을 최우선으로 합니다.\n전국 주요 권역 상담이 가능하며, 상담 신청 후 영업일 기준 빠르게 연락드립니다.',
    },
  },
  sellingPoints: {
    key: 'sellingPoints',
    title: '셀링 포인트 예시',
    body: '마케터 홍보용 혜택·특전을 불릿으로 정리하면 전환율이 높아집니다.',
    apply: {
      sellingPoints:
        '· 상담 신청 시 우선 응대\n· 비밀 보장 / 개인정보 안전 처리\n· 전국 권역 상담 가능\n· 허위·과장 광고 금지, 정식 가이드 준수',
    },
  },
  section2: {
    key: 'section2',
    title: '2. 홍보 채널 및 키워드 정책',
    body: '허용/금지 채널과 키워드를 명확히 하면 어뷰징과 브랜드 리스크를 줄일 수 있습니다.',
  },
  recommendedKeywords: {
    key: 'recommendedKeywords',
    title: '추천 키워드 예시',
    body: '쉼표로 구분해 주세요.',
    apply: { recommendedKeywords: '부산 흥신소, 사람찾기, 탐정 상담, 비밀보장' },
  },
  forbiddenKeywords: {
    key: 'forbiddenKeywords',
    title: '금지 키워드 예시',
    body: '브랜드명 무단 사용, 자극적·허위 표현 등을 명시합니다.',
    apply: { forbiddenKeywords: '무료조회 100%, 무조건 찾음, 불법 위치추적' },
  },
  precautions: {
    key: 'precautions',
    title: '세부 유의사항 예시',
    body: '랜딩 변조 금지, 인센티브 트래픽 금지 등 운영 규칙을 적어 주세요.',
    apply: {
      precautions:
        '1) 랜딩 URL 임의 변경 금지\n2) 리워드·현금 지급형 트래픽 금지\n3) 허위 후기·스팸 쪽지 금지\n4) 미성년자 대상 광고 금지',
    },
  },
  section3: {
    key: 'section3',
    title: '3. 홍보 배너',
    body: '권장 규격 1600×900 px (JPG/PNG/WEBP). 텍스트가 잘리지 않도록 여백을 확보해 주세요.',
  },
  banner: {
    key: 'banner',
    title: '메인 배너 예시',
    body: '와이드 배너 한 장으로 서비스명·핵심 혜택·CTA가 한눈에 보이게 구성합니다.',
  },
  section4: {
    key: 'section4',
    title: '4. 추가 자료',
    body: '현장 사진, 가이드 PDF, 홍보문구 PPT, ZIP 등을 첨부할 수 있습니다. (개별 최대 100MB)',
  },
  extras: {
    key: 'extras',
    title: '추가 자료 예시',
    body: '마케터에게 제공할 이미지·브로슈어·증빙 자료를 여러 개 올려 주세요.',
  },
};
