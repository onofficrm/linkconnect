import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.co.linkconnect.app',
  appName: '링크커넥트',
  webDir: 'www',
  server: {
    url: 'https://linkconnect.co.kr/advertiser',
    cleartext: false,
    allowNavigation: ['linkconnect.co.kr', '*.linkconnect.co.kr'],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
