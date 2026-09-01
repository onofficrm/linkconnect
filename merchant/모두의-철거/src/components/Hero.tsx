import React, { useState } from 'react';
import {
  PhoneCall,
  ArrowRight,
  AlertCircle,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { DemolitionFormData, FormErrorState } from '../types';
import {
  assertHeroPayloadClean,
  resolveLkCode,
  submitConsultation,
} from '../lib/linkconnect';
import { modemoAsset } from '../lib/modemoAsset';

interface HeroProps {
  onSubmitSuccess: (data: DemolitionFormData) => void;
  onSubmitError: (error: FormErrorState) => void;
  onOpenPrivacyModal: () => void;
  onScrollToForm: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSubmitSuccess,
  onSubmitError,
  onOpenPrivacyModal,
  onScrollToForm: _onScrollToForm,
}) => {
  const [quickData, setQuickData] = useState({
    name: '',
    phone: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length <= 3) {
      formatted = raw;
    } else if (raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length <= 11) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    } else {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
    setQuickData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickData((prev) => ({ ...prev, name: e.target.value }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!quickData.name.trim()) {
      newErrors.name = '성함을 입력해주세요.';
    } else if (quickData.name.trim().length < 2) {
      newErrors.name = '성함을 2자 이상 입력해주세요.';
    }
    const cleanPhone = quickData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.phone = '연락처를 입력해주세요.';
    } else if (cleanPhone.length < 10 || cleanPhone.length > 11 || !cleanPhone.startsWith('01')) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)';
    }
    if (!quickData.agreedToTerms) {
      newErrors.agreedToTerms = '개인정보 수집·이용에 동의해 주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) {
      onSubmitError({
        kind: 'validation',
        message: '필수 항목을 확인해 주세요.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Production Hero contract: inquiry fixed phrase — no fabricated region/type/pyeong
      const inquiry = '히어로 빠른상담신청';
      const result = await submitConsultation(
        {
          name: quickData.name.trim(),
          phone: quickData.phone,
          inquiry,
        },
        { lkCode: resolveLkCode() },
      );

      if (result.debugPayload) {
        assertHeroPayloadClean(result.debugPayload);
      }

      if (!result.ok) {
        const kind =
          result.message.includes('네트워크') ? 'network' : 'server';
        onSubmitError({ kind, message: result.message });
        return;
      }

      onSubmitSuccess({
        name: quickData.name.trim(),
        phone: quickData.phone,
        agreedToTerms: true,
        formSource: 'hero_quick',
        resultMessage: result.message,
        dryRun: result.dryRun,
      });
      setQuickData({ name: '', phone: '', agreedToTerms: false });
    } catch {
      onSubmitError({
        kind: 'network',
        message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex items-center justify-center bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      {/* Real hero photo — Phase 1 candidate: 2_여의도사무실.jpg */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={modemoAsset('images/2_여의도사무실.jpg')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_40%] opacity-35"
          width={960}
          height={720}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] sm:text-xs font-bold border border-blue-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>철거 견적 상담</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-[40px] lg:text-5xl font-black text-white tracking-tight leading-[1.25] sm:leading-[1.2]">
              철거가 필요하세요? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200">
                모두의 철거
              </span>
              에서 간편하게
            </h1>

            <p className="text-xs sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              상가, 사무실, 주택 철거부터 폐기물 처리까지 <br className="sm:hidden" />
              현장 상황에 맞는 견적 상담을 도와드립니다.
            </p>

            <div className="hidden sm:grid grid-cols-3 gap-2.5 w-full max-w-md pt-1">
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">현장 맞춤 견적</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">다양한 철거 대응</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">폐기물 반출 정리</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 text-slate-900">
              <div className="pb-3 mb-3.5 border-b border-slate-200">
                <h2 className="text-base sm:text-lg font-black text-slate-900">철거 상담 신청</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  이름과 연락처를 남겨주시면 상담을 안내해 드립니다.
                </p>
              </div>

              <form onSubmit={handleQuickSubmit} className="space-y-3 sm:space-y-3.5">
                <div>
                  <label htmlFor="hero-quick-name" className="block text-xs font-bold text-slate-800 mb-1">
                    이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="hero-quick-name"
                    type="text"
                    autoComplete="name"
                    placeholder="이름을 입력하세요"
                    value={quickData.name}
                    onChange={handleNameChange}
                    disabled={isSubmitting}
                    className={`w-full h-[52px] px-3.5 rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-60 ${
                      errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1 text-[11px] text-rose-600 mt-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hero-quick-phone" className="block text-xs font-bold text-slate-800 mb-1">
                    연락처 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="hero-quick-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                    value={quickData.phone}
                    onChange={handlePhoneChange}
                    maxLength={13}
                    disabled={isSubmitting}
                    className={`w-full h-[52px] px-3.5 rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-60 ${
                      errors.phone ? 'border-rose-500 bg-rose-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {errors.phone && (
                    <p className="flex items-center gap-1 text-[11px] text-rose-600 mt-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="pt-0.5">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      id="hero-quick-agree"
                      type="checkbox"
                      checked={quickData.agreedToTerms}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setQuickData((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
                        if (errors.agreedToTerms) setErrors((prev) => ({ ...prev, agreedToTerms: '' }));
                      }}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-slate-700 font-medium leading-tight">
                      상담 접수를 위한 개인정보 수집·이용에 동의합니다.
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenPrivacyModal();
                        }}
                        className="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer ml-1"
                      >
                        [보기]
                      </button>
                    </span>
                  </label>
                  {errors.agreedToTerms && (
                    <p className="flex items-center gap-1 text-[11px] text-rose-600 mt-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {errors.agreedToTerms}
                    </p>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    id="hero-quick-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[54px] rounded-2xl text-base font-extrabold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99]"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{isSubmitting ? '신청 접수 중...' : '상담 신청하기'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-0.5">
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>작성해주신 정보는 상담 안내 목적으로만 처리됩니다.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
