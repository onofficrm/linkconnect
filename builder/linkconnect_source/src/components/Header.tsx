import { ChevronDown, Link as LinkIcon, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  campaignNavItems,
  centerNavItems,
  companyNavItems,
  isCompanyNavActive,
  type NavLinkItem,
} from '../lib/publicNav';
import { MemberAuthMenu, MemberAuthMenuMobile } from './MemberAuthMenu';
import { SuperAdminHeaderButton } from './SuperAdminWidget';
import { isLcSuperAdmin } from '../lib/auth';

function navLinkClass(active: boolean, accent?: NavLinkItem['accent']) {
  if (accent === 'emerald') {
    return `text-base font-medium transition-colors ${active ? 'text-emerald-400' : 'text-slate-300 hover:text-emerald-400'}`;
  }
  if (accent === 'cyan') {
    return `text-base font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-400'}`;
  }
  return `text-base font-medium transition-colors ${active ? 'text-white' : 'text-slate-300 hover:text-white'}`;
}

function CompanyNavDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = isCompanyNavActive(location.pathname);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${navLinkClass(active)}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        회사소개
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 py-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50">
          {companyNavItems.map((item) => {
            const itemActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  itemActive ? 'text-emerald-400 bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobile = () => setIsMobileMenuOpen(false);

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
            <CompanyNavDropdown />
            {campaignNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass(location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))}
              >
                {item.label}
              </Link>
            ))}
            {centerNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass(
                  location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
                  item.accent,
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <MemberAuthMenu variant="header-dark" onNavigate={closeMobile} />
            <SuperAdminHeaderButton />
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
        <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 pt-2 pb-6 space-y-1 shadow-2xl">
          <p className="px-3 pt-2 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">회사소개</p>
          {companyNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={`block px-3 py-2.5 text-base font-medium rounded-lg pl-5 ${
                location.pathname === item.to
                  ? 'text-emerald-400 bg-white/5'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <p className="px-3 pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">캠페인</p>
          {campaignNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className="block px-3 py-2.5 pl-5 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
            >
              {item.label}
            </Link>
          ))}

          <p className="px-3 pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">센터</p>
          {centerNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={`block px-3 py-2.5 pl-5 text-base font-medium rounded-lg ${
                item.accent === 'emerald' ? 'text-emerald-400 hover:bg-white/5' : 'text-cyan-400 hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 flex flex-col gap-3">
            <MemberAuthMenuMobile onNavigate={closeMobile} />
            {isLcSuperAdmin() && (
              <Link
                to="/admin"
                onClick={closeMobile}
                className="w-full text-center text-base font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors px-4 py-3 rounded-xl"
              >
                관리자센터
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
