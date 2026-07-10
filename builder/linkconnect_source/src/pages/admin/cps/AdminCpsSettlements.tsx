import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import { LpLedger, fetchAdminLpLedger } from '../../../lib/api';

export function AdminCpsSettlements() {
  const [items, setItems] = useState<LpLedger[]>([]);
  const [total, setTotal] = useState(0);
  const [entryType, setEntryType] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    fetchAdminLpLedger({ entryType: entryType || undefined, limit: 100 })
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'));
  }, [entryType]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout activeMenu="cps" title="CPS 정산 내역" description="확정 CREDIT / 취소 REVERSAL / 금액변경 DEBIT">
      <AdminCpsSubnav active="settlements" />
      {error ? <div className="mb-4 text-sm text-rose-700 bg-rose-50 rounded-xl px-4 py-2">{error}</div> : null}
      <div className="flex gap-2 mb-4">
        <select value={entryType} onChange={(e) => setEntryType(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
          <option value="">전체</option>
          <option value="CREDIT">CREDIT</option>
          <option value="DEBIT">DEBIT</option>
          <option value="REVERSAL">REVERSAL</option>
        </select>
        <button type="button" onClick={load} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">조회</button>
        <span className="text-xs text-slate-500 self-center">{total}건</span>
      </div>
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">시각</th>
              <th className="text-left px-3 py-3">파트너</th>
              <th className="text-left px-3 py-3">실적</th>
              <th className="text-left px-3 py-3">유형</th>
              <th className="text-right px-3 py-3">금액</th>
              <th className="text-right px-3 py-3">잔액</th>
              <th className="text-left px-3 py-3">메모</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">정산 전표가 없습니다.</td></tr>
            ) : items.map((l) => (
              <tr key={l.lplId} className="border-t">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{l.createdAt || '—'}</td>
                <td className="px-3 py-2">{l.partnerName || l.partnerCode || l.ptId}</td>
                <td className="px-3 py-2">#{l.lpoId}</td>
                <td className="px-3 py-2 font-bold">{l.entryType}</td>
                <td className={`px-3 py-2 text-right ${l.entryType === 'CREDIT' ? 'text-emerald-700' : 'text-rose-600'}`}>{formatWon(l.amount)}</td>
                <td className="px-3 py-2 text-right">{formatWon(l.balanceAfter)}</td>
                <td className="px-3 py-2 text-xs truncate max-w-[200px]">{l.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
