import { Link as LinkIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SuperAdminHeaderButton } from './SuperAdminWidget';
import { isLcLoggedIn } from '../lib/auth';
import { handleSectionLink } from '../lib/navigation';
import { currentSpaReturnUrl, g5LoginUrl, g5LogoutUrl, g5RegisterUrl } from '../lib/urls';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const loggedIn = isLcLoggedIn();
  const loginUrl = g5LoginUrl(currentSpaReturnUrl('/select-center'));

  const goToSection = (id: string) => {
    handleSectionLink(id);
    setIsMobileMenuOpen(false);
  };

  const authLinksDesktop = loggedIn ? (
    <a
      href={g5LogoutUrl()}
      className="text-base font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
    >
      로그아웃
    </a>
  ) : (
    <>
      <a
        href={loginUrl}
        className="text-base font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-4 py-2"
      >
        로그인
      </a>
      <a
        href={g5RegisterUrl()}
        className="text-base font-medium text-slate-300 hover:text-white transition-colors px-2 py-2"
      >
        회원가입
      </a>
    </>
  );

  const authLinksMobile = loggedIn ? (
    <a
      href={g5LogoutUrl()}
      onClick={() => setIsMobileMenuOpen(false)}
      className="w-full text-center text-base font-medium text-slate-300 border border-slate-600 hover:bg-white/5 transition-colors px-4 py-3 rounded-xl"
    >
      로그아웃
    </a>
  ) : (
    <>
      <a
        href={loginUrl}
        onClick={() => setIsMobileMenuOpen(false)}
        className="w-full text-center text-base font-medium text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors px-4 py-3 rounded-xl"
      >
        로그인
      </a>
      <a
        href={g5RegisterUrl()}
        onClick={() => setIsMobileMenuOpen(false)}
        className="w-full text-center text-base font-medium text-slate-300 border border-slate-600 hover:bg-white/5 transition-colors px-4 py-3 rounded-xl"
      >
        회원가입
      </a>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <LinkIcon className="w-7 h-7 text-cyan-400" />
            <span className="text-2xl font-bold text-white tracking-tight">
              링크커넥트
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-base font-medium text-slate-300 hover:text-white transition-colors">링크커넥트</Link>
            <Link to="/cpa-list" className="text-base font-medium text-slate-300 hover:text-white transition-colors">CPA</Link>
            <Link to="/" onClick={() => goToSection('cps')} className="text-base font-medium text-slate-300 hover:text-white transition-colors">CPS</Link>
            <Link to="/events" className="text-base font-medium text-slate-300 hover:text-white transition-colors">이벤트/프로모션</Link>
            <Link to="/partner" className="text-base font-medium text-slate-300 hover:text-emerald-400 transition-colors">파트너센터</Link>
            <Link to="/advertiser" className="text-base font-medium text-slate-300 hover:text-cyan-400 transition-colors">광고주센터</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <SuperAdminHeaderButton />
            {authLinksDesktop}
            <Link
              to="/"
              onClick={() => goToSection('lc-inquiry')}
              className="text-base font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2.5 rounded-full transition-colors"
            >
              광고주 문의
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-slate-300 hover:text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="메뉴"
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 pt-2 pb-6 space-y-2 shadow-2xl">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">링크커넥트</Link>
          <Link to="/cpa-list" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">CPA 광고상품</Link>
          <Link to="/" onClick={() => goToSection('cps')} className="block px-3 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">CPS</Link>
          <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">이벤트/프로모션</Link>
          <Link to="/partner" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-emerald-400 hover:bg-white/5 rounded-lg">파트너센터</Link>
          <Link to="/advertiser" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-cyan-400 hover:bg-white/5 rounded-lg">광고주센터</Link>
          <div className="pt-4 flex flex-col gap-3">
            {authLinksMobile}
            <Link
              to="/"
              onClick={() => goToSection('lc-inquiry')}
              className="w-full text-center text-base font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-3 rounded-xl transition-colors"
            >
              광고주 문의
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
