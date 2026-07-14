import { Link } from 'react-router-dom';
import { CheckCircle2, Copy, Link2 } from 'lucide-react';
import { PartnerLpMerchant } from '../../lib/api';
import { formatCpsCommissionRate, formatWon } from './CpsShared';

type CpsPartnerMerchantListProps = {
  items: PartnerLpMerchant[];
  copiedId: number | null;
  onCopy: (text: string, id: number) => void;
  onDeeplink: (merchant: PartnerLpMerchant) => void;
};

export function CpsPartnerMerchantList({ items, copiedId, onCopy, onDeeplink }: CpsPartnerMerchantListProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="hidden sm:grid sm:grid-cols-[72px_minmax(0,1.5fr)_120px_minmax(0,1fr)_168px] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
        <span>로고</span>
        <span>광고주</span>
        <span>수수료</span>
        <span>내 실적</span>
        <span className="text-right">링크</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((m) => (
          <CpsPartnerMerchantRow
            key={m.lpmId}
            merchant={m}
            copied={copiedId === m.lpmId}
            onCopy={() => onCopy(m.promoUrl, m.lpmId)}
            onDeeplink={() => onDeeplink(m)}
          />
        ))}
      </div>
    </div>
  );
}

function CpsPartnerMerchantRow({
  merchant: m,
  copied,
  onCopy,
  onDeeplink,
}: {
  merchant: PartnerLpMerchant;
  copied: boolean;
  onCopy: () => void;
  onDeeplink: () => void;
}) {
  const commission = formatCpsCommissionRate(m.partnerCommission || m.commissionMobile || m.commissionPc || '—');
  const detailPath = `/cps/${encodeURIComponent(m.merchantCode)}`;

  return (
    <article className="hover:bg-slate-50/80 transition-colors">
      <div className="flex flex-col sm:grid sm:grid-cols-[72px_minmax(0,1.5fr)_120px_minmax(0,1fr)_168px] gap-3 sm:items-center px-4 py-3.5">
        <div className="flex items-center gap-3 sm:block">
          <Link to={detailPath} className="w-14 h-10 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
            {m.merchantLogo ? (
              <img src={m.merchantLogo} alt="" className="w-full h-full object-contain p-1" loading="lazy" />
            ) : (
              <span className="text-[10px] text-slate-400">LOGO</span>
            )}
          </Link>
          <div className="flex-1 min-w-0 sm:hidden">
            <Link to={detailPath} className="font-bold text-slate-900 truncate hover:text-emerald-700 block">
              {m.merchantName}
            </Link>
            <div className="text-xs text-slate-500 truncate">
              {m.categoryName || m.merchantCode}
            </div>
          </div>
          <div className="sm:hidden ml-auto text-sm font-bold text-emerald-700 shrink-0">{commission}</div>
        </div>

        <div className="hidden sm:block min-w-0">
          <div className="font-bold text-slate-900 truncate">
            <Link to={detailPath} className="hover:text-emerald-700 transition-colors">
              {m.merchantName}
            </Link>
            <span className="font-normal text-slate-400 ml-1">({m.merchantCode})</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{m.categoryName || '쇼핑몰'}</div>
          {m.denyAd ? (
            <div className="text-[11px] text-amber-700 mt-1 line-clamp-1" title={m.denyAd}>
              제한: {m.denyAd}
            </div>
          ) : null}
        </div>

        <div className="hidden sm:block">
          <div className="text-sm font-bold text-emerald-700">{commission}</div>
          {m.deeplinkYn === 'Y' ? (
            <span className="inline-flex mt-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 rounded px-1.5 py-0.5">
              딥링크
            </span>
          ) : null}
        </div>

        <div className="hidden sm:block text-xs text-slate-500">
          클릭 {formatWon(m.clicks)} · 예상 {m.expectedOrders} · 확정 {m.confirmedOrders}
        </div>

        <div className="flex gap-2 sm:justify-end">
          <Link
            to={detailPath}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
          >
            상세
          </Link>
          <button
            type="button"
            onClick={onCopy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            링크 복사
          </button>
          {m.deeplinkYn === 'Y' ? (
            <button
              type="button"
              title="상품 URL로 딥링크 만들기"
              onClick={onDeeplink}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-xs font-bold text-cyan-700 border-cyan-200 hover:bg-cyan-50"
            >
              <Link2 size={14} />
              <span className="hidden md:inline">딥링크</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="sm:hidden px-4 pb-3 -mt-1 space-y-2">
        {m.denyAd ? (
          <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 line-clamp-2">제한: {m.denyAd}</div>
        ) : null}
        <div className="text-xs text-slate-500">
          클릭 {formatWon(m.clicks)} · 예상 {m.expectedOrders} · 확정 {m.confirmedOrders}
        </div>
      </div>
    </article>
  );
}
