import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import { LpClick, fetchAdminLpClicks } from '../../../lib/api';
import { SummaryCard } from '../../../components/admin/AdminShared';

export function AdminCpsClicks() {
  const [items, setItems] = useState<LpClick[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ today: 0, month: 0, total: 0 });
  const [merchant, setMerchant] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    fetchAdminLpClicks({ merchant: merchant || undefined, limit: 100 })
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
        setSummary(d.summary);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'));
  }, [merchant]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout activeMenu="cps" title="CPS 클릭 통계" description="링크프라이스 홍보 클릭">
      <AdminCpsSubnav active="clicks" />
      {error ? <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">{error}</div> : null}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard title="오늘 클릭" value={formatWon(summary.today)} color="cyan" highlight />
        <SummaryCard title="이번 달 클릭" value={formatWon(summary.month)} color="blue" highlight />
        <SummaryCard title="전체 클릭" value={formatWon(summary.total)} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex gap-3">
        <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="광고주 필터" className="border border-slate-200 rounded-xl px-3 py-2 text-sm flex-1" />
        <button type="button" onClick={load} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">조회</button>
        <span className="text-xs text-slate-500 self-center">{total}건</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">시각</th>
              <th className="text-left px-3 py-3">파트너</th>
              <th className="text-left px-3 py-3">광고주</th>
              <th className="text-left px-3 py-3">기기</th>
              <th className="text-left px-3 py-3">IP</th>
              <th className="text-left px-3 py-3">u_id</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">클릭 데이터가 없습니다.</td></tr>
            ) : items.map((c) => (
              <tr key={c.lpcId} className="border-t border-slate-100">
                <td className="px-4 py-3 whitespace-nowrap">{c.clickedAt || '—'}</td>
                <td className="px-3 py-3">{c.partnerName || c.partnerCode || c.ptId}</td>
                <td className="px-3 py-3">{c.merchantName || c.merchantCode}</td>
                <td className="px-3 py-3">{c.device || '—'}</td>
                <td className="px-3 py-3 font-mono text-xs">{c.ip || '—'}</td>
                <td className="px-3 py-3 font-mono text-xs truncate max-w-[140px]">{c.uId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
