export type LcAuth = {
  loggedIn: boolean;
  isSuperAdmin: boolean;
  isPartner: boolean;
  isActivePartner: boolean;
  partnerId: number | null;
  partnerCode: string | null;
  partnerName: string | null;
  partnerStatus: string | null;
  isMerchant: boolean;
  isActiveMerchant: boolean;
  merchantId: number | null;
  merchantCode: string | null;
  merchantCompany: string | null;
  merchantStatus: string | null;
  merchantBalance: number | null;
  isLinkconnectAdmin: boolean;
  canAccessAdmin: boolean;
  dbReady: boolean;
};

declare global {
  interface Window {
    __LC_AUTH__?: LcAuth;
  }
}

const defaultAuth: LcAuth = {
  loggedIn: false,
  isSuperAdmin: false,
  isPartner: false,
  isActivePartner: false,
  partnerId: null,
  partnerCode: null,
  partnerName: null,
  partnerStatus: null,
  isMerchant: false,
  isActiveMerchant: false,
  merchantId: null,
  merchantCode: null,
  merchantCompany: null,
  merchantStatus: null,
  merchantBalance: null,
  isLinkconnectAdmin: false,
  canAccessAdmin: false,
  dbReady: false,
};

export function getLcAuth(): LcAuth {
  if (typeof window === 'undefined') {
    return defaultAuth;
  }
  return { ...defaultAuth, ...window.__LC_AUTH__ };
}

export function isLcLoggedIn(): boolean {
  return getLcAuth().loggedIn;
}

export function isLcSuperAdmin(): boolean {
  return getLcAuth().isSuperAdmin;
}

export function isLcPartner(): boolean {
  return getLcAuth().isPartner;
}

export function isLcActivePartner(): boolean {
  return getLcAuth().isActivePartner;
}

export function canAccessPartnerCenter(): boolean {
  const auth = getLcAuth();
  if (auth.isSuperAdmin) {
    return true;
  }
  if (!auth.dbReady) {
    return true;
  }
  return auth.isActivePartner;
}

export function isLcMerchant(): boolean {
  return getLcAuth().isMerchant;
}

export function isLcActiveMerchant(): boolean {
  return getLcAuth().isActiveMerchant;
}

export function canAccessAdvertiserCenter(): boolean {
  const auth = getLcAuth();
  if (auth.isSuperAdmin) {
    return true;
  }
  if (!auth.dbReady) {
    return true;
  }
  return auth.isActiveMerchant;
}

export function canAccessAdmin(): boolean {
  return getLcAuth().canAccessAdmin;
}
