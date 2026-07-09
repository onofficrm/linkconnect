import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight, MessageCircle, ClipboardCheck, FileText, Landmark, Calculator, CheckCircle2 } from 'lucide-react';

export default function RehabilitationTab4() {
  const timelineSteps = [
    {
      id: 1,
      icon: <MessageCircle className="w-6 h-6" />,
      title: "상담 및 가능여부 확인",
      duration: "1~2일",
      desc: "현재 채무와 소득, 재산 상황을 진단하고 개인회생 신청이 가능한지 판단합니다. 기본 서류 안내가 이루어집니다."
    },
    {
      id: 2,
      icon: <FileText className="w-6 h-6" />,
      title: "서류 준비 및 변제계획안 작성",
      duration: "1~2주",
      desc: "필요한 서류를 발급받아 전달해주시면, 이를 바탕으로 법원에 제출할 신청서와 월 변제계획안을 작성합니다."
    },
    {
      id: 3,
      icon: <Landmark className="w-6 h-6" />,
      title: "법원 접수 및 금지명령 신청",
      duration: "접수 후 3~14일",
      desc: "법원에 사건을 접수하며 동시에 금지명령을 신청합니다. 금지명령이 나오면 빚 독촉과 압류가 중단됩니다."
    },
    {
      id: 4,
      icon: <ClipboardCheck className="w-6 h-6" />,
      title: "회생위원 면담 및 보정권고",
      duration: "접수 후 1~3개월",
      desc: "법원에서 추가로 요구하는 소명 자료(보정권고)를 제출합니다. 변제금이 확정되는 가장 중요한 단계입니다."
    },
    {
      id: 5,
      icon: <Calculator className="w-6 h-6" />,
      title: "개시결정 및 변제금 납부",
      duration: "접수 후 3~6개월",
      desc: "법원이 변제계획을 임시로 승인(개시결정)하며, 이때부터 지정된 법원 계좌로 매월 변제금을 납부하기 시작합니다."
    },
    {
      id: 6,
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "채권자집회 및 인가결정",
      duration: "집회 후 1~2개월",
      desc: "본인이 직접 법원에 1회 출석하여 채권자집회를 마친 후, 법원이 최종적으로 인가결정을 내립니다."
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인회생 진행 절차" 
          description="개인회생은 법원을 통해 진행되는 엄격한 절차입니다. 신청부터 면책까지 어떤 과정을 거치는지 단계별로 안내해 드립니다." 
          imageUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
          imageAlt="일정을 확인하는 남성"
          caption="“복잡한 절차, 전문가가 끝까지 함께합니다.”"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            진행 절차 문의하기
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
            { title: "약 7일 이내", desc: "신청서 접수 및 금지명령(추심 중단) 결론" },
            { title: "약 3~6개월", desc: "보정권고 및 개시결정 완료" },
            { title: "약 6~8개월", desc: "채권자집회 참석 및 인가결정" }
          ]} 
        />
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>한눈에 보는 진행 절차</SectionTitle>
        
        <div className="relative mt-8 mb-16">
          {/* Timeline Line (Desktop) */}
          <div className="hidden md:block absolute left-[45px] top-[24px] bottom-[24px] w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6 md:space-y-8 relative z-10">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col md:flex-row gap-4 md:gap-8 relative">
                
                {/* Timeline Node */}
                <div className="hidden md:flex flex-col items-center shrink-0 w-[90px]">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center text-cta relative z-10">
                    {step.icon}
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-gray-50/60 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow relative">
                  <div className="md:hidden w-12 h-12 rounded-full bg-blue-50 text-cta flex items-center justify-center mb-4 border-2 border-white shadow-sm">
                    {step.icon}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <span className="inline-flex items-center justify-center bg-point text-white font-bold rounded-lg px-3 py-1 text-sm shadow-sm">
                      STEP 0{step.id}
                    </span>
                    <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                  </div>
                  <p className="text-[15px] text-gray-700 leading-relaxed">
                    {step.desc}
                  </p>
                  <div className="mt-4 inline-block bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 font-medium">
                    예상 소요기간: {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="w-full md:w-5/12 shrink-0 md:mt-6">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" 
              alt="성실하게 서류를 준비하는 모습" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
          <div className="flex-1">
            <SectionTitle>진행 시 핵심 체크포인트</SectionTitle>
            <Checklist 
              items={[
                "신청서 접수와 함께 금지명령을 신청하여 추심을 막는 것이 첫 번째 목표입니다.",
                "보정권고 기간에는 법원의 요구 서류를 기한 내에 성실히 제출해야 합니다.",
                "개시결정 후 지정된 계좌로 월 변제금을 성실히 납부해야 인가가 가능합니다.",
                "채권자집회는 본인이 직접 법원에 1회 출석해야 하는 필수 절차입니다."
              ]} 
            />
          </div>
        </div>

        <FAQAccordion 
          items={[
            {
              q: "보정권고가 많이 나오면 기각되나요?",
              a: "보정권고는 기각을 위한 것이 아니라, 서류를 명확히 하여 정당한 판결을 내리기 위한 절차입니다. 전문가의 안내에 따라 성실히 소명하면 전혀 문제되지 않습니다."
            },
            {
              q: "인가결정 후 변제금을 미납하면 어떻게 되나요?",
              a: "월 변제금을 3회 이상 미납할 경우 개인회생 절차가 폐지될 수 있습니다. 폐지될 경우 다시 원금과 이자를 갚아야 하는 상태로 돌아가므로 납부에 각별히 주의해야 합니다."
            }
          ]}
        />
        <NoticeBox>
          법원의 업무량과 개인의 소명 난이도에 따라 소요 기간은 단축되거나 길어질 수 있습니다. 성실한 서류 제출과 대리인과의 원활한 소통이 가장 중요합니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="복잡한 절차, 혼자 고민하지 마세요" 
        description="상담을 신청하시면 현재 상황에서 인가까지 소요되는 예상 기간과 월 변제금을 안내해 드립니다."
        imageUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
        imageAlt="전문가와의 차분한 상담"
      />
    </div>
  );
}
