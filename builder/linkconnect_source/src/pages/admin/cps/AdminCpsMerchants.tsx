import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav, formatWon, truncate } from '../../../components/cps/CpsShared';
import { LpMerchant, fetchAdminLpMerchants, syncAdminLpMerchants, updateAdminLpMerchant } from '../../../lib/api';

export function AdminCpsMerchants() {
  const [items, setItems] = useState<LpMerchant[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [detail, setDetail] = useState<LpMerchant | null>(null);
  const [rate, setRate] = useState('');

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3500);
  };

  const load = useCallback(() => {
    fetchAdminLpMerchants({ q: q || undefined, limit: 200 })
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch(() => setItems([]));
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const sync = async () => {
    setBusy(true);
    try {
      const res = await syncAdminLpMerchants({ scope: 'apr', detail: true });
      notify(res.message);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '동기화 실패');
    } finally {
      setBusy(false);
    }
  };

  const saveRate = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      await updateAdminLpMerchant({ lpmId: detail.lpmId, partnerRate: Number(rate) });
      notify('지급률이 저장되었습니다.');
      setDetail(null);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout activeMenu="cps" title="CPS 광고주 관리" description="링크프라이스 CPS 광고주">
      <AdminCpsSubnav active="merchants" />
      {msg ? <div className="mb-4 text-sm text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2">{msg}</div> : null}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="광고주명·코드 검색" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm" />
        </div>
        <button type="button" disabled={busy} onClick={sync} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">
          <RefreshCw size={16} /> 동기화
        </button>
        <span className="text-xs text-slate-500">{total}건</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">광고주</th>
                <th className="text-left px-3 py-3">코드</th>
                <th className="text-left px-3 py-3">카테고리</th>
                <th className="text-left px-3 py-3">제휴</th>
                <th className="text-left px-3 py-3">딥링크</th>
                <th className="text-right px-3 py-3">LP커미션</th>
                <th className="text-right px-3 py-3">지급률</th>
                <th className="text-left px-3 py-3">노출커미션</th>
                <th className="text-center px-3 py-3">노출</th>
                <th className="text-right px-3 py-3">클릭</th>
                <th className="text-right px-3 py-3">예상</th>
                <th className="text-right px-3 py-3">확정</th>
                <th className="text-right px-3 py-3">취소</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={14} className="text-center py-12 text-slate-400">광고주가 없습니다.</td></tr>
              ) : items.map((m) => (
                <tr key={m.lpmId} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {m.merchantLogo ? <img src={m.merchantLogo} alt="" className="w-8 h-8 rounded-lg object-contain bg-white border" /> : <div className="w-8 h-8 rounded-lg bg-slate-100" />}
                      <span className="font-medium truncate max-w-[160px]">{m.campaignAlias || m.merchantName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">{m.merchantCode}</td>
                  <td className="px-3 py-3 text-slate-600">{m.categoryName || '—'}</td>
                  <td className="px-3 py-3">{m.subscript || '—'}</td>
                  <td className="px-3 py-3">{m.deeplinkYn === 'Y' ? 'Y' : 'N'}</td>
                  <td className="px-3 py-3 text-right text-xs">{truncate(m.commissionMobile || m.commissionPc || '—', 16)}</td>
                  <td className="px-3 py-3 text-right font-bold">{m.partnerRate}%</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{truncate(m.partnerDisplayCommission || '', 18)}</td>
                  <td className="px-3 py-3 text-center">{m.visible ? 'Y' : 'N'}</td>
                  <td className="px-3 py-3 text-right">{m.clicks ?? 0}</td>
                  <td className="px-3 py-3 text-right">{m.expectedOrders ?? 0}</td>
                  <td className="px-3 py-3 text-right text-emerald-700">{m.confirmedOrders ?? 0}</td>
                  <td className="px-3 py-3 text-right text-rose-600">{m.canceledOrders ?? 0}</td>
                  <td className="px-3 py-3">
                    <button type="button" className="text-xs font-bold text-cyan-700" onClick={() => { setDetail(m); setRate(String(m.partnerRate)); }}>상세</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* mobile cards */}
      <div className="md:hidden mt-4 space-y-3">
        {items.map((m) => (
          <article key={`m-${m.lpmId}`} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="font-bold truncate">{m.merchantName}</div>
            <div className="text-xs text-slate-500 mt-1">{m.merchantCode} · 지급률 {m.partnerRate}%</div>
            <div className="text-xs mt-2 text-slate-600">클릭 {m.clicks ?? 0} · 예상 {m.expectedOrders ?? 0} · 확정 {m.confirmedOrders ?? 0}</div>
          </article>
        ))}
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{detail.merchantName}</h3>
            <p className="text-sm text-slate-500">{detail.merchantCode} · LP {detail.commissionMobile || detail.commissionPc || '—'}</p>
            <label className="block text-sm">파트너 지급률 (%)
              <input value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
            </label>
            <p className="text-xs text-slate-500">노출 커미션: {detail.partnerDisplayCommission || '—'} · 클릭 {formatWon(detail.clicks ?? 0)}</p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 rounded-xl border text-sm" onClick={() => setDetail(null)}>닫기</button>
              <button type="button" disabled={busy} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold" onClick={saveRate}>저장</button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
