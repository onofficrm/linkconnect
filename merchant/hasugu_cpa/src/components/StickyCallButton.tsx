import { Phone, Edit } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';

export default function StickyCallButton() {
  const { hasPhone } = usePartnerContext();

  const scrollToForm = () => {
    const formSection = document.getElementById('consultation-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="flex px-4 py-3 gap-3">
          {hasPhone ? (
            <CallButton
              id="floating_call_btn"
              placement="sticky"
              className="flex-1 flex justify-center items-center gap-2 bg-blue-600 active:bg-blue-700 text-white text-[16px] font-bold h-[52px] rounded-xl transition-colors"
              aria-label="전화상담 연결"
            >
              <Phone size={20} />
              전화상담
            </CallButton>
          ) : null}
          <button
            onClick={scrollToForm}
            id="floating_form_btn"
            data-event-name="floating_form_click"
            data-placement="sticky"
            className={`${hasPhone ? 'flex-1' : 'w-full'} flex justify-center items-center gap-2 bg-slate-800 active:bg-slate-900 text-white text-[16px] font-bold h-[52px] rounded-xl transition-colors`}
            aria-label="빠른문의 폼으로 이동"
          >
            <Edit size={20} />
            빠른문의
          </button>
        </div>
      </div>

      {hasPhone ? (
        <div className="hidden sm:block fixed bottom-8 right-8 z-50 phone-only">
          <CallButton
            id="pc_floating_call_btn"
            placement="sticky"
            className="flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-8 rounded-full shadow-xl shadow-blue-900/20 hover:-translate-y-1 transition-all"
            aria-label="전화상담 연결"
          >
            <Phone size={24} className="animate-pulse" />
            전화상담 연결
          </CallButton>
        </div>
      ) : null}
    </>
  );
}
