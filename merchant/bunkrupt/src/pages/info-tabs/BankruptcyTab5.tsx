import { PageHeaderWithImage, PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function BankruptcyTab5() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인파산 주의사항" 
          description="면책 불허가 사유 및 진행 과정 중 주의해야 할 중요한 내용을 확인하세요." 
          imageUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
          imageAlt="상담 이미지"
          caption="“현재 상황을 먼저 정리해보는 것이 중요합니다.”"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 상담신청
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">전화상담</span>
          </a>
        </PageHeaderWithImage>
        
        <SummaryCards 
          items={[
            { title: "누락된 채무", desc: "채권자 목록에서 빠진 채무는 면책되지 않음" },
            { title: "비면책 채권", desc: "세금, 벌금, 양육비 등은 파산해도 탕감 안 됨" },
            { title: "재산 은닉 금지", desc: "조사 중 재산 은닉 발견 시 면책 불허 및 처벌" }
          ]} 
        />
        
        
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>파산 신청 시 흔히 하는 실수</SectionTitle>
        <Checklist 
          items={[
            "지인에게 빌린 돈만 몰래 먼저 갚는 행위 (편파 변제)",
            "파산 신청 직전에 재산을 급하게 처분하거나 명의를 바꾸는 행위",
            "오래된 빚이라 잊어버리고 채권자 목록에 기재하지 않는 행위",
            "관재인 면담 시 불리한 사실을 거짓으로 숨기는 행위"
          ]} 
        />
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=800&q=80" 
              alt="관련 상황 이미지" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
        </div>
        

        <SectionTitle>비면책 채권 (파산해도 안 없어지는 빚)</SectionTitle>
        <InfoTable 
          headers={["분류", "세부 내역"]}
          rows={[
            ["국가 관련", "조세(세금), 벌금, 과태료, 추징금 등"],
            ["불법 행위", "고의 또는 중대한 과실로 타인에게 입힌 손해배상금"],
            ["가족 관련", "양육비, 부양료"],
            ["임금 관련", "근로자의 임금, 퇴직금, 재해보상금 (고용주인 경우)"]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "파산 신청하면 휴대폰도 못 쓰나요?",
              a: "아닙니다. 기존에 쓰던 본인 명의 휴대폰은 계속 사용할 수 있습니다. 단, 단말기 할부금이 연체되었다면 통신사에서 정지가 들어올 수 있습니다."
            },
            {
              q: "전세 보증금도 파산 시 압수되나요?",
              a: "법에서 정한 소액임차보증금(지역별 한도 다름) 최우선변제권 범위 내의 금액은 생존권 보장을 위해 압수(청산) 대상에서 제외(면제재산)될 수 있습니다."
            }
          ]}
        />

        <NoticeBox>
          본인이 파산의 요건을 갖추었더라도, 면책 불허가 사유가 있다면 파산 선고만 받고 면책은 받지 못하는 최악의 상황이 발생할 수 있습니다. 사전 상담이 필수입니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="현재 상황에 맞는 정확한 진단이 필요하신가요?" 
        description="전문가와 함께 빠르고 안전하게 방안을 모색할 수 있습니다."
        imageUrl="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80"
        imageAlt="안전한 상담"
      />
    </div>
  );
}