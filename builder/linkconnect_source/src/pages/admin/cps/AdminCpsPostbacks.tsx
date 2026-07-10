import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav } from '../../../components/cps/CpsShared';
import { LpPostback, fetchAdminLpPostback, fetchAdminLpPostbacks, reprocessAdminLpPostback } from '../../../lib/api';

const pbLabel: Record<string, string> = {
  processed: '정상',
  unmatched: '미매칭',
  duplicate: '중복',
  error: '오류',
  received: '수신',
};

export function AdminCpsPostbacks() {
  const [items, setItems] = useState<LpPostback[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState<LpPostback | null>(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    fetchAdminLpPostbacks({ status: status || undefined, q: q || undefined, limit: 100 })
      .then((d) => setItems(d.items))
      .catch(() => setItems([]));
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout activeMenu="cps" title="POSTBACK 로그" description="리워드 API 수신 로그">
      <AdminCpsSubnav active="postbacks" />
      {msg ? <div className="mb-4 text-sm text-cyan-700 bg-cyan-50 rounded-xl px-4 py-2">{msg}</div> : null}
      <div className="bg-white border rounded-2xl p-4 mb-4 flex flex-wrap gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
          <option value="">전체 상태</option>
          {Object.keys(pbLabel).map((k) => <option key={k} value={k}>{pbLabel[k]}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색" className="border rounded-xl px-3 py-2 text-sm flex-1" />
        <button type="button" onClick={load} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">조회</button>
      </div>
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">수신</th>
              <th className="text-left px-3 py-3">trlog</th>
              <th className="text-left px-3 py-3">광고주</th>
              <th className="text-left px-3 py-3">주문</th>
              <th className="text-left px-3 py-3">상태</th>
              <th className="text-left px-3 py-3">IP</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">로그가 없습니다.</td></tr>
            ) : items.map((p) => (
              <tr key={p.lppId} className="border-t">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{p.receivedAt || '—'}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.trlogId}</td>
                <td className="px-3 py-2">{p.merchantCode}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.orderCode}</td>
                <td className="px-3 py-2">{pbLabel[p.processStatus] || p.processStatus}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.requestIp}</td>
                <td className="px-3 py-2 space-x-2">
                  <button type="button" className="text-xs font-bold text-cyan-700" onClick={() => fetchAdminLpPostback(p.lppId).then((r) => setDetail(r.item))}>상세</button>
                  <button type="button" className="text-xs font-bold text-slate-600" onClick={() => reprocessAdminLpPostback(p.lppId).then((r) => { setMsg(r.message); load(); })}>재처리</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-3">POSTBACK #{detail.lppId}</h3>
            <pre className="text-xs bg-slate-900 text-slate-100 rounded-xl p-3 overflow-x-auto">{JSON.stringify(detail, null, 2)}</pre>
            <button type="button" className="mt-3 px-4 py-2 border rounded-xl text-sm" onClick={() => setDetail(null)}>닫기</button>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
