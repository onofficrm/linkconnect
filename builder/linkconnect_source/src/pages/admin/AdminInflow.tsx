import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Filter,
  Globe,
  Link2,
  MousePointerClick,
  Percent,
  PhoneCall,
  PieChart,
  Smartphone,
  Target,
  Users,
} from 'lucide-react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { InsightBanner, ProgressBar, SummaryCard } from '../../components/center-ui';
import {
  AdminInflowMetric,
  AdminInflowResponse,
  AdminInflowSource,
  fetchAdminInflow,
} from '../../lib/api';

const empty: AdminInflowResponse = {
  range: { dateFrom: '', dateTo: '', period: 7 },
  summary: {
    clicks: 0,
    uniqueVisitors: 0,
    totalDb: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    approvalRate: 0,
    convRate: 0,
  },
  chart: [],
  sources: [],
  channels: [],
  referrers: [],
  pageHosts: [],
  utmSources: [],
  utmMediums: [],
  utmCampaigns: [],
  clickReferrers: [],
  devices: [],
  partners: [],
  campaigns: [],
  paths: [],
  filterOptions: { partners: [], campaigns: [] },
};

const PERIODS: Array<{ value: 7 | 30 | 90; label: string }> = [
  { value: 7, label: '7일' },
  { value: 30, label: '30일' },
  { value: 90, label: '90일' },
];

const SOURCES: Array<{ value: AdminInflowSource; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'form', label: '폼/링크' },
  { value: 'embed', label: '외부위젯' },
  { value: 'call', label: '콜디비' },
];

