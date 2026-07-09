import fs from 'fs';

const r_tabs = {
  2: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function RehabilitationTab2() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인회생 자격조건" 
          description="개인회생 신청을 위해 반드시 확인해야 할 핵심 자격 요건을 안내해 드립니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "일정한 소득", desc: "급여소득, 영업소득 등 반복적이고 일정한 소득 필수" },
            { title: "채무 한도", desc: "무담보채무 10억원, 담보채무 15억원 이하" },
            { title: "재산 가치", desc: "보유 재산의 총 가치보다 채무가 더 많아야 함" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 자격진단 신청하기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>개인회생 자격 자가진단</SectionTitle>
        <Checklist 
          items={[
            "매월 지속적으로 발생할 것으로 예상되는 소득이 있다",
            "현재 내 재산보다 빚이 더 많다",
            "총 채무가 무담보 10억, 담보 15억 이하이다",
            "이전에 면책을 받았다면 5년이 지났다",
            "도박, 주식, 코인으로 인한 빚도 포함될 수 있다"
          ]} 
        />

        <SectionTitle>직군별 소득 인정 기준</SectionTitle>
        <InfoTable 
          headers={["직군 분류", "소득 증빙 기준", "비고"]}
          rows={[
            ["급여소득자", "근로소득원천징수영수증, 급여명세서 등", "4대보험 미가입자, 아르바이트, 일용직도 증빙 시 가능"],
            ["영업소득자", "종합소득세 확정신고서, 사업자등록증 등", "프리랜서, 배달기사, 보험설계사 포함"],
            ["연금소득자", "연금수급권자 증명서", "국민연금, 공무원연금 등"]
          ]}
        />

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

      <BottomCTA />
    </div>
  );
}`,
  3: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function RehabilitationTab3() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="준비 서류 안내" 
          description="개인회생 신청 시 필요한 기본 서류를 안내해 드립니다. 개인의 상황(기혼/미혼, 직장인/사업자)에 따라 추가 서류가 필요할 수 있습니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "인적 서류", desc: "신분 확인 및 가족 관계 증명 서류" },
            { title: "소득 서류", desc: "현재 소득을 증빙할 수 있는 객관적 자료" },
            { title: "재산/부채 서류", desc: "현재 보유 재산과 채무 내역 서류" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            준비서류 관련 문의하기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>필수 준비 서류 목록</SectionTitle>
        <InfoTable 
          headers={["구분", "발급처", "주요 서류"]}
          rows={[
            ["인적사항", "주민센터(동사무소)", "주민등록등초본, 가족관계증명서, 혼인관계증명서, 지방세세목별과세증명서, 인감증명서"],
            ["급여소득", "직장/국세청", "원천징수영수증, 급여명세서, 재직증명서, 예상퇴직금확인서"],
            ["사업소득", "세무서/관공서", "사업자등록증명, 소득금액증명원, 부가가치세과세표준증명"],
            ["재산사항", "은행/보험사 등", "통장거래내역(최근 1~3년), 보험예상해약환급금증명서, 임대차계약서"]
          ]}
        />

        <SectionTitle>서류 발급 시 주의사항</SectionTitle>
        <Checklist 
          items={[
            "모든 서류는 최근 1개월 이내 발급분이어야 합니다.",
            "주민번호 뒷자리가 모두 표기되도록 발급해야 합니다.",
            "통장거래내역은 엑셀이 아닌 은행 공식 출력물이어야 합니다.",
            "부채증명서는 채권자 수에 맞춰 준비해야 합니다."
          ]} 
        />

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

      <BottomCTA />
    </div>
  );
}`,
  4: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function RehabilitationTab4() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인회생 진행 절차" 
          description="개인회생은 법원을 통해 진행되는 엄격한 절차입니다. 신청부터 면책까지 어떤 과정을 거치는지 안내해 드립니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "약 7일 이내", desc: "신청서 접수 및 금지명령(추심 중단) 결론" },
            { title: "약 3~6개월", desc: "보정권고 및 개시결정 완료" },
            { title: "약 6~8개월", desc: "채권자집회 참석 및 인가결정" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 상담신청
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>진행 단계 요약</SectionTitle>
        <InfoTable 
          headers={["진행 단계", "소요 기간(예상)", "주요 내용"]}
          rows={[
            ["상담 및 서류 준비", "1~2주", "채무조정 가능 여부 판단 및 신청 서류 세팅"],
            ["신청서 접수", "즉시", "법원에 사건 접수 및 사건번호 부여"],
            ["금지명령/중지명령", "접수 후 3~14일", "채권자의 독촉, 압류 등 추심행위 금지"],
            ["회생위원 면담/보정", "접수 후 1~3개월", "서류 미비점 보완 및 소명 자료 추가 제출"],
            ["개시결정", "접수 후 3~6개월", "변제계획안의 적합성 통과, 월 변제금 납부 시작"],
            ["채권자집회", "개시 후 1~2개월", "법원 출석 (이의신청 확인)"],
            ["인가결정", "집회 후 1~2개월", "변제계획안 최종 확정"],
            ["면책결정", "변제 완료 후", "36~60개월 변제 완료 후 잔존 채무 탕감"]
          ]}
        />

        <SectionTitle>핵심 체크포인트</SectionTitle>
        <Checklist 
          items={[
            "신청서 접수와 함께 금지명령을 신청하여 추심을 막는 것이 첫 번째 목표입니다.",
            "보정권고 기간에는 법원의 요구 서류를 기한 내에 성실히 제출해야 합니다.",
            "개시결정 후 지정된 계좌로 월 변제금을 성실히 납부해야 인가가 가능합니다.",
            "채권자집회는 본인이 직접 법원에 출석해야 하는 필수 절차입니다."
          ]} 
        />

        <FAQAccordion 
          items={[
            {
              q: "보정권고가 많이 나오면 기각되나요?",
              a: "보정권고는 기각을 위한 것이 아니라, 서류를 명확히 하여 정당한 판결을 내리기 위한 절차입니다. 전문가의 안내에 따라 성실히 소명하면 됩니다."
            },
            {
              q: "인가결정 후 변제금을 미납하면 어떻게 되나요?",
              a: "월 변제금을 3회 이상 미납할 경우 개인회생 절차가 폐지될 수 있으며, 폐지될 경우 다시 원금과 이자를 갚아야 하는 상태로 돌아가므로 주의해야 합니다."
            }
          ]}
        />

        <NoticeBox>
          법원의 업무량과 개인의 소명 난이도에 따라 소요 기간은 단축되거나 길어질 수 있습니다. 성실한 서류 제출과 전문가와의 소통이 가장 중요합니다.
        </NoticeBox>
      </div>

      <BottomCTA />
    </div>
  );
}`,
  5: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function RehabilitationTab5() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인회생 고려사항 (장단점)" 
          description="개인회생은 채무탕감이라는 강력한 이점이 있지만, 그에 따른 제약도 존재합니다. 제도를 활용하기 전 장점과 단점을 명확히 인지해야 합니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "강력한 장점", desc: "이자는 100%, 원금은 최대 90%까지 합법적 탕감" },
            { title: "자격 유지", desc: "재산을 유지할 수 있고, 공무원 등 자격도 유지됨" },
            { title: "주요 제약", desc: "신용카드 사용 및 신규 대출 등 신용거래 제한" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 상담신청
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
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

      <BottomCTA />
    </div>
  );
}`,
  6: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight, MessageSquareQuote } from 'lucide-react';

