import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { SummaryCard } from '../../components/admin/AdminShared';
import {
  fetchAdminContractDetail,
  fetchAdminContracts,
  updateAdminContractStatus,
  type AdminContractDetail,
  type AdminContractListItem,
  type AdminContractSummary,
} from '../../lib/api';
import { FileText, Search, ExternalLink, FileDown, X, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const emptySummary: AdminContractSummary = {
  total: 0,
  signed: 0,
  pending: 0,
  inProgress: 0,
  cancelled: 0,
  expired: 0,
  renewal: 0,
};

const STATUS_OPTIONS = [
  ['', '전체'],
  ['unsigned', '미체결'],
  ['pending', '대기'],
  ['in_progress', '작성 중'],
  ['signed', '체결 완료'],
  ['cancelled', '취소'],
  ['expired', '만료'],
  ['renewal', '재계약 필요'],
] as const;

export function AdminContracts() {
  const [items, setItems] = useState<AdminContractListItem[]>([]);
  const [summary, setSummary] = useState<AdminContractSummary>(emptySummary);
  const [currentVersion, setCurrentVersion] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminContractDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [versionFilter, setVersionFilter] = useState('');
  const [signedFrom, setSignedFrom] = useState('');
  const [signedTo, setSignedTo] = useState('');
  const [mtIdFilter, setMtIdFilter] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminContracts({
        q: searchQuery,
        status: statusFilter,
        version: versionFilter,
        mtId: mtIdFilter ? Number(mtIdFilter) : undefined,
        signedFrom,
        signedTo,
      });
      setItems(data.items);
      setSummary(data.summary);
      setCurrentVersion(data.currentVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : '계약 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, versionFilter, mtIdFilter, signedFrom, signedTo]);

  const loadDetail = useCallback(async (mcId: number) => {
    setDetailLoading(true);
    setError('');
    try {
      const data = await fetchAdminContractDetail(mcId);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '계약 상세를 불러오지 못했습니다.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId, loadDetail]);

  const handleStatusAction = async (action: 'cancel' | 'expire' | 'requireRenewal') => {
    if (!selectedId || !statusReason.trim()) {
      setError('상태 변경 사유를 입력해 주세요.');
      return;
    }
    if (!window.confirm('계약 상태를 변경하시겠습니까? 체결 내용은 수정되지 않습니다.')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await updateAdminContractStatus({
        mcId: selectedId,
        action,
        reason: statusReason.trim(),
      });
      setDetail(result.detail);
      setStatusReason('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeMenu="contracts" title="광고주 계약 관리" description="광고주 CPA 계약서 체결 현황을 조회하고 상태를 관리합니다.">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <SummaryCard title="전체" value={summary.total.toLocaleString()} suffix="건" icon={<FileText size={18} />} />
        <SummaryCard title="체결" value={summary.signed.toLocaleString()} suffix="건" color="emerald" icon={<CheckCircle2 size={18} />} />
        <SummaryCard title="미체결" value={summary.pending.toLocaleString()} suffix="건" color="yellow" icon={<Clock size={18} />} />
        <SummaryCard title="작성 중" value={summary.inProgress.toLocaleString()} suffix="건" icon={<Clock size={18} />} />
        <SummaryCard title="취소" value={summary.cancelled.toLocaleString()} suffix="건" color="red" icon={<AlertTriangle size={18} />} />
        <SummaryCard title="만료" value={summary.expired.toLocaleString()} suffix="건" />
        <SummaryCard title="재계약" value={summary.renewal.toLocaleString()} suffix="건" color="orange" />
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="회사명, 대표, 사업자번호, 담당자, 계약번호, 광고주 ID"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm">
                {STATUS_OPTIONS.map(([value, label]) => (
                  <option key={value || 'all'} value={value}>{label}</option>
                ))}
              </select>
              <input
                value={versionFilter}
                onChange={(e) => setVersionFilter(e.target.value)}
                placeholder={`버전 (예: ${currentVersion || 'CPA-CONTRACT-2026-01'})`}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
              <input value={mtIdFilter} onChange={(e) => setMtIdFilter(e.target.value)} placeholder="광고주 ID" className="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
              <input type="date" value={signedFrom} onChange={(e) => setSignedFrom(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
              <input type="date" value={signedTo} onChange={(e) => setSignedTo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm col-span-2" />
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <p className="p-6 text-sm text-slate-500">불러오는 중...</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">계약 데이터가 없습니다.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedId === item.id ? 'bg-cyan-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.companyName || '(회사명 없음)'}</p>
                      <p className="text-xs text-slate-500 mt-1">광고주 #{item.advertiserId} · {item.contractVersion}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{item.contractCode || '-'}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">{item.statusLabel}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {!selectedItem ? (
            <div className="p-10 text-center text-slate-500 text-sm">목록에서 계약을 선택하세요.</div>
          ) : detailLoading || !detail ? (
            <div className="p-10 text-center text-slate-500 text-sm">{detailLoading ? '상세 불러오는 중...' : '상세 정보 없음'}</div>
          ) : (
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{detail.contract.companyName}</h2>
                  <p className="text-sm text-slate-500">광고주 #{detail.listItem.advertiserId} · {detail.contract.contractVersion}</p>
                  <p className="text-sm font-mono text-slate-700 mt-1">{detail.contract.contractCode}</p>
                </div>
                <button type="button" onClick={() => setSelectedId(null)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <a href={detail.documentPreviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm">
                    <ExternalLink size={16} /> HTML 미리보기
                  </a>
                  {detail.contract.isFullySigned ? (
                    <a href={detail.documentPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm">
                      <FileDown size={16} /> PDF 다운로드
                    </a>
                  ) : null}
                </div>

                <section>
                  <h3 className="font-bold text-slate-900 mb-3">회사정보 비교</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left">항목</th>
                          <th className="px-3 py-2 text-left">계약 당시</th>
                          <th className="px-3 py-2 text-left">현재</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(
                          [
                            ['companyName', '회사명'],
                            ['representativeName', '대표자명'],
                            ['businessNumber', '사업자등록번호'],
                            ['companyAddress', '사업장 주소'],
                            ['companyPhone', '회사 연락처'],
                          ] as const
                        ).map(([key, label]) => {
                          const row = detail.companyCompare[key];
                          if (!row) return null;
                          return (
                          <tr key={key} className={row.changed ? 'bg-amber-50' : ''}>
                            <td className="px-3 py-2 border-t border-slate-100">{label}</td>
                            <td className="px-3 py-2 border-t border-slate-100">{row.contract || '-'}</td>
                            <td className="px-3 py-2 border-t border-slate-100">{row.current || '-'}</td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Info label="계약 담당자" value={`${detail.contract.signerName} (${detail.contract.signerPosition})`} />
                  <Info label="체결일시" value={detail.contract.signedAt} />
                  <Info label="체결 IP" value={detail.contract.signedIp} />
                  <Info label="PDF 해시" value={detail.contract.pdfHashMasked} />
                  <Info label="User-Agent" value={detail.contract.userAgent} />
                  <Info label="등록일" value={detail.contract.createdAt} />
                </section>

                {detail.signatureUrl ? (
                  <section>
                    <h3 className="font-bold text-slate-900 mb-2">서명 이미지</h3>
                    <img src={detail.signatureUrl} alt="서명" className="max-h-28 border rounded-lg bg-white p-2" />
                  </section>
                ) : null}

                {detail.history.length > 1 ? (
                  <section>
                    <h3 className="font-bold text-slate-900 mb-2">광고주 계약 이력</h3>
                    <ul className="text-sm space-y-1">
                      {detail.history.map((h) => (
                        <li key={h.id} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                          <span>{h.contractVersion} · {h.contractCode || '-'}</span>
                          <span className="text-slate-500">{h.statusLabel} · {h.signedAt || h.createdAt}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section>
                  <h3 className="font-bold text-slate-900 mb-2">상태 변경 (사유 필수)</h3>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="상태 변경 사유를 입력하세요."
                    className="w-full min-h-[80px] px-3 py-2 border border-slate-200 rounded-xl text-sm mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={saving} onClick={() => handleStatusAction('cancel')} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
                      계약 취소
                    </button>
                    <button type="button" disabled={saving} onClick={() => handleStatusAction('expire')} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold disabled:opacity-50">
                      계약 만료
                    </button>
                    <button type="button" disabled={saving} onClick={() => handleStatusAction('requireRenewal')} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold disabled:opacity-50">
                      재계약 필요
                    </button>
                  </div>
                </section>

                {detail.statusLogs.length > 0 ? (
                  <section>
                    <h3 className="font-bold text-slate-900 mb-2">상태 변경 감사 로그</h3>
                    <ul className="text-xs space-y-2">
                      {detail.statusLogs.map((log) => (
                        <li key={log.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                          <p><strong>{log.oldLabel}</strong> → <strong>{log.newLabel}</strong> · {log.createdAt}</p>
                          <p className="text-slate-600 mt-1">관리자: {log.adminId || '-'} · IP: {log.ip}</p>
                          <p className="text-slate-700 mt-1">사유: {log.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section>
                  <h3 className="font-bold text-slate-900 mb-2">계약서 HTML 스냅샷</h3>
                  <div className="border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto text-sm bg-slate-50" dangerouslySetInnerHTML={{ __html: detail.contract.contractHtml }} />
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900 mt-1 break-all">{value || '-'}</dd>
    </div>
  );
}
