import { CompanyInfo, FaqItem, ReviewImageItem, WorkPhotoItem } from "../types";

export const COMPANY_DETAILS: CompanyInfo = {
  companyName: "신독환경",
  representative: "전재현",
  businessNumber: "",
  mailOrderNumber: "",
  phone: "",
  mobile: "",
  email: "",
  address: "",
  privacyManager: "전재현",
  operatingHours: "평일 09:00 ~ 18:00 / 토·일·공휴일 상담 가능",
};

// 8 Work Photos — 실제 현장 사진 (public/work-photo-01~08.jpg)
export const WORK_PHOTOS: WorkPhotoItem[] = [
  {
    id: "work-photo-01",
    placeholderText: "work-photo-01",
    imageSrc: "work-photo-01.jpg",
    title: "침실 정리 전 현장",
    category: "주거 공간",
    description: "쌓여 있던 생활용품과 가구를 분류하기 전, 침실 정리 작업이 필요한 현장입니다.",
    defaultBadge: "정리 전",
  },
  {
    id: "work-photo-02",
    placeholderText: "work-photo-02",
    imageSrc: "work-photo-02.jpg",
    title: "공간 확보 완료",
    category: "완료 현장",
    description: "물품 정리·반출 후 바닥과 동선이 확보된 쾌적한 실내 공간입니다.",
    defaultBadge: "정리 후",
  },
  {
    id: "work-photo-03",
    placeholderText: "work-photo-03",
    imageSrc: "work-photo-03.jpg",
    title: "거실 적체 공간",
    category: "주거 공간",
    description: "가구·가전과 생활용품이 쌓여 동선이 막힌 거실 정리 전 현장입니다.",
    defaultBadge: "정리 전",
  },
  {
    id: "work-photo-04",
    placeholderText: "work-photo-04",
    imageSrc: "work-photo-04.jpg",
    title: "거실 정리 완료",
    category: "완료 현장",
    description: "짐과 불필요 가구를 처리한 뒤 넓게 열린 거실·발코니 공간입니다.",
    defaultBadge: "정리 후",
  },
  {
    id: "work-photo-05",
    placeholderText: "work-photo-05",
    imageSrc: "work-photo-05.jpg",
    title: "폐기물·짐 분류 전",
    category: "폐기물 처리",
    description: "박스·생활폐기물·보관 물품이 혼재된 현장을 분류·반출하기 전 모습입니다.",
    defaultBadge: "폐기물",
  },
  {
    id: "work-photo-06",
    placeholderText: "work-photo-06",
    imageSrc: "work-photo-06.jpg",
    title: "마감·정돈 완료",
    category: "최종 마감",
    description: "정리와 마감 작업이 끝난 깔끔한 실내 바닥·동선 상태입니다.",
    defaultBadge: "마감 완료",
  },
  {
    id: "work-photo-07",
    placeholderText: "work-photo-07",
    imageSrc: "work-photo-07.jpg",
    title: "적체된 생활공간",
    category: "주거 정리",
    description: "장기간 쌓인 짐으로 이동이 어려운 공간을 전문팀이 정리하기 전 현장입니다.",
    defaultBadge: "적체 정리",
  },
  {
    id: "work-photo-08",
    placeholderText: "work-photo-08",
    imageSrc: "work-photo-08.jpg",
    title: "리모델링 전 현장",
    category: "맞춤 작업",
    description: "벽면·공간 정비가 필요한 현장으로, 맞춤 정리·케어가 진행되기 전 모습입니다.",
    defaultBadge: "현장 진단",
  },
];

