import { BarChart3, CheckCircle2, Clock, TrendingUp, Wallet } from 'lucide-react';
import { SummaryCard } from '../../components/partner/PartnerShared';
import { PartnerLayout } from '../../layouts/PartnerLayout';

const monthlyRevenue = [
  { month: '5월', value: 55 },
  { month: '6월', value: 68 },
  { month: '7월', value: 72 },
  { month: '8월', value: 80 },
  { month: '9월', value: 88 },
  { month: '10월', value: 95 },
];

const topCampaigns = [
  { campaign: '개인회생 상담 DB', dbs: 58, revenue: 1740000 },
  { campaign: '소상공인 대출 상담', dbs: 30, revenue: 960000 },
  { campaign: '자동차 렌트 상담', dbs: 22, revenue: 550000 },
  { campaign: '어린이 영어캠프', dbs: 15, revenue: 525000 },
  { campaign: '임플란트 상담', dbs: 8, revenue: 320000 },
];

const breakdown = [
  { label: '승인완료 수익', value: '8,430,000원', pct: 92 },
  { label: '검수중 예상', value: '690,000원', pct: 8 },
  { label: '취소/무효 차감', value: '-690,000원', pct: 0 },
];

export function PartnerReport() {
  return (
    <PartnerLayout activeMenu="report" title="수익 리포트">
      <p className="text-slate-500 mb-8 -mt-2">
        예상·확정 수익과 정산 가능 금액을 확인하세요.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="예상 수익" value="9,120,000" suffix="원" icon={<Clock className="text-amber-500" />} />
        <SummaryCard title="확정 수익" value="8,430,000" suffix="원" icon={<CheckCircle2 className="text-emerald-500" />} highlight />
        <SummaryCard title="정산 가능" value="6,200,000" suffix="원" icon={<Wallet className="text-cyan-500" />} highlight />
        <SummaryCard title="이번 달 성장" value="+12.4" suffix="%" icon={<TrendingUp className="text-purple-500" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-500" />
            월별 수익 추이
          </h2>
          <div className="flex items-end gap-3 h-40 mb-4">
            {monthlyRevenue.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-emerald-500/80"
                  style={{ height: `${item.value}%` }}
                />
                <span className="text-xs text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">수익 구성</h2>
          <div className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
                {item.pct > 0 && (
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">캠페인별 수익 TOP 5</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">캠페인</th>
                <th className="px-6 py-3 text-left font-medium">승인 DB</th>
                <th className="px-6 py-3 text-right font-medium">확정수익</th>
              </tr>
            </thead>
            <tbody>
              {topCampaigns.map((row) => (
                <tr key={row.campaign} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.campaign}</td>
                  <td className="px-6 py-4 text-slate-600">{row.dbs}건</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    {row.revenue.toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PartnerLayout>
  );
}
