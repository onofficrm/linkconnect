import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Phone, PhoneCall, PhoneIncoming, Plus, Settings2, PlayCircle, Lock, Check, X, Upload, Info } from 'lucide-react';
import {
  CallLog,
  CallNumber,
  CallRequest,
  AdminCampaign,
  AdminPartner,
  assignAdminCallDirect,
  assignAdminCallRequest,
  createAdminCallNumber,
  fetchAdminCallLogs,
  fetchAdminCallNumbers,
  fetchAdminCallRecording,
  fetchAdminCallRequests,
  fetchAdminCallSettings,
  fetchAdminCampaigns,
  fetchAdminPartners,
  finalizeAdminConversion,
  importAdminCallLogs,
  provisionAdminCallNumber,
  rejectAdminCallRequest,
  revokeAdminCallRequest,
  saveAdminCallSettings,
  updateAdminCallNumber,
} from '../../lib/api';

type Tab = 'numbers' | 'requests' | 'logs';

const numberStatusLabel: Record<string, { label: string; cls: string }> = {
  available: { label: '사용가능', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  assigned: { label: '배정됨', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  paused: { label: '일시중지', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  released: { label: '해지', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const reqStatusLabel: Record<string, { label: string; cls: string }> = {
  pending: { label: '대기', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  assigned: { label: '배정완료', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: '반려', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  revoked: { label: '회수', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const resultLabel: Record<string, { label: string; cls: string }> = {
  success: { label: '통화성공', cls: 'text-emerald-600' },
  missed: { label: '부재중', cls: 'text-amber-600' },
  busy: { label: '통화중', cls: 'text-slate-500' },
  fail: { label: '실패', cls: 'text-rose-600' },
};

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AdminCallDb() {
  const [tab, setTab] = useState<Tab>('requests');
  const [numbers, setNumbers] = useState<CallNumber[]>([]);
  const [requests, setRequests] = useState<CallRequest[]>([]);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // 번호 추가
  const [newNumber, setNewNumber] = useState('');
  const [newMemo, setNewMemo] = useState('');

  // 배정 모달
  const [assignTarget, setAssignTarget] = useState<CallRequest | null>(null);
  const [assignCn, setAssignCn] = useState('');

  // 직접 배정
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [directPt, setDirectPt] = useState('');
  const [directCp, setDirectCp] = useState('');
  const [directCn, setDirectCn] = useState('');
  const [directMemo, setDirectMemo] = useState('');

  // 통화 엑셀 업로드
  const [importFile, setImportFile] = useState<File | null>(null);
  const [skipConversionOnImport, setSkipConversionOnImport] = useState(true);
  const [importResult, setImportResult] = useState('');
  // 콜 설정 모달
  const [settingsCp, setSettingsCp] = useState<{ cpId: number; name: string } | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<Record<string, unknown>>({});

  const loadAll = useCallback(() => {
    fetchAdminCallNumbers().then((d) => setNumbers(d.items)).catch(() => setNumbers([]));
    fetchAdminCallRequests().then((d) => setRequests(d.items)).catch(() => setRequests([]));
    fetchAdminCallLogs().then((d) => setLogs(d.items)).catch(() => setLogs([]));
  }, []);

  useEffect(() => {
    loadAll();
    fetchAdminPartners({ status: 'active' }).then((d) => setPartners(d.items)).catch(() => setPartners([]));
    fetchAdminCampaigns({ status: 'active' }).then((d) => setCampaigns(d.items)).catch(() => setCampaigns([]));
  }, [loadAll]);

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddNumber = async () => {
    if (!newNumber.trim()) return;
    setBusy(true);
    try {
      const res = await createAdminCallNumber({ number: newNumber, memo: newMemo });
      notify(res.message);
      setNewNumber('');
      setNewMemo('');
      loadAll();
    } catch (e) {
      notify(e instanceof Error ? e.message : '등록 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleProvision = async () => {
    setBusy(true);
    try {
      const res = await provisionAdminCallNumber();
      notify(res.message);
      loadAll();
    } catch (e) {
      notify(e instanceof Error ? e.message : '자동 발급 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleNumberStatus = async (cnId: number, status: string) => {
    await updateAdminCallNumber({ cnId, status });
    loadAll();
  };

  const openAssign = (req: CallRequest) => {
    setAssignTarget(req);
    setAssignCn('');
  };

  const handleAssign = async () => {
    if (!assignTarget || !assignCn) return;
    setBusy(true);
    try {
      const res = await assignAdminCallRequest({ carId: assignTarget.carId, cnId: Number(assignCn) });
      notify(res.message);
      setAssignTarget(null);
      loadAll();
    } catch (e) {
      notify(e instanceof Error ? e.message : '배정 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (req: CallRequest) => {
    await rejectAdminCallRequest({ carId: req.carId });
    loadAll();
  };

  const handleRevoke = async (req: CallRequest) => {
    await revokeAdminCallRequest({ carId: req.carId });
    loadAll();
  };

  const handleDirectAssign = async () => {
    if (!directPt || !directCp || !directCn) return;
    setBusy(true);
    try {
      const res = await assignAdminCallDirect({
        ptId: Number(directPt),
        cpId: Number(directCp),
        cnId: Number(directCn),
        adminMemo: directMemo,
      });
      notify(res.message);
      setDirectPt('');
      setDirectCp('');
      setDirectCn('');
      setDirectMemo('');
      loadAll();
    } catch (e) {
      notify(e instanceof Error ? e.message : '직접 배정 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleImportLogs = async () => {
    if (!importFile) return;
    setBusy(true);
    setImportResult('');
    try {
      const res = await importAdminCallLogs({
        file: importFile,
        skipConversion: skipConversionOnImport,
      });
      setImportResult(res.message);
      notify(res.message);
      setImportFile(null);
      loadAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '업로드 실패';
      setImportResult(msg);
      notify(msg);
    } finally {
      setBusy(false);
    }
  };

  const openSettings = async (cpId: number, name: string) => {
    setSettingsCp({ cpId, name });
    try {
      const res = await fetchAdminCallSettings(cpId);
      setSettingsDraft(res.settings ?? {});
    } catch {
      setSettingsDraft({});
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsCp) return;
    setBusy(true);
    try {
      const res = await saveAdminCallSettings({
        cpId: settingsCp.cpId,
        adminEnabled: !!settingsDraft.cs_admin_enabled,
        recordingMode: String(settingsDraft.cs_recording_mode ?? 'normal'),
        coloring: String(settingsDraft.cs_coloring ?? ''),
        callMent: String(settingsDraft.cs_call_ment ?? ''),
        businessStart: String(settingsDraft.cs_business_start ?? '00:00'),
        businessEnd: String(settingsDraft.cs_business_end ?? '23:59'),
        holidayWeeks: String(settingsDraft.cs_holiday_weeks ?? ''),
        holidayDays: String(settingsDraft.cs_holiday_days ?? ''),
        price: Number(settingsDraft.cs_price ?? 0),
        minDuration: Number(settingsDraft.cs_min_duration ?? 0),
        memo: String(settingsDraft.cs_memo ?? ''),
      });
      notify(res.message);
      setSettingsCp(null);
    } catch (e) {
      notify(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  };

  const playRecording = async (clogId: number) => {
    try {
      const res = await fetchAdminCallRecording(clogId);
      window.open(res.url, '_blank', 'noopener');
    } catch (e) {
      notify(e instanceof Error ? e.message : '녹취를 불러올 수 없습니다.');
    }
  };

  const handleFinal = async (cvId: number, finalAction: 'approve' | 'reject' | 'lock') => {
    if (cvId <= 0) return;
    await finalizeAdminConversion({ cvId, finalAction });
    notify('최종확정 처리되었습니다.');
    loadAll();
  };

  const availableNumbers = numbers.filter((n) => n.status === 'available');
  const setDraft = (k: string, v: unknown) => setSettingsDraft((p) => ({ ...p, [k]: v }));

  return (
    <AdminLayout activeMenu="call" title="콜디비 관리" description="API 연동 전 수동 운영 · 가상번호 등록/배정 · 통화 엑셀 업로드">
      <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold mb-1">수동 운영 모드 (API 연동 전)</div>
            <ol className="list-decimal pl-5 space-y-1 text-amber-900/90">
              <li>가상번호 풀에 콜업체에서 받은 번호를 <b>수동 등록</b>합니다.</li>
              <li>파트너·캠페인에 번호를 <b>직접 배정</b>합니다. (파트너 신청 없이도 가능)</li>
              <li>콜업체 통화내역 엑셀/CSV를 업로드하면 <b>가상번호 기준</b>으로 파트너·광고주 화면에 표시됩니다.</li>
            </ol>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-xl text-sm font-medium">{message}</div>
      )}

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          ['requests', '번호 신청', <PhoneCall size={16} key="r" />],
          ['numbers', '가상번호 풀', <Phone size={16} key="n" />],
          ['logs', '통화 로그', <PhoneIncoming size={16} key="l" />],
        ] as Array<[Tab, string, React.ReactNode]>).map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${tab === id ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* 번호 신청 */}
      {tab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 font-bold text-slate-800">파트너 가상번호 신청</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3">신청일</th>
                  <th className="px-4 py-3">파트너</th>
                  <th className="px-4 py-3">캠페인</th>
                  <th className="px-4 py-3">배정번호</th>
                  <th className="px-4 py-3 text-center">상태</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">신청 내역이 없습니다.</td></tr>
                ) : requests.map((r) => {
                  const s = reqStatusLabel[r.status] ?? { label: r.status, cls: 'bg-slate-100 text-slate-500 border-slate-200' };
                  return (
                    <tr key={r.carId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.createdAt}</td>
                      <td className="px-4 py-3 font-medium">{r.partner || `#${r.ptId}`}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => openSettings(r.cpId, r.campaign)} className="inline-flex items-center gap-1 text-slate-700 hover:text-cyan-600">
                          {r.campaign}
                          <Settings2 size={13} className="text-slate-400" />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-cyan-600">{r.virtualNumber || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {r.status === 'pending' && (
                            <>
                              <button type="button" onClick={() => openAssign(r)} className="px-2.5 py-1 text-xs font-bold bg-cyan-50 text-cyan-700 rounded-lg">번호배정</button>
                              <button type="button" onClick={() => handleReject(r)} className="px-2.5 py-1 text-xs font-bold bg-slate-50 rounded-lg">반려</button>
                            </>
                          )}
                          {r.status === 'assigned' && (
                            <button type="button" onClick={() => handleRevoke(r)} className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 rounded-lg">번호회수</button>
                          )}
                          {(r.status === 'rejected' || r.status === 'revoked') && <span className="text-xs text-slate-400">완료</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 가상번호 풀 */}
      {tab === 'numbers' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="font-bold text-slate-800 mb-1">가상번호 수동 등록</div>
            <p className="text-xs text-slate-500 mb-3">콜업체 API 연동 전까지 관리자가 직접 050 가상번호를 입력해 풀에 등록합니다.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} placeholder="가상번호 (예: 0507xxxxxxx)"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono" />
              <input type="text" value={newMemo} onChange={(e) => setNewMemo(e.target.value)} placeholder="메모 (선택)"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <button type="button" onClick={handleAddNumber} disabled={busy} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                <Plus size={16} /> 수동 등록
              </button>
              <button type="button" onClick={handleProvision} disabled={busy} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm disabled:opacity-50 whitespace-nowrap">
                <PhoneCall size={16} /> API 자동발급
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-cyan-200 shadow-sm p-5">
            <div className="font-bold text-slate-800 mb-1">파트너·캠페인 직접 배정</div>
            <p className="text-xs text-slate-500 mb-3">파트너 신청 없이 관리자가 가상번호를 바로 배정할 수 있습니다.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select value={directPt} onChange={(e) => setDirectPt(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="">파트너 선택</option>
                {partners.map((p) => <option key={p.id} value={p.id}>{p.name || p.code}</option>)}
              </select>
              <select value={directCp} onChange={(e) => setDirectCp(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="">캠페인 선택</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={directCn} onChange={(e) => setDirectCn(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono">
                <option value="">가상번호 선택</option>
                {availableNumbers.map((n) => <option key={n.cnId} value={n.cnId}>{n.number}</option>)}
              </select>
              <button type="button" onClick={handleDirectAssign} disabled={busy || !directPt || !directCp || !directCn}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                직접 배정
              </button>
            </div>
            <input type="text" value={directMemo} onChange={(e) => setDirectMemo(e.target.value)} placeholder="배정 메모 (선택)"
              className="mt-3 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 font-bold text-slate-800">가상번호 목록 ({numbers.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-4 py-3">번호</th>
                    <th className="px-4 py-3">콜업체</th>
                    <th className="px-4 py-3 text-center">상태</th>
                    <th className="px-4 py-3">메모</th>
                    <th className="px-4 py-3 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {numbers.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">등록된 가상번호가 없습니다.</td></tr>
                  ) : numbers.map((n) => {
                    const s = numberStatusLabel[n.status] ?? { label: n.status, cls: 'bg-slate-100 text-slate-500 border-slate-200' };
                    return (
                      <tr key={n.cnId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{n.number}</td>
                        <td className="px-4 py-3 text-slate-500">{n.provider || '—'}</td>
                        <td className="px-4 py-3 text-center"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${s.cls}`}>{s.label}</span></td>
                        <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{n.memo || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <select value={n.status} onChange={(e) => handleNumberStatus(n.cnId, e.target.value)} className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg" disabled={n.status === 'assigned'}>
                            <option value="available">사용가능</option>
                            <option value="paused">일시중지</option>
                            <option value="released">해지</option>
                            {n.status === 'assigned' && <option value="assigned">배정됨</option>}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 통화 로그 */}
      {tab === 'logs' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Upload size={18} className="text-cyan-600" />
              통화내역 엑셀 업로드
            </div>
            <p className="text-xs text-slate-500 mb-3">
              콜업체에서 받은 통화내역 파일(xlsx, xls, csv)을 업로드합니다. <b>가상번호</b>가 배정된 파트너·캠페인에 자동 연결되어 각 센터에 표시됩니다.
            </p>
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
              필수 열: <b>가상번호</b> · 권장 열: 발신번호, 통화시작, 통화시간(초), 결과, 통화ID, 녹취URL
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={skipConversionOnImport} onChange={(e) => setSkipConversionOnImport(e.target.checked)} className="accent-cyan-500" />
                콜DB 전환 자동 생성 안 함 (통화내역만 표시)
              </label>
              <button type="button" onClick={handleImportLogs} disabled={busy || !importFile}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                <Upload size={16} /> 업로드
              </button>
            </div>
            {importResult ? <p className="mt-3 text-sm text-cyan-700">{importResult}</p> : null}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 font-bold text-slate-800">통화 로그 (녹취 열람 · 최종확정)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3">일시</th>
                  <th className="px-4 py-3">가상번호</th>
                  <th className="px-4 py-3">발신</th>
                  <th className="px-4 py-3">파트너/캠페인</th>
                  <th className="px-4 py-3 text-center">통화</th>
                  <th className="px-4 py-3 text-center">결과</th>
                  <th className="px-4 py-3 text-center">녹취</th>
                  <th className="px-4 py-3 text-center">최종확정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">통화 로그가 없습니다.</td></tr>
                ) : logs.map((l) => {
                  const r = resultLabel[l.result] ?? { label: l.result, cls: 'text-slate-500' };
                  return (
                    <tr key={l.clogId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{l.startedAt}</td>
                      <td className="px-4 py-3 font-mono">{l.virtualNumber}</td>
                      <td className="px-4 py-3 font-mono">{l.caller}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{l.partner}</div>
                        <div className="text-xs text-slate-400">{l.campaign || '미매칭'}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{fmtDuration(l.duration)}</td>
                      <td className={`px-4 py-3 text-center font-bold ${r.cls}`}>{r.label}</td>
                      <td className="px-4 py-3 text-center">
                        {l.hasRecording ? (
                          <button type="button" onClick={() => playRecording(l.clogId)} className="inline-flex items-center gap-1 text-cyan-600 font-bold text-xs">
                            <PlayCircle size={16} /> 재생
                          </button>
                        ) : <span className="text-slate-300 text-xs">없음</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {l.cvId > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" title="최종 승인" onClick={() => handleFinal(l.cvId, 'approve')} className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><Check size={14} /></button>
                            <button type="button" title="최종 취소불가" onClick={() => handleFinal(l.cvId, 'reject')} className="p-1.5 bg-rose-50 text-rose-700 rounded-lg"><X size={14} /></button>
                            <button type="button" title="현재상태 잠금" onClick={() => handleFinal(l.cvId, 'lock')} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><Lock size={14} /></button>
                          </div>
                        ) : <span className="text-slate-300 text-xs">DB 없음</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* 배정 모달 */}
      {assignTarget && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAssignTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-lg text-slate-900 mb-1">가상번호 배정</div>
            <p className="text-sm text-slate-500 mb-4">{assignTarget.partner} · {assignTarget.campaign}</p>
            <label className="block text-xs font-bold text-slate-500 mb-1">사용 가능한 번호</label>
            <select value={assignCn} onChange={(e) => setAssignCn(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono mb-4">
              <option value="">번호 선택</option>
              {availableNumbers.map((n) => <option key={n.cnId} value={n.cnId}>{n.number}</option>)}
            </select>
            {availableNumbers.length === 0 && <p className="text-xs text-rose-500 mb-3">사용 가능한 번호가 없습니다. 가상번호 풀에서 먼저 등록/발급하세요.</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setAssignTarget(null)} className="px-4 py-2 text-sm font-bold text-slate-500">취소</button>
              <button type="button" onClick={handleAssign} disabled={busy || !assignCn} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-sm disabled:opacity-50">배정하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 콜 설정 모달 */}
      {settingsCp && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSettingsCp(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-lg text-slate-900 mb-1">콜 설정 — {settingsCp.name}</div>
            <p className="text-sm text-slate-500 mb-4">녹음/멘트/업무시간/단가는 관리자 전용 설정입니다.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={!!settingsDraft.cs_admin_enabled} onChange={(e) => setDraft('cs_admin_enabled', e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                콜디비 활성화 (관리자 마스터)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">녹음 방식</label>
                  <select value={String(settingsDraft.cs_recording_mode ?? 'normal')} onChange={(e) => setDraft('cs_recording_mode', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <option value="normal">녹음</option>
                    <option value="none">녹음 안함</option>
                    <option value="both">양방향 녹음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">콜 단가(원)</label>
                  <input type="number" value={Number(settingsDraft.cs_price ?? 0)} onChange={(e) => setDraft('cs_price', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">최소 통화시간(초)</label>
                  <input type="number" value={Number(settingsDraft.cs_min_duration ?? 0)} onChange={(e) => setDraft('cs_min_duration', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">컬러링</label>
                  <input type="text" value={String(settingsDraft.cs_coloring ?? '')} onChange={(e) => setDraft('cs_coloring', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">업무 시작</label>
                  <input type="time" value={String(settingsDraft.cs_business_start ?? '00:00')} onChange={(e) => setDraft('cs_business_start', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">업무 종료</label>
                  <input type="time" value={String(settingsDraft.cs_business_end ?? '23:59')} onChange={(e) => setDraft('cs_business_end', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">안내 멘트</label>
                <input type="text" value={String(settingsDraft.cs_call_ment ?? '')} onChange={(e) => setDraft('cs_call_ment', e.target.value)} placeholder="연결 전 안내 멘트" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">관리자 메모</label>
                <input type="text" value={String(settingsDraft.cs_memo ?? '')} onChange={(e) => setDraft('cs_memo', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button type="button" onClick={() => setSettingsCp(null)} className="px-4 py-2 text-sm font-bold text-slate-500">취소</button>
              <button type="button" onClick={handleSaveSettings} disabled={busy} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-sm disabled:opacity-50">저장</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
