import { Phone } from 'lucide-react';

type Props = {
  tel: string;
  display: string;
};

/** 콜디비 번호가 있을 때만 표시. 모바일은 하단 고정바와 겹치지 않게 md+ 만. */
export default function FloatingCallButton({ tel, display }: Props) {
  if (!tel || !display) return null;

  return (
    <a
      href={tel}
      className="dasibom-float-call hidden md:flex phone-only partner-phone-link fixed bottom-8 right-6 z-[60] items-center gap-3 pl-4 pr-5 py-3.5 rounded-full bg-teal-500 text-slate-900 shadow-[0_12px_40px_-8px_rgba(20,184,166,0.55)] hover:bg-teal-400 hover:scale-[1.03] active:scale-[0.98] transition-all"
      aria-label={`전화상담 ${display}`}
    >
      <span
        className="dasibom-float-call__pulse absolute inset-0 rounded-full bg-teal-400/40 pointer-events-none"
        aria-hidden
      />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-teal-400 shrink-0">
        <Phone className="w-5 h-5 fill-current" />
      </span>
      <span className="relative flex flex-col items-start leading-tight pr-0.5">
        <span className="text-[11px] font-bold text-slate-800/70 tracking-tight">전화상담</span>
        <span className="partner-phone-text text-[15px] font-extrabold tabular-nums tracking-tight">
          {display}
        </span>
      </span>
    </a>
  );
}
