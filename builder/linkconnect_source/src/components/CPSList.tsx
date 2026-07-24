import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { fetchPublicCampaigns, PublicCampaign } from '../lib/api';
import { CpsPublicList } from './cps/CpsPublicList';
import { HomeSectionAnchor } from './HomeSectionAnchor';

const HOME_PREVIEW_LIMIT = 6;

export function CPSList() {
  const [items, setItems] = useState<PublicCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCampaigns({ type: 'cps' })
      .then((data) => {
        if (!cancelled) {
          setItems(data.items.slice(0, HOME_PREVIEW_LIMIT));
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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <HomeSectionAnchor id="cps" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-sm font-bold mb-4">
            <ShoppingBag size={16} /> CPS (Cost Per Sale)
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            구매가 발생하면 수익이 쌓이는 <span className="text-cyan-600">CPS 쇼핑</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            쇼핑몰·뷰티·건강식품 등 구매 또는 결제가 발생하면 판매금액 기준으로 수익이 지급됩니다.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl mb-10">
            CPS 상품을 불러오는 중…
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl mb-10">
            현재 홍보 가능한 CPS 상품을 준비 중입니다.
          </div>
        ) : (
          <div className="mb-10">
            <CpsPublicList items={items} compact />
          </div>
        )}

        <div className="text-center">
          <Link
            to="/cps"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-200 text-cyan-700 hover:bg-cyan-50 transition-colors font-bold bg-white shadow-sm"
          >
            CPS 더보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
