import React from "react";
import { 
  BarChart3, 
  Bell, 
  Copy, 
  CreditCard, 
  LayoutDashboard, 
  Link as LinkIcon, 
  LogOut,
  MessageSquare, 
  PieChart, 
  Search, 
  Target, 
  User, 
  XCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SuperAdminWidget, SuperAdminHeaderButton } from '../components/SuperAdminWidget';
import { getLcAuth } from '../lib/auth';
import { g5LogoutUrl } from '../lib/urls';

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
    { id: 'search', icon: <Search size={20} />, label: "광고상품 찾기", path: "/partner/search" },
    { id: 'links', icon: <LinkIcon size={20} />, label: "내 홍보 링크", path: "/partner/links" },
    { id: 'analytics', icon: <PieChart size={20} />, label: "유입 분석", path: "/partner/analytics" },
    { id: 'db-status', icon: <Target size={20} />, label: "디비 현황", path: "/partner/db-status" },
    { id: 'db-cancel', icon: <XCircle size={20} />, label: "취소/무효 디비", path: "/partner/db-cancel" },
    { id: 'report', icon: <BarChart3 size={20} />, label: "수익 리포트", path: "/partner/report" },
    { id: 'settlement', icon: <CreditCard size={20} />, label: "정산 신청", path: "/partner/settlement" },
    { id: 'support', icon: <MessageSquare size={20} />, label: "문의하기", path: "/partner/support" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SuperAdminWidget />
      <div className="flex flex-col md:flex-row flex-1">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen shrink-0 overflow-x-auto md:overflow-visible flex flex-col">
        <div className="p-4 md:p-6 flex md:flex-col gap-2 md:gap-0 flex-1">
          <div className="hidden md:block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Menu</div>
          <nav className="flex md:flex-col gap-2 md:space-y-1 min-w-max md:min-w-0 flex-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeMenu === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <a
            href={g5LogoutUrl()}
            className="hidden md:flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium border-t border-slate-800 pt-4"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            <SuperAdminHeaderButton />
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-sm text-slate-500">파트너 코드</span>
              <span className="font-mono font-bold text-slate-700">{partnerCode}</span>
              <button className="text-slate-400 hover:text-emerald-500"><Copy size={14} /></button>
            </div>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 relative shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-sm">
              <User size={20} />
            </button>
          </div>
        </header>

        {children}
      </main>
      </div>
    </div>
  );
}
