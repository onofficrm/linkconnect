import { useEffect, useState } from 'react';
import { PushPrefs, fetchPushPrefs, savePushPrefs } from '../../lib/api';

const typeLabels: Array<{ key: keyof PushPrefs; label: string }> = [
  { key: 'conversion', label: '신규 DB · 승인 · 취소' },
  { key: 'wallet', label: '잔액' },
  { key: 'event', label: '이벤트' },
  { key: 'campaign', label: '캠페인' },
  { key: 'call', label: '콜디비' },
  { key: 'contract', label: '계약' },
  { key: 'notice', label: '공지' },
  { key: 'system', label: '시스템' },
];

const empty: PushPrefs = {
  conversion: true,
  wallet: true,
  event: true,
  system: true,
  campaign: true,
  call: true,
  contract: true,
  notice: true,
  quietStart: '',
  quietEnd: '',
};

export function NotificationPrefsPage({ center }: { center: 'admin' | 'partner' | 'merchant' }) {
  const [prefs, setPrefs] = useState<PushPrefs>(empty);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPushPrefs()
      .then((data) => {
        const found = data.centers.find((item) => item.center === center);
        if (found) setPrefs({ ...empty, ...found.prefs });
      })
      .catch((err) => setError(err instanceof Error ? err.message : '설정을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [center]);

  const save = async () => {
    setError('');
    setMessage('');
    try {
      const result = await savePushPrefs(center, prefs);
      setMessage(result.message || '저장했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    }
  };

  if (loading) return <p className="text-sm text-slate-500">불러오는 중...</p>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="font-bold text-slate-900">알림 설정</h2>
        <p className="text-sm text-slate-500 mt-1">앱 푸시만 끄고 켤 수 있습니다. 카카오 알림톡과 이메일은 그대로 갑니다.</p>
      </div>
      {typeLabels.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-slate-800">{item.label}</span>
          <input
            type="checkbox"
            checked={Boolean(prefs[item.key])}
            onChange={(e) => setPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))}
          />
        </label>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block text-xs font-bold text-slate-500 mb-1">방해 금지 시작</span>
          <input type="time" value={prefs.quietStart} onChange={(e) => setPrefs((prev) => ({ ...prev, quietStart: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
        </label>
        <label className="text-sm">
          <span className="block text-xs font-bold text-slate-500 mb-1">방해 금지 종료</span>
          <input type="time" value={prefs.quietEnd} onChange={(e) => setPrefs((prev) => ({ ...prev, quietEnd: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
        </label>
      </div>
      <p className="text-xs text-slate-400">비워 두면 야간에도 알림을 받습니다. 시간은 서버 시간 기준입니다.</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <button type="button" onClick={() => { void save(); }} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold">저장</button>
    </div>
  );
}
