import React, { useState } from "react";
import { Calculator, Clock, Users, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export const EstimateCalculator: React.FC = () => {
  const [spaceType, setSpaceType] = useState("아파트");
  const [sizeRange, setSizeRange] = useState("20~30평");

  // Calculate recommendation based on state
  const getCalculation = () => {
    let hours = "3~4시간";
    let team = "2~3인 전담팀";
    const benefits = "무료 현장 진단 + 퇴거 마감";

    if (sizeRange === "10평 미만") {
      hours = "2~3시간";
      team = "1~2인 전담팀";
    } else if (sizeRange === "10~20평") {
      hours = "3~4시간";
      team = "2인 전담팀";
    } else if (sizeRange === "20~30평") {
      hours = "3~5시간";
      team = "2~3인 전담팀";
    } else if (sizeRange === "30~40평") {
      hours = "4~6시간";
      team = "3~4인 전담팀";
    } else if (sizeRange === "40평 이상") {
      hours = "5~7시간";
      team = "4인 이상 맞춤팀";
    }

    return { hours, team, benefits };
  };

  const result = getCalculation();

  const scrollToFormWithPreset = () => {
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
    <section id="section-calculator" className="py-16 lg:py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full font-bold text-xs">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>3초 간이 견적 계산기</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            유품정리 맞춤 <span className="text-amber-400">예상 작업 일정</span> 확인하기
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            공간 종류와 평수를 선택하시면 반출 인력 및 예상 작업 시간이 바로 계산됩니다.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Options Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. 공간 종류 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                1. 공간 종류 선택
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["아파트", "빌라", "원룸/오피스텔", "단독주택"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSpaceType(type)}
                    className={`py-2.5 px-2 text-xs font-extrabold rounded-xl border transition-all ${
                      spaceType === type
                        ? "bg-blue-600 text-white border-blue-500 shadow-md scale-102"
                        : "bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 평수 규모 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                2. 평수 규모 선택
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {["10평 미만", "10~20평", "20~30평", "30~40평", "40평 이상"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSizeRange(size)}
                    className={`py-2.5 px-2 text-xs font-extrabold rounded-xl border transition-all ${
                      sizeRange === size
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102"
                        : "bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Card Column (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 to-blue-950/90 border border-blue-500/30 rounded-2xl p-6 space-y-5 text-left shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-extrabold text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 맞춤 반출 진단 결과
              </span>
              <span className="text-[11px] text-slate-400">1:1 현장 방문 무료</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" /> 예상 작업 시간
                </span>
                <span className="text-sm font-black text-white">{result.hours}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" /> 추천 배치 인력
                </span>
                <span className="text-sm font-black text-white">{result.team}</span>
              </div>

              <div className="flex items-start justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> 포함 안내
                </span>
                <span className="text-xs font-bold text-amber-300 text-right">{result.benefits}</span>
              </div>
            </div>

            <button
              onClick={scrollToFormWithPreset}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>선택 조건으로 1:1 무료 상담 신청하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
