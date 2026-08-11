import React from "react";
import { Boxes, Truck, Clock, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import { PAIN_POINTS } from "../data/initialData";

export const PainPoints: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Boxes":
        return <Boxes className="w-6 h-6 text-blue-600" />;
      case "Truck":
        return <Truck className="w-6 h-6 text-indigo-600" />;
      case "Clock":
        return <Clock className="w-6 h-6 text-amber-600" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-emerald-600" />;
      default:
        return <Boxes className="w-6 h-6 text-blue-600" />;
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById("section-form");
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="section-painpoints" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>고객 고민 공감</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            빼내야 할 물건이 많아 <br />
            <span className="text-blue-600">막막하신가요?</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            유품·짐·대형 가구와 폐기물이 있는 경우, <br className="hidden sm:inline" />
            개인이 직접 반출하기에는 많은 시간과 체력이 필요합니다.
          </p>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            전문 작업팀이 물품을 분류·반출하고, 퇴거 마감까지 진행해 부담을 줄여드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {PAIN_POINTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={scrollToForm}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group text-left min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getIcon(item.icon)}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-blue-600 flex items-center gap-1">
                <span>전문 반출 상담 진행</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-white">
              혼자 고민하지 마세요. 전문가가 현장 맞춤 상담을 도와드립니다.
            </h4>
            <p className="text-xs text-slate-300">
              3분 내 신속한 상담 연결 · 100% 무료 방문 견적 진행
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            className="shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>무료 견적 상담받기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
