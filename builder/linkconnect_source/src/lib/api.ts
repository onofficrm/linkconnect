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
  reason?: string;
  appeal?: string;
  hasAppeal?: boolean;
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
    pendingSettlements?: number;
    pendingInspections?: number;
  };
  chart7d: Array<{ date: string; received: number; approved: number; rejected: number; revenue: number }>;
  recent: AdminConversion[];
  partners: { total: number; active: number; pending: number };
  merchants: { total: number; active: number; pending: number; lowBalance: number };
  campaignTop?: Array<{ name: string; advertiser: string; total: number; approved: number; canceled: number; rate: string; revenue: number; status: string }>;
  partnerTop5?: Array<{ code: string; total: number; approved: number; rate: string; profit: number }>;
  advertiserTop5?: Array<{ name: string; total: number; approved: number; spend: number; balance: number }>;
  recentCancels?: AdminInspection[];
  apiErrors?: Array<{ time: string; name: string; code: string; msg: string; alId?: number }>;
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

export type AdminCampaign = {
  id: number;
  code: string;
  name: string;
  advertiser: string;
  mtId: number;
  category: string;
  type: string;
  partnerPrice: number;
  advertiserPrice: number;
  margin: number;
  totalDb: number;
  approvedDb: number;
  canceledDb: number;
  spend: number;
  rate: string;
  cancelRate: string;
  status: string;
  statusCode: string;
  lowBalance: boolean;
  description: string;
  approvalRate: string;
  avgTime: string;
  allowedChannels: string;
  forbiddenChannels: string;
  landingUrl: string;
  badge: string;
  recommended: boolean;
};

export type AdminCampaignSummary = {
  total: number;
  active: number;
  paused: number;
  lowBalance: number;
  avgPrice: number;
  avgApproval: number;
};

export function fetchAdminCampaigns(filters?: { status?: string; category?: string; q?: string }) {
  return adminApiGet<{ items: AdminCampaign[]; summary: AdminCampaignSummary; dbReady: boolean }>('campaigns.php', {
    status: filters?.status ?? '',
    category: filters?.category ?? '',
    q: filters?.q ?? '',
  });
}

export function saveAdminCampaign(payload: Record<string, unknown>) {
  return adminApiPost<{ message: string; campaign: AdminCampaign | null }>('campaigns.php', {
    action: payload.cpId ? 'update' : 'create',
    ...payload,
  });
}

export function updateAdminCampaignStatus(payload: { action: 'activate' | 'pause' | 'end' | 'draft'; cpId: number }) {
  return adminApiPost<{ message: string; campaign: AdminCampaign | null }>('campaigns.php', payload);
}

export type MerchantCampaign = {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
  statusCode: string;
  cpa: number;
  budget: number;
  spend: number;
  dbCount: number;
  category: string;
};

export type MerchantCampaignSummary = {
  total: number;
  active: number;
  pending: number;
  ended: number;
};

export function fetchMerchantCampaigns(filters?: { status?: string }) {
  return merchantApiGet<{ items: MerchantCampaign[]; summary: MerchantCampaignSummary; dbReady: boolean }>(
    'campaigns.php',
    { status: filters?.status ?? '' },
  );
}

export type MerchantWalletTransaction = {
  id: number;
  date: string;
  type: string;
  typeCode: string;
  amount: number;
  balance: number;
  status: string;
  memo: string;
};

export type MerchantWalletResponse = {
  balance: number;
  balanceFormatted: string;
  summary: {
    balance: number;
    monthlyCharge: number;
    monthlySpend: number;
    availableBalance: number;
  };
  items: MerchantWalletTransaction[];
  dbReady: boolean;
};

export function fetchMerchantWallet() {
  return merchantApiGet<MerchantWalletResponse>('wallet.php');
}

export function requestMerchantCharge(payload: { amount: number; memo?: string }) {
  return merchantApiPost<{ message: string }>('wallet.php', payload);
}

const PUBLIC_API_BASE = lcPluginUrl('api');

async function publicApiGet<T>(endpoint: string, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${PUBLIC_API_BASE}/${endpoint}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    throw new PartnerApiError(errBody.error, errBody.code, response.status);
  }

  return (body as ApiSuccessBody<T>).data;
}

export type PublicCampaign = PartnerCampaign;