// 10 Customer Reviews using exact placeholders review-image-01 to review-image-10
export const REVIEW_IMAGES: ReviewImageItem[] = [
  {
    id: "review-image-01",
    placeholderText: "review-image-01",
    author: "김*진 고객님 (강남구)",
    serviceUsed: "주거 프리미엄 케어",
    location: "서울 강남구 역삼동",
    rating: 5,
    date: "2026-07-28",
    content: "전화 상담받고 바로 당일에 방문해 주셨어요! 과잉 견적 없이 딱 필요한 부위만 친절하게 설명해 주시고 작업 결과도 기대 이상이었습니다.",
  },
  {
    id: "review-image-02",
    placeholderText: "review-image-02",
    author: "박*우 대표님 (성남시)",
    serviceUsed: "사무실 정기 관리",
    location: "경기 성남시 분당구",
    rating: 5,
    date: "2026-07-25",
    content: "직원들 만족도가 최고입니다. 타사 대비 훨씬 꼼꼼하고 사후 A/S 보증서까지 챙겨주셔서 신뢰가 갑니다.",
  },
  {
    id: "review-image-03",
    placeholderText: "review-image-03",
    author: "이*영 고객님 (서초구)",
    serviceUsed: "입주 정밀 케어",
    location: "서울 서초구 반포동",
    rating: 5,
    date: "2026-07-21",
    content: "새집으로 이사하면서 걱정이 많았는데 구석구석 손 안 닿는 곳까지 말끔하게 작업해 주셨네요. 강추합니다!",
  },
  {
    id: "review-image-04",
    placeholderText: "review-image-04",
    author: "최*호 원장님 (마포구)",
    serviceUsed: "상가 위생 소독",
    location: "서울 마포구 합정동",
    rating: 5,
    date: "2026-07-18",
    content: "손님들이 오시는 공간이라 위생이 정말 중요한데, 세심한 작업과 정식 소독 인증표까지 부착해 주셔서 너무 든든합니다.",
  },
  {
    id: "review-image-05",
    placeholderText: "review-image-05",
    author: "정*희 고객님 (송파구)",
    serviceUsed: "특수 오염 제거",
    location: "서울 송파구 잠실동",
    rating: 5,
    date: "2026-07-15",
    content: "혼자서는 절대 해결 안 되던 찌든 오염이 깔끔하게 없어졌어요. 기사님 두 분 모두 친절하시고 설명도 자세했습니다.",
  },
  {
    id: "review-image-06",
    placeholderText: "review-image-06",
    author: "강*민 고객님 (인천)",
    serviceUsed: "단독주택 특수케어",
    location: "인천 연수구 송도동",
    rating: 5,
    date: "2026-07-10",
    content: "견적받은 가격 그대로 추가 요금 1원도 없이 계약대로 진행되었어요. 투명한 정찰제라 안심되었습니다.",
  },
  {
    id: "review-image-07",
    placeholderText: "review-image-07",
    author: "윤*서 고객님 (수원시)",
    serviceUsed: "가전 정밀 분해 세척",
    location: "경기 수원시 영통구",
    rating: 5,
    date: "2026-07-06",
    content: "아이 키우는 집이라 약제가 걱정되었는데, 친환경 인증 약제만 사용하신다고 설명해 주셔서 안심이 되었습니다.",
  },
  {
    id: "review-image-08",
    placeholderText: "review-image-08",
    author: "한*철 대표님 (하남시)",
    serviceUsed: "매장 바닥 복원 시공",
    location: "경기 하남시 미사동",
    rating: 5,
    date: "2026-07-01",
    content: "바닥 묵은 오염 제거와 광택 작업으로 매장 인테리어가 새로 한 것처럼 살아났어요. 매출 상승에도 도움되는 느낌입니다.",
  },
  {
    id: "review-image-09",
    placeholderText: "review-image-09",
    author: "임*아 고객님 (고양시)",
    serviceUsed: "긴급 당일 상담 케어",
    location: "경기 고양시 일산동구",
    rating: 5,
    date: "2026-06-27",
    content: "갑자기 필요한 상황이었는데 신청 후 10분 만에 콜백오고 바로 다음 날 아침 일찍 방문해 처리해 주셨어요. 감동!",
  },
  {
    id: "review-image-10",
    placeholderText: "review-image-10",
    author: "송*훈 고객님 (부천시)",
    serviceUsed: "정기 관리 서비스",
    location: "경기 부천시 원미구",
    rating: 5,
    date: "2026-06-22",
    content: "벌써 3번째 이용하고 있는 단골입니다. 매번 일정 변동 없이 시각 엄수해 주시고 결과물이 정직해서 늘 믿고 맡깁니다.",
  },
];

