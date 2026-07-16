import React from "react";
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
  const auth = getLcAuth();
  const partnerCode = auth.partnerCode ?? '—';
  const today = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${weekdays[today.getDay()]})`;

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: "대시보드", path: "/partner" },
    { id: 'live-earnings', icon: <Zap size={20} />, label: "실시간 수익", path: "/partner/live-earnings" },
    { id: 'cps-orders', icon: <Target size={20} />, label: "CPS 실적", path: "/partner/cps/orders" },
    { id: 'links', icon: <LinkIcon size={20} />, label: "내 홍보 링크", path: "/partner/links" },
    { id: 'analytics', icon: <PieChart size={20} />, label: "유입 분석", path: "/partner/analytics" },
    { id: 'db-status', icon: <Target size={20} />, label: "디비 현황", path: "/partner/db-status" },
    { id: 'call', icon: <PhoneCall size={20} />, label: "콜디비", path: "/partner/call" },
    { id: 'db-cancel', icon: <XCircle size={20} />, label: "취소/무효 디비", path: "/partner/db-cancel" },
    { id: 'report', icon: <BarChart3 size={20} />, label: "수익 리포트", path: "/partner/report" },
    { id: 'settlement', icon: <CreditCard size={20} />, label: "정산 신청", path: "/partner/settlement" },
    { id: 'support', icon: <MessageSquare size={20} />, label: "문의하기", path: "/partner/support" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col">
      {!auth.isImpersonating ? <SuperAdminWidget /> : null}
      <ImpersonateBanner />
      <CenterTopBar center="partner" />
      <div className="flex flex-col md:flex-row flex-1">
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 md:min-h-screen shrink-0 overflow-x-auto md:overflow-visible flex flex-col border-r border-slate-800/80">
        <div className="p-4 md:p-5 flex md:flex-col gap-2 md:gap-0 flex-1">
          <div className="hidden md:block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-4 px-1">Partner</div>
          <nav className="flex md:flex-col gap-1.5 min-w-max md:min-w-0 flex-1">
            {menuItems.map((item) => (
              <CenterNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                to={item.path}
                active={activeMenu === item.id}
                accent="emerald"
              />
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <MemberAuthMenu variant="sidebar" logoutReturnPath="/partner" />
          </div>
        </div>
      </aside>

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
