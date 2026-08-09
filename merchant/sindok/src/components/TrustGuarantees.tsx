import React from "react";
import { ShieldCheck, Award, Lock, DollarSign, CheckCircle2 } from "lucide-react";

export const TrustGuarantees: React.FC = () => {
  const GUARANTEES = [
    {
      icon: <UsersIcon className="w-6 h-6 text-blue-600" />,
      title: "100% 직영 전문팀",
      badge: "하청/외주 0%",
      desc: "본사에서 직접 정밀 교육을 수료한 베테랑 전문가들만 현장에 전담 투입됩니다.",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      title: "투명한 정찰제 약속",
      badge: "부당 추가금 0원",
      desc: "사전 합의된 방문/상담 견적 외에 현장에서 부당한 추가 요금을 절대 요구하지 않습니다.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      title: "배상책임보험 가입",
      badge: "100% 안심 보장",
      desc: "작업 진행 중 발생할 수 있는 가구/집기 파손에 대비해 배상책임보험에 정식 가입되어 있습니다.",
    },
    {
      icon: <Lock className="w-6 h-6 text-amber-600" />,
      title: "개인정보 & 비밀보장",
      badge: "철저한 보안",
      desc: "상담 내역 및 현장 데이터는 오직 서비스 제공 용도로만 사용되며 철저히 비밀이 보장됩니다.",
    },
  ];

  function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    );
  }

  return (
    <section id="section-trust" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>고객 안심 보장 약속</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            믿고 맡기실 수 있도록 <br className="sm:hidden" />
            <span className="text-blue-600">4가지 안심 시스템</span>을 보장합니다
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            처음부터 끝까지 투명하고 안전하게, 유품·짐 반출을 책임지고 도와드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GUARANTEES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 bg-slate-900 text-amber-300 rounded-md">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{item.title}</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
