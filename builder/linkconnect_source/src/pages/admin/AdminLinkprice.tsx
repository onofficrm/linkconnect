import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { RefreshCw, Search, Eye, EyeOff, Link2, FileJson, AlertTriangle } from 'lucide-react';
import {
  LpMerchant,
  LpSyncLog,
  LpNetworkConfig,
  LpPostback,
  fetchAdminLpMerchants,
  fetchAdminLpMerchant,
  syncAdminLpMerchants,
  updateAdminLpMerchant,
  saveAdminLpConfig,
  fetchAdminLpPostbacks,
  fetchAdminLpPostback,
  reprocessAdminLpPostback,
  syncAdminLpOrders,
} from '../../lib/api';

const subscriptLabel: Record<string, { label: string; cls: string }> = {
  APR: { label: '승인', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REQ: { label: '요청중', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  DEN: { label: '거부', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const pbStatusLabel: Record<string, { label: string; cls: string }> = {
  processed: { label: '정상', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unmatched: { label: '미매칭', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  duplicate: { label: '중복', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  error: { label: '오류', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  received: { label: '수신', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
};

type Tab = 'merchants' | 'postbacks' | 'orders';

export function AdminLinkprice() {
  const [tab, setTab] = useState<Tab>('merchants');
  const [items, setItems] = useState<LpMerchant[]>([]);
  const [total, setTotal] = useState(0);
  const [config, setConfig] = useState<LpNetworkConfig | null>(null);
  const [syncLogs, setSyncLogs] = useState<LpSyncLog[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dbReady, setDbReady] = useState(true);

  const [approvedOnly, setApprovedOnly] = useState(false);
  const [syncActive, setSyncActive] = useState<'all' | '1' | '0'>('all');
  const [visibleFilter, setVisibleFilter] = useState<'all' | '1' | '0'>('all');
  const [deeplinkOnly, setDeeplinkOnly] = useState(false);
  const [q, setQ] = useState('');
  const [code, setCode] = useState('');

  const [detail, setDetail] = useState<LpMerchant | null>(null);
  const [editRate, setEditRate] = useState('');
  const [editAlias, setEditAlias] = useState('');
  const [editNotice, setEditNotice] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [editRecommended, setEditRecommended] = useState(false);

  const [affiliateCode, setAffiliateCode] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [apiEnabled, setApiEnabled] = useState(false);
  const [defaultRate, setDefaultRate] = useState('70');

  const [pbItems, setPbItems] = useState<LpPostback[]>([]);
  const [pbTotal, setPbTotal] = useState(0);
  const [pbStatus, setPbStatus] = useState('');
  const [pbQ, setPbQ] = useState('');
  const [pbDetail, setPbDetail] = useState<LpPostback | null>(null);
  const [pbOrder, setPbOrder] = useState<Record<string, unknown> | null>(null);
  const [resyncDate, setResyncDate] = useState('');
  const [resyncMerchant, setResyncMerchant] = useState('');
  const [resyncOrder, setResyncOrder] = useState('');

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const load = useCallback(() => {
    const filters: Record<string, string | boolean | undefined> = {
      q: q || undefined,
      code: code || undefined,
      approved: approvedOnly || undefined,
      deeplink: deeplinkOnly || undefined,
    };
    if (syncActive !== 'all') filters.syncActive = syncActive === '1';
    if (visibleFilter !== 'all') filters.visible = visibleFilter === '1';

    fetchAdminLpMerchants(filters)
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
        setConfig(d.config);
        setSyncLogs(d.syncLogs ?? []);
        setDbReady(d.dbReady);
        if (d.config) {
          setAffiliateCode(d.config.affiliateCode || '');
          setApiEnabled(!!d.config.apiEnabled);
          setDefaultRate(String(d.config.defaultPartnerRate ?? 70));
        }
      })
      .catch((e) => {
        setItems([]);
        notify(e instanceof Error ? e.message : '목록 로드 실패');
      });
  }, [q, code, approvedOnly, syncActive, visibleFilter, deeplinkOnly]);

  const loadPostbacks = useCallback(() => {
    fetchAdminLpPostbacks({ status: pbStatus || undefined, q: pbQ || undefined })
      .then((d) => {
        setPbItems(d.items);
        setPbTotal(d.total);
      })
      .catch(() => setPbItems([]));
  }, [pbStatus, pbQ]);

  useEffect(() => {
    if (tab === 'merchants') load();
  }, [load, tab]);

  useEffect(() => {
    if (tab === 'postbacks') loadPostbacks();
  }, [loadPostbacks, tab]);

  const openPostback = async (p: LpPostback) => {
    setBusy(true);
    try {
      const res = await fetchAdminLpPostback(p.lppId);
      setPbDetail(res.item);
      setPbOrder(res.order as Record<string, unknown> | null);
    } catch (e) {
      notify(e instanceof Error ? e.message : '상세 조회 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleOrderSync = async (mode: string, extra?: { date?: string; merchantId?: string; orderCode?: string }) => {
    setBusy(true);
    try {
      const res = await syncAdminLpOrders({ mode, ...(extra ?? {}) });
      notify(res.message);
      if (res.config) setConfig(res.config);
    } catch (e) {
      notify(e instanceof Error ? e.message : '실적 동기화 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleReprocess = async (lppId: number) => {
    setBusy(true);
    try {
      const res = await reprocessAdminLpPostback(lppId);
      notify(res.message);
      loadPostbacks();
      if (res.item) setPbDetail(res.item);
    } catch (e) {
      notify(e instanceof Error ? e.message : '재처리 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async (scope: 'apr' | 'all' = 'apr') => {
    setBusy(true);
    try {
      const res = await syncAdminLpMerchants({ scope, detail: true });
      notify(res.message);
      if (res.config) setConfig(res.config);
      if (res.syncLogs) setSyncLogs(res.syncLogs);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '동기화 실패');
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleSaveConfig = async () => {
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        affiliateCode,
        apiEnabled,
        defaultPartnerRate: Number(defaultRate) || 70,
      };
      if (authKey.trim()) payload.apiAuthKey = authKey.trim();
      const res = await saveAdminLpConfig(payload);
      notify(res.message);
      setConfig(res.config);
      setAuthKey('');
    } catch (e) {
      notify(e instanceof Error ? e.message : '설정 저장 실패');
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (m: LpMerchant) => {
    setBusy(true);
    try {
      const res = await fetchAdminLpMerchant(m.lpmId);
      const item = res.item;
      setDetail(item);
      setEditRate(String(item.partnerRate ?? 70));
      setEditAlias(item.campaignAlias || '');
      setEditNotice(item.partnerNotice || '');
      setEditMemo(item.adminMemo || '');
      setEditRecommended(!!item.isRecommended);
    } catch (e) {
      notify(e instanceof Error ? e.message : '상세 조회 실패');
    } finally {
      setBusy(false);
    }
  };

  const saveDetail = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      const res = await updateAdminLpMerchant({
        lpmId: detail.lpmId,
        partnerRate: Number(editRate) || 0,
        campaignAlias: editAlias,
        partnerNotice: editNotice,
        adminMemo: editMemo,
        isRecommended: editRecommended,
        visible: detail.visible,
      });
      notify(res.message);
      setDetail(res.item);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  };

  const toggleVisible = async (m: LpMerchant) => {
    setBusy(true);
    try {
      await updateAdminLpMerchant({ lpmId: m.lpmId, visible: !m.visible });
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '노출 변경 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      activeMenu="linkprice"
      title="링크프라이스 CPS"
      description="CPS 광고주만 동기화·관리합니다. CPA 광고주는 수집하지 않습니다."
    >
      {message ? (
        <div className="mb-4 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium">{message}</div>
      ) : null}

      <div className="flex gap-2 mb-6">
        <button type="button" onClick={() => setTab('merchants')} className={`px-4 py-2 rounded-xl text-sm font-bold border ${tab === 'merchants' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-200'}`}>
          CPS 광고주
        </button>
        <button type="button" onClick={() => setTab('postbacks')} className={`px-4 py-2 rounded-xl text-sm font-bold border ${tab === 'postbacks' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-200'}`}>
          POSTBACK 수신
        </button>
        <button type="button" onClick={() => setTab('orders')} className={`px-4 py-2 rounded-xl text-sm font-bold border ${tab === 'orders' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-200'}`}>
          실적 동기화
        </button>
      </div>

      {!dbReady ? (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>lp_merchants 테이블이 없습니다. 마이그레이션 또는 install SQL을 먼저 적용하세요.</span>
        </div>
      ) : null}

      {tab === 'orders' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 mb-6">
          <h3 className="font-bold text-slate-900">실적 조회 API 재동기화</h3>
          <p className="text-sm text-slate-500">
            공식 translist API로 확정(210)·취소(310)·금액 변경을 반영합니다. 예상 실적은 장부에 넣지 않고, 확정 시에만 CREDIT 합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => handleOrderSync('last7')} className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">최근 7일</button>
            <button type="button" disabled={busy} onClick={() => handleOrderSync('day')} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-50">오늘</button>
            <button type="button" disabled={busy} onClick={() => handleOrderSync('this_month')} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-50">이번 달</button>
            <button type="button" disabled={busy} onClick={() => handleOrderSync('prev_month')} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-50">이전 달</button>
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs text-slate-600">
              특정일 (YYYYMMDD)
              <input
                type="text"
                value={resyncDate}
                onChange={(e) => setResyncDate(e.target.value)}
                placeholder={new Date().toISOString().slice(0, 10).replace(/-/g, '')}
                className="mt-1 block w-36 px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
              />
            </label>
            <button
              type="button"
              disabled={busy || !/^\d{8}$/.test(resyncDate)}
              onClick={() => handleOrderSync('day', { date: resyncDate })}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-50"
            >
              해당일 재조회
            </button>
            <label className="text-xs text-slate-600">
              광고주 코드
              <input
                type="text"
                value={resyncMerchant}
                onChange={(e) => setResyncMerchant(e.target.value)}
                className="mt-1 block w-32 px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
              />
            </label>
            <label className="text-xs text-slate-600">
              주문번호
              <input
                type="text"
                value={resyncOrder}
                onChange={(e) => setResyncOrder(e.target.value)}
                className="mt-1 block w-40 px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleOrderSync('last7', {
                merchantId: resyncMerchant || undefined,
                orderCode: resyncOrder || undefined,
              })}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-50"
            >
              필터 적용 동기화
            </button>
          </div>
          <p className="text-xs text-slate-500">마지막 실적 동기화: {config?.lastOrderSyncAt || '—'} · 크론: <code className="bg-slate-100 px-1 rounded">php cron/linkprice_sync_conversions.php --mode=last7</code></p>
          <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 space-y-1">
            <div><strong>상태 매핑</strong> 100→pending · 200→review · 210→approved · 300→cancel_pending · 310→canceled</div>
            <div>원본 status는 raw_status에 저장. 확정 후 취소·커미션 변경은 관리자 알림으로 표시됩니다.</div>
            <div>단건 재동기화는 실적 상세에서 sync_order_one(lpoId) API를 사용합니다.</div>
          </div>
        </div>
      ) : null}

      {tab === 'postbacks' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
            <label className="text-sm space-y-1">
              <span className="text-slate-500">상태</span>
              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={pbStatus} onChange={(e) => setPbStatus(e.target.value)}>
                <option value="">전체</option>
                <option value="processed">정상</option>
                <option value="unmatched">미매칭</option>
                <option value="duplicate">중복</option>
                <option value="error">오류</option>
                <option value="received">수신</option>
              </select>
            </label>
            <label className="text-sm space-y-1 flex-1 min-w-[180px]">
              <span className="text-slate-500">검색 (광고주/주문/trlog/u_id)</span>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={pbQ} onChange={(e) => setPbQ(e.target.value)} placeholder="검색" />
            </label>
            <div className="text-sm text-slate-500 pb-2">{pbTotal}건</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3">수신시각</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">광고주</th>
                  <th className="px-4 py-3">주문</th>
                  <th className="px-4 py-3">trlog</th>
                  <th className="px-4 py-3">u_id</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pbItems.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">POSTBACK 없음</td></tr>
                ) : pbItems.map((p) => {
                  const st = pbStatusLabel[p.processStatus] || { label: p.processStatus, cls: 'bg-slate-50 text-slate-500 border-slate-200' };
                  return (
                    <tr key={p.lppId} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-xs text-slate-500">{p.receivedAt}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded border ${st.cls}`}>{st.label}</span></td>
                      <td className="px-4 py-3 font-mono text-xs">{p.merchantCode || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.orderCode || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.trlogId || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{p.uId || '—'}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button type="button" className="text-xs font-bold text-cyan-700" onClick={() => openPostback(p)}>상세</button>
                        <button type="button" disabled={busy} className="text-xs font-bold text-slate-600" onClick={() => handleReprocess(p.lppId)}>재처리</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pbDetail ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50" onClick={() => setPbDetail(null)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between">
                  <h3 className="font-bold">POSTBACK #{pbDetail.lppId}</h3>
                  <button type="button" onClick={() => setPbDetail(null)}>닫기</button>
                </div>
                <div className="text-sm grid sm:grid-cols-2 gap-2">
                  <div>상태: <strong>{pbDetail.processStatus}</strong></div>
                  <div>매칭: {pbDetail.matchNote || '—'}</div>
                  <div>오류: {pbDetail.errorMessage || '—'}</div>
                  <div>IP: {pbDetail.requestIp}</div>
                </div>
                {pbOrder ? (
                  <div className="text-sm bg-slate-50 rounded-xl p-3 space-y-1">
                    <div className="font-bold">연결 실적 lpo#{String(pbOrder.lpoId)}</div>
                    <div>파트너 pt_id: {String(pbOrder.ptId)} · 상태 {String(pbOrder.lcStatus)}</div>
                    <div>LP 커미션 {String(pbOrder.lpCommission)} → 파트너 예상 {String(pbOrder.partnerExpected)} (확정 {String(pbOrder.partnerConfirmed)}) · 마진 {String(pbOrder.platformMargin)}</div>
                  </div>
                ) : null}
                <pre className="text-xs bg-slate-950 text-slate-100 rounded-xl p-3 overflow-x-auto max-h-72">{JSON.stringify(pbDetail.raw ?? {}, null, 2)}</pre>
                <button type="button" disabled={busy} onClick={() => handleReprocess(pbDetail.lppId)} className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold">재처리</button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'merchants' ? (
      <>
      {/* Config + Sync */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">API 설정</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border ${config?.ready ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              {config?.ready ? '연동 준비됨' : '설정 필요'}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm space-y-1">
              <span className="text-slate-500 font-medium">A코드</span>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={affiliateCode} onChange={(e) => setAffiliateCode(e.target.value)} placeholder="A100xxxxxx" />
            </label>
            <label className="text-sm space-y-1">
              <span className="text-slate-500 font-medium">auth_key {config?.apiAuthKeySet ? `(설정됨: ${config.apiAuthKeyMasked})` : ''}</span>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" type="password" value={authKey} onChange={(e) => setAuthKey(e.target.value)} placeholder="변경 시에만 입력" />
            </label>
            <label className="text-sm space-y-1">
              <span className="text-slate-500 font-medium">기본 파트너 지급률 %</span>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={defaultRate} onChange={(e) => setDefaultRate(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pt-6">
              <input type="checkbox" checked={apiEnabled} onChange={(e) => setApiEnabled(e.target.checked)} />
              API 사용
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={handleSaveConfig} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold disabled:opacity-50">
              설정 저장
            </button>
            <button type="button" disabled={busy} onClick={() => handleSync('apr')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">
              <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />
              승인 CPS 동기화
            </button>
            <button type="button" disabled={busy} onClick={() => handleSync('all')} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold disabled:opacity-50">
              전체 CPS 동기화
            </button>
          </div>
          <p className="text-xs text-slate-500">
            마지막 동기화: {config?.lastMerchantSyncAt || '—'} · 엔드포인트는 항상 <code className="bg-slate-100 px-1 rounded">/cps</code> (CPA 제외)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-3">최근 동기화</h3>
          <ul className="space-y-2 max-h-56 overflow-y-auto text-sm">
            {syncLogs.length === 0 ? (
              <li className="text-slate-400">기록 없음</li>
            ) : (
              syncLogs.map((log) => (
                <li key={log.lpsId} className="border border-slate-100 rounded-lg p-2">
                  <div className="flex justify-between gap-2">
                    <span className={log.success ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {log.success ? '성공' : '실패'}
                    </span>
                    <span className="text-slate-400 text-xs">{log.finishedAt || log.startedAt}</span>
                  </div>
                  <div className="text-slate-600 text-xs mt-1 truncate">{log.errorMessage || `${log.processedCount}건`}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-end">
        <label className="text-sm space-y-1">
          <span className="text-slate-500">광고주명</span>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="pl-8 border border-slate-200 rounded-lg px-3 py-2 text-sm w-40" value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색" />
          </div>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-slate-500">광고주 코드</span>
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-36" value={code} onChange={(e) => setCode(e.target.value)} placeholder="merchant_id" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pb-2">
          <input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />
          승인만
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pb-2">
          <input type="checkbox" checked={deeplinkOnly} onChange={(e) => setDeeplinkOnly(e.target.checked)} />
          딥링크
        </label>
        <label className="text-sm space-y-1">
          <span className="text-slate-500">활성</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={syncActive} onChange={(e) => setSyncActive(e.target.value as 'all' | '1' | '0')}>
            <option value="all">전체</option>
            <option value="1">활성</option>
            <option value="0">비활성</option>
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-slate-500">LC 노출</span>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={visibleFilter} onChange={(e) => setVisibleFilter(e.target.value as 'all' | '1' | '0')}>
            <option value="all">전체</option>
            <option value="1">노출</option>
            <option value="0">숨김</option>
          </select>
        </label>
        <div className="text-sm text-slate-500 pb-2 ml-auto">{total}건</div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">광고주</th>
                <th className="px-4 py-3 font-semibold">코드</th>
                <th className="px-4 py-3 font-semibold">카테고리</th>
                <th className="px-4 py-3 font-semibold">커미션</th>
                <th className="px-4 py-3 font-semibold">승인</th>
                <th className="px-4 py-3 font-semibold">상태</th>
                <th className="px-4 py-3 font-semibold">지급률</th>
                <th className="px-4 py-3 font-semibold">노출</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">광고주가 없습니다. 동기화를 실행하세요.</td>
                </tr>
              ) : (
                items.map((m) => {
                  const sub = subscriptLabel[m.subscript] || { label: m.subscript || '—', cls: 'bg-slate-50 text-slate-500 border-slate-200' };
                  return (
                    <tr key={m.lpmId} className="border-t border-slate-100 hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {m.merchantLogo ? <img src={m.merchantLogo} alt="" className="w-10 h-5 object-contain" /> : null}
                          <div>
                            <div className="font-bold text-slate-900">{m.campaignAlias || m.merchantName}</div>
                            {m.campaignAlias ? <div className="text-xs text-slate-400">{m.merchantName}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{m.merchantCode}</td>
                      <td className="px-4 py-3 text-slate-600">{m.categoryName || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>PC {m.commissionPc || '—'}</div>
                        <div>MO {m.commissionMobile || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${sub.cls}`}>{sub.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${m.syncActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {m.syncActive ? '활성' : '비활성'}
                        </span>
                        {m.deeplinkYn === 'Y' ? (
                          <span className="ml-1 inline-flex text-cyan-600" title="딥링크"><Link2 size={12} /></span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-medium">{m.partnerRate}%</td>
                      <td className="px-4 py-3">
                        <button type="button" disabled={busy} onClick={() => toggleVisible(m)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-white" title="노출 토글">
                          {m.visible ? <Eye size={16} className="text-cyan-600" /> : <EyeOff size={16} className="text-slate-400" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => openDetail(m)} className="text-xs font-bold text-cyan-700 hover:underline">
                          상세
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detail.merchantName}</h3>
                <p className="text-sm text-slate-500 font-mono">{detail.merchantCode}</p>
              </div>
              <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => setDetail(null)}>닫기</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">PC 커미션</span><div className="font-medium">{detail.commissionPc || '—'}</div></div>
              <div><span className="text-slate-500">모바일 커미션</span><div className="font-medium">{detail.commissionMobile || '—'}</div></div>
              <div className="sm:col-span-2"><span className="text-slate-500">클릭 URL</span><div className="font-mono text-xs break-all">{detail.clickUrl || '—'}</div></div>
              <div className="sm:col-span-2"><span className="text-slate-500">광고 제한 (deny_ad)</span><div className="text-slate-700 whitespace-pre-wrap">{detail.denyAd || '—'}</div></div>
              <div className="sm:col-span-2"><span className="text-slate-500">상품 제한 (deny_product)</span><div className="text-slate-700 whitespace-pre-wrap">{detail.denyProduct || '—'}</div></div>
              <div className="sm:col-span-2"><span className="text-slate-500">정산 기준</span><div className="text-slate-700">{detail.commissionPaymentStandard || '—'}</div></div>
              <div className="sm:col-span-2"><span className="text-slate-500">유의사항</span><div className="text-slate-700 whitespace-pre-wrap">{detail.notice || '—'}</div></div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">관리자 설정 (API 동기화로 덮어쓰지 않음)</h4>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={!!detail.visible} onChange={(e) => setDetail({ ...detail, visible: e.target.checked })} />
                링크커넥트 노출
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={editRecommended} onChange={(e) => setEditRecommended(e.target.checked)} />
                추천 광고주
              </label>
              <label className="block text-sm space-y-1">
                <span className="text-slate-500">파트너 지급률 %</span>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2" value={editRate} onChange={(e) => setEditRate(e.target.value)} />
              </label>
              <label className="block text-sm space-y-1">
                <span className="text-slate-500">별도 캠페인명</span>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2" value={editAlias} onChange={(e) => setEditAlias(e.target.value)} />
              </label>
              <label className="block text-sm space-y-1">
                <span className="text-slate-500">파트너 안내문</span>
                <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 min-h-[80px]" value={editNotice} onChange={(e) => setEditNotice(e.target.value)} />
              </label>
              <label className="block text-sm space-y-1">
                <span className="text-slate-500">관리자 메모</span>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2" value={editMemo} onChange={(e) => setEditMemo(e.target.value)} />
              </label>
              <button type="button" disabled={busy} onClick={saveDetail} className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">
                저장
              </button>
            </div>

            {detail.raw ? (
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                  <FileJson size={16} /> 원본 데이터
                </div>
                <pre className="text-xs bg-slate-950 text-slate-100 rounded-xl p-3 overflow-x-auto max-h-64">
                  {JSON.stringify(detail.raw, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      </>
      ) : null}
    </AdminLayout>
  );
}
