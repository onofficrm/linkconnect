import fs from 'fs';

const rehabContent = `import { PageHeaderWithImage, NoticeBox, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight, MessageSquareQuote } from 'lucide-react';

export default function RehabilitationTab6() {
  const cases = [
    {
      name: "직장인 A씨 (가명)",
      title: "카드론과 대출이 겹친 직장인 상담 사례",
      situation: "매월 급여는 있었지만 카드론, 현금서비스, 신용대출 상환이 겹치면서 생활비가 부족해진 사례입니다.",
      checks: [
        "월 소득",
        "전체 채무금액",
        "연체 여부",
        "부양가족 여부",
        "최근 대출 내역"
      ],
      point: "소득이 있는 경우라도 실제 변제 가능 금액을 기준으로 검토가 필요합니다.",
      imageUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80",
      imageAlt: "직장인 남성"
    },
    {
      name: "자영업자 B씨 (가명)",
      title: "매출 감소로 상환이 어려워진 자영업자 상담 사례",
      situation: "사업 매출이 줄어들면서 대출 상환과 카드값 부담이 커진 사례입니다.",
      checks: [
        "사업장 유지 여부",
        "월 평균 매출과 순수익",
        "사업 자금 대출 내역"
      ],
      point: "사업소득자는 매출과 실제 소득을 확인할 수 있는 자료 정리가 중요합니다.",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      imageAlt: "자영업자 여성"
    },
    {
      name: "직장인 C씨 (가명)",
      title: "급여압류가 걱정되어 상담을 신청한 사례",
      situation: "연체가 길어지면서 급여압류와 통장압류를 걱정하게 된 사례입니다.",
      checks: [
        "현재 연체 기간",
        "압류 진행 여부",
        "급여 통장 상태"
      ],
      point: "압류 전후 상황에 따라 대응 방법이 달라질 수 있으므로 빠른 확인이 필요합니다.",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
      imageAlt: "고민하는 중년 남성"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인회생 상황별 상담 사례" 
          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 최근 대출 여부에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." 
          imageUrl="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
          imageAlt="고민하는 직장인"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            내 상황에 맞는 해결책 찾기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </PageHeaderWithImage>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="relative">
              <img src={item.imageUrl} alt={item.imageAlt} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm">이해를 돕기 위한 예시 이미지</div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-main text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                {item.name}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-5 leading-snug">{item.title}</h3>
              
              <div className="space-y-5 flex-1">
                <div>
                  <span className="font-bold text-gray-800 text-sm block mb-1.5">상황 요약:</span>
                  <p className="text-gray-600 text-[14px] leading-relaxed">{item.situation}</p>
                </div>
                
                {item.checks && (
                  <div>
                    <span className="font-bold text-gray-800 text-sm block mb-1.5">확인한 내용:</span>
                    <ul className="text-[14px] text-gray-600 space-y-1">
                      {item.checks.map(c => (
                        <li key={c} className="flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 mt-auto">
                  <span className="font-bold text-cta text-sm block mb-1">상담 포인트:</span>
                  <p className="text-gray-700 text-[14px] leading-relaxed">{item.point}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-gray-100">
                <Link 
                  to="/consultation"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-[15px] font-bold text-white shadow-sm transition-transform hover:bg-gray-800 active:scale-[0.98]"
                >
                  비슷한 상황 상담받기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NoticeBox>
        본 사례는 이해를 돕기 위한 예시이며, 실제 개인회생 또는 개인파산 가능 여부는 신청자의 소득, 채무, 재산, 부양가족, 최근 대출 내역 등에 따라 달라질 수 있습니다.
      </NoticeBox>
      <BottomCTA />
    </div>
  );
}
`;

