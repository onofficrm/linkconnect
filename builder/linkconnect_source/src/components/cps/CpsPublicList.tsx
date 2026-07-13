import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { PublicCampaign } from '../../lib/api';
import { openLandingPage } from '../../lib/utils';

type CpsPublicListProps = {
  items: PublicCampaign[];
  compact?: boolean;
};

export function CpsPublicList({ items, compact = false }: CpsPublicListProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="hidden md:grid md:grid-cols-[88px_minmax(0,1.6fr)_100px_88px_minmax(0,1.4fr)_148px] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
        <span>로고</span>
        <span>광고주</span>
        <span className="text-center">수수료율</span>
        <span className="text-center">쿠키</span>
        <span>채널 안내</span>
        <span className="text-right">홍보</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <CpsPublicListRow key={item.id} item={item} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function CpsPublicListRow({ item, compact }: { item: PublicCampaign; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const commission = item.approvalRate || item.priceFormatted || '-';
  const cookie = item.avgTime || '-';
  const hasLandingUrl = (item.landingUrl || '').trim().length > 0;
  const hasThumbnail = (item.thumbnailUrl || '').trim().length > 0;
  const merchantCode = (item.merchantCode || item.code || '').trim();
  const hasLongChannels =
    (item.forbiddenChannels || '').length > 48 || (item.allowedChannels || '').length > 32;

  return (
    <article
      className={`group transition-colors hover:bg-slate-50/80 ${
        item.recommended || item.badge ? 'bg-cyan-50/30' : ''
      }`}
    >
      <div className="flex flex-col md:grid md:grid-cols-[88px_minmax(0,1.6fr)_100px_88px_minmax(0,1.4fr)_148px] gap-3 md:gap-3 md:items-center px-4 py-3.5">
        <div className="flex items-center gap-3 md:block">
          <div className="w-[72px] h-[48px] shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
            {hasThumbnail ? (
              <img
                src={item.thumbnailUrl}
                alt=""
                className="w-full h-full object-contain p-1.5"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">LOGO</span>
            )}
          </div>

          <div className="flex-1 min-w-0 md:hidden">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded border border-slate-200">
                {item.category}
              </span>
              {item.badge ? (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-cyan-100 text-cyan-800">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
            {merchantCode ? (
              <p className="text-xs text-slate-400 truncate">({merchantCode})</p>
            ) : null}
          </div>

          <div className="md:hidden ml-auto text-right shrink-0">
            <div className="text-sm font-bold text-cyan-600">{commission}</div>
            <div className="text-xs text-slate-500">{cookie}</div>
          </div>
        </div>

        <div className="hidden md:block min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded border border-slate-200">
              {item.category}
            </span>
            <span className="text-[11px] text-slate-400">CPS · 구매/결제</span>
            {item.badge ? (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-cyan-100 text-cyan-800">
                {item.badge}
              </span>
            ) : null}
          </div>
          <h3 className="font-bold text-slate-900 truncate">
            {item.title}
            {merchantCode ? <span className="font-normal text-slate-400 ml-1">({merchantCode})</span> : null}
          </h3>
          {!compact && item.description ? (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
          ) : null}
        </div>

        <div className="hidden md:block text-center">
          <div className="text-sm font-bold text-cyan-600">{commission}</div>
        </div>

        <div className="hidden md:block text-center">
          <div className="text-sm font-medium text-slate-700">{cookie}</div>
        </div>

        <div className="hidden md:block min-w-0 text-xs leading-relaxed">
          <div className="text-slate-600">
            <span className="text-slate-400 font-medium">허용 </span>
            {item.allowedChannels || '-'}
          </div>
          <div className={`text-red-500 mt-0.5 ${expanded ? '' : 'line-clamp-2'}`}>
            <span className="text-red-400 font-medium">금지 </span>
            {item.forbiddenChannels || '-'}
          </div>
          {hasLongChannels ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-[11px] font-bold text-slate-500 hover:text-cyan-600 inline-flex items-center gap-0.5"
            >
              {expanded ? '접기' : '더보기'}
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          ) : null}
        </div>

        <div className="flex md:flex-col lg:flex-row gap-2 md:justify-end shrink-0">
          {hasLandingUrl ? (
            <button
              type="button"
              onClick={() => openLandingPage(item.landingUrl)}
              className="hidden lg:inline-flex items-center justify-center gap-1 px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white"
              title="랜딩페이지"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <Link
            to="/partner/search"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            홍보하기
          </Link>
        </div>
      </div>

      <div className="md:hidden px-4 pb-3 -mt-1">
        <div className="text-xs leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <div className="text-slate-600">
            <span className="text-slate-400 font-medium">허용 </span>
            {item.allowedChannels || '-'}
          </div>
          <div className={`text-red-500 mt-1 ${expanded ? '' : 'line-clamp-3'}`}>
            <span className="text-red-400 font-medium">금지 </span>
            {item.forbiddenChannels || '-'}
          </div>
          {hasLongChannels ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-[11px] font-bold text-slate-500 hover:text-cyan-600 inline-flex items-center gap-0.5"
            >
              {expanded ? '접기' : '채널 안내 더보기'}
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
