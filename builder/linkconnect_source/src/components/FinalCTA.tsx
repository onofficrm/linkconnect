import { Link } from 'react-router-dom';
import { handleSectionLink } from '../lib/navigation';

const ctaBackgroundImage = `${import.meta.env.BASE_URL}about/about_hero.png`;

export function FinalCTA() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden bg-emerald-700">
      <img
        src={ctaBackgroundImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-105 opacity-[0.72]"
      />
      {/* Soft emerald wash — keep center open so the bright scene reads through */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.45) 48%, rgba(4,97,69,0.78) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/35 via-emerald-700/30 to-emerald-900/70 pointer-events-none" />
      {/* Soft stage light behind copy */}
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[min(42rem,92vw)] h-64 bg-emerald-200/25 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
          광고주는 성과를 만들고, <br />
          파트너는 수익을 만듭니다.
        </h2>
        <p className="text-lg text-emerald-50/95 mb-10 tracking-wide">
          지금 바로 링크커넥트에서 완벽한 제휴마케팅을 시작하세요.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/partner"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-emerald-800 font-bold rounded-xl transition-colors shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]"
          >
            파트너로 시작하기
          </Link>
          <Link
            to="/"
            onClick={() => handleSectionLink('lc-inquiry')}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/40 transition-colors shadow-sm backdrop-blur-sm"
          >
            광고주로 문의하기
          </Link>
        </div>
      </div>
    </section>
  );
}
