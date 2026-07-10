import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav, LpStatusBadge, formatWon, truncate } from '../../../components/cps/CpsShared';
import {
  LpOrder,
  adminLpOrdersCsvUrl,
  fetchAdminLpOrder,
  fetchAdminLpOrders,
  linkAdminLpOrderPartner,
  syncAdminLpOrderOne,
  syncAdminLpOrders,
} from '../../../lib/api';

type Props = { unmatchedOnly?: boolean };

export function AdminCpsOrders({ unmatchedOnly = false }: Props) {
  const [items, setItems] = useState<LpOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    occurredFrom: '',
    occurredTo: '',
    confirmedFrom: '',
    confirmedTo: '',
    merchant: '',
    partner: '',
    order: '',
    product: '',
    status: '',
  });
  const [detail, setDetail] = useState<LpOrder | null>(null);
  const [logs, setLogs] = useState<Array<{ fromStatus: string; toStatus: string; reason: string; changedAt: string | null; fromCommission: number; toCommission: number }>>([]);
  const [click, setClick] = useState<{ uId: string; device: string; ip: string; clickedAt: string | null } | null>(null);
  const [linkPtId, setLinkPtId] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 4000);
  };

  const load = useCallback(() => {
    setError('');
    const q: Record<string, string | boolean | undefined> = { limit: 100, ...filters };
    if (unmatchedOnly) q.unmatched = true;
    fetchAdminLpOrders(q)
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch((e) => {
        setItems([]);
        setError(e instanceof Error ? e.message : '조회 실패');
      });
  }, [filters, unmatchedOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (o: LpOrder) => {
    setBusy(true);
    try {
      const res = await fetchAdminLpOrder(o.lpoId);
      setDetail(res.item);
      setLogs(res.logs);
      setClick(res.click);
      setShowRaw(false);
      setLinkPtId('');
    } catch (e) {
      notify(e instanceof Error ? e.message : '상세 조회 실패');
    } finally {
      setBusy(false);
    }
  };

  const resyncOne = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      const res = await syncAdminLpOrderOne(detail.lpoId);
      notify(res.message);
      openDetail(detail);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '재동기화 실패');
    } finally {
      setBusy(false);
    }
  };

  const linkPartner = async () => {
    if (!detail || !linkPtId) return;
    setBusy(true);
    try {
      const res = await linkAdminLpOrderPartner(detail.lpoId, Number(linkPtId));
      notify(res.message);
      openDetail(detail);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '연결 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      activeMenu="cps"
      title={unmatchedOnly ? '미매칭 실적' : 'CPS 실적 관리'}
      description="링크프라이스 실적 · 수동 확정/금액변경 없음"
    >
      <AdminCpsSubnav active={unmatchedOnly ? 'unmatched' : 'orders'} />
      {msg ? <div className="mb-4 text-sm text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2">{msg}</div> : null}
      {error ? <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">{error}</div> : null}

      {!unmatchedOnly ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {([
            ['occurredFrom', '발생일 시작'],
            ['occurredTo', '발생일 끝'],
            ['confirmedFrom', '확정일 시작'],
            ['confirmedTo', '확정일 끝'],
            ['merchant', '광고주'],
            ['partner', '파트너'],
            ['order', '주문번호'],
            ['product', '상품명'],
            ['status', '상태'],
          ] as const).map(([k, label]) => (
            <label key={k} className="text-xs text-slate-500">
              {label}
              <input
                value={filters[k]}
                onChange={(e) => setFilters((f) => ({ ...f, [k]: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </label>
          ))}
          <div className="flex items-end gap-2 col-span-2">
            <button type="button" onClick={load} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">조회</button>
            <button type="button" disabled={busy} onClick={() => syncAdminLpOrders({ mode: 'last7' }).then((r) => { notify(r.message); load(); }).catch((e) => notify(e.message))} className="px-3 py-2 rounded-xl border text-sm font-bold">7일 동기화</button>
            <a href={adminLpOrdersCsvUrl({ ...filters })} className="px-3 py-2 rounded-xl border text-sm font-bold" target="_blank" rel="noreferrer">CSV</a>
            <span className="text-xs text-slate-500 self-center">{total}건</span>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex gap-2 items-center">
          <button type="button" onClick={load} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">새로고침</button>
          <span className="text-xs text-slate-500">{total}건</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto hidden md:block">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-3 py-3">ID</th>
              <th className="text-left px-3 py-3">trlog</th>
              <th className="text-left px-3 py-3">파트너</th>
              <th className="text-left px-3 py-3">광고주</th>
              <th className="text-left px-3 py-3">주문</th>
              <th className="text-left px-3 py-3">상품</th>
              <th className="text-right px-3 py-3">판매</th>
              <th className="text-right px-3 py-3">LP</th>
              <th className="text-right px-3 py-3">예상</th>
              <th className="text-right px-3 py-3">확정</th>
              <th className="text-right px-3 py-3">마진</th>
              <th className="text-left px-3 py-3">원본</th>
              <th className="text-left px-3 py-3">상태</th>
              <th className="text-left px-3 py-3">발생</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={15} className="text-center py-12 text-slate-400">실적이 없습니다.</td></tr>
            ) : items.map((o) => (
              <tr key={o.lpoId} className="border-t border-slate-100">
                <td className="px-3 py-2">{o.lpoId}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.trlogId}</td>
                <td className="px-3 py-2">{o.partnerName || o.partnerCode || (o.unmatched ? '미매칭' : o.ptId)}</td>
                <td className="px-3 py-2">{o.merchantName || o.merchantCode}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.orderCode}</td>
                <td className="px-3 py-2 max-w-[140px] truncate" title={o.productName}>{truncate(o.productName, 24)}</td>
                <td className="px-3 py-2 text-right">{formatWon(o.salesAmount)}</td>
                <td className="px-3 py-2 text-right">{formatWon(o.lpCommission)}</td>
                <td className="px-3 py-2 text-right">{formatWon(o.partnerExpected)}</td>
                <td className="px-3 py-2 text-right font-bold text-emerald-700">{formatWon(o.partnerConfirmed)}</td>
                <td className="px-3 py-2 text-right">{formatWon(o.platformMargin ?? 0)}</td>
                <td className="px-3 py-2">{o.rawStatus}</td>
                <td className="px-3 py-2"><LpStatusBadge status={o.lcStatus} /></td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">{o.occurredAt?.slice(0, 16) || '—'}</td>
                <td className="px-3 py-2"><button type="button" className="text-xs font-bold text-cyan-700" onClick={() => openDetail(o)}>상세</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((o) => (
          <article key={`c-${o.lpoId}`} className="bg-white border border-slate-200 rounded-2xl p-4" onClick={() => openDetail(o)}>
            <div className="flex justify-between gap-2">
              <div className="font-bold truncate">{o.merchantName || o.merchantCode}</div>
              <LpStatusBadge status={o.lcStatus} />
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">{truncate(o.productName, 40)}</div>
            <div className="text-sm mt-2">예상 {formatWon(o.partnerExpected)} · 확정 <span className="font-bold text-emerald-700">{formatWon(o.partnerConfirmed)}</span></div>
          </article>
        ))}
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">실적 #{detail.lpoId}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>trlog: <span className="font-mono text-xs">{detail.trlogId}</span></div>
              <div>상태: <LpStatusBadge status={detail.lcStatus} /> (원본 {detail.rawStatus})</div>
              <div>파트너: {detail.partnerName || detail.ptId || '미매칭'}</div>
              <div>광고주: {detail.merchantName || detail.merchantCode}</div>
              <div>주문: {detail.orderCode}</div>
              <div>상품: {detail.productName}</div>
              <div>판매: {formatWon(detail.salesAmount)}</div>
              <div>LP커미션: {formatWon(detail.lpCommission)}</div>
              <div>예상수익: {formatWon(detail.partnerExpected)}</div>
              <div>확정수익: {formatWon(detail.partnerConfirmed)}</div>
              <div>발생: {detail.occurredAt || '—'}</div>
              <div>확정: {detail.confirmedAt || '—'}</div>
              <div>취소: {detail.cancelledAt || '—'}</div>
            </div>
            {click ? <div className="text-xs bg-slate-50 rounded-xl p-3">클릭: {click.clickedAt} · {click.device} · {click.ip} · {click.uId}</div> : null}
            <div>
              <div className="text-sm font-bold mb-2">상태 변경 이력</div>
              <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                {logs.length === 0 ? <li className="text-slate-400">이력 없음</li> : logs.map((l, i) => (
                  <li key={i}>{l.changedAt}: {l.fromStatus || '∅'} → {l.toStatus} ({l.fromCommission}→{l.toCommission}) {l.reason}</li>
                ))}
              </ul>
            </div>
            {detail.unmatched ? (
              <div className="flex gap-2 items-end">
                <label className="text-sm flex-1">미매칭 파트너 연결 (pt_id)
                  <input value={linkPtId} onChange={(e) => setLinkPtId(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
                </label>
                <button type="button" disabled={busy} onClick={linkPartner} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold">연결</button>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={resyncOne} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">수동 재동기화</button>
              <button type="button" onClick={() => setShowRaw((v) => !v)} className="px-4 py-2 rounded-xl border text-sm font-bold">원본 JSON</button>
              <button type="button" onClick={() => setDetail(null)} className="px-4 py-2 rounded-xl border text-sm">닫기</button>
            </div>
            {showRaw ? <pre className="text-xs bg-slate-900 text-slate-100 rounded-xl p-3 overflow-x-auto max-h-60">{JSON.stringify(detail.rawJson ?? {}, null, 2)}</pre> : null}
            <p className="text-xs text-slate-500">수동 확정·금액 변경은 제공하지 않습니다. 필요 시 최고관리자 감사로그 절차를 따릅니다.</p>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}

export function AdminCpsUnmatched() {
  return <AdminCpsOrders unmatchedOnly />;
}
