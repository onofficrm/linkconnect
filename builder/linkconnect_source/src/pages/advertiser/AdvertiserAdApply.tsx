import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Lightbulb, Loader2, Upload, X } from 'lucide-react';
import { AdvertiserLayout } from '../../layouts/AdvertiserLayout';
import {
  AD_APPLY_ALLOWED_CHANNELS,
  AD_APPLY_EXAMPLES,
  AD_APPLY_FORBIDDEN_CHANNELS,
  type AdApplyExampleKey,
} from '../../lib/adApplyExamples';
import {
  deleteMerchantAdApplyAsset,
  fetchMerchantAdApply,
  merchantAdApplyAssetUrl,
  MerchantAdApplication,
  PartnerApiError,
  saveMerchantAdApplyDraft,
  submitMerchantAdApply,
  uploadMerchantAdApplyFile,
} from '../../lib/api';
import { getLcAuth, getMerchantContractPath } from '../../lib/auth';

type FormState = {
  campaignTitle: string;
  landingUrl: string;
  intro: string;
  sellingPoints: string;
  allowedChannels: string[];
  forbiddenChannels: string[];
  recommendedKeywords: string;
  forbiddenKeywords: string;
  precautions: string;
};

const EMPTY_FORM: FormState = {
  campaignTitle: '',
  landingUrl: '',
  intro: '',
  sellingPoints: '',
  allowedChannels: AD_APPLY_ALLOWED_CHANNELS.map((c) => c.id),
  forbiddenChannels: AD_APPLY_FORBIDDEN_CHANNELS.map((c) => c.id),
  recommendedKeywords: '',
  forbiddenKeywords: '',
  precautions: '',
};

function formFromApi(app: MerchantAdApplication): FormState {
  return {
    campaignTitle: app.campaignTitle || '',
    landingUrl: app.landingUrl || '',
    intro: app.intro || '',
    sellingPoints: app.sellingPoints || '',
    allowedChannels: app.allowedChannels?.length ? app.allowedChannels : EMPTY_FORM.allowedChannels,
    forbiddenChannels: app.forbiddenChannels?.length ? app.forbiddenChannels : EMPTY_FORM.forbiddenChannels,
    recommendedKeywords: app.recommendedKeywords || '',
    forbiddenKeywords: app.forbiddenKeywords || '',
    precautions: app.precautions || '',
  };
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: '작성 중',
    submitted: '제출 완료 · 검수 대기',
    revision: '수정 요청',
    accepted: '승인됨',
    rejected: '반려',
  };
  return map[status] ?? status;
}