export function fetchPublicCampaigns(filters?: { category?: string; q?: string }) {
  return publicApiGet<{ items: PublicCampaign[]; categories: string[]; dbReady: boolean }>('campaigns.php', {
    category: filters?.category ?? '',
    q: filters?.q ?? '',
  });
}

export type PartnerSettlementSummary = {
  balance: number;
  pendingAmount: number;
  availableAmount: number;
  paidTotal: number;
  monthConfirmed: number;
  minAmount: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
};

export type PartnerSettlementItem = {
  id: number;
  code: string;
  date: string;
  reqAmount: number;
  appAmount: number;
  status: string;
  statusCode: string;
  payDate: string;
  memo: string;
};

export function fetchPartnerSettlements() {
  return partnerApiGet<{ summary: PartnerSettlementSummary; items: PartnerSettlementItem[]; dbReady: boolean }>('settlements.php');
}

export function requestPartnerSettlement(payload: { amount: number; memo?: string; bankName?: string; bankAccount?: string; bankHolder?: string }) {
  return partnerApiPost<{ message: string; settlement: PartnerSettlementItem | null; summary: PartnerSettlementSummary }>('settlements.php', payload);
}

export type PartnerAnalyticsResponse = {
  summary: {
    totalClicks: number;
    totalDb: number;
    approvedDb: number;
    rejectedDb: number;
    avgConvRate: number;
    avgApprovalRate: number;
  };
  chart7d: Array<{ date: string; click: number; db: number; approval: number }>;
  channels: Array<{ channel: string; clicks: number; dbs: number; approved: number; percentage: number }>;
  campaigns: Array<{ campaign: string; clicks: number; received: number; approved: number; appRate: string; confRev: number }>;
  dbReady: boolean;
};

export function fetchPartnerAnalytics() {
  return partnerApiGet<PartnerAnalyticsResponse>('analytics.php');
}

export type PartnerReportResponse = {
  summary: {
    estRevenue: number;
    confRevenue: number;
    availableAmount: number;
    rejectedAmount: number;
  };
  breakdown: Array<{ label: string; value: number }>;
  monthly: Array<{ month: string; value: number; pct: number }>;
  campaigns: Array<{ campaign: string; clicks: number; received: number; approved: number; appRate: string; confRev: number }>;
  dbReady: boolean;
};

export function fetchPartnerReport() {
  return partnerApiGet<PartnerReportResponse>('report.php');
}

export type AdminSettlement = {
  id: number;
  code: string;
  date: string;
  partnerCode: string;
  partnerName: string;
  requestAmount: number;
  approvedAmount: number;
  bank: string;
  account: string;
  accountHolder: string;
  status: string;
  statusCode: string;
  memo: string;
};

export type AdminSettlementSummary = {
  pending: number;
  pendingAmount: number;
  todayApproved: number;
  monthPaid: number;
  hold: number;
  rejected: number;
};

export function fetchAdminSettlements(filters?: { status?: string; q?: string }) {
  return adminApiGet<{ items: AdminSettlement[]; summary: AdminSettlementSummary; dbReady: boolean }>('settlements.php', {
    status: filters?.status ?? '',
    q: filters?.q ?? '',
  });
}

export function updateAdminSettlement(payload: { action: 'review' | 'approve' | 'pay' | 'hold' | 'reject'; stId: number; approvedAmount?: number; memo?: string }) {
  return adminApiPost<{ message: string; settlement: AdminSettlement | null; summary: AdminSettlementSummary }>('settlements.php', payload);
}

export type AdminInspection = {
  id: string;
  cvId: number;
  date: string;
  campaign: string;
  advertiser: string;
  partner: string;
  customer: string;
  phone: string;
  reason: string;
  comment: string;
  objection: boolean;
  objectionComment: string;
  status: string;
  statusCode: string;
  price: number;
};

export type AdminInspectionSummary = {
  pending: number;
  todayCancel: number;
  confirmed: number;
  restored: number;
  appeals: number;
  cancelRate: number;
};

export function fetchAdminInspections(filters?: { status?: string; q?: string }) {
  return adminApiGet<{ items: AdminInspection[]; summary: AdminInspectionSummary; dbReady: boolean }>('inspections.php', {
    status: filters?.status ?? '',
    q: filters?.q ?? '',
  });
}

export function updateAdminInspection(payload: { action: 'confirm' | 'restore'; cvId: number; memo?: string }) {
  return adminApiPost<{ message: string; conversion: AdminInspection | null; summary: AdminInspectionSummary }>('inspections.php', payload);
}

