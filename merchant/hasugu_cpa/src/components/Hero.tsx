import { useState, FormEvent } from 'react';
import {
  Phone,
  CheckCircle,
  Clock,
  ShieldCheck,
  Wrench,
  BadgeCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';
import { resolveLkCode, submitConsultation } from '../lib/linkconnect';

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

export default function Hero() {
  const { data } = usePartnerContext();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isValidPhone(phone) || !privacy) {
      setErrorMessage(
        !privacy
          ? '개인정보 수집·이용에 동의해 주세요.'
          : !isValidPhone(phone)
            ? '연락처를 정확히 입력해 주세요.'
            : '이름을 입력해 주세요.',
      );
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    window.dispatchEvent(new CustomEvent('lead_submit_click'));

    try {
      const result = await submitConsultation(
        {
          name: name.trim(),
          phone: phone.trim(),
          inquiry: '히어로 빠른상담신청',
        },
        {
          lkCode: resolveLkCode() || data.lkCode,
          channel: data.utm_source || data.utm_medium || '',
          sub_id: data.sub_id || data.utm_campaign,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
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

  return (
    <section className="relative bg-white pt-6 pb-12 sm:pt-16 sm:pb-24 overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold border border-blue-100">
                  <ShieldCheck size={15} />
                  <span>하수구·배관 전문 상담</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-100">
                  <Clock size={15} />
                  <span>평균 10분 이내 연락</span>
                </div>
              </div>
              <h1 className="text-[1.85rem] sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.25] tracking-tight word-break-keep">
                악취·역류·막힘,
                <br />
                <span className="text-blue-600">원인부터</span> 확인합니다
              </h1>
              <p className="text-[15px] sm:text-lg text-slate-600 leading-relaxed max-w-lg word-break-keep">
                하수구·싱크대·변기·공용배관까지 전문 장비로 점검하고, 협의된 작업만 진행합니다.
              </p>
            </div>

            {/* Hero mini lead form — name + phone */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-sm">
              {status === 'success' ? (
                <div className="flex flex-col items-center text-center py-4 gap-3">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={28} />
                  </div>
                  <p className="text-lg font-bold text-slate-900 word-break-keep">
                    상담신청이 접수되었습니다.
                  </p>
                  <p className="text-sm text-slate-600 word-break-keep">
                    영업시간 기준 평균 10분 이내 연락을 목표로 합니다.
                  </p>
                </div>
              ) : (
                <form
                  id="hero_lead_form"
                  onSubmit={handleSubmit}
                  className="space-y-3"
                  noValidate
                >
                  <p className="text-sm font-bold text-slate-800 mb-1">이름·연락처만 남겨주세요</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="sr-only" htmlFor="hero_customer_name">
                      이름
                    </label>
                    <input
                      id="hero_customer_name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름"
                      className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-[15px] text-slate-900 placeholder:text-slate-400"
                    />
                    <label className="sr-only" htmlFor="hero_customer_phone">
                      연락처
                    </label>
                    <input
                      id="hero_customer_phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                      placeholder="연락처 (010-0000-0000)"
                      className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-[15px] text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy}
                      onChange={(e) => setPrivacy(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <span className="text-[13px] text-slate-600 leading-snug">
                      상담 접수를 위한 개인정보 수집·이용에 동의합니다.{' '}
                      <a
                        href={data.privacy_policy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-slate-500 hover:text-slate-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        내용 보기
                      </a>
                    </span>
                  </label>

                  {status === 'error' && errorMessage ? (
                    <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-0.5">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      id="hero_form_btn"
                      data-event-name="hero_form_click"
                      data-placement="hero"
                      className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[16px] font-bold py-3.5 px-5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          접수 중...
                        </>
                      ) : (
                        '빠른 상담신청'
                      )}
                    </button>
                    <CallButton
                      id="hero_call_btn"
                      placement="hero"
                      className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 text-[16px] font-bold py-3.5 px-5 rounded-xl border border-slate-200 transition-all active:scale-[0.98]"
                    >
                      <Phone size={20} />
                      전화상담
                    </CallButton>
                  </div>
                </form>
              )}
            </div>

            <div className="hidden sm:flex flex-wrap gap-4 sm:gap-6">
              {[
                { text: '협의 후 작업', icon: CheckCircle },
                { text: '전문 장비 점검', icon: Wrench },
                { text: '7일 재점검 안내', icon: BadgeCheck },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-slate-700 font-bold">
                  <badge.icon size={18} className="text-blue-500" />
                  <span className="text-sm">{badge.text}</span>
                </div>
              ))}
            </div>

            <div className="flex sm:hidden gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {['협의 후 작업', '장비 점검', '재점검 안내'].map((t) => (
                <span
                  key={t}
                  className="shrink-0 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none hidden sm:block"
          >
            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=800&auto=format&fit=crop"
                alt="전문 설비 기사가 배관을 점검하는 모습"
                className="w-full h-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
                width="600"
                height="800"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            </div>

            <div className="absolute top-8 -left-2 sm:-left-8 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-full text-blue-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">안심 서비스</p>
                <p className="text-sm font-bold text-slate-900">동의 후 작업만 진행</p>
              </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <Clock size={18} />
              </div>
              <p className="font-bold text-slate-800 text-sm">서울·인천·경기 · 일정 안내</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
