import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { SummaryCard } from '../../components/admin/AdminShared';
import { Building2, Users, TrendingUp, Percent, Calendar, Loader2, Wallet, Trash2 } from 'lucide-react';
import {
  createAdminNetProfitPayout,
  deleteAdminNetProfitPayout,
  fetchAdminNetProfit,
  type AdminNetProfitSummary,
} from '../../lib/api';
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
  share20Paid: 0,
  share20Remaining: 0,
  approvedCount: 0,
  daily: [],
  payouts: [],
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutPaidAt, setPayoutPaidAt] = useState(formatDate(new Date()));
  const [payoutMemo, setPayoutMemo] = useState('');
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

  const handleCreatePayout = async () => {
    const amount = Number(String(payoutAmount).replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) {
      setError('지급 금액을 입력해 주세요.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await createAdminNetProfitPayout({
        amount,
        memo: payoutMemo.trim(),
        paidAt: payoutPaidAt || formatDate(new Date()),
        periodFrom: dateFrom,
        periodTo: dateTo,
      });
      setSummary(res.summary);
      setPayoutAmount('');
      setPayoutMemo('');
      setMessage(res.message || '지급 내역을 등록했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '지급 내역 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayout = async (id: number) => {
    if (!window.confirm('이 지급 내역을 삭제할까요?')) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await deleteAdminNetProfitPayout({ id, periodFrom: dateFrom, periodTo: dateTo });
      setSummary(res.summary);
      setMessage(res.message || '지급 내역을 삭제했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
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
      {message ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          불러오는 중…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <SummaryCard title="승인 DB" value={summary.approvedCount.toLocaleString()} suffix="건" icon={<Calendar size={18} />} />
            <SummaryCard title="광고주 과금액" value={won(summary.advertiserAmount)} suffix="원" color="blue" icon={<Building2 size={18} />} />
            <SummaryCard title="파트너 지급액" value={won(summary.partnerAmount)} suffix="원" color="yellow" icon={<Users size={18} />} />
            <SummaryCard title="순이익" value={won(summary.netProfit)} suffix="원" color="emerald" highlight icon={<TrendingUp size={18} />} />
            <SummaryCard title="순이익 20%" value={won(summary.netProfitShare20)} suffix="원" color="violet" highlight icon={<Percent size={18} />} />
            <SummaryCard
              title="20% 잔액"
              value={won(summary.share20Remaining)}
              suffix="원"
              color="indigo"
              highlight
              caption={`지급 ${won(summary.share20Paid)}원`}
              icon={<Wallet size={18} />}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">20% 지급 등록</h2>
                <p className="text-xs text-slate-500 mt-1">
                  현재 조회 기간({dateFrom} ~ {dateTo})의 20% 몫에서 지급한 금액을 기록합니다.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">지급 금액</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="예: 10000"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">지급일</span>
                  <input
                    type="date"
                    value={payoutPaidAt}
                    onChange={(e) => setPayoutPaidAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-500">메모 / 코멘트</span>
                <textarea
                  value={payoutMemo}
                  onChange={(e) => setPayoutMemo(e.target.value)}
                  rows={3}
                  placeholder="예: 홍길동 계좌 이체 / 중간 정산"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-y"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleCreatePayout()}
                disabled={saving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold disabled:opacity-50"
              >
                {saving ? '저장 중…' : '지급 내역 등록'}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">20% 지급 내역</h2>
                <p className="text-xs text-slate-500 mt-1">
                  총 지급 {won(summary.share20Paid)}원 · 잔액 {won(summary.share20Remaining)}원
                </p>
              </div>
              {(summary.payouts?.length ?? 0) === 0 ? (
                <p className="px-5 py-10 text-sm text-slate-500 text-center">등록된 지급 내역이 없습니다.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {summary.payouts.map((p) => (
                    <li key={p.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{won(p.amount)}원</p>
                        <p className="text-xs text-slate-500 mt-0.5">지급일 {p.paidAt}</p>
                        {p.memo ? <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{p.memo}</p> : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeletePayout(p.id)}
                        disabled={saving}
                        className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">일별 내역</h2>
              <p className="text-xs text-slate-500">승인 시각 기준</p>
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
