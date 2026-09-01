import React from 'react';
import { Calculator, Building2, HardHat } from 'lucide-react';

const strengths = [
  {
    num: '01',
    title: '현장 맞춤 견적',
    desc: '공간 구조와 폐기물 배출 동선을 고려하여 현장 상황에 맞는 적정 견적을 안내합니다.',
    icon: Calculator
  },
  {
    num: '02',
    title: '다양한 공간 철거',
    desc: '상가 매장, 사무실, 주거공간, 부분 철거 등 공간별 특성에 맞춰 상담·연결을 진행합니다.',
    icon: Building2
  },
  {
    num: '03',
    title: '철거 작업과 폐기물 반출 상담',
    desc: '공용부 보양과 현장 규정을 고려하며, 철거 폐기물을 분류하여 반출 정리합니다.',
    icon: HardHat
  }
];

export const CoreStrengths: React.FC = () => {
  return (
    <section id="core-strengths" className="py-14 sm:py-18 px-4 sm:px-6 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <span className="inline-block text-xs font-black text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            WHY MODU
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            모두의 철거가 <span className="text-blue-600">추구하는 3가지</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            철거 상담부터 현장 연결, 폐기물 반출 안내까지 도와드립니다.
          </p>
        </div>

        {/* 3 Core Strength Cards (Light White/Gray Cards with Navy Accents) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {strengths.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                id={`strength-card-${item.num}`}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      POINT {item.num}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
