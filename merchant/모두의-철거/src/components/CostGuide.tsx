import React from 'react';
import { 
  Calculator, 
  Layers, 
  Trash2, 
  MapPin
} from 'lucide-react';

const costFactors = [
  {
    num: '01',
    icon: Calculator,
    title: '철거 면적 및 구조',
    desc: '평수와 천장고, 가벽·바닥·천장 등 작업 범위에 따라 투입 인력이 달라질 수 있습니다.'
  },
  {
    num: '02',
    icon: Layers,
    title: '원상복구 및 마감 조건',
    desc: '단순 철거인지, 관리사무소 기준에 맞춘 원상복구인지에 따라 공정이 달라집니다.'
  },
  {
    num: '03',
    icon: Trash2,
    title: '폐기물 종류 및 반출량',
    desc: '목재, 석고보드, 콘크리트 등 폐기물 성상별 톤수와 처리 방식에 따라 산정됩니다.'
  },
  {
    num: '04',
    icon: MapPin,
    title: '층수 및 반출 동선',
    desc: '승강기 사용 가능 여부, 사다리차 진입, 계단 양중 등 운반 환경이 반영됩니다.'
  }
];

export const CostGuide: React.FC = () => {
  return (
    <section id="cost-guide" className="py-14 sm:py-18 px-4 sm:px-6 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <span className="inline-block text-xs font-black text-blue-600 tracking-wider uppercase bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200">
            QUOTE GUIDE
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            철거비용은 <span className="text-blue-600">어떻게 결정될까요?</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            현장 상황에 따라 달라지는 4가지 핵심 요소를 안내해 드립니다.
          </p>
        </div>

        {/* 4 Cost Factors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {costFactors.map((factor) => {
            const Icon = factor.icon;
            return (
              <div
                key={factor.num}
                id={`cost-factor-${factor.num}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 shadow-xs group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                      {factor.num}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {factor.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {factor.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 text-center max-w-2xl mx-auto shadow-xs">
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            현장마다 조건이 다르기 때문에, 견적은 상담을 통해 확인하실 수 있습니다.
          </p>
        </div>

      </div>
    </section>
  );
};
