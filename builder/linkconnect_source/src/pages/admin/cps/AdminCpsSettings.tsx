import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import {
  LpNetworkConfig,
  fetchAdminLpConfig,
  saveAdminLpConfig,
  saveAdminLpPostbackSecurity,
  testAdminLpConnection,
} from '../../../lib/api';

export function AdminCpsSettings() {
  const [config, setConfig] = useState<LpNetworkConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [secret, setSecret] = useState('');
  const [apiEnabled, setApiEnabled] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [ipEnabled, setIpEnabled] = useState(false);
  const [ipList, setIpList] = useState('');
  const [defaultRate, setDefaultRate] = useState('70');

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 4000);
  };

  const load = useCallback(() => {
    fetchAdminLpConfig()
      .then((d) => {
        setConfig(d.config);
        setAffiliateCode(d.config.affiliateCode || '');
        setApiEnabled(!!d.config.apiEnabled);
        setDefaultRate(String(d.config.defaultPartnerRate ?? 70));
        setTestMode(!!d.config.security?.testMode);
        setIpEnabled(!!d.config.security?.postbackIpEnabled);
        setIpList(d.config.security?.postbackIpAllowlist || '');
      })
      .catch((e) => notify(e instanceof Error ? e.message : '설정 로드 실패'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      const res = await saveAdminLpConfig({
        affiliateCode,
        apiAuthKey: authKey || undefined,
        postbackSecret: secret || undefined,
        apiEnabled,
        defaultPartnerRate: Number(defaultRate) || 70,
      });
      await saveAdminLpPostbackSecurity({
        postbackIpEnabled: ipEnabled,
        postbackIpAllowlist: ipList,
        testMode,
      });
      setConfig(res.config);
      setAuthKey('');
      setSecret('');
      notify(res.message || '저장되었습니다.');
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    try {
      const res = await testAdminLpConnection(testMode);
      notify(res.message);
    } catch (e) {
      notify(e instanceof Error ? e.message : '연결 테스트 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout activeMenu="cps" title="링크프라이스 설정" description="CPS API 인증·보안·동기화 상태">
      <AdminCpsSubnav active="settings" />
      {msg ? <div className="mb-4 text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2">{msg}</div> : null}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-slate-900">API 연결</h3>
          <label className="block text-sm">
            <span className="text-slate-600">A코드 / 제휴 코드</span>
            <input value={affiliateCode} onChange={(e) => setAffiliateCode(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">API 인증키 {config?.apiAuthKeySet ? `(저장됨: ${config.apiAuthKeyMasked})` : ''}</span>
            <input type="password" autoComplete="new-password" value={authKey} onChange={(e) => setAuthKey(e.target.value)} placeholder="변경 시에만 입력" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">POSTBACK Secret {config?.postbackSecretSet ? `(저장됨: ${config.postbackSecretMasked})` : ''}</span>
            <input type="password" autoComplete="new-password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="변경 시에만 입력" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={apiEnabled} onChange={(e) => setApiEnabled(e.target.checked)} />
            API 활성
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
            테스트 모드
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">기본 파트너 지급률 (%)</span>
            <input value={defaultRate} onChange={(e) => setDefaultRate(e.target.value)} className="mt-1 w-32 border border-slate-200 rounded-xl px-3 py-2" />
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" disabled={busy} onClick={save} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">저장</button>
            <button type="button" disabled={busy} onClick={test} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold disabled:opacity-50">연결 테스트</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900">POSTBACK 보안</h3>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={ipEnabled} onChange={(e) => setIpEnabled(e.target.checked)} />
              허용 IP 제한
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">허용 IP (줄바꿈 또는 쉼표)</span>
              <textarea value={ipList} onChange={(e) => setIpList(e.target.value)} rows={4} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs" />
            </label>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-sm">
            <h3 className="font-bold text-slate-900 mb-2">동기화 상태</h3>
            <div className="flex justify-between"><span className="text-slate-500">마지막 광고주 동기화</span><span className="font-medium">{config?.lastMerchantSyncAt || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">마지막 실적 동기화</span><span className="font-medium">{config?.lastOrderSyncAt || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">연결 준비</span><span className="font-medium">{config?.ready ? '준비됨' : '미완료'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">기본 지급률</span><span className="font-medium">{formatWon(Number(config?.defaultPartnerRate ?? 0))}%</span></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
