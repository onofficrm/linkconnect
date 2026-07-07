import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { SummaryCard, StatusBadge } from '../../components/admin/AdminShared';
import { Gift, Megaphone, Clock, Calendar, Search, Plus, X, Edit3 } from 'lucide-react';
import {
  AdminEvent,
  AdminEventSummary,
  fetchAdminEvents,
  saveAdminEvent,
  updateAdminEventStatus,
} from '../../lib/api';

const emptySummary: AdminEventSummary = {
  total: 0,
  active: 0,
  closing: 0,
  scheduled: 0,
  ended: 0,
};

const typeOptions = ['파트너 보너스', '단가 상승', '랭킹 이벤트', '신규 캠페인', '광고주 프로모션', '광고비 충전 보너스'];
const statusOptions = [
  { label: '전체 상태', value: '' },
  { label: '진행중', value: 'active' },
  { label: '마감임박', value: 'closing' },
  { label: '예정', value: 'scheduled' },
  { label: '종료', value: 'ended' },
];

type EventForm = {
  id: number;
  code: string;
  title: string;
  type: string;
  desc: string;
  period: string;
  product: string;
  benefit: string;
  campaigns: string;
  badges: string;
  ribbon: string;
  statusCode: string;
  featured: boolean;
  sort: number;
};

function toForm(event: AdminEvent | null, isNew = false): EventForm {
  if (!event || isNew) {
    return {
      id: 0,
      code: '자동생성',
      title: '',
      type: typeOptions[0],
      desc: '',
      period: '',
      product: '',
      benefit: '',
      campaigns: '',
      badges: '진행중',
      ribbon: '',
      statusCode: 'active',
      featured: false,
      sort: 0,
    };
  }

  return {
    id: event.id,
    code: event.code,
    title: event.title,
    type: event.type,
    desc: event.desc,
    period: event.period,
    product: event.product,
    benefit: event.benefit,
    campaigns: event.campaigns,
    badges: event.badges.join(', '),
    ribbon: event.ribbon,
    statusCode: event.statusCode,
    featured: event.featured,
    sort: event.sort,
  };
}

export function AdminEvents() {
  const [items, setItems] = useState<AdminEvent[]>([]);
  const [summary, setSummary] = useState<AdminEventSummary>(emptySummary);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(toForm(null, true));
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadEvents = useCallback(() => {
    fetchAdminEvents({ q: search, status: statusFilter })
      .then((data) => {
        setItems(data.items);
        setSummary(data.summary);
      })
      .catch(() => {});
  }, [search, statusFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openCreate = () => {
    setForm(toForm(null, true));
    setModalOpen(true);
  };

  const openEdit = (event: AdminEvent) => {
    setForm(toForm(event));
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminEvent({
        action: form.id ? 'update' : 'create',
        evId: form.id,
        title: form.title,
        type: form.type,
        desc: form.desc,
        period: form.period,
        product: form.product,
        benefit: form.benefit,
        campaigns: form.campaigns,
        badges: form.badges.split(',').map((s) => s.trim()).filter(Boolean),
        ribbon: form.ribbon,
        statusCode: form.statusCode,
        featured: form.featured,
        sort: form.sort,
      });
      setModalOpen(false);
      loadEvents();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (evId: number, action: string) => {
    setProcessingId(evId);
    try {
      await updateAdminEventStatus({ action, evId });
      loadEvents();
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout activeMenu="events" title="이벤트/프로모션 관리" description="이벤트 등록, CPA 연결, 노출 상태를 관리하세요.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="전체 이벤트" value={String(summary.total)} suffix="개" icon={<Gift size={18} />} />
        <SummaryCard title="진행중" value={String(summary.active)} suffix="개" color="cyan" highlight icon={<Megaphone size={18} />} />
        <SummaryCard title="마감임박" value={String(summary.closing)} suffix="개" color="yellow" highlight icon={<Clock size={18} />} />
        <SummaryCard title="예정" value={String(summary.scheduled)} suffix="개" color="emerald" highlight icon={<Calendar size={18} />} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이벤트명, 코드, 상품 검색"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button type="button" onClick={loadEvents} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">조회</button>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-sm font-bold">
            <Plus size={16} /> 이벤트 등록
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">코드</th>
                <th className="px-4 py-3 font-medium">이벤트명</th>
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">기간</th>
                <th className="px-4 py-3 font-medium">적용 상품</th>
                <th className="px-4 py-3 font-medium text-center">상태</th>
                <th className="px-4 py-3 font-medium text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">등록된 이벤트가 없습니다.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-mono text-xs text-slate-600">{item.code}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    {item.featured && <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded mt-1 inline-block">추천</span>}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{item.type}</td>
                  <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{item.period}</td>
                  <td className="px-4 py-4 text-slate-600 max-w-[220px] truncate">{item.product || item.campaigns}</td>
                  <td className="px-4 py-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      <button type="button" onClick={() => openEdit(item)} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1">
                        <Edit3 size={12} /> 수정
                      </button>
                      {item.statusCode !== 'active' && (
                        <button type="button" disabled={processingId === item.id} onClick={() => handleStatus(item.id, 'activate')} className="px-2 py-1 text-xs font-bold text-cyan-700 hover:bg-cyan-50 rounded-lg">진행</button>
                      )}
                      {item.statusCode === 'active' && (
                        <button type="button" disabled={processingId === item.id} onClick={() => handleStatus(item.id, 'closing')} className="px-2 py-1 text-xs font-bold text-orange-700 hover:bg-orange-50 rounded-lg">마감임박</button>
                      )}
                      {item.statusCode !== 'ended' && (
                        <button type="button" disabled={processingId === item.id} onClick={() => handleStatus(item.id, 'end')} className="px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg">종료</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0">
              <h3 className="font-bold text-slate-900">{form.id ? '이벤트 수정' : '이벤트 등록'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">이벤트 코드</label>
                  <input value={form.code} disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">유형</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm">
                    {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">이벤트명 *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">설명</label>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">기간</label>
                  <input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="2026.10.01 ~ 10.31" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">상태</label>
                  <select value={form.statusCode} onChange={(e) => setForm({ ...form, statusCode: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm">
                    <option value="active">진행중</option>
                    <option value="closing">마감임박</option>
                    <option value="scheduled">예정</option>
                    <option value="ended">종료</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">적용 상품</label>
                  <input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">혜택</label>
                  <input value={form.benefit} onChange={(e) => setForm({ ...form, benefit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">연결 CPA (표시용)</label>
                <input value={form.campaigns} onChange={(e) => setForm({ ...form, campaigns: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">뱃지 (쉼표 구분)</label>
                  <input value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} placeholder="진행중, 단가 상승" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">리본 문구</label>
                  <input value={form.ribbon} onChange={(e) => setForm({ ...form, ribbon: e.target.value })} placeholder="마감 3일전" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                추천 이벤트로 노출
              </label>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold">취소</button>
              <button type="button" onClick={handleSave} disabled={saving || !form.title.trim()} className="py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold disabled:opacity-50">{saving ? '저장 중…' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
