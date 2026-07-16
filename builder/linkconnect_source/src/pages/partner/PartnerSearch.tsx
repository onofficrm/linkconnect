import React, { useEffect, useMemo, useState } from "react";
import { Link } from 'react-router-dom';
import { Search, Info, Link as LinkIcon, Filter, CheckCircle2, AlertTriangle, TrendingUp, Briefcase, PlusCircle, DollarSign, ExternalLink, BookOpen, ShoppingBag, Copy } from 'lucide-react';
import { SummaryCard } from '../../components/partner/PartnerShared';
import { PartnerLayout } from '../../layouts/PartnerLayout';
import {
  fetchPartnerCampaigns,
  createPartnerLink,
  buildPartnerCpaShortlink,
  buildPartnerLpShortlink,
  fetchPartnerPromoGuide,
  PartnerCampaign,
  PartnerLink,
} from '../../lib/api';
import { PartnerLinkCreateFields, resolvePartnerChannel } from '../../components/partner/PartnerLinkCreateFields';
import { CPA_THUMBNAIL_ASPECT_CLASS } from '../../lib/cpaThumbnail';
import { PartnerCampaignDetailModal } from '../../components/partner/PartnerCampaignDetailModal';
import { openLandingPage } from '../../lib/utils';
import { DataTableEmpty, RankBadge, SkeletonTable, tableRowClass } from '../../components/center-ui';
import { CpsChannelGuide, parseChannelItems } from '../../components/cps/CpsChannelGuide';
import { formatCpsCommissionRate } from '../../components/cps/CpsShared';

const fallbackCpaCategories = ['전체', '금융', '법률', '병원', '교육', '생활서비스', '렌탈', '기타'];
const fallbackCpsCategories = ['전체', '여행/티켓', '종합쇼핑몰', '건강', '패션', '뷰티', '생활/인테리어', '기타'];

type ProductType = 'all' | 'cpa' | 'cps';
type DetailTab = 'intro' | 'guide' | 'assets';

function isCpsCampaign(campaign: PartnerCampaign) {
  return campaign.campaignType === 'cps' || campaign.type === 'cps';
}

