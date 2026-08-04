import { Phone } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';

/**
 * 콜디비 가상번호가 있을 때만 표시되는 PC/태블릿 플로팅 전화 버튼.
 * 모바일은 하단 MobileStickyBar와 겹치지 않도록 md+ 만 노출.
 */
export default function FloatingCallButton() {
  const { data, hasPhone } = usePartnerContext();
  if (!hasPhone) return null;

  const display = data.tracking_phone_display || data.partner_phone_display;

  return (
    <div className="phone-only hidden md:block fixed bottom-8 right-6 z-[60]">
      <CallButton
        placement="floating"
        className="relative flex items-center gap-3 pl-4 pr-5 py-3.5 rounded-full bg-emerald-600 text-white shadow-[0_12px_40px_-8px_rgba(5,150,105,0.55)] hover:bg-emerald-500 hover:scale-[1.03] active:scale-[0.98] transition-all"
        aria-label={`전화걸기 ${display}`}
      >
        <span
          className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping pointer-events-none opacity-40"
          aria-hidden
        />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 shrink-0 aspect-square">
          <Phone className="w-5 h-5 fill-current aspect-square" />
        </span>
        <span className="relative flex flex-col items-start leading-tight">
          <span className="text-[11px] font-bold text-emerald-100 tracking-tight">전화걸기</span>
          <span className="partner-phone-text text-[15px] font-extrabold tabular-nums tracking-tight">
            {display}
          </span>
        </span>
      </CallButton>
    </div>
  );
}
