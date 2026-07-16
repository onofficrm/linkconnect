import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav, formatWon, truncate } from '../../../components/cps/CpsShared';
import {
  LpMerchant,
  bulkUpdateAdminLpMerchants,
  fetchAdminLpMerchants,
  syncAdminLpMerchants,
  updateAdminLpMerchant,
} from '../../../lib/api';

type FilterMode = 'all' | 'apr_hidden' | 'visible';

export function AdminCpsMerchants() {
  const [items, setItems] = useState<LpMerchant[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [detail, setDetail] = useState<LpMerchant | null>(null);
  const [rate, setRate] = useState('');
  const [partnerNotice, setPartnerNotice] = useState('');
  const [campaignAlias, setCampaignAlias] = useState('');

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3500);
  };

  const load = useCallback(() => {
    fetchAdminLpMerchants({ q: q || undefined, limit: 200, approved: filter !== 'all' ? true : undefined })
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
        setSelected([]);
      })
      .catch(() => setItems([]));
  }, [q, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems = useMemo(() => {
    if (filter === 'apr_hidden') {
      return items.filter((m) => m.subscript === 'APR' && m.syncActive && !m.visible);
    }
    if (filter === 'visible') {
      return items.filter((m) => m.visible);
    }
    return items;
  }, [items, filter]);

  const stats = useMemo(() => {
    const apr = items.filter((m) => m.subscript === 'APR' && m.syncActive);
    return {
      apr: apr.length,
      visible: items.filter((m) => m.visible).length,
      partnerVisible: items.filter((m) => m.partnerVisible).length,
      hiddenApr: apr.filter((m) => !m.visible).length,
    };
  }, [items]);

  const sync = async () => {
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

  const toggleVisible = async (m: LpMerchant) => {
    setBusy(true);
    try {
      await updateAdminLpMerchant({ lpmId: m.lpmId, visible: !m.visible });
      notify(m.visible ? '노출이 해제되었습니다.' : '노출이 설정되었습니다.');
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  };

  const bulkVisible = async (visible: boolean) => {
    if (!selected.length) {
      notify('선택된 광고주가 없습니다.');
      return;
    }
    setBusy(true);
    try {
      const res = await bulkUpdateAdminLpMerchants({ lpmIds: selected, visible });
      notify(res.message);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '일괄 변경 실패');
    } finally {
      setBusy(false);
    }
  };

  const enableAllHiddenApr = async () => {
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

  const openDetail = (m: LpMerchant) => {
    setDetail(m);
    setRate(String(m.partnerRate));
    setPartnerNotice(m.partnerNotice || '');
    setCampaignAlias(m.campaignAlias || '');
  };

  const saveDetail = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      await updateAdminLpMerchant({
        lpmId: detail.lpmId,
        partnerRate: Number(rate),
        partnerNotice: partnerNotice.trim(),
        campaignAlias: campaignAlias.trim(),
      });
      notify('광고주 설정이 저장되었습니다.');
      setDetail(null);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  };

  const allSelected = filteredItems.length > 0 && filteredItems.every((m) => selected.includes(m.lpmId));

  return (
    <AdminLayout activeMenu="cps" title="CPS 광고주 관리" description="링크프라이스 CPS 광고주">
      <AdminCpsSubnav active="merchants" />
      {msg ? <div className="mb-4 text-sm text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2">{msg}</div> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-slate-500">APR 승인</div>
          <div className="text-2xl font-bold">{stats.apr}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-slate-500">노출 ON</div>
          <div className="text-2xl font-bold text-emerald-700">{stats.visible}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-slate-500">공개·파트너 노출</div>
          <div className="text-2xl font-bold text-cyan-700">{stats.partnerVisible}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-slate-500">APR 미노출</div>
          <div className="text-2xl font-bold text-amber-700">{stats.hiddenApr}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="광고주명·코드 검색" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <button type="button" disabled={busy} onClick={sync} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-50">
            <RefreshCw size={16} /> 동기화
          </button>
          <span className="text-xs text-slate-500">{total}건</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {([
            ['all', '전체'],
            ['apr_hidden', 'APR 미노출'],
            ['visible', '노출 ON'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                filter === id ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
          {stats.hiddenApr > 0 ? (
            <button type="button" disabled={busy} onClick={enableAllHiddenApr} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white disabled:opacity-50">
              APR 미노출 일괄 ON ({stats.hiddenApr})
            </button>
          ) : null}
          {selected.length > 0 ? (
            <>
              <button type="button" disabled={busy} onClick={() => bulkVisible(true)} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 text-emerald-700">
                선택 노출 ON ({selected.length})
              </button>
              <button type="button" disabled={busy} onClick={() => bulkVisible(false)} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-700">
                선택 노출 OFF
              </button>
            </>
          ) : null}
          <Link to="/admin/cps/setup" className="text-xs font-bold text-cyan-700 ml-auto">
            운영 체크리스트 →
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => setSelected(e.target.checked ? filteredItems.map((m) => m.lpmId) : [])}
                  />
                </th>
                <th className="text-left px-4 py-3">광고주</th>
                <th className="text-left px-3 py-3">코드</th>
                <th className="text-left px-3 py-3">목록 설명</th>
                <th className="text-left px-3 py-3">카테고리</th>
                <th className="text-left px-3 py-3">제휴</th>
                <th className="text-right px-3 py-3">지급률</th>
                <th className="text-center px-3 py-3">노출</th>
                <th className="text-center px-3 py-3">파트너노출</th>
                <th className="text-right px-3 py-3">클릭</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-slate-400">광고주가 없습니다.</td></tr>
              ) : filteredItems.map((m) => (
                <tr key={m.lpmId} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(m.lpmId)}
                      onChange={(e) => {
                        setSelected((prev) =>
                          e.target.checked ? [...prev, m.lpmId] : prev.filter((id) => id !== m.lpmId),
                        );
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {m.merchantLogo ? <img src={m.merchantLogo} alt="" className="w-8 h-8 rounded-lg object-contain bg-white border" /> : <div className="w-8 h-8 rounded-lg bg-slate-100" />}
                      <span className="font-medium truncate max-w-[160px]">{m.campaignAlias || m.merchantName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">{m.merchantCode}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs max-w-[200px]">
                    <span className="line-clamp-2" title={m.partnerNotice || m.notice || ''}>
                      {m.partnerNotice || m.notice || <span className="text-slate-300">미지정</span>}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{m.categoryName || '—'}</td>
                  <td className="px-3 py-3">{m.subscript || '—'}</td>
                  <td className="px-3 py-3 text-right font-bold">{m.partnerRate}%</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleVisible(m)}
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        m.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.visible ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center text-xs">{m.partnerVisible ? 'Y' : 'N'}</td>
                  <td className="px-3 py-3 text-right">{m.clicks ?? 0}</td>
                  <td className="px-3 py-3">
                    <button type="button" className="text-xs font-bold text-cyan-700" onClick={() => openDetail(m)}>상세</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="font-bold text-lg">{detail.merchantName}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{detail.merchantCode} · LP {detail.commissionMobile || detail.commissionPc || '—'}</p>
              <p className="text-xs text-slate-500 mt-1">노출 커미션: {truncate(detail.partnerDisplayCommission || '', 40)}</p>
            </div>
            <label className="block text-sm font-medium text-slate-700">표시 이름 (선택)
              <input
                value={campaignAlias}
                onChange={(e) => setCampaignAlias(e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                placeholder={detail.merchantName}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">파트너 지급률 (%)
              <input value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700">목록 설명
              <textarea
                value={partnerNotice}
                onChange={(e) => setPartnerNotice(e.target.value)}
                rows={4}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-y min-h-[96px]"
                placeholder="공개·파트너 CPS 목록에 표시할 설명을 입력하세요"
              />
            </label>
            <p className="text-[11px] text-slate-400 -mt-2">
              비우면 링크프라이스 공지(동기화)가 사용됩니다. 입력 값은 동기화에 덮어쓰이지 않습니다.
            </p>
            {detail.notice ? (
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[11px] font-bold text-slate-500 mb-1">LP 원본 공지</p>
                <p className="text-xs text-slate-600 whitespace-pre-wrap break-words line-clamp-4">{detail.notice}</p>
              </div>
            ) : null}
            <div className="flex gap-2 justify-end pt-1">
              <button type="button" className="px-4 py-2 rounded-xl border text-sm" onClick={() => setDetail(null)}>닫기</button>
              <button type="button" disabled={busy} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-50" onClick={saveDetail}>저장</button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
