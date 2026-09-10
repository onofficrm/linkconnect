import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fetchPublicCampaigns, type PublicCampaign } from '../lib/api';
import { cpaCardImageUrl } from '../lib/optimizedImage';

const SLIDE_LIMIT = 12;
const VISIBLE_HEIGHT = 360;

function sortCampaigns(items: PublicCampaign[]) {
  return [...items].sort((a, b) => {
    const thumb = Number(Boolean(b.thumbnailUrl)) - Number(Boolean(a.thumbnailUrl));
    if (thumb !== 0) return thumb;
    const rec = Number(b.recommended) - Number(a.recommended);
    if (rec !== 0) return rec;
    return (b.price || 0) - (a.price || 0);
  });
}

function CampaignSlideCard({ item }: { item: PublicCampaign }) {
  const initial = (item.title || item.category || 'C').trim().charAt(0) || 'C';

  return (
    <Link
      to={`/cpa/${encodeURIComponent(item.code || String(item.id))}`}
      className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.08] hover:border-emerald-400/30 transition-colors"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/20">
        {item.thumbnailUrl ? (
          <img
            src={cpaCardImageUrl(item.thumbnailUrl)}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-emerald-200/90">
            {initial}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="mb-1 flex items-center gap-2">
          <span className="truncate rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {item.category || 'CPA'}
          </span>
          {item.badge ? (
            <span className="truncate rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
              {item.badge}
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm font-bold text-white">{item.title}</p>
        <p className="mt-1 text-xs text-slate-400">
          승인시{' '}
          <span className="font-semibold text-emerald-400">
            {(item.price || 0).toLocaleString()}원
          </span>
          {item.approvalRate ? (
            <span className="text-slate-500"> · 승인율 {item.approvalRate}</span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}

export function HeroAdvertiserMarquee() {
  const [items, setItems] = useState<PublicCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCampaigns({ type: 'cpa' })
      .then((data) => {
        if (cancelled) return;
        const sorted = sortCampaigns(data.items || []);
        setTotal(sorted.length);
        setItems(sorted.slice(0, SLIDE_LIMIT));
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    let base = [...items];
    while (base.length < 4) {
      base = [...base, ...items];
    }
    // 끊김 없는 루프용 복제본 (translateY -50%)
    return [...base, ...base];
  }, [items]);

  const durationSec = Math.max(18, loopItems.length * 2.4);

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-2xl rounded-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            입점 CPA
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
              {loading ? '…' : `${total}개`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">등록 상품 자동 반영</span>
        </div>

        <div
          className="relative overflow-hidden px-3 py-3"
          style={{ height: VISIBLE_HEIGHT }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              입점 상품을 불러오는 중…
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
              <p>현재 공개 중인 CPA 상품이 없습니다.</p>
              <Link to="/cpa-list" className="text-emerald-400 hover:text-emerald-300 font-medium">
                CPA 목록 보기
              </Link>
            </div>
          ) : (
            <>
              <div
                className="flex flex-col gap-3 will-change-transform"
                style={{
                  animation: `hero-cpa-marquee ${durationSec}s linear infinite`,
                  animationPlayState: paused ? 'paused' : 'running',
                }}
              >
                {loopItems.map((item, idx) => (
                  <CampaignSlideCard key={`${item.id}-${idx}`} item={item} />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-950/90 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/90 to-transparent" />
            </>
          )}
        </div>

        <div className="border-t border-white/10 px-4 py-3">
          <Link
            to="/cpa-list"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
          >
            인기 상품 더보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes hero-cpa-marquee {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}
