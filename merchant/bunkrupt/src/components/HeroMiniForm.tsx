import { useState } from 'react';
import { useConsultationDraft } from '../context/ConsultationDraftContext';
import {
  DEBT_OPTIONS,
  formatPhoneInput,
  isValidPhone,
  scrollToConsultForm,
} from '../lib/consultationForm';
import { trackLandingEvent } from '../lib/analytics';
import ChipSelect from './ChipSelect';

export default function HeroMiniForm() {
  const { draft, setDraft, setFormStep } = useConsultationDraft();
  const [errors, setErrors] = useState<{ name?: string; phone?: string; debt?: string }>({});

  const handleStart = () => {
    trackLandingEvent('hero_mini_form_start');
    const nextErrors: typeof errors = {};
    if (!draft.name.trim()) nextErrors.name = '이름을 입력해 주세요.';
    if (!isValidPhone(draft.phone)) nextErrors.phone = '연락처를 정확히 입력해 주세요.';
    if (!draft.debt) nextErrors.debt = '채무금액을 선택해 주세요.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormStep(2);
    scrollToConsultForm();
    trackLandingEvent('form_step1_complete', { source: 'hero_mini' });
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-main/60 p-5 backdrop-blur-md sm:p-6">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-white">30초 무료 자격 확인</h3>
        <p className="text-[13px] text-gray-300">이름 · 연락처 · 채무금액만 입력하세요</p>
      </div>
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ name: e.target.value })}
            placeholder="이름"
            className="w-full rounded-xl border border-white/10 bg-white/95 px-4 py-3 text-[15px] text-gray-900 focus:border-cta focus:outline-none focus:ring-1 focus:ring-cta"
          />
          {errors.name ? <p className="mt-1 text-xs text-red-200">{errors.name}</p> : null}
        </div>
        <div>
          <input
            type="tel"
            value={draft.phone}
            onChange={(e) => setDraft({ phone: formatPhoneInput(e.target.value) })}
            placeholder="연락처 (010-0000-0000)"
            className="w-full rounded-xl border border-white/10 bg-white/95 px-4 py-3 text-[15px] text-gray-900 focus:border-cta focus:outline-none focus:ring-1 focus:ring-cta"
          />
          {errors.phone ? <p className="mt-1 text-xs text-red-200">{errors.phone}</p> : null}
        </div>
        <div className="rounded-xl bg-white/95 p-3">
          <ChipSelect
            label="채무금액"
            options={DEBT_OPTIONS}
            value={draft.debt}
            onChange={(value) => setDraft({ debt: value })}
            error={errors.debt}
            required
          />
        </div>
        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-xl bg-white py-4 text-[15px] font-bold text-main shadow-lg transition-colors hover:bg-gray-50 active:scale-[0.98]"
        >
          내 가능성 무료 확인
        </button>
      </div>
    </div>
  );
}
