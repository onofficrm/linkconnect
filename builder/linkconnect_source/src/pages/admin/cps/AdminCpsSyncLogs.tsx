import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav } from '../../../components/cps/CpsShared';
import { LpSyncLog, fetchAdminLpSyncLogs, syncAdminLpMerchants, syncAdminLpOrders } from '../../../lib/api';

export function AdminCpsSyncLogs() {
  const [items, setItems] = useState<LpSyncLog[]>([]);
  const [type, setType] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchAdminLpSyncLogs(50, type)
      .then((d) => setItems(d.items))
      .catch(() => setItems([]));
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout activeMenu="cps" title="API 동기화 로그" description="광고주·실적 동기화 이력">
      <AdminCpsSubnav active="sync" />
      {msg ? <div className="mb-4 text-sm text-cyan-700 bg-cyan-50 rounded-xl px-4 py-2">{msg}</div> : null}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
          <option value="">전체</option>
          <option value="merchants">광고주</option>
          <option value="orders">실적</option>
        </select>
        <button type="button" disabled={busy} onClick={() => { setBusy(true); syncAdminLpMerchants({ scope: 'apr' }).then((r) => { setMsg(r.message); load(); }).finally(() => setBusy(false)); }} className="px-3 py-2 rounded-xl border text-sm font-bold">광고주 동기화</button>
        <button type="button" disabled={busy} onClick={() => { setBusy(true); syncAdminLpOrders({ mode: 'last7' }).then((r) => { setMsg(r.message); load(); }).finally(() => setBusy(false)); }} className="px-3 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">실적 7일 동기화</button>
      </div>
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">시작</th>
              <th className="text-left px-3 py-3">유형</th>
              <th className="text-left px-3 py-3">성공</th>
              <th className="text-right px-3 py-3">처리</th>
              <th className="text-left px-3 py-3">메시지</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">로그가 없습니다.</td></tr>
            ) : items.map((l) => (
              <tr key={l.lpsId} className="border-t">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{l.startedAt || '—'}</td>
                <td className="px-3 py-2">{l.syncType}</td>
                <td className="px-3 py-2">{l.success ? 'OK' : 'FAIL'}</td>
                <td className="px-3 py-2 text-right">{l.processedCount}</td>
                <td className="px-3 py-2 text-xs truncate max-w-[320px]">{l.errorMessage || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
