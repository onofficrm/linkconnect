import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

type CpsChannelGuideProps = {
  allowedChannels?: string;
  forbiddenChannels?: string;
  merchantName?: string;
  compact?: boolean;
};

export function CpsChannelGuide({
  allowedChannels,
  forbiddenChannels,
  merchantName,
  compact = false,
}: CpsChannelGuideProps) {
  const [open, setOpen] = useState(false);
  const allowed = (allowedChannels || '').trim();
  const forbidden = (forbiddenChannels || '').trim();
  const hasForbidden = forbidden.length > 0 && forbidden !== '-';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className={`space-y-1.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        <div className="flex items-start gap-1.5 text-slate-600">
          <CheckCircle2 size={compact ? 12 : 13} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed line-clamp-2">
            <span className="font-semibold text-slate-500">허용 </span>
            {allowed || '—'}
          </p>
        </div>
        {hasForbidden ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold hover:bg-rose-100 hover:border-rose-200 transition-colors"
          >
            <AlertTriangle size={12} className="shrink-0" />
            금지 채널 안내
          </button>
        ) : (
          <p className="text-slate-400 pl-0.5">금지 채널 없음</p>
        )}
      </div>

      {open && hasForbidden ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cps-forbidden-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            aria-label="닫기"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-rose-50/60">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-rose-600 mb-0.5">금지 채널 안내</p>
                <h3 id="cps-forbidden-title" className="font-bold text-slate-900 text-base">
                  {merchantName || '광고주'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{forbidden}</p>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
