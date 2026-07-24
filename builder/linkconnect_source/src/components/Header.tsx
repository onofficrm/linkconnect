import { ChevronDown, Link as LinkIcon, Menu, ShieldCheck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  adminNavItem,
  campaignNavItems,
  centerNavItems,
  companySubItems,
  communityNavItem,
  isCompanyNavActive,
  type NavLinkItem,
} from '../lib/publicNav';
import { handleSectionLink, scrollToSectionAfterPaint } from '../lib/navigation';
import { MemberAuthMenu, MemberAuthMenuMobile } from './MemberAuthMenu';

function navLinkClass(active: boolean, accent?: NavLinkItem['accent']) {
  if (accent === 'emerald') {
    return `whitespace-nowrap text-sm font-medium transition-colors ${active ? 'text-emerald-400' : 'text-slate-300 hover:text-emerald-400'}`;
  }
  if (accent === 'cyan') {
    return `whitespace-nowrap text-sm font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-400'}`;
  }
  return `whitespace-nowrap text-sm font-medium transition-colors ${active ? 'text-white' : 'text-slate-300 hover:text-white'}`;
}

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function PublicNavLink({
  item,
  className,
  onNavigate,
}: {
  item: NavLinkItem;
  className: string;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const active = item.scrollTarget
    ? location.pathname === '/' && location.hash === `#${item.scrollTarget}`
    : isActive(location.pathname, item.to);

  if (item.scrollTarget) {
    return (
      <Link
        to={item.to}
        onClick={(e) => {
          // 홈에서는 해당 섹션으로 스크롤, 그 외는 to 경로로 이동
          if (location.pathname === '/') {
            e.preventDefault();
            // 모바일 메뉴를 먼저 닫은 뒤 스크롤(헤더 높이 측정 정확도)
            onNavigate?.();
            scrollToSectionAfterPaint(item.scrollTarget!);
            return;
          }
          if (item.to === '/') {
            handleSectionLink(item.scrollTarget!);
          }
          onNavigate?.();
        }}
        className={className}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link to={item.to} onClick={onNavigate} className={className}>
      {item.label}
    </Link>
  );
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
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
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
        <div className="absolute top-full left-0 pt-1 w-52 z-[100]">
          <div className="py-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl">
            {companySubItems.map((item) => (
              <PublicNavLink
                key={item.label}
                item={item}
                onNavigate={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  item.scrollTarget
                    ? location.pathname === '/' && location.hash === `#${item.scrollTarget}`
                      ? 'text-emerald-400 bg-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                    : isActive(location.pathname, item.to)
                      ? 'text-emerald-400 bg-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminCenterBadge({ onNavigate, className = '' }: { onNavigate?: () => void; className?: string }) {
  return (
    <Link
      to={adminNavItem.to}
      onClick={onNavigate}
      className={`inline-flex items-center gap-1.5 shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm border border-cyan-400/30 ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      관리자센터
    </Link>
  );
}

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <header
      data-lc-nav="v2"
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-lc-nav-bar className="flex items-center justify-between h-20 w-full gap-3 lg:gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <LinkIcon className="w-6 h-6 text-cyan-400 shrink-0" />
            <span className="text-lg lg:text-xl font-bold text-white tracking-tight whitespace-nowrap">링크커넥트</span>
          </Link>

          <nav
            className="hidden md:flex items-center justify-center flex-1 gap-3 lg:gap-4 xl:gap-5 min-w-0"
            aria-label="주요 메뉴"
          >
            <CompanyNavDropdown />
            {campaignNavItems.map((item) => (
              <PublicNavLink
                key={item.label}
                item={item}
                className={navLinkClass(
                  item.scrollTarget && location.pathname === '/'
                    ? location.hash === `#${item.scrollTarget}`
                    : isActive(location.pathname, item.to),
                )}
              />
            ))}
            <PublicNavLink
              item={communityNavItem}
              className={navLinkClass(isActive(location.pathname, communityNavItem.to))}
            />
            {centerNavItems.map((item) => (
              <PublicNavLink
                key={item.to}
                item={item}
                className={navLinkClass(
                  item.scrollTarget && location.pathname === '/'
                    ? location.hash === `#${item.scrollTarget}`
                    : isActive(location.pathname, item.to),
                  item.accent,
                )}
              />
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 shrink-0 pl-3 lg:pl-4 border-l border-white/10">
            <MemberAuthMenu variant="header-dark" onNavigate={closeMobile} />
            <AdminCenterBadge />
          </div>

          {/* 모바일 햄버거 */}
          <button
            type="button"
            className="md:hidden ml-auto text-slate-300 hover:text-white p-2 shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="메뉴"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
          <p className="px-3 pt-2 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">회사소개</p>
          {companySubItems.map((item) => (
            <PublicNavLink
              key={item.label}
              item={item}
              onNavigate={closeMobile}
              className={`block px-3 py-2.5 pl-5 text-base font-medium rounded-lg ${
                item.scrollTarget
                  ? location.pathname === '/' && location.hash === `#${item.scrollTarget}`
                    ? 'text-emerald-400 bg-white/5'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                  : isActive(location.pathname, item.to)
                    ? 'text-emerald-400 bg-white/5'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            />
          ))}

          <p className="px-3 pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">캠페인</p>
          {campaignNavItems.map((item) => (
            <PublicNavLink
              key={item.label}
              item={item}
              onNavigate={closeMobile}
              className="block px-3 py-2.5 pl-5 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
            />
          ))}

          <p className="px-3 pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">커뮤니티</p>
          <PublicNavLink
            item={communityNavItem}
            onNavigate={closeMobile}
            className="block px-3 py-2.5 pl-5 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          />

          <p className="px-3 pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">센터</p>
          {centerNavItems.map((item) => (
            <PublicNavLink
              key={item.to}
              item={item}
              onNavigate={closeMobile}
              className={`block px-3 py-2.5 pl-5 text-base font-medium rounded-lg ${
                item.accent === 'emerald' ? 'text-emerald-400 hover:bg-white/5' : 'text-cyan-400 hover:bg-white/5'
              }`}
            />
          ))}

          <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
            <MemberAuthMenuMobile onNavigate={closeMobile} />
            <AdminCenterBadge onNavigate={closeMobile} className="w-full justify-center py-3" />
          </div>
          </div>
        </div>
      )}
    </header>
  );
}
