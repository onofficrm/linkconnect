import { Bell, Database, Home, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { isNativeApp } from '../lib/nativeApp';

const tabs = {
  advertiser: [
    { to: '/advertiser', label: '홈', icon: Home, end: true },
    { to: '/advertiser/db', label: 'DB', icon: Database, end: false },
    { to: '/advertiser/notifications', label: '알림', icon: Bell, end: false },
    { to: '/advertiser/notification-settings', label: '설정', icon: Settings, end: false },
  ],
  partner: [
    { to: '/partner', label: '홈', icon: Home, end: true },
    { to: '/partner/db-status', label: 'DB', icon: Database, end: false },
    { to: '/partner/notifications', label: '알림', icon: Bell, end: false },
    { to: '/partner/notification-settings', label: '설정', icon: Settings, end: false },
  ],
  admin: [
    { to: '/admin', label: '홈', icon: Home, end: true },
    { to: '/admin/conversions', label: 'DB', icon: Database, end: false },
    { to: '/admin/notifications', label: '알림', icon: Bell, end: false },
    { to: '/admin/notification-settings', label: '설정', icon: Settings, end: false },
  ],
} as const;

export function AppTabBar({ center }: { center: keyof typeof tabs }) {
  const location = useLocation();
  if (!isNativeApp()) return null;
  const items = tabs[center];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className={`flex flex-col items-center gap-1 py-2 text-[11px] font-bold ${active ? 'text-cyan-600' : 'text-slate-400'}`}>
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
