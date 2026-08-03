import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Mail, Save, Send } from 'lucide-react';
import {
  fetchMerchantNotifyPrefs,
  fetchPartnerNotifyPrefs,
  MerchantNotifyPrefs,
  MerchantNotifySystemStatus,
  NotifyPrefMeta,
  PartnerNotifyPrefs,
  saveMerchantNotifyPrefs,
  savePartnerNotifyPrefs,
  sendMerchantNotifyTest,
} from '../lib/api';

type Center = 'partner' | 'merchant';

const modeOptions: { value: 'off' | 'realtime' | 'digest'; label: string }[] = [
  { value: 'realtime', label: '실시간' },
  { value: 'digest', label: '하루 요약' },
  { value: 'off', label: '끄기' },
];

export function NotificationPrefsPanel({ center }: { center: Center }) {
  const [prefs, setPrefs] = useState<Record<string, string | boolean>>({});
  const [meta, setMeta] = useState<Record<string, NotifyPrefMeta>>({});
  const [recipientEmail, setRecipientEmail] = useState('');
  const [system, setSystem] = useState<MerchantNotifySystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const applyMerchant = (data: Awaited<ReturnType<typeof fetchMerchantNotifyPrefs>>) => {
    setPrefs(data.prefs as Record<string, string | boolean>);
    setMeta(data.meta);
    setRecipientEmail(data.recipient?.email || '');
    setSystem(data.system || null);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (center === 'partner') {
        const data = await fetchPartnerNotifyPrefs();
        setPrefs(data.prefs as Record<string, string | boolean>);
        setMeta(data.meta);
        setRecipientEmail('');
        setSystem(null);
      } else {
        applyMerchant(await fetchMerchantNotifyPrefs());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 설정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [center]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (center === 'partner') {
        const result = await savePartnerNotifyPrefs(prefs as Partial<PartnerNotifyPrefs>);
        setPrefs(result.prefs as Record<string, string | boolean>);
        setMessage(result.message);
      } else {
        const result = await saveMerchantNotifyPrefs(prefs as Partial<MerchantNotifyPrefs>);
        applyMerchant(result);
        setMessage(result.message || '알림 설정이 저장되었습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (center !== 'merchant') return;
    setTesting(true);
    setError('');
    setMessage('');
    try {
      const result = await sendMerchantNotifyTest();
      applyMerchant(result);
      setMessage(result.message || '테스트 메일을 발송했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '테스트 메일 발송에 실패했습니다.');
    } finally {
      setTesting(false);
    }
  };

  const systemReady = Boolean(system?.ready);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-100 text-cyan-600 rounded-xl">
          <Bell size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">이메일 알림 설정</h2>
          <p className="text-sm text-slate-500">
            {center === 'merchant'
              ? '신규 DB 접수 시 이름·연락처 요약을 메일로 받을 수 있습니다. 실시간 또는 하루 요약으로 설정하세요.'
              : '알림 유형별로 수신 여부를 설정할 수 있습니다. 신규 DB는 실시간 또는 하루 요약으로 받을 수 있습니다.'}
          </p>
        </div>
      </div>

      {(error || message) && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500 py-6">불러오는 중...</div>
      ) : (
        <div className="space-y-4">
          {center === 'merchant' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                  <Mail size={16} /> 수신 이메일
                </div>
                {recipientEmail ? (
                  <p className="text-sm text-slate-700 break-all">{recipientEmail}</p>
                ) : (
                  <p className="text-sm text-rose-600">회원정보에 이메일이 없습니다.</p>
                )}
              </div>
              <div className={`rounded-xl border px-4 py-3 ${systemReady ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50/70'}`}>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                  {systemReady ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
                  {systemReady ? '메일 발송 준비됨' : '메일 발송 점검 필요'}
                </div>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  <li>메일 기능: {system?.mailer ? '정상' : '불가'}</li>
                  <li>메일발송 사용: {system?.emailUse ? 'ON' : 'OFF'}</li>
                  <li>발신 메일: {system?.fromConfigured ? '설정됨' : '미설정'}</li>
                </ul>
                {system?.issues?.length ? (
                  <ul className="mt-2 text-xs text-amber-800 list-disc pl-4 space-y-0.5">
                    {system.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}

          {Object.entries(meta).map(([key, item]) => {
            const prefMeta = item as NotifyPrefMeta;
            return (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{prefMeta.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{prefMeta.help}</div>
                </div>
                {prefMeta.type === 'mode' ? (
                  <select
                    value={String(prefs[key] ?? 'realtime')}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm min-w-[140px]"
                  >
                    {modeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(prefs[key])}
                      onChange={(e) => setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    받기
                  </label>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? '저장 중...' : '알림 설정 저장'}
            </button>
            {center === 'merchant' ? (
              <button
                type="button"
                disabled={testing || !recipientEmail}
                onClick={handleTest}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                <Send size={16} />
                {testing ? '발송 중...' : '테스트 메일 보내기'}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
