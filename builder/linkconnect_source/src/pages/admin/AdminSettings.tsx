import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Settings, Save, RotateCcw, Check } from 'lucide-react';
import { fetchAdminSettings, resetAdminSettings, saveAdminSettings } from '../../lib/api';

type RawSettings = Record<string, string>;

const defaultRaw: RawSettings = {
  siteName: '링크커넥트',
  siteStatus: 'active',
  adminEmail: 'admin@linkconnect.com',
  supportPhone: '1588-0000',
  duplicateDays: '30',
  merchantProcessDays: '7',
  minChargeAmount: '500000',
  minSettlementAmount: '50000',
  settlementPeriod: '매월 1일 ~ 5일',
  apiRetryCount: '3',
};

function boolVal(raw: RawSettings, key: string) {
  return raw[key] === '1' || raw[key] === 'true';
}

function setBool(raw: RawSettings, key: string, value: boolean): RawSettings {
  return { ...raw, [key]: value ? '1' : '0' };
}

export function AdminSettings() {
  const [raw, setRaw] = useState<RawSettings>(defaultRaw);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminSettings()
      .then((data) => setRaw({ ...defaultRaw, ...data.raw }))
      .catch((err) => setError(err instanceof Error ? err.message : '설정을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => setRaw((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaveStatus('saving');
    setError('');
    try {
      await saveAdminSettings({
        general: {
          siteName: raw.siteName,
          siteStatus: raw.siteStatus,
          adminEmail: raw.adminEmail,
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
        },
        billing: {
          billingDeductMode: raw.billingDeductMode || 'on_receive',
          billingLowMode: raw.billingLowMode || 'hold',
          minChargeAmount: Number(raw.minChargeAmount || 500000),
          chargeApprovalMode: raw.chargeApprovalMode || 'manual',
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
      });
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
      setRaw({ ...defaultRaw, ...data.raw });
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
            <Field label="고객센터 연락처" value={raw.supportPhone} onChange={(v) => update('supportPhone', v)} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-900">CPA · 정산 · API 정책</h3></div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="중복 디비 판단 기간 (일)" value={raw.duplicateDays} onChange={(v) => update('duplicateDays', v)} type="number" />
            <Field label="광고주 처리 제한일 (일)" value={raw.merchantProcessDays} onChange={(v) => update('merchantProcessDays', v)} type="number" />
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

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-cyan-500 outline-none" />
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
