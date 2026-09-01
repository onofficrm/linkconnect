import React from 'react';
import { PhoneCall } from 'lucide-react';
import { modemoAsset } from '../lib/modemoAsset';

interface HeaderProps {
  onScrollToForm: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onScrollToForm }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={modemoAsset('images/logo_black.png')}
            alt="모두의 철거"
            className="h-8 sm:h-9 w-auto object-contain"
            width={120}
            height={36}
          />
          <span className="sr-only">모두의 철거</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="header-cta-button"
            type="button"
            onClick={onScrollToForm}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>견적 상담 신청</span>
          </button>
        </div>
      </div>
    </header>
  );
};
