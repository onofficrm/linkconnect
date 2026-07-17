import { useEffect, useState } from 'react';
import { Bell, Save } from 'lucide-react';
import {
  fetchMerchantNotifyPrefs,
  fetchPartnerNotifyPrefs,
  MerchantNotifyPrefs,
  NotifyPrefMeta,
  PartnerNotifyPrefs,
  saveMerchantNotifyPrefs,
  savePartnerNotifyPrefs,
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = center === 'partner' ? await fetchPartnerNotifyPrefs() : await fetchMerchantNotifyPrefs();
      setPrefs(data.prefs as Record<string, string | boolean>);
      setMeta(data.meta);
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
      const result =
        center === 'partner'
          ? await savePartnerNotifyPrefs(prefs as Partial<PartnerNotifyPrefs>)
          : await saveMerchantNotifyPrefs(prefs as Partial<MerchantNotifyPrefs>);
      setPrefs(result.prefs as Record<string, string | boolean>);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-100 text-cyan-600 rounded-xl">
          <Bell size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">이메일 알림 설정</h2>
          <p className="text-sm text-slate-500">알림 유형별로 수신 여부를 설정할 수 있습니다. 신규 DB는 실시간 또는 하루 요약으로 받을 수 있습니다.</p>
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
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? '저장 중...' : '알림 설정 저장'}
          </button>
        </div>
      )}
    </div>
  );
}
