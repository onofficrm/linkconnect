import { registerPushDevice, unregisterPushDevice } from './api';

type PushPayload = {
  data?: Record<string, string>;
  notification?: { data?: Record<string, string> };
  value?: string;
};

type CapacitorBridge = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: {
    PushNotifications?: {
      requestPermissions: () => Promise<{ receive?: string }>;
      register: () => Promise<void>;
      createChannel?: (channel: Record<string, unknown>) => Promise<void>;
      addListener: (event: string, listener: (payload: PushPayload) => void) => Promise<{ remove: () => void }>;
    };
    Badge?: {
      set: (options: { count: number }) => Promise<void>;
    };
    App?: {
      getInfo?: () => Promise<{ version?: string }>;
    };
  };
};

let currentToken = '';

function bridge(): CapacitorBridge | null {
  const cap = (window as Window & { Capacitor?: CapacitorBridge }).Capacitor;
  return cap ?? null;
}

export function isNativeApp() {
  return Boolean(bridge()?.isNativePlatform?.());
}

export async function setNativeBadge(count: number) {
  const badge = bridge()?.Plugins?.Badge;
  if (!badge) return;
  try {
    await badge.set({ count: Math.max(0, count) });
  } catch {
    /* 배지 플러그인이 없는 빌드 */
  }
}

export async function initNativePush(navigate: (path: string) => void) {
  const cap = bridge();
  const push = cap?.Plugins?.PushNotifications;
  if (!cap?.isNativePlatform?.() || !push) return;

  const platform = cap.getPlatform?.() === 'ios' ? 'ios' : 'android';
  if (platform === 'android' && push.createChannel) {
    await push.createChannel({
      id: 'db_received',
      name: '신규 DB',
      description: '상담 DB 접수 알림',
      importance: 5,
      visibility: 1,
    });
    await push.createChannel({
      id: 'general',
      name: '일반 알림',
      importance: 3,
    });
  }

  await push.addListener('registration', (token) => {
    const value = token.value || '';
    if (!value) return;
    currentToken = value;
    const version = cap.Plugins?.App?.getInfo?.();
    void Promise.resolve(version).then((info) => registerPushDevice({
      token: value,
      platform,
      appVersion: info?.version || '',
    })).catch(() => undefined);
  });

  await push.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification?.data || action.data || {};
    const link = data.link || '';
    if (link.startsWith('/')) {
      navigate(link);
    }
  });

  const permission = await push.requestPermissions();
  if (permission.receive === 'granted') {
    await push.register();
  }

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const link = target?.closest?.('a');
    if (link && /logout\.php/i.test(link.getAttribute('href') || '') && currentToken) {
      void unregisterPushDevice(currentToken).catch(() => undefined);
      currentToken = '';
    }
  });
}