export default function RehabilitationTab6() {
  const cases = [
    {
      title: "카드론과 대출이 겹친 직장인 상담 사례",
      situation: "매월 급여는 있었지만 카드론, 현금서비스, 신용대출 상환이 겹치면서 생활비가 부족해진 사례입니다.",
      checks: [
        "월 소득",
        "전체 채무금액",
        "연체 여부",
        "부양가족 여부",
        "최근 대출 내역"
      ],
      point: "소득이 있는 경우라도 실제 변제 가능 금액을 기준으로 검토가 필요합니다."
    },
    {
      title: "자영업 매출 감소로 상환이 어려워진 사례",
      situation: "사업 매출이 줄어들면서 대출 상환과 카드값 부담이 커진 사례입니다.",
      point: "사업소득자는 매출과 실제 소득을 확인할 수 있는 자료 정리가 중요합니다."
    },
    {
      title: "급여압류가 걱정되어 상담을 신청한 사례",
      situation: "연체가 길어지면서 급여압류와 통장압류를 걱정하게 된 사례입니다.",
      point: "압류 전후 상황에 따라 대응 방법이 달라질 수 있으므로 빠른 확인이 필요합니다."
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="상황별 상담 사례" 
          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 최근 대출 여부에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." 
        />
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            내 상황에 맞는 해결책 찾기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="space-y-6">
        {cases.map((item, idx) => (
          <div key={idx} className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-start gap-3">
              <MessageSquareQuote className="w-7 h-7 text-cta shrink-0" />
              {item.title}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <span className="font-bold text-main mr-2">상황:</span>
                <span className="text-gray-700 text-[15px] sm:text-[16px] leading-relaxed">{item.situation}</span>
              </div>
              
              {item.checks && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="font-bold text-gray-800 mb-4 text-[16px]">확인한 내용:</div>
                  <Checklist items={item.checks} />
                </div>
              )}
              
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                <span className="font-bold text-cta mr-2">상담 포인트:</span>
                <span className="text-gray-700 text-[15px] sm:text-[16px] leading-relaxed">{item.point}</span>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Link 
                to="/consultation"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-[15px] font-bold text-white shadow-sm transition-transform hover:bg-gray-800 active:scale-[0.98]"
              >
                비슷한 상황인지 상담받기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <NoticeBox>
        본 사례는 이해를 돕기 위한 예시이며, 실제 개인회생 또는 개인파산 가능 여부는 신청자의 소득, 채무, 재산, 부양가족, 최근 대출 내역 등에 따라 달라질 수 있습니다.
      </NoticeBox>

      <BottomCTA />
    </div>
  );
}`,
  7: `import { PageHeader, SectionTitle, FAQAccordion, BottomCTA } from '../../components/InfoComponents';

export default function RehabilitationTab7() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인회생 자주 묻는 질문(FAQ)" 
          description="개인회생 신청을 고민하시는 분들이 가장 많이 궁금해하는 질문들을 모았습니다." 
        />
        
        <FAQAccordion 
          items={[
            {
              q: "개인회생 신청하면 빚은 얼마나 탕감되나요?",
              a: "이자는 100% 면제되며, 원금은 개인의 소득, 재산, 부양가족에 따라 최대 90%까지 탕감될 수 있습니다. 정확한 탕감률은 꼼꼼한 진단을 통해 확인할 수 있습니다."
            },
            {
              q: "직장이나 가족이 알게 되나요?",
              a: "개인회생 절차는 본인과 법원 사이에서 철저히 비공개로 진행되므로, 직장이나 가족에게 통보되지 않아 모르게 진행이 가능합니다."
            },
            {
              q: "신용불량자가 아니어도 신청 가능한가요?",
              a: "네, 연체가 없거나 연체 기간이 짧은 상태라도 채무를 감당하기 어렵다면 미리 상담을 받고 진행을 검토할 수 있습니다."
            },
            {
              q: "도박이나 주식으로 생긴 빚도 신청 되나요?",
              a: "네, 도박, 주식, 코인 등 사행성 채무도 신청 자체는 가능합니다. 단, 일반 채무에 비해 변제율이 다소 높게 산정될 수 있습니다."
            },
            {
              q: "신청 비용은 얼마나 드나요?",
              a: "법원에 납부하는 인지대, 송달료, 회생위원 선임 비용 등과 변호사/법무사 수임료가 발생합니다. 상황에 따라 분납도 가능하니 상담을 통해 안내받으실 수 있습니다."
            },
            {
              q: "기각되면 어떻게 하나요?",
              a: "서류 미비 등으로 기각되더라도, 원인을 보완하여 재신청이 가능합니다. 처음부터 꼼꼼히 진단받아 기각 확률을 낮추는 것이 중요합니다."
            }
          ]}
        />
      </div>

      <BottomCTA />
    </div>
  );
}`
};

const b_tabs = {
  2: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function BankruptcyTab2() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인파산 자격조건" 
          description="채무 변제가 불가능한 상황인지 법원에서 인정받기 위한 핵심 조건을 안내해 드립니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "지급 불능", desc: "보유 재산과 소득으로 빚을 갚을 수 없는 객관적 상태" },
            { title: "최저생계비 이하 소득", desc: "소득이 없거나 가족 수에 따른 최저생계비보다 소득이 적음" },
            { title: "채무 원인", desc: "과소비, 도박 등이 아닌 생활고, 사업실패 등 참작 사유" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 파산자격 진단
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>이런 분들이 검토할 수 있습니다</SectionTitle>
        <Checklist 
          items={[
            "나이가 많아 정상적인 근로가 어려운 경우",
            "질병, 장애 등으로 소득 활동이 불가능한 경우",
            "오랜 사업 실패로 거액의 채무가 생긴 고령자",
            "장기 연체로 신용불량 상태가 오래 지속된 경우",
            "소득이 있지만 최저생계비에 한참 미치지 못하는 경우"
          ]} 
        />

        <SectionTitle>면책 불허가 사유 (주의)</SectionTitle>
        <InfoTable 
          headers={["불허가 사유", "설명"]}
          rows={[
            ["재산 은닉", "재산을 숨기거나 타인 명의로 빼돌린 경우"],
            ["사행성 채무", "도박, 과도한 낭비, 주식 투자 등으로 큰 빚을 진 경우"],
            ["허위 진술", "법원에 허위 사실을 진술하거나 서류를 위조한 경우"],
            ["과거 면책 이력", "개인파산 면책 후 7년, 회생 면책 후 5년이 지나지 않은 경우"]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "소득이 조금 있는데 개인파산이 되나요?",
              a: "소득이 있더라도 부양가족에 따른 최저생계비보다 확연히 적고, 향후에도 소득 증가 여지가 없다면 파산 신청을 검토해볼 수 있습니다."
            },
            {
              q: "나이가 젊은데 파산이 될까요?",
              a: "젊고 건강하여 근로 능력이 있다면 원칙적으로 파산은 어렵고 개인회생을 해야 합니다. 단, 중증 질환이나 장애 등 객관적인 근로 불능 사유가 있다면 예외적으로 가능할 수 있습니다."
            }
          ]}
        />

        <NoticeBox>
          개인파산은 개인회생보다 자격 요건이 매우 엄격합니다. 본인이 파산 대상인지 개인회생 대상인지 먼저 전문가와 상의하여 결정해야 합니다.
        </NoticeBox>
      </div>

      <BottomCTA />
    </div>
  );
}`,
  3: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function BankruptcyTab3() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="파산/면책 준비 서류" 
          description="개인파산 및 면책 신청 시 법원은 지원자의 재산과 소득 없음을 증명할 수 있는 엄격한 서류 제출을 요구합니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "인적 서류", desc: "신분 확인 및 가족 관계 증명 서류" },
            { title: "소득 증빙 없음", desc: "사실증명(소득신고내역없음) 등 무소득 증빙 서류" },
            { title: "재산/부채 서류", desc: "현재 재산 상황 및 부채 발생 경위 소명 자료" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            준비서류 관련 문의하기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>필수 준비 서류 목록</SectionTitle>
        <InfoTable 
          headers={["구분", "발급처", "주요 서류"]}
          rows={[
            ["인적사항", "주민센터", "주민등록등초본, 가족관계증명서, 혼인관계증명서, 지방세세목별과세증명서, 인감증명서"],
            ["소득/재산사항", "국세청/은행", "소득금액증명(또는 무소득사실증명), 통장거래내역, 보험가입내역서, 임대차계약서"],
            ["질병/장애 (해당자)", "병원/주민센터", "진단서, 소견서, 장애인등록증 (근로 능력 상실 소명용)"]
          ]}
        />

        <SectionTitle>서류 준비 시 주의사항</SectionTitle>
        <Checklist 
          items={[
            "모든 서류는 최근 1개월 이내 발급된 원본이어야 합니다.",
            "통장거래내역은 보통 최근 3~5년치를 꼼꼼히 확인합니다.",
            "부채증명서는 모든 채권자를 빠짐없이 확인하여 발급해야 면책에서 누락되지 않습니다.",
            "진술서(채무증대경위서)는 육하원칙에 따라 진실되게 작성해야 합니다."
          ]} 
        />

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

      <BottomCTA />
    </div>
  );
}`,
  4: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function BankruptcyTab4() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인파산 진행 절차" 
          description="개인파산 선고부터 최종 목표인 '면책'을 받기까지의 법원 절차를 안내해 드립니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "약 1~2개월", desc: "신청서 접수 및 파산 선고" },
            { title: "약 2~4개월", desc: "파산관재인 조사 및 면담" },
            { title: "약 6~10개월", desc: "채권자 집회 및 최종 면책 결정" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            절차 관련 상담받기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>진행 단계 요약</SectionTitle>
        <InfoTable 
          headers={["진행 단계", "소요 기간(예상)", "주요 내용"]}
          rows={[
            ["상담 및 서류 준비", "2~4주", "채무내역 확인, 부채증명서 발급 및 서류 작성"],
            ["파산/면책 동시 신청", "접수 시", "관할 법원에 파산 및 면책 신청서 일괄 접수"],
            ["파산관재인 선임", "신청 후 1~2개월", "법원에서 재산 조사를 담당할 파산관재인 선임"],
            ["파산 선고", "신청 후 1~2개월", "파산 선고 결정 (이때부터 압류 해제 가능)"],
            ["관재인 조사/면담", "선고 후 1~3개월", "은닉 재산 유무, 면책 불허가 사유 등 집중 조사"],
            ["채권자집회", "조사 후", "법원 출석, 관재인의 조사 결과 보고"],
            ["면책 결정", "집회 후 1~2개월", "최종적으로 채무 탕감 판결 확정"]
          ]}
        />

        <SectionTitle>핵심 체크포인트</SectionTitle>
        <Checklist 
          items={[
            "파산 선고는 끝이 아니라 시작입니다. 최종 '면책'을 받아야 빚이 없어집니다.",
            "파산관재인의 면담 요청 및 서류 보완 요구에 성실히 응해야 합니다.",
            "채권자집회 기일에는 반드시 본인이 지정된 시간에 법원에 출석해야 합니다."
          ]} 
        />

        <FAQAccordion 
          items={[
            {
              q: "파산 선고를 받으면 불이익이 있나요?",
              a: "파산 선고 후 면책 결정을 받기 전까지는 공무원 임용 제한 등 일부 자격 제한이 있을 수 있으나, 보통 몇 달 후 면책 결정을 받으면 이러한 제한(복권)이 모두 사라집니다."
            },
            {
              q: "파산관재인 비용은 따로 내야 하나요?",
              a: "네, 법원에 예납금 형태로 파산관재인 비용을 납부해야 절차가 진행됩니다. 금액은 채무액 등에 따라 다르나 대략 30만원 내외입니다."
            }
          ]}
        />

        <NoticeBox>
          법원의 심사 일정이나 관재인의 조사 강도에 따라 전체 소요 기간은 다를 수 있습니다. 특히 재산 처분 내역이 복잡할 경우 조사가 길어질 수 있습니다.
        </NoticeBox>
      </div>

      <BottomCTA />
    </div>
  );
}`,
  5: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function BankruptcyTab5() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인파산 주의사항" 
          description="면책 불허가 사유 및 진행 과정 중 주의해야 할 중요한 내용을 확인하세요." 
        />
        
        <SummaryCards 
          items={[
            { title: "누락된 채무", desc: "채권자 목록에서 빠진 채무는 면책되지 않음" },
            { title: "비면책 채권", desc: "세금, 벌금, 양육비 등은 파산해도 탕감 안 됨" },
            { title: "재산 은닉 금지", desc: "조사 중 재산 은닉 발견 시 면책 불허 및 처벌" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            전문가와 주의사항 상담
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>파산 신청 시 흔히 하는 실수</SectionTitle>
        <Checklist 
          items={[
            "지인에게 빌린 돈만 몰래 먼저 갚는 행위 (편파 변제)",
            "파산 신청 직전에 재산을 급하게 처분하거나 명의를 바꾸는 행위",
            "오래된 빚이라 잊어버리고 채권자 목록에 기재하지 않는 행위",
            "관재인 면담 시 불리한 사실을 거짓으로 숨기는 행위"
          ]} 
        />

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

      <BottomCTA />
    </div>
  );
}`,
  6: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight, MessageSquareQuote } from 'lucide-react';

export default function BankruptcyTab6() {
  const cases = [
    {
      title: "질병 및 건강 악화로 근로가 어려운 상담 사례",
      situation: "당뇨 등 만성질환으로 인해 장기간 경제활동이 불가능하여 병원비와 생활비로 채무가 증가한 사례입니다.",
      checks: [
        "근로 능력 상실 여부",
        "진단서 및 병원 기록",
        "현재 소득 유무",
        "재산 상황"
      ],
      point: "근로 능력이 없음을 객관적인 자료(진단서 등)로 소명하는 것이 중요합니다."
    },
    {
      title: "고령 및 무소득으로 상환이 불가능한 사례",
      situation: "고령으로 근로소득이나 사업소득이 없고 기초연금 등 최소한의 지원만으로 생활하며 기존 채무 상환이 불가능한 사례입니다.",
      checks: [
        "연령 및 건강 상태",
        "소득 증빙 자료",
        "과거 면책 이력 여부",
        "가족의 부양 가능 여부"
      ],
      point: "고령으로 인한 무소득 상태는 파산 신청 사유가 될 수 있으나, 재산 은닉 사유가 없는지 확인해야 합니다."
    },
    {
      title: "오랜 연체와 신용불량으로 정상적인 경제활동이 막힌 사례",
      situation: "과거 사업 실패로 인한 장기 연체로 신용불량자가 되어 10년 이상 금융거래를 하지 못하고 일용직으로 생활하던 사례입니다.",
      point: "오래된 채무라도 빠짐없이 채권자를 파악하여 절차를 진행하는 것이 핵심입니다."
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="상황별 상담 사례" 
          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 과거 면책 여부, 건강 상태 등에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." 
        />
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            내 상황에 맞는 해결책 찾기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="space-y-6">
        {cases.map((item, idx) => (
          <div key={idx} className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-start gap-3">
              <MessageSquareQuote className="w-7 h-7 text-cta shrink-0" />
              {item.title}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <span className="font-bold text-main mr-2">상황:</span>
                <span className="text-gray-700 text-[15px] sm:text-[16px] leading-relaxed">{item.situation}</span>
              </div>
              
              {item.checks && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="font-bold text-gray-800 mb-4 text-[16px]">확인한 내용:</div>
                  <Checklist items={item.checks} />
                </div>
              )}
              
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                <span className="font-bold text-cta mr-2">상담 포인트:</span>
                <span className="text-gray-700 text-[15px] sm:text-[16px] leading-relaxed">{item.point}</span>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Link 
                to="/consultation"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-[15px] font-bold text-white shadow-sm transition-transform hover:bg-gray-800 active:scale-[0.98]"
              >
                비슷한 상황인지 상담받기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <NoticeBox>
        본 사례는 이해를 돕기 위한 예시이며, 실제 개인회생 또는 개인파산 가능 여부는 신청자의 소득, 채무, 재산, 부양가족, 최근 대출 내역 등에 따라 달라질 수 있습니다.
      </NoticeBox>

      <BottomCTA />
    </div>
  );
}`,
  7: `import { PageHeader, SectionTitle, FAQAccordion, BottomCTA } from '../../components/InfoComponents';

export default function BankruptcyTab7() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="개인파산 자주 묻는 질문(FAQ)" 
          description="개인파산 신청 시 가장 흔하게 접하는 질문들을 정리했습니다." 
        />
        
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

      <BottomCTA />
    </div>
  );
}`
};

