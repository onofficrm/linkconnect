import { FormEvent, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminLinkScript, fetchAdminLinkScript, saveAdminLinkScript } from '../../lib/api';

export function AdminLinkScriptPage() {
  const [code, setCode] = useState('');
  const [link, setLink] = useState<AdminLinkScript | null>(null);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const lookup = async (event?: FormEvent) => {
    event?.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await fetchAdminLinkScript(code.trim());
      setLink(data.link);
      setScript(data.link.script || '');
    } catch (err) {
      setLink(null);
      setScript('');
      setError(err instanceof Error ? err.message : '링크를 찾지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!link) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const data = await saveAdminLinkScript(link.code, script);
      setLink(data.link);
      setScript(data.link.script || '');
      setMessage(data.message || '저장했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeMenu="link-script" title="홍보 링크 스크립트">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm text-slate-500">
          홍보 링크 코드마다 헤드 스크립트를 저장합니다. 그 코드로 열리는 랜딩, 상담 페이지, 외부 상담 위젯에만 실행됩니다.
        </p>
        <form onSubmit={lookup} className="flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="링크 코드 (예: 524c19529e)"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
          />
          <button type="submit" disabled={loading || !code.trim()} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold disabled:opacity-50">
            {loading ? '조회 중' : '조회'}
          </button>
        </form>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {link ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-bold text-slate-800">캠페인</span> {link.campaign} ({link.campaignCode})</p>
              <p><span className="font-bold text-slate-800">파트너</span> {link.partner || '—'} {link.partnerCode ? `(${link.partnerCode})` : ''}</p>
              <p><span className="font-bold text-slate-800">랜딩</span> {link.landingUrl || '—'}</p>
            </div>
            <label className="block text-sm">
              <span className="block text-xs font-bold text-slate-500 mb-1">헤드 스크립트</span>
              <textarea
                value={script}
                onChange={(event) => setScript(event.target.value)}
                rows={14}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                placeholder="비우면 이 링크의 스크립트를 지웁니다."
              />
            </label>
            <button type="button" onClick={save} disabled={saving} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">
              {saving ? '저장 중' : '저장'}
            </button>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