export function PartnerSearch() {
  const [productType, setProductType] = useState<ProductType>('all');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(fallbackCpaCategories);
  const [campaigns, setCampaigns] = useState<PartnerCampaign[]>([]);
  const [counts, setCounts] = useState({ cpa: 0, cps: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkModal, setLinkModal] = useState<PartnerCampaign | null>(null);
  const [linkChannelPreset, setLinkChannelPreset] = useState('');
  const [linkChannelCustom, setLinkChannelCustom] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkCreating, setLinkCreating] = useState(false);
  const [linkResult, setLinkResult] = useState('');
  const [createdCpaLink, setCreatedCpaLink] = useState<PartnerLink | null>(null);
  const [shortUrl, setShortUrl] = useState('');
  const [shortBusy, setShortBusy] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const [detailModal, setDetailModal] = useState<{ campaign: PartnerCampaign; tab: DetailTab } | null>(null);
  const [guideConfirmed, setGuideConfirmed] = useState<Record<number, boolean>>({});
  const [linkGuideWarning, setLinkGuideWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPartnerCampaigns({
          category: activeCategory,
          q: searchQuery,
          type: productType,
        });
        if (cancelled) {
          return;
        }
        const cats = data.categories.length
          ? data.categories
          : (productType === 'cps' ? fallbackCpsCategories : fallbackCpaCategories);
        setCategories(cats);
        setCampaigns(data.items);
        setCounts(data.counts ?? {
          cpa: data.items.filter((i) => !isCpsCampaign(i)).length,
          cps: data.items.filter((i) => isCpsCampaign(i)).length,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '캠페인을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(load, searchQuery ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeCategory, searchQuery, productType]);

  const cpaCampaigns = useMemo(() => campaigns.filter((i) => !isCpsCampaign(i)), [campaigns]);
  const cpsCampaigns = useMemo(() => campaigns.filter((i) => isCpsCampaign(i)), [campaigns]);

  const avgPrice = useMemo(() => {
    if (!cpaCampaigns.length) {
      return '0';
    }
    const total = cpaCampaigns.reduce((sum, item) => sum + item.price, 0);
    return Math.round(total / cpaCampaigns.length).toLocaleString();
  }, [cpaCampaigns]);

  const resetLinkModalFields = () => {
    setLinkChannelPreset('');
    setLinkChannelCustom('');
    setLinkName('');
    setLinkResult('');
    setCreatedCpaLink(null);
    setShortUrl('');
    setShortBusy(false);
    setCopyNotice('');
    setLinkGuideWarning(false);
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyNotice('클립보드에 복사되었습니다.');
      window.setTimeout(() => setCopyNotice(''), 2500);
    } catch {
      setCopyNotice('복사에 실패했습니다.');
    }
  };

  const openLinkModal = async (campaign: PartnerCampaign) => {
    if (isCpsCampaign(campaign)) {
      const url = (campaign.promoUrl || '').trim();
      resetLinkModalFields();
      setLinkModal(campaign);
      if (!url) {
        setLinkResult('홍보 링크를 불러올 수 없습니다.');
        return;
      }
      setLinkResult(url);
      return;
    }

    setLinkModal(campaign);
    resetLinkModalFields();

    if (!campaign.hasPublishedGuide) return;

    if (guideConfirmed[campaign.id] === true) return;

    try {
      const detail = await fetchPartnerPromoGuide(campaign.id);
      const confirmed = detail.confirmation?.confirmed ?? false;
      setGuideConfirmed((prev) => ({ ...prev, [campaign.id]: confirmed }));
      setLinkGuideWarning(!confirmed);
    } catch {
      setLinkGuideWarning(false);
    }
  };

  const openDetailModal = (campaign: PartnerCampaign, tab: DetailTab = 'intro') => {
    if (isCpsCampaign(campaign)) {
      setDetailModal({ campaign, tab: 'intro' });
      return;
    }
    setDetailModal({ campaign, tab });
  };

  const handleCreateLink = async () => {
    if (!linkModal) return;
    if (isCpsCampaign(linkModal)) {
      const url = (shortUrl || linkModal.promoUrl || linkResult || '').trim();
      if (url) await copyUrl(url);
      return;
    }
    if (createdCpaLink?.url) {
      await copyUrl(shortUrl || createdCpaLink.url);
      return;
    }
    setLinkCreating(true);
    setLinkResult('');
    setShortUrl('');
    try {
      const result = await createPartnerLink({
        campaignId: linkModal.id,
        channel: resolvePartnerChannel(linkChannelPreset, linkChannelCustom),
        subId: linkName,
      });
      if (result.link?.url) {
        setCreatedCpaLink(result.link);
        setLinkResult(result.link.url);
        await copyUrl(result.link.url);
      }
    } catch (err) {
      setLinkResult(err instanceof Error ? err.message : '링크 생성에 실패했습니다.');
    } finally {
      setLinkCreating(false);
    }
  };

  const handleShortlinkConvert = async () => {
    if (!linkModal) return;
    setShortBusy(true);
    setCopyNotice('');
    try {
      if (isCpsCampaign(linkModal)) {
        const res = await buildPartnerLpShortlink({
          merchantCode: linkModal.merchantCode || linkModal.code || '',
        });
        setShortUrl(res.shortUrl);
        setCopyNotice('숏링크로 변환되었습니다.');
      } else if (createdCpaLink) {
        const res = await buildPartnerCpaShortlink({ linkId: createdCpaLink.id });
        setShortUrl(res.shortUrl);
        setCopyNotice('숏링크로 변환되었습니다.');
      }
    } catch (err) {
      setCopyNotice(err instanceof Error ? err.message : '숏링크 변환에 실패했습니다.');
    } finally {
      setShortBusy(false);
      window.setTimeout(() => setCopyNotice(''), 2500);
    }
  };

  return (
    <PartnerLayout activeMenu="search" title="광고상품 찾기">
      <p className="text-slate-500 mb-8 -mt-2">
        CPA 리드형 상품과 CPS 쇼핑몰 상품을 한곳에서 찾고 홍보할 수 있습니다.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="전체 상품" value={String(campaigns.length)} suffix="개" icon={<Briefcase className="text-slate-500" />} />
        <SummaryCard title="CPA 상품" value={String(counts.cpa || cpaCampaigns.length)} suffix="개" icon={<PlusCircle className="text-blue-500" />} />
        <SummaryCard title="CPS 쇼핑" value={String(counts.cps || cpsCampaigns.length)} suffix="개" icon={<ShoppingBag className="text-cyan-500" />} />
        <SummaryCard title="평균 CPA 단가" value={avgPrice} suffix="원" highlight icon={<DollarSign className="text-cyan-500" />} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {([
          ['all', '전체'],
          ['cpa', 'CPA'],
          ['cps', 'CPS'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => { setProductType(id); setActiveCategory('전체'); }}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${
              productType === id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
        <Link to="/partner/cps" className="ml-auto text-sm font-bold text-cyan-700 self-center">
          CPS 전용 화면 →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center mb-10 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상품명 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {(productType === 'cps'
            ? ['수수료 높은순', '신규 캠페인', '인기 캠페인']
            : ['단가 높은순', '승인율 높은순', '신규 캠페인', '인기 캠페인']
          ).map((filter) => (
            <button key={filter} className="px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              {filter}
            </button>
          ))}
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
            채널 필터 <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {copyNotice && !linkModal ? (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">{copyNotice}</div>
      ) : null}

      {loading ? (
        <SkeletonTable rows={8} cols={productType === 'cps' ? 5 : 7} />
      ) : (
        <CampaignListTable
          campaigns={campaigns}
          hideApprovalRate={productType === 'cps'}
          onOpenDetail={(item) => openDetailModal(item, 'intro')}
          onOpenGuide={(item) => openDetailModal(item, 'guide')}
          onCreateLink={openLinkModal}
          onCopyShortlink={async (campaign) => {
            try {
              if (isCpsCampaign(campaign)) {
                const res = await buildPartnerLpShortlink({
                  merchantCode: campaign.merchantCode || campaign.code || '',
                });
                await navigator.clipboard.writeText(res.shortUrl);
                setCopyNotice('CPS 숏코드 링크를 복사했습니다.');
              } else {
                const res = await buildPartnerCpaShortlink({ campaignId: campaign.id });
                await navigator.clipboard.writeText(res.shortUrl);
                setCopyNotice('CPA 숏코드 링크를 복사했습니다.');
              }
            } catch (err) {
              setCopyNotice(err instanceof Error ? err.message : '숏코드 복사에 실패했습니다.');
            } finally {
              window.setTimeout(() => setCopyNotice(''), 2500);
            }
          }}
        />
      )}

      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold mb-4">광고상품 홍보 전 꼭 확인하세요.</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>허용 채널과 금지 채널을 반드시 확인해주세요. 채널 위반 시 정산이 거절될 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>허위 또는 과장 홍보로 발생한 디비는 전량 취소될 수 있으며 파트너 자격이 정지될 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>광고주가 정상적인 상담/가입으로 승인 완료한 디비만 확정수익으로 반영됩니다.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <PartnerCampaignDetailModal
        open={detailModal !== null}
        campaign={detailModal?.campaign ?? null}
        initialTab={detailModal?.tab ?? 'intro'}
        onClose={() => setDetailModal(null)}
        onConfirmationChange={(campaignId, confirmed) => {
          setGuideConfirmed((prev) => ({ ...prev, [campaignId]: confirmed }));
        }}
      />

      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {isCpsCampaign(linkModal) ? 'CPS 홍보 링크' : '홍보 링크 생성'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{linkModal.title}</p>
            </div>
            <div className="p-6 space-y-4">
              {isCpsCampaign(linkModal) ? (
                <>
                  <p className="text-sm text-slate-600">아래 링크를 복사해 채널에 게시하세요. 구매 발생 시 수익이 적립됩니다.</p>
                  <div className="text-xs break-all bg-slate-50 rounded-xl p-3 font-mono border">
                    {(shortUrl || linkModal.promoUrl || linkResult || '').trim() || '링크를 불러오지 못했습니다.'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={shortBusy || !(linkModal.promoUrl || linkResult)}
                      onClick={handleShortlinkConvert}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-800 text-sm font-bold disabled:opacity-50"
                    >
                      <LinkIcon size={16} />
                      {shortBusy ? '변환 중…' : '숏링크 변환'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyUrl((shortUrl || linkModal.promoUrl || linkResult || '').trim())}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold"
                    >
                      <Copy size={16} />
                      복사
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {linkGuideWarning && linkModal.hasPublishedGuide ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                      광고를 시작하기 전에 최신 홍보 가이드를 확인해 주세요.{' '}
                      <button
                        type="button"
                        className="font-bold underline ml-1"
                        onClick={() => {
                          setLinkModal(null);
                          openDetailModal(linkModal, 'guide');
                        }}
                      >
                        가이드 보기
                      </button>
                    </div>
                  ) : null}
                  {!createdCpaLink ? (
                    <PartnerLinkCreateFields
                      channelPreset={linkChannelPreset}
                      channelCustom={linkChannelCustom}
                      linkName={linkName}
                      onChannelPresetChange={setLinkChannelPreset}
                      onChannelCustomChange={setLinkChannelCustom}
                      onLinkNameChange={setLinkName}
                    />
                  ) : null}
                  {linkResult && !linkResult.startsWith('http') ? (
                    <p className="text-sm text-red-600">{linkResult}</p>
                  ) : null}
                  {createdCpaLink?.url ? (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-500">대표 홍보 링크</div>
                      <div className="text-xs break-all bg-slate-50 rounded-xl p-3 font-mono border">
                        {shortUrl || createdCpaLink.url}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={shortBusy}
                          onClick={handleShortlinkConvert}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-800 text-sm font-bold disabled:opacity-50"
                        >
                          <LinkIcon size={16} />
                          {shortBusy ? '변환 중…' : '숏링크 변환'}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyUrl(shortUrl || createdCpaLink.url)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold"
                        >
                          <Copy size={16} />
                          복사
                        </button>
                      </div>
                      {shortUrl ? (
                        <p className="text-[11px] text-slate-400 break-all">원본: {createdCpaLink.url}</p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
              {copyNotice ? (
                <p className={`text-sm ${copyNotice.includes('실패') ? 'text-red-600' : 'text-emerald-600'}`}>{copyNotice}</p>
              ) : null}
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button type="button" onClick={() => setLinkModal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl">닫기</button>
              {isCpsCampaign(linkModal) ? (
                <button
                  type="button"
                  onClick={handleCreateLink}
                  className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> 링크 복사
                </button>
              ) : createdCpaLink ? (
                <button
                  type="button"
                  onClick={handleCreateLink}
                  className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> 링크 복사
                </button>
              ) : (
                <button
                  type="button"
                  disabled={linkCreating}
                  onClick={handleCreateLink}
                  className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-60"
                >
                  {linkCreating ? '생성 중...' : '링크 생성'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </PartnerLayout>
  );
}

function ChannelCompact({
  allowed,
  forbidden,
  merchantName,
  compactGuide,
}: {
  allowed: string;
  forbidden: string;
  merchantName: string;
  compactGuide?: boolean;
}) {
  if (compactGuide) {
    return (
      <CpsChannelGuide
        allowedChannels={allowed}
        forbiddenChannels={forbidden}
        merchantName={merchantName}
        compact
      />
    );
  }

  const allowItems = parseChannelItems(allowed).slice(0, 3);
  const forbidCount = parseChannelItems(forbidden).length;

  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex flex-wrap gap-1">
        {allowItems.length ? (
          allowItems.map((item) => (
            <span
              key={item}
              className="inline-flex px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600"
            >
              {item.length > 12 ? `${item.slice(0, 12)}…` : item}
            </span>
          ))
        ) : (
          <span className="text-[11px] text-slate-400">허용 채널 없음</span>
        )}
      </div>
      {forbidCount > 0 ? (
        <div className="text-[11px] text-rose-600 font-medium">금지 {forbidCount}건 · 상세에서 확인</div>
      ) : (
        <div className="text-[11px] text-slate-400">금지 항목 없음</div>
      )}
    </div>
  );
}

function CampaignListTable({
  campaigns,
  hideApprovalRate = false,
  onOpenDetail,
  onOpenGuide,
  onCreateLink,
  onCopyShortlink,
}: {
  campaigns: PartnerCampaign[];
  hideApprovalRate?: boolean;
  onOpenDetail: (campaign: PartnerCampaign) => void;
  onOpenGuide: (campaign: PartnerCampaign) => void;
  onCreateLink: (campaign: PartnerCampaign) => void;
  onCopyShortlink: (campaign: PartnerCampaign) => Promise<void>;
}) {
  const isCpsList = hideApprovalRate;
  const colSpan = isCpsList ? 5 : 7;
  const [shortBusyId, setShortBusyId] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-16">
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            광고상품 목록 <span className={isCpsList ? 'text-cyan-600' : 'text-emerald-600'}>({campaigns.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isCpsList
              ? '수수료와 채널을 비교한 뒤 숏코드 링크를 바로 복사하세요.'
              : '단가·승인율을 비교한 뒤 링크 생성 또는 숏코드를 복사하세요.'}
          </p>
        </div>
        <div className="text-xs text-slate-500">목록에서 숏코드 복사가 가능합니다.</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm text-left">
          <colgroup>
            {isCpsList ? (
              <>
                <col className="w-[22%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[28%]" />
                <col className="w-[32%]" />
              </>
            ) : (
              <>
                <col className="w-[22%]" />
                <col className="w-[7%]" />
                <col className="w-[10%]" />
                <col className="w-[9%]" />
                <col className="w-[22%]" />
                <col className="w-[30%]" />
              </>
            )}
          </colgroup>
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 font-medium">{isCpsList ? '광고주' : '광고상품'}</th>
              {!isCpsList ? <th className="px-3 py-3.5 font-medium text-center">유형</th> : null}
              <th className="px-3 py-3.5 font-medium text-right">{isCpsList ? '수수료' : '단가'}</th>
              {!isCpsList ? <th className="px-3 py-3.5 font-medium text-center">승인율</th> : null}
              {isCpsList ? <th className="px-3 py-3.5 font-medium text-center">쿠키</th> : null}
              <th className="px-3 py-3.5 font-medium">채널</th>
              <th className="px-3 py-3.5 font-medium text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <DataTableEmpty
                colSpan={colSpan}
                title="검색된 광고상품이 없습니다"
                description="검색어 또는 카테고리 필터를 변경해 다시 확인해 주세요."
              />
            ) : campaigns.map((campaign, index) => {
              const isCps = isCpsCampaign(campaign);
              const hasLandingUrl = campaign.landingUrl.trim().length > 0;
              const highlighted = campaign.recommended || Boolean(campaign.badge);
              const commission = isCps
                ? formatCpsCommissionRate(campaign.approvalRate || campaign.priceFormatted || '-')
                : `${campaign.priceFormatted}원`;
              const cookie = (campaign.avgTime || campaign.returnDay != null)
                ? (campaign.avgTime || `${campaign.returnDay}일`)
                : '-';

              return (
                <tr
                  key={campaign.id}
                  className={tableRowClass(index < 3 && highlighted ? index + 1 : undefined, highlighted)}
                >
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {campaign.thumbnailUrl ? (
                        <div className="w-10 h-10 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                          <img
                            src={campaign.thumbnailUrl}
                            alt=""
                            className={isCps ? 'w-full h-full object-contain p-1' : 'w-full h-full object-cover'}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 shrink-0 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0">
                          {highlighted ? <RankBadge rank={index + 1} /> : null}
                          <button
                            type="button"
                            onClick={() => onOpenDetail(campaign)}
                            className="font-bold text-slate-900 hover:text-emerald-600 text-left truncate"
                            title={campaign.title}
                          >
                            {campaign.title}
                          </button>
                          {campaign.badge ? (
                            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                              {campaign.badge}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {campaign.category}
                          {campaign.status === '진행중' ? (
                            <span className="ml-1.5 text-emerald-600 font-semibold">진행중</span>
                          ) : (
                            <span className="ml-1.5 text-rose-500 font-semibold">{campaign.status}</span>
                          )}
                        </div>
                        {campaign.description ? (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1" title={campaign.description}>
                            {campaign.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  {!isCpsList ? (
                    <td className="px-3 py-3.5 text-center align-middle">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold border ${
                        isCps ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isCps ? 'CPS' : 'CPA'}
                      </span>
                    </td>
                  ) : null}
                  <td className="px-3 py-3.5 text-right whitespace-nowrap align-middle">
                    <div className={`font-bold tabular-nums ${isCps ? 'text-cyan-700' : 'text-emerald-700'}`}>
                      {commission}
                    </div>
                    <div className="text-[10px] text-slate-400">{isCps ? '구매 수수료' : '파트너 단가'}</div>
                  </td>
                  {!isCpsList ? (
                    <td className="px-3 py-3.5 text-center whitespace-nowrap align-middle">
                      {isCps ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-800">{campaign.approvalRate}</div>
                          <div className="text-[11px] text-slate-400">{campaign.avgTime}</div>
                        </>
                      )}
                    </td>
                  ) : null}
                  {isCpsList ? (
                    <td className="px-3 py-3.5 text-center text-xs font-semibold text-slate-600 tabular-nums align-middle">
                      {cookie}
                    </td>
                  ) : null}
                  <td className="px-3 py-3.5 align-middle">
                    <ChannelCompact
                      allowed={campaign.allowedChannels}
                      forbidden={campaign.forbiddenChannels}
                      merchantName={campaign.title}
                      compactGuide={isCpsList}
                    />
                  </td>
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex flex-wrap justify-end content-center gap-1.5 min-w-[200px]">
                      {hasLandingUrl && !isCpsList ? (
                        <button
                          type="button"
                          onClick={() => openLandingPage(campaign.landingUrl)}
                          className="px-2.5 py-1.5 bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          랜딩
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onOpenDetail(campaign)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold"
                      >
                        상세
                      </button>
                      <button
                        type="button"
                        disabled={shortBusyId === campaign.id}
                        onClick={async () => {
                          setShortBusyId(campaign.id);
                          try {
                            await onCopyShortlink(campaign);
                          } finally {
                            setShortBusyId(null);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50"
                        title="숏코드 링크 복사"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {shortBusyId === campaign.id ? '변환…' : '숏코드'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onCreateLink(campaign)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm text-white ${
                          isCps ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-emerald-500 hover:bg-emerald-400'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        {isCps ? '링크' : '생성'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampaignCard({
  campaign,
  onOpenDetail,
  onOpenGuide,
  onCreateLink,
}: {
  campaign: PartnerCampaign;
  onOpenDetail: () => void;
  onOpenGuide: () => void;
  onCreateLink: () => void;
}) {
  const isCps = isCpsCampaign(campaign);
  const hasLandingUrl = campaign.landingUrl.trim().length > 0;
  const hasGuide = Boolean(campaign.hasPublishedGuide);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col">
      {campaign.thumbnailUrl ? (
        <div className={`${CPA_THUMBNAIL_ASPECT_CLASS} overflow-hidden relative bg-slate-100 flex items-center justify-center`}>
          <img
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            className={isCps ? 'w-full h-full object-contain p-4' : 'w-full h-full object-cover'}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md border border-slate-200">
              {campaign.category}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
              isCps ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {isCps ? 'CPS' : 'CPA'}
            </span>
          </div>
          <div className="flex gap-2">
            {campaign.badge && (
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                campaign.badge === '추천' ? 'bg-emerald-100 text-emerald-800' :
                campaign.badge === '인기' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {campaign.badge}
              </span>
            )}
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
              campaign.status === '진행중' ? 'bg-white border-emerald-200 text-emerald-600' : 'bg-white border-red-200 text-red-500'
            }`}>
              {campaign.status}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">{campaign.title}</h3>
        <p className="text-sm text-slate-500 mb-5 line-clamp-1">{campaign.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {isCps ? (
            <>
              <div className="bg-cyan-50/50 rounded-xl p-3 border border-cyan-100/50">
                <div className="text-xs text-cyan-800 mb-1">수수료</div>
                <div className="text-lg font-bold text-cyan-600">{campaign.approvalRate}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">유형</div>
                <div className="text-lg font-bold text-slate-700">구매 연동</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                <div className="text-xs text-emerald-800 mb-1">파트너 단가</div>
                <div className="text-lg font-bold text-emerald-600">{campaign.priceFormatted}<span className="text-sm font-normal ml-0.5">원</span></div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">승인율 / 평균</div>
                <div className="text-lg font-bold text-slate-700">{campaign.approvalRate} <span className="text-xs font-normal text-slate-400">({campaign.avgTime})</span></div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start">
            <span className="inline-block w-14 text-slate-400 font-medium shrink-0">허용채널</span>
            <span className="text-slate-700 font-medium">{campaign.allowedChannels}</span>
          </div>
          <div className="flex items-start">
            <span className="inline-block w-14 text-slate-400 font-medium shrink-0">금지채널</span>
            <span className="text-red-500 font-medium">{campaign.forbiddenChannels}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
        {hasGuide ? (
          <button
            type="button"
            onClick={onOpenGuide}
            className="w-full py-2.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl transition-colors text-sm flex justify-center items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            홍보 가이드 보기
          </button>
        ) : null}
        {hasLandingUrl && (
          <button
            type="button"
            onClick={() => openLandingPage(campaign.landingUrl)}
            className="w-full py-2.5 bg-white border border-cyan-200 hover:bg-cyan-50 text-cyan-700 font-medium rounded-xl transition-colors text-sm flex justify-center items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            랜딩페이지 보기
          </button>
        )}
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenDetail}
            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition-colors text-sm"
          >
            상세보기
          </button>
          <button type="button" onClick={onCreateLink} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm flex justify-center items-center gap-1.5 shadow-sm">
            <LinkIcon className="w-4 h-4" />
            {isCps ? '링크 복사' : '홍보 링크 생성'}
          </button>
        </div>
      </div>
    </div>
  );
}
