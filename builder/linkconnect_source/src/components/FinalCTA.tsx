import { Link } from 'react-router-dom';
import { handleSectionLink } from '../lib/navigation';

const ctaBackgroundImage = `${import.meta.env.BASE_URL}about/about_partners_activity.png`;

export function FinalCTA() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden bg-emerald-600">
      <img
        src={ctaBackgroundImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-105 opacity-90"
      />
      {/* Soft brand wash — keep partner activity visible; deepen only for text contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(6,95,70,0.28) 0%, rgba(4,120,87,0.42) 45%, rgba(6,78,59,0.72) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-700/25 via-emerald-600/20 to-emerald-900/65 pointer-events-none" />
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[min(44rem,94vw)] h-72 bg-emerald-200/20 blur-[110px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-[0_2px_18px_rgba(0,0,0,0.28)]">
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
            className="w-full sm:w-auto px-8 py-4 bg-white/12 hover:bg-white/22 text-white font-medium rounded-xl border border-white/45 transition-colors shadow-sm backdrop-blur-sm"
          >
            광고주로 문의하기
          </Link>
        </div>
      </div>
    </section>
  );
}
