import React from "react";
import { Check, X, ShieldAlert, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export const ServiceDetails: React.FC = () => {
  const scrollToForm = () => {
    const el = document.getElementById("section-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const comparisonData = [
    {
      feature: "비용 산정 방식",
      us: "100% 사전 투명 정찰제 (추가금 ZERO)",
      others: "현장에서 자의적 부풀리기 & 당일 추가금 요구",
    },
    {
      feature: "투입 인력 자격",
      us: "10년 이상 기술 자격증 보유 본사 정속 기사",
      others: "검증되지 않은 일용직/아르바이트 무자격자",
    },
    {
      feature: "사용 약제 및 장비",
      us: "식약처/환경부 인가 100% 친환경 전문 약제",
      others: "독성 화학 약제 사용으로 악취 및 독성 유발",
    },
    {
      feature: "사후 A/S 보증",
      us: "최장 1년 무상 A/S 정식 보증서 발급",
      others: "시공 종료 후 연락 두절 및 사후 처리 거부",
    },
    {
      feature: "방문 및 상담 대응",
      us: "365일 24시간 3분 콜백 & 당일 신속 방문",
      others: "상담 연결 불통 및 예약 날짜 지연 반복",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>상세 서비스 & 차별점 비교</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            일반 타 업체 vs <span className="text-blue-600">저희 서비스의 확실한 차이</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            소비자를 교만하게 눈속임하는 무자격 업체에 피해 보지 않도록 꼼꼼히 비교해 보세요.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-16">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-4 sm:p-5 text-xs sm:text-sm font-extrabold uppercase tracking-wider w-1/4">
                    비교 항목
                  </th>
                  <th className="p-4 sm:p-5 text-sm sm:text-base font-extrabold text-amber-400 bg-slate-800 w-2/5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span>저희 정식 인증 업체</span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold text-slate-400 w-1/3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>일반 비인증 타사</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-blue-950 bg-blue-50/30 border-x border-blue-100">
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.us}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 Detail Service Offerings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md">
              SERVICE 01
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              주거 공간 프리미엄 세밀 케어
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              아파트, 빌라, 단독주택을 대상으로 보이지 않는 구석 오염 제거, 고온 스팀 살균, 곰팡이 억제 및 세균 방제 작업을 진행합니다.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> 1:1 맞춤형 친환경 수제 세척제 활용
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> 세균/유해물질 99.9% 고온 초음파 정밀 소독
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md">
              SERVICE 02
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              상업 / 오피스 매장 정기 유지 관리
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              사무실, 병의원, 학원, 카페, 식당 등 다중 이용 시설에 특화된 정기 위생 클리닝 및 정기 방문 관리를 제공합니다.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 식약처 기준 준수 위생 소독 필증 부착
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 야간/주말 비영업 시간 세심 세팅 출장
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-sm sm:text-base rounded-xl shadow-md transition-all"
          >
            <span>내 공간 맞춤 견적 확인하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
