import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdvertiserLayout } from '../../layouts/AdvertiserLayout';
import { SummaryCard, StatusBadge } from '../../components/advertiser/AdvertiserShared';
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Users, Link2, MousePointerClick, Target, CheckCircle2, Percent,
  Filter, TrendingUp, Megaphone, Lightbulb, BarChart3,
} from 'lucide-react';
import {
  fetchMerchantMarketing,
  MerchantMarketingFilters,
  MerchantMarketingResponse,
} from '../../lib/api';
import {
  InsightBanner,
  SkeletonCardGrid,
  SkeletonChart,
  DataTableEmpty,
  RankBadge,
  ProgressBar,
  tableRowClass,
  TableSection,
} from '../../components/center-ui';

const emptyData: MerchantMarketingResponse = {
  summary: {
    activePartners: 0,
    promoLinks: 0,
    totalClicks: 0,
    uniqueVisitors: 0,
    totalDb: 0,
    approvedDb: 0,
    rejectedDb: 0,
    convRate: 0,
    approvalRate: 0,
    activeCampaigns: 0,
  },
  range: { dateFrom: '', dateTo: '', period: 30 },
  funnel: { links: 0, clicks: 0, received: 0, approved: 0 },
  chart: [],
  campaigns: [],
  partners: [],
  channels: [],
  filterOptions: { campaigns: [] },
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

export function AdvertiserMarketing() {
  const [data, setData] = useState<MerchantMarketingResponse>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [cpId, setCpId] = useState(0);

  const loadData = useCallback(async (filters: MerchantMarketingFilters) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchMerchantMarketing(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '마케팅 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({ period, cpId: cpId || undefined });
  }, [period, cpId, loadData]);

  const rangeLabel = useMemo(() => {
    if (data.range.dateFrom && data.range.dateTo) {
      return `${data.range.dateFrom} ~ ${data.range.dateTo}`;
    }
    return '';
  }, [data.range.dateFrom, data.range.dateTo]);

  const inactiveCampaigns = data.campaigns.filter((c) => !c.isActive);

  return (
    <AdvertiserLayout activeMenu="marketing" title="마케팅 성과">
      <InsightBanner
        accent="cyan"
        message={
          <>
            최근 {period}일간 <strong>{data.summary.activePartners}명</strong>의 파트너가{' '}
            <strong>{data.summary.promoLinks}개</strong> 링크로 <strong>{data.summary.totalClicks.toLocaleString()}회</strong> 클릭을 만들었습니다.
          </>
        }
        subMessage={`DB 전환율 ${data.summary.convRate}% · 승인율 ${data.summary.approvalRate}%`}
        actions={[
          { label: '내 광고상품', to: '/advertiser/campaigns' },
          { label: '성과 리포트', to: '/advertiser/reports', variant: 'secondary' },
        ]}
      />

      <div className="flex flex-col gap-4 mb-8 -mt-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <p className="text-slate-500">
            파트너들이 내 상품을 얼마나 홍보하고 있는지, 클릭·DB 전환 흐름을 확인하세요.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-medium">
            <Filter size={18} className="text-cyan-500" />
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
              value={cpId || ''}
              onChange={(e) => setCpId(Number(e.target.value) || 0)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white min-w-[220px]"
            >
              <option value="">전체 광고상품</option>
              {data.filterOptions.campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <>
          <SkeletonCardGrid count={5} />
          <div className="mt-8"><SkeletonChart /></div>
        </>
      ) : (
      <>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <SummaryCard title="활동 파트너" value={data.summary.activePartners.toLocaleString()} suffix="명" icon={<Users className="text-indigo-500" />} highlight color="cyan" caption="홍보 참여" />
        <SummaryCard title="홍보 링크" value={data.summary.promoLinks.toLocaleString()} suffix="개" icon={<Link2 className="text-violet-500" />} />
        <SummaryCard title="총 클릭" value={data.summary.totalClicks.toLocaleString()} suffix="회" icon={<MousePointerClick className="text-blue-500" />} />
        <SummaryCard title="순 방문자" value={data.summary.uniqueVisitors.toLocaleString()} suffix="명" icon={<Users className="text-slate-500" />} />
        <SummaryCard title="DB 전환율" value={String(data.summary.convRate)} suffix="%" icon={<Percent className="text-purple-500" />} color="cyan" highlight />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="접수 DB" value={data.summary.totalDb.toLocaleString()} suffix="건" icon={<Target className="text-cyan-500" />} />
        <SummaryCard title="승인 DB" value={data.summary.approvedDb.toLocaleString()} suffix="건" icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" highlight />
        <SummaryCard title="승인율" value={String(data.summary.approvalRate)} suffix="%" icon={<Percent className="text-emerald-500" />} />
        <SummaryCard title="홍보 중 상품" value={data.summary.activeCampaigns.toLocaleString()} suffix="개" icon={<Megaphone className="text-amber-500" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-cyan-500" />
            홍보 퍼널
          </h2>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { label: '홍보 링크', value: data.funnel.links, rate: null },
              { label: '클릭', value: data.funnel.clicks, rate: funnelRate(data.funnel.clicks, data.funnel.links) },
              { label: 'DB 접수', value: data.funnel.received, rate: funnelRate(data.funnel.received, data.funnel.clicks) },
              { label: '승인', value: data.funnel.approved, rate: funnelRate(data.funnel.approved, data.funnel.received) },
            ].map((step) => (
              <div key={step.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500 mb-1">{step.label}</div>
                <div className="text-2xl font-bold text-slate-900">{step.value.toLocaleString()}</div>
                {step.rate && <div className="text-xs text-cyan-600 mt-2">전환 {step.rate}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-yellow-500" />
            채널 TOP
          </h2>
          <div className="space-y-3">
            {data.channels.length === 0 ? (
              <p className="text-sm text-slate-500">채널 데이터가 없습니다.</p>
            ) : data.channels.map((item) => (
              <div key={item.channel}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 truncate pr-2">{item.channel}</span>
                  <span className="text-slate-500">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
                <div className="text-xs text-slate-400 mt-1">DB {item.dbCount} · 승인 {item.approved}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">클릭 · DB 추이</h2>
        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500">불러오는 중...</div>
          ) : data.chart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">데이터 없음</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mktClick" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="mktDb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="click" stroke="#3b82f6" fill="url(#mktClick)" strokeWidth={2} name="클릭" />
                <Area type="monotone" dataKey="db" stroke="#06b6d4" fill="url(#mktDb)" strokeWidth={2} name="DB" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {inactiveCampaigns.length > 0 && !cpId && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>{inactiveCampaigns.length}개 상품</b>은 선택 기간에 파트너 홍보 활동(클릭·DB)이 없습니다. 상품 매력도·단가를 점검해 보세요.
        </div>
      )}

      <TableSection title="상품별 홍보 현황" icon={<TrendingUp size={20} className="text-cyan-500" />} className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">광고상품</th>
                <th className="px-5 py-4 text-center">파트너</th>
                <th className="px-5 py-4 text-center">링크</th>
                <th className="px-5 py-4 text-center">클릭</th>
                <th className="px-5 py-4 text-center">DB</th>
                <th className="px-5 py-4 text-center">승인</th>
                <th className="px-5 py-4 text-center">전환율</th>
                <th className="px-5 py-4 text-center">승인율</th>
                <th className="px-5 py-4 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.campaigns.length === 0 ? (
                <DataTableEmpty colSpan={9} title="홍보 데이터가 없습니다" description="파트너 홍보가 시작되면 상품별 성과가 표시됩니다." actionLabel="광고상품 관리" actionTo="/advertiser/campaigns" />
              ) : data.campaigns.map((row, index) => (
                <tr key={row.id} className={`${tableRowClass(index < 3 && row.isActive ? index + 1 : undefined)} ${!row.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {row.isActive && index < 3 ? <RankBadge rank={index + 1} /> : null}
                    {row.name}
                  </td>
                  <td className="px-5 py-4 text-center">{row.partnerCount}</td>
                  <td className="px-5 py-4 text-center">{row.linkCount}</td>
                  <td className="px-5 py-4 text-center font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="px-5 py-4 text-center">{row.dbCount}</td>
                  <td className="px-5 py-4 text-center text-emerald-600 font-bold">{row.approved}</td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>{row.convRate}%</span>
                      <ProgressBar value={row.convRate} accent="cyan" showLabel={false} size="sm" />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">{row.approvalRate}%</td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status={row.isActive ? row.status : '홍보없음'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableSection>

      <TableSection title="파트너별 홍보 기여 TOP" icon={<Users size={20} className="text-indigo-500" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">파트너</th>
                <th className="px-5 py-4 text-center">홍보 상품</th>
                <th className="px-5 py-4 text-center">링크</th>
                <th className="px-5 py-4 text-center">클릭</th>
                <th className="px-5 py-4 text-center">DB</th>
                <th className="px-5 py-4 text-center">승인</th>
                <th className="px-5 py-4 text-center">전환율</th>
                <th className="px-5 py-4">최근 활동</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.partners.length === 0 ? (
                <DataTableEmpty colSpan={8} title="활동 중인 파트너가 없습니다" description="파트너가 상품을 홍보하기 시작하면 기여도 순위가 표시됩니다." />
              ) : data.partners.map((row, index) => (
                <tr key={row.id} className={tableRowClass(index + 1)}>
                  <td className="px-5 py-4">
                    <RankBadge rank={index + 1} />
                    <div className="font-bold text-slate-900 inline">{row.code}</div>
                    {row.name !== row.code && <div className="text-xs text-slate-500">{row.name}</div>}
                  </td>
                  <td className="px-5 py-4 text-center">{row.campaignCount}</td>
                  <td className="px-5 py-4 text-center">{row.linkCount}</td>
                  <td className="px-5 py-4 text-center font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="px-5 py-4 text-center">{row.dbCount}</td>
                  <td className="px-5 py-4 text-center text-emerald-600 font-bold">{row.approved}</td>
                  <td className="px-5 py-4 text-center">{row.convRate}%</td>
                  <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{row.lastActivity ? row.lastActivity.slice(0, 16) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableSection>
      </>
      )}
    </AdvertiserLayout>
  );
}
