import { useState, useEffect, FormEvent } from 'react';
import { Phone, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';
import { buildInquiryText, resolveLkCode, submitConsultation } from '../lib/linkconnect';

export default function FormSection() {
  const { data, hasPhone } = usePartnerContext();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [trackingData, setTrackingData] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    referrer_url: '',
    landing_url: '',
    device_type: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

    setTrackingData({
      utm_source: params.get('utm_source') || data.utm_source || '',
      utm_medium: params.get('utm_medium') || data.utm_medium || '',
      utm_campaign: params.get('utm_campaign') || data.utm_campaign || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || '',
      referrer_url: document.referrer || '',
      landing_url: window.location.href,
      device_type: isMobile ? 'mobile' : 'desktop',
    });
  }, [data.utm_source, data.utm_medium, data.utm_campaign]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      window.dispatchEvent(new CustomEvent('lead_validation_error'));
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    window.dispatchEvent(new CustomEvent('lead_submit_click'));

    const formData = new FormData(form);
    const inquiry = buildInquiryText({
      area: String(formData.get('service_area') || ''),
      areaDetail: String(formData.get('service_area_detail') || ''),
      serviceType: String(formData.get('service_type') || ''),
      preferredTime: String(formData.get('preferred_contact_time') || ''),
      message: String(formData.get('customer_message') || ''),
    });

    try {
      const result = await submitConsultation(
        {
          name: String(formData.get('customer_name') || ''),
          phone: String(formData.get('customer_phone') || ''),
          inquiry,
        },
        {
          lkCode: resolveLkCode() || data.lkCode,
          channel: trackingData.utm_source || trackingData.utm_medium || '',
          sub_id: data.sub_id || trackingData.utm_campaign,
          utm_source: trackingData.utm_source,
          utm_medium: trackingData.utm_medium,
          utm_campaign: trackingData.utm_campaign,
          partner_id: data.partner_id,
          campaign_id: data.campaign_id,
          merchant_id: data.merchant_id,
        },
      );

      if (result.ok) {
        setStatus('success');
        window.dispatchEvent(new CustomEvent('lead_submit_success'));
      } else {
        setErrorMessage(result.message);
        setStatus('error');
        window.dispatchEvent(new CustomEvent('lead_submit_error'));
      }
    } catch {
      setErrorMessage('접수 중 문제가 발생했습니다.');
      setStatus('error');
      window.dispatchEvent(new CustomEvent('lead_submit_error'));
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <section id="consultation-form" className="py-16 sm:py-24 bg-white scroll-mt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            전화가 어려우신가요?<br className="sm:hidden" />
            <span className="text-blue-600"> 빠른 상담을 신청해주세요</span>
          </h2>
          <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto word-break-keep">
            지역과 증상을 남겨주시면 접수 내용을 확인한 후 연락드립니다.
          </p>
        </div>

        <div className="bg-slate-50 rounded-[2rem] p-6 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
          {status === 'success' && (
            <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 word-break-keep">
                상담신청이 접수되었습니다.
              </h3>
              <p className="text-slate-600 text-lg mb-8 word-break-keep">확인 후 연락드리겠습니다.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 word-break-keep">
                접수 중 문제가 발생했습니다.
              </h3>
              <p className="text-slate-600 text-lg mb-8 word-break-keep">
                {errorMessage || '잠시 후 다시 시도하거나 전화로 문의해주세요.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                  onClick={resetForm}
                  className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
                >
                  다시 시도하기
                </button>
                {hasPhone ? (
                  <CallButton
                    placement="form_error"
                    className="flex-1 py-4 px-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors"
                  >
                    <Phone size={20} />
                    전화로 문의하기
                  </CallButton>
                ) : null}
              </div>
            </div>
          )}

          <form
            id="linkconnect_lead_form"
            action={data.lead_submit_url}
            method="post"
            onSubmit={handleSubmit}
            className={`space-y-8 ${status === 'idle' || status === 'loading' ? 'block' : 'hidden'}`}
          >
            <input type="hidden" name="partner_id" value={data.partner_id} />
            <input type="hidden" name="merchant_id" value={data.merchant_id} />
            <input type="hidden" name="campaign_id" value={data.campaign_id} />
            <input type="hidden" name="landing_id" value={data.landing_id} />
            <input type="hidden" name="affiliate_id" value={data.affiliate_id} />
            <input type="hidden" name="sub_id" value={data.sub_id} />
            <input type="hidden" name="utm_source" value={trackingData.utm_source} />
            <input type="hidden" name="utm_medium" value={trackingData.utm_medium} />
            <input type="hidden" name="utm_campaign" value={trackingData.utm_campaign} />
            <input type="hidden" name="utm_term" value={trackingData.utm_term} />
            <input type="hidden" name="utm_content" value={trackingData.utm_content} />
            <input type="hidden" name="referrer_url" value={trackingData.referrer_url} />
            <input type="hidden" name="landing_url" value={trackingData.landing_url} />
            <input type="hidden" name="device_type" value={trackingData.device_type} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-2.5">
                <label htmlFor="customer_name" className="block text-[15px] font-bold text-slate-700">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  autoComplete="name"
                  required
                  placeholder="고객님 성함을 입력해주세요"
                  className="w-full px-5 py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-[15px] text-slate-900"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="customer_phone" className="block text-[15px] font-bold text-slate-700">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  autoComplete="tel"
                  required
                  placeholder="숫자와 하이픈(-) 입력 가능"
                  className="w-full px-5 py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-[15px] text-slate-900"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="service_area" className="block text-[15px] font-bold text-slate-700">
                  지역 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    id="service_area"
                    name="service_area"
                    required
                    className="w-[120px] shrink-0 px-4 py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-[15px] text-slate-900 cursor-pointer"
                  >
                    <option value="">선택</option>
                    <option value="서울">서울</option>
                    <option value="인천">인천</option>
                    <option value="경기">경기</option>
                    <option value="기타">기타</option>
                  </select>
                  <input
                    type="text"
                    id="service_area_detail"
                    name="service_area_detail"
                    placeholder="상세 지역 입력 (예: 강남구, 부천시)"
                    aria-label="상세 지역 입력"
                    className="w-full px-5 py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-[15px] text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="service_type" className="block text-[15px] font-bold text-slate-700">
                  증상 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  required
                  className="w-full px-5 py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-[15px] text-slate-900 cursor-pointer"
                >
                  <option value="">어떤 문제가 있으신가요?</option>
                  <option value="하수구막힘">하수구막힘</option>
                  <option value="싱크대막힘">싱크대막힘</option>
                  <option value="변기막힘">변기막힘</option>
                  <option value="공용배관막힘">공용배관막힘</option>
                  <option value="악취">악취</option>
                  <option value="역류">역류</option>
                  <option value="고압세척">고압세척</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className="space-y-2.5 md:col-span-2">
                <label htmlFor="customer_message" className="block text-[15px] font-bold text-slate-700">
                  상세내용 (선택)
                </label>
                <textarea
                  id="customer_message"
                  name="customer_message"
                  rows={3}
                  placeholder="현재 겪고 계신 증상이나 문의사항을 자유롭게 남겨주세요."
                  className="w-full px-5 py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-[15px] text-slate-900 resize-none"
                />
              </div>

              <div className="space-y-2.5 md:col-span-2">
                <fieldset>
                  <legend className="block text-[15px] font-bold text-slate-700 mb-2.5">
                    상담 가능 시간 <span className="text-red-500">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-3">
                    {['지금 가능', '오전', '오후', '저녁', '시간 협의'].map((time) => (
                      <label key={time} className="cursor-pointer relative">
                        <input
                          type="radio"
                          name="preferred_contact_time"
                          value={time}
                          required
                          className="peer sr-only"
                          defaultChecked={time === '지금 가능'}
                        />
                        <div className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-600 font-medium peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 transition-all hover:bg-slate-50 text-[15px]">
                          {time}
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <label className="flex items-start sm:items-center gap-3 cursor-pointer group" htmlFor="privacy_agree">
                <div className="relative flex items-center shrink-0 mt-0.5 sm:mt-0">
                  <input
                    type="checkbox"
                    id="privacy_agree"
                    name="privacy_agree"
                    required
                    className="w-6 h-6 rounded-md border-2 border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors peer cursor-pointer"
                  />
                </div>
                <span className="text-slate-700 font-medium flex-1 text-[15px] sm:text-base">
                  상담 접수를 위한 개인정보 수집 및 이용에 동의합니다.{' '}
                  <span className="text-red-500">*</span>
                </span>
                <a
                  href={data.privacy_policy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 underline text-[15px] whitespace-nowrap hover:text-slate-800"
                  aria-label="개인정보처리방침 내용 보기"
                >
                  내용 보기
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              id="lead_submit_btn"
              data-event-name="lead_submit_click"
              data-placement="lead_form"
              className="w-full py-5 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[17px] font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex justify-center items-center gap-2 active:scale-[0.99]"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  상담 접수 중입니다...
                </>
              ) : (
                '빠른 상담신청'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
