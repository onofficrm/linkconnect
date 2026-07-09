import { Phone, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePartnerContext } from "../context/PartnerContext";
import { formatPhoneDisplay, phoneTelHref } from "../lib/partnerData";

export default function BottomCTA() {
  const navigate = useNavigate();
  const { hasPhone, data } = usePartnerContext();

  const scrollToForm = () => {
    navigate('/consultation');
    window.setTimeout(() => {
      document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const tel = hasPhone ? phoneTelHref(data.partner_phone) : '';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-gray-100 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] backdrop-blur-md sm:hidden">
      {hasPhone && tel ? (
        <a
          href={tel}
          className="bottom-phone-btn phone-only partner-phone-link flex w-[40%] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-point bg-point py-3.5 text-[15px] font-bold text-main shadow-md transition-transform active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" />
          <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">
            {formatPhoneDisplay(data.partner_phone_display || data.partner_phone) || '전화상담'}
          </span>
        </a>
      ) : null}
      <button
        type="button"
        onClick={scrollToForm}
        className={`bottom-form-btn flex items-center justify-center gap-1.5 rounded-xl bg-cta py-3.5 text-[15px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98] ${
          hasPhone ? 'flex-1' : 'w-full flex-1'
        }`}
      >
        <Edit className="h-4 w-4" />
        상담신청
      </button>
    </div>
  );
}
