import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useConsultationDraft } from '../context/ConsultationDraftContext';
import {
  DEBT_OPTIONS,
  formatPhoneInput,
  isValidPhone,
  scrollToConsultForm,
} from '../lib/consultationForm';
import { trackLandingEvent } from '../lib/analytics';
import { usePartnerContext } from '../context/PartnerContext';
import { formatPhoneDisplay, phoneTelHref } from '../lib/partnerData';
import ChipSelect from './ChipSelect';

export default function HeroMiniForm() {
  const { draft, setDraft, setFormStep } = useConsultationDraft();
  const { hasPhone, data } = usePartnerContext();
  const [quizStep, setQuizStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; debt?: string }>({});
  const phoneDisplay = formatPhoneDisplay(data.partner_phone_display || data.partner_phone);
  const tel = hasPhone ? phoneTelHref(data.partner_phone) : '';

  const handleDebtNext = () => {
    trackLandingEvent('hero_mini_form_start');
    if (!draft.debt) {
      setErrors({ debt: '채무금액을 선택해 주세요.' });
      return;
    }
    setErrors({});
    setQuizStep(2);
  };

  const handleSituationNext = () => {
    setQuizStep(3);
  };

  const handleStart = () => {
    const nextErrors: typeof errors = {};
    if (!draft.name.trim()) nextErrors.name = '이름을 입력해 주세요.';
    if (!isValidPhone(draft.phone)) nextErrors.phone = '연락처를 정확히 입력해 주세요.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormStep(2);
    scrollToConsultForm();
    trackLandingEvent('form_step1_complete', { source: 'hero_mini' });
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-main/60 p-5 backdrop-blur-md sm:p-6">
      <div className="mb-4 text-center">
        <div className="mb-3 flex items-center justify-center gap-1.5" aria-label={`3단계 중 ${quizStep}단계`}>
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`h-1.5 rounded-full transition-all ${step <= quizStep ? 'w-8 bg-point' : 'w-5 bg-white/20'}`}
            />
          ))}
        </div>
        <h3 className="text-lg font-bold text-white">
          {quizStep === 1 ? '먼저 채무 규모를 알려주세요' : quizStep === 2 ? '현재 상황은 어떠신가요?' : '결과를 안내받으실 연락처'}
        </h3>
        <p className="text-[13px] text-gray-300">
          {quizStep === 3 ? '상담은 비공개이며 진행을 강요하지 않습니다' : '개인정보보다 상황을 먼저 확인합니다'}
        </p>
      </div>
      <div className="space-y-3">
        {quizStep === 1 ? (
          <>
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
            <button type="button" onClick={handleDebtNext} className="w-full rounded-xl bg-point py-4 text-[15px] font-bold text-main shadow-lg active:scale-[0.98]">
              다음 단계
            </button>
          </>
        ) : null}

        {quizStep === 2 ? (
          <>
            <div className="rounded-xl bg-white/95 p-3">
              <ChipSelect
                label="월 소득"
                options={[
                  { value: 'none', label: '소득 없음' },
                  { value: 'under_1m', label: '100만원 이하' },
                  { value: '1m_to_2m', label: '100만~200만원' },
                  { value: '2m_to_3m', label: '200만~300만원' },
                  { value: 'over_3m', label: '300만원 이상' },
                ]}
                value={draft.income}
                onChange={(value) => setDraft({ income: value })}
              />
            </div>
            <div className="rounded-xl bg-white/95 p-3">
              <ChipSelect
                label="독촉·연체 상황"
                options={[
                  { value: 'before', label: '연체 전' },
                  { value: 'during', label: '연체 중' },
                  { value: 'action', label: '독촉/압류 진행 중' },
                ]}
                value={draft.status}
                onChange={(value) => setDraft({ status: value })}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setQuizStep(1)} className="w-1/3 rounded-xl border border-white/20 py-4 text-sm font-bold text-white">
                이전
              </button>
              <button type="button" onClick={handleSituationNext} className="flex-1 rounded-xl bg-point py-4 text-[15px] font-bold text-main shadow-lg active:scale-[0.98]">
                결과 확인하기
              </button>
            </div>
          </>
        ) : null}

        {quizStep === 3 ? (
          <>
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
            <div className="flex gap-2">
              <button type="button" onClick={() => setQuizStep(2)} className="w-1/3 rounded-xl border border-white/20 py-4 text-sm font-bold text-white">
                이전
              </button>
              <button type="button" onClick={handleStart} className="flex-1 rounded-xl bg-white py-4 text-[15px] font-bold text-main shadow-lg hover:bg-gray-50 active:scale-[0.98]">
                무료 상담 계속하기
              </button>
            </div>
            {hasPhone && tel ? (
              <a
                href={tel}
                onClick={() => trackLandingEvent('hero_mini_phone_click')}
                className="phone-only partner-phone-link flex items-center justify-center gap-2 rounded-xl border border-point/40 bg-point/15 px-4 py-3 text-sm font-bold text-point"
              >
                <Phone className="h-4 w-4" />
                <span>또는 전화</span>
                <span className="partner-phone-text tabular-nums">{phoneDisplay}</span>
              </a>
            ) : null}
            <p className="text-center text-[11px] leading-relaxed text-gray-300">입력 정보는 자격진단 및 상담 연락 목적으로만 사용됩니다.</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
