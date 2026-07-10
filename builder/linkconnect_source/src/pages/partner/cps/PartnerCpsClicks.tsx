import { useCallback, useEffect, useState } from 'react';
import { PartnerLayout } from '../../../layouts/PartnerLayout';
import { SummaryCard } from '../../../components/partner/PartnerShared';
import { CpsPartnerNotice, PartnerCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import { LpClick, PartnerLpStats, fetchPartnerLpClicks } from '../../../lib/api';

export function PartnerCpsClicks() {
  const [items, setItems] = useState<LpClick[]>([]);
  const [stats, setStats] = useState<PartnerLpStats | null>(null);
  const [summary, setSummary] = useState({ today: 0, month: 0, total: 0 });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    fetchPartnerLpClicks({ limit: 100 })
      .then((d) => {
        setItems(d.items);
        setSummary(d.summary);
        setStats(d.stats);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PartnerLayout activeMenu="cps" title="CPS 클릭 현황">
      <PartnerCpsSubnav active="clicks" />
      <CpsPartnerNotice />
      {error ? <div className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</div> : null}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 my-6">
        <SummaryCard title="오늘" value={formatWon(summary.today)} color="emerald" highlight />
        <SummaryCard title="이번 달" value={formatWon(summary.month)} />
        <SummaryCard title="전체" value={formatWon(summary.total)} />
      </div>
      {stats ? <p className="text-xs text-slate-500 mb-3">예상 실적 {stats.expectedOrders} · 확정 {stats.confirmedOrders}</p> : null}
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">시각</th>
              <th className="text-left px-3 py-3">광고주</th>
              <th className="text-left px-3 py-3">기기</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-12 text-slate-400">클릭이 없습니다.</td></tr>
            ) : items.map((c) => (
              <tr key={c.lpcId} className="border-t">
                <td className="px-4 py-2 text-xs whitespace-nowrap">{c.clickedAt || '—'}</td>
                <td className="px-3 py-2">{c.merchantName || c.merchantCode}</td>
                <td className="px-3 py-2">{c.device || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PartnerLayout>
  );
}
