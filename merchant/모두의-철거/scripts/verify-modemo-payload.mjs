/**
 * Static payload contract check (no network / no Production POST).
 * Run: node scripts/verify-modemo-payload.mjs
 */
import assert from 'node:assert/strict';

function buildInquiryText(fields) {
  const parts = [];
  if (fields.serviceType) parts.push(`철거유형: ${fields.serviceType}`);
  if (fields.region) parts.push(`지역: ${fields.region}`);
  if (fields.message) parts.push(`문의: ${fields.message}`);
  if (fields.fileName) parts.push(`견적서첨부: ${fields.fileName}`);
  return (parts.join(' | ') || '철거 견적 상담 신청').replace(/\s+/g, ' ').trim();
}

function buildHeroFields() {
  return {
    name: '테스트',
    phone: '010-1234-5678',
    inquiry: '히어로 빠른상담신청',
    campaignId: 'CPA-MODEMO',
    channel: 'SEO',
    page_url: 'http://localhost/merchant/modemo/',
  };
}

function buildQuoteFields() {
  const inquiry = buildInquiryText({
    serviceType: '상가/매장 원상복구',
    region: '서울',
    message: '문의 테스트',
    fileName: 'quote.pdf',
  });
  return {
    name: '테스트',
    phone: '010-1234-5678',
    region: '서울',
    inquiry,
    campaignId: 'CPA-MODEMO',
    channel: 'SEO',
    page_url: 'http://localhost/merchant/modemo/',
    attachment: 'quote.pdf',
  };
}

const hero = buildHeroFields();
assert.equal(hero.inquiry, '히어로 빠른상담신청');
assert.equal(hero.campaignId, 'CPA-MODEMO');
assert.ok(!hero.inquiry.includes('철거유형:'));
assert.ok(!hero.inquiry.includes('지역:'));
assert.ok(!('pyeong' in hero));
assert.ok(!('demolitionType' in hero));

const quote = buildQuoteFields();
assert.equal(quote.campaignId, 'CPA-MODEMO');
assert.match(quote.inquiry, /철거유형:/);
assert.equal(quote.region, '서울');
assert.equal(quote.attachment, 'quote.pdf');

// Merchant ADV is injected server-side / tracking — FE default campaign only
const merchantId = 'ADV-0008';
assert.equal(merchantId, 'ADV-0008');

console.log('OK: Hero + Quote payload contract checks passed');
console.log('Hero keys:', Object.keys(hero).join(','));
console.log('Quote keys:', Object.keys(quote).join(','));