export type InquiryItem = {
  id: string;
  iqId: number;
  date: string;
  center: string;
  centerCode: string;
  author: string;
  category: string;
  title: string;
  campaign: string;
  cvCode: string;
  status: string;
  statusCode: string;
  replyDate: string;
  content?: string;
  reply?: string;
  adminMemo?: string;
};

export type InquirySummary = {
  total: number;
  waiting: number;
  processing: number;
  closed: number;
  today: number;
};

export function fetchPartnerInquiries() {
  return partnerApiGet<{ summary: InquirySummary; items: InquiryItem[]; dbReady: boolean }>('inquiries.php');
}

export function createPartnerInquiry(payload: { category: string; subject: string; body: string; campaign?: string; cvCode?: string }) {
  return partnerApiPost<{ message: string; item: InquiryItem; summary: InquirySummary }>('inquiries.php', payload);
}

export function fetchMerchantInquiries() {
  return merchantApiGet<{ summary: InquirySummary; items: InquiryItem[]; dbReady: boolean }>('inquiries.php');
}

export function createMerchantInquiry(payload: { category: string; subject: string; body: string; campaign?: string; cvCode?: string }) {
  return merchantApiPost<{ message: string; item: InquiryItem; summary: InquirySummary }>('inquiries.php', payload);
}

export function fetchAdminInquiries(filters?: { center?: string; status?: string; q?: string }) {
  return adminApiGet<{ summary: InquirySummary; items: InquiryItem[]; dbReady: boolean }>('inquiries.php', {
    center: filters?.center ?? '',
    status: filters?.status ?? '',
    q: filters?.q ?? '',
  });
}

export function fetchAdminInquiryDetail(iqId: number) {
  return adminApiGet<{ item: InquiryItem }>('inquiries.php', { id: String(iqId) });
}

export function updateAdminInquiry(payload: { iqId: number; action: 'reply' | 'status' | 'close'; reply?: string; status?: string; adminMemo?: string }) {
  return adminApiPost<{ message: string; item: InquiryItem; summary: InquirySummary }>('inquiries.php', payload);
}

export type AdminSettingsData = {
  general: Record<string, string>;
  cpa: Record<string, string | number | boolean>;
  billing: Record<string, string | number>;
  partner: Record<string, string | number | boolean>;
  cancel: Record<string, boolean>;
  api: Record<string, string | number | boolean>;
};

export function fetchAdminSettings() {
  return adminApiGet<{ settings: AdminSettingsData; raw: Record<string, string>; dbReady: boolean }>('settings.php');
}

export function saveAdminSettings(settings: AdminSettingsData | Record<string, unknown>) {
  return adminApiPost<{ message: string; settings: AdminSettingsData; raw: Record<string, string> }>('settings.php', { settings });
}

export function resetAdminSettings() {
  return adminApiPost<{ message: string; settings: AdminSettingsData; raw: Record<string, string> }>('settings.php', { action: 'reset' });
}

export type ApiLogItem = {
  id: string;
  alId: number;
  time: string;
  client: string;
  direction: string;
  endpoint: string;
  extId: string;
  intId: string;
  statusCode: number;
  status: string;
  statusCodeRaw: string;
  error: string;
  requestBody?: string;
  responseBody?: string;
};

export type ApiClientItem = {
  id: number;
  code: string;
  name: string;
  type: string;
  apiKey: string;
  allowedIps: string;
  status: string;
  statusCode: string;
  lastCallAt: string;
};

export type ApiIntegrationSummary = {
  todayTotal: number;
  todaySuccess: number;
  todayFailed: number;
  todayDuplicate: number;
  dbshareTotal: number;
  lastReceiveTime: string;
};

export function fetchAdminIntegrations(filters?: { status?: string; client?: string; q?: string; errors?: boolean }) {
  return adminApiGet<{ summary: ApiIntegrationSummary; clients: ApiClientItem[]; dbshare: ApiClientItem | null; items: ApiLogItem[]; dbReady: boolean }>(
    'integrations.php',
    {
      status: filters?.status ?? '',
      client: filters?.client ?? '',
      q: filters?.q ?? '',
      errors: filters?.errors ? '1' : '',
    },
  );
}

export function fetchAdminIntegrationDetail(alId: number) {
  return adminApiGet<{ item: ApiLogItem }>('integrations.php', { id: String(alId) });
}

