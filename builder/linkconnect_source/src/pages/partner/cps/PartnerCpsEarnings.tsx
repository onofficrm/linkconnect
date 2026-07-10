import { useCallback, useEffect, useState } from 'react';
import { PartnerLayout } from '../../../layouts/PartnerLayout';
import { SummaryCard } from '../../../components/partner/PartnerShared';
import { CpsPartnerNotice, PartnerCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import { LpLedger, PartnerLpStats, fetchPartnerLpEarnings } from '../../../lib/api';

export function PartnerCpsEarnings() {
  const [items, setItems] = useState<LpLedger[]>([]);
  const [stats, setStats] = useState<PartnerLpStats | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    fetchPartnerLpEarnings({ limit: 100 })
      .then((d) => {
        setItems(d.items);
        setStats(d.stats);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PartnerLayout activeMenu="cps-earnings" title="CPS 수익 현황">
      <PartnerCpsSubnav active="earnings" />
      <CpsPartnerNotice />
      {error ? <div className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</div> : null}

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 my-6">
          <SummaryCard title="예상수익" value={formatWon(stats.expectedEarnings)} suffix="원" color="yellow" highlight subtitle="출금 불가 · 변동 가능" />
          <SummaryCard title="확정수익" value={formatWon(stats.confirmedEarnings)} suffix="원" color="emerald" highlight subtitle="최종 확정분" />
          <SummaryCard title="출금 가능수익" value={formatWon(stats.withdrawable)} suffix="원" color="emerald" highlight subtitle="확정분만 반영" />
        </div>
      ) : null}

      <h3 className="font-bold text-slate-900 mb-3">수익 전표 (CREDIT / DEBIT / REVERSAL)</h3>
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">시각</th>
              <th className="text-left px-3 py-3">유형</th>
              <th className="text-right px-3 py-3">금액</th>
              <th className="text-right px-3 py-3">잔액</th>
              <th className="text-left px-3 py-3">메모</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">확정 수익 전표가 없습니다. 예상수익은 장부에 반영되지 않습니다.</td></tr>
            ) : items.map((l) => (
              <tr key={l.lplId} className="border-t">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{l.createdAt || '—'}</td>
                <td className="px-3 py-2 font-bold">{l.entryType}</td>
                <td className={`px-3 py-2 text-right ${l.entryType === 'CREDIT' ? 'text-emerald-700' : 'text-rose-600'}`}>{formatWon(l.amount)}</td>
                <td className="px-3 py-2 text-right">{formatWon(l.balanceAfter)}</td>
                <td className="px-3 py-2 text-xs truncate max-w-[200px]">{l.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PartnerLayout>
  );
}
