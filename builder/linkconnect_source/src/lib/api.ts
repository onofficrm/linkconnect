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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
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
  thumbnailUrl?: string;
  hasPublishedGuide?: boolean;
  campaignType?: 'cpa' | 'cps';
  merchantCode?: string;
  promoUrl?: string;
  lpmId?: number;
};

export type PartnerCampaignsResponse = {
  items: PartnerCampaign[];
  categories: string[];
  dbReady: boolean;
  counts?: { cpa: number; cps: number };
};

export function fetchPartnerMe() {
  return partnerApiGet<PartnerMeResponse>('me.php');
}

export function fetchPartnerCampaigns(filters?: { category?: string; q?: string; type?: 'cpa' | 'cps' | 'all' }) {
  return partnerApiGet<PartnerCampaignsResponse>('campaigns.php', {
    category: filters?.category ?? '',
    q: filters?.q ?? '',
    type: filters?.type ?? 'cpa',
  });
}

export type PartnerPromoGuideImage = {
  id: number;
  assetId: number;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  imageTitle: string;
  sortOrder: number;
  downloadUrl: string;
};

export type PartnerPromoGuideConfirmation = {
  confirmed: boolean;
  confirmedAt: string;
  guideUpdatedAt: string;
  guideId: number;
};

export type PartnerPromoGuideDetail = {
  campaign: PartnerCampaign;
  guide: {
    id: number;
    guideId: number;
    campaignId: number;
    promotionPoints: string[];
    recommendedKeywords: string[];
    forbiddenWords: string[];
    precautions: string[];
    validDbRules: string[];
    invalidDbRules: string[];
    approvalType: 'free' | 'first_review' | 'all_review';
    guideStatus: string;
    updatedAt: string;
    publishedAt: string;
    images: PartnerPromoGuideImage[];
  };
  confirmation: PartnerPromoGuideConfirmation;
};

export function fetchPartnerPromoGuide(cpId: number) {
  return partnerApiGet<PartnerPromoGuideDetail>('campaign-guide.php', { cpId: String(cpId) });
}