export const FAQ_LIST: FaqItem[] = [
  {
    category: "상담 및 비용",
    question: "상담을 신청하면 바로 비용이 발생하나요?",
    answer: "기본 상담은 무료이며, 현장 상태와 작업 범위를 확인한 후 안내해드립니다.",
  },
  {
    category: "상담 및 비용",
    question: "작업 비용은 어떻게 결정되나요?",
    answer: "작업 공간, 물품의 양, 작업 인원, 차량 사용 여부, 작업 난이도 등을 확인하여 결정됩니다.",
  },
  {
    category: "작업 일정",
    question: "당일 작업도 가능한가요?",
    answer: "지역과 작업 일정에 따라 가능 여부가 달라질 수 있으므로 상담을 통해 확인해주세요.",
  },
  {
    category: "작업 범위",
    question: "대형 가구와 가전도 처리할 수 있나요?",
    answer: "현장 상황과 품목을 확인한 후 처리 가능 여부를 안내해드립니다.",
  },
  {
    category: "서비스 지역",
    question: "어떤 지역에서 작업이 가능한가요?",
    answer: "서비스 가능 지역은 상담 접수 후 정확하게 안내해드립니다.",
  },
  {
    category: "상담 준비",
    question: "상담할 때 무엇을 알려줘야 하나요?",
    answer: "작업 지역, 공간 종류, 물품의 대략적인 양, 희망 일정을 알려주시면 더욱 빠르게 상담받을 수 있습니다.",
  },
];

export const PAIN_POINTS = [
  {
    id: 1,
    title: "정리해야 할 물건이 너무 많은 경우",
    desc: "어디서부터 손대야 할지 막막한 대량의 물품과 집기류도 체계적으로 분류하고 분류·정리해 드립니다.",
    icon: "Boxes",
  },
  {
    id: 2,
    title: "무거운 가구와 가전을 처리해야 하는 경우",
    desc: "혼자 옮기기 힘든 대형 가구, 가전제품, 무게감이 큰 물품도 안전하고 손상 없이 운반·처리합니다.",
    icon: "Truck",
  },
  {
    id: 3,
    title: "빠른 시간 안에 공간을 비워야 하는 경우",
    desc: "이사, 퇴거, 매장 이전 등 긴급한 일정에 맞춰 당일 또는 지정된 시간에 신속하게 완료합니다.",
    icon: "Clock",
  },
  {
    id: 4,
    title: "현장을 깔끔하게 마무리해야 하는 경우",
    desc: "작업 후 구석구석 정돈하고 분리배출 및 바닥 먼지 청소까지 깔끔하게 마감 처리를 진행합니다.",
    icon: "Sparkles",
  },
];

export const SERVICE_ADVANTAGES = [
  {
    icon: "ClipboardCheck",
    title: "현장 맞춤 상담",
    desc: "현장 상황과 작업 범위를 확인하여 필요한 작업을 안내합니다.",
  },
  {
    icon: "Award",
    title: "숙련된 전문팀",
    desc: "경험이 있는 작업 인력이 체계적으로 작업을 진행합니다.",
  },
  {
    icon: "Zap",
    title: "신속한 작업",
    desc: "약속된 일정에 맞춰 빠르고 효율적으로 진행합니다.",
  },
  {
    icon: "CheckCircle2",
    title: "깔끔한 마무리",
    desc: "작업 후 공간을 확인하고 정돈된 상태로 마무리합니다.",
  },
  {
    icon: "ShieldCheck",
    title: "안전한 작업",
    desc: "대형 가구와 무거운 물품도 안전하게 이동하고 처리합니다.",
  },
  {
    icon: "PhoneCall",
    title: "편리한 상담",
    desc: "전화 또는 온라인으로 간편하게 상담을 신청할 수 있습니다.",
  },
];

export const PROCESS_STEPS = [
  {
    step: "STEP 01",
    title: "상담 신청",
    desc: "전화 또는 온라인 상담 폼으로 기본 내용을 접수합니다.",
  },
  {
    step: "STEP 02",
    title: "현장 확인 및 견적",
    desc: "작업 지역, 현장 상태, 작업 범위를 확인합니다.",
  },
  {
    step: "STEP 03",
    title: "전문팀 방문 작업",
    desc: "약속된 일정에 작업팀이 방문하여 작업을 진행합니다.",
  },
  {
    step: "STEP 04",
    title: "작업 완료 확인",
    desc: "작업 결과를 확인하고 현장을 깔끔하게 마무리합니다.",
  },
];
