import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  PlayCircle,
  RefreshCw,
  Store,
} from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav } from '../../../components/cps/CpsShared';
import {
  LpSetupSnapshot,
  bulkUpdateAdminLpMerchants,
  fetchAdminLpSetup,
  runAdminLpSetupCheck,
  syncAdminLpMerchants,
  syncAdminLpOrders,
} from '../../../lib/api';

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
    >
      <Copy size={14} />
      {copied ? '복사됨' : label || '복사'}
    </button>
  );
}

export function AdminCpsSetup() {
  const [setup, setSetup] = useState<LpSetupSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 4000);
  };

  const load = useCallback(() => {
    fetchAdminLpSetup()
      .then(setSetup)
      .catch((e) => notify(e instanceof Error ? e.message : '로드 실패'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runCheck = async () => {
    setBusy(true);
    try {
      const res = await runAdminLpSetupCheck(!!setup?.config.security?.testMode);
      setSetup(res.setup);
      notify(res.message || '점검 완료');
    } catch (e) {
      notify(e instanceof Error ? e.message : '점검 실패');
    } finally {
      setBusy(false);
    }
  };

  const syncMerchants = async () => {
    setBusy(true);
    try {
      const res = await syncAdminLpMerchants({ scope: 'apr', detail: true });
      notify(res.message);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '동기화 실패');
    } finally {
      setBusy(false);
    }
  };

  const enableHiddenApr = async () => {
    setBusy(true);
    try {
      const res = await bulkUpdateAdminLpMerchants({ scope: 'apr_hidden', visible: true });
      notify(res.message);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '일괄 노출 실패');
    } finally {
      setBusy(false);
    }
  };

  const syncOrders = async () => {
    setBusy(true);
    try {
      const res = await syncAdminLpOrders({ mode: 'last7' });
      notify(res.message);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '실적 동기화 실패');
    } finally {
      setBusy(false);
    }
  };

  const steps = setup?.steps.items ?? [];
  const percent = setup?.steps.percent ?? 0;

  return (
    <AdminLayout activeMenu="cps" title="CPS 운영 시작" description="링크프라이스 연동·노출·동기화 체크리스트">
      <AdminCpsSubnav active="setup" />
      {msg ? (
        <div className="mb-4 text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2">
          {msg}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900">운영 체크리스트</h3>
              <p className="text-sm text-slate-500 mt-1">
                {setup?.steps.done ?? 0}/{setup?.steps.total ?? 0}단계 완료
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={runCheck}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-50"
              >
                <PlayCircle size={16} /> 연결 점검
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={load}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold disabled:opacity-50"
              >
                <RefreshCw size={16} /> 새로고침
              </button>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <ol className="space-y-3">
            {steps.map((step) => (
              <li
                key={step.id}
                className={`flex gap-3 p-3 rounded-xl border ${
                  step.status === 'done' ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                {step.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{step.title}</div>
                  <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {step.action === 'settings' ? (
                      <Link to="/admin/cps/settings" className="text-xs font-bold text-cyan-700">
                        설정 열기 →
                      </Link>
                    ) : null}
                    {step.action === 'merchants' ? (
                      <Link to="/admin/cps/merchants" className="text-xs font-bold text-cyan-700">
                        광고주 관리 →
                      </Link>
                    ) : null}
                    {step.action === 'postbacks' ? (
                      <Link to="/admin/cps/postbacks" className="text-xs font-bold text-cyan-700">
                        POSTBACK 로그 →
                      </Link>
                    ) : null}
                    {step.action === 'sync_merchants' ? (
                      <button type="button" disabled={busy} onClick={syncMerchants} className="text-xs font-bold text-cyan-700">
                        지금 동기화
                      </button>
                    ) : null}
                    {step.action === 'sync_orders' ? (
                      <button type="button" disabled={busy} onClick={syncOrders} className="text-xs font-bold text-cyan-700">
                        실적 동기화
                      </button>
                    ) : null}
                    {step.action === 'public_cps' && setup?.urls.publicCps ? (
                      <a href={setup.urls.publicCps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700">
                        /cps 보기 <ExternalLink size={12} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Store size={18} /> 광고주 현황
            </h3>
            <div className="flex justify-between">
              <span className="text-slate-500">동기화 전체</span>
              <span className="font-bold">{setup?.merchants.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">APR 승인</span>
              <span className="font-bold">{setup?.merchants.apr ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">노출 ON</span>
              <span className="font-bold text-emerald-700">{setup?.merchants.visible ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">공개·파트너 노출</span>
              <span className="font-bold text-cyan-700">{setup?.merchants.partnerVisible ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">APR 미노출</span>
              <span className="font-bold text-amber-700">{setup?.merchants.hiddenApr ?? 0}</span>
            </div>
            {(setup?.merchants.hiddenApr ?? 0) > 0 ? (
              <button
                type="button"
                disabled={busy}
                onClick={enableHiddenApr}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-50"
              >
                APR 미노출 광고주 일괄 노출 ON
              </button>
            ) : null}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-sm">
            <h3 className="font-bold text-slate-900 mb-2">POSTBACK</h3>
            <div className="text-xs text-slate-500 break-all font-mono bg-slate-50 rounded-lg p-2">
              {setup?.urls.postbackPrimary || '—'}
            </div>
            <CopyButton text={setup?.urls.postbackPrimary || ''} label="URL 복사" />
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">수신 총계</span>
              <span className="font-bold">{setup?.postbacks.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">최근 24시간</span>
              <span className="font-bold">{setup?.postbacks.last24h ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-slate-900">크론 명령 (서버 crontab)</h3>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">광고주 동기화 (일 1회)</div>
            <pre className="text-xs bg-slate-50 rounded-xl p-3 overflow-x-auto font-mono whitespace-pre-wrap">
              {setup?.cron.merchant || '—'}
            </pre>
            <div className="mt-2">
              <CopyButton text={setup?.cron.merchant || ''} />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">실적 동기화 (20분)</div>
            <pre className="text-xs bg-slate-50 rounded-xl p-3 overflow-x-auto font-mono whitespace-pre-wrap">
              {setup?.cron.order || '—'}
            </pre>
            <div className="mt-2">
              <CopyButton text={setup?.cron.order || ''} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-slate-900">웹 크론 URL (토큰 설정 시)</h3>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">광고주</div>
            <div className="text-xs break-all font-mono bg-slate-50 rounded-lg p-2">{setup?.urls.merchantCron || '—'}</div>
            <div className="mt-2">
              <CopyButton text={setup?.urls.merchantCron || ''} />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">실적</div>
            <div className="text-xs break-all font-mono bg-slate-50 rounded-lg p-2">{setup?.urls.orderCron || '—'}</div>
            <div className="mt-2">
              <CopyButton text={setup?.urls.orderCron || ''} />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">헬스체크</div>
            <div className="text-xs break-all font-mono bg-slate-50 rounded-lg p-2">{setup?.urls.health || '—'}</div>
            <div className="mt-2">
              <CopyButton text={setup?.urls.health || ''} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