function RankList({
  title,
  hint,
  rows,
  countLabel = '접수',
}: {
  title: string;
  hint?: string;
  rows: AdminInflowMetric[];
  countLabel?: string;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-bold text-slate-900">{title}</h3>
      {hint ? <p className="text-xs text-slate-400 mt-1 mb-4">{hint}</p> : <div className="mb-4" />}
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">이 기간에 집계된 유입이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={`${title}-${row.label}-${row.id ?? ''}`}>
              <div className="flex items-center justify-between gap-3 text-sm mb-1">
                <span className="font-medium text-slate-800 truncate">{row.label || '-'}</span>
                <span className="shrink-0 text-slate-500 tabular-nums">
                  {row.total.toLocaleString()}
                  {countLabel ? ` ${countLabel}` : ''}
                  {typeof row.approvalRate === 'number' ? ` · 승인 ${row.approvalRate}%` : ''}
                </span>
              </div>
              <ProgressBar value={row.percentage} showLabel={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminInflow() {
  const [period, setPeriod] = useState<7 | 30 | 90>(7);
  const [source, setSource] = useState<AdminInflowSource>('all');
  const [ptId, setPtId] = useState(0);
  const [cpId, setCpId] = useState(0);
  const [data, setData] = useState<AdminInflowResponse>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminInflow({ period, source, ptId, cpId });
      setData({
        ...empty,
        ...result,
        summary: { ...empty.summary, ...(result.summary ?? {}) },
        chart: result.chart ?? [],
        sources: result.sources ?? [],
        channels: result.channels ?? [],
        referrers: result.referrers ?? [],
        pageHosts: result.pageHosts ?? [],
        utmSources: result.utmSources ?? [],
        utmMediums: result.utmMediums ?? [],
        utmCampaigns: result.utmCampaigns ?? [],
        clickReferrers: result.clickReferrers ?? [],
        devices: result.devices ?? [],
        partners: result.partners ?? [],
        campaigns: result.campaigns ?? [],
        paths: result.paths ?? [],
        filterOptions: {
          partners: result.filterOptions?.partners ?? [],
          campaigns: result.filterOptions?.campaigns ?? [],
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '유입 분석을 불러오지 못했습니다.');
      setData(empty);
    } finally {
      setLoading(false);
    }
  }, [period, source, ptId, cpId]);

  useEffect(() => {
    load();
  }, [load]);

  const rangeLabel = data.range.dateFrom && data.range.dateTo
    ? `${data.range.dateFrom} ~ ${data.range.dateTo}`
    : '';

  return (
    <AdminLayout
      activeMenu="inflow"
      title="유입 분석"
      description="클릭·접수·승인·도메인·UTM·파트너·상품 기준으로 유입경로를 비교합니다."
    >
      <InsightBanner
        accent="cyan"
        message={
          <>
            최근 {period}일 클릭 <strong>{data.summary.clicks.toLocaleString()}회</strong>, 접수{' '}
            <strong>{data.summary.totalDb.toLocaleString()}건</strong>, 승인{' '}
            <strong>{data.summary.approved.toLocaleString()}건</strong>
          </>
        }
        subMessage={`클릭 대비 접수 ${data.summary.convRate}% · 승인율 ${data.summary.approvalRate}% · 순 방문자 ${data.summary.uniqueVisitors.toLocaleString()}명`}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4 text-slate-700 font-medium">
          <Filter size={18} className="text-cyan-500" />
          필터
          {rangeLabel ? <span className="text-xs font-normal text-slate-400">{rangeLabel}</span> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {PERIODS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`px-4 py-2 text-sm font-medium ${period === option.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {SOURCES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSource(option.value)}
                className={`px-4 py-2 text-sm font-medium ${source === option.value ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <select
            value={ptId || ''}
            onChange={(e) => setPtId(Number(e.target.value) || 0)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white min-w-[200px]"
          >
            <option value="">전체 파트너</option>
            {data.filterOptions.partners.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}{item.code ? ` (${item.code})` : ''}
              </option>
            ))}
          </select>
          <select
            value={cpId || ''}
            onChange={(e) => setCpId(Number(e.target.value) || 0)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white min-w-[220px]"
          >
            <option value="">전체 광고상품</option>
            {data.filterOptions.campaigns.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}{item.code ? ` · ${item.code}` : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-slate-400 mt-3">
          클릭·기기·클릭 유입 도메인은 홍보 링크 클릭 기준입니다. 접수 지표는 선택한 출처(폼/위젯/콜디비)에 맞춰 집계됩니다.
        </p>
      </div>

      {error ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="클릭" value={data.summary.clicks.toLocaleString()} suffix="회" icon={<MousePointerClick className="text-blue-500" />} color="blue" loading={loading} />
        <SummaryCard title="순 방문자" value={data.summary.uniqueVisitors.toLocaleString()} suffix="명" icon={<Users className="text-indigo-500" />} color="indigo" loading={loading} />
        <SummaryCard title="접수" value={data.summary.totalDb.toLocaleString()} suffix="건" icon={<Target className="text-cyan-500" />} color="cyan" loading={loading} />
        <SummaryCard title="승인" value={data.summary.approved.toLocaleString()} suffix="건" icon={<PieChart className="text-emerald-500" />} color="emerald" loading={loading} />
        <SummaryCard title="대기" value={data.summary.pending.toLocaleString()} suffix="건" icon={<Link2 className="text-amber-500" />} color="amber" loading={loading} />
        <SummaryCard title="취소" value={data.summary.rejected.toLocaleString()} suffix="건" icon={<PhoneCall className="text-rose-500" />} color="rose" loading={loading} />
        <SummaryCard title="접수율" value={String(data.summary.convRate)} suffix="%" icon={<Percent className="text-violet-500" />} color="violet" caption="클릭 대비" loading={loading} />
        <SummaryCard title="승인율" value={String(data.summary.approvalRate)} suffix="%" icon={<Percent className="text-emerald-600" />} color="emerald" caption="접수 대비" loading={loading} />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <h3 className="font-bold text-slate-900 mb-4">일별 클릭 · 접수 · 승인</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chart}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => String(value).slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="clicks" name="클릭" stroke="#3b82f6" fill="#dbeafe" />
              <Area type="monotone" dataKey="db" name="접수" stroke="#0891b2" fill="#cffafe" />
              <Area type="monotone" dataKey="approved" name="승인" stroke="#059669" fill="#d1fae5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <RankList title="접수 출처" rows={data.sources} />
        <RankList title="채널" rows={data.channels} />
        <RankList title="접수 리퍼러" hint="상담이 들어온 직전 도메인" rows={data.referrers} />
        <RankList title="접수 페이지" hint="폼이 제출된 페이지 도메인" rows={data.pageHosts} />
        <RankList title="클릭 유입 도메인" hint="홍보 링크를 누른 직전 도메인" rows={data.clickReferrers} countLabel="클릭" />
        <RankList title="기기" hint="홍보 링크 클릭 기준" rows={data.devices} countLabel="클릭" />
        <RankList title="UTM source" rows={data.utmSources} />
        <RankList title="UTM medium" rows={data.utmMediums} />
        <RankList title="UTM campaign" rows={data.utmCampaigns} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <RankList title="파트너별 접수" rows={data.partners} />
        <RankList title="광고상품별 접수" rows={data.campaigns} />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Globe size={18} className="text-cyan-500" />
          <h3 className="font-bold text-slate-900">유입경로 조합</h3>
          <Smartphone size={16} className="text-slate-300 ml-auto" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium">출처</th>
                <th className="px-4 py-3 text-left font-medium">채널</th>
                <th className="px-4 py-3 text-left font-medium">리퍼러</th>
                <th className="px-4 py-3 text-left font-medium">페이지</th>
                <th className="px-4 py-3 text-left font-medium">UTM</th>
                <th className="px-4 py-3 text-right font-medium">접수</th>
                <th className="px-4 py-3 text-right font-medium">승인</th>
                <th className="px-4 py-3 text-right font-medium">승인율</th>
              </tr>
            </thead>
            <tbody>
              {data.paths.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">표시할 유입경로가 없습니다.</td>
                </tr>
              ) : data.paths.map((path, index) => (
                <tr key={`${path.sourceKey}-${path.channel}-${path.refererHost}-${path.pageHost}-${index}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{path.sourceLabel}</td>
                  <td className="px-4 py-3 text-slate-600">{path.channel}</td>
                  <td className="px-4 py-3 text-slate-600">{path.refererHost}</td>
                  <td className="px-4 py-3 text-slate-600">{path.pageHost}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {path.utmSource} / {path.utmMedium} / {path.utmCampaign}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{path.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{path.approved.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{path.approvalRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
