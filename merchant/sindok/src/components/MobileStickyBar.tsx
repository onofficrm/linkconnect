import React from 'react';
import { Phone, Edit3 } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';

export const MobileStickyBar: React.FC = () => {
  const { hasPhone } = usePartnerContext();

  const scrollToForm = () => {
    const el = document.getElementById('section-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-2xl">
      <div className={`grid gap-2 max-w-md mx-auto ${hasPhone ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {hasPhone && (
          <CallButton
            placement="mobile_sticky"
            className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 aspect-square" />
            <span>전화 상담</span>
          </CallButton>
        )}

        <button
          type="button"
          onClick={scrollToForm}
          className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95"
        >
          <Edit3 className="w-4 h-4 aspect-square" />
          <span>무료 견적 신청</span>
        </button>
      </div>
    </div>
  );
};
