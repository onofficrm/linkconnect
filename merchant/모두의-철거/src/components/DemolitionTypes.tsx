import React from 'react';
import { 
  Store, 
  Building2, 
  Home, 
  Hammer, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';

interface DemolitionTypesProps {
  onScrollToForm?: () => void;
}

interface ServiceType {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
}

const serviceTypes: ServiceType[] = [
  {
    id: 'type-store',
    title: '상가 철거',
    desc: '카페, 식당, 로드샵 등 매장 내부 인테리어 및 집기 철거 상담',
    icon: Store
  },
  {
    id: 'type-office',
    title: '사무실 철거',
    desc: '유리 칸막이, 바닥재, 천장재 철거 및 공용부 보양 상담',
    icon: Building2
  },
  {
    id: 'type-residential',
    title: '주택 철거',
    desc: '아파트, 빌라 리모델링 전 마루, 욕실, 샤시, 가구 철거',
    icon: Home
  },
  {
    id: 'type-partial',
    title: '부분 철거',
    desc: '바닥, 발코니, 주방 닥트, 가벽 등 필요한 구간 철거 상담',
    icon: Hammer
  },
  {
    id: 'type-restoration',
    title: '원상복구',
    desc: '임대차 계약 만료 퇴거 시 관리 규정에 맞춘 복구 상담',
    icon: RefreshCw
  },
  {
    id: 'type-waste',
    title: '폐기물 처리',
    desc: '철거 과정에서 발생하는 건축 폐기물 성상별 분류 및 반출',
    icon: Trash2
  }
];

export const DemolitionTypes: React.FC<DemolitionTypesProps> = () => {
  return (
    <section id="service-types" className="py-14 sm:py-18 px-4 sm:px-6 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <span className="inline-block text-xs font-black text-blue-600 tracking-wider uppercase bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200">
            SERVICE TYPES
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            이런 철거가 <span className="text-blue-600">필요하신가요?</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            공간의 구조와 목적에 맞춘 다양한 철거 상담을 도와드립니다.
          </p>
        </div>

        {/* 6 Service Cards Grid (Desktop 3-col, Mobile 2-col or 1-col clean cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {serviceTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={`service-card-${item.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-xs text-slate-600 leading-relaxed font-normal">
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
