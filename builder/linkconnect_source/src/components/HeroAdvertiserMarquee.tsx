import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { fetchPublicCampaigns, type PublicCampaign } from '../lib/api';
import { cpaCardImageUrl } from '../lib/optimizedImage';

const SLIDE_LIMIT = 12;
const AUTO_MS = 4500;

function sortCampaigns(items: PublicCampaign[]) {
  return [...items].sort((a, b) => {
    const thumb = Number(Boolean(b.thumbnailUrl)) - Number(Boolean(a.thumbnailUrl));
    if (thumb !== 0) return thumb;
    const rec = Number(b.recommended) - Number(a.recommended);
    if (rec !== 0) return rec;
    return (b.price || 0) - (a.price || 0);
  });
}

export function HeroAdvertiserMarquee() {
  const [items, setItems] = useState<PublicCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCampaigns({ type: 'cpa' })
      .then((data) => {
        if (cancelled) return;
        const sorted = sortCampaigns(data.items || []);
        setTotal(sorted.length);
        setItems(sorted.slice(0, SLIDE_LIMIT));
        setIndex(0);
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

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((prev) => {
        if (items.length === 0) return 0;
        return (prev + dir + items.length) % items.length;
      });
    },
    [items.length],
  );

  useEffect(() => {
    if (paused || loading || items.length < 2) return;
    const timer = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [paused, loading, items.length, go]);

  const current = items[index];

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
          <span className="text-[11px] text-slate-500">호버 시 단가 · 자동 넘김</span>
        </div>

        <div
          className="relative aspect-[4/3] sm:aspect-[5/4] bg-slate-900"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              입점 상품을 불러오는 중…
            </div>
          ) : !current ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-500 px-6">
              <p>현재 공개 중인 CPA 상품이 없습니다.</p>
              <Link to="/cpa-list" className="text-emerald-400 hover:text-emerald-300 font-medium">
                CPA 목록 보기
              </Link>
            </div>
          ) : (
            <Link
              to={`/cpa/${encodeURIComponent(current.code || String(current.id))}`}
              className="group absolute inset-0 block overflow-hidden"
              aria-label={`${current.title} 상세 보기`}
            >
              {current.thumbnailUrl ? (
                <img
                  key={current.id}
                  src={cpaCardImageUrl(current.thumbnailUrl)}
                  alt={current.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600/40 via-slate-900 to-cyan-700/30">
                  <span className="text-6xl font-bold text-white/25">
                    {(current.title || 'C').trim().charAt(0)}
                  </span>
                </div>
              )}

              {/* 기본: 하단 약한 그라데이션 + 상품명만 */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent px-5 pb-5 pt-16 transition-opacity duration-300 group-hover:opacity-0">
                <p className="text-lg font-bold text-white drop-shadow line-clamp-1">{current.title}</p>
              </div>

              {/* 호버: 단가·특징 오버레이 */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-slate-950/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100 px-5 py-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
                    {current.category || 'CPA'}
                  </span>
                  {current.badge ? (
                    <span className="rounded-md bg-emerald-500/25 px-2.5 py-1 text-xs font-bold text-emerald-200">
                      {current.badge}
                    </span>
                  ) : null}
                  {current.recommended ? (
                    <span className="rounded-md bg-cyan-500/25 px-2.5 py-1 text-xs font-bold text-cyan-200">
                      추천
                    </span>
                  ) : null}
                </div>
                <p className="text-xl font-bold text-white leading-snug line-clamp-2">{current.title}</p>
                <p className="mt-3 text-sm text-slate-200">
                  승인시{' '}
                  <span className="text-2xl font-bold text-emerald-400">
                    {(current.price || 0).toLocaleString()}
                  </span>
                  <span className="text-emerald-400 font-semibold">원</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                  {current.approvalRate ? <span>승인율 {current.approvalRate}</span> : null}
                  {current.avgTime ? <span>평균 {current.avgTime}</span> : null}
                  <span>클릭하여 상세 보기</span>
                </div>
              </div>
            </Link>
          )}

          {items.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-950/55 p-2 text-white hover:bg-slate-950/80 border border-white/10 transition-colors"
                aria-label="이전 상품"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-950/55 p-2 text-white hover:bg-slate-950/80 border border-white/10 transition-colors"
                aria-label="다음 상품"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/35 hover:bg-white/55'
                    }`}
                    aria-label={`${i + 1}번째 상품`}
                  />
                ))}
              </div>
            </>
          ) : null}
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
    </div>
  );
}
