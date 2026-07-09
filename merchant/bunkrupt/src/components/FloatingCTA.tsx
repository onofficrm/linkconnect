import { useEffect, useState } from 'react';
import { Edit, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePartnerContext } from '../context/PartnerContext';
import { formatPhoneDisplay, phoneTelHref } from '../lib/partnerData';
import { scrollToConsultForm } from '../lib/consultationForm';
import { trackLandingEvent } from '../lib/analytics';

export default function FloatingCTA() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPhone, data } = usePartnerContext();
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById('consult-form');
    if (!target) {
      setFormVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [location.pathname]);

  if (formVisible) return null;

  const goForm = () => {
    trackLandingEvent('floating_cta_click', { surface: 'form' });
    if (location.pathname.includes('/consultation')) {
      scrollToConsultForm();
      return;
    }
    navigate('/consultation');
    scrollToConsultForm();
  };

  const tel = hasPhone ? phoneTelHref(data.partner_phone) : '';

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-gray-100 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] backdrop-blur-md sm:hidden">
        {hasPhone && tel ? (
          <a
            href={tel}
            onClick={() => trackLandingEvent('floating_cta_click', { surface: 'phone_mobile' })}
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
          onClick={goForm}
          className={`bottom-form-btn flex items-center justify-center gap-1.5 rounded-xl bg-cta py-3.5 text-[15px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98] ${
            hasPhone ? 'flex-1' : 'w-full flex-1'
          }`}
        >
          <Edit className="h-4 w-4" />
          30초 무료 확인
        </button>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 hidden sm:block">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {hasPhone && tel ? (
            <a
              href={tel}
              onClick={() => trackLandingEvent('floating_cta_click', { surface: 'phone_desktop' })}
              className="phone-only partner-phone-link inline-flex items-center gap-2 rounded-full border border-point bg-point px-5 py-3 text-sm font-bold text-main shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Phone className="h-4 w-4" />
              <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">
                전화상담
              </span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={goForm}
            className="inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-transform hover:scale-[1.02] hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            30초 무료 확인
          </button>
        </div>
      </div>
    </>
  );
}
