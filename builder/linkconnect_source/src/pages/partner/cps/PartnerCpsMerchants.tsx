import { useCallback, useEffect, useState } from 'react';
import { Copy, CheckCircle2, Link2, Search } from 'lucide-react';
import { PartnerLayout } from '../../../layouts/PartnerLayout';
import { SummaryCard } from '../../../components/partner/PartnerShared';
import { CpsPartnerNotice, PartnerCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import {
  PartnerLpMerchant,
  PartnerLpStats,
  buildPartnerLpDeeplink,
  fetchPartnerLpMerchants,
} from '../../../lib/api';

const emptyStats: PartnerLpStats = {
  clicksToday: 0,
  clicksMonth: 0,
  expectedOrders: 0,
  confirmedOrders: 0,
  canceledOrders: 0,
  expectedEarnings: 0,
  confirmedEarnings: 0,
  withdrawable: 0,
};

export function PartnerCpsMerchants() {
  const [items, setItems] = useState<PartnerLpMerchant[]>([]);
  const [stats, setStats] = useState<PartnerLpStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deeplinkOnly, setDeeplinkOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deeplinkTarget, setDeeplinkTarget] = useState<PartnerLpMerchant | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [deeplinkError, setDeeplinkError] = useState('');
  const [deeplinkResult, setDeeplinkResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchPartnerLpMerchants({ q: q || undefined, deeplink: deeplinkOnly || undefined })
      .then((d) => {
        setItems(d.items);
        if (d.stats) setStats(d.stats);
      })
      .catch((e) => {
        setItems([]);
        setError(e instanceof Error ? e.message : 'API 오류');
      })
      .finally(() => setLoading(false));
  }, [q, deeplinkOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const copyText = async (text: string, id?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id != null) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      notify('링크가 복사되었습니다.');
    } catch {
      notify('복사에 실패했습니다.');
    }
  };

  return (
    <PartnerLayout activeMenu="cps" title="CPS 광고주">
      <PartnerCpsSubnav active="merchants" />
      <CpsPartnerNotice />
      {message ? <div className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">{message}</div> : null}
      {error ? <div className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">{error}</div> : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        <SummaryCard title="오늘 클릭" value={formatWon(stats.clicksToday)} color="emerald" highlight />
        <SummaryCard title="이번 달 클릭" value={formatWon(stats.clicksMonth)} />
        <SummaryCard title="예상수익" value={formatWon(stats.expectedEarnings)} suffix="원" color="yellow" highlight subtitle="확정 전 · 출금 불가" />
        <SummaryCard title="확정·출금가능" value={formatWon(stats.withdrawable)} suffix="원" color="emerald" highlight subtitle={`확정 ${stats.confirmedOrders}건 · 취소 ${stats.canceledOrders}건`} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="광고주 검색" className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={deeplinkOnly} onChange={(e) => setDeeplinkOnly(e.target.checked)} />
          딥링크만
        </label>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white border rounded-2xl">홍보 가능한 CPS 광고주가 없습니다.</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((m) => (
            <article key={m.lpmId} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                {m.merchantLogo ? <img src={m.merchantLogo} alt="" className="w-12 h-12 rounded-xl object-contain border" /> : <div className="w-12 h-12 rounded-xl bg-slate-100" />}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate">{m.merchantName}</div>
                  <div className="text-xs text-slate-500">{m.categoryName || m.merchantCode}</div>
                  <div className="text-sm text-emerald-700 font-bold mt-1">{m.commissionMobile || m.commissionPc || '—'}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">클릭 {m.clicks} · 예상 {m.expectedOrders} · 확정 {m.confirmedOrders}</div>
              {m.denyAd ? <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 line-clamp-2">제한: {m.denyAd}</div> : null}
              <div className="flex gap-2 mt-auto">
                <button type="button" onClick={() => copyText(m.promoUrl, m.lpmId)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">
                  {copiedId === m.lpmId ? <CheckCircle2 size={16} /> : <Copy size={16} />} 링크 복사
                </button>
                {m.deeplinkYn === 'Y' ? (
                  <button type="button" onClick={() => { setDeeplinkTarget(m); setProductUrl(''); setDeeplinkError(''); setDeeplinkResult(''); }} className="px-3 py-2 rounded-xl border text-sm font-bold">
                    <Link2 size={16} />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {deeplinkTarget ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setDeeplinkTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">딥링크 — {deeplinkTarget.merchantName}</h3>
            <input value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="상품 URL" className="w-full border rounded-xl px-3 py-2 text-sm" />
            {deeplinkError ? <p className="text-sm text-rose-600">{deeplinkError}</p> : null}
            {deeplinkResult ? (
              <div className="text-xs break-all bg-slate-50 rounded-xl p-3">
                {deeplinkResult}
                <button type="button" className="block mt-2 text-emerald-700 font-bold" onClick={() => copyText(deeplinkResult)}>복사</button>
              </div>
            ) : null}
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 border rounded-xl text-sm" onClick={() => setDeeplinkTarget(null)}>닫기</button>
              <button
                type="button"
                disabled={busy}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold"
                onClick={async () => {
                  setBusy(true);
                  setDeeplinkError('');
                  try {
                    const res = await buildPartnerLpDeeplink({ merchantCode: deeplinkTarget.merchantCode, productUrl });
                    setDeeplinkResult(res.promoUrl);
                  } catch (e) {
                    setDeeplinkError(e instanceof Error ? e.message : '실패');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                생성
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PartnerLayout>
  );
}
