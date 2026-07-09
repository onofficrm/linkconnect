import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function RehabilitationTab2() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인회생 신청자격" 
          description="개인회생 신청을 위해 반드시 확인해야 할 핵심 자격 요건을 안내해 드립니다." 
          imageUrl="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80"
          imageAlt="노트북 앞에서 상황을 체크하는 여성"
          caption="“신청자격은 단순히 채무금액만으로 판단하지 않습니다.”"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 자격진단 신청하기
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
            { title: "일정한 소득", desc: "급여소득, 영업소득 등 반복적이고 일정한 소득 필수" },
            { title: "채무 한도", desc: "무담보채무 10억원, 담보채무 15억원 이하" },
            { title: "재산 가치", desc: "보유 재산의 총 가치보다 채무가 더 많아야 함" }
          ]} 
        />
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>이런 경우 개인회생을 검토할 수 있습니다</SectionTitle>
            <Checklist 
              items={[
                "매월 지속적으로 발생할 것으로 예상되는 소득이 있다",
                "현재 내 재산보다 빚이 더 많다",
                "총 채무가 무담보 10억, 담보 15억 이하이다",
                "이전에 면책을 받았다면 5년이 지났다",
                "도박, 주식, 코인으로 인한 빚도 포함될 수 있다"
              ]} 
            />
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80" 
              alt="서류를 확인하는 남성" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
            <p className="text-center text-sm text-gray-500 font-medium mt-3 tracking-wide">
              “소득, 재산, 부양가족, 최근 대출 여부를 함께 확인해야 합니다.”
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-8 items-start mb-10">
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80" 
              alt="소득 및 재산을 정리하는 서류와 계산기" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
          <div className="flex-1">
            <SectionTitle>신청 전 확인해야 할 항목 (소득 기준)</SectionTitle>
            <InfoTable 
              headers={["직군 분류", "소득 증빙 기준", "비고"]}
              rows={[
                ["급여소득자", "근로소득원천징수영수증, 급여명세서 등", "4대보험 미가입자, 아르바이트, 일용직도 증빙 시 가능"],
                ["영업소득자", "종합소득세 확정신고서, 사업자등록증 등", "프리랜서, 배달기사, 보험설계사 포함"],
                ["연금소득자", "연금수급권자 증명서", "국민연금, 공무원연금 등"]
              ]}
            />
          </div>
        </div>

        <FAQAccordion 
          items={[
            {
              q: "아르바이트나 일용직도 신청 가능한가요?",
              a: "네, 가능합니다. 4대 보험 가입 여부와 관계없이 정기적이고 확실한 소득을 증빙할 수 있다면 신청할 수 있습니다."
            },
            {
              q: "최근에 대출을 많이 받았는데 가능한가요?",
              a: "최근 대출이라도 신청은 가능할 수 있습니다. 단, 대출금의 사용처(생활비, 병원비 등)를 명확히 소명해야 하며, 무리한 소비나 투자일 경우 변제금에 영향을 줄 수 있습니다."
            }
          ]}
        />

        <NoticeBox>
          위 조건은 기본적인 자격 요건이며, 개인의 세부적인 상황(부양가족 수, 거주지역, 최저생계비 등)에 따라 월 변제금이나 인가 여부가 크게 달라질 수 있습니다. 정확한 진단은 전문가와 상의하시기 바랍니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="개인회생 가능성이 궁금하다면?" 
        description="현재 채무와 소득 상황을 남겨주시면 상담 가능 여부를 순차적으로 안내드립니다."
        imageUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
        imageAlt="진지한 법률 상담"
      />
    </div>
  );
}
