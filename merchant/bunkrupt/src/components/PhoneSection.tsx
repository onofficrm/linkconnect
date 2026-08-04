import { Phone } from "lucide-react";
import { usePartnerContext } from "../context/PartnerContext";
import { formatPhoneDisplay, phoneTelHref } from "../lib/partnerData";
import { trackLandingEvent } from "../lib/analytics";

export default function PhoneSection() {
  const { hasPhone, data } = usePartnerContext();
  if (!hasPhone) return null;

  const phoneDisplay = formatPhoneDisplay(data.partner_phone_display || data.partner_phone);
  const tel = phoneTelHref(data.partner_phone);
  if (!tel || !phoneDisplay) return null;

  return (
    <section className="partner-phone-section phone-only bg-bg px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl bg-main shadow-xl">
          <div className="relative px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-5">
              <div className="absolute -left-1/4 -top-1/2 h-full w-full rounded-full bg-white blur-3xl"></div>
              <div className="absolute -bottom-1/2 -right-1/4 h-full w-full rounded-full bg-point blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-point">
                <Phone className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-white sm:text-[28px]">
                전화상담이 더 빠릅니다
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-[15px] leading-relaxed text-gray-300">
                아래 전용번호로 연락하시면 현재 보고 계신 상담 페이지 기준으로 안내받을 수 있습니다.
              </p>
              
              <div className="mb-8 flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-medium text-gray-400">빠른 전화상담</span>
                <a
                  href={tel}
                  onClick={() => trackLandingEvent('phone_section_click')}
                  className="partner-phone-link text-4xl font-black tracking-tight text-point sm:text-5xl tabular-nums hover:opacity-90"
                >
                  <span className="partner-phone-text">{phoneDisplay}</span>
                </a>
              </div>

              <a 
                href={tel}
                onClick={() => trackLandingEvent('phone_section_click', { surface: 'cta' })}
                className="partner-phone-link inline-flex w-full items-center justify-center gap-2 rounded-xl bg-point px-8 py-4 text-lg font-bold text-main shadow-lg transition-transform hover:bg-[#d4b47a] active:scale-[0.98] sm:w-auto"
              >
                <Phone className="h-5 w-5" />
                지금 전화상담하기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
