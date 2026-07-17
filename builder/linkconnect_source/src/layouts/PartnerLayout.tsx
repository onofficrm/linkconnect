import React, { useState } from "react";
import {
  BarChart3,
  Copy,
  CreditCard,
  LayoutDashboard,
  Link as LinkIcon,
  MessageSquare,
  PieChart,
  Target,
  XCircle,
  PhoneCall,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { MemberAuthMenu } from '../components/MemberAuthMenu';
import { CenterTopBar } from '../components/CenterTopBar';
import { ImpersonateBanner } from '../components/ImpersonateBanner';
import { SuperAdminWidget, SuperAdminHeaderButton } from '../components/SuperAdminWidget';
import { getLcAuth } from '../lib/auth';
import { AiGuideChat } from '../components/AiGuideChat';
import { NotificationCenter } from '../components/NotificationCenter';
import { CenterNavItem } from '../components/center-ui';

interface PartnerLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  title: string;
}

export function PartnerLayout({ children, activeMenu, title }: PartnerLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = getLcAuth();
  const partnerCode = auth.partnerCode ?? '—';
  const today = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${weekdays[today.getDay()]})`;

  const menuSections = [
    {
      label: '개요',
      items: [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: '대시보드', path: '/partner' },
      ],
    },
    {
      label: '실적',
      items: [
        { id: 'live-earnings', icon: <Zap size={20} />, label: '실시간 수익', path: '/partner/live-earnings' },
        { id: 'db-status', icon: <Target size={20} />, label: 'CPA 실적', path: '/partner/db-status' },
        { id: 'cps-orders', icon: <Target size={20} />, label: 'CPS 실적', path: '/partner/cps/orders' },
        { id: 'call', icon: <PhoneCall size={20} />, label: '콜디비', path: '/partner/call' },
      ],
    },
    {
      label: '홍보',
      items: [
        { id: 'links', icon: <LinkIcon size={20} />, label: '내 홍보 링크', path: '/partner/links' },
        { id: 'analytics', icon: <PieChart size={20} />, label: '유입 분석', path: '/partner/analytics' },
      ],
    },
    {
      label: '수익 · 정산',
      items: [
        { id: 'report', icon: <BarChart3 size={20} />, label: '수익 리포트', path: '/partner/report' },
        { id: 'db-cancel', icon: <XCircle size={20} />, label: '취소/무효', path: '/partner/db-cancel' },
        { id: 'settlement', icon: <CreditCard size={20} />, label: '정산 신청', path: '/partner/settlement' },
      ],
    },
    {
      label: '고객지원',
      items: [
        { id: 'support', icon: <MessageSquare size={20} />, label: '문의하기', path: '/partner/support' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col">
      {!auth.isImpersonating ? <SuperAdminWidget /> : null}
      <ImpersonateBanner />
      <CenterTopBar center="partner" />

      <div className="md:hidden border-b border-slate-200 bg-white px-4 py-2.5">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700"
          aria-label="파트너센터 메뉴 열기"
          aria-expanded={isSidebarOpen}
        >
          <span className="flex items-center gap-2"><Menu size={18} /> 파트너센터 메뉴</span>
          <span className="text-xs font-medium text-emerald-600">{title}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
      <aside className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-72 md:w-64 bg-slate-950 text-slate-300 md:min-h-screen shrink-0 flex flex-col border-r border-slate-800/80 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 pt-5 md:hidden">
          <span className="text-sm font-bold text-white">파트너센터 메뉴</span>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="파트너센터 메뉴 닫기"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          <div className="hidden md:block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-5 px-1">Partner</div>
          <nav className="space-y-5">
            {menuSections.map((section) => (
              <div key={section.label}>
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {section.label}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <CenterNavItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      to={item.path}
                      active={activeMenu === item.id}
                      accent="emerald"
                      onClick={() => setIsSidebarOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <MemberAuthMenu variant="sidebar" logoutReturnPath="/partner" />
          </div>
        </div>
      </aside>

      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="파트너센터 메뉴 닫기"
        />
      ) : null}

      <main className="flex-1 p-4 md:p-8 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/40 via-slate-50 to-slate-50">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Partner Center</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-slate-500 mt-1">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <SuperAdminHeaderButton />
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-sm text-slate-500">파트너 코드</span>
              <span className="font-mono font-bold text-slate-700">{partnerCode}</span>
              <button type="button" className="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="코드 복사"><Copy size={14} /></button>
            </div>
            <NotificationCenter center="partner" />
            <MemberAuthMenu variant="compact" logoutReturnPath="/partner" />
          </div>
        </header>

        {children}
      </main>
      </div>
      <AiGuideChat page="partner" role="partner" />
    </div>
  );
}