const bankruptcyContent = `import { PageHeaderWithImage, NoticeBox, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight, MessageSquareQuote } from 'lucide-react';

export default function BankruptcyTab6() {
  const cases = [
    {
      name: "일용직 A씨 (가명)",
      title: "소득 감소로 채무 변제가 어려워진 상담 사례",
      situation: "일용직으로 간헐적인 소득이 있으나, 최저생계비에 미치지 못해 빚을 갚을 수 없는 상황에 놓인 사례입니다.",
      checks: [
        "월 평균 소득 증빙",
        "부양가족 수 및 생계비",
        "채무 발생 원인"
      ],
      point: "소득이 있더라도 부양가족 대비 최저생계비에 한참 미달함을 소명하여 파산을 검토할 수 있습니다.",
      imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
      imageAlt: "50대 여성"
    },
    {
      name: "고령자 B씨 (가명)",
      title: "장기 연체 후 파산 상담을 검토한 사례",
      situation: "과거 사업 실패로 인한 장기 연체로 신용불량자가 되어 10년 이상 금융거래를 하지 못하고 일용직으로 생활하던 사례입니다.",
      checks: [
        "연령 및 건강 상태",
        "과거 사업 관련 채무",
        "현재 보유 재산 확인"
      ],
      point: "오래된 채무라도 빠짐없이 채권자를 파악하여 절차를 진행하는 것이 핵심입니다.",
      imageUrl: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=600&q=80",
      imageAlt: "60대에 가까운 남성"
    },
    {
      name: "무직 C씨 (가명)",
      title: "변제 가능성이 낮아 파산을 검토한 상담 사례",
      situation: "당뇨 등 만성질환으로 인해 장기간 경제활동이 불가능하여 병원비와 생활비로 채무가 증가한 사례입니다.",
      checks: [
        "근로 능력 상실 여부",
        "진단서 및 병원 기록",
        "현재 소득 유무"
      ],
      point: "근로 능력이 없음을 객관적인 자료(진단서 등)로 명확히 소명하는 것이 중요합니다.",
      imageUrl: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80",
      imageAlt: "건강 문제가 있는 중년 여성"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인파산 상황별 상담 사례" 
          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 과거 면책 여부, 건강 상태 등에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." 
          imageUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
          imageAlt="중년 남성의 고민"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            내 상황에 맞는 해결책 찾기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </PageHeaderWithImage>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="relative">
              <img src={item.imageUrl} alt={item.imageAlt} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm">이해를 돕기 위한 예시 이미지</div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-main text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                {item.name}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-5 leading-snug">{item.title}</h3>
              
              <div className="space-y-5 flex-1">
                <div>
                  <span className="font-bold text-gray-800 text-sm block mb-1.5">상황 요약:</span>
                  <p className="text-gray-600 text-[14px] leading-relaxed">{item.situation}</p>
                </div>
                
                {item.checks && (
                  <div>
                    <span className="font-bold text-gray-800 text-sm block mb-1.5">확인한 내용:</span>
                    <ul className="text-[14px] text-gray-600 space-y-1">
                      {item.checks.map(c => (
                        <li key={c} className="flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 mt-auto">
                  <span className="font-bold text-cta text-sm block mb-1">상담 포인트:</span>
                  <p className="text-gray-700 text-[14px] leading-relaxed">{item.point}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-gray-100">
                <Link 
                  to="/consultation"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-[15px] font-bold text-white shadow-sm transition-transform hover:bg-gray-800 active:scale-[0.98]"
                >
                  비슷한 상황 상담받기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NoticeBox>
        본 사례는 이해를 돕기 위한 예시이며, 실제 개인회생 또는 개인파산 가능 여부는 신청자의 소득, 채무, 재산, 부양가족, 최근 대출 내역 등에 따라 달라질 수 있습니다.
      </NoticeBox>
      <BottomCTA />
    </div>
  );
}
`;

fs.writeFileSync('src/pages/info-tabs/RehabilitationTab6.tsx', rehabContent, 'utf8');
fs.writeFileSync('src/pages/info-tabs/BankruptcyTab6.tsx', bankruptcyContent, 'utf8');
