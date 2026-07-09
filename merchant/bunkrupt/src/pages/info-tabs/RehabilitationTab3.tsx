import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function RehabilitationTab3() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeaderWithImage 
          title="개인회생 준비서류" 
          description="개인회생 신청 시 필요한 기본 서류를 안내해 드립니다. 개인의 상황(기혼/미혼, 직장인/사업자)에 따라 추가 서류가 필요할 수 있습니다." 
          imageUrl="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
          imageAlt="서류를 정리하는 여성"
          caption="“복잡해 보이지만 하나씩 준비하면 충분히 가능합니다.”"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            준비서류 관련 문의하기
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
            { title: "소득 서류", desc: "현재 소득을 증빙할 수 있는 객관적 자료" },
            { title: "재산/부채 서류", desc: "현재 보유 재산과 채무 내역 서류" }
          ]} 
        />
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col-reverse md:flex-row gap-8 items-start mb-10">
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80" 
              alt="깔끔하게 정리된 서류" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
          <div className="flex-1">
            <SectionTitle>기본 인적사항 서류</SectionTitle>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
              본인을 증명하고 가족 관계를 확인하기 위한 기본 서류입니다. 모든 서류는 <strong className="text-main">주민등록번호 뒷자리까지 모두 표시</strong>되게 발급해야 합니다.
            </p>
            <InfoTable 
              headers={["발급처", "주요 서류"]}
              rows={[
                ["주민센터", "주민등록등초본, 가족관계증명서, 혼인관계증명서"],
                ["주민센터", "지방세세목별과세증명서, 인감증명서"]
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            <SectionTitle>소득 및 재산 관련 서류</SectionTitle>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
              월 변제금을 산정하는 기준이 되므로 가장 중요한 서류입니다.
            </p>
            <InfoTable 
              headers={["구분", "주요 서류"]}
              rows={[
                ["급여소득", "원천징수영수증, 급여명세서(최근 1년), 재직증명서"],
                ["사업소득", "소득금액증명원, 부가가치세과세표준증명, 사업자등록증"],
                ["재산증빙", "임대차계약서, 보험예상해약환급금증명서, 통장내역(최근 1~3년)"]
              ]}
            />
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80" 
              alt="노트북과 계산기가 있는 책상" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
        </div>

        <SectionTitle>서류 발급 시 주의사항</SectionTitle>
        <Checklist 
          items={[
            "모든 서류는 최근 1개월 이내 발급분이어야 합니다.",
            "주민번호 뒷자리가 모두 표기되도록 발급해야 합니다.",
            "통장거래내역은 엑셀이 아닌 은행 공식 출력물이어야 합니다.",
            "부채증명서는 채권자 수에 맞춰 준비해야 합니다."
          ]} 
        />
        
        <div className="mt-12 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col md:flex-row gap-8 items-center mb-10">
          <div className="flex-1 space-y-4">
            <h4 className="text-xl font-bold text-main">서류 준비가 어렵게 느껴지시나요?</h4>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              복잡한 부채증명서 발급이나 은행 서류, 관공서 서류 등은 상담을 통해 대행 및 상세한 안내를 도와드리고 있습니다. 혼자서 막막해하지 마시고 전문가와 함께 시작하세요.
            </p>
          </div>
          <div className="w-full sm:w-1/2 md:w-5/12 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" 
              alt="상담원이 서류를 함께 확인해주는 모습" 
              className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md border border-gray-100" 
            />
          </div>
        </div>

        <FAQAccordion 
          items={[
            {
              q: "서류 준비가 너무 막막한데 도와주시나요?",
              a: "네, 상담을 진행하시면 개인의 상황에 맞춘 서류 목록을 안내해 드리며, 복잡한 부채증명서 발급 등은 대행을 도와드리고 있습니다."
            },
            {
              q: "배우자의 서류도 필요한가요?",
              a: "기혼자의 경우 배우자의 재산(부동산, 차량 등) 일부가 본인의 재산 가치(청산가치)에 반영될 수 있으므로, 배우자의 재산 관련 서류가 요구될 수 있습니다."
            }
          ]}
        />

        <NoticeBox>
          법원의 보정 권고에 따라 추가 서류 제출이 수차례 요구될 수 있습니다. 서류를 꼼꼼히 준비하여 초기 제출하는 것이 심사 기간을 단축하는 방법입니다.
        </NoticeBox>
      </div>

      <BottomCTA 
        title="복잡한 서류, 전문가의 도움이 필요하다면?" 
        description="상담을 신청하시면 현재 상황에 맞는 맞춤형 서류 준비 목록을 안내해 드립니다."
        imageUrl="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
        imageAlt="상담 신청 및 서류 준비"
      />
    </div>
  );
}
