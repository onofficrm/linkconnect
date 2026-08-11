import React from 'react';
import { HeartHandshake, Star, Package, Scale } from 'lucide-react';

export const SocialProof: React.FC = () => {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 space-y-8">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div className="space-y-2 text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                10명 중 3명이 고객 추천으로 방문!
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
                한 번 이용하신 고객님의 추천으로 더 많은 분들이 신독환경을 찾고 계십니다.
                <br className="hidden sm:block" />
                <strong className="font-extrabold text-slate-900">합리적인 가격</strong>과{' '}
                <strong className="font-extrabold text-slate-900">꼼꼼한 서비스</strong>에
                만족하셨기 때문입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: <Package className="w-5 h-5" />, label: '누적 의뢰', value: '1,000건+' },
            { icon: <Scale className="w-5 h-5" />, label: '연평균 처리 물량', value: '200톤+' },
            { icon: <Star className="w-5 h-5 fill-amber-400 text-amber-400" />, label: '고객 만족도', value: '★ 4.9 / 5.0' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:py-5 text-center shadow-xs"
            >
              <div className="mx-auto mb-2 w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-500">{item.label}</div>
              <div className="mt-1 text-base sm:text-lg font-black text-slate-900 tabular-nums">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