const d_tabs = {
  2: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab2() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="불법 채권추심 대처" 
          description="어떤 행위가 불법인지 명확히 알고, 당황하지 말고 증거를 남기는 것이 대처의 시작입니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "시간 제한", desc: "밤 9시부터 아침 8시 사이의 방문이나 전화는 불법" },
            { title: "제3자 고지", desc: "가족, 직장동료에게 채무 사실을 알리는 행위 불법" },
            { title: "증거 확보", desc: "모든 전화는 녹음하고, 문자와 방문 내역 기록 필수" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            추심 방어 상담받기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>대표적인 불법 추심 행위</SectionTitle>
        <Checklist 
          items={[
            "야간(21:00 ~ 08:00)에 전화, 문자, 방문으로 독촉하는 행위",
            "폭행, 협박, 공포심이나 불안감을 유발하는 언행",
            "가족 등 제3자에게 채무 사실을 알리거나 변제를 요구하는 행위",
            "정당한 사유 없이 직장 등 방문하여 사생활을 평온을 해치는 행위",
            "법적 절차(압류 등)가 진행되지 않았는데 거짓으로 진행 중이라 속이는 행위"
          ]} 
        />

        <SectionTitle>상황별 대처 방법</SectionTitle>
        <InfoTable 
          headers={["불법 행위 유형", "대처 요령"]}
          rows={[
            ["폭언/협박성 전화", "스마트폰 자동녹음 기능 활성화, '녹음 중입니다' 고지 후 침착하게 대응"],
            ["가족/직장에 연락", "어떤 번호로 누구에게 연락했는지 통화기록 확보, 관할 경찰서 및 금감원 신고"],
            ["야간 방문/독촉", "방문 시간대가 찍힌 CCTV 영상이나 사진, 야간 수신 문자 및 통화 내역 보관"],
            ["대납 강요", "가족에게 돈을 빌려 갚으라는 등 대납 강요는 단호히 거절 (불법 행위)"]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "불법 추심을 당하면 빚을 안 갚아도 되나요?",
              a: "아닙니다. 불법 추심 행위에 대해서는 형사처벌이나 과태료 처분을 받게 할 수 있지만, 원래 갚아야 할 원금 자체가 사라지는 것은 아닙니다. 채무 해결은 채무조정제도를 이용해야 합니다."
            },
            {
              q: "채권추심을 합법적으로 당장 멈추게 할 수 있나요?",
              a: "개인회생 신청과 함께 '금지명령'을 신청하면, 법원 결정으로 모든 합법적/불법적 추심 행위를 즉시 중단시킬 수 있습니다."
            }
          ]}
        />

        <NoticeBox>
          혼자서 대응하기 어렵고 공포감을 느낀다면 참지 마시고 즉시 경찰(112) 또는 금융감독원(1332)에 신고하시거나, 채무조정 전문가와 상의하여 법적인 보호 조치(금지명령)를 취하세요.
        </NoticeBox>
      </div>

      <BottomCTA />
    </div>
  );
}`,
  3: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab3() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="독촉전화 대처" 
          description="하루에도 수십 번씩 걸려오는 빚 독촉 전화, 어떻게 응대하는 것이 가장 현명할까요?" 
        />
        
        <SummaryCards 
          items={[
            { title: "신분 확인", desc: "통화 시작 시 채권추심원의 소속과 성명 반드시 확인" },
            { title: "감정 대응 금지", desc: "화내거나 변명하지 말고 사실관계만 짧게 대답" },
            { title: "녹음 고지", desc: "'통화 내용은 녹음되고 있습니다'라고 당당히 밝히기" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            해결 방안 알아보기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>독촉전화 수신 시 행동 요령</SectionTitle>
        <Checklist 
          items={[
            "전화를 무조건 피하지 말고 하루 1~2번 정도는 짧게 받습니다.",
            "(피하기만 하면 추심원이 직장이나 집으로 방문할 명분이 생깁니다.)",
            "지킬 수 없는 약속('내일까지 갚겠다')은 하지 않습니다.",
            "현재 경제적 상황이 어려움을 사실대로만 간단히 말합니다.",
            "추심원이 목소리를 높이거나 협박조로 나오면 전화를 끊어버려도 무방합니다."
          ]} 
        />

        <SectionTitle>이런 전화는 주의하세요 (불법 의심)</SectionTitle>
        <InfoTable 
          headers={["유형", "상세 내용"]}
          rows={[
            ["대납 강요", "'가족이나 지인한테 빌려서라도 입금하라'는 요구"],
            ["거짓 압류 통보", "'오늘 당장 집에 빨간 딱지 붙이러 간다'는 식의 거짓 통보"],
            ["신분 미고지", "자신의 소속 채권추심업체나 이름을 밝히지 않고 독촉하는 행위"],
            ["근무지 방해", "회사로 계속 전화를 걸어 업무를 방해하거나 동료에게 알리는 행위"]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "전화를 아예 안 받으면 어떻게 되나요?",
              a: "장기간 연락 두절 시, 채권자는 '채무자가 갚을 의지가 없다'고 판단하여 자택 방문, 직장 방문, 혹은 법적 절차(지급명령, 가압류 등)를 더 빨리 진행하게 됩니다."
            },
            {
              q: "개인회생을 신청하면 독촉전화가 오지 않나요?",
              a: "네, 개인회생 신청 후 통상 1주일 내외로 법원에서 '금지명령'이 나오며, 이 서류가 채권자들에게 송달되는 즉시 모든 독촉전화와 문자가 법적으로 금지됩니다."
            }
          ]}
        />

        <NoticeBox>
          가장 확실한 독촉전화 대처법은 근본적인 채무 해결(개인회생/파산) 절차를 시작하는 것입니다. 제도를 이용하면 법의 보호 아래 평온한 일상을 되찾을 수 있습니다.
        </NoticeBox>
      </div>

      <BottomCTA />
    </div>
  );
}`,
  4: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab4() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="지급명령 대처" 
          description="법원으로부터 '지급명령' 서류를 받았다면, 채권자가 본격적인 강제집행(압류)을 준비하고 있다는 뜻입니다." 
        />
        
        <SummaryCards 
          items={[
            { title: "2주 이내 이의신청", desc: "송달받은 날로부터 14일 이내 이의신청 필수" },
            { title: "확정 시 강제집행", desc: "이의신청 안 하면 바로 통장/급여 압류 가능" },
            { title: "채무조정 검토", desc: "이의신청으로 번 시간 동안 개인회생 준비" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            법적 대응 상담받기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>지급명령 서류를 받았다면</SectionTitle>
        <Checklist 
          items={[
            "절대 서류를 무시하거나 방치하지 마세요.",
            "우편물을 수령한 '날짜'를 반드시 메모해 두세요 (14일 카운트 시작).",
            "서류에 적힌 채권자, 청구금액, 이자가 맞는지 확인하세요.",
            "당장 전액을 갚을 수 없다면 법원에 '이의신청서'를 제출해야 합니다."
          ]} 
        />

        <SectionTitle>지급명령 이의신청 과정</SectionTitle>
        <InfoTable 
          headers={["절차", "내용 및 효과"]}
          rows={[
            ["이의신청서 제출", "2주 이내 관할 법원에 간단한 이의신청서 1장 제출"],
            ["효과", "지급명령의 효력이 상실되고 일반 민사소송 절차로 넘어감"],
            ["시간 확보", "민사소송 판결이 나오기까지 수개월의 시간을 벌 수 있음"],
            ["이후 대처", "이 시간을 활용하여 개인회생 서류를 준비하고 신청(금지명령)"]
          ]}
        />

        <FAQAccordion 
          items={[
            {
              q: "이의신청서에는 뭐라고 적어야 하나요?",
              a: "복잡한 법률 용어가 없어도 됩니다. 단순히 '채권자의 청구 취지에 불복하므로 이의를 신청합니다' 정도만 적어 제출해도 효력이 발생합니다."
            },
            {
              q: "빚이 있는 게 맞는데도 이의신청을 해도 되나요?",
              a: "네, 금액의 오류 여부를 다투거나 단순히 시간을 확보할 목적으로도 절차상 이의신청은 누구나 가능합니다."
            }
          ]}
        />

        <NoticeBox>
          지급명령 이의신청 자체는 빚을 없애주지 않습니다. 압류가 들어오는 타이밍을 늦추는 수단일 뿐이며, 근본적으로는 개인회생을 통해 채무를 조정해야 합니다.
        </NoticeBox>
      </div>

      <BottomCTA />
    </div>
  );
}`,
  5: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab5() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="급여/통장 압류 대처" 
          description="채권자가 내 통장이나 월급을 압류했다면 당장 생계가 막막해집니다. 이를 해제하고 대처하는 방법을 확인하세요." 
        />
        
        <SummaryCards 
          items={[
            { title: "최저생계비 보호", desc: "월 185만원(법정) 이하의 예금/급여는 압류 금지" },
            { title: "중지명령", desc: "개인회생 신청 시 압류 진행을 멈추는 중지명령 신청" },
            { title: "압류 해제", desc: "개인회생 인가결정 이후 기존 압류 공식 해제 가능" }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            압류 해제 상담받기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>압류 사실을 알게 되었을 때</SectionTitle>
        <Checklist 
          items={[
            "당황하여 채권자에게 무리한 합의(전액 상환 등)를 시도하지 마세요.",
            "압류된 은행이 어디인지, 금액이 얼마인지 정확히 파악하세요.",
            "직장에 급여 압류 통지서가 갔다면 회사에 상황(개인회생 진행 등)을 잘 설명하세요.",
            "법이 정한 압류금지 채권(185만원 이하)을 보호받기 위한 조치를 취하세요."
          ]} 
        />

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

      <BottomCTA />
    </div>
  );
}`,
  6: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function DebtCollectionTab6() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="내용증명 대처" 
          description="채권자로부터 내용증명을 받았다면, 본격적인 법적 분쟁이나 압박이 시작되었다는 신호입니다." 
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
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <SectionTitle>내용증명의 성격과 목적</SectionTitle>
        <Checklist 
          items={[
            "우체국을 통해 '언제, 누구에게, 어떤 내용의 문서를 보냈다'는 사실을 공적으로 증명하는 제도입니다.",
            "그 자체로 압류나 경매를 당장 실행할 수 있는 힘은 없습니다.",
            "주로 채무자에게 심리적 압박을 가하고, 소멸시효를 중단시키기 위한 목적으로 발송됩니다."
          ]} 
        />

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

      <BottomCTA />
    </div>
  );
}`,
  7: `import { PageHeader, SectionTitle, FAQAccordion, BottomCTA } from '../../components/InfoComponents';