export function AdvertiserAdApply() {
  const auth = getLcAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [application, setApplication] = useState<MerchantAdApplication | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [exampleKey, setExampleKey] = useState<AdApplyExampleKey>('section1');

  const example = AD_APPLY_EXAMPLES[exampleKey];
  const readOnly = application?.status === 'accepted' || application?.status === 'submitted';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMerchantAdApply();
      setApplication(data.application);
      setForm(formFromApi(data.application));
    } catch (err) {
      if (err instanceof PartnerApiError && err.code === 'CONTRACT_REQUIRED') {
        setError('계약 체결 후 광고등록 신청이 가능합니다.');
      } else {
        setError(err instanceof Error ? err.message : '신청서를 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const payload = useMemo(
    () => ({
      maaId: application?.id ?? 0,
      campaignTitle: form.campaignTitle,
      landingUrl: form.landingUrl,
      intro: form.intro,
      sellingPoints: form.sellingPoints,
      allowedChannels: form.allowedChannels,
      forbiddenChannels: form.forbiddenChannels,
      recommendedKeywords: form.recommendedKeywords,
      forbiddenKeywords: form.forbiddenKeywords,
      precautions: form.precautions,
    }),
    [application?.id, form],
  );

  const toggleChannel = (list: 'allowedChannels' | 'forbiddenChannels', id: string) => {
    setForm((prev) => {
      const has = prev[list].includes(id);
      return {
        ...prev,
        [list]: has ? prev[list].filter((x) => x !== id) : [...prev[list], id],
      };
    });
  };

  const applyExample = () => {
    if (!example.apply) return;
    setForm((prev) => ({ ...prev, ...example.apply }));
    setSuccess('예시 내용을 양식에 적용했습니다. 필요하면 수정해 주세요.');
  };

  const handleSave = async (submit: boolean) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const result = submit ? await submitMerchantAdApply(payload) : await saveMerchantAdApplyDraft(payload);
      if (result.application) {
        setApplication(result.application);
        setForm(formFromApi(result.application));
      }
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (kind: 'banner' | 'extra', file: File | null) => {
    if (!file || !application?.id) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await saveMerchantAdApplyDraft(payload);
      const result = await uploadMerchantAdApplyFile(application.id, kind, file);
      if (result.application) {
        setApplication(result.application);
        setForm(formFromApi(result.application));
      }
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (!application?.id) return;
    if (!window.confirm('이 파일을 삭제할까요?')) return;
    setUploading(true);
    try {
      const result = await deleteMerchantAdApplyAsset(application.id, assetId);
      if (result.application) setApplication(result.application);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  if (!auth.merchantContractSigned) {
    return <Navigate to={getMerchantContractPath(auth)} replace />;
  }

  return (
    <AdvertiserLayout activeMenu="ad-apply" title="캠페인 광고등록 신청서">
      <div className="mb-6 rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50 via-white to-slate-50 px-5 py-4">
        <p className="text-sm text-slate-600">
          각 항목 옆의 <strong className="text-cyan-700">[💡 예시보기]</strong>를 누르면 우측에서 추천 템플릿을 확인하고 바로 적용할 수 있습니다.
          제출 후 관리자 검수를 거쳐 캠페인 상세페이지로 전환됩니다.
        </p>
        {application ? (
          <p className="mt-2 text-xs font-semibold text-slate-500">
            상태: <span className="text-cyan-700">{statusLabel(application.status)}</span>
            {application.adminNote ? ` · 관리자 메모: ${application.adminNote}` : ''}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} /> {success}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-20 justify-center">
          <Loader2 className="animate-spin" size={20} /> 불러오는 중…
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <div className="space-y-6">
            <Section
              step={1}
              title="머천트 소개 및 셀링 포인트 (서술형)"
              onExample={() => setExampleKey('section1')}
            >
              <Field
                label="캠페인 제목"
                required
                onExample={() => setExampleKey('campaignTitle')}
              >
                <input
                  disabled={readOnly}
                  value={form.campaignTitle}
                  onChange={(e) => setForm((p) => ({ ...p, campaignTitle: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="예: 부산 흥신소 | 사람찾기·비밀보장"
                />
              </Field>
              <Field label="랜딩페이지 URL" required onExample={() => setExampleKey('landingUrl')}>
                <input
                  disabled={readOnly}
                  value={form.landingUrl}
                  onChange={(e) => setForm((p) => ({ ...p, landingUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="https://"
                />
              </Field>
              <Field label="머천트/행사 소개글 (상세페이지 최상단 기재용)" onExample={() => setExampleKey('intro')}>
                <textarea
                  disabled={readOnly}
                  rows={5}
                  value={form.intro}
                  onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </Field>
              <Field
                label="주요 혜택 및 셀링 포인트 (마케터 홍보용 사은품 및 특전)"
                onExample={() => setExampleKey('sellingPoints')}
              >
                <textarea
                  disabled={readOnly}
                  rows={5}
                  value={form.sellingPoints}
                  onChange={(e) => setForm((p) => ({ ...p, sellingPoints: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </Field>
            </Section>

            <Section step={2} title="홍보 채널 및 키워드 정책" onExample={() => setExampleKey('section2')}>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">허용 홍보 채널</p>
                <div className="flex flex-wrap gap-2">
                  {AD_APPLY_ALLOWED_CHANNELS.map((ch) => (
                    <label
                      key={ch.id}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${
                        form.allowedChannels.includes(ch.id)
                          ? 'border-cyan-400 bg-cyan-50 text-cyan-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={form.allowedChannels.includes(ch.id)}
                        onChange={() => toggleChannel('allowedChannels', ch.id)}
                      />
                      {ch.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">금지 홍보 채널</p>
                <div className="flex flex-wrap gap-2">
                  {AD_APPLY_FORBIDDEN_CHANNELS.map((ch) => (
                    <label
                      key={ch.id}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${
                        form.forbiddenChannels.includes(ch.id)
                          ? 'border-rose-300 bg-rose-50 text-rose-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={form.forbiddenChannels.includes(ch.id)}
                        onChange={() => toggleChannel('forbiddenChannels', ch.id)}
                      />
                      {ch.label}
                    </label>
                  ))}
                </div>
              </div>
              <Field label="추천 키워드 (쉼표로 구분)" onExample={() => setExampleKey('recommendedKeywords')}>
                <input
                  disabled={readOnly}
                  value={form.recommendedKeywords}
                  onChange={(e) => setForm((p) => ({ ...p, recommendedKeywords: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </Field>
              <Field label="금지 키워드 (쉼표로 구분)" onExample={() => setExampleKey('forbiddenKeywords')}>
                <input
                  disabled={readOnly}
                  value={form.forbiddenKeywords}
                  onChange={(e) => setForm((p) => ({ ...p, forbiddenKeywords: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </Field>
              <Field label="세부 유의사항 (직접 입력/수정 가능)" onExample={() => setExampleKey('precautions')}>
                <textarea
                  disabled={readOnly}
                  rows={4}
                  value={form.precautions}
                  onChange={(e) => setForm((p) => ({ ...p, precautions: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </Field>
            </Section>

            <Section step={3} title="홍보 배너 (1600 x 900 px)" onExample={() => setExampleKey('section3')}>
              <Field label="메인 와이드 배너 이미지 업로드" onExample={() => setExampleKey('banner')}>
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-10 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/40 transition-colors">
                  <Upload className="text-slate-400" size={28} />
                  <span className="text-sm font-medium text-slate-700">
                    {application?.hasBanner ? application.bannerName || '배너 등록됨 (다시 선택)' : '1600x900 메인 배너 선택'}
                  </span>
                  <span className="text-xs text-slate-500">JPG, PNG, WEBP (권장 규격: 1600x900 px)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={readOnly || uploading}
                    onChange={(e) => void handleUpload('banner', e.target.files?.[0] ?? null)}
                  />
                </label>
                {application?.hasBanner && application.bannerUrl ? (
                  <img
                    src={merchantAdApplyAssetUrl(application.bannerUrl)}
                    alt="배너 미리보기"
                    className="mt-3 w-full max-h-56 object-contain rounded-xl border border-slate-200 bg-white"
                  />
                ) : null}
              </Field>
            </Section>

            <Section step={4} title="홍보 이미지 자료 및 추가 자료 첨부" onExample={() => setExampleKey('section4')}>
              <Field
                label="마케터 제공용 홍보 이미지 / 브로슈어 / 기타 증빙 파일 (복수 선택 가능)"
                onExample={() => setExampleKey('extras')}
              >
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/40 transition-colors">
                  <Upload className="text-slate-400" size={24} />
                  <span className="text-sm font-medium text-slate-700">홍보 이미지 및 추가 자료 파일 선택</span>
                  <span className="text-xs text-slate-500 text-center">
                    제품/행사 현장 사진, 가이드북 PDF, 홍보문구 PPT, ZIP 등 (개별 최대 100MB)
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    disabled={readOnly || uploading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []) as File[];
                      void (async () => {
                        for (const file of files) {
                          await handleUpload('extra', file);
                        }
                      })();
                    }}
                  />
                </label>
                {application?.assets?.length ? (
                  <ul className="mt-3 space-y-2">
                    {application.assets.map((asset) => (
                      <li
                        key={asset.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <a
                          href={merchantAdApplyAssetUrl(asset.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-700 hover:underline truncate"
                        >
                          {asset.filename}
                        </a>
                        {!readOnly ? (
                          <button
                            type="button"
                            onClick={() => void handleDeleteAsset(asset.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            aria-label="삭제"
                          >
                            <X size={16} />
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Field>
            </Section>

            <div className="sticky bottom-4 z-10 flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur p-4 shadow-lg">
              <p className="flex-1 text-xs text-slate-500 self-center">
                작성하신 내용은 링크커넥트 검수 후 캠페인 상세페이지로 전환됩니다.
              </p>
              <button
                type="button"
                disabled={saving || uploading || readOnly}
                onClick={() => void handleSave(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                임시 저장
              </button>
              <button
                type="button"
                disabled={saving || uploading || readOnly}
                onClick={() => {
                  if (window.confirm('광고등록 신청서를 제출할까요? 제출 후 검수까지 수정이 제한됩니다.')) {
                    void handleSave(true);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {saving ? '처리 중…' : '광고등록 신청서 제출하기'}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 pb-8">
              <Link to="/advertiser/campaigns" className="text-cyan-600 hover:underline">
                내 광고상품으로 돌아가기
              </Link>
            </p>
          </div>

          <aside className="xl:sticky xl:top-24 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-800 font-bold mb-3">
              <Lightbulb size={18} />
              항목별 작성 예시
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700/80 mb-1">추천 템플릿</p>
            <h3 className="text-base font-bold text-slate-900 mb-2">{example.title}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-4">{example.body}</p>
            {example.apply ? (
              <pre className="text-xs bg-white/80 border border-amber-100 rounded-xl p-3 mb-4 overflow-auto max-h-48 whitespace-pre-wrap text-slate-600">
                {Object.values(example.apply).filter(Boolean).join('\n\n')}
              </pre>
            ) : null}
            {example.apply && !readOnly ? (
              <button
                type="button"
                onClick={applyExample}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5"
              >
                ✨ 이 예시 내 양식에 적용하기
              </button>
            ) : null}
          </aside>
        </div>
      )}
    </AdvertiserLayout>
  );
}

function Section({
  step,
  title,
  onExample,
  children,
}: {
  step: number;
  title: string;
  onExample: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-cyan-600 text-white text-sm font-bold flex items-center justify-center">
            {step}
          </span>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onExample}
          className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100"
        >
          💡 작성 예시 보기
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  onExample,
  children,
}: {
  label: string;
  required?: boolean;
  onExample?: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
        </label>
        {onExample ? (
          <button
            type="button"
            onClick={onExample}
            className="text-[11px] font-semibold text-cyan-700 hover:underline"
          >
            예시보기
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
