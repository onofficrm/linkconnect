import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import { PageHeaderWithImage, PageHeader, SectionTitle, FAQAccordion, BottomCTA } from '../../components/InfoComponents';

export default function BankruptcyTab7() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인파산 자주 묻는 질문(FAQ)" 
          description="개인파산 신청 시 가장 흔하게 접하는 질문들을 정리했습니다." 
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
        
        <FAQAccordion 
          items={[
            {
              q: "파산하면 평생 금융거래를 못하나요?",
              a: "아닙니다. 면책 결정이 확정되고 약 5년이 지나 공공기록이 삭제되면, 다시 신용카드 발급이나 정상적인 대출 등 금융거래가 가능해질 수 있습니다."
            },
            {
              q: "가족에게 빚이 넘어가지 않나요?",
              a: "본인이 파산면책을 받았다고 해서 그 빚이 가족에게 넘어가지 않습니다. 단, 가족이 보증인으로 서 있는 경우는 예외입니다."
            },
            {
              q: "파산하면 다니던 회사에서 해고당하나요?",
              a: "원칙적으로 파산선고를 이유로 부당하게 해고할 수 없습니다. 다만, 공무원 등 특정 자격증명 직군의 경우 법적으로 당연 퇴직 사유가 될 수 있으므로 신청 전 직무 규정을 확인해야 합니다."
            },
            {
              q: "도박 빚은 정말 안 되나요?",
              a: "도박은 명확한 '면책 불허가 사유'에 해당합니다. 따라서 도박 빚이 주원인이라면 파산보다는 개인회생을 통해 일부를 갚는 방안으로 진행해야 합니다."
            }
          ]}
        />
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