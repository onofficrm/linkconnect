import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { SummaryCard, StatusBadge } from '../../components/admin/AdminShared';
import { Database, Download, Trash2 } from 'lucide-react';
import { AdminConversion, fetchAdminConversions, resetAdminConversions } from '../../lib/api';
import { isLcSuperAdmin } from '../../lib/auth';

export function AdminConversions() {
  const [rows, setRows] = useState<AdminConversion[]>([]);
  const [summary, setSummary] = useState({ todayReceived: 0, approved: 0, rejected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const isSuperAdmin = isLcSuperAdmin();

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminConversions()
      .then((data) => {
        setRows(data.items);
        setSummary(data.summary);
      })
      .catch(() => {
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleReset = async () => {
    if (!isSuperAdmin) return;
    if (!window.confirm('전체 디비 목록을 모두 삭제(초기화)할까요? 이 작업은 되돌릴 수 없습니다.')) return;
    const confirm = window.prompt('계속하려면 "초기화"를 입력하세요');
    if (confirm !== '초기화') return;
    setResetting(true);
    try {
      const result = await resetAdminConversions('초기화');
      alert(result.message);
      load();
    } catch (error) {
      alert(error instanceof Error ? error.message : '초기화에 실패했습니다.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout activeMenu="db" title="전체 디비 관리" description="전체 접수·승인·취소 디비와 수익 분배를 조회합니다.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="오늘 접수" value={String(summary.todayReceived)} suffix="건" />
        <SummaryCard title="승인 완료" value={String(summary.approved)} suffix="건" color="emerald" highlight />
        <SummaryCard title="취소/무효" value={String(summary.rejected)} suffix="건" color="red" />
        <SummaryCard title="검수 대기" value={String(summary.pending)} suffix="건" color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database size={20} className="text-cyan-500" />
            전체 디비 목록
          </h2>
          <div className="flex items-center gap-2">
            {isSuperAdmin ? (
              <button
                type="button"
                disabled={resetting}
                onClick={() => void handleReset()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={16} />
                {resetting ? '초기화 중...' : '목록 초기화'}
              </button>
            ) : null}
            <button type="button" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Download size={16} />
              엑셀 다운로드
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">DB ID</th>
                <th className="px-4 py-3 text-left">접수일</th>
                <th className="px-4 py-3 text-left">고객</th>
                <th className="px-4 py-3 text-left">파트너</th>
                <th className="px-4 py-3 text-left">광고주</th>
                <th className="px-4 py-3 text-left">상품</th>
                <th className="px-4 py-3 text-left">상태</th>
                <th className="px-4 py-3 text-right">단가</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">불러오는 중...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">등록된 디비가 없습니다.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.id}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.customer}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.partner}</td>
                    <td className="px-4 py-3 text-slate-700">{row.advertiser}</td>
                    <td className="px-4 py-3 text-slate-700">{row.campaign}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 text-right tabular-nums text-cyan-600 font-semibold">
                      {row.price > 0 ? `${row.price.toLocaleString()}원` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
