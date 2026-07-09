import { PageHeaderWithImage, PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab5() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="급여/통장 압류 대처" 
          description="채권자가 내 통장이나 월급을 압류했다면 당장 생계가 막막해집니다. 이를 해제하고 대처하는 방법을 확인하세요." 
          imageUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
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
            { title: "최저생계비 보호", desc: "월 185만원(법정) 이하의 예금/급여는 압류 금지" },
            { title: "중지명령", desc: "개인회생 신청 시 압류 진행을 멈추는 중지명령 신청" },
            { title: "압류 해제", desc: "개인회생 인가결정 이후 기존 압류 공식 해제 가능" }
          ]} 
        />
        
        
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>압류 사실을 알게 되었을 때</SectionTitle>
        <Checklist 
          items={[
            "당황하여 채권자에게 무리한 합의(전액 상환 등)를 시도하지 마세요.",
            "압류된 은행이 어디인지, 금액이 얼마인지 정확히 파악하세요.",
            "직장에 급여 압류 통지서가 갔다면 회사에 상황(개인회생 진행 등)을 잘 설명하세요.",
            "법이 정한 압류금지 채권(185만원 이하)을 보호받기 위한 조치를 취하세요."
          ]} 
        />
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" 
              alt="관련 상황 이미지" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
        </div>
        

        <SectionTitle>압류 해결 과정 (개인회생 기준)</SectionTitle>
        <InfoTable 
          headers={["절차", "효과"]}
          rows={[
            ["회생 신청 + 중지명령", "진행 중인 압류/경매 절차가 일시 정지됨 (추가 진행 불가)"],
            ["압류금지채권 범위변경", "통장 잔액 중 185만원 이하는 인출할 수 있도록 법원에 신청"],
            ["인가결정 확정", "개인회생 인가 후 법원에 정식으로 압류 해제 신청"],
            ["통장 사용 정상화", "압류 해제 통지서가 은행에 도달하면 통장 정상 사용 가능"]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "이미 통장에 돈이 묶였는데 찾을 수 있나요?",
              a: "잔액 중 185만원(최저생계비 기준) 이하의 금액은 '압류금지채권 범위변경 신청'을 통해 법원 허가를 받아 찾을 수 있습니다."
            },
            {
              q: "회생을 진행하면 가족 통장으로 월급을 받아도 되나요?",
              a: "안 됩니다. 월급은 반드시 본인 명의 계좌로 받아야 하며, 기존 은행이 압류되었다면 압류되지 않은 타 은행이나 새마을금고 등에 새 계좌를 개설하여 그곳으로 수령해야 합니다."
            }
          ]}
        />

        <NoticeBox>
          압류가 시작되면 일상생활에 심각한 타격이 옵니다. 압류 통보를 받았다면 지체 없이 전문가의 조력을 받아 개인회생/파산과 같은 법적 구제 절차를 시작해야 합니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="현재 상황에 맞는 정확한 진단이 필요하신가요?" 
        description="전문가와 함께 빠르고 안전하게 방안을 모색할 수 있습니다."
        imageUrl="https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=800&q=80"
        imageAlt="안전한 상담"
      />
    </div>
  );
}