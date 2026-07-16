import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, RefreshCw, ShoppingBag, Target, Wallet, Zap } from 'lucide-react';
import { PartnerLayout } from '../../layouts/PartnerLayout';
import { SummaryCard, StatusBadge } from '../../components/partner/PartnerShared';
import { formatWon } from '../../components/cps/CpsShared';
import {
  fetchPartnerDashboard,
  fetchPartnerLpOrders,
  fetchPartnerLpStats,
  PartnerConversion,
  PartnerLpStats,
  LpOrder,
} from '../../lib/api';
import { DataTableEmpty, SkeletonCardGrid, tableRowClass } from '../../components/center-ui';

const REFRESH_MS = 30_000;

export function PartnerLiveEarnings() {
  const [cpaSummary, setCpaSummary] = useState({
    todayEstRevenue: 0,
    estRevenue: 0,
    confRevenue: 0,
    todayReceived: 0,
    todayClicks: 0,
  });
  const [cpsStats, setCpsStats] = useState<PartnerLpStats | null>(null);
  const [recentCpa, setRecentCpa] = useState<PartnerConversion[]>([]);
  const [recentCps, setRecentCps] = useState<LpOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [dash, cps, orders] = await Promise.all([
        fetchPartnerDashboard(),
        fetchPartnerLpStats().catch(() => null),
        fetchPartnerLpOrders({ limit: 8 }).catch(() => null),
      ]);
      setCpaSummary({
        todayEstRevenue: dash.summary.todayEstRevenue ?? 0,
        estRevenue: dash.summary.estRevenue ?? 0,
        confRevenue: dash.summary.confRevenue ?? 0,
        todayReceived: dash.summary.todayReceived ?? 0,
        todayClicks: dash.summary.todayClicks ?? 0,
      });
      setRecentCpa(dash.recent ?? []);
      if (cps?.stats) setCpsStats(cps.stats);
      if (orders?.items) setRecentCps(orders.items.slice(0, 8));
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '실시간 수익을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(true), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const cpsExpected = cpsStats?.expectedEarnings ?? 0;
  const cpsConfirmed = cpsStats?.confirmedEarnings ?? 0;
  const totalEst = cpaSummary.estRevenue + cpsExpected;
  const totalConf = cpaSummary.confRevenue + cpsConfirmed;
  const todayLive = cpaSummary.todayEstRevenue + cpsExpected;

  return (
    <PartnerLayout activeMenu="live-earnings" title="실시간 수익">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 -mt-2">
        <p className="text-slate-500 text-sm">
          CPA·CPS 예상/확정 수익을 한눈에 확인합니다. {REFRESH_MS / 1000}초마다 자동 갱신됩니다.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {updatedAt ? (
            <span className="text-xs text-slate-400">
              갱신 {updatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-bold hover:bg-emerald-100 disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <SummaryCard title="오늘 실시간 예상" value={todayLive.toLocaleString()} suffix="원" highlight color="emerald" icon={<Zap className="text-emerald-500" />} caption="CPA 오늘 + CPS 예상" />
          <SummaryCard title="합산 예상수익" value={totalEst.toLocaleString()} suffix="원" icon={<Clock className="text-amber-500" />} />
          <SummaryCard title="합산 확정수익" value={totalConf.toLocaleString()} suffix="원" highlight dark icon={<Wallet className="text-emerald-400" />} />
          <SummaryCard title="CPA 확정" value={cpaSummary.confRevenue.toLocaleString()} suffix="원" icon={<Target className="text-cyan-500" />} />
          <SummaryCard title="CPS 확정" value={formatWon(cpsConfirmed)} suffix="원" icon={<ShoppingBag className="text-cyan-500" />} />
          <SummaryCard title="오늘 클릭·DB" value={`${cpaSummary.todayClicks}/${cpaSummary.todayReceived}`} caption="클릭 / 접수" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Target size={18} className="text-cyan-600" /> CPA 수익
            </h2>
            <Link to="/partner/db-status" className="text-xs font-bold text-emerald-600 hover:underline">디비 현황</Link>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">오늘 예상수입</span>
              <span className="font-bold text-slate-900">{cpaSummary.todayEstRevenue.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">누적 예상수익</span>
              <span className="font-bold text-amber-600">{cpaSummary.estRevenue.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">누적 확정수익</span>
              <span className="font-bold text-emerald-600">{cpaSummary.confRevenue.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-600" /> CPS 수익
            </h2>
            <Link to="/partner/cps/orders" className="text-xs font-bold text-emerald-600 hover:underline">CPS 실적</Link>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">예상수익</span>
              <span className="font-bold text-amber-600">{formatWon(cpsExpected)}원</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">확정수익</span>
              <span className="font-bold text-emerald-600">{formatWon(cpsConfirmed)}원</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">출금 가능</span>
              <span className="font-bold text-slate-900">{formatWon(cpsStats?.withdrawable)}원</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">최근 CPA 접수</h2>
            <Link to="/partner/db-status" className="text-xs font-bold text-emerald-600 hover:underline">전체 보기</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">일시</th>
                  <th className="px-4 py-3 text-left">상품</th>
                  <th className="px-4 py-3 text-right">예상</th>
                  <th className="px-4 py-3 text-center">상태</th>
                </tr>
              </thead>
              <tbody>
                {recentCpa.length === 0 ? (
                  <DataTableEmpty colSpan={4} title="최근 접수가 없습니다" description="홍보 링크로 유입이 시작되면 여기에 표시됩니다." actionLabel="내 홍보 링크" actionTo="/partner/links" />
                ) : (
                  recentCpa.slice(0, 8).map((row) => (
                    <tr key={row.id} className={tableRowClass}>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[140px]">{row.campaign}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.estRevenue.toLocaleString()}원</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={row.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">최근 CPS 실적</h2>
            <Link to="/partner/cps/orders" className="text-xs font-bold text-emerald-600 hover:underline">전체 보기</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">일시</th>
                  <th className="px-4 py-3 text-left">광고주</th>
                  <th className="px-4 py-3 text-right">예상</th>
                  <th className="px-4 py-3 text-right">확정</th>
                </tr>
              </thead>
              <tbody>
                {recentCps.length === 0 ? (
                  <DataTableEmpty colSpan={4} title="CPS 실적이 없습니다" description="쇼핑 링크 구매가 발생하면 여기에 표시됩니다." actionLabel="CPS 실적" actionTo="/partner/cps/orders" />
                ) : (
                  recentCps.map((row) => (
                    <tr key={row.lpoId} className={tableRowClass}>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{row.occurredAt || row.lastSyncedAt || '—'}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[140px]">{row.merchantName || row.merchantCode || '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-600">{formatWon(row.partnerExpected)}원</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{formatWon(row.partnerConfirmed)}원</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}
