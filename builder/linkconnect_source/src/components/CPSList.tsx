import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ShoppingBag, TrendingUp } from 'lucide-react';
import { fetchPublicCampaigns, PublicCampaign } from '../lib/api';
import { cn } from '../lib/utils';

export function CPSList() {
  const [items, setItems] = useState<PublicCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCampaigns({ type: 'cps' })
      .then((data) => {
        if (!cancelled) {
          setItems(data.items.slice(0, 8));
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayItems = useMemo(() => items, [items]);

  return (
    <section id="cps" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            구매가 발생하면 수익이 쌓이는 <span className="text-cyan-400">CPS 상품</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            쇼핑몰, 건강식품, 뷰티, 교육상품 등 구매 또는 결제가 발생하면 판매금액 기준으로 수익이 지급됩니다.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">CPS 상품을 불러오는 중…</div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-800/40 border border-slate-700 rounded-2xl mb-12">
            현재 홍보 가능한 CPS 상품을 준비 중입니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:bg-slate-800 transition-all group flex flex-col shadow-md"
              >
                {item.thumbnailUrl ? (
                  <div className="aspect-square overflow-hidden relative bg-slate-900/50 flex items-center justify-center">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-contain p-6"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-slate-200 border border-slate-700 shadow-sm">
                        {item.category}
                      </span>
                      {item.badge ? (
                        <span
                          className={cn(
                            'text-xs font-bold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm border',
                            item.badge === '추천'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800/80 text-white border-slate-600',
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2 min-h-[40px]">{item.description}</p>

                  <div className="space-y-3 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 mt-auto">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" />
                        수익 조건
                      </span>
                      <span className="text-slate-200 font-medium">구매/결제</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        수익률
                      </span>
                      <span className="text-cyan-400 font-bold text-base">{item.approvalRate || item.priceFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        쿠키 기간
                      </span>
                      <span className="text-slate-300 font-medium">{item.avgTime || '-'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/cps"
                      className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors border border-slate-600 text-center"
                    >
                      상세보기
                    </Link>
                    <Link
                      to="/partner/search"
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold rounded-lg transition-colors shadow-md shadow-cyan-500/20 text-center"
                    >
                      홍보하기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            to="/cps"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium bg-slate-800 shadow-sm"
          >
            CPS 전체 상품 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
