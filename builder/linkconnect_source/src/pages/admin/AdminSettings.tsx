import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Settings, Save, RotateCcw, Check, Sparkles, Link2 } from 'lucide-react';
import { fetchAdminSettings, resetAdminSettings, saveAdminGeminiApiKey, saveAdminOpenAiApiKey, saveAdminSettings } from '../../lib/api';
import type { AdminSettingsResponse } from '../../lib/api';

type RawSettings = Record<string, string>;

const defaultRaw: RawSettings = {
  siteName: '링크커넥트',
  siteStatus: 'active',
  adminEmail: 'admin@linkconnect.com',
  supportEmail: 'support@linkconnect.co.kr',
  supportPhone: '070-8098-6824',
  duplicateDays: '30',
  merchantProcessDays: '7',
  minChargeAmount: '500000',
  minSettlementAmount: '50000',
  settlementPeriod: '매월 1일 ~ 5일',
  apiRetryCount: '3',
  geminiEnabled: '1',
  geminiModel: 'gemini-2.5-flash',
  geminiImageModel: 'gemini-2.5-flash-image',
  geminiApiKeySet: '0',
  geminiApiKeyMasked: '',
  openaiImageEnabled: '1',
  openaiImageModel: 'gpt-image-2',
  openaiImageQuality: 'medium',
  openaiApiKeySet: '0',
  openaiApiKeyMasked: '',
  aiChatDailyLimit: '30',
  aiPromoDailyLimit: '20',
  aiSummaryDailyLimit: '10',
  aiImageDailyLimit: '15',
  aiImagePromptThumbnail: '',
  aiImagePromptPromo: '',
  advertiserContractGraceUntil: '',
  notifyLowBalanceEmail: '1',
  notifyLowBalanceSms: '0',
  notifyLowBalanceKakao: '0',
  notifyLowBalanceEmailTpl: '[{site}] {company}님, 광고비 잔액이 {balance}원입니다. (기준 {threshold}원) 충전을 진행해 주세요.',
  notifyLowBalanceSmsTpl: '[{site}] 광고비 잔액 {balance}원. 충전 필요.',
  notifyLowBalanceKakaoTpl: '{company}님, 광고비 잔액 {balance}원입니다. 충전해 주세요.',
  cpaTrackingDomainEnabled: '0',
  cpaTrackingBaseUrl: '',
  cpaLandingSeoTitle: '{campaign} 상담 신청 | {site}',
  cpaLandingSeoDescription: '{campaign} 무료 상담 신청 페이지입니다. 지금 바로 상담을 신청해 보세요.',
  cpaLandingSeoKeywords: '',
  cpaLandingSeoOgImage: '',
  cpaLandingSeoRobots: 'index,follow',
};

function boolVal(raw: RawSettings, key: string) {
  const v = raw[key];
  return v === '1' || v === 'true' || v === true;
}

function mapAdminSettingsRaw(data: AdminSettingsResponse['raw'] | Record<string, string>, settings?: AdminSettingsResponse['settings']): RawSettings {
  const raw: RawSettings = { ...defaultRaw, ...data };
  const ai = settings?.ai;
  if (ai?.geminiApiKeySet) {
    raw.geminiApiKeySet = '1';
  }
  if (ai?.geminiApiKeyMasked) {
    raw.geminiApiKeyMasked = ai.geminiApiKeyMasked;
  }
  if (ai?.openaiApiKeySet) {
    raw.openaiApiKeySet = '1';
  }
  if (ai?.openaiApiKeyMasked) {
    raw.openaiApiKeyMasked = ai.openaiApiKeyMasked;
  }
  if (raw.geminiApiKeySet === 'true' || raw.geminiApiKeySet === true) {
    raw.geminiApiKeySet = '1';
  }
  if (raw.openaiApiKeySet === 'true' || raw.openaiApiKeySet === true) {
    raw.openaiApiKeySet = '1';
  }
  return raw;
}

function setBool(raw: RawSettings, key: string, value: boolean): RawSettings {
  return { ...raw, [key]: value ? '1' : '0' };
}

