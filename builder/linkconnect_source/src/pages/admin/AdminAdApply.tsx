import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  AD_APPLY_ALLOWED_CHANNELS,
  AD_APPLY_FORBIDDEN_CHANNELS,
} from '../../lib/adApplyExamples';
import {
  adminAdApplyAssetUrl,
  fetchAdminAdApplyDetail,
  fetchAdminAdApplyList,
  MerchantAdApplication,
  updateAdminAdApplyStatus,
} from '../../lib/api';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

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

function channelLabels(ids: string[] | undefined, catalog: readonly { id: string; label: string }[]) {
  if (!ids?.length) return [];
  return ids.map((id) => catalog.find((c) => c.id === id)?.label ?? id);
}

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-slate-700 mb-1">{title}</p>
      {children}
    </div>
  );
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

  const allowed = channelLabels(selected?.allowedChannels, AD_APPLY_ALLOWED_CHANNELS);
  const forbidden = channelLabels(selected?.forbiddenChannels, AD_APPLY_FORBIDDEN_CHANNELS);
  const bannerSrc = selected?.bannerUrl ? adminAdApplyAssetUrl(selected.bannerUrl) : '';
  const extras = selected?.assets ?? [];

  return (
    <AdminLayout activeMenu="ad-apply" title="광고등록 신청" description="계약 체결 후 광고주가 제출한 캠페인 광고등록 신청서·배너·첨부 소재를 검수합니다.">
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
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${selected?.id === item.id ? 'bg-cyan-50' : ''}`}
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold text-slate-900 truncate">{item.campaignTitle || '(제목 없음)'}</span>
                      <span className="text-xs font-bold text-cyan-700 shrink-0">{label(item.status)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.merchantCompany || '-'} ({item.merchantCode || '-'}) · #{item.id}
                      {item.hasBanner ? ' · 배너' : ''}
                      {(item.assets?.length ?? 0) > 0 ? ` · 첨부 ${item.assets.length}` : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 min-h-[320px] max-h-[80vh] overflow-y-auto">
          {!selected ? (
            <p className="text-sm text-slate-500">왼쪽에서 신청서를 선택하면 광고주가 제출한 전체 내용을 확인할 수 있습니다.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.campaignTitle || '(제목 없음)'}</h2>
                <p className="text-slate-500 mt-1">
                  {selected.merchantCompany || '-'} ({selected.merchantCode || '-'}) · {label(selected.status)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  제출 {formatDate(selected.submittedAt)} · 검수 {formatDate(selected.reviewedAt)} · 수정 {formatDate(selected.updatedAt)}
                </p>
              </div>

              <DetailBlock title="랜딩페이지">
                {selected.landingUrl ? (
                  <a href={selected.landingUrl} target="_blank" rel="noreferrer" className="text-cyan-700 underline break-all">
                    {selected.landingUrl}
                  </a>
                ) : (
                  <p className="text-slate-400">-</p>
                )}
              </DetailBlock>

              <DetailBlock title="소개">
                <pre className="whitespace-pre-wrap text-slate-600 bg-slate-50 rounded-xl p-3 text-xs">{selected.intro || '-'}</pre>
              </DetailBlock>

              <DetailBlock title="셀링 포인트">
                <pre className="whitespace-pre-wrap text-slate-600 bg-slate-50 rounded-xl p-3 text-xs">{selected.sellingPoints || '-'}</pre>
              </DetailBlock>

              <DetailBlock title="허용 채널">
                {allowed.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allowed.map((c) => (
                      <span key={c} className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium">{c}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">-</p>
                )}
              </DetailBlock>

              <DetailBlock title="금지 채널">
                {forbidden.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {forbidden.map((c) => (
                      <span key={c} className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">{c}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">-</p>
                )}
              </DetailBlock>

              <DetailBlock title="키워드">
                <p className="text-xs text-slate-600">추천: {selected.recommendedKeywords || '-'}</p>
                <p className="text-xs text-slate-600 mt-1">금지: {selected.forbiddenKeywords || '-'}</p>
              </DetailBlock>

              <DetailBlock title="유의사항">
                <pre className="whitespace-pre-wrap text-slate-600 bg-slate-50 rounded-xl p-3 text-xs">{selected.precautions || '-'}</pre>
              </DetailBlock>

              <DetailBlock title="홍보 배너">
                {bannerSrc ? (
                  <div className="space-y-2">
                    <a href={bannerSrc} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <img src={bannerSrc} alt={selected.bannerName || '배너'} className="w-full max-h-64 object-contain bg-white" />
                    </a>
                    <a
                      href={bannerSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline"
                    >
                      <ImageIcon size={14} />
                      {selected.bannerName || '배너 원본 보기'}
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-400">등록된 배너가 없습니다.</p>
                )}
              </DetailBlock>

              <DetailBlock title={`추가 첨부 소재 (${extras.length})`}>
                {extras.length ? (
                  <ul className="space-y-2">
                    {extras.map((asset) => {
                      const href = adminAdApplyAssetUrl(asset.url);
                      const isImage = (asset.mime || '').startsWith('image/');
                      return (
                        <li key={asset.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                          {isImage ? (
                            <a href={href} target="_blank" rel="noreferrer" className="block bg-white border-b border-slate-100">
                              <img src={href} alt={asset.filename} className="w-full max-h-40 object-contain" />
                            </a>
                          ) : null}
                          <div className="flex items-center justify-between gap-2 px-3 py-2">
                            <div className="min-w-0 flex items-center gap-2">
                              {isImage ? <ImageIcon size={14} className="text-slate-400 shrink-0" /> : <FileText size={14} className="text-slate-400 shrink-0" />}
                              <span className="text-xs text-slate-700 truncate">{asset.filename}</span>
                            </div>
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 shrink-0 hover:underline"
                            >
                              <Download size={12} /> 열기
                            </a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-slate-400">추가 첨부 파일이 없습니다.</p>
                )}
              </DetailBlock>

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
