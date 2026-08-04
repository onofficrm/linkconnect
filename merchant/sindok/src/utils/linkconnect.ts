/** @deprecated Use ../lib/linkconnect — re-export for studio stubs */
export {
  resolveCampaignId,
  resolveLkCode,
  submitConsultation,
  buildInquiryText,
  receiveApiUrl,
} from '../lib/linkconnect';

export const LINKCONNECT_CONFIG = {
  API_ENDPOINT: '/plugin/linkconnect/api/receive.php',
  CAMPAIGN_ID: 'CPA-00014',
  PRODUCT_ID: 'CPA-00014',
};
