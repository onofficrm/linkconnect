import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MousePointerClick,
  Target,
  CheckCircle2,
  XCircle,
  Percent,
  Lightbulb,
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  Globe,
  Smartphone,
  BarChart3,
} from 'lucide-react';
import { SummaryCard } from '../../components/partner/PartnerShared';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PartnerLayout } from '../../layouts/PartnerLayout';
import {
  fetchPartnerAnalytics,
  PartnerAnalyticsFilters,
  PartnerAnalyticsLinkRow,
  PartnerAnalyticsResponse,
} from '../../lib/api';

const emptyData: PartnerAnalyticsResponse = {
  summary: {
    totalClicks: 0,
    uniqueVisitors: 0,
    totalDb: 0,
    approvedDb: 0,
    rejectedDb: 0,
    confRevenue: 0,
    avgConvRate: 0,
    avgApprovalRate: 0,
    epc: 0,
  },
  range: { dateFrom: '', dateTo: '', period: 7 },
  funnel: { clicks: 0, received: 0, approved: 0, confirmed: 0 },
  chart: [],
  chart7d: [],
  channels: [],
  linkNames: [],
  links: [],
  compareLinks: [],
  referrers: [],
  devices: [],
  campaigns: [],
  filterOptions: { links: [], channels: [], linkNames: [] },
  dbReady: false,
};

const PERIOD_OPTIONS: Array<{ value: 7 | 30 | 90; label: string }> = [
  { value: 7, label: '7일' },
  { value: 30, label: '30일' },
  { value: 90, label: '90일' },
];

function funnelRate(current: number, previous: number) {
  if (previous <= 0) return '0%';
  return `${((current / previous) * 100).toFixed(1)}%`;
}

