import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LcNotification,
  LcNotificationCenter,
  fetchAdminNotifications,
  fetchMerchantNotifications,
  fetchPartnerNotifications,
  markAdminNotificationsRead,
  markMerchantNotificationsRead,
  markPartnerNotificationsRead,
} from '../../lib/api';
import { setNativeBadge } from '../../lib/nativeApp';

function load(center: LcNotificationCenter) {
  if (center === 'admin') return fetchAdminNotifications();
  if (center === 'merchant') return fetchMerchantNotifications();
  return fetchPartnerNotifications();
}

function markRead(center: LcNotificationCenter, id?: number) {
  if (center === 'admin') return markAdminNotificationsRead(id);
  if (center === 'merchant') return markMerchantNotificationsRead(id);
  return markPartnerNotificationsRead(id);
}

export function NotificationInbox({ center }: { center: LcNotificationCenter }) {
  const [items, setItems] = useState<LcNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = () => {
    setLoading(true);
    load(center)
      .then((data) => {
        setItems(data.items);
        setUnread(data.unread);
        void setNativeBadge(data.unread);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '알림을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, [center]);

  const onOpen = async (item: LcNotification) => {
    if (!item.read) {
      await markRead(center, item.id);
      setUnread((count) => Math.max(0, count - 1));
      void setNativeBadge(Math.max(0, unread - 1));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-slate-900">알림</h2>
          <p className="text-xs text-slate-500">읽지 않음 {unread}건</p>
        </div>
        <button
          type="button"
          className="text-xs font-bold text-cyan-700"
          onClick={() => { void markRead(center).then(refresh); }}
        >
          모두 읽음
        </button>
      </div>
      {error ? <p className="px-5 py-4 text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="px-5 py-8 text-sm text-slate-500">불러오는 중...</p> : null}
      {!loading && items.length === 0 ? <p className="px-5 py-8 text-sm text-slate-500">알림이 없습니다.</p> : null}
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.link || '#'}
              onClick={() => { void onOpen(item); }}
              className={`block px-5 py-4 ${item.read ? 'bg-white' : 'bg-cyan-50/60'}`}
            >
              <div className="text-sm font-bold text-slate-900">{item.title}</div>
              <div className="text-sm text-slate-600 mt-1">{item.body}</div>
              <div className="text-[11px] text-slate-400 mt-1">{item.createdAt}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
