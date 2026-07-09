import { PageHeaderWithImage, PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function RehabilitationTab5() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인회생 고려사항 (장단점)" 
          description="개인회생은 채무탕감이라는 강력한 이점이 있지만, 그에 따른 제약도 존재합니다. 제도를 활용하기 전 장점과 단점을 명확히 인지해야 합니다." 
          imageUrl="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
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
            { title: "강력한 장점", desc: "이자는 100%, 원금은 최대 90%까지 합법적 탕감" },
            { title: "자격 유지", desc: "재산을 유지할 수 있고, 공무원 등 자격도 유지됨" },
            { title: "주요 제약", desc: "신용카드 사용 및 신규 대출 등 신용거래 제한" }
          ]} 
        />
        
        
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>개인회생의 장점</SectionTitle>
        <Checklist 
          items={[
            "모든 종류의 채무를 조정할 수 있습니다 (은행, 저축은행, 사채, 보증채무 등).",
            "채권자의 동의 없이도 법원의 결정으로 채무탕감이 가능합니다.",
            "금지명령을 통해 빚 독촉과 압류 등 추심에서 해방됩니다.",
            "재산을 처분하지 않고 보유한 상태에서 변제가 가능합니다.",
            "공무원, 교사, 의사, 기업 임원 등의 자격이 그대로 유지됩니다."
          ]} 
        />
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80" 
              alt="관련 상황 이미지" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
        </div>
        

        <SectionTitle>개인회생의 단점 (제약사항)</SectionTitle>
        <InfoTable 
          headers={["구분", "내용"]}
          rows={[
            ["신용거래 제한", "신용카드 발급, 신규 대출, 할부 구매 등 신용거래가 일정 기간 제한됩니다."],
            ["기록 보존", "은행연합회에 공공정보가 등록되며, 면책 후 삭제되지만 일부 개별 은행에는 기록이 남을 수 있습니다."],
            ["최저생계비 생활", "변제 기간(보통 3년) 동안은 법원이 인정한 최저생계비로만 생활해야 합니다."],
            ["보증인 문제", "본인의 채무는 탕감되지만, 보증인에게는 채권자의 청구가 들어갈 수 있습니다."]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "체크카드 사용은 가능한가요?",
              a: "네, 가능합니다. 신용기능(후불교통카드 등)이 포함되지 않은 순수 체크카드는 발급 및 사용이 가능합니다."
            },
            {
              q: "핸드폰 개통이나 할부는 되나요?",
              a: "본인 명의의 통신 가입은 가능하나, 단말기 할부 개통은 신용등급 문제로 어려울 수 있어 현금 완납이나 가족 명의를 활용하는 경우가 많습니다."
            }
          ]}
        />

        <NoticeBox>
          개인회생은 일시적인 불편함을 감수하더라도, 장기적으로 빚의 고통에서 벗어나 새 출발을 하기 위한 가장 안전하고 합법적인 수단입니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="현재 상황에 맞는 정확한 진단이 필요하신가요?" 
        description="전문가와 함께 빠르고 안전하게 방안을 모색할 수 있습니다."
        imageUrl="https://images.unsplash.com/photo-1573497491208-6f16f2ea3094?auto=format&fit=crop&w=800&q=80"
        imageAlt="안전한 상담"
      />
    </div>
  );
}