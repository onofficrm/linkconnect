import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2 } from 'lucide-react';
import { usePartnerContext } from '../context/PartnerContext';
import CallButton from './CallButton';

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;
const LOGO_ALT = '신독환경 - 보이지 않는 곳에서 성실하게';

export const Header: React.FC = () => {
  const { data, hasPhone } = usePartnerContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const brand = data.merchant_name || '신독환경';
  const phoneDisplay = data.tracking_phone_display || data.partner_phone_display;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 75;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      id="site-header"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200 py-2.5'
          : 'bg-white border-b border-slate-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="#section-hero"
              className="flex items-center shrink-0 rounded-lg bg-[#F9F8F6] px-1.5 py-1"
              aria-label={brand}
            >
              <img
                src={LOGO_SRC}
                alt={LOGO_ALT}
                width={365}
                height={184}
                className="h-9 sm:h-11 w-auto max-w-[150px] sm:max-w-[180px] object-contain"
                decoding="async"
              />
            </a>

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>유품정리서비스 전문</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-bold text-slate-600">
            <button
              type="button"
              onClick={() => scrollToSection('section-advantages')}
              className="hover:text-blue-600 transition-colors py-1 relative group"
            >
              <span>서비스 안내</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-gallery')}
              className="hover:text-blue-600 transition-colors py-1 relative group"
            >
              <span>작업사례</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-reviews')}
              className="hover:text-blue-600 transition-colors py-1 relative group"
            >
              <span>고객후기</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-form')}
              className="text-blue-600 hover:text-blue-700 font-extrabold py-1 relative group"
            >
              <span>상담신청</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200" />
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {hasPhone ? (
              <CallButton
                placement="header"
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 group"
              >
                <Phone className="w-4 h-4 animate-bounce group-hover:animate-none shrink-0 aspect-square" />
                <span className="whitespace-nowrap">전화 상담</span>
                <span className="hidden sm:inline font-mono text-blue-100 font-bold ml-0.5 text-xs partner-phone-text">
                  ({phoneDisplay})
                </span>
              </CallButton>
            ) : (
              <button
                type="button"
                onClick={() => scrollToSection('section-form')}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md"
              >
                <span>무료 견적 신청</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