export default function DebtCollectionTab7() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <PageHeader 
          title="채권추심 자주 묻는 질문(FAQ)" 
          description="독촉과 압류 등 추심과 관련하여 가장 많이 묻는 질문들입니다." 
        />
        
        <FAQAccordion 
          items={[
            {
              q: "집에 빨간딱지(유체동산가압류)를 붙이겠다는데 진짜 오나요?",
              a: "협박용인 경우가 많습니다. 유체동산 압류는 법원의 판결문이나 공증 서류가 있어야만 집행관을 동반하여 진행할 수 있으며, 추심원이 임의로 와서 붙일 수 없습니다."
            },
            {
              q: "경찰서에 사기죄로 고소하겠다고 합니다.",
              a: "단순히 돈을 못 갚는 것은 '민사' 문제이므로 형사 처벌(사기죄) 대상이 아닙니다. 단, 처음부터 갚을 의도나 능력 없이 대출을 받았다면 사기죄가 성립될 여지가 있으나, 극히 드문 경우입니다."
            },
            {
              q: "채권추심업체 방문을 막을 수 있나요?",
              a: "정당한 권한이 있는 추심원의 방문 자체를 원천 봉쇄할 수는 없으나, 개인회생 금지명령을 받으면 합법적으로 방문을 완전히 막을 수 있습니다."
            }
          ]}
        />
      </div>

      <BottomCTA />
    </div>
  );
}`
};

Object.entries(r_tabs).forEach(([i, content]) => fs.writeFileSync(`src/pages/info-tabs/RehabilitationTab${i}.tsx`, content));
Object.entries(b_tabs).forEach(([i, content]) => fs.writeFileSync(`src/pages/info-tabs/BankruptcyTab${i}.tsx`, content));
Object.entries(d_tabs).forEach(([i, content]) => fs.writeFileSync(`src/pages/info-tabs/DebtCollectionTab${i}.tsx`, content));
