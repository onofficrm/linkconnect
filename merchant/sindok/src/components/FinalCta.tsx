import React from 'react';
import { Phone, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';

export const FinalCta: React.FC = () => {
  const { data, hasPhone } = usePartnerContext();

  const scrollToForm = () => {
    const el = document.getElementById('section-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 aspect-square" />
          <span>오늘 신청 고객 한정 무료 방문 진단 혜택</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
          더 이상 망설이지 마세요! <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
            유품정리 1:1 맞춤 견적
          </span>
          을 무료로 먼저 받아보세요
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          물품 반출이 핵심입니다. 전화 한 통 또는 온라인 신청으로 투명하게 견적을 안내해 드립니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {hasPhone && (
            <CallButton
              placement="final_cta"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-xl shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Phone className="w-6 h-6 animate-pulse aspect-square" />
              <span>
                직통 전화 문의:{' '}
                <span className="partner-phone-text">
                  {data.tracking_phone_display || data.partner_phone_display}
                </span>
              </span>
            </CallButton>
          )}

          <button
            type="button"
            onClick={scrollToForm}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>무료 견적 신청 폼으로 이동</span>
            <ArrowRight className="w-5 h-5 aspect-square" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 aspect-square" /> 추가 요금 ZERO 투명 정찰제
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-400 aspect-square" /> 365일 24시간 당일 신속 대응
          </span>
        </div>
      </div>
    </section>
  );
};
