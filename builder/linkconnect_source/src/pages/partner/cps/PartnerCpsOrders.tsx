import { useCallback, useEffect, useState } from 'react';
import { PartnerLayout } from '../../../layouts/PartnerLayout';
import { SummaryCard } from '../../../components/partner/PartnerShared';
import { CpsPartnerNotice, LpStatusBadge, PartnerCpsSubnav, formatWon, truncate } from '../../../components/cps/CpsShared';
import { LpOrder, PartnerLpStats, fetchPartnerLpOrders } from '../../../lib/api';

export function PartnerCpsOrders() {
  const [items, setItems] = useState<LpOrder[]>([]);
  const [stats, setStats] = useState<PartnerLpStats | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    fetchPartnerLpOrders({ status: status || undefined, limit: 100 })
      .then((d) => {
        setItems(d.items);
        setStats(d.stats);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PartnerLayout activeMenu="cps-orders" title="CPS 실적">
      <PartnerCpsSubnav active="orders" />
      <CpsPartnerNotice />
      {error ? <div className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</div> : null}

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
          <SummaryCard title="예상 실적" value={formatWon(stats.expectedOrders)} subtitle="검수·취소 가능" />
          <SummaryCard title="확정 실적" value={formatWon(stats.confirmedOrders)} color="emerald" highlight />
          <SummaryCard title="예상수익" value={formatWon(stats.expectedEarnings)} suffix="원" color="yellow" highlight subtitle="출금 불가" />
          <SummaryCard title="확정수익" value={formatWon(stats.confirmedEarnings)} suffix="원" color="emerald" highlight subtitle="출금 가능" />
        </div>
      ) : null}

      <div className="flex gap-2 mb-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
          <option value="">전체 상태</option>
          <option value="pending">대기</option>
          <option value="review">정산대기</option>
          <option value="approved">확정</option>
          <option value="canceled">취소</option>
        </select>
        <button type="button" onClick={load} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">조회</button>
      </div>

      <div className="hidden md:block bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">발생일</th>
              <th className="text-left px-3 py-3">광고주</th>
              <th className="text-left px-3 py-3">상품</th>
              <th className="text-left px-3 py-3">주문</th>
              <th className="text-right px-3 py-3">판매</th>
              <th className="text-right px-3 py-3">예상수익</th>
              <th className="text-right px-3 py-3">확정수익</th>
              <th className="text-left px-3 py-3">상태</th>
              <th className="text-left px-3 py-3">안내</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-slate-400">실적이 없습니다.</td></tr>
            ) : items.map((o) => (
              <tr key={o.lpoId} className="border-t">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{o.occurredAt?.slice(0, 10) || '—'}</td>
                <td className="px-3 py-2">{o.merchantName || o.merchantCode}</td>
                <td className="px-3 py-2 max-w-[160px] truncate" title={o.productName}>{truncate(o.productName, 28)}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.orderCode}</td>
                <td className="px-3 py-2 text-right">{formatWon(o.salesAmount)}</td>
                <td className="px-3 py-2 text-right">{formatWon(o.partnerExpected)}</td>
                <td className="px-3 py-2 text-right font-bold text-emerald-700">{formatWon(o.partnerConfirmed)}</td>
                <td className="px-3 py-2"><LpStatusBadge status={o.lcStatus} /></td>
                <td className="px-3 py-2 text-xs text-slate-500 max-w-[180px]">{o.settleHint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((o) => (
          <article key={`m-${o.lpoId}`} className="bg-white border rounded-2xl p-4">
            <div className="flex justify-between gap-2">
              <div className="font-bold truncate">{o.merchantName || o.merchantCode}</div>
              <LpStatusBadge status={o.lcStatus} />
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">{truncate(o.productName, 40)}</div>
            <div className="text-xs text-slate-400 mt-1">주문 {o.orderCode}</div>
            <div className="mt-2 text-sm">예상 {formatWon(o.partnerExpected)}원 · 확정 <span className="font-bold text-emerald-700">{formatWon(o.partnerConfirmed)}원</span></div>
            <div className="text-xs text-slate-500 mt-1">{o.settleHint}</div>
          </article>
        ))}
      </div>
    </PartnerLayout>
  );
}
