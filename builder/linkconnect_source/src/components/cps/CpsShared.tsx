import React from 'react';
import { Link } from 'react-router-dom';

export const LP_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: '대기', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  expected: { label: '예상', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  review: { label: '정산대기', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  hold: { label: '보류', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: '확정', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  confirmed: { label: '확정', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancel_pending: { label: '취소중', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  canceled: { label: '취소', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  cancelled: { label: '취소', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  unmatched: { label: '미매칭', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  error: { label: '오류', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function LpStatusBadge({ status }: { status: string }) {
  const b = LP_STATUS_BADGE[status] ?? { label: status || '—', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${b.cls}`}>{b.label}</span>
  );
}

export function formatWon(n: number | null | undefined) {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString('ko-KR');
}

export function truncate(s: string, n = 28) {
  const t = (s || '').trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
}

export const CPS_PARTNER_NOTICE = [
  'CPS 실적은 구매 직후 예상 실적으로 표시됩니다.',
  '반품, 취소, 광고주 검수에 따라 실적이 취소될 수 있습니다.',
  '최종 확정된 수익만 출금 가능합니다.',
  '링크프라이스 최종 정산 금액에 따라 예상수익이 변경될 수 있습니다.',
  '광고주별 광고 제한사항을 위반하면 실적이 취소될 수 있습니다.',
];

export function CpsPartnerNotice() {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-900 space-y-1.5">
      <div className="font-bold text-emerald-800 mb-1">CPS 수익 안내</div>
      <ul className="list-disc pl-5 space-y-1 text-emerald-800/90">
        {CPS_PARTNER_NOTICE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export const ADMIN_CPS_TABS = [
  { id: 'setup', label: '운영 시작', path: '/admin/cps/setup' },
  { id: 'e2e', label: 'E2E 검증', path: '/admin/cps/e2e' },
  { id: 'settings', label: '링크프라이스 설정', path: '/admin/cps/settings' },
  { id: 'merchants', label: 'CPS 광고주', path: '/admin/cps/merchants' },
  { id: 'clicks', label: '클릭 통계', path: '/admin/cps/clicks' },
  { id: 'orders', label: '실적 관리', path: '/admin/cps/orders' },
  { id: 'unmatched', label: '미매칭', path: '/admin/cps/unmatched' },
  { id: 'postbacks', label: 'POSTBACK', path: '/admin/cps/postbacks' },
  { id: 'sync', label: '동기화 로그', path: '/admin/cps/sync-logs' },
  { id: 'rates', label: '수익 설정', path: '/admin/cps/rates' },
  { id: 'settlements', label: '정산 내역', path: '/admin/cps/settlements' },
] as const;

export function AdminCpsSubnav({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {ADMIN_CPS_TABS.map((t) => (
        <Link
          key={t.id}
          to={t.path}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
            active === t.id
              ? 'bg-cyan-600 text-white border-cyan-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-300'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export const PARTNER_CPS_TABS = [
  { id: 'merchants', label: 'CPS 광고주', path: '/partner/cps' },
  { id: 'links', label: '내 홍보링크', path: '/partner/cps/links' },
  { id: 'clicks', label: '클릭 현황', path: '/partner/cps/clicks' },
  { id: 'orders', label: 'CPS 실적', path: '/partner/cps/orders' },
  { id: 'earnings', label: '수익 현황', path: '/partner/cps/earnings' },
] as const;

export function PartnerCpsSubnav({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {PARTNER_CPS_TABS.map((t) => (
        <Link
          key={t.id}
          to={t.path}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
            active === t.id
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