export function AdminSettings() {
  const [raw, setRaw] = useState<RawSettings>(defaultRaw);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [openaiKeyStatus, setOpenaiKeyStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminSettings()
      .then((data) => setRaw(mapAdminSettingsRaw(data.raw, data.settings)))
      .catch((err) => setError(err instanceof Error ? err.message : '설정을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const applySettingsResponse = (data: AdminSettingsResponse) => {
    setRaw(mapAdminSettingsRaw(data.raw, data.settings));
    setGeminiKeyInput('');
    setOpenaiKeyInput('');
  };

  const handleSaveGeminiKey = async () => {
    const key = geminiKeyInput.trim();
    if (!key) {
      setError('Gemini API 키를 입력한 뒤 저장하세요.');
      return;
    }
    if (key.includes('*')) {
      setError('마스킹된 키(****)는 저장할 수 없습니다. Google AI Studio에서 발급받은 전체 키를 입력하세요.');
      return;
    }
    setGeminiKeyStatus('saving');
    setError('');
    try {
      const data = await saveAdminGeminiApiKey(key);
      applySettingsResponse(data);
      setGeminiKeyStatus('saved');
      setTimeout(() => setGeminiKeyStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gemini API 키 저장에 실패했습니다.');
      setGeminiKeyStatus('idle');
    }
  };

  const handleSaveOpenAiKey = async () => {
    const key = openaiKeyInput.trim();
    if (!key) {
      setError('OpenAI API 키를 입력한 뒤 저장하세요.');
      return;
    }
    if (key.includes('*')) {
      setError('마스킹된 키(****)는 저장할 수 없습니다. platform.openai.com에서 발급받은 전체 키를 입력하세요.');
      return;
    }
    setOpenaiKeyStatus('saving');
    setError('');
    try {
      const data = await saveAdminOpenAiApiKey(key);
      applySettingsResponse(data);
      setOpenaiKeyStatus('saved');
      setTimeout(() => setOpenaiKeyStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OpenAI API 키 저장에 실패했습니다.');
      setOpenaiKeyStatus('idle');
    }
  };

  const update = (key: string, value: string) => setRaw((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaveStatus('saving');
    setError('');
    try {
      const data = await saveAdminSettings({
        general: {
          siteName: raw.siteName,
          siteStatus: raw.siteStatus,
          adminEmail: raw.adminEmail,
          supportEmail: raw.supportEmail,
          supportPhone: raw.supportPhone,
          timezone: raw.timezone || 'Asia/Seoul',
        },
        cpa: {
          duplicateDays: Number(raw.duplicateDays || 30),
          defaultCvStatus: raw.defaultCvStatus || 'pending',
          duplicateByPhone: boolVal(raw, 'duplicateByPhone'),
          duplicateByCampaign: boolVal(raw, 'duplicateByCampaign'),
          duplicateByMerchant: boolVal(raw, 'duplicateByMerchant'),
          merchantProcessDays: Number(raw.merchantProcessDays || 7),
          advertiserContractGraceUntil: raw.advertiserContractGraceUntil || '',
          cpaTrackingDomainEnabled: boolVal(raw, 'cpaTrackingDomainEnabled'),
          cpaTrackingBaseUrl: raw.cpaTrackingBaseUrl || '',
          cpaLandingSeoTitle: raw.cpaLandingSeoTitle || '',
          cpaLandingSeoDescription: raw.cpaLandingSeoDescription || '',
          cpaLandingSeoKeywords: raw.cpaLandingSeoKeywords || '',
          cpaLandingSeoOgImage: raw.cpaLandingSeoOgImage || '',
          cpaLandingSeoRobots: raw.cpaLandingSeoRobots || 'index,follow',
        },
        billing: {
          billingDeductMode: raw.billingDeductMode || 'on_receive',
          billingLowMode: raw.billingLowMode || 'hold',
          minChargeAmount: Number(raw.minChargeAmount || 500000),
          chargeApprovalMode: raw.chargeApprovalMode || 'manual',
          notifyLowBalanceEmail: boolVal(raw, 'notifyLowBalanceEmail'),
          notifyLowBalanceSms: boolVal(raw, 'notifyLowBalanceSms'),
          notifyLowBalanceKakao: boolVal(raw, 'notifyLowBalanceKakao'),
          notifyLowBalanceEmailTpl: raw.notifyLowBalanceEmailTpl || '',
          notifyLowBalanceSmsTpl: raw.notifyLowBalanceSmsTpl || '',
          notifyLowBalanceKakaoTpl: raw.notifyLowBalanceKakaoTpl || '',
        },
        partner: {
          showEstRevenue: boolVal(raw, 'showEstRevenue'),
          confirmOnApprove: boolVal(raw, 'confirmOnApprove'),
          excludeCanceled: boolVal(raw, 'excludeCanceled'),
          minSettlementAmount: Number(raw.minSettlementAmount || 50000),
          settlementPeriod: raw.settlementPeriod || '',
        },
        cancel: {
          merchantInstantCancel: boolVal(raw, 'merchantInstantCancel'),
          adminReviewRequired: boolVal(raw, 'adminReviewRequired'),
          cancelReasonRequired: boolVal(raw, 'cancelReasonRequired'),
          cancelCommentRequired: boolVal(raw, 'cancelCommentRequired'),
          partnerAppealAllowed: boolVal(raw, 'partnerAppealAllowed'),
        },
        api: {
          apiKeyEnabled: boolVal(raw, 'apiKeyEnabled'),
          apiSecretEnabled: boolVal(raw, 'apiSecretEnabled'),
          apiIpRestrict: boolVal(raw, 'apiIpRestrict'),
          apiLogEnabled: boolVal(raw, 'apiLogEnabled'),
          apiMaskPii: boolVal(raw, 'apiMaskPii'),
          apiRetryCount: Number(raw.apiRetryCount || 3),
        },
        ai: {
          geminiEnabled: boolVal(raw, 'geminiEnabled'),
          geminiModel: raw.geminiModel || 'gemini-2.5-flash',
          geminiApiKey: geminiKeyInput.trim(),
          openaiImageEnabled: boolVal(raw, 'openaiImageEnabled'),
          openaiImageModel: raw.openaiImageModel || 'gpt-image-2',
          openaiImageQuality: raw.openaiImageQuality || 'medium',
          openaiApiKey: openaiKeyInput.trim(),
          aiChatDailyLimit: Number(raw.aiChatDailyLimit || 30),
          aiPromoDailyLimit: Number(raw.aiPromoDailyLimit || 20),
          aiSummaryDailyLimit: Number(raw.aiSummaryDailyLimit || 10),
          aiImageDailyLimit: Number(raw.aiImageDailyLimit || 15),
          aiImagePromptThumbnail: raw.aiImagePromptThumbnail || '',
          aiImagePromptPromo: raw.aiImagePromptPromo || '',
        },
      });
      applySettingsResponse(data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '설정 저장에 실패했습니다.');
      setSaveStatus('idle');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('기본값으로 복원하시겠습니까?')) return;
    try {
      const data = await resetAdminSettings();
      applySettingsResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '복원에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <AdminLayout activeMenu="settings" title="환경설정" description="링크커넥트의 운영 정책과 시스템 기본값을 설정하세요.">
        <div className="text-slate-500">설정을 불러오는 중...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeMenu="settings" title="환경설정" description="링크커넥트의 운영 정책과 시스템 기본값을 설정하세요.">
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="max-w-4xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-900">기본 운영 설정</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="서비스명" value={raw.siteName} onChange={(v) => update('siteName', v)} />
            <SelectField label="플랫폼 운영 상태" value={raw.siteStatus} onChange={(v) => update('siteStatus', v)} options={[['active', '정상 운영'], ['maintenance', '점검 중']]} />
            <Field label="관리자 이메일" value={raw.adminEmail} onChange={(v) => update('adminEmail', v)} />
            <Field label="고객센터 이메일" value={raw.supportEmail} onChange={(v) => update('supportEmail', v)} />
            <Field label="고객센터 연락처" value={raw.supportPhone} onChange={(v) => update('supportPhone', v)} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-900 to-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <h3 className="font-bold text-white">ChatGPT API</h3>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-slate-500 leading-relaxed">
              캠페인 썸네일·홍보 이미지 생성에 사용합니다. OpenAI 플랫폼에서 발급한 API 키를 등록하세요.
            </p>
            <Toggle
              label="ChatGPT 이미지 생성 사용"
              checked={boolVal(raw, 'openaiImageEnabled')}
              onChange={(v) => setRaw((prev) => setBool(prev, 'openaiImageEnabled', v))}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ChatGPT (OpenAI) API 키</label>
              {boolVal(raw, 'openaiApiKeySet') ? (
                <p className="text-xs text-emerald-600 mb-2">등록됨: {raw.openaiApiKeyMasked || '********'}</p>
              ) : (
                <p className="text-xs text-amber-600 mb-2">아직 등록되지 않았습니다. 키를 입력한 뒤 「API 키 저장」을 눌러 주세요.</p>
              )}
              <input
                type="password"
                value={openaiKeyInput}
                onChange={(e) => setOpenaiKeyInput(e.target.value)}
                placeholder="sk-... 또는 sk-proj-..."
                autoComplete="off"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-indigo-500 outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveOpenAiKey}
                  disabled={openaiKeyStatus !== 'idle' || !openaiKeyInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                >
                  {openaiKeyStatus === 'idle' && 'ChatGPT API 키 저장'}
                  {openaiKeyStatus === 'saving' && '저장 중...'}
                  {openaiKeyStatus === 'saved' && '저장 완료'}
                </button>
                <p className="text-[11px] text-slate-400">키는 서버에만 저장되며 화면에 다시 표시되지 않습니다.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <Field label="이미지 모델" value={raw.openaiImageModel} onChange={(v) => update('openaiImageModel', v)} placeholder="gpt-image-2" />
              <SelectField
                label="이미지 품질"
                value={raw.openaiImageQuality || 'medium'}
                onChange={(v) => update('openaiImageQuality', v)}
                options={[
                  ['low', 'low (빠름)'],
                  ['medium', 'medium'],
                  ['high', 'high (고품질)'],
                  ['auto', 'auto'],
                ]}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-900">CPA · 정산 · API 정책</h3></div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="중복 디비 판단 기간 (일)" value={raw.duplicateDays} onChange={(v) => update('duplicateDays', v)} type="number" />
            <Field label="광고주 처리 제한일 (일)" value={raw.merchantProcessDays} onChange={(v) => update('merchantProcessDays', v)} type="number" />
            <Field
              label="광고주 계약 유예 종료일"
              value={raw.advertiserContractGraceUntil}
              onChange={(v) => update('advertiserContractGraceUntil', v)}
              placeholder="YYYY-MM-DD (비우면 즉시 제한)"
            />
            <Field label="최소 충전 금액 (원)" value={raw.minChargeAmount} onChange={(v) => update('minChargeAmount', v)} type="number" />
            <Field label="최소 정산 가능 금액 (원)" value={raw.minSettlementAmount} onChange={(v) => update('minSettlementAmount', v)} type="number" />
            <Field label="정산 신청 가능일" value={raw.settlementPeriod} onChange={(v) => update('settlementPeriod', v)} />
            <Field label="API 재시도 횟수" value={raw.apiRetryCount} onChange={(v) => update('apiRetryCount', v)} type="number" />
          </div>
          <div className="px-6 pb-6 space-y-3">
            <Toggle label="관리자 검수 필수" checked={boolVal(raw, 'adminReviewRequired')} onChange={(v) => setRaw((prev) => setBool(prev, 'adminReviewRequired', v))} />
            <Toggle label="파트너 이의신청 허용" checked={boolVal(raw, 'partnerAppealAllowed')} onChange={(v) => setRaw((prev) => setBool(prev, 'partnerAppealAllowed', v))} />
            <Toggle label="API 로그 저장" checked={boolVal(raw, 'apiLogEnabled')} onChange={(v) => setRaw((prev) => setBool(prev, 'apiLogEnabled', v))} />
            <Toggle label="개인정보 마스킹 저장" checked={boolVal(raw, 'apiMaskPii')} onChange={(v) => setRaw((prev) => setBool(prev, 'apiMaskPii', v))} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">CPA 홍보 링크 독립 도메인 · SEO</h3>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-sm text-slate-500">
              CPA 홍보 링크(<code className="bg-slate-100 px-1 rounded">/r/</code>)와 상담 랜딩(
              <code className="bg-slate-100 px-1 rounded">/c/</code>)에만 적용됩니다. CPS 링크프라이스 링크는 변경되지 않습니다.
            </p>
            <Toggle
              label="독립 도메인 사용"
              checked={boolVal(raw, 'cpaTrackingDomainEnabled')}
              onChange={(v) => setRaw((prev) => setBool(prev, 'cpaTrackingDomainEnabled', v))}
            />
            <Field
              label="홍보 링크 기본 URL"
              value={raw.cpaTrackingBaseUrl || ''}
              onChange={(v) => update('cpaTrackingBaseUrl', v)}
              placeholder="https://go.linkconnect.co.kr"
            />
            <p className="text-xs text-slate-500 -mt-4">
              DNS를 운영 서버로 연결한 뒤, 해당 도메인에서도 <code>/r/</code>, <code>/c/</code> 경로가 동작해야 합니다.
              비우거나 끄면 메인 사이트 도메인(<code>G5_URL</code>)을 사용합니다.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-800 mb-1">미리보기</p>
              <p className="font-mono text-xs break-all">
                {(raw.cpaTrackingDomainEnabled === '1' && raw.cpaTrackingBaseUrl
                  ? raw.cpaTrackingBaseUrl.replace(/\/$/, '')
                  : 'https://linkconnect.co.kr')}
                /r/abc123xyz
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="font-bold text-slate-900 mb-1">상담 랜딩 SEO</h4>
              <p className="text-sm text-slate-500 mb-4">
                <code>/c/&#123;코드&#125;</code> 랜딩 페이지 메타 태그입니다. 변수: <code>{'{campaign}'}</code>, <code>{'{site}'}</code>
              </p>
              <div className="grid grid-cols-1 gap-6">
                <Field label="페이지 제목 (title)" value={raw.cpaLandingSeoTitle || ''} onChange={(v) => update('cpaLandingSeoTitle', v)} />
                <TextAreaField label="메타 설명 (description)" value={raw.cpaLandingSeoDescription || ''} onChange={(v) => update('cpaLandingSeoDescription', v)} />
                <Field label="메타 키워드 (keywords)" value={raw.cpaLandingSeoKeywords || ''} onChange={(v) => update('cpaLandingSeoKeywords', v)} placeholder="상담, 무료상담 (쉼표 구분)" />
                <Field label="OG 이미지 URL" value={raw.cpaLandingSeoOgImage || ''} onChange={(v) => update('cpaLandingSeoOgImage', v)} placeholder="https://..." />
                <SelectField
                  label="검색엔진 색인 (robots)"
                  value={raw.cpaLandingSeoRobots || 'index,follow'}
                  onChange={(v) => update('cpaLandingSeoRobots', v)}
                  options={[
                    ['index,follow', '색인 허용 (index,follow)'],
                    ['noindex,nofollow', '색인 차단 (noindex,nofollow)'],
                    ['noindex,follow', '색인 차단 · 링크 추적 (noindex,follow)'],
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white">AI · Gemini 설정</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Gemini (챗봇 · 홍보문구 · 요약)</h4>
              <p className="text-xs text-slate-500">이미지 생성용 ChatGPT API 키는 위쪽 「ChatGPT API」 섹션에서 등록하세요.</p>
              <Toggle label="AI 텍스트 기능 사용" checked={boolVal(raw, 'geminiEnabled')} onChange={(v) => setRaw((prev) => setBool(prev, 'geminiEnabled', v))} />
              <Field label="Gemini 텍스트 모델" value={raw.geminiModel} onChange={(v) => update('geminiModel', v)} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Google Gemini API 키</label>
                {boolVal(raw, 'geminiApiKeySet') ? (
                  <p className="text-xs text-emerald-600 mb-2">등록됨: {raw.geminiApiKeyMasked || '********'}</p>
                ) : (
                  <p className="text-xs text-amber-600 mb-2">API 키가 설정되지 않았습니다. AI 텍스트 기능을 사용하려면 키를 입력하세요.</p>
                )}
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="새 API 키 입력 (변경 시에만)"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-cyan-500 outline-none"
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveGeminiKey}
                    disabled={geminiKeyStatus !== 'idle' || !geminiKeyInput.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    {geminiKeyStatus === 'idle' && 'API 키 저장'}
                    {geminiKeyStatus === 'saving' && '저장 중...'}
                    {geminiKeyStatus === 'saved' && '저장 완료'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 border-t border-slate-100">
              <Field label="챗봇 일일 한도" value={raw.aiChatDailyLimit} onChange={(v) => update('aiChatDailyLimit', v)} type="number" />
              <Field label="홍보문구 일일 한도" value={raw.aiPromoDailyLimit} onChange={(v) => update('aiPromoDailyLimit', v)} type="number" />
              <Field label="리포트요약 일일 한도" value={raw.aiSummaryDailyLimit} onChange={(v) => update('aiSummaryDailyLimit', v)} type="number" />
              <Field label="이미지생성 일일 한도" value={raw.aiImageDailyLimit} onChange={(v) => update('aiImageDailyLimit', v)} type="number" />
            </div>
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                이미지 프롬프트 템플릿 변수: {'{title}'}, {'{category}'}, {'{width}'}, {'{height}'}, {'{aspect}'}, {'{mood}'}, {'{text_instruction}'}, {'{extra}'}. 비워두면 기본 템플릿을 사용합니다.
              </p>
              <TextAreaField
                label="상품 썸네일 프롬프트 템플릿 (1200×750)"
                value={raw.aiImagePromptThumbnail || ''}
                onChange={(v) => update('aiImagePromptThumbnail', v)}
              />
              <TextAreaField
                label="홍보 소재 프롬프트 템플릿"
                value={raw.aiImagePromptPromo || ''}
                onChange={(v) => update('aiImagePromptPromo', v)}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-900">광고주 자동 충전 안내</h3></div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-500">잔액이 기준 이하일 때 발송할 알림 채널과 템플릿을 설정합니다. 변수: {'{site}'}, {'{company}'}, {'{balance}'}, {'{threshold}'}</p>
            <Toggle label="이메일 발송" checked={boolVal(raw, 'notifyLowBalanceEmail')} onChange={(v) => setRaw((prev) => setBool(prev, 'notifyLowBalanceEmail', v))} />
            <TextAreaField label="이메일 템플릿" value={raw.notifyLowBalanceEmailTpl || ''} onChange={(v) => update('notifyLowBalanceEmailTpl', v)} />
            <Toggle label="문자(SMS) 발송" checked={boolVal(raw, 'notifyLowBalanceSms')} onChange={(v) => setRaw((prev) => setBool(prev, 'notifyLowBalanceSms', v))} />
            <TextAreaField label="문자 템플릿" value={raw.notifyLowBalanceSmsTpl || ''} onChange={(v) => update('notifyLowBalanceSmsTpl', v)} />
            <Toggle label="카카오 알림톡 발송" checked={boolVal(raw, 'notifyLowBalanceKakao')} onChange={(v) => setRaw((prev) => setBool(prev, 'notifyLowBalanceKakao', v))} />
            <TextAreaField label="카카오 템플릿" value={raw.notifyLowBalanceKakaoTpl || ''} onChange={(v) => update('notifyLowBalanceKakaoTpl', v)} />
          </div>
        </section>

        <div className="flex items-center justify-between pt-6 border-t border-slate-200 pb-12">
          <button type="button" onClick={handleReset} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center gap-2">
            <RotateCcw size={16} /> 기본값 복원
          </button>
          <button type="button" onClick={handleSave} disabled={saveStatus !== 'idle'} className={`px-8 py-3 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 ${saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            {saveStatus === 'idle' && <><Save size={18} /> 설정 저장</>}
            {saveStatus === 'saving' && <>저장 중...</>}
            {saveStatus === 'saved' && <><Check size={18} /> 저장 완료</>}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-cyan-500 outline-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-cyan-500 outline-none">
        {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded" />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-cyan-500 outline-none resize-none" />
    </div>
  );
}
