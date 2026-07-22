import { Phone } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';

export default function Header() {
  const { data, hasPhone } = usePartnerContext();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight">
            {data.merchant_name}
          </div>
          <span className="hidden sm:inline-block text-[15px] text-slate-500 font-medium border-l border-slate-300 pl-3">
            하수구·배관 문제 해결 전문
          </span>
        </div>

        <div className="flex items-center gap-4">
          {hasPhone ? (
            <div className="hidden sm:flex items-center gap-2 phone-only">
              <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                <Phone size={18} />
              </div>
              <span className="partner-phone-text text-lg font-bold text-slate-800">
                {data.tracking_phone_display}
              </span>
            </div>
          ) : null}
          <CallButton
            placement="header"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold transition-all shadow-md shadow-orange-500/20 text-[15px] sm:text-base active:scale-95"
            aria-label="24시간 전화상담"
          >
            <Phone size={16} className="sm:hidden" aria-hidden="true" />
            24시간 전화상담
          </CallButton>
        </div>
      </div>
    </header>
  );
}
