import { Link } from 'react-router-dom';
import { handleSectionLink } from '../lib/navigation';

const ctaBackgroundImage = `${import.meta.env.BASE_URL}about/about_ecosystem.png`;

export function FinalCTA() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden bg-emerald-950">
      <img
        src={ctaBackgroundImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] opacity-50"
      />
      {/* Dark vignette — edges deep, center slightly open so texture reads as atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 42%, rgba(6,78,59,0.28) 0%, rgba(2,44,34,0.72) 52%, rgba(2,18,14,0.94) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-transparent to-emerald-950/90 pointer-events-none" />
      {/* Soft stage light behind copy */}
      <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[min(40rem,90vw)] h-56 bg-emerald-400/15 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
          광고주는 성과를 만들고, <br />
          파트너는 수익을 만듭니다.
        </h2>
        <p className="text-lg text-emerald-100/90 mb-10 tracking-wide">
          지금 바로 링크커넥트에서 완벽한 제휴마케팅을 시작하세요.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/partner"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-emerald-800 font-bold rounded-xl transition-colors shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]"
          >
            파트너로 시작하기
          </Link>
          <Link
            to="/"
            onClick={() => handleSectionLink('lc-inquiry')}
            className="w-full sm:w-auto px-8 py-4 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium rounded-xl border border-white/25 transition-colors shadow-sm backdrop-blur-sm"
          >
            광고주로 문의하기
          </Link>
        </div>
      </div>
    </section>
  );
}
