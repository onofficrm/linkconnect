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
      feature: "작업 핵심",
      us: "유품·짐·가구 분류·반출에 집중",
      others: "청소 업체처럼 세척·소독만 강조하고 반출은 부실",
    },
    {
      feature: "마감 범위",
      us: "퇴거 후 깔끔한 마감 서비스",
      others: "전문 청소·방역을 묶어 과잉 견적 유도",
    },
    {
      feature: "투입 인력",
      us: "반출·운반 경험 있는 직영 작업팀",
      others: "검증되지 않은 일용직/아르바이트 인력",
    },
    {
      feature: "방문 및 상담 대응",
      us: "빠른 콜백 & 당일·지정일 출장 가능",
      others: "상담 연결 불통 및 예약 날짜 지연 반복",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>유품정리서비스 차별점</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            <span className="text-blue-600">“보이지 않는 곳에서 성실하게”</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            신독환경만의 철학으로 정직하고 깔끔하고 신속하게 정리해드립니다.
          </p>
        </div>

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
                      <span>신독환경 유품정리</span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold text-slate-400 w-1/3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>청소 중심 일반 업체</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md">
              SERVICE 01
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              유품정리 · 짐 반출
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              유품, 잔짐, 생활용품을 분류하고 안전하게 반출합니다. 보관·폐기·재활용 구분이 필요한 현장도 체계적으로 진행합니다.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> 유품·짐 분류 및 물품 반출
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> 이사·퇴거 잔짐 일괄 처리
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md">
              SERVICE 02
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              가구·가전 · 폐기물 처리
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              대형 가구·가전 운반과 폐기물 처리를 담당합니다. 물품 반출 후 남은 잔여물을 치우고 바닥을 깔끔하게 정돈해 드립니다.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 침대·장롱·냉장고 등 대형 물품 수거
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 퇴거 후 깔끔한 마감 서비스
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-sm sm:text-base rounded-xl shadow-md transition-all"
          >
            <span>유품정리 무료 견적 확인하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
