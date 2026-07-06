import { lcPluginUrl } from './urls';

export type ApiErrorBody = {
  ok: false;
  error: string;
  code: string;
  data?: Record<string, unknown>;
};

export type ApiSuccessBody<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export class PartnerApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'PartnerApiError';
    this.code = code;
    this.status = status;
  }
}

const PARTNER_API_BASE = lcPluginUrl('partner/api');

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new PartnerApiError('빈 응답입니다.', 'EMPTY_RESPONSE', response.status);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new PartnerApiError('JSON 파싱에 실패했습니다.', 'INVALID_JSON', response.status);
  }
}

export async function partnerApiGet<T>(endpoint: string, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${PARTNER_API_BASE}/${endpoint}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    throw new PartnerApiError(errBody.error, errBody.code, response.status);
  }

  return (body as ApiSuccessBody<T>).data;
}

export async function partnerApiPost<T>(endpoint: string, payload?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${PARTNER_API_BASE}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    throw new PartnerApiError(errBody.error, errBody.code, response.status);
  }

  return (body as ApiSuccessBody<T>).data;
}

export type PartnerProfile = {
  id: number;
  code: string;
  name: string;
  status: string;
  statusLabel: string;
  balance: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  createdAt: string;
};

export type PartnerMeResponse = {
  auth: import('./auth').LcAuth;
  partner: PartnerProfile | null;
  dbReady: boolean;
};

export type PartnerCampaign = {
  id: number;
  code: string;
  title: string;
  category: string;
  type: string;
  description: string;
  price: number;
  priceFormatted: string;
  approvalRate: string;
  avgTime: string;
  allowedChannels: string;
  forbiddenChannels: string;
  status: string;
  statusCode: string;
  badge: string;
  recommended: boolean;
  landingUrl: string;
};

export type PartnerCampaignsResponse = {
  items: PartnerCampaign[];
  categories: string[];
  dbReady: boolean;
};

export function fetchPartnerMe() {
  return partnerApiGet<PartnerMeResponse>('me.php');
}

export function fetchPartnerCampaigns(filters?: { category?: string; q?: string }) {
  return partnerApiGet<PartnerCampaignsResponse>('campaigns.php', {
    category: filters?.category ?? '',
    q: filters?.q ?? '',
  });
}

export type PartnerLink = {
  id: number;
  code: string;
  campaign: string;
  campaignId: number;
  channel: string;
  subId: string;
  url: string;
  clicks: number;
  received: number;
  approved: number;
  canceled: number;
  estRevenue: number;
  confRevenue: number;
  status: string;
  statusCode: string;
  createdAt: string;
};

export type PartnerConversion = {
  id: string;
  cvId: number;
  date: string;
  campaign: string;
  name: string;
  phone: string;
  channel: string;
  subId: string;
  status: string;
  statusCode: string;
  price: number;
  estRevenue: number;
  confRevenue: number;
  comment: string;
};

export type PartnerDashboardResponse = {
  balance: number;
  balanceFormatted: string;
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    todayReceived: number;
    todayClicks: number;
    estRevenue: number;
    confRevenue: number;
    todayEstRevenue: number;
  };
  chart7d: Array<{ date: string; click: number; db: number; approval: number }>;
  channels: Array<{ channel: string; clicks: number; dbs: number; approved: number; percentage: number }>;
  recent: PartnerConversion[];
};

export function fetchPartnerDashboard() {
  return partnerApiGet<PartnerDashboardResponse>('dashboard.php');
}

export function fetchPartnerLinks() {
  return partnerApiGet<{ items: PartnerLink[]; total: number }>('links.php');
}

export function createPartnerLink(payload: { campaignId: number; channel?: string; subId?: string }) {
  return partnerApiPost<{ message: string; link: PartnerLink | null }>('links.php', payload);
}

export function fetchPartnerConversions(filters?: { status?: string; q?: string; rejected?: boolean }) {
  return partnerApiGet<{ items: PartnerConversion[]; summary: PartnerDashboardResponse['summary']; total: number }>(
    'conversions.php',
    {
      status: filters?.status ?? '',
      q: filters?.q ?? '',
      rejected: filters?.rejected ? '1' : '',
    },
  );
}

export function applyPartner() {
  return partnerApiPost<{ partner: PartnerProfile | null; message: string }>('apply.php');
}

const MERCHANT_API_BASE = lcPluginUrl('merchant/api');

export async function merchantApiGet<T>(endpoint: string, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${MERCHANT_API_BASE}/${endpoint}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    throw new PartnerApiError(errBody.error, errBody.code, response.status);
  }

  return (body as ApiSuccessBody<T>).data;
}

export async function merchantApiPost<T>(endpoint: string, payload?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${MERCHANT_API_BASE}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    throw new PartnerApiError(errBody.error, errBody.code, response.status);
  }

  return (body as ApiSuccessBody<T>).data;
}

export type MerchantProfile = {
  id: number;
  code: string;
  company: string;
  status: string;
  statusLabel: string;
  balance: number;
  createdAt: string;
};

export type MerchantMeResponse = {
  auth: import('./auth').LcAuth;
  merchant: MerchantProfile | null;
  dbReady: boolean;
};

export type MerchantConversion = {
  id: string;
  cvId: number;
  date: string;
  campaign: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  inquiry: string;
  partner: string;
  status: string;
  statusCode: string;
  price: number;
  comment: string;
  needsAction: boolean;
  channel: string;
  subId: string;
};

export type MerchantDashboardResponse = {
  balance: number;
  balanceFormatted: string;
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    needsAction: number;
    todayReceived: number;
    todaySpend: number;
  };
  chart7d: Array<{ date: string; db: number; approval: number; cancel: number }>;
  recent: MerchantConversion[];
  pendingAction: number;
};

