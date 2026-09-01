import React, { useEffect, useState } from 'react';
import { PhoneCall, ArrowUpRight } from 'lucide-react';

interface FloatingMobileBarProps {
  onScrollToForm: () => void;
}

export const FloatingMobileBar: React.FC<FloatingMobileBarProps> = ({ onScrollToForm }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const formElement = document.getElementById('consultation-form');
    if (!formElement) return;

    // Hide floating bar when consultation form enters viewport so it doesn't cover the submit button
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.05,
      }
    );

    observer.observe(formElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] shadow-2xl transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto">
        <button
          id="mobile-bottom-cta"
          type="button"
          onClick={onScrollToForm}
          className="w-full h-12 rounded-xl bg-blue-600 active:bg-blue-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>철거 견적 상담</span>
          <ArrowUpRight className="w-4 h-4 text-blue-200" />
        </button>
      </div>
    </div>
  );
};
