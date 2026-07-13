import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle, RefreshCw, Zap } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav } from '../../../components/cps/CpsShared';
import {
  LpE2eSnapshot,
  createAdminLpTestClick,
  fetchAdminLpE2e,
  simulateAdminLpPostback,
  syncAdminLpOrders,
} from '../../../lib/api';

export function AdminCpsE2e() {
  const [e2e, setE2e] = useState<LpE2eSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 5000);
  };

  const load = useCallback(() => {
    fetchAdminLpE2e()
      .then(setE2e)
      .catch((e) => notify(e instanceof Error ? e.message : '로드 실패'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runTestClick = async () => {
    setBusy(true);
    try {
      const res = await createAdminLpTestClick({
        lpmId: e2e?.merchant?.lpmId,
        merchantCode: e2e?.merchant?.merchantCode,
        ptId: e2e?.partnerId || undefined,
      });
      setE2e(res.e2e);
      notify(res.message + (res.promoUrl ? ` · ${res.promoUrl}` : ''));
    } catch (e) {
      notify(e instanceof Error ? e.message : '테스트 클릭 실패');
    } finally {
      setBusy(false);
    }
  };

  const runSimulatePostback = async () => {
    setBusy(true);
    try {
      const res = await simulateAdminLpPostback({
        lpmId: e2e?.merchant?.lpmId,
        merchantCode: e2e?.merchant?.merchantCode,
        ptId: e2e?.partnerId || undefined,
        force: true,
      });
      setE2e(res.e2e);
      notify(res.message);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'POSTBACK 시뮬레이션 실패');
    } finally {
      setBusy(false);
    }
  };

  const runOrderSync = async () => {
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

  return (
    <AdminLayout activeMenu="cps" title="CPS E2E 검증" description="클릭 → POSTBACK → 실적 파이프라인 테스트">
      <AdminCpsSubnav active="e2e" />
      {msg ? (
        <div className="mb-4 text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2 break-all">
          {msg}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900">파이프라인 점검</h3>
              <p className="text-sm text-slate-500">
                {e2e?.checksDone ?? 0}/{e2e?.checksTotal ?? 0} 항목 통과
              </p>
            </div>
            <button type="button" disabled={busy} onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold">
              <RefreshCw size={16} /> 새로고침
            </button>
          </div>
          <ol className="space-y-2">
            {(e2e?.checks ?? []).map((c) => (
              <li key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${c.ok ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100'}`}>
                {c.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
                <span className="font-medium text-slate-800">{c.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-slate-900">테스트 대상</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">파트너 ID</span>
              <span className="font-mono font-bold">{e2e?.partnerId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">광고주</span>
              <span className="font-medium truncate max-w-[160px]">{e2e?.merchant?.merchantName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">코드</span>
              <span className="font-mono text-xs">{e2e?.merchant?.merchantCode || '—'}</span>
            </div>
          </div>
          {e2e?.promoUrl ? (
            <div className="text-xs bg-slate-50 rounded-xl p-3 break-all font-mono">{e2e.promoUrl}</div>
          ) : null}
          {e2e?.recentClick ? (
            <div className="text-xs text-slate-500">
              최근 클릭 #{e2e.recentClick.lpcId} · u_id {e2e.recentClick.uId}
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Zap size={18} /> E2E 실행
        </h3>
        <p className="text-sm text-slate-500">
          1) 테스트 클릭 생성 → 2) POSTBACK 시뮬레이션 → 3) 실적 동기화 순으로 실행하세요.
          POSTBACK 시뮬레이션은 테스트 모드 권장이며, 관리자 화면에서는 force로 실행됩니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={runTestClick} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">
            <PlayCircle size={16} /> 1. 테스트 클릭 생성
          </button>
          <button type="button" disabled={busy} onClick={runSimulatePostback} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-50">
            <PlayCircle size={16} /> 2. POSTBACK 시뮬레이션
          </button>
          <button type="button" disabled={busy} onClick={runOrderSync} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold disabled:opacity-50">
            <RefreshCw size={16} /> 3. 실적 동기화
          </button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm pt-2">
          <Link to="/admin/cps/postbacks" className="font-bold text-cyan-700">POSTBACK 로그 →</Link>
          <Link to="/admin/cps/orders" className="font-bold text-cyan-700">실적 관리 →</Link>
          <Link to="/admin/cps/setup" className="font-bold text-cyan-700">운영 체크리스트 →</Link>
          <a href={e2e?.setup?.urls?.partnerCps || '/partner/cps'} target="_blank" rel="noreferrer" className="font-bold text-cyan-700">
            파트너 CPS →
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
