import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab6() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="내용증명 대처" 
          description="채권자로부터 내용증명을 받았다면, 본격적인 법적 분쟁이나 압박이 시작되었다는 신호입니다." 
          imageUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
          imageAlt="진지한 법률 상담"
        />
        
        <SummaryCards 
          items={[
            { title: "강제성 없음", desc: "내용증명 자체는 법적 강제집행 효력이 없음" },
            { title: "증거 자료", desc: "향후 소송에서 독촉했다는 증거로 활용될 수 있음" },
            { title: "대응 여부", desc: "사실과 다르다면 내용증명으로 답변서 발송 권장" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            내용증명 관련 상담받기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>내용증명의 성격과 목적</SectionTitle>
        <Checklist 
          items={[
            "우체국을 통해 '언제, 누구에게, 어떤 내용의 문서를 보냈다'는 사실을 공적으로 증명하는 제도입니다.",
            "그 자체로 압류나 경매를 당장 실행할 수 있는 힘은 없습니다.",
            "주로 채무자에게 심리적 압박을 가하고, 소멸시효를 중단시키기 위한 목적으로 발송됩니다."
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
        

        <SectionTitle>어떻게 대처해야 하나요?</SectionTitle>
        <InfoTable 
          headers={["상황", "대처 방법"]}
          rows={[
            ["내용이 사실인 경우", "별도의 답변을 보낼 의무는 없습니다. 단, 채무 상환 계획(회생 등)을 서둘러야 합니다."],
            ["금액 등 내용이 틀린 경우", "틀린 부분에 대해 반박하는 내용을 담아 '답변 내용증명'을 발송하는 것이 좋습니다."],
            ["시효가 지난 채무인 경우", "'소멸시효 완성으로 인해 갚을 의무가 없다'는 취지의 내용증명을 회신합니다."]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "내용증명을 안 받고 반송시키면 어떻게 되나요?",
              a: "반송시키더라도 채권자는 법원을 통해 주소를 확인하고 '공시송달' 등을 통해 절차를 계속 진행할 수 있으므로, 피하는 것만이 능사는 아닙니다."
            },
            {
              q: "답변을 안 하면 그 내용을 모두 인정하는 게 되나요?",
              a: "바로 법적으로 인정되는 것은 아닙니다. 하지만 나중에 재판이 열렸을 때 불리한 정황으로 작용할 수 있으므로 억울한 부분이 있다면 명확히 반박해 두는 것이 좋습니다."
            }
          ]}
        />

        <NoticeBox>
          내용증명이 도착했다는 것은 조만간 '지급명령'이나 '민사소송'이 들어올 확률이 높다는 뜻입니다. 더 큰 조치가 들어오기 전에 개인회생 등 법적 대응을 준비하세요.
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