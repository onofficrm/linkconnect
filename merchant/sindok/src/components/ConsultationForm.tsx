import React, { useEffect, useRef, useState } from 'react';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Lock, ImagePlus, X } from 'lucide-react';
import { buildInquiryText, submitConsultation } from '../lib/linkconnect';
import { usePartnerContext } from '../context/PartnerContext';
import { trackGenerateLead } from '../lib/analytics';

interface ConsultationFormProps {
  onOpenPrivacyModal: () => void;
}

type PhotoItem = {
  id: string;
  name: string;
  previewUrl: string;
};

const MAX_PHOTOS = 3;

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ onOpenPrivacyModal }) => {
  const { data } = usePartnerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    serviceType: '유품정리서비스',
    spaceType: '아파트',
    preferredDate: '',
    memo: '',
    agreedPrivacy: true,
    website: '', // honeypot
  });
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const photosRef = useRef<PhotoItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  const clearPhotos = () => {
    setPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter(
      (file): file is File => file instanceof File && file.type.startsWith('image/'),
    );
    if (selected.length === 0) return;

    setPhotos((prev) => {
      const remain = Math.max(0, MAX_PHOTOS - prev.length);
      const nextFiles = selected.slice(0, remain);
      const nextItems = nextFiles.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...nextItems].slice(0, MAX_PHOTOS);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((photo) => photo.id !== id);
    });
  };

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
        serviceType: formData.serviceType,
        spaceType: formData.spaceType,
        preferredDate: formData.preferredDate,
        memo: formData.memo,
        photoCount: photos.length,
        photoNames: photos.map((photo) => photo.name),
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
          serviceType: '유품정리서비스',
          spaceType: '아파트',
          preferredDate: '',
          memo: '',
          agreedPrivacy: true,
          website: '',
        });
        clearPhotos();
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
            유품·짐 반출, <br />
            <span className="text-blue-400">더 이상 혼자 고민하지 마세요</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            현장 사진을 함께 남겨주시면 <br className="sm:hidden" />
            물량 파악이 빨라 견적 안내가 더 정확해집니다.
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
                담당자가 확인 후 연락드리겠습니다. 현장 사진을 선택하신 경우, 상담 시 전달 방법을 안내해 드립니다.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form-select-servicetype" className="block text-xs font-bold text-slate-600 mb-1.5">
                      서비스 종류 <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <select
                      id="form-select-servicetype"
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 min-h-[48px] bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
                    >
                      <option value="유품정리서비스">유품정리서비스</option>
                      <option value="짐·잔짐 반출">짐·잔짐 반출</option>
                      <option value="가구·가전 수거">가구·가전 수거</option>
                      <option value="퇴거 정리 (간단 마감 포함)">퇴거 정리 (간단 마감 포함)</option>
                      <option value="폐기물 처리">폐기물 처리</option>
                      <option value="기타 상담">기타 상담</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="form-select-spacetype" className="block text-xs font-bold text-slate-600 mb-1.5">
                      공간 종류 <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <select
                      id="form-select-spacetype"
                      value={formData.spaceType}
                      onChange={(e) => setFormData({ ...formData, spaceType: e.target.value })}
                      className="w-full px-4 py-3 min-h-[48px] bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
                    >
                      <option value="아파트">아파트</option>
                      <option value="빌라">빌라</option>
                      <option value="단독주택">단독주택</option>
                      <option value="원룸 또는 오피스텔">원룸 또는 오피스텔</option>
                      <option value="사무실 또는 상가">사무실 또는 상가</option>
                      <option value="기타">기타</option>
                    </select>
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

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label htmlFor="form-site-photos" className="block text-xs font-bold text-slate-600">
                      현장 사진 <span className="text-slate-400 font-normal">(선택, 최대 {MAX_PHOTOS}장)</span>
                    </label>
                    {photos.length > 0 && (
                      <button
                        type="button"
                        onClick={clearPhotos}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                        전체 지우기
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                    사진은 서버에 바로 업로드되지 않으며, 접수 메모에 ‘사진 N장’으로 남겨 상담 시 전달을 안내합니다.
                  </p>
                  <label className="flex items-center justify-center gap-2 cursor-pointer w-full min-h-[52px] px-4 py-3 bg-slate-50 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl text-sm font-bold text-slate-700 transition-all">
                    <ImagePlus className="w-4 h-4 text-blue-600" />
                    <span>{photos.length > 0 ? `사진 추가 (${photos.length}/${MAX_PHOTOS})` : '방·짐 사진 선택하기'}</span>
                    <input
                      ref={fileInputRef}
                      id="form-site-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handlePhotosChange}
                      disabled={photos.length >= MAX_PHOTOS}
                    />
                  </label>
                  {photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                        >
                          <img
                            src={photo.previewUrl}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center"
                            aria-label={`${photo.name} 삭제`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-1.5 py-1">
                            <p className="text-[10px] text-white truncate font-medium">{photo.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
