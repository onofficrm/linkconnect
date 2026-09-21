import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { SummaryCard } from '../../components/admin/AdminShared';
import { Building2, Users, TrendingUp, Percent, Calendar, Loader2 } from 'lucide-react';
import { fetchAdminNetProfit, type AdminNetProfitSummary } from '../../lib/api';
import { isNetProfitUiVisible } from '../../lib/auth';

type PeriodPreset = 'this_month' | 'last_month' | '7d' | '30d' | 'custom';

const PRESETS: Array<{ id: PeriodPreset; label: string }> = [
  { id: 'this_month', label: '이번 달' },
  { id: 'last_month', label: '지난 달' },
  { id: '30d', label: '최근 30일' },
  { id: '7d', label: '최근 7일' },
  { id: 'custom', label: '직접 지정' },
];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function rangeForPreset(preset: PeriodPreset): { from: string; to: string } {
  const today = new Date();
  const to = formatDate(today);

  if (preset === 'this_month') {
    return { from: `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-01`, to };
  }
  if (preset === 'last_month') {
    const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastPrev = new Date(firstThisMonth.getTime() - 86400000);
    const firstPrev = new Date(lastPrev.getFullYear(), lastPrev.getMonth(), 1);
    return { from: formatDate(firstPrev), to: formatDate(lastPrev) };
  }
  if (preset === '7d') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: formatDate(from), to };
  }
  if (preset === '30d') {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from: formatDate(from), to };
  }

  return { from: `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-01`, to };
}

function won(n: number) {
  return n.toLocaleString('ko-KR');
}

const emptySummary: AdminNetProfitSummary = {
  dateFrom: '',
  dateTo: '',
  advertiserAmount: 0,
  partnerAmount: 0,
  netProfit: 0,
  netProfitShare20: 0,
  approvedCount: 0,
  daily: [],
  dbReady: true,
  allowed: true,
};

export function AdminNetProfit() {
  const initial = rangeForPreset('this_month');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('this_month');
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);
  const [summary, setSummary] = useState<AdminNetProfitSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const allowed = isNetProfitUiVisible();

  const load = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminNetProfit({ dateFrom: from, dateTo: to });
      setSummary(data);
      if (data.dateFrom) setDateFrom(data.dateFrom);
      if (data.dateTo) setDateTo(data.dateTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : '순이익 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    void load(initial.from, initial.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  const applyPreset = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    if (preset === 'custom') return;
    const range = rangeForPreset(preset);
    setDateFrom(range.from);
    setDateTo(range.to);
    void load(range.from, range.to);
  };

  const handleSearch = () => {
    if (!dateFrom || !dateTo) {
      setError('조회 기간을 선택해 주세요.');
      return;
    }
    let from = dateFrom;
    let to = dateTo;
    if (from > to) {
      const tmp = from;
      from = to;
      to = tmp;
      setDateFrom(from);
      setDateTo(to);
    }
    setPeriodPreset('custom');
    void load(from, to);
  };

  const periodLabel = useMemo(() => {
    if (periodPreset === 'this_month') return '이번 달';
    if (periodPreset === 'last_month') return '지난 달';
    if (periodPreset === '30d') return '최근 30일';
    if (periodPreset === '7d') return '최근 7일';
    return '직접 지정';
  }, [periodPreset]);

  if (!allowed) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout
      activeMenu="net_profit"
      title="순이익 정산"
      description="승인 DB 기준으로 광고주 과금액과 파트너 지급액 차액(순이익)을 기간별로 확인합니다."
    >
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                periodPreset === p.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">시작일</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setPeriodPreset('custom');
                setDateFrom(e.target.value);
              }}
              className="block px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">종료일</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setPeriodPreset('custom');
                setDateTo(e.target.value);
              }}
              className="block px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold disabled:opacity-50"
          >
            <Calendar size={16} />
            조회
          </button>
          <p className="text-sm text-slate-500 pb-2">
            {periodLabel} · {dateFrom} ~ {dateTo}
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          불러오는 중…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <SummaryCard
              title="승인 DB"
              value={summary.approvedCount.toLocaleString()}
              suffix="건"
              icon={<Calendar size={18} />}
            />
            <SummaryCard
              title="광고주 과금액"
              value={won(summary.advertiserAmount)}
              suffix="원"
              color="blue"
              icon={<Building2 size={18} />}
            />
            <SummaryCard
              title="파트너 지급액"
              value={won(summary.partnerAmount)}
              suffix="원"
              color="yellow"
              icon={<Users size={18} />}
            />
            <SummaryCard
              title="순이익"
              value={won(summary.netProfit)}
              suffix="원"
              color="emerald"
              highlight
              icon={<TrendingUp size={18} />}
            />
            <SummaryCard
              title="순이익 20%"
              value={won(summary.netProfitShare20)}
              suffix="원"
              color="violet"
              highlight
              icon={<Percent size={18} />}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">일별 내역</h2>
              <p className="text-xs text-slate-500">승인 시각(cv_updated_at) 기준</p>
            </div>
            {summary.daily.length === 0 ? (
              <p className="px-5 py-10 text-sm text-slate-500 text-center">해당 기간 승인 데이터가 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">날짜</th>
                      <th className="text-right px-4 py-3 font-semibold">승인 DB</th>
                      <th className="text-right px-4 py-3 font-semibold">광고주 과금</th>
                      <th className="text-right px-4 py-3 font-semibold">파트너 지급</th>
                      <th className="text-right px-4 py-3 font-semibold">순이익</th>
                      <th className="text-right px-4 py-3 font-semibold">20%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.daily.map((row) => (
                      <tr key={row.date} className="border-t border-slate-100 hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-800">{row.date}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{row.approvedCount.toLocaleString()}건</td>
                        <td className="px-4 py-3 text-right text-slate-700">{won(row.advertiserAmount)}원</td>
                        <td className="px-4 py-3 text-right text-slate-700">{won(row.partnerAmount)}원</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700">{won(row.netProfit)}원</td>
                        <td className="px-4 py-3 text-right font-semibold text-violet-700">{won(row.netProfitShare20)}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
