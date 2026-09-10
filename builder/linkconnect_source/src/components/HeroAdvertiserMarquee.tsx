import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { fetchPublicCampaigns, type PublicCampaign } from '../lib/api';
import { cpaCardImageUrl } from '../lib/optimizedImage';

const SLIDE_LIMIT = 12;
const AUTO_MS = 4800;

function sortCampaigns(items: PublicCampaign[]) {
  return [...items].sort((a, b) => {
    const thumb = Number(Boolean(b.thumbnailUrl)) - Number(Boolean(a.thumbnailUrl));
    if (thumb !== 0) return thumb;
    const rec = Number(b.recommended) - Number(a.recommended);
    if (rec !== 0) return rec;
    return (b.price || 0) - (a.price || 0);
  });
}

function SlideContent({ item }: { item: PublicCampaign }) {
  return (
    <Link
      to={`/cpa/${encodeURIComponent(item.code || String(item.id))}`}
      className="group relative block h-full w-full overflow-hidden"
      aria-label={`${item.title} 상세 보기`}
    >
      {item.thumbnailUrl ? (
        <img
          src={cpaCardImageUrl(item.thumbnailUrl)}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]"
          decoding="async"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600/40 via-slate-900 to-cyan-700/30">
          <span className="text-5xl font-bold text-white/25">
            {(item.title || 'C').trim().charAt(0)}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent px-4 pb-4 pt-14 transition-opacity duration-300 group-hover:opacity-0">
        <p className="text-base font-bold text-white drop-shadow line-clamp-1">{item.title}</p>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-slate-950/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 px-4 py-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white">
            {item.category || 'CPA'}
          </span>
          {item.badge ? (
            <span className="rounded-md bg-emerald-500/25 px-2 py-0.5 text-[11px] font-bold text-emerald-200">
              {item.badge}
            </span>
          ) : null}
          {item.recommended ? (
            <span className="rounded-md bg-cyan-500/25 px-2 py-0.5 text-[11px] font-bold text-cyan-200">
              추천
            </span>
          ) : null}
        </div>
        <p className="text-lg font-bold text-white leading-snug line-clamp-2">{item.title}</p>
        <p className="mt-2 text-sm text-slate-200">
          승인시{' '}
          <span className="text-xl font-bold text-emerald-400">
            {(item.price || 0).toLocaleString()}
          </span>
          <span className="text-emerald-400 font-semibold">원</span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-300">
          {item.approvalRate ? <span>승인율 {item.approvalRate}</span> : null}
          {item.avgTime ? <span>평균 {item.avgTime}</span> : null}
          <span>클릭하여 상세 보기</span>
        </div>
      </div>
    </Link>
  );
}

export function HeroAdvertiserMarquee() {
  const [items, setItems] = useState<PublicCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const lockRef = useRef(false);

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
      if (lockRef.current || items.length < 2) return;
      lockRef.current = true;
      setAnimating(true);
      setIndex((prev) => (prev + dir + items.length) % items.length);
      window.setTimeout(() => {
        lockRef.current = false;
        setAnimating(false);
      }, 720);
    },
    [items.length],
  );

  useEffect(() => {
    if (paused || loading || items.length < 2 || animating) return;
    const timer = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [paused, loading, items.length, animating, go]);

  return (
    <div className="relative mx-auto w-[80%] max-w-md lg:ml-auto lg:mr-0">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-2xl rounded-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            입점 CPA
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
              {loading ? '…' : `${total}개`}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">호버 시 단가 · 자동 넘김</span>
        </div>

        <div
          className="relative aspect-[4/3] overflow-hidden bg-slate-900"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              입점 상품을 불러오는 중…
            </div>
          ) : items.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-500 px-6">
              <p>현재 공개 중인 CPA 상품이 없습니다.</p>
              <Link to="/cpa-list" className="text-emerald-400 hover:text-emerald-300 font-medium">
                CPA 목록 보기
              </Link>
            </div>
          ) : (
            <div
              className="flex h-full transition-transform duration-700 ease-out will-change-transform"
              style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
            >
              {items.map((item) => (
                <div key={item.id} className="relative h-full w-full shrink-0 grow-0 basis-full">
                  <SlideContent item={item} />
                </div>
              ))}
            </div>
          )}

          {items.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-950/55 p-1.5 text-white hover:bg-slate-950/80 border border-white/10 transition-colors"
                aria-label="이전 상품"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-950/55 p-1.5 text-white hover:bg-slate-950/80 border border-white/10 transition-colors"
                aria-label="다음 상품"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (lockRef.current || i === index) return;
                      lockRef.current = true;
                      setAnimating(true);
                      setIndex(i);
                      window.setTimeout(() => {
                        lockRef.current = false;
                        setAnimating(false);
                      }, 720);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === index ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/35 hover:bg-white/55'
                    }`}
                    aria-label={`${i + 1}번째 상품`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-white/10 px-3.5 py-2.5">
          <Link
            to="/cpa-list"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
          >
            인기 상품 더보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
