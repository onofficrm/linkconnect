import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  fetchAdminAdApplyDetail,
  fetchAdminAdApplyList,
  MerchantAdApplication,
  updateAdminAdApplyStatus,
} from '../../lib/api';

const STATUS_OPTIONS = [
  ['', '전체'],
  ['draft', '작성 중'],
  ['submitted', '제출'],
  ['revision', '수정 요청'],
  ['accepted', '승인'],
  ['rejected', '반려'],
] as const;

function label(status: string) {
  return STATUS_OPTIONS.find(([v]) => v === status)?.[1] ?? status;
}

export function AdminAdApply() {
  const [items, setItems] = useState<MerchantAdApplication[]>([]);
  const [status, setStatus] = useState('submitted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<MerchantAdApplication | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminAdApplyList({ status });
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = async (maaId: number) => {
    try {
      const data = await fetchAdminAdApplyDetail(maaId);
      setSelected(data.application);
      setNote(data.application.adminNote || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '상세를 불러오지 못했습니다.');
    }
  };

  const setStatusAction = async (next: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const result = await updateAdminAdApplyStatus({ maaId: selected.id, status: next, note });
      if (result.application) setSelected(result.application);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeMenu="ad-apply" title="광고등록 신청" description="계약 체결 후 광고주가 제출한 캠페인 광고등록 신청서를 검수합니다.">
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(([value, text]) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => setStatus(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
              status === value ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <p className="p-6 text-slate-500 text-sm">불러오는 중…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-slate-500 text-sm">신청서가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void openDetail(item.id)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold text-slate-900 truncate">{item.campaignTitle || '(제목 없음)'}</span>
                      <span className="text-xs font-bold text-cyan-700 shrink-0">{label(item.status)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.merchantCompany || '-'} ({item.merchantCode || '-'}) · #{item.id}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 min-h-[320px]">
          {!selected ? (
            <p className="text-sm text-slate-500">왼쪽에서 신청서를 선택하세요.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <h2 className="text-lg font-bold text-slate-900">{selected.campaignTitle}</h2>
              <p className="text-slate-500">
                {selected.merchantCompany} ({selected.merchantCode}) · {label(selected.status)}
              </p>
              <p>
                <a href={selected.landingUrl} target="_blank" rel="noreferrer" className="text-cyan-700 underline break-all">
                  {selected.landingUrl}
                </a>
              </p>
              <div>
                <p className="font-semibold text-slate-700 mb-1">소개</p>
                <pre className="whitespace-pre-wrap text-slate-600 bg-slate-50 rounded-xl p-3 text-xs">{selected.intro}</pre>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">셀링 포인트</p>
                <pre className="whitespace-pre-wrap text-slate-600 bg-slate-50 rounded-xl p-3 text-xs">{selected.sellingPoints}</pre>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">키워드</p>
                <p className="text-xs text-slate-600">추천: {selected.recommendedKeywords || '-'}</p>
                <p className="text-xs text-slate-600">금지: {selected.forbiddenKeywords || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">유의사항</p>
                <pre className="whitespace-pre-wrap text-slate-600 bg-slate-50 rounded-xl p-3 text-xs">{selected.precautions}</pre>
              </div>
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">관리자 메모</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void setStatusAction('accepted')}
                  className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  승인
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void setStatusAction('revision')}
                  className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  수정 요청
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void setStatusAction('rejected')}
                  className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  반려
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
