import React from 'react';
import { 
  ClipboardList, 
  MapPinCheck, 
  FileText, 
  Hammer
} from 'lucide-react';

const steps = [
  {
    step: '01',
    label: 'STEP 01',
    icon: ClipboardList,
    title: '간편 상담 신청',
    desc: '현장 위치와 철거 유형 등 기본 정보를 접수합니다.'
  },
  {
    step: '02',
    label: 'STEP 02',
    icon: MapPinCheck,
    title: '현장 확인 및 상담',
    desc: '공간 구조와 폐기물 반출 동선을 확인·안내합니다.'
  },
  {
    step: '03',
    label: 'STEP 03',
    icon: FileText,
    title: '견적 및 범위 안내',
    desc: '작업 범위와 세부 공정에 맞춘 견적을 안내합니다.'
  },
  {
    step: '04',
    label: 'STEP 04',
    icon: Hammer,
    title: '철거 및 마무리',
    desc: '현장 조건에 맞춰 철거 작업을 진행합니다.'
  }
];

export const ProcessSteps: React.FC = () => {
  return (
    <section id="process-steps" className="py-14 sm:py-18 px-4 sm:px-6 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <span className="inline-block text-xs font-black text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            PROCESS
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            모두의 철거 <span className="text-blue-600">진행 방식</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            상담 신청부터 철거 마무리까지 체계적인 4단계로 진행됩니다.
          </p>
        </div>

        {/* 4 Steps Grid (Desktop 4-col, Mobile 1-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                id={`process-step-${item.step}`}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {item.label}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 pt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
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
