import React from 'react';
import { PhoneCall, ArrowRight, ShieldCheck } from 'lucide-react';
import { modemoAsset } from '../lib/modemoAsset';

interface RealCasesProps {
  onScrollToForm: () => void;
}

/** Real assets only — labels limited to what filenames imply; no fabricated pyeong/cost. */
const fieldCases = [
  {
    id: 'case-slot-01',
    src: 'images/1_천안상가.jpg',
    alt: '철거 현장',
    label: '철거 현장',
  },
  {
    id: 'case-slot-02',
    src: 'images/2_여의도사무실.jpg',
    alt: '철거 현장',
    label: '철거 현장',
  },
  {
    id: 'case-slot-03',
    src: 'images/1_용인주택.jpg',
    alt: '철거 현장',
    label: '철거 현장',
  },
  {
    id: 'case-slot-04',
    src: 'images/3_사당상가.jpg',
    alt: '철거 현장',
    label: '철거 현장',
  },
];

export const RealCases: React.FC<RealCasesProps> = ({ onScrollToForm }) => {
  return (
    <section id="real-cases" className="py-14 sm:py-18 px-4 sm:px-6 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        <div className="text-center space-y-2.5">
          <span className="inline-block text-xs font-black text-blue-400 tracking-wider uppercase bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
            FIELD OVERVIEW
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            현장별 <span className="text-blue-400">철거 서비스 안내</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            상가, 사무실, 주택 등 공간별 특성에 맞춘 철거 상담을 진행합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {fieldCases.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all shadow-md"
            >
              <div className="aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={modemoAsset(item.src)}
                  alt={item.alt}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-white">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900/90 border border-blue-800/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>현장 맞춤 철거 상담</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              내 현장에 맞는 철거 견적이 궁금하신가요?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal">
              공간 구조와 폐기물 처리 동선에 맞추어 안내해 드립니다.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              id="mid-cta-btn"
              type="button"
              onClick={onScrollToForm}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm sm:text-base font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <PhoneCall className="w-4 h-4" />
              <span>철거 상담 신청</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
