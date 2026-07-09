import { Link as LinkIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  adminNavItem,
  campaignNavItems,
  centerNavItems,
  companyNavItems,
  type NavLinkItem,
} from '../lib/publicNav';
import { MemberAuthMenu, MemberAuthMenuMobile } from './MemberAuthMenu';
import { canAccessAdmin } from '../lib/auth';
import { ShieldCheck } from 'lucide-react';

function navLinkClass(active: boolean, accent?: NavLinkItem['accent']) {
  if (accent === 'emerald') {
    return `whitespace-nowrap text-sm lg:text-base font-medium transition-colors ${active ? 'text-emerald-400' : 'text-slate-300 hover:text-emerald-400'}`;
  }
  if (accent === 'cyan') {
    return `whitespace-nowrap text-sm lg:text-base font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-400'}`;
  }
  return `whitespace-nowrap text-sm lg:text-base font-medium transition-colors ${active ? 'text-white' : 'text-slate-300 hover:text-white'}`;
}

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobile = () => setIsMobileMenuOpen(false);
  const showAdmin = canAccessAdmin();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 gap-6 lg:gap-8">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <LinkIcon className="w-7 h-7 text-cyan-400" />
            <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">링크커넥트</span>
          </Link>

          {/* 메인 메뉴 */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 flex-1 min-w-0" aria-label="주요 메뉴">
            {companyNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass(isActive(location.pathname, item.to))}
              >
                {item.label}
              </Link>
            ))}
            {campaignNavItems.map((item) => (
              <Link key={item.to} to={item.to} className={navLinkClass(isActive(location.pathname, item.to))}>
                {item.label}
              </Link>
            ))}
            {centerNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass(isActive(location.pathname, item.to), item.accent)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 우측: 로그인 · 회원가입 · 관리자센터 */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 ml-auto lg:ml-0 lg:border-l lg:border-white/10 lg:pl-6">
            <MemberAuthMenu variant="header-dark" onNavigate={closeMobile} />
            {showAdmin && (
              <Link
                to={adminNavItem.to}
                className="inline-flex items-center gap-1.5 shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                관리자센터
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            type="button"
            className="lg:hidden ml-auto text-slate-300 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="메뉴"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-white/10 px-4 pt-2 pb-6 space-y-1 shadow-2xl max-h-[80vh] overflow-y-auto">
          {companyNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={`block px-3 py-3 text-base font-medium rounded-lg ${
                isActive(location.pathname, item.to)
                  ? 'text-emerald-400 bg-white/5'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="my-2 border-t border-white/10" />

          {campaignNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className="block px-3 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
            >
              {item.label}
            </Link>
          ))}

          {centerNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={`block px-3 py-3 text-base font-medium rounded-lg ${
                item.accent === 'emerald' ? 'text-emerald-400 hover:bg-white/5' : 'text-cyan-400 hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
            <MemberAuthMenuMobile onNavigate={closeMobile} />
            {showAdmin && (
              <Link
                to={adminNavItem.to}
                onClick={closeMobile}
                className="w-full text-center inline-flex items-center justify-center gap-2 text-base font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors px-4 py-3 rounded-xl"
              >
                <ShieldCheck className="w-4 h-4" />
                관리자센터
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
