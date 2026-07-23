import { Link as LinkIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  companyNavItems,
  footerCampaignNavItems,
  footerServiceNavItems,
} from '../lib/publicNav';
import { handleSectionLink, scrollToSection } from '../lib/navigation';
import type { NavLinkItem } from '../lib/publicNav';

function footerLinkClass(accent?: NavLinkItem['accent']) {
  if (accent === 'cyan') return 'hover:text-cyan-400 transition-colors';
  return 'hover:text-emerald-400 transition-colors';
}

function FooterNavLink({ item }: { item: NavLinkItem }) {
  const location = useLocation();
  const className = footerLinkClass(item.accent);

  if (item.scrollTarget) {
    return (
      <Link
        to={item.to}
        onClick={(e) => {
          if (location.pathname === '/') {
            e.preventDefault();
            scrollToSection(item.scrollTarget!);
          } else if (item.to === '/') {
            handleSectionLink(item.scrollTarget!);
          }
        }}
        className={className}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link to={item.to} className={className}>
      {item.label}
    </Link>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-5">
        {title}
      </h4>
      <ul className="space-y-3 text-sm text-slate-400">{children}</ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 mb-14">
          <div className="lg:col-span-5 xl:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <LinkIcon className="w-5 h-5 text-emerald-400" />
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                링크커넥트
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              클릭을 수익으로, DB를 성과로 연결하는 제휴마케팅 플랫폼입니다.
              최고의 전환율과 투명한 정산 시스템을 제공합니다.
            </p>
            <div className="space-y-1.5 text-sm text-slate-500">
              <p>이메일: support2580_@linkconnect.co.kr</p>
              <p>고객센터: 070-8098-6824 (평일 10:00 ~ 17:00)</p>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
            <FooterColumn title="회사소개">
              {companyNavItems.map((item) => (
                <li key={`${item.to}-${item.label}`}>
                  <FooterNavLink item={item} />
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="캠페인">
              {footerCampaignNavItems.map((item) => (
                <li key={item.label}>
                  <FooterNavLink item={item} />
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="서비스">
              {footerServiceNavItems.map((item) => (
                <li key={item.to}>
                  <FooterNavLink item={item} />
                </li>
              ))}
            </FooterColumn>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            © {year} LinkConnect. All rights reserved.
          </p>
          <nav
            className="flex items-center gap-4 text-sm text-slate-500 sm:ml-auto"
            aria-label="법적 고지"
          >
            <Link to="/terms" className="hover:text-slate-300 transition-colors whitespace-nowrap">
              이용약관
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              |
            </span>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors whitespace-nowrap">
              개인정보처리방침
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