export function fetchMerchantMe() {
  return merchantApiGet<MerchantMeResponse>('me.php');
}

export function fetchMerchantDashboard() {
  return merchantApiGet<MerchantDashboardResponse>('dashboard.php');
}

export function fetchMerchantConversions(filters?: { status?: string; q?: string; needsAction?: boolean }) {
  return merchantApiGet<{ items: MerchantConversion[]; summary: MerchantDashboardResponse['summary']; total: number }>(
    'conversions.php',
    {
      status: filters?.status ?? '',
      q: filters?.q ?? '',
      needs_action: filters?.needsAction ? '1' : '',
    },
  );
}

export function updateMerchantConversion(payload: { action: 'approve' | 'reject'; cvId: number; comment?: string; reason?: string }) {
  return merchantApiPost<{ message: string; conversion: MerchantConversion | null; merchant: MerchantProfile | null }>(
    'conversions.php',
    payload,
  );
}

export function applyMerchant() {
  return merchantApiPost<{ merchant: MerchantProfile | null; message: string }>('apply.php');
}

const ADMIN_API_BASE = lcPluginUrl('admin/api');

export async function adminApiGet<T>(endpoint: string, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${ADMIN_API_BASE}/${endpoint}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    throw new PartnerApiError(errBody.error, errBody.code, response.status);
  }

  return (body as ApiSuccessBody<T>).data;
}

export async function adminApiPost<T>(endpoint: string, payload?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${ADMIN_API_BASE}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    throw new PartnerApiError(errBody.error, errBody.code, response.status);
  }

  return (body as ApiSuccessBody<T>).data;
}

export type AdminPartner = {
  id: number;
  code: string;
  name: string;
  memberId: string;
  date: string;
  totalDb: number;
  approvedDb: number;
  canceledDb: number;
  rate: string;
  confirmedProfit: number;
  balance: number;
  status: string;
  statusCode: string;
};

export type AdminMerchant = {
  id: number;
  code: string;
  name: string;
  memberId: string;
  date: string;
  campaigns: number;
  totalDb: number;
  approvedDb: number;
  canceledDb: number;
  rate: string;
  balance: number;
  spend: number;
  status: string;
  statusCode: string;
};

export type AdminDashboardResponse = {
  summary: {
    todayReceived: number;
    todayApproved: number;
    todayRejected: number;
    todayRate: number;
    todayRevenue: number;
    pendingDb: number;
    pendingCharge: number;
    pendingPartners: number;
    pendingMerchants: number;
  };
  chart7d: Array<{ date: string; received: number; approved: number; rejected: number; revenue: number }>;
  recent: Array<{
    id: string;
    cvId: number;
    date: string;
    campaign: string;
    partner: string;
    advertiser: string;
    customer: string;
    status: string;
    statusCode: string;
    price: number;
  }>;
  partners: { total: number; active: number; pending: number };
  merchants: { total: number; active: number; pending: number; lowBalance: number };
};

export type AdminPendingCharge = {
  id: number;
  date: string;
  merchant: string;
  merchantCode: string;
  mtId: number;
  amount: number;
  memo: string;
  status: string;
};

export type AdminConversion = {
  id: string;
  cvId: number;
  date: string;
  campaign: string;
  partner: string;
  advertiser: string;
  customer: string;
  status: string;
  statusCode: string;
  price: number;
};

export function fetchAdminMe() {
  return adminApiGet<{ auth: import('./auth').LcAuth; dbReady: boolean }>('me.php');
}

export function fetchAdminDashboard() {
  return adminApiGet<AdminDashboardResponse>('dashboard.php');
}

export function fetchAdminPartners(filters?: { status?: string; q?: string }) {
  return adminApiGet<{
    items: AdminPartner[];
    summary: { total: number; active: number; pending: number };
    dbReady: boolean;
  }>('partners.php', {
    status: filters?.status ?? '',
    q: filters?.q ?? '',
  });
}

export function updateAdminPartner(payload: { action: 'activate' | 'suspend' | 'pending'; ptId: number }) {
  return adminApiPost<{ message: string; partner: Pick<AdminPartner, 'id' | 'code' | 'name' | 'status' | 'statusCode'> | null }>(
    'partners.php',
    payload,
  );
}

export function fetchAdminMerchants(filters?: { status?: string; q?: string }) {
  return adminApiGet<{
    items: AdminMerchant[];
    summary: { total: number; active: number; pending: number; lowBalance: number };
    dbReady: boolean;
  }>('merchants.php', {
    status: filters?.status ?? '',
    q: filters?.q ?? '',
  });
}

export function updateAdminMerchant(payload: { action: 'activate' | 'suspend' | 'pending'; mtId: number }) {
  return adminApiPost<{ message: string; merchant: Pick<AdminMerchant, 'id' | 'code' | 'name' | 'status' | 'statusCode'> | null }>(
    'merchants.php',
    payload,
  );
}

export function fetchAdminPendingCharges() {
  return adminApiGet<{ items: AdminPendingCharge[]; pending: number; dbReady: boolean }>('wallet.php');
}

export function updateAdminCharge(payload: { action: 'approve' | 'reject'; wtId: number; memo?: string }) {
  return adminApiPost<{ message: string }>('wallet.php', payload);
}

export function fetchAdminConversions(filters?: { status?: string }) {
  return adminApiGet<{
    items: AdminConversion[];
    summary: { todayReceived: number; approved: number; rejected: number; pending: number };
    total: number;
    dbReady: boolean;
  }>('conversions.php', {
    status: filters?.status ?? '',
  });
}
