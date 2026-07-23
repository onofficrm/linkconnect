import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { SummaryCard, StatusBadge } from '../../components/admin/AdminShared';
import {
  Code,
  ShieldAlert,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  AlertCircle,
  X,
  RefreshCcw,
  KeyRound,
  Plus,
} from 'lucide-react';
import {
  AdminMerchant,
  ApiClientItem,
  ApiIntegrationSummary,
  ApiLogItem,
  fetchAdminIntegrationDetail,
  fetchAdminIntegrations,
  fetchAdminMerchants,
  updateAdminIntegration,
} from '../../lib/api';

const emptySummary: ApiIntegrationSummary = {
  todayTotal: 0,
  todaySuccess: 0,
  todayFailed: 0,
  todayDuplicate: 0,
  dbshareTotal: 0,
  lastReceiveTime: '-',
};

export function AdminApi() {
  const [summary, setSummary] = useState<ApiIntegrationSummary>(emptySummary);
  const [clients, setClients] = useState<ApiClientItem[]>([]);
  const [merchantClients, setMerchantClients] = useState<ApiClientItem[]>([]);
  const [merchantApiPath, setMerchantApiPath] = useState('/plugin/linkconnect/api/v1/merchant/conversions.php');
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<number | null>(null);
  const [activeLog, setActiveLog] = useState<ApiLogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newMtId, setNewMtId] = useState('');
  const [newName, setNewName] = useState('');
  const [newIps, setNewIps] = useState('');
  const [busy, setBusy] = useState(false);

  const primaryClient = useMemo(
    () => clients.find((c) => c.type !== 'merchant') ?? clients[0] ?? null,
    [clients],
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, merchantData] = await Promise.all([
        fetchAdminIntegrations(),
        fetchAdminMerchants({ status: 'active' }).catch(() => ({ items: [] as AdminMerchant[] })),
      ]);
      setSummary(data.summary);
      setClients(data.clients);
      setMerchantClients(data.merchantClients ?? data.clients.filter((c) => c.type === 'merchant'));
      if (data.merchantApiPath) setMerchantApiPath(data.merchantApiPath);
      setLogs(data.items);
      setMerchants(merchantData.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API 연동 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openLog = async (log: ApiLogItem) => {
    setSelectedLog(log.alId);
    try {
      const data = await fetchAdminIntegrationDetail(log.alId);
      setActiveLog(data.item);
    } catch {
      setActiveLog(log);
    }
  };

  const regenerateKey = async (acId: number) => {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const result = await updateAdminIntegration({ action: 'regenerate_key', acId });
      setMessage(result.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '키 재발급에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const createMerchantKey = async () => {
    const mtId = Number(newMtId);
    if (!Number.isFinite(mtId) || mtId <= 0) {
      setError('광고주를 선택하세요.');
      return;
    }
    const merchant = merchants.find((m) => m.id === mtId);
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const result = await updateAdminIntegration({
        action: 'create_client',
        name: newName.trim() || `${merchant?.name ?? '광고주'} 검수 API`,
        type: 'merchant',
        mtId,
        allowedIps: newIps.trim(),
      });
      setMessage(result.message + (result.client?.apiKey ? ` · Key: ${result.client.apiKey}` : ''));
      setNewMtId('');
      setNewName('');
      setNewIps('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '광고주 API 키 발급에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const toggleClient = async (client: ApiClientItem) => {
    setBusy(true);
    try {
      const result = await updateAdminIntegration({
        action: client.statusCode === 'active' ? 'deactivate' : 'activate',
        acId: client.id,
      });
      setMessage(result.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout activeMenu="api" title="API 연동 관리" description="외부 디비 수집·광고주 검수 API 연동 상태와 로그를 관리하세요.">
      {(error || message) && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <SummaryCard title="오늘 API 수신" value={summary.todayTotal.toLocaleString()} suffix="건" dark icon={<ArrowDownToLine size={18} />} />
        <SummaryCard title="성공" value={summary.todaySuccess.toLocaleString()} suffix="건" color="emerald" highlight icon={<CheckCircle2 size={18} />} />
        <SummaryCard title="실패" value={summary.todayFailed.toLocaleString()} suffix="건" color="red" highlight icon={<ShieldAlert size={18} />} />
        <SummaryCard title="중복 차단" value={summary.todayDuplicate.toLocaleString()} suffix="건" color="orange" icon={<AlertCircle size={18} />} />
        <SummaryCard title="디비쉐어 수신" value={summary.dbshareTotal.toLocaleString()} suffix="건" color="blue" icon={<Database size={18} />} />
        <SummaryCard title="마지막 수신 시간" value={summary.lastReceiveTime} suffix="" color="slate" icon={<Clock size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Code className="text-slate-600" size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-900">API 클라이언트 (랜딩페이지)</h3>
              <p className="text-sm text-slate-500">자체 랜딩페이지 연동용 API Key 관리</p>
            </div>
          </div>
          {primaryClient ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">API Key</div>
                    <div className="font-mono font-bold text-slate-800 tracking-tight break-all">{primaryClient.apiKey}</div>
                  </div>
                  <StatusBadge status={primaryClient.status} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-xs font-medium text-slate-500 mb-1">허용 IP</div>
                    <div className="text-sm font-bold text-slate-900">{primaryClient.allowedIps || '제한 없음'}</div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-xs font-medium text-slate-500 mb-1">최근 호출일</div>
                    <div className="text-sm font-bold text-slate-900">{primaryClient.lastCallAt}</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2 pt-6 border-t border-slate-100">
                <button type="button" disabled={busy} onClick={() => regenerateKey(primaryClient.id)} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5 disabled:opacity-50">
                  <RefreshCcw size={16} /> Key 재발급
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-4">외부 DB 수신 엔드포인트: <code className="bg-slate-100 px-1 rounded">/plugin/linkconnect/api/db_receive.php</code></p>
            </>
          ) : (
            <p className="text-sm text-slate-500">{loading ? '불러오는 중...' : 'API 클라이언트가 없습니다.'}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center"><KeyRound className="text-cyan-600" size={20} /></div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">광고주 검수 API</h3>
              <p className="text-sm text-slate-500">광고주 자체 플랫폼에서 디비 승인·취소</p>
            </div>
          </div>

          <div className="space-y-3 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">광고주 *</label>
              <select
                value={newMtId}
                onChange={(e) => setNewMtId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              >
                <option value="">선택</option>
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">클라이언트명</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: ○○사 CRM 연동"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">허용 IP (쉼표 구분, 권장)</label>
              <input
                type="text"
                value={newIps}
                onChange={(e) => setNewIps(e.target.value)}
                placeholder="203.0.113.10, 203.0.113.*"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono"
              />
            </div>
            <button
              type="button"
              disabled={busy || !newMtId}
              onClick={createMerchantKey}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={16} /> 광고주 API Key 발급
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            엔드포인트: <code className="bg-slate-100 px-1 rounded break-all">{merchantApiPath}</code>
          </p>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {merchantClients.length === 0 ? (
              <p className="text-sm text-slate-500">발급된 광고주 검수 API 키가 없습니다.</p>
            ) : merchantClients.map((c) => (
              <div key={c.id} className="p-3 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.merchantName || `mtId ${c.mtId}`} · {c.code}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="font-mono text-xs text-slate-700 break-all bg-slate-50 px-2 py-1.5 rounded">{c.apiKey}</div>
                <div className="text-[11px] text-slate-500">IP: {c.allowedIps || '제한 없음'} · 최근: {c.lastCallAt}</div>
                <div className="flex gap-2">
                  <button type="button" disabled={busy} onClick={() => regenerateKey(c.id)} className="flex-1 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg disabled:opacity-50">재발급</button>
                  <button type="button" disabled={busy} onClick={() => toggleClient(c)} className="flex-1 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50">
                    {c.statusCode === 'active' ? '비활성' : '활성'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${selectedLog ? 'hidden lg:block lg:w-2/3' : 'w-full'}`}>
          <div className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-slate-400" /> API 로그</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">시간</th>
                    <th className="px-4 py-3 font-medium">연동명</th>
                    <th className="px-4 py-3 font-medium">Endpoint</th>
                    <th className="px-4 py-3 font-medium text-center">결과</th>
                    <th className="px-4 py-3 font-medium">오류</th>
                    <th className="px-4 py-3 font-medium text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">불러오는 중...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">API 로그가 없습니다.</td></tr>
                  ) : logs.map((log) => (
                    <tr key={log.id} className={`cursor-pointer ${selectedLog === log.alId ? 'bg-blue-50' : 'hover:bg-slate-50'}`} onClick={() => openLog(log)}>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600">{log.time.split(' ')[1] || log.time}</td>
                      <td className="px-4 py-4 whitespace-nowrap font-bold text-slate-900">{log.client}</td>
                      <td className="px-4 py-4 whitespace-nowrap"><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{log.endpoint}</span></td>
                      <td className="px-4 py-4 text-center whitespace-nowrap"><StatusBadge status={log.status} /></td>
                      <td className="px-4 py-4 text-xs truncate max-w-[150px] text-slate-500">{log.error || '-'}</td>
                      <td className="px-4 py-4 text-center"><button type="button" className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold"><Eye size={14} className="inline" /> 상세</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {activeLog && selectedLog && (
          <div className="lg:w-1/3 w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Code size={18} /> API 로그 상세</h3>
                <button type="button" onClick={() => { setSelectedLog(null); setActiveLog(null); }} className="p-1.5 text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                <StatusBadge status={activeLog.status} />
                {activeLog.requestBody && (
                  <div>
                    <h4 className="text-sm font-bold mb-2">Request</h4>
                    <pre className="bg-slate-900 text-slate-300 text-xs p-4 rounded-xl overflow-x-auto">{activeLog.requestBody}</pre>
                  </div>
                )}
                {activeLog.responseBody && (
                  <div>
                    <h4 className="text-sm font-bold mb-2">Response</h4>
                    <pre className="bg-slate-900 text-slate-300 text-xs p-4 rounded-xl overflow-x-auto">{activeLog.responseBody}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