export function confirmPartnerPromoGuide(cpId: number) {
  return partnerApiPost<{ message: string; confirmation: PartnerPromoGuideConfirmation }>('campaign-guide.php', {
    action: 'confirm',
    cpId,
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

/* ── 파트너 링크프라이스 CPS ── */

export type PartnerLpMerchant = {
  lpmId: number;
  merchantCode: string;
  merchantName: string;
  originalName: string;
  merchantLogo: string;
  categoryName: string;
  commissionPc: string;
  commissionMobile: string;
  partnerRate: number;
  settlement: string;
  whenTrans: string;
  denyAd: string;
  denyProduct: string;
  notice: string;
  deeplinkYn: string;
  isRecommended: boolean;
  promoUrl: string;
  partnerToken: string;
  clicks: number;
  expectedOrders: number;
  confirmedOrders: number;
};

export function fetchPartnerLpMerchants(filters?: { q?: string; code?: string; deeplink?: boolean }) {
  return partnerApiGet<{
    items: PartnerLpMerchant[];
    total: number;
    partnerToken: string;
    stats?: PartnerLpStats;
    dbReady: boolean;
  }>('linkprice.php', {
    view: 'merchants',
    q: filters?.q ?? '',
    code: filters?.code ?? '',
    deeplink: filters?.deeplink ? '1' : '',
  });
}

export function buildPartnerLpDeeplink(payload: { merchantCode: string; productUrl: string }) {
  return partnerApiPost<{ message: string; promoUrl: string }>('linkprice.php', {
    action: 'deeplink',
    ...payload,
  });
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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
  }

  return (body as ApiSuccessBody<T>).data;
}

export async function merchantApiPostFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${MERCHANT_API_BASE}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    const extra = errBody.data && typeof errBody.data === 'object' ? (errBody.data as Record<string, unknown>) : undefined;
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (extra?.errors) {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = extra.errors as Record<string, string>;
    }
    throw err;
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
  qualityScore?: number;
  qualityTags?: string[];
  partnerVisible?: boolean;
  landingUrl?: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  approvalCriteria?: string;
  cancelCriteria?: string;
  adminComment?: string;
  partnerPublic?: boolean;
  history?: Array<{ time: string; text: string }>;
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

export function updateMerchantConversion(payload: {
  action: 'approve' | 'reject';
  cvId: number;
  comment?: string;
  reason?: string;
  qualityScore?: number;
  qualityTags?: string[];
  partnerVisible?: boolean;
}) {
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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
  }

  return (body as ApiSuccessBody<T>).data;
}

export async function adminApiPostFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${ADMIN_API_BASE}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  const body = await parseJson<ApiSuccessBody<T> | ApiErrorBody>(response);
  if (!body.ok) {
    const errBody = body as ApiErrorBody;
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
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
  adminMemo?: string;
  tags?: string[];
  assignedTo?: string;
  abuseScore?: number;
  reviewScore?: number;
  tier?: string | null;
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
  adminMemo?: string;
  tags?: string[];
  assignedTo?: string;
  abuseScore?: number;
  reviewScore?: number;
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

export type ImpersonateState = {
  active: boolean;
  type: string | null;
  id: number | null;
  label: string;
};

export function viewAsPartner(ptId: number) {
  return adminApiPost<{ message: string; impersonate: ImpersonateState; redirect: string }>('impersonate.php', {
    action: 'view_partner',
    ptId,
  });
}

export function viewAsMerchant(mtId: number) {
  return adminApiPost<{ message: string; impersonate: ImpersonateState; redirect: string }>('impersonate.php', {
    action: 'view_merchant',
    mtId,
  });
}

export function exitImpersonate() {
  return adminApiPost<{ message: string; impersonate: ImpersonateState; redirect: string }>('impersonate.php', {
    action: 'exit',
  });
}

export type ImpersonateHistoryItem = {
  id: number;
  type: string;
  targetId: number;
  label: string;
  startedAt: string;
  endedAt: string;
};

export function fetchImpersonateHistory() {
  return adminApiGet<{ history: ImpersonateHistoryItem[]; impersonate: ImpersonateState }>('impersonate.php');
}

export type ReviewQueueItem = {
  entityType: string;
  entityId: number;
  code: string;
  name: string;
  status: string;
  reviewScore: number;
  abuseScore?: number;
  tags?: string[];
};

export function fetchAdminReviewQueue() {
  return adminApiGet<{ items: ReviewQueueItem[]; dbReady: boolean }>('ops.php', { view: 'review_queue' });
}

export function saveAdminEntityMeta(payload: {
  entityType: 'partner' | 'merchant';
  entityId: number;
  adminMemo?: string;
  tags?: string[];
  assignedTo?: string;
}) {
  return adminApiPost<{ message: string }>('ops.php', { action: 'save_meta', ...payload });
}

export function bulkAdminPartners(ids: number[], subAction: 'activate' | 'suspend' | 'pending') {
  return adminApiPost<{ message: string; count: number }>('ops.php', { action: 'bulk_partner', ids, subAction });
}

export function bulkAdminMerchants(ids: number[], subAction: 'activate' | 'suspend' | 'pending') {
  return adminApiPost<{ message: string; count: number }>('ops.php', { action: 'bulk_merchant', ids, subAction });
}

export function bulkAdminRewardPay(ids: number[]) {
  return adminApiPost<{ message: string; count: number }>('ops.php', { action: 'bulk_reward_pay', ids });
}

export type EventRoiItem = {
  evId: number;
  code: string;
  title: string;
  status: string;
  participants: number;
  totalDb: number;
  approvedDb: number;
  revenue: number;
  paidRewards: number;
  pendingRewards: number;
  roi: number;
};

export function fetchAdminEventRoi() {
  return adminApiGet<{ items: EventRoiItem[]; summary: { totalReward: number; totalRevenue: number; netRoi: number } }>(
    'events.php',
    { view: 'roi' },
  );
}

export type ChannelReportItem = {
  id: number;
  cvId: number;
  cvCode: string;
  ptId: number;
  partner: string;
  partnerName: string;
  channel: string;
  reason: string;
  status: string;
  adminMemo: string;
  createdAt: string;
};

export function fetchAdminChannelReports(status?: string) {
  return adminApiGet<{ items: ChannelReportItem[]; dbReady: boolean }>('channel_reports.php', { status: status ?? '' });
}

export function updateAdminChannelReport(payload: { action: 'sanction' | 'dismiss' | 'review'; crId: number; memo?: string }) {
  return adminApiPost<{ message: string }>('channel_reports.php', payload);
}

export function reportMerchantChannel(payload: { cvId: number; channel?: string; reason: string }) {
  return merchantApiPost<{ message: string }>('conversions.php', { action: 'report_channel', ...payload });
}

export function fetchSettlementRisk(stId: number) {
  return adminApiGet<{ risk: { score: number; level: string; risks: Array<{ level: string; code: string; message: string }>; blocked: boolean } }>(
    'settlements.php',
    { view: 'risk', stId: String(stId) },
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

export type AdminCampaignPromoGuideSummary = {
  exists: boolean;
  guideId?: number;
  status?: string;
  statusLabel?: string;
  hasPoints?: boolean;
  keywordCount?: number;
  forbiddenCount?: number;
  imageCount?: number;
  updatedAt?: string;
  publishedAt?: string;
  revisionReason?: string;
};

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
  promoGuide?: AdminCampaignPromoGuideSummary;
  thumbnailUrl?: string;
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

export function deleteAdminCampaign(payload: { cpId: number; confirm: string }) {
  return adminApiPost<{ message: string }>('campaigns.php', {
    action: 'delete',
    cpId: payload.cpId,
    confirm: payload.confirm,
  });
}

export function uploadAdminCampaignThumbnail(cpId: number, file: File) {
  const formData = new FormData();
  formData.append('action', 'upload');
  formData.append('cpId', String(cpId));
  formData.append('file', file);
  return adminApiPostFormData<{ message: string; thumbnailUrl: string; campaign: AdminCampaign | null }>(
    'campaign-thumbnail.php',
    formData,
  );
}

export function deleteAdminCampaignThumbnail(cpId: number) {
  return adminApiPost<{ message: string }>('campaign-thumbnail.php', {
    action: 'delete',
    cpId,
  });
}

export type AdminPromoGuideDetail = {
  exists: boolean;
  guideId?: number;
  campaignId?: number;
  campaignName?: string;
  campaignStatus?: string;
  promotionPoints?: string[];
  recommendedKeywords?: string[];
  forbiddenWords?: string[];
  precautions?: string[];
  validDbRules?: string[];
  invalidDbRules?: string[];
  approvalType?: 'free' | 'first_review' | 'all_review';
  guideStatus?: string;
  guideStatusLabel?: string;
  revisionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  images?: Array<{
    id: number;
    assetId: number;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    imageTitle: string;
    sortOrder: number;
    downloadUrl: string;
  }>;
};

export type AdminPromoGuideLog = {
  id: number;
  guideId: number;
  campaignId: number;
  actorType: string;
  actorId: string;
  fromStatus: string;
  fromStatusLabel: string;
  toStatus: string;
  toStatusLabel: string;
  summary: string;
  revisionReason: string;
  createdAt: string;
};

export function fetchAdminPromoGuide(cpId: number) {
  return adminApiGet<AdminPromoGuideDetail>('campaign-guide.php', { cpId: String(cpId) });
}

export function fetchAdminPromoGuideLogs(guideId: number) {
  return adminApiGet<{ items: AdminPromoGuideLog[] }>('campaign-guide.php', {
    guideId: String(guideId),
    logs: '1',
  });
}

export function adminPromoGuideAction(payload: {
  action: 'publish' | 'hide' | 'review' | 'draft' | 'request_revision';
  guideId: number;
  cpId?: number;
  reason?: string;
}) {
  return adminApiPost<{ message: string; guide: AdminPromoGuideDetail | null }>('campaign-guide.php', payload);
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

export type MerchantPromoGuideImage = {
  id: number;
  assetId: number;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  imageTitle: string;
  sortOrder: number;
  downloadUrl: string;
};

export type MerchantPromoGuideLimits = {
  promotion_points: number;
  recommended_keywords: number;
  forbidden_words: number;
  precautions: number;
  valid_db_rules: number;
  invalid_db_rules: number;
  images: number;
};

export type MerchantPromoGuideData = {
  exists: boolean;
  campaignId?: number;
  campaignName?: string;
  guideId?: number;
  promotionPoints?: string[];
  recommendedKeywords?: string[];
  forbiddenWords?: string[];
  precautions?: string[];
  validDbRules?: string[];
  invalidDbRules?: string[];
  approvalType?: 'free' | 'first_review' | 'all_review';
  guideStatus?: string;
  guideStatusLabel?: string;
  revisionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  images?: MerchantPromoGuideImage[];
  limits?: MerchantPromoGuideLimits;
  maxImageBytes?: number;
  skipReview?: boolean;
  csrfToken?: string;
};

export type MerchantPromoGuideSaveResponse = {
  message: string;
  guide: MerchantPromoGuideData | null;
  csrfToken?: string;
};

export function fetchMerchantPromoGuide(cpId: number) {
  return merchantApiGet<MerchantPromoGuideData>('campaign-guide.php', { cpId: String(cpId) });
}

export function saveMerchantPromoGuideDraft(cpId: number, csrfToken: string, payload: Record<string, unknown>) {
  return merchantApiPost<MerchantPromoGuideSaveResponse>('campaign-guide.php', {
    action: 'save_draft',
    cpId,
    csrfToken,
    ...payload,
  });
}

export function updateMerchantPromoGuide(cpId: number, csrfToken: string, payload: Record<string, unknown>) {
  return merchantApiPost<MerchantPromoGuideSaveResponse>('campaign-guide.php', {
    action: 'update',
    cpId,
    csrfToken,
    ...payload,
  });
}

export function submitMerchantPromoGuideReview(cpId: number, csrfToken: string, payload?: Record<string, unknown>) {
  return merchantApiPost<MerchantPromoGuideSaveResponse>('campaign-guide.php', {
    action: 'submit_review',
    cpId,
    csrfToken,
    payload,
  });
}

export function publishMerchantPromoGuide(cpId: number, csrfToken: string, payload?: Record<string, unknown>) {
  return merchantApiPost<MerchantPromoGuideSaveResponse>('campaign-guide.php', {
    action: 'publish',
    cpId,
    csrfToken,
    payload,
  });
}

export function createMerchantPromoGuide(cpId: number, csrfToken: string) {
  return merchantApiPost<MerchantPromoGuideSaveResponse>('campaign-guide.php', {
    action: 'create',
    cpId,
    csrfToken,
  });
}

export function uploadMerchantPromoGuideImage(cpId: number, csrfToken: string, file: File, imageTitle = '') {
  const form = new FormData();
  form.append('action', 'upload');
  form.append('cpId', String(cpId));
  form.append('csrfToken', csrfToken);
  form.append('file', file);
  if (imageTitle) form.append('imageTitle', imageTitle);
  return merchantApiPostFormData<{ message: string; asset: MerchantPromoGuideImage; csrfToken?: string }>(
    'campaign-guide-asset.php',
    form,
  );
}

export function deleteMerchantPromoGuideImage(assetId: number, csrfToken: string) {
  return merchantApiPost<{ message: string; csrfToken?: string }>('campaign-guide-asset.php', {
    action: 'delete',
    assetId,
    csrfToken,
  });
}

export function sortMerchantPromoGuideImages(cpId: number, csrfToken: string, assetIds: number[]) {
  return merchantApiPost<{ message: string; guide: MerchantPromoGuideData | null; csrfToken?: string }>(
    'campaign-guide-asset.php',
    {
      action: 'sort',
      cpId,
      csrfToken,
      assetIds,
    },
  );
}

export function updateMerchantPromoGuideImageTitle(assetId: number, csrfToken: string, imageTitle: string) {
  return merchantApiPost<{ message: string; asset: MerchantPromoGuideImage; csrfToken?: string }>(
    'campaign-guide-asset.php',
    {
      action: 'update_title',
      assetId,
      csrfToken,
      imageTitle,
    },
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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
  }

  return (body as ApiSuccessBody<T>).data;
}

async function publicApiPost<T>(endpoint: string, payload?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${PUBLIC_API_BASE}/${endpoint}`, {
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
    const err = new PartnerApiError(errBody.error, errBody.code, response.status);
    if (errBody.data?.errors && typeof errBody.data.errors === 'object') {
      (err as PartnerApiError & { fieldErrors?: Record<string, string> }).fieldErrors = errBody.data.errors as Record<string, string>;
    }
    throw err;
  }

  return (body as ApiSuccessBody<T>).data;
}

export type PublicCampaign = PartnerCampaign;

export function fetchPublicCampaigns(filters?: { category?: string; q?: string; type?: string }) {
  return publicApiGet<{ items: PublicCampaign[]; categories: string[]; dbReady: boolean }>('campaigns.php', {
    category: filters?.category ?? '',
    q: filters?.q ?? '',
    type: filters?.type ?? '',
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

export type PartnerAnalyticsFilters = {
  period?: 7 | 30 | 90;
  dateFrom?: string;
  dateTo?: string;
  linkId?: number;
  channel?: string;
  linkName?: string;
  compareIds?: number[];
};

export type PartnerAnalyticsLinkRow = {
  id: number;
  code: string;
  campaign: string;
  channel: string;
  linkName: string;
  clicks: number;
  received: number;
  approved: number;
  canceled: number;
  convRate: number;
  appRate: number;
  epc: number;
  confRev: number;
};

export type PartnerAnalyticsResponse = {
  summary: {
    totalClicks: number;
    uniqueVisitors: number;
    totalDb: number;
    approvedDb: number;
    rejectedDb: number;
    confRevenue: number;
    avgConvRate: number;
    avgApprovalRate: number;
    epc: number;
  };
  range: {
    dateFrom: string;
    dateTo: string;
    period: number;
  };
  funnel: {
    clicks: number;
    received: number;
    approved: number;
    confirmed: number;
  };
  chart: Array<{ date: string; click: number; db: number; approval: number }>;
  chart7d: Array<{ date: string; click: number; db: number; approval: number }>;
  channels: Array<{ channel: string; clicks: number; dbs: number; approved: number; percentage: number }>;
  linkNames: Array<{ linkName: string; channel: string; clicks: number; dbs: number; approved: number }>;
  links: PartnerAnalyticsLinkRow[];
  compareLinks: PartnerAnalyticsLinkRow[];
  referrers: Array<{ domain: string; clicks: number; percentage: number }>;
  devices: Array<{ device: string; deviceCode: string; clicks: number; percentage: number }>;
  campaigns: Array<{ campaign: string; clicks: number; received: number; approved: number; appRate: string; confRev: number }>;
  filterOptions: {
    links: Array<{ id: number; code: string; campaign: string; channel: string; linkName: string }>;
    channels: string[];
    linkNames: string[];
  };
  dbReady: boolean;
};

export function fetchPartnerAnalytics(filters?: PartnerAnalyticsFilters) {
  const query: Record<string, string> = {};
  if (filters?.period) query.period = String(filters.period);
  if (filters?.dateFrom) query.dateFrom = filters.dateFrom;
  if (filters?.dateTo) query.dateTo = filters.dateTo;
  if (filters?.linkId) query.linkId = String(filters.linkId);
  if (filters?.channel) query.channel = filters.channel;
  if (filters?.linkName) query.linkName = filters.linkName;
  if (filters?.compareIds?.length) query.compareIds = filters.compareIds.join(',');
  return partnerApiGet<PartnerAnalyticsResponse>('analytics.php', query);
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

export type PublicEventPromoCpa = {
  event: string;
  title: string;
  category: string;
  approvalRate: string;
  oldPrice: number;
  price: number;
  bonus: string;
  highlight: boolean;
};

export type PublicRankingItem = {
  rank: number;
  partner: string;
  dbs: number;
  reward: string;
  earnings?: string;
  tone?: string;
};

export type PublicRankingSummary = {
  topDbs: number;
  myRank: number;
  remainingToTop10: number;
  myBonus: string;
  top10BonusHint: string;
};

export type PublicRankingMy = {
  rank: number;
  dbs: number;
  earnings: number;
  remainingToTop10: number;
  bonus: string;
};

export type PublicRankingTier = {
  label: string;
  reward: string;
  tone?: string;
};

export type PublicRanking = {
  summary: PublicRankingSummary;
  top: PublicRankingItem[];
  list: PublicRankingItem[];
  my: PublicRankingMy | null;
  tiers: PublicRankingTier[];
};

export type PublicEventsResponse = {
  summary: PublicEventSummaryItem[];
  items: PublicEventItem[];
  recommendations: Array<Record<string, unknown>>;
  promoCpa: PublicEventPromoCpa[];
  ranking: PublicRanking;
  rankingTop: PublicRankingItem[];
  rankingList: PublicRankingItem[];
  dbReady: boolean;
};

export type PublicEventProgress = {
  joined: boolean;
  current: number;
  target: number;
  pct: number;
  reward: string;
  alert: string;
};

export type PublicEventRule = { text: string; critical: boolean };
export type PublicEventPromoCopy = { title: string; text: string };
export type PublicEventPromoTab = { id: string; label: string; copies: PublicEventPromoCopy[] };

export type PublicEventDetail = PublicEventItem & {
  type: string;
  status: string;
  statusCode: string;
  condition: string;
  campaigns: string;
  products: string[];
  rules: PublicEventRule[];
  promoTabs: PublicEventPromoTab[];
  progress: PublicEventProgress;
  dbReady: boolean;
};

export function fetchPublicEvents(q?: string) {
  return publicApiGet<PublicEventsResponse>('events.php', { q: q ?? '' });
}

export function fetchPublicEventDetail(code: string) {
  return publicApiGet<PublicEventDetail>('events.php', { code });
}

export function joinPartnerEvent(payload: { evCode?: string; evId?: number }) {
  return partnerApiPost<{ message: string; joined: boolean }>('events.php', { action: 'join', ...payload });
}

export type AdminEventReward = {
  id: number;
  evId: number;
  eventCode: string;
  eventTitle: string;
  ptId: number;
  partner: string;
  name: string;
  amount: number;
  status: string;
  condition: string;
  memo: string;
  createdAt: string;
  paidAt: string;
};

export type AdminEventParticipant = {
  id: number;
  evId: number;
  ptId: number;
  partner: string;
  name: string;
  status: string;
  approved: number;
  joinedAt: string;
};

export function fetchAdminEventRewards(filters?: { status?: string; evId?: number }) {
  return adminApiGet<{ items: AdminEventReward[]; dbReady: boolean }>('events.php', {
    view: 'rewards',
    status: filters?.status ?? '',
    evId: String(filters?.evId ?? ''),
  });
}

export function fetchAdminEventParticipants(evId: number) {
  return adminApiGet<{ items: AdminEventParticipant[]; dbReady: boolean }>('events.php', {
    view: 'participants',
    evId: String(evId),
  });
}

export function createAdminEventReward(payload: { evId?: number; ptId: number; amount: number; condition?: string }) {
  return adminApiPost<{ message: string; id: number }>('events.php', { action: 'create_reward', ...payload });
}

export function updateAdminEventReward(payload: { action: 'pay_reward' | 'reject_reward'; erId: number; memo?: string }) {
  return adminApiPost<{ message: string }>('events.php', payload);
}

export function autoAdminEventRankingRewards(period?: string) {
  return adminApiPost<{ message: string; created: number }>('events.php', { action: 'auto_ranking_rewards', period: period ?? '' });
}

export type LcNotificationCenter = 'admin' | 'partner' | 'merchant';

export type LcNotification = {
  id: number;
  center: string;
  userId: number;
  type: string;
  title: string;
  body: string;
  link: string;
  refType: string;
  refId: number;
  read: boolean;
  readAt: string;
  createdAt: string;
};

export function fetchPartnerNotifications() {
  return partnerApiGet<{ items: LcNotification[]; unread: number; total: number }>('notifications.php');
}

export function markPartnerNotificationsRead(id?: number) {
  return partnerApiPost<{ message: string }>('notifications.php', { action: 'read', id: id ?? 0 });
}

export function fetchMerchantNotifications() {
  return merchantApiGet<{ items: LcNotification[]; unread: number; total: number }>('notifications.php');
}

export function markMerchantNotificationsRead(id?: number) {
  return merchantApiPost<{ message: string }>('notifications.php', { action: 'read', id: id ?? 0 });
}

export function fetchAdminNotifications() {
  return adminApiGet<{ items: LcNotification[]; unread: number; total: number }>('notifications.php');
}

export function markAdminNotificationsRead(id?: number) {
  return adminApiPost<{ message: string }>('notifications.php', { action: 'read', id: id ?? 0 });
}

export type AdminLogItem = {
  id: number;
  memberId: string;
  action: string;
  targetType: string;
  targetId: number;
  summary: string;
  payload: Record<string, unknown>;
  ip: string;
  createdAt: string;
};

export function fetchAdminLogs(filters?: { q?: string; action?: string; limit?: number }) {
  return adminApiGet<{ items: AdminLogItem[]; total: number; dbReady: boolean }>('logs.php', {
    q: filters?.q ?? '',
    action: filters?.action ?? '',
    limit: String(filters?.limit ?? 50),
  });
}

export type AdminEventSummary = {
  total: number;
  active: number;
  closing: number;
  scheduled: number;
  ended: number;
};

export type AdminEvent = {
  id: number;
  code: string;
  title: string;
  type: string;
  desc: string;
  period: string;
  product: string;
  benefit: string;
  badges: string[];
  ribbon: string;
  status: string;
  statusCode: string;
  target: string;
  campaigns: string;
  campaignIds: string;
  partners: number;
  received: number;
  approved: number;
  rewardPending: string;
  featured: boolean;
  sort: number;
};

export function fetchAdminEvents(filters?: { q?: string; status?: string }) {
  return adminApiGet<{ items: AdminEvent[]; summary: AdminEventSummary; dbReady: boolean }>('events.php', {
    q: filters?.q ?? '',
    status: filters?.status ?? '',
  });
}

export function saveAdminEvent(payload: Record<string, unknown>) {
  return adminApiPost<{ message: string; event: AdminEvent; summary: AdminEventSummary }>('events.php', payload);
}

export function updateAdminEventStatus(payload: { action: string; evId: number }) {
  return adminApiPost<{ message: string; event: AdminEvent; summary: AdminEventSummary }>('events.php', payload);
}

export type NoticePermissions = {
  canWrite: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type NoticeListItem = {
  id: number;
  subject: string;
  author: string;
  memberId: string;
  date: string;
  datetime: string;
  hit: number;
  isNotice: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type NoticeDetail = NoticeListItem & {
  contentHtml: string;
  contentPlain: string;
  isHtml: boolean;
  prevId: number;
  nextId: number;
};

export type NoticeListResponse = {
  items: NoticeListItem[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
  boardReady: boolean;
  permissions: NoticePermissions;
  boardTitle: string;
};

export function fetchNoticeList(filters?: { page?: number; q?: string; perPage?: number }) {
  return publicApiGet<NoticeListResponse>('notice.php', {
    page: String(filters?.page ?? 1),
    q: filters?.q ?? '',
    perPage: String(filters?.perPage ?? 15),
  });
}

export function fetchNoticeDetail(id: number) {
  return publicApiGet<{ item: NoticeDetail; permissions: NoticePermissions; boardReady: boolean }>('notice.php', {
    id: String(id),
  });
}

export function saveNotice(payload: { subject: string; content: string; isNotice?: boolean; id?: number; action?: string }) {
  return publicApiPost<{ message: string; item: NoticeDetail }>('notice.php', payload);
}

export function deleteNotice(id: number) {
  return publicApiPost<{ message: string }>('notice.php', { action: 'delete', id });
}

export type AiStatus = {
  available: boolean;
  model: string;
  limits: { chat: number; promo: number; summary: number };
  message: string;
};

export type AiPromoCopy = { id: string; label: string; text: string };

export function fetchAiStatus() {
  return publicApiGet<AiStatus>('ai.php');
}

export function sendAiChat(payload: { message: string; history?: Array<{ role: string; text: string }>; context?: Record<string, string> }) {
  return publicApiPost<{ reply: string; fallback: boolean }>('ai.php', { action: 'chat', ...payload });
}

export function generatePartnerPromo(payload: {
  campaignId?: number;
  title?: string;
  category?: string;
  price?: string;
  approvalRate?: string;
  allowedChannels?: string;
  forbiddenChannels?: string;
  channel?: string;
  eventTitle?: string;
}) {
  return partnerApiPost<{ copies: AiPromoCopy[]; fallback: boolean; message?: string }>('ai.php', { action: 'promo', ...payload });
}

export function fetchAdminAiSummary() {
  return adminApiPost<{ summary: string; fallback: boolean }>('ai.php', { action: 'summary' });
}

export function fetchMerchantAiSummary() {
  return merchantApiPost<{ summary: string; fallback: boolean }>('ai.php', { action: 'summary' });
}

/* ─────────────────────────── 콜디비 (Call DB) ─────────────────────────── */

export type CallNumber = {
  cnId: number;
  number: string;
  provider: string;
  status: string;
  memo: string;
  createdAt: string;
};

export type CallRequest = {
  carId: number;
  ptId: number;
  partner: string;
  cpId: number;
  campaign: string;
  status: string;
  virtualNumber: string;
  requestMemo: string;
  adminMemo: string;
  createdAt: string;
  processedAt: string;
};

export type CallLog = {
  clogId: number;
  virtualNumber: string;
  caller: string;
  campaign: string;
  partner: string;
  startedAt: string;
  duration: number;
  result: string;
  cvId: number;
  hasRecording: boolean;
  recordingUrl?: string;
};

export type CallSettings = {
  cpId: number;
  enabled: boolean;
  alias: string;
  forward1: string;
  forward2: string;
  adminEnabled: boolean;
  recordingMode: string;
};

// 관리자
export function fetchAdminCallNumbers(filters?: { status?: string; q?: string }) {
  return adminApiGet<{ items: CallNumber[]; dbReady: boolean }>('call.php', {
    view: 'numbers',
    status: filters?.status ?? '',
    q: filters?.q ?? '',
  });
}

export function fetchAdminCallRequests(status?: string) {
  return adminApiGet<{ items: CallRequest[]; dbReady: boolean }>('call.php', { view: 'requests', status: status ?? '' });
}

export function fetchAdminCallLogs(filters?: { result?: string; unmatched?: boolean }) {
  return adminApiGet<{ items: CallLog[]; dbReady: boolean }>('call.php', {
    view: 'logs',
    result: filters?.result ?? '',
    unmatched: filters?.unmatched ? '1' : '',
  });
}

export function createAdminCallNumber(payload: { number: string; provider?: string; providerNumberId?: string; memo?: string }) {
  return adminApiPost<{ message: string; cnId?: number }>('call.php', { action: 'create_number', ...payload });
}

export function provisionAdminCallNumber(payload?: { areaCode?: string; memo?: string }) {
  return adminApiPost<{ message: string; cnId?: number }>('call.php', { action: 'provision_number', ...(payload ?? {}) });
}

export function updateAdminCallNumber(payload: { cnId: number; status?: string; memo?: string }) {
  return adminApiPost<{ message: string }>('call.php', { action: 'update_number', ...payload });
}

export function assignAdminCallRequest(payload: { carId: number; cnId: number; adminMemo?: string }) {
  return adminApiPost<{ message: string; number?: string }>('call.php', { action: 'assign_request', ...payload });
}

export function rejectAdminCallRequest(payload: { carId: number; adminMemo?: string }) {
  return adminApiPost<{ message: string }>('call.php', { action: 'reject_request', ...payload });
}

export function revokeAdminCallRequest(payload: { carId: number; adminMemo?: string }) {
  return adminApiPost<{ message: string }>('call.php', { action: 'revoke_request', ...payload });
}

export function assignAdminCallDirect(payload: { ptId: number; cpId: number; cnId: number; adminMemo?: string }) {
  return adminApiPost<{ message: string; number?: string }>('call.php', { action: 'assign_direct', ...payload });
}

export type CallLogImportResult = {
  message: string;
  total: number;
  imported: number;
  duplicate: number;
  failed: number;
  unmatched: number;
  items?: Array<{ row: number; virtualNumber: string; ok: boolean; message: string; clogId: number; duplicate?: boolean }>;
  dryRun?: boolean;
  preview?: Array<Record<string, unknown>>;
};

export function importAdminCallLogs(payload: { file: File; dryRun?: boolean; skipConversion?: boolean }) {
  const formData = new FormData();
  formData.append('action', 'import_logs');
  formData.append('file', payload.file);
  if (payload.dryRun) formData.append('dryRun', '1');
  if (payload.skipConversion) formData.append('skipConversion', '1');
  return adminApiPostFormData<CallLogImportResult>('call.php', formData);
}

export function fetchAdminCallSettings(cpId: number) {
  return adminApiGet<{ settings: Record<string, unknown> }>('call.php', { view: 'settings', cpId: String(cpId) });
}

export function saveAdminCallSettings(payload: Record<string, unknown> & { cpId: number }) {
  return adminApiPost<{ message: string }>('call.php', { action: 'save_settings', ...payload });
}

export function fetchAdminCallRecording(clogId: number) {
  return adminApiGet<{ url: string }>('call.php', { view: 'recording', clogId: String(clogId) });
}

export function finalizeAdminConversion(payload: { cvId: number; finalAction: 'approve' | 'reject' | 'lock' | 'unlock'; memo?: string }) {
  return adminApiPost<{ message: string }>('call.php', { action: 'final_status', ...payload });
}

/* ── 링크프라이스 CPS ── */

export type LpMerchant = {
  lpmId: number;
  networkId: number;
  merchantCode: string;
  merchantName: string;
  merchantLogo: string;
  merchantUrl: string;
  categoryId: string;
  categoryName: string;
  commissionPc: string;
  commissionMobile: string;
  clickUrl: string;
  deeplinkYn: string;
  mobileYn: string;
  returnDay: number;
  rewardYn: string;
  subscript: string;
  denyAd: string;
  denyProduct: string;
  notice: string;
  whenTrans: string;
  transReposition: string;
  commissionPaymentStandard: string;
  visible: boolean;
  syncActive: boolean;
  partnerRate: number;
  campaignAlias: string;
  partnerNotice: string;
  isRecommended: boolean;
  adminMemo: string;
  syncedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  partnerVisible: boolean;
  clicks?: number;
  expectedOrders?: number;
  confirmedOrders?: number;
  canceledOrders?: number;
  partnerDisplayCommission?: string;
  raw?: unknown;
};

export type LpNetworkConfig = {
  networkId: number;
  networkCode: string;
  networkName: string;
  affiliateCode: string;
  apiAuthKeyMasked: string;
  apiAuthKeySet: boolean;
  postbackSecretMasked: string;
  postbackSecretSet: boolean;
  apiEnabled: boolean;
  defaultPartnerRate: number;
  lastMerchantSyncAt: string | null;
  lastOrderSyncAt: string | null;
  ready: boolean;
  security?: {
    testMode: boolean;
    postbackIpEnabled: boolean;
    postbackIpAllowlist: string;
    cronTokenSet: boolean;
  };
};

export type LpSyncLog = {
  lpsId: number;
  syncType: string;
  requestUrl: string;
  responseCode: number;
  success: boolean;
  processedCount: number;
  errorMessage: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type LpSetupStep = {
  id: string;
  title: string;
  status: 'done' | 'pending';
  description: string;
  action: string;
};

export type LpSetupSnapshot = {
  ok: boolean;
  dbReady: boolean;
  ready: boolean;
  config: LpNetworkConfig;
  urls: {
    postbackPrimary: string;
    postbackAlt: string;
    postbackWithSecret: string;
    health: string;
    merchantCron: string;
    orderCron: string;
    publicCps: string;
    partnerCps: string;
  };
  cron: { merchant: string; order: string };
  merchants: {
    total: number;
    apr: number;
    visible: number;
    partnerVisible: number;
    hiddenApr: number;
    syncActive: number;
  };
  postbacks: {
    total: number;
    last24h: number;
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
  };
  steps: { items: LpSetupStep[]; done: number; total: number; percent: number };
};

export type LpSyncResult = {
  ok: boolean;
  message: string;
  scope: string;
  fetched: number;
  inserted: number;
  updated: number;
  failed: number;
  deactivated: number;
  errors: string[];
  sample_fields: string[];
  cpa_excluded: boolean;
  api_url: string;
  log_id: number;
  synced_at: string | null;
};

export function fetchAdminLpMerchants(filters?: {
  q?: string;
  code?: string;
  approved?: boolean;
  syncActive?: boolean;
  visible?: boolean;
  deeplink?: boolean;
  limit?: number;
  offset?: number;
}) {
  return adminApiGet<{
    items: LpMerchant[];
    total: number;
    config: LpNetworkConfig;
    syncLogs: LpSyncLog[];
    dbReady: boolean;
  }>('linkprice.php', {
    view: 'merchants',
    q: filters?.q ?? '',
    code: filters?.code ?? '',
    approved: filters?.approved ? '1' : '',
    syncActive: filters?.syncActive === undefined ? '' : filters.syncActive ? '1' : '0',
    visible: filters?.visible === undefined ? '' : filters.visible ? '1' : '0',
    deeplink: filters?.deeplink ? '1' : '',
    limit: String(filters?.limit ?? 200),
    offset: String(filters?.offset ?? 0),
  });
}

export function fetchAdminLpMerchant(lpmId: number) {
  return adminApiGet<{ item: LpMerchant }>('linkprice.php', { view: 'merchant', lpmId: String(lpmId) });
}

export function syncAdminLpMerchants(payload?: { scope?: 'apr' | 'all'; detail?: boolean; testMode?: boolean }) {
  return adminApiPost<{
    message: string;
    sync: LpSyncResult;
    config: LpNetworkConfig;
    syncLogs: LpSyncLog[];
  }>('linkprice.php', { action: 'sync_merchants', ...(payload ?? {}) });
}

export function updateAdminLpMerchant(payload: {
  lpmId: number;
  visible?: boolean;
  partnerRate?: number;
  campaignAlias?: string;
  partnerNotice?: string;
  isRecommended?: boolean;
  adminMemo?: string;
}) {
  return adminApiPost<{ message: string; item: LpMerchant }>('linkprice.php', {
    action: 'update_merchant',
    ...payload,
  });
}

export function saveAdminLpConfig(payload: Record<string, unknown>) {
  return adminApiPost<{ message: string; config: LpNetworkConfig }>('linkprice.php', {
    action: 'save_config',
    ...payload,
  });
}

export type LpPostback = {
  lppId: number;
  trlogId: string;
  uniqId: string;
  merchantCode: string;
  orderCode: string;
  uId: string;
  requestIp: string;
  isDuplicate: boolean;
  processStatus: string;
  errorMessage: string;
  matchNote: string;
  lpoId: number;
  receivedAt: string | null;
  processedAt: string | null;
  raw?: unknown;
  headers?: unknown;
};

export function fetchAdminLpPostbacks(filters?: {
  status?: string;
  q?: string;
  merchant?: string;
  order?: string;
  limit?: number;
  offset?: number;
}) {
  return adminApiGet<{ items: LpPostback[]; total: number; dbReady: boolean }>('linkprice.php', {
    view: 'postbacks',
    status: filters?.status ?? '',
    q: filters?.q ?? '',
    merchant: filters?.merchant ?? '',
    order: filters?.order ?? '',
    limit: String(filters?.limit ?? 50),
    offset: String(filters?.offset ?? 0),
  });
}

export function fetchAdminLpPostback(lppId: number) {
  return adminApiGet<{
    item: LpPostback;
    order: {
      lpoId: number;
      ptId: number;
      lpmId: number;
      lcStatus: string;
      lpCommission: number;
      partnerRate: number;
      partnerExpected: number;
      partnerConfirmed: number;
      platformMargin: number;
      merchantCode: string;
      orderCode: string;
    } | null;
  }>('linkprice.php', { view: 'postback', lppId: String(lppId) });
}

export function reprocessAdminLpPostback(lppId: number) {
  return adminApiPost<{ message: string; item: LpPostback | null }>('linkprice.php', {
    action: 'reprocess_postback',
    lppId,
  });
}

export type LpOrderSyncResult = {
  ok: boolean;
  message: string;
  dates: string[];
  fetched: number;
  inserted: number;
  updated: number;
  unchanged: number;
  failed: number;
  pages: number;
  errors: string[];
  alerts: string[];
};

export function syncAdminLpOrders(payload?: {
  mode?: string;
  date?: string;
  from?: string;
  to?: string;
  merchantId?: string;
  orderCode?: string;
  testMode?: boolean;
  cancelFlag?: string;
}) {
  return adminApiPost<{
    message: string;
    sync: LpOrderSyncResult;
    config: LpNetworkConfig;
    syncLogs: LpSyncLog[];
  }>('linkprice.php', { action: 'sync_orders', ...(payload ?? {}) });
}

export function syncAdminLpOrderOne(lpoId: number) {
  return adminApiPost<{ message: string }>('linkprice.php', { action: 'sync_order_one', lpoId });
}

export type LpOrder = {
  lpoId: number;
  trlogId: string;
  uniqId: string;
  ptId: number;
  partnerName: string;
  partnerCode: string;
  lpmId: number;
  lpcId: number;
  uId: string;
  merchantCode: string;
  merchantName: string;
  orderCode: string;
  productCode: string;
  productName: string;
  itemCount: number;
  salesAmount: number;
  lpCommission: number;
  partnerRate: number;
  partnerExpected: number;
  partnerConfirmed: number;
  platformMargin: number | null;
  rawStatus: string;
  lcStatus: string;
  occurredAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  lastSyncedAt: string | null;
  unmatched: boolean;
  settleHint: string;
  rawJson?: unknown;
};

export type LpClick = {
  lpcId: number;
  ptId: number;
  partnerName: string;
  partnerCode: string;
  lpmId: number;
  merchantCode: string;
  merchantName: string;
  uId: string;
  device: string;
  ip: string;
  clickedAt: string | null;
};

export type LpLedger = {
  lplId: number;
  ptId: number;
  partnerName: string;
  partnerCode: string;
  lpoId: number;
  entryType: string;
  amount: number;
  balanceAfter: number;
  memo: string;
  createdAt: string | null;
};

export type PartnerLpStats = {
  clicksToday: number;
  clicksMonth: number;
  expectedOrders: number;
  confirmedOrders: number;
  canceledOrders: number;
  expectedEarnings: number;
  confirmedEarnings: number;
  withdrawable: number;
};

export function fetchAdminLpOrders(filters?: Record<string, string | number | boolean | undefined>) {
  const q: Record<string, string> = { view: 'orders' };
  Object.entries(filters ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== false) q[k] = String(v === true ? '1' : v);
  });
  return adminApiGet<{ items: LpOrder[]; total: number; dbReady: boolean }>('linkprice.php', q);
}

export function fetchAdminLpOrder(lpoId: number) {
  return adminApiGet<{
    item: LpOrder;
    logs: Array<{
      lpslId: number;
      fromStatus: string;
      toStatus: string;
      fromCommission: number;
      toCommission: number;
      reason: string;
      changedAt: string | null;
    }>;
    click: { lpcId: number; uId: string; device: string; ip: string; clickedAt: string | null } | null;
  }>('linkprice.php', { view: 'order', lpoId: String(lpoId) });
}

export function fetchAdminLpClicks(filters?: Record<string, string | number | undefined>) {
  const q: Record<string, string> = { view: 'clicks' };
  Object.entries(filters ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q[k] = String(v);
  });
  return adminApiGet<{
    items: LpClick[];
    total: number;
    summary: { today: number; month: number; total: number };
    dbReady: boolean;
  }>('linkprice.php', q);
}

export function fetchAdminLpLedger(filters?: Record<string, string | number | undefined>) {
  const q: Record<string, string> = { view: 'ledger' };
  Object.entries(filters ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q[k] = String(v);
  });
  return adminApiGet<{ items: LpLedger[]; total: number; dbReady: boolean }>('linkprice.php', q);
}

export function fetchAdminLpSyncLogs(limit = 30, type = '') {
  return adminApiGet<{ items: LpSyncLog[]; dbReady: boolean }>('linkprice.php', {
    view: 'sync_logs',
    limit: String(limit),
    type,
  });
}

export function fetchAdminLpConfig() {
  return adminApiGet<{ config: LpNetworkConfig; dbReady: boolean }>('linkprice.php', { view: 'config' });
}

export function fetchAdminLpSetup() {
  return adminApiGet<LpSetupSnapshot>('linkprice.php', { view: 'setup' });
}

export function runAdminLpSetupCheck(testMode?: boolean) {
  return adminApiPost<{
    message: string;
    connection: { ok: boolean; message: string; resultCode?: string };
    setup: LpSetupSnapshot;
  }>('linkprice.php', { action: 'run_setup_check', testMode: !!testMode });
}

export function bulkUpdateAdminLpMerchants(payload: {
  lpmIds?: number[];
  scope?: 'apr_hidden' | 'apr_all' | 'partner_visible';
  visible?: boolean;
  isRecommended?: boolean;
}) {
  return adminApiPost<{
    message: string;
    updated: number;
    merchants: LpSetupSnapshot['merchants'];
  }>('linkprice.php', { action: 'bulk_update_merchants', ...payload });
}

export type LpE2eCheck = { id: string; label: string; ok: boolean };

export type LpE2eSnapshot = {
  dbReady: boolean;
  setup: LpSetupSnapshot;
  partnerId: number;
  merchant: { lpmId: number; merchantCode: string; merchantName: string } | null;
  promoUrl: string;
  recentClick: { lpcId: number; ptId: number; lpmId: number; uId: string; clickedAt: string | null } | null;
  checks: LpE2eCheck[];
  checksDone: number;
  checksTotal: number;
};

export function fetchAdminLpE2e() {
  return adminApiGet<LpE2eSnapshot>('linkprice.php', { view: 'e2e' });
}

export function createAdminLpTestClick(payload?: { ptId?: number; lpmId?: number; merchantCode?: string }) {
  return adminApiPost<{
    message: string;
    promoUrl: string;
    e2e: LpE2eSnapshot;
    click: Record<string, unknown> | null;
  }>('linkprice.php', { action: 'create_test_click', ...payload });
}

export function simulateAdminLpPostback(payload?: {
  ptId?: number;
  lpmId?: number;
  merchantCode?: string;
  price?: number;
  commission?: number;
  force?: boolean;
}) {
  return adminApiPost<{
    message: string;
    lppId: number;
    promoUrl: string;
    e2e: LpE2eSnapshot;
    result: Record<string, unknown> | null;
  }>('linkprice.php', { action: 'simulate_postback', ...payload });
}

export function testAdminLpConnection(testMode?: boolean) {
  return adminApiPost<{ message: string; resultCode: string }>('linkprice.php', {
    action: 'test_connection',
    testMode: !!testMode,
  });
}

export function linkAdminLpOrderPartner(lpoId: number, ptId: number) {
  return adminApiPost<{ message: string }>('linkprice.php', { action: 'link_partner', lpoId, ptId });
}

export function saveAdminLpPostbackSecurity(payload: {
  postbackIpEnabled?: boolean;
  postbackIpAllowlist?: string;
  postbackSecret?: string;
  clearPostbackSecret?: boolean;
  testMode?: boolean;
}) {
  return adminApiPost<{ message: string; config: LpNetworkConfig }>('linkprice.php', {
    action: 'save_postback_security',
    ...payload,
  });
}

export function adminLpOrdersCsvUrl(filters?: Record<string, string>) {
  const params = new URLSearchParams({ view: 'orders', format: 'csv', ...(filters ?? {}) });
  return `/plugin/linkconnect/admin/api/linkprice.php?${params.toString()}`;
}

export function fetchPartnerLpStats() {
  return partnerApiGet<{ stats: PartnerLpStats; dbReady: boolean }>('linkprice.php', { view: 'dashboard' });
}

export function fetchPartnerLpClicks(filters?: Record<string, string | number | undefined>) {
  const q: Record<string, string> = { view: 'clicks' };
  Object.entries(filters ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q[k] = String(v);
  });
  return partnerApiGet<{
    items: LpClick[];
    total: number;
    summary: { today: number; month: number; total: number };
    stats: PartnerLpStats;
  }>('linkprice.php', q);
}

export function fetchPartnerLpOrders(filters?: Record<string, string | number | undefined>) {
  const q: Record<string, string> = { view: 'orders' };
  Object.entries(filters ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q[k] = String(v);
  });
  return partnerApiGet<{ items: LpOrder[]; total: number; stats: PartnerLpStats }>('linkprice.php', q);
}

export function fetchPartnerLpEarnings(filters?: Record<string, string | number | undefined>) {
  const q: Record<string, string> = { view: 'earnings' };
  Object.entries(filters ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q[k] = String(v);
  });
  return partnerApiGet<{ items: LpLedger[]; total: number; stats: PartnerLpStats }>('linkprice.php', q);
}

// 광고주
export type MerchantCallCampaign = {
  cpId: number;
  campaign: string;
  code: string;
  enabled: boolean;
  adminEnabled: boolean;
  alias: string;
  forward1: string;
  forward2: string;
  recordingMode: string;
};

export function fetchMerchantCallCampaigns() {
  return merchantApiGet<{ items: MerchantCallCampaign[]; dbReady: boolean }>('call.php', { view: 'campaigns' });
}

export function saveMerchantCallSettings(payload: { cpId: number; enabled: boolean; alias?: string; forward1?: string; forward2?: string }) {
  return merchantApiPost<{ message: string }>('call.php', { action: 'save_settings', ...payload });
}

export function fetchMerchantCallLogs(cpId?: number) {
  return merchantApiGet<{ items: CallLog[]; dbReady: boolean }>('call.php', {
    view: 'logs',
    cpId: cpId != null ? String(cpId) : '',
  });
}

export function toggleMerchantCall(payload: { cpId: number; enabled: boolean }) {
  return merchantApiPost<{ message: string }>('call.php', { action: 'toggle', ...payload });
}

// 파트너
export function fetchPartnerCallRequests() {
  return partnerApiGet<{ items: CallRequest[]; dbReady: boolean }>('call.php', { view: 'requests' });
}

export function fetchPartnerCallLogs() {
  return partnerApiGet<{ items: CallLog[]; dbReady: boolean }>('call.php', { view: 'logs' });
}

export function requestPartnerCallNumber(payload: { cpId: number; memo?: string }) {
  return partnerApiPost<{ message: string; carId?: number }>('call.php', { action: 'request', ...payload });
}

export type MerchantContractParty = {
  companyName: string;
  representativeName: string;
  businessNumber: string;
  companyAddress: string;
  companyPhone: string;
};

export type MerchantContractForm = {
  companyName: string;
  representativeName: string;
  businessNumber: string;
  companyAddress: string;
  companyPhone: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  signerName: string;
  signerPosition: string;
  signerPhone: string;
  signerEmail: string;
  step: number;
  agreements: {
    readAll: boolean;
    hasAuthority: boolean;
    electronic: boolean;
    noModify: boolean;
  };
  agreementCheckedAt?: string;
};

export type MerchantContractSummary = {
  id: number;
  advertiserId: number;
  contractCode: string;
  contractVersion: string;
  status: string;
  statusLabel: string;
  companyName: string;
  signerName: string;
  signedAt: string;
  createdAt: string;
  updatedAt: string;
  pdfDownloadUrl: string;
};

export type MerchantContractState = {
  contractVersion: string;
  status: string;
  statusLabel: string;
  isSigned: boolean;
  canWrite: boolean;
  requiresContract: boolean;
  partyB: MerchantContractParty;
  form: MerchantContractForm;
  contractHtml: string;
  contract: MerchantContractSummary | null;
  documentPreviewUrl: string;
  documentPdfUrl: string;
  signedPdfDownloadUrl: string;
  csrfToken: string;
  hasSignature: boolean;
};

export function fetchMerchantContract() {
  return merchantApiGet<MerchantContractState>('contract.php');
}

export function saveMerchantContractDraft(payload: Record<string, unknown>) {
  return merchantApiPost<{ message: string; contract: MerchantContractSummary | null; state: MerchantContractState }>(
    'contract.php',
    { action: 'draft', ...payload },
  );
}

export function uploadMerchantContractSignature(payload: { csrfToken: string; signatureDataUrl: string }) {
  return merchantApiPost<{ message: string; hasSignature: boolean; state: MerchantContractState }>('contract.php', {
    action: 'signature',
    ...payload,
  });
}

export function validateMerchantContract(payload: Record<string, unknown>) {
  return merchantApiPost<{ message: string; validated: boolean; state: MerchantContractState }>('contract.php', payload);
}

export function signMerchantContract(payload: Record<string, unknown>) {
  return merchantApiPost<{
    message: string;
    alreadySigned: boolean;
    contract: MerchantContractSummary | null;
    state: MerchantContractState;
  }>('contract.php', payload);
}

export type MerchantContractRead = {
  id: number;
  advertiserId: number;
  contractVersion: string;
  status: string;
  statusLabel: string;
  contractCode: string;
  companyName: string;
  representativeName: string;
  businessNumber: string;
  companyAddress: string;
  companyPhone: string;
  signerName: string;
  signerPosition: string;
  signerPhone: string;
  signerEmail: string;
  signedAt: string;
  signedIp: string;
  userAgent: string;
  createdAt: string;
  pdfHash: string;
  pdfHashMasked: string;
  agreements: Record<string, boolean>;
  agreementCheckedAt: string;
  partyB: MerchantContractParty;
  contractHtml: string;
  signatureUrl: string;
  documentPreviewUrl: string;
  documentPdfUrl: string;
  isReadOnly: boolean;
  isFullySigned: boolean;
};

export type MerchantContractHistoryItem = {
  id: number;
  contractVersion: string;
  contractCode: string;
  status: string;
  statusLabel: string;
  signedAt: string;
  createdAt: string;
  isFullySigned: boolean;
  isCurrentVersion: boolean;
};

export type MerchantContractReadResponse = {
  contract: MerchantContractRead;
  history: MerchantContractHistoryItem[];
};

export function fetchMerchantContractRead(version?: string) {
  const query: Record<string, string> = { mode: 'read' };
  if (version) {
    query.version = version;
  }
  return merchantApiGet<MerchantContractReadResponse>('contract.php', query);
}

export type AdminContractListItem = {
  id: number;
  advertiserId: number;
  companyName: string;
  representativeName: string;
  businessNumber: string;
  signerName: string;
  contractVersion: string;
  status: string;
  statusLabel: string;
  contractCode: string;
  signedAt: string;
  createdAt: string;
  isFullySigned: boolean;
};

export type AdminContractSummary = {
  total: number;
  signed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  expired: number;
  renewal: number;
};

export type AdminContractDetail = {
  contract: MerchantContractRead;
  listItem: AdminContractListItem;
  merchant: { id: number; code: string; company: string; status: string } | null;
  companyCompare: Record<string, { contract: string; current: string; changed: boolean }>;
  companySnapshot: Record<string, unknown> | null;
  history: MerchantContractHistoryItem[];
  statusLogs: Array<{
    id: number;
    adminId: string;
    oldStatus: string;
    newStatus: string;
    oldLabel: string;
    newLabel: string;
    reason: string;
    ip: string;
    userAgent: string;
    createdAt: string;
  }>;
  signLogs: Array<{
    id: number;
    result: string;
    message: string;
    signedAt: string;
    ip: string;
    userAgent: string;
    pdfHash: string;
    createdAt: string;
  }>;
  documentPreviewUrl: string;
  documentPdfUrl: string;
  signatureUrl: string;
};

export function fetchAdminContracts(filters?: {
  q?: string;
  status?: string;
  version?: string;
  mtId?: number;
  signedFrom?: string;
  signedTo?: string;
  page?: number;
  limit?: number;
}) {
  return adminApiGet<{
    items: AdminContractListItem[];
    total: number;
    page: number;
    limit: number;
    summary: AdminContractSummary;
    dbReady: boolean;
    currentVersion: string;
  }>('contracts.php', {
    q: filters?.q ?? '',
    status: filters?.status ?? '',
    version: filters?.version ?? '',
    mtId: filters?.mtId ? String(filters.mtId) : '',
    signedFrom: filters?.signedFrom ?? '',
    signedTo: filters?.signedTo ?? '',
    page: filters?.page ? String(filters.page) : '1',
    limit: filters?.limit ? String(filters.limit) : '30',
  });
}

export function fetchAdminContractDetail(mcId: number) {
  return adminApiGet<AdminContractDetail>('contracts.php', { mcId: String(mcId) });
}

export function updateAdminContractStatus(payload: {
  mcId: number;
  action: 'cancel' | 'expire' | 'requireRenewal';
  reason: string;
}) {
  return adminApiPost<{ message: string; detail: AdminContractDetail }>('contracts.php', payload);
}