export function PartnerAnalytics() {
  const [data, setData] = useState<PartnerAnalyticsResponse>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<7 | 30 | 90>(7);
  const [channel, setChannel] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkId, setLinkId] = useState(0);
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const loadData = useCallback(async (filters: PartnerAnalyticsFilters) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchPartnerAnalytics(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({
      period,
      channel,
      linkName,
      linkId: linkId || undefined,
      compareIds: compareIds.length ? compareIds : undefined,
    });
  }, [period, channel, linkName, linkId, compareIds, loadData]);

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const chartData = data.chart.length ? data.chart : data.chart7d;
  const compareRows = data.compareLinks.length ? data.compareLinks : data.links.filter((link) => compareIds.includes(link.id));

  const rangeLabel = useMemo(() => {
    if (data.range.dateFrom && data.range.dateTo) {
      return `${data.range.dateFrom} ~ ${data.range.dateTo}`;
    }
    return '';
  }, [data.range.dateFrom, data.range.dateTo]);

  return (
    <PartnerLayout activeMenu="analytics" title="유입 분석">
      <div className="flex flex-col gap-4 mb-8 -mt-2">
        <p className="text-slate-500">
          홍보 링크별 클릭·접수·승인·수익 흐름을 확인하고, 채널·링크이름·유입 경로별 성과를 비교하세요.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-medium">
            <Filter size={18} className="text-emerald-500" />
            필터
            {rangeLabel && <span className="text-xs font-normal text-slate-400 ml-2">{rangeLabel}</span>}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    period === option.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white"
            >
              <option value="">전체 채널</option>
              {data.filterOptions.channels.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white"
            >
              <option value="">전체 링크이름</option>
              {data.filterOptions.linkNames.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={linkId || ''}
              onChange={(e) => setLinkId(Number(e.target.value) || 0)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white min-w-[220px]"
            >
              <option value="">전체 홍보 링크</option>
              {data.filterOptions.links.map((link) => (
                <option key={link.id} value={link.id}>
                  {link.campaign} · {link.channel}{link.linkName ? ` · ${link.linkName}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
        <SummaryCard title="총 클릭" value={data.summary.totalClicks.toLocaleString()} suffix="회" icon={<MousePointerClick className="text-blue-500" />} />
        <SummaryCard title="순 방문자" value={data.summary.uniqueVisitors.toLocaleString()} suffix="명" icon={<Users className="text-indigo-500" />} />
        <SummaryCard title="접수 DB" value={data.summary.totalDb.toLocaleString()} suffix="건" icon={<Target className="text-cyan-500" />} />
        <SummaryCard title="승인 DB" value={data.summary.approvedDb.toLocaleString()} suffix="건" icon={<CheckCircle2 className="text-emerald-500" />} highlight />
        <SummaryCard title="취소 DB" value={data.summary.rejectedDb.toLocaleString()} suffix="건" icon={<XCircle className="text-red-500" />} />
        <SummaryCard title="전환율" value={String(data.summary.avgConvRate)} suffix="%" icon={<Percent className="text-purple-500" />} />
        <SummaryCard title="승인율" value={String(data.summary.avgApprovalRate)} suffix="%" icon={<Percent className="text-emerald-500" />} />
        <SummaryCard title="클릭당 수익" value={data.summary.epc.toLocaleString()} suffix="원" icon={<DollarSign className="text-amber-500" />} highlight />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">전환 퍼널</h2>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { label: '클릭', value: data.funnel.clicks, rate: null },
              { label: 'DB 접수', value: data.funnel.received, rate: funnelRate(data.funnel.received, data.funnel.clicks) },
              { label: '승인', value: data.funnel.approved, rate: funnelRate(data.funnel.approved, data.funnel.received) },
              { label: '확정', value: data.funnel.confirmed, rate: funnelRate(data.funnel.confirmed, data.funnel.approved) },
            ].map((step, index) => (
              <div key={step.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500 mb-1">{step.label}</div>
                <div className="text-2xl font-bold text-slate-900">{step.value.toLocaleString()}</div>
                {step.rate && <div className="text-xs text-emerald-600 mt-2">전환 {step.rate}</div>}
                {index < 3 && <div className="hidden sm:block text-[10px] text-slate-300 mt-3">↓</div>}
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-slate-500">
            확정수익 <span className="font-bold text-emerald-600">{data.summary.confRevenue.toLocaleString()}원</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-500" />
            채널 TOP
          </h2>
          <div className="space-y-4">
            {data.channels.length === 0 ? (
              <p className="text-sm text-slate-500">채널 데이터가 없습니다.</p>
            ) : data.channels.map((item) => (
              <div key={item.channel}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.channel}</span>
                  <span className="text-slate-500">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
                <div className="text-xs text-slate-400 mt-1">클릭 {item.clicks} · DB {item.dbs} · 승인 {item.approved}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">일별 성과 추이</h2>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">불러오는 중...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorApproval" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="click" stroke="#3b82f6" fill="url(#colorClick)" strokeWidth={2} name="클릭" />
                  <Area type="monotone" dataKey="db" stroke="#06b6d4" fill="url(#colorDb)" strokeWidth={2} name="DB" />
                  <Area type="monotone" dataKey="approval" stroke="#10b981" fill="url(#colorApproval)" strokeWidth={2} name="승인" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe size={18} className="text-cyan-500" />
              유입 도메인
            </h2>
            <div className="space-y-3">
              {data.referrers.length === 0 ? (
                <p className="text-sm text-slate-500">유입 도메인 데이터가 없습니다.</p>
              ) : data.referrers.map((item) => (
                <div key={item.domain}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 truncate pr-2">{item.domain}</span>
                    <span className="text-slate-500 shrink-0">{item.clicks}회</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Smartphone size={18} className="text-violet-500" />
              기기별 클릭
            </h2>
            <div className="space-y-3">
              {data.devices.length === 0 ? (
                <p className="text-sm text-slate-500">기기 데이터가 없습니다.</p>
              ) : data.devices.map((item) => (
                <div key={item.deviceCode}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{item.device}</span>
                    <span className="text-slate-500">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {compareRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-500" />
            링크 비교 ({compareRows.length}개)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">캠페인 / 채널 / 링크이름</th>
                  <th className="px-4 py-3 text-right">클릭</th>
                  <th className="px-4 py-3 text-right">접수</th>
                  <th className="px-4 py-3 text-right">승인</th>
                  <th className="px-4 py-3 text-right">전환율</th>
                  <th className="px-4 py-3 text-right">승인율</th>
                  <th className="px-4 py-3 text-right">EPC</th>
                  <th className="px-4 py-3 text-right">확정수익</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {compareRows.map((item) => (
                  <CompareRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">홍보 링크별 성과</h2>
          </div>
          <p className="text-xs text-slate-500">최대 3개까지 선택해 비교할 수 있습니다.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4">비교</th>
                <th className="px-4 py-4">캠페인</th>
                <th className="px-4 py-4">채널</th>
                <th className="px-4 py-4">링크이름</th>
                <th className="px-4 py-4 text-right">클릭</th>
                <th className="px-4 py-4 text-right">접수</th>
                <th className="px-4 py-4 text-right">승인</th>
                <th className="px-4 py-4 text-right">취소</th>
                <th className="px-4 py-4 text-right">전환율</th>
                <th className="px-4 py-4 text-right">승인율</th>
                <th className="px-4 py-4 text-right">EPC</th>
                <th className="px-4 py-4 text-right">확정수익</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.links.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-500">선택한 기간에 집계된 홍보 링크 성과가 없습니다.</td>
                </tr>
              ) : data.links.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(item.id)}
                      onChange={() => toggleCompare(item.id)}
                      disabled={!compareIds.includes(item.id) && compareIds.length >= 3}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.campaign}</td>
                  <td className="px-4 py-4 text-slate-600">{item.channel}</td>
                  <td className="px-4 py-4 text-slate-600">{item.linkName}</td>
                  <td className="px-4 py-4 text-right">{item.clicks.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{item.received.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-emerald-600 font-medium">{item.approved.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-red-500">{item.canceled.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{item.convRate}%</td>
                  <td className="px-4 py-4 text-right">{item.appRate}%</td>
                  <td className="px-4 py-4 text-right">{item.epc.toLocaleString()}원</td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-600">{item.confRev.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">링크이름별 성과</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">링크이름</th>
                  <th className="px-4 py-3">채널</th>
                  <th className="px-4 py-3 text-right">클릭</th>
                  <th className="px-4 py-3 text-right">DB</th>
                  <th className="px-4 py-3 text-right">승인</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.linkNames.map((item) => (
                  <tr key={`${item.linkName}-${item.channel}`}>
                    <td className="px-4 py-3 font-medium">{item.linkName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.channel}</td>
                    <td className="px-4 py-3 text-right">{item.clicks}</td>
                    <td className="px-4 py-3 text-right">{item.dbs}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{item.approved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">캠페인별 성과</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">캠페인</th>
                  <th className="px-4 py-3 text-right">클릭</th>
                  <th className="px-4 py-3 text-right">접수</th>
                  <th className="px-4 py-3 text-right">승인</th>
                  <th className="px-4 py-3 text-right">확정수익</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.campaigns.map((item) => (
                  <tr key={item.campaign}>
                    <td className="px-4 py-3 font-medium">{item.campaign}</td>
                    <td className="px-4 py-3 text-right">{item.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{item.received.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{item.approved.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{item.confRev.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

function CompareRow({ item }: { item: PartnerAnalyticsLinkRow }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">{item.campaign}</div>
        <div className="text-xs text-slate-500">{item.channel} · {item.linkName}</div>
      </td>
      <td className="px-4 py-3 text-right">{item.clicks.toLocaleString()}</td>
      <td className="px-4 py-3 text-right">{item.received.toLocaleString()}</td>
      <td className="px-4 py-3 text-right text-emerald-600">{item.approved.toLocaleString()}</td>
      <td className="px-4 py-3 text-right">{item.convRate}%</td>
      <td className="px-4 py-3 text-right">{item.appRate}%</td>
      <td className="px-4 py-3 text-right">{item.epc.toLocaleString()}원</td>
      <td className="px-4 py-3 text-right font-bold text-emerald-600">{item.confRev.toLocaleString()}원</td>
    </tr>
  );
}
