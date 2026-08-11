import React, { useState } from 'react';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { buildInquiryText, submitConsultation } from '../lib/linkconnect';
import { usePartnerContext } from '../context/PartnerContext';
import { trackGenerateLead } from '../lib/analytics';

interface ConsultationFormProps {
  onOpenPrivacyModal: () => void;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ onOpenPrivacyModal }) => {
  const { data } = usePartnerContext();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    sizeRange: '20~30평',
    spaceType: '아파트',
    preferredDate: '',
    memo: '',
    agreedPrivacy: true,
    website: '', // honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 11) raw = raw.slice(0, 11);

    let formatted = raw;
    if (raw.length >= 4 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length >= 8) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
    }

    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.website.trim()) {
      setSubmitSuccess(true);
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('이름을 입력해 주세요.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage('전화번호를 입력해 주세요.');
      return;
    }

    const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      setErrorMessage('올바른 전화번호 형식을 입력해 주세요. (예: 010-1234-5678)');
      return;
    }

    if (!formData.location.trim()) {
      setErrorMessage('작업 지역을 입력해 주세요.');
      return;
    }

    if (!formData.agreedPrivacy) {
      setErrorMessage('개인정보 수집 및 이용 동의에 체크해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const inquiry = buildInquiryText({
        location: formData.location,
        serviceType: '유품정리서비스',
        spaceType: `${formData.spaceType} · ${formData.sizeRange}`,
        preferredDate: formData.preferredDate,
        memo: formData.memo,
      });

      const result = await submitConsultation(
        { name: formData.name, phone: formData.phone, inquiry },
        {
          campaign_id: data.campaign_id,
          merchant_id: data.merchant_id,
          partner_id: data.partner_id,
          lkCode: data.lkCode,
          sub_id: data.sub_id,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
        },
      );

      if (result.ok) {
        trackGenerateLead({ campaign_id: data.campaign_id });
        setSubmitSuccess(true);
        setFormData({
          name: '',
          phone: '',
          location: '',
          sizeRange: '20~30평',
          spaceType: '아파트',
          preferredDate: '',
          memo: '',
          agreedPrivacy: true,
          website: '',
        });
      } else {
        setErrorMessage(result.message || '전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="section-form"
      className="py-16 lg:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white relative"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-full font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>유품정리서비스 무료 견적</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            유품정리, <br />
            <span className="text-blue-400">더 이상 혼자 고민하지 마세요</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            비용 부담 없는 100% 무료 방문 상담으로 정확한 견적을 안내받아 보세요.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-900 border border-slate-200">
          {submitSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                상담 신청이 정상적으로 접수되었습니다.
              </h3>
              <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                담당자가 확인 후 연락드리겠습니다.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all"
                >
                  추가 상담 신청하기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}
              >
                <label htmlFor="form-website">웹사이트</label>
                <input
                  id="form-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form-input-name" className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="form-input-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="이름을 입력해주세요"
                      className="w-full px-4 py-3 min-h-[48px] bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="form-input-phone" className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="form-input-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3 min-h-[48px] bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="form-input-location" className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    작업 지역 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="form-input-location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="예: 서울 강남구 / 경기 성남시"
                    className="w-full px-4 py-3 min-h-[48px] bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    평수 선택 <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {['10평 미만', '10~20평', '20~30평', '30~40평', '40평 이상'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, sizeRange: size })}
                        className={`py-2.5 px-2 text-xs font-extrabold rounded-xl border transition-all ${
                          formData.sizeRange === size
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-blue-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    공간 종류 <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['아파트', '빌라', '원룸/오피스텔', '단독주택'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, spaceType: type })}
                        className={`py-2.5 px-2 text-xs font-extrabold rounded-xl border transition-all ${
                          formData.spaceType === type
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-indigo-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="form-input-date" className="block text-xs font-bold text-slate-600 mb-1.5">
                    작업 희망일 <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <input
                    id="form-input-date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-3 min-h-[48px] bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="form-textarea-memo" className="block text-xs font-bold text-slate-600 mb-1.5">
                    문의 내용 <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <textarea
                    id="form-textarea-memo"
                    rows={3}
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    placeholder="짐의 양, 대형 가구 유무, 특이사항을 적어주세요."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.agreedPrivacy}
                    onChange={(e) => setFormData({ ...formData, agreedPrivacy: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>상담 진행을 위한 개인정보 수집 및 이용에 동의합니다.</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenPrivacyModal}
                  className="text-blue-600 underline hover:text-blue-700 font-bold shrink-0 ml-2"
                >
                  자세히 보기
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isSubmitting ? (
                  <span>전송 중...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-white" />
                    <span>무료 견적 상담 신청하기</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> 링크커넥트 CPA 연동
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> 안전하게 암호화되어 전송됩니다
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
