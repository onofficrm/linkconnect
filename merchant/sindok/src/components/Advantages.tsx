import React from "react";
import {
  ClipboardCheck,
  Award,
  Zap,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { SERVICE_ADVANTAGES } from "../data/initialData";

export const Advantages: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ClipboardCheck":
        return <ClipboardCheck className="w-7 h-7 text-blue-600" />;
      case "Award":
        return <Award className="w-7 h-7 text-indigo-600" />;
      case "Zap":
        return <Zap className="w-7 h-7 text-amber-500" />;
      case "CheckCircle2":
        return <CheckCircle2 className="w-7 h-7 text-emerald-600" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-7 h-7 text-sky-600" />;
      case "PhoneCall":
        return <PhoneCall className="w-7 h-7 text-blue-600" />;
      default:
        return <ShieldCheck className="w-7 h-7 text-blue-600" />;
    }
  };

  return (
    <section id="section-advantages" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>서비스 차별성</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            전문 업체에 맡기면 <br className="xs:hidden" />
            <span className="text-blue-600">무엇이 다를까요?</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            숙련된 전문가가 상담부터 물품 반출·퇴거 마감까지 책임집니다.
          </p>
        </div>

        {/* 6 Advantage Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_ADVANTAGES.map((adv, idx) => (
            <div
              key={idx}
              className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-13 h-13 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200/80 group-hover:scale-110 transition-transform shrink-0">
                  {getIcon(adv.icon)}
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {adv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {adv.desc}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>체계적 반출 진행</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
