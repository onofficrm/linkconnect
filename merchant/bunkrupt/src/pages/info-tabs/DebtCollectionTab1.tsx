import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab1() {
  const situationCards = [
    {
      title: "독촉전화가 계속 올 때",
      desc: "하루에도 수차례 빚 독촉 전화를 받는 경우",
      action: "통화 내용을 기록하고, 감정적으로 대응하지 않으며 사실관계를 확인합니다.",
      imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80",
      imageAlt: "독촉전화"
    },
    {
      title: "지급명령을 받았을 때",
      desc: "법원으로부터 지급명령 서류가 송달된 경우",
      action: "정해진 기간 안에 내용을 확인하고 2주 이내 이의신청 등 대응 여부를 검토해야 합니다.",
      imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&q=80",
      imageAlt: "지급명령 서류"
    },
    {
      title: "압류가 걱정될 때",
      desc: "급여나 통장에 대한 압류가 예상되는 경우",
      action: "현재 채무 상태와 소득 상황을 기준으로 채무조정(개인회생 등)을 신속히 상담받습니다.",
      imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
      imageAlt: "통장 및 서류"
    },
    {
      title: "불법 추심 의심될 때",
      desc: "야간 전화, 가족 협박 등이 있는 경우",
      action: "통화녹음, 문자, 방문 기록 등 증거를 철저히 보관하고 신고해야 합니다.",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=400&q=80",
      imageAlt: "걱정하는 모습"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="채권추심이란?" 
          description="채권자가 채무자에게 채무 변제를 요구하는 절차입니다.
합법적인 범위 안에서 이루어질 수 있지만, 협박성 발언, 반복적인 괴롭힘, 제3자에게 채무 사실을 알리는 행위 등은 문제가 될 수 있습니다." 
          imageUrl="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80"
          imageAlt="휴대폰을 보며 고민하는 모습"
          caption="“당황하지 마시고, 침착하게 현재 상황을 확인해보세요.”"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            채권추심 상담신청
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
            { title: "독촉전화 대처", desc: "감정적 대응을 피하고 통화 녹음과 사실관계 확인" },
            { title: "법적 조치 방어", desc: "지급명령, 압류 등에 대한 신속한 법적 대응 검토" },
            { title: "불법 추심 신고", desc: "가족 연락, 협박 등 불법 추심 행위에 대한 증거 확보" }
          ]} 
        />
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>이런 상황이라면 확인이 필요합니다</SectionTitle>
            <Checklist 
              items={[
                "독촉전화가 하루에도 여러 번 온다",
                "가족이나 직장에 연락하겠다는 말을 들었다",
                "문자나 전화 내용이 협박처럼 느껴진다",
                "지급명령, 소장, 압류 관련 우편을 받았다",
                "통장압류나 급여압류가 걱정된다"
              ]} 
            />
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80" 
              alt="독촉 우편물이나 서류를 확인하는 모습" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
        </div>

        <SectionTitle>상황별 대처방법</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {situationCards.map((card, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <img src={card.imageUrl} alt={card.imageAlt} className="w-full h-40 object-cover" />
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h4>
                <p className="text-[14px] text-gray-500 mb-4">{card.desc}</p>
                <div className="mt-auto bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                  <p className="text-[14px] text-main font-medium leading-relaxed">
                    <span className="font-bold mr-1">대응:</span>{card.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-8 items-start mb-10">
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" 
              alt="서류를 방치하지 않고 정리하는 모습" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
          <div className="flex-1">
            <SectionTitle>하지 말아야 할 행동</SectionTitle>
            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
              <ul className="space-y-4">
                {[
                  "무조건 전화를 피하기만 하는 행동",
                  "확인하지 않고 법원 서류를 방치하는 행동",
                  "추심원에게 감정적으로 분노하며 대응하는 행동",
                  "가족 명의로 급하게 돈을 빌려 막는 행동",
                  "불확실한 인터넷 정보만 믿고 스스로 판단하는 행동"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] sm:text-[16px] text-gray-800 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-red-500 mt-1 font-bold text-lg leading-none">•</span> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <SectionTitle>상담이 필요한 경우</SectionTitle>
        <Checklist 
          items={[
            "이미 연체가 길어지고 있다",
            "지급명령 또는 압류 관련 서류를 받았다",
            "채무가 여러 곳에 나누어져 있다",
            "개인회생 또는 개인파산 가능성이 궁금하다"
          ]} 
        />
        
        <NoticeBox>
          채권추심은 대응 시기를 놓치면 압류 등 큰 불이익으로 이어질 수 있습니다. 상황이 악화되기 전에 정확한 법률 조언을 받는 것이 중요합니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="채권추심으로 힘들다면 현재 상황부터 정리해보세요." 
        description="전문가와 함께 빠르고 안전하게 추심 방어 및 채무조정 방안을 모색할 수 있습니다."
        imageUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
        imageAlt="안전한 상담"
      />
    </div>
  );
}
