import React, { useState } from 'react';
import {
  PhoneCall,
  Check,
  Lock,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Paperclip,
} from 'lucide-react';
import { DemolitionFormData, DemolitionType, FormErrorState } from '../types';
import {
  buildInquiryText,
  resolveLkCode,
  submitConsultation,
} from '../lib/linkconnect';

interface ConsultationFormProps {
  onSubmitSuccess: (data: DemolitionFormData) => void;
  onSubmitError: (error: FormErrorState) => void;
  onOpenPrivacyModal: () => void;
}

const demolitionCategories: DemolitionType[] = [
  '상가/매장 원상복구',
  '인테리어 철거',
  '사무실/학원/빌딩',
  '식당/주방 시설철거',
  '주택/빌라/아파트',
  '부분/바닥/천장',
  '기타(상담 시 문의)',
];

const regions = ['서울', '경기', '인천', '기타 지역'];

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  onSubmitSuccess,
  onSubmitError,
  onOpenPrivacyModal,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    region: '',
    demolitionType: '',
    additionalNotes: '',
    agreedToTerms: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length <= 3) formatted = raw;
    else if (raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    else if (raw.length <= 11)
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    else formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] || null;
    if (next && next.size > MAX_FILE_BYTES) {
      setFile(null);
      setErrors((prev) => ({ ...prev, file: '파일은 최대 10MB까지 첨부할 수 있습니다.' }));
      e.target.value = '';
      return;
    }
    setFile(next);
    if (errors.file) setErrors((prev) => ({ ...prev, file: '' }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = '성함을 입력해주세요.';
    else if (formData.name.trim().length < 2) newErrors.name = '성함을 2자 이상 입력해주세요.';

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) newErrors.phone = '연락처를 입력해주세요.';
    else if (cleanPhone.length < 10 || cleanPhone.length > 11 || !cleanPhone.startsWith('01')) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)';
    }
    if (!formData.region) newErrors.region = '철거 지역을 선택해주세요.';
    if (!formData.demolitionType) newErrors.demolitionType = '철거 유형을 선택해주세요.';
    if (!formData.agreedToTerms) newErrors.agreedToTerms = '개인정보 수집·이용에 동의해 주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) {
      onSubmitError({ kind: 'validation', message: '필수 항목을 확인해 주세요.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const inquiry = buildInquiryText({
        serviceType: formData.demolitionType,
        region: formData.region,
        message: formData.additionalNotes.trim() || undefined,
        fileName: file?.name,
      });

      const result = await submitConsultation(
        {
          name: formData.name.trim(),
          phone: formData.phone,
          inquiry,
          region: formData.region || undefined,
        },
        { lkCode: resolveLkCode() },
        file,
      );

      if (!result.ok) {
        const kind = result.message.includes('네트워크') ? 'network' : 'server';
        onSubmitError({ kind, message: result.message });
        return;
      }

      onSubmitSuccess({
        name: formData.name.trim(),
        phone: formData.phone,
        region: formData.region,
        demolitionType: formData.demolitionType,
        additionalNotes: formData.additionalNotes.trim() || undefined,
        agreedToTerms: true,
        formSource: 'detail_quote',
        resultMessage: result.message,
        dryRun: result.dryRun,
      });

      setFormData({
        name: '',
        phone: '',
        region: '',
        demolitionType: '',
        additionalNotes: '',
        agreedToTerms: false,
      });
      setFile(null);
      const fileInput = document.getElementById('form-attachment-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
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
    <section
      id="consultation-form"
      className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-950 text-white relative border-t border-slate-800"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 space-y-8 sm:space-y-10">
        <div className="text-center space-y-2.5">
          <span className="inline-block text-xs font-black text-blue-400 tracking-wider uppercase bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
            QUOTE FORM
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            철거가 필요하시다면 <br className="sm:hidden" />
            <span className="text-blue-400">간편하게 상담받아보세요</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed font-normal">
            현장 정보를 남겨주시면 담당자가 확인 후 상담을 안내해 드립니다.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-9 shadow-2xl border border-slate-200 text-slate-900">
          <div className="pb-4 mb-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <span>철거 견적 상담 신청서</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                타업체 견적서가 있다면 첨부해 주세요. 전담 매니저가 비교 분석해 드립니다.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" encType="multipart/form-data">
            <div>
              <label htmlFor="form-name-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                이름 <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-name-input"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleNameChange}
                disabled={isSubmitting}
                className={`w-full h-[54px] px-4 rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-60 ${
                  errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-300 hover:border-slate-400'
                }`}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="form-phone-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                연락처 <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-phone-input"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={13}
                disabled={isSubmitting}
                className={`w-full h-[54px] px-4 rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-60 ${
                  errors.phone ? 'border-rose-500 bg-rose-50' : 'border-slate-300 hover:border-slate-400'
                }`}
              />
              {errors.phone && (
                <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                철거 지역 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {regions.map((reg) => (
                  <button
                    type="button"
                    key={reg}
                    id={`region-btn-${reg}`}
                    disabled={isSubmitting}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, region: reg }));
                      if (errors.region) setErrors((prev) => ({ ...prev, region: '' }));
                    }}
                    className={`h-[48px] px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer disabled:opacity-60 ${
                      formData.region === reg
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
              {errors.region && (
                <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.region}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                철거 유형 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {demolitionCategories.map((type) => (
                  <button
                    type="button"
                    key={type}
                    id={`type-btn-${type.replace(/[\/\s]/g, '-')}`}
                    disabled={isSubmitting}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, demolitionType: type }));
                      if (errors.demolitionType) setErrors((prev) => ({ ...prev, demolitionType: '' }));
                    }}
                    className={`py-3 px-3 text-left rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-between cursor-pointer disabled:opacity-60 ${
                      formData.demolitionType === type
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{type}</span>
                    {formData.demolitionType === type && <Check className="w-4 h-4 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
              {errors.demolitionType && (
                <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.demolitionType}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="form-notes-textarea" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                문의내용 <span className="text-xs font-normal text-slate-500">(선택)</span>
              </label>
              <textarea
                id="form-notes-textarea"
                name="message"
                rows={3}
                value={formData.additionalNotes}
                disabled={isSubmitting}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="현장 대략 평수, 철거 희망 일정, 특이사항 등을 자유롭게 남겨주세요."
                className="w-full min-h-[96px] p-3.5 rounded-xl bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-y disabled:opacity-60"
              />
            </div>

            {/* Attachment restore — existing Production contract: name=attachment */}
            <div>
              <label htmlFor="form-attachment-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  타업체 견적서 첨부
                </span>{' '}
                <span className="text-xs font-normal text-slate-500">(선택)</span>
              </label>
              <input
                id="form-attachment-input"
                name="attachment"
                type="file"
                accept="image/*,.pdf"
                disabled={isSubmitting}
                onChange={handleFileChange}
                className="block w-full text-xs sm:text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              {file ? (
                <p className="mt-1.5 text-xs text-slate-600 font-medium truncate">{file.name}</p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-500">
                  PDF·이미지 파일(최대 10MB)을 첨부할 수 있습니다. 현장 사진이 있다면 함께 첨부해 주세요.
                </p>
              )}
              {errors.file && (
                <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.file}
                </p>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id="form-agree-terms-checkbox"
                  name="privacy_agree"
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
                    if (errors.agreedToTerms) setErrors((prev) => ({ ...prev, agreedToTerms: '' }));
                  }}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm text-slate-700 font-medium leading-tight">
                  상담 접수를 위한 개인정보 수집·이용에 동의합니다.
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenPrivacyModal();
                    }}
                    className="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer ml-1.5"
                  >
                    [자세히 보기]
                  </button>
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.agreedToTerms}
                </p>
              )}
              <p className="mt-2 text-[11px] text-slate-500">
                연락처는 상담 목적에만 사용되며, 제3자에게 판매하지 않습니다.
              </p>
            </div>

            <div className="pt-2">
              <button
                id="form-submit-button"
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[56px] h-14 px-6 rounded-2xl text-base sm:text-lg font-extrabold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-[0.99]"
              >
                <PhoneCall className="w-5 h-5" />
                <span>{isSubmitting ? '상담 신청 접수 중...' : '철거 견적 상담 신청'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>작성해주신 정보는 상담 안내 목적으로만 처리됩니다.</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
