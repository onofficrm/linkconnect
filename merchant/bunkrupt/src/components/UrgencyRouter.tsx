import { Clock3, Phone, ShieldCheck } from 'lucide-react';
import { usePartnerContext } from '../context/PartnerContext';
import { formatPhoneDisplay, phoneTelHref } from '../lib/partnerData';
import { scrollToConsultForm } from '../lib/consultationForm';
import { trackLandingEvent } from '../lib/analytics';

export default function UrgencyRouter() {
  const { hasPhone, data } = usePartnerContext();
  const tel = hasPhone ? phoneTelHref(data.partner_phone) : '';

  return (
    <section className="bg-white px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 text-center">
          <p className="mb-2 text-sm font-bold text-cta">상황에 맞는 상담 방법</p>
          <h2 className="text-2xl font-bold text-main sm:text-[28px]">지금 가장 필요한 방법을 선택하세요</h2>
        </div>
        <div className={`grid gap-4 ${hasPhone && tel ? 'md:grid-cols-2' : ''}`}>
          {hasPhone && tel ? (
            <a
              href={tel}
              onClick={() => trackLandingEvent('urgency_route_click', { route: 'phone' })}
              className="group rounded-2xl border-2 border-red-100 bg-red-50/60 p-6 transition hover:border-red-300 hover:shadow-lg sm:p-8"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Phone className="h-5 w-5" />
              </div>
              <p className="mb-2 text-lg font-bold text-main">독촉·압류가 진행 중인가요?</p>
              <p className="mb-5 text-sm leading-relaxed text-gray-600">급한 상황은 전화로 현재 상태를 먼저 알려주세요. 가능한 대응 방향을 빠르게 안내합니다.</p>
              <span className="inline-flex items-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white">
                긴급 전화상담 {formatPhoneDisplay(data.partner_phone_display || data.partner_phone)}
              </span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => {
              trackLandingEvent('urgency_route_click', { route: 'form' });
              scrollToConsultForm();
            }}
            className="rounded-2xl border-2 border-blue-100 bg-blue-50/60 p-6 text-left transition hover:border-blue-300 hover:shadow-lg sm:p-8"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-cta">
              <Clock3 className="h-5 w-5" />
            </div>
            <p className="mb-2 text-lg font-bold text-main">가능 여부부터 조용히 확인할까요?</p>
            <p className="mb-5 text-sm leading-relaxed text-gray-600">채무·소득 상황을 남기면 순차적으로 검토합니다. 상담 후 바로 진행할 필요는 없습니다.</p>
            <span className="inline-flex items-center gap-2 rounded-xl bg-cta px-5 py-3 text-sm font-bold text-white">
              <ShieldCheck className="h-4 w-4" />
              30초 무료 자격진단
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
