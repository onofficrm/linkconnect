import React from "react";
import { PROCESS_STEPS } from "../data/initialData";
import { PhoneCall, ClipboardCheck, Users, CheckCircle2, ArrowRight } from "lucide-react";

export const Process: React.FC = () => {
  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <PhoneCall className="w-6 h-6 text-blue-600" />;
      case 1:
        return <ClipboardCheck className="w-6 h-6 text-indigo-600" />;
      case 2:
        return <Users className="w-6 h-6 text-amber-600" />;
      case 3:
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default:
        return <PhoneCall className="w-6 h-6 text-blue-600" />;
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
    <section id="section-process" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
            <span>진행 절차</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            상담부터 작업 완료까지 <br />
            <span className="text-emerald-600">간단하게 진행됩니다</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            복잡한 과정 없이 4단계 시스템으로 체계적으로 지원해 드립니다.
          </p>
        </div>

        {/* 1. PC Horizontal Cards Layout (lg:grid) */}
        <div className="hidden lg:grid grid-cols-4 gap-6 relative">
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-3 py-1 bg-slate-900 text-amber-400 rounded-full tracking-wider">
                    {step.step}
                  </span>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:scale-110 transition-transform">
                    {getStepIcon(idx)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Arrow Connector for PC */}
              {idx < PROCESS_STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white p-1.5 rounded-full border border-slate-300 text-emerald-600 shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 2. Mobile Vertical Timeline Layout (lg:hidden) */}
        <div className="lg:hidden relative border-l-2 border-emerald-500/40 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[37px] sm:-left-[45px] top-1.5 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                {idx + 1}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 bg-slate-900 text-amber-400 rounded-md">
                    {step.step}
                  </span>
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    {getStepIcon(idx)}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Trigger */}
        <div className="mt-12 text-center">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all active:scale-95 group"
          >
            <span>지금 바로 STEP 01 무료 상담 신청하기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
