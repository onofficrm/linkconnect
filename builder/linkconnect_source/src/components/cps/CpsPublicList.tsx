import { Link } from 'react-router-dom';
import { ExternalLink, Link as LinkIcon, Sparkles } from 'lucide-react';
import { PublicCampaign } from '../../lib/api';
import { openLandingPage } from '../../lib/utils';
import { CpsChannelGuide } from './CpsChannelGuide';

type CpsPublicListProps = {
  items: PublicCampaign[];
  compact?: boolean;
};

export function CpsPublicList({ items, compact = false }: CpsPublicListProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="hidden md:grid md:grid-cols-[80px_minmax(0,1.5fr)_108px_minmax(0,1.2fr)_140px] gap-4 px-5 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <span>로고</span>
        <span>광고주</span>
        <span className="text-center">수수료율</span>
        <span>채널 안내</span>
        <span className="text-right">홍보</span>
      </div>
      <div className="divide-y divide-slate-100/80">
        {items.map((item) => (
          <CpsPublicListRow key={item.id} item={item} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function CpsPublicListRow({ item, compact }: { item: PublicCampaign; compact?: boolean }) {
  const commission = item.approvalRate || item.priceFormatted || '-';
  const hasLandingUrl = (item.landingUrl || '').trim().length > 0;
  const hasThumbnail = (item.thumbnailUrl || '').trim().length > 0;
  const merchantCode = (item.merchantCode || item.code || '').trim();
  const detailPath = merchantCode ? `/cps/${encodeURIComponent(merchantCode)}` : '/cps';
  const isFeatured = item.recommended || Boolean(item.badge);

  return (
    <article
      className={`group relative transition-all duration-200 hover:bg-slate-50/90 ${
        isFeatured ? 'bg-gradient-to-r from-cyan-50/40 via-white to-white' : ''
      }`}
    >
      {isFeatured ? (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 to-cyan-600" aria-hidden />
      ) : null}

      <div className="flex flex-col md:grid md:grid-cols-[80px_minmax(0,1.5fr)_108px_minmax(0,1.2fr)_140px] gap-3 md:gap-4 md:items-center px-4 md:px-5 py-4">
        {/* Logo + mobile header */}
        <div className="flex items-center gap-3 md:block">
          <div className="w-[68px] h-[44px] shrink-0 rounded-xl border border-slate-200/80 bg-white shadow-sm flex items-center justify-center overflow-hidden group-hover:border-slate-300 transition-colors">
            {hasThumbnail ? (
              <img
                src={item.thumbnailUrl}
                alt=""
                className="w-full h-full object-contain p-1.5"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-[9px] text-slate-300 font-bold tracking-wider">LOGO</span>
            )}
          </div>

          <div className="flex-1 min-w-0 md:hidden">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <CategoryBadge label={item.category} />
              {item.badge ? <FeaturedBadge label={item.badge} /> : null}
            </div>
            <Link to={detailPath} className="font-bold text-slate-900 truncate text-[15px] hover:text-cyan-700 block">
              {item.title}
            </Link>
            {merchantCode ? <p className="text-[11px] text-slate-400 truncate mt-0.5">{merchantCode}</p> : null}
          </div>

          <div className="md:hidden ml-auto text-right shrink-0">
            <CommissionBadge value={commission} />
          </div>
        </div>

        {/* Desktop advertiser */}
        <div className="hidden md:block min-w-0 pr-2">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <CategoryBadge label={item.category} />
            <span className="text-[10px] font-medium text-slate-400">CPS</span>
            {item.badge ? <FeaturedBadge label={item.badge} /> : null}
            {item.recommended ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                <Sparkles size={10} />
                추천
              </span>
            ) : null}
          </div>
          <h3 className="font-bold text-slate-900 truncate text-[15px] leading-tight">
            <Link to={detailPath} className="hover:text-cyan-700 transition-colors">
              {item.title}
            </Link>
            {merchantCode ? (
              <span className="font-normal text-slate-400 text-sm ml-1.5">({merchantCode})</span>
            ) : null}
          </h3>
        </div>

        {/* Commission */}
        <div className="hidden md:flex justify-center">
          <CommissionBadge value={commission} />
        </div>

        {/* Channel guide */}
        <div className="hidden md:block min-w-0">
          <CpsChannelGuide
            allowedChannels={item.allowedChannels}
            forbiddenChannels={item.forbiddenChannels}
            merchantName={item.title}
            compact={compact}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 md:justify-end shrink-0">
          {hasLandingUrl ? (
            <button
              type="button"
              onClick={() => openLandingPage(item.landingUrl)}
              className="hidden lg:inline-flex items-center justify-center w-9 h-9 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-white transition-colors"
              title="랜딩페이지"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : null}
          <Link
            to={detailPath}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 min-w-[100px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            홍보하기
          </Link>
        </div>
      </div>

      {/* Mobile channel guide */}
      <div className="md:hidden px-4 pb-4 -mt-1">
        <div className="rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-2.5">
          <CpsChannelGuide
            allowedChannels={item.allowedChannels}
            forbiddenChannels={item.forbiddenChannels}
            merchantName={item.title}
            compact
          />
        </div>
      </div>
    </article>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200 shadow-sm">
      {label}
    </span>
  );
}

function FeaturedBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-100 text-cyan-800 border border-cyan-200/60">
      {label}
    </span>
  );
}

function CommissionBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-100 text-sm font-bold text-cyan-700 tabular-nums">
      {value}
    </span>
  );
}