export function updateAdminIntegration(payload: { action: string; acId?: number; name?: string; type?: string; allowedIps?: string }) {
  return adminApiPost<{ message: string; client?: ApiClientItem }>('integrations.php', payload);
}

export type PartnerCancelSummary = {
  total: number;
  week: number;
  monthRate: number;
  topReason: string;
  reasons: Array<{ reason: string; count: number; percentage: number }>;
};

export function fetchPartnerCanceledDbs(filters?: { q?: string }) {
  return partnerApiGet<{ items: PartnerConversion[]; summary: PartnerDashboardResponse['summary']; cancelSummary: PartnerCancelSummary; total: number }>(
    'conversions.php',
    { rejected: '1', q: filters?.q ?? '' },
  );
}

export function submitPartnerAppeal(payload: { cvId: number; appeal: string }) {
  return partnerApiPost<{ message: string; conversion: PartnerConversion | null }>('conversions.php', { action: 'appeal', ...payload });
}

export type MerchantReportResponse = {
  summary: {
    total: number;
    approved: number;
    rejected: number;
    avgRate: number;
    totalSpend: number;
    avgPrice: number;
  };
  dbChart7d: Array<{ date: string; received: number; approved: number; rejected: number }>;
  spendChart7d: Array<{ date: string; holdSpend: number; confSpend: number; refund: number }>;
  campaigns: Array<{
    id: number;
    name: string;
    total: number;
    approved: number;
    canceled: number;
    approvalRate: number;
    cancelRate: number;
    spend: number;
    avgPrice: number;
    status: string;
  }>;
  partners: Array<{
    code: string;
    name: string;
    total: number;
    approved: number;
    canceled: number;
    approvalRate: number;
    spend: number;
    note: string;
  }>;
  dbReady: boolean;
};

export function fetchMerchantReports() {
  return merchantApiGet<MerchantReportResponse>('reports.php');
}

export type AdminWalletSummary = {
  totalBalance: number;
  totalPending: number;
  todayCharge: number;
  todaySpend: number;
  todayRefund: number;
  lowBalance: number;
};

export type AdminMerchantBalance = {
  id: number;
  name: string;
  code: string;
  balance: number;
  pending: number;
  available: number;
  totalCharged: number;
  totalUsed: number;
  totalRefund: number;
  lastCharged: string;
  status: string;
};

export type AdminWalletTransaction = {
  id: number;
  date: string;
  merchant: string;
  mtId: number;
  type: string;
  typeCode: string;
  dbCode: string;
  campaign: string;
  amount: number;
  balance: number;
  processor: string;
  memo: string;
  status: string;
};

export function fetchAdminWalletSummary() {
  return adminApiGet<{ summary: AdminWalletSummary; items: AdminPendingCharge[]; pending: number; dbReady: boolean }>('wallet.php');
}

export function fetchAdminWalletBalances(q?: string) {
  return adminApiGet<{ items: AdminMerchantBalance[]; summary: AdminWalletSummary; dbReady: boolean }>('wallet.php', {
    view: 'balances',
    q: q ?? '',
  });
}

export function fetchAdminWalletHistory(filters?: { q?: string; type?: string }) {
  return adminApiGet<{ items: AdminWalletTransaction[]; summary: AdminWalletSummary; dbReady: boolean }>('wallet.php', {
    view: 'history',
    q: filters?.q ?? '',
    type: filters?.type ?? '',
  });
}

export function adjustAdminWallet(payload: { mtId: number; type: string; amount: number; memo?: string }) {
  return adminApiPost<{ message: string; summary: AdminWalletSummary }>('wallet.php', { action: 'adjust', ...payload });
}

export type PublicEventSummaryItem = { label: string; value: string; suffix: string; icon: string };
export type PublicEventItem = {
  id: string;
  badges: string[];
  title: string;
  desc: string;
  period: string;
  product: string;
  benefit: string;
  ribbon: string;
};

export type PublicEventsResponse = {
  summary: PublicEventSummaryItem[];
  items: PublicEventItem[];
  recommendations: Array<Record<string, unknown>>;
  promoCpa: Array<Record<string, unknown>>;
  rankingTop: Array<Record<string, unknown>>;
  rankingList: Array<Record<string, unknown>>;
  dbReady: boolean;
};

export function fetchPublicEvents() {
  return publicApiGet<PublicEventsResponse>('events.php');
}
