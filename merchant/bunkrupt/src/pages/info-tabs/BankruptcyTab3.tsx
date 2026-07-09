import { PageHeaderWithImage, PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA, ImageBlock } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function BankruptcyTab3() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="파산/면책 준비 서류" 
          description="개인파산 및 면책 신청 시 법원은 지원자의 재산과 소득 없음을 증명할 수 있는 엄격한 서류 제출을 요구합니다." 
          imageUrl="https://images.unsplash.com/photo-1573497491208-6f16f2ea3094?auto=format&fit=crop&w=800&q=80"
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
            { title: "인적 서류", desc: "신분 확인 및 가족 관계 증명 서류" },
            { title: "소득 증빙 없음", desc: "사실증명(소득신고내역없음) 등 무소득 증빙 서류" },
            { title: "재산/부채 서류", desc: "현재 재산 상황 및 부채 발생 경위 소명 자료" }
          ]} 
        />
        
        
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>필수 준비 서류 목록</SectionTitle>
        <ImageBlock 
          imageUrl="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80" 
          imageAlt="서류 작성" 
          caption="개인파산 서류 준비는 개인회생보다 엄격합니다." 
        />
        <InfoTable 
          headers={["구분", "발급처", "주요 서류"]}
          rows={[
            ["인적사항", "주민센터", "주민등록등초본, 가족관계증명서, 혼인관계증명서, 지방세세목별과세증명서, 인감증명서"],
            ["소득/재산사항", "국세청/은행", "소득금액증명(또는 무소득사실증명), 통장거래내역, 보험가입내역서, 임대차계약서"],
            ["질병/장애 (해당자)", "병원/주민센터", "진단서, 소견서, 장애인등록증 (근로 능력 상실 소명용)"]
          ]}
        />

        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>서류 준비 시 주의사항</SectionTitle>
        <Checklist 
          items={[
            "모든 서류는 최근 1개월 이내 발급된 원본이어야 합니다.",
            "통장거래내역은 보통 최근 3~5년치를 꼼꼼히 확인합니다.",
            "부채증명서는 모든 채권자를 빠짐없이 확인하여 발급해야 면책에서 누락되지 않습니다.",
            "진술서(채무증대경위서)는 육하원칙에 따라 진실되게 작성해야 합니다."
          ]} 
        />
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" 
              alt="관련 상황 이미지" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
        </div>
        

        <FAQAccordion 
          items={[
            {
              q: "오래된 빚이라 채권자가 누군지도 모르는데 어떡하나요?",
              a: "신용조회, 법원 사건검색 등을 통해 전문가가 잊고 있던 채권자까지 꼼꼼하게 찾아내는 작업을 도와드립니다."
            },
            {
              q: "가족 서류도 내야 하나요?",
              a: "네, 파산은 재산 은닉을 엄격히 조사하기 때문에, 배우자나 자녀 명의로 재산이 이전된 정황이 의심될 경우 가족의 재산 서류도 법원에서 요구할 수 있습니다."
            }
          ]}
        />

        <NoticeBox>
          개인파산은 개인회생보다 법원 파산관재인의 심사가 더 까다롭습니다. 요구하는 서류를 정확하고 투명하게 제출해야 면책 결정을 받을 수 있습니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="현재 상황에 맞는 정확한 진단이 필요하신가요?" 
        description="전문가와 함께 빠르고 안전하게 방안을 모색할 수 있습니다."
        imageUrl="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
        imageAlt="안전한 상담"
      />
    </div>
  );
}