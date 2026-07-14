import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { PartnerLayout } from '../../../layouts/PartnerLayout';
import { SummaryCard } from '../../../components/partner/PartnerShared';
import { CpsPartnerMerchantList } from '../../../components/cps/CpsPartnerMerchantList';
import { CpsDeeplinkGuide, CpsPartnerNotice, PartnerCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import {
  PartnerLpMerchant,
  PartnerLpStats,
  buildPartnerLpDeeplink,
  buildPartnerLpShortlink,
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
  const [deepShortUrl, setDeepShortUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [shortBusy, setShortBusy] = useState(false);
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
        <label className="flex items-center gap-2 text-sm" title="특정 상품 URL로 홍보 링크를 만들 수 있는 광고주만 보기">
          <input type="checkbox" checked={deeplinkOnly} onChange={(e) => setDeeplinkOnly(e.target.checked)} />
          딥링크 지원만
        </label>
      </div>
      <div className="mb-4 px-1">
        <CpsDeeplinkGuide compact />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white border rounded-2xl">홍보 가능한 CPS 광고주가 없습니다.</div>
      ) : (
        <CpsPartnerMerchantList
          items={items}
          copiedId={copiedId}
          onCopy={copyText}
          onDeeplink={(m) => {
            setDeeplinkTarget(m);
            setProductUrl('');
            setDeeplinkError('');
            setDeeplinkResult('');
          }}
        />
      )}

      {deeplinkTarget ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setDeeplinkTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="font-bold text-lg text-slate-900">상품 딥링크 만들기</h3>
              <p className="text-sm text-slate-500 mt-1">{deeplinkTarget.merchantName}</p>
            </div>

            <CpsDeeplinkGuide />

            <label className="block text-sm">
              <span className="font-medium text-slate-700">상품 페이지 URL</span>
              <span className="block text-xs text-slate-400 mt-0.5">쇼핑몰에서 홍보할 상품을 연 뒤, 브라우저 주소창 URL을 붙여넣으세요.</span>
              <input
                value={productUrl}
                onChange={(e) => {
                  setProductUrl(e.target.value);
                  setDeepShortUrl('');
                }}
                placeholder="https://..."
                className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono"
              />
            </label>

            {deeplinkError ? (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                {deeplinkError}
                <p className="text-xs text-rose-600/80 mt-1">해당 쇼핑몰 상품 주소인지, https로 시작하는지 확인해 주세요.</p>
              </div>
            ) : null}

            {deeplinkResult ? (
              <div className="text-xs break-all bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-2">
                <div className="font-bold text-emerald-800">생성된 홍보 링크</div>
                <div className="text-slate-700 font-mono">{deepShortUrl || deeplinkResult}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={shortBusy}
                    className="px-3 py-1.5 rounded-lg border border-cyan-200 bg-white text-cyan-800 text-xs font-bold disabled:opacity-50"
                    onClick={async () => {
                      setShortBusy(true);
                      try {
                        const res = await buildPartnerLpShortlink({
                          merchantCode: deeplinkTarget.merchantCode,
                          productUrl,
                        });
                        setDeepShortUrl(res.shortUrl);
                        notify('숏링크로 변환되었습니다.');
                      } catch (e) {
                        notify(e instanceof Error ? e.message : '숏링크 변환에 실패했습니다.');
                      } finally {
                        setShortBusy(false);
                      }
                    }}
                  >
                    {shortBusy ? '변환 중…' : '숏링크 변환'}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                    onClick={() => copyText(deepShortUrl || deeplinkResult)}
                  >
                    복사
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                className="px-4 py-2 border rounded-xl text-sm"
                onClick={() => {
                  setDeeplinkTarget(null);
                  setDeepShortUrl('');
                }}
              >
                닫기
              </button>
              <button
                type="button"
                disabled={busy || !productUrl.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                onClick={async () => {
                  setBusy(true);
                  setDeeplinkError('');
                  setDeepShortUrl('');
                  try {
                    const res = await buildPartnerLpDeeplink({ merchantCode: deeplinkTarget.merchantCode, productUrl });
                    setDeeplinkResult(res.promoUrl);
                  } catch (e) {
                    setDeeplinkError(e instanceof Error ? e.message : '딥링크 생성에 실패했습니다.');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? '생성 중…' : '딥링크 생성'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PartnerLayout>
  );
}
