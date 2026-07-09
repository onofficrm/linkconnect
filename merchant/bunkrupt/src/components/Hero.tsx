import { Phone } from 'lucide-react';
import { resolveHeroCopy } from '../lib/heroCopy';
import { scrollToCalculator, scrollToConsultForm } from '../lib/consultationForm';
import { trackLandingEvent } from '../lib/analytics';
import HeroMiniForm from './HeroMiniForm';

export default function Hero() {
  const copy = resolveHeroCopy();

  return (
    <section className="relative overflow-hidden bg-main px-4 py-12 text-white sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full overflow-hidden opacity-10">
        <div className="absolute -right-[10%] -top-[20%] h-[70%] w-[70%] rounded-full bg-point blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-cta blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-block rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-point">
            {copy.badge}
          </div>
          <h1 className="mb-5 whitespace-pre-line text-[28px] font-bold leading-[1.3] sm:text-4xl lg:text-[42px] lg:leading-[1.25]">
            {copy.title}
          </h1>
          <p className="mb-4 whitespace-pre-line text-[15px] leading-relaxed text-gray-200 sm:text-lg">
            {copy.subtitle}
          </p>
          <p className="mb-8 whitespace-pre-line text-sm leading-relaxed text-gray-400 sm:text-[15px]">
            {copy.hint}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="tel:"
              className="phone-only partner-phone-link flex w-full items-center justify-center gap-2 rounded-xl bg-point px-6 py-4 text-base font-bold text-main shadow-lg transition-transform active:scale-95 sm:w-auto"
            >
              <Phone className="h-5 w-5" />
              <span className="partner-phone-text phone-label-only" data-phone-label={copy.secondaryCta}>
                {copy.secondaryCta}
              </span>
            </a>
            <button
              type="button"
              onClick={() => {
                trackLandingEvent('hero_cta_click', { source: 'hero_primary' });
                scrollToConsultForm();
              }}
              className="flex w-full items-center justify-center rounded-xl bg-cta px-6 py-4 text-base font-bold text-white shadow-lg transition-transform active:scale-95 sm:w-auto"
            >
              {copy.primaryCta}
            </button>
            <button
              type="button"
              onClick={() => {
                trackLandingEvent('calculator_start', { source: 'hero_secondary' });
                scrollToCalculator();
              }}
              className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-white/15 sm:w-auto"
            >
              1분 계산기
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <HeroMiniForm />
        </div>
      </div>
    </section>
  );
}
