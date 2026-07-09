import { useState, type FormEvent } from 'react';
import { buildInquiryText, submitConsultation } from '../lib/linkconnect';
import { getTrackingForSubmit } from '../lib/partnerData';
import { usePartnerContext } from '../context/PartnerContext';
import { useConsultationDraft } from '../context/ConsultationDraftContext';
import {
  DEBT_LABELS,
  DEBT_OPTIONS,
  formatPhoneInput,
  INCOME_LABELS,
  INCOME_OPTIONS,
  isValidPhone,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '../lib/consultationForm';
import { trackLandingEvent } from '../lib/analytics';
import ChipSelect from './ChipSelect';

export default function ConsultationForm() {
  const { data: partnerData } = usePartnerContext();
  const { draft, setDraft, formStep, setFormStep, resetDraft } = useConsultationDraft();
  const tracking = getTrackingForSubmit();

  const [privacy, setPrivacy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [successModal, setSuccessModal] = useState<{ name: string; phone: string } | null>(null);

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!draft.name.trim()) errors.name = '이름을 입력해 주세요.';
    if (!isValidPhone(draft.phone)) errors.phone = '연락처를 정확히 입력해 주세요.';
    if (!draft.debt) errors.debt = '채무금액을 선택해 주세요.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Next = () => {
    trackLandingEvent('form_step1_start');
    if (!validateStep1()) return;
    if (!privacy) {
      setFeedback({ type: 'err', text: '개인정보 수집 및 상담 연락에 동의해 주세요.' });
      return;
    }
    setFeedback(null);
    setFormStep(2);
    trackLandingEvent('form_step1_complete');
  };

  const submitForm = async () => {
    if (!validateStep1()) {
      setFormStep(1);
      return;
    }
    if (!privacy) {
      setFeedback({ type: 'err', text: '개인정보 수집 및 상담 연락에 동의해 주세요.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const trackingNote = draft.calculatorNote ? `계산기 참고: ${draft.calculatorNote}` : '';

    const result = await submitConsultation(
      {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        inquiry: buildInquiryText({
          debt: draft.debt ? DEBT_LABELS[draft.debt] || draft.debt : '',
          income: draft.income ? INCOME_LABELS[draft.income] || draft.income : '',
          status: draft.status ? STATUS_LABELS[draft.status] || draft.status : '',
          message: draft.message,
          trackingNote,
        }),
      },
      {
        lkCode: tracking.lkCode,
        channel: tracking.channel,
        sub_id: tracking.sub_id,
        utm_source: tracking.utm_source,
        utm_medium: tracking.utm_medium,
        utm_campaign: tracking.utm_campaign,
      },
    );

    setSubmitting(false);

    if (result.ok) {
      trackLandingEvent('form_submit_success');
      setSuccessModal({ name: draft.name.trim(), phone: draft.phone.trim() });
      resetDraft();
      setPrivacy(true);
    } else {
      setFeedback({ type: 'err', text: result.message });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <section className="bg-bg px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-12" id="consult-form">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cta/10 px-4 py-1.5 text-xs font-bold text-cta">
              <span className={formStep === 1 ? 'text-cta' : 'text-gray-400'}>1. 기본 정보</span>
              <span className="text-gray-300">→</span>
              <span className={formStep === 2 ? 'text-cta' : 'text-gray-400'}>2. 상세 정보(선택)</span>
            </div>
            <h2 className="mb-3 text-[26px] font-bold tracking-tight text-main sm:text-3xl">
              {formStep === 1 ? '30초 무료 자격 확인' : '더 정확한 상담을 위해 (선택)'}
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-500">
              {formStep === 1
                ? '이름 · 연락처 · 채무금액만 입력하면 담당자가 가능 여부를 안내해드립니다.'
                : '입력하신 정보는 상담 품질 향상에만 사용됩니다. 건너뛰고 바로 신청할 수도 있습니다.'}
            </p>
          </div>

          {draft.calculatorNote ? (
            <div className="mb-6 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
              계산기 결과가 반영되었습니다. 아래 내용을 확인 후 신청해 주세요.
            </div>
          ) : null}

          {feedback?.type === 'err' ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-800" role="alert">
              {feedback.text}
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="partner_id" value={partnerData.partner_id} />
            <input type="hidden" name="campaign_id" value={partnerData.campaign_id} />
            <input type="hidden" name="merchant_id" value={partnerData.merchant_id} />
            <input type="hidden" name="utm_source" value={partnerData.utm_source} />
            <input type="hidden" name="utm_medium" value={partnerData.utm_medium} />
            <input type="hidden" name="utm_campaign" value={partnerData.utm_campaign} />
            <input type="hidden" name="lkCode" value={tracking.lkCode} />

            {formStep === 1 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-bold text-gray-800">
                      이름 <span className="text-cta">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={draft.name}
                      onChange={(e) => setDraft({ name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
                      placeholder="이름을 입력해주세요"
                    />
                    {fieldErrors.name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p> : null}
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-bold text-gray-800">
                      연락처 <span className="text-cta">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={draft.phone}
                      onChange={(e) => setDraft({ phone: formatPhoneInput(e.target.value) })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
                      placeholder="010-0000-0000"
                    />
                    {fieldErrors.phone ? <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p> : null}
                  </div>
                </div>

                <ChipSelect
                  label="채무금액"
                  options={DEBT_OPTIONS}
                  value={draft.debt}
                  onChange={(value) => setDraft({ debt: value })}
                  error={fieldErrors.debt}
                  required
                />

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={privacy}
                    onChange={(e) => setPrivacy(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-cta focus:ring-cta"
                  />
                  <label htmlFor="privacy" className="text-[14px] leading-relaxed text-gray-600">
                    개인정보 수집 및 상담 연락에 동의합니다.
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="w-full rounded-xl bg-cta py-4 text-[17px] font-bold text-white shadow-lg shadow-cta/30 transition-transform hover:bg-blue-700 active:scale-[0.98] sm:py-5"
                >
                  내 가능성 무료 확인
                </button>
              </>
            ) : (
              <>
                <ChipSelect
                  label="월 소득"
                  options={INCOME_OPTIONS}
                  value={draft.income}
                  onChange={(value) => setDraft({ income: value })}
                />
                <ChipSelect
                  label="연체 여부"
                  options={STATUS_OPTIONS}
                  value={draft.status}
                  onChange={(value) => setDraft({ status: value })}
                />
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-bold text-gray-800">
                    문의내용 (선택)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    maxLength={400}
                    value={draft.message}
                    onChange={(e) => setDraft({ message: e.target.value })}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
                    placeholder="현재 상황이나 궁금한 내용을 간단히 남겨주세요"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-4 text-[15px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-cta py-4 text-[17px] font-bold text-white shadow-lg shadow-cta/30 transition-transform hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-5"
                  >
                    {submitting ? '접수 중…' : '무료 상담 신청 완료'}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void submitForm()}
                  className="w-full text-center text-sm font-medium text-gray-500 underline-offset-2 hover:text-cta hover:underline disabled:opacity-50"
                >
                  상세 정보 없이 바로 신청하기
                </button>
              </>
            )}
          </form>

          <div className="mt-8 rounded-xl bg-gray-50 p-5 text-center text-[13px] leading-relaxed text-gray-500">
            상담 신청 후 담당자가 순차적으로 연락드립니다.
            <br className="hidden sm:block" />
            상담 가능 여부는 신청자의 상황에 따라 달라질 수 있습니다.
          </div>
        </div>
      </div>

      {successModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-success-title"
          onClick={() => setSuccessModal(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h3 id="consult-success-title" className="mb-3 text-xl font-bold text-main">
              접수 완료
            </h3>
            <p className="text-[15px] leading-relaxed text-gray-600">
              <span className="font-bold text-gray-900">{successModal.name}</span>님 문의주셔서 감사합니다.
              <br />
              <span className="font-bold text-gray-900">{successModal.phone}</span> 번호로 잠시 후 담당자가
              연락드리겠습니다.
            </p>
            <div className="mt-6 rounded-xl bg-bg p-4 text-left text-sm text-gray-700">
              <p className="mb-2 font-bold text-main">다음 단계</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>접수 확인 (완료)</li>
                <li>담당자 전화 상담 (영업일 기준 30분~2시간)</li>
                <li>개인회생 가능 여부 및 진행 방향 안내</li>
              </ol>
            </div>
            <p className="mt-4 text-xs text-gray-500">긴급한 경우 전화 상담 버튼을 이용해 주세요.</p>
            <button
              type="button"
              onClick={() => setSuccessModal(null)}
              className="mt-6 w-full rounded-xl bg-cta py-3.5 text-[16px] font-bold text-white transition-colors hover:bg-blue-700"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
