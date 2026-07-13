import React, { useEffect, useMemo, useState } from "react";
import { Link } from 'react-router-dom';
import { Search, Info, Link as LinkIcon, Filter, CheckCircle2, AlertTriangle, TrendingUp, Briefcase, PlusCircle, DollarSign, ExternalLink, BookOpen, ShoppingBag, Copy } from 'lucide-react';
import { SummaryCard } from '../../components/partner/PartnerShared';
import { PartnerLayout } from '../../layouts/PartnerLayout';
import { fetchPartnerCampaigns, createPartnerLink, fetchPartnerPromoGuide, PartnerCampaign } from '../../lib/api';
import { PartnerLinkCreateFields, resolvePartnerChannel } from '../../components/partner/PartnerLinkCreateFields';
import { PartnerCampaignDetailModal } from '../../components/partner/PartnerCampaignDetailModal';
import { openLandingPage } from '../../lib/utils';

const fallbackCpaCategories = ['전체', '금융', '법률', '병원', '교육', '생활서비스', '렌탈', '기타'];
const fallbackCpsCategories = ['전체', '쇼핑몰', '뷰티', '건강', '생활', '기타'];

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

  const recommendedItems = useMemo(
    () => campaigns.filter((item) => item.recommended || item.badge).slice(0, 3),
    [campaigns],
  );

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
    setLinkGuideWarning(false);
  };

  const openLinkModal = async (campaign: PartnerCampaign) => {
    if (isCpsCampaign(campaign)) {
      const url = (campaign.promoUrl || '').trim();
      if (!url) {
        setLinkResult('홍보 링크를 불러올 수 없습니다.');
        setLinkModal(campaign);
        resetLinkModalFields();
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        setLinkResult(url);
      } catch {
        setLinkResult(url);
      }
      setLinkModal(campaign);
      resetLinkModalFields();
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
      const url = (linkModal.promoUrl || '').trim();
      if (url) {
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          /* ignore */
        }
        setLinkResult(url);
      }
      return;
    }
    setLinkCreating(true);
    setLinkResult('');
    try {
      const result = await createPartnerLink({
        campaignId: linkModal.id,
        channel: resolvePartnerChannel(linkChannelPreset, linkChannelCustom),
        subId: linkName,
      });
      if (result.link?.url) {
        setLinkResult(result.link.url);
        await navigator.clipboard.writeText(result.link.url);
      }
    } catch (err) {
      setLinkResult(err instanceof Error ? err.message : '링크 생성에 실패했습니다.');
    } finally {
      setLinkCreating(false);
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
          {['단가 높은순', '승인율 높은순', '신규 캠페인', '인기 캠페인'].map((filter) => (
            <button key={filter} className="px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              {filter}
            </button>
          ))}
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
            채널 필터 <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 mb-8">캠페인 목록을 불러오는 중...</p>
      ) : (
        <>
          {recommendedItems.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                추천 상품
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedItems.map((item) => (
                  <div key={`rec-${item.id}`}>
                    <CampaignCard
                      campaign={item}
                      onOpenDetail={() => openDetailModal(item, 'intro')}
                      onOpenGuide={() => openDetailModal(item, 'guide')}
                      onCreateLink={() => openLinkModal(item)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-slate-200 w-full mb-10"></div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              전체 캠페인 <span className="text-emerald-600 font-bold">({campaigns.length})</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {campaigns.map((item) => (
              <div key={item.id}>
                <CampaignCard
                  campaign={item}
                  onOpenDetail={() => openDetailModal(item, 'intro')}
                  onOpenGuide={() => openDetailModal(item, 'guide')}
                  onCreateLink={() => openLinkModal(item)}
                />
              </div>
            ))}
          </div>
        </>
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
                    {(linkModal.promoUrl || linkResult || '').trim() || '링크를 불러오지 못했습니다.'}
                  </div>
                  {linkResult ? (
                    <p className="text-sm text-emerald-600">클립보드에 복사되었습니다.</p>
                  ) : null}
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
                  <PartnerLinkCreateFields
                    channelPreset={linkChannelPreset}
                    channelCustom={linkChannelCustom}
                    linkName={linkName}
                    onChannelPresetChange={setLinkChannelPreset}
                    onChannelCustomChange={setLinkChannelCustom}
                    onLinkNameChange={setLinkName}
                  />
                  {linkResult && (
                    <p className={`text-sm ${linkResult.startsWith('http') ? 'text-emerald-600 break-all' : 'text-red-600'}`}>
                      {linkResult.startsWith('http') ? `생성 완료 (클립보드 복사됨): ${linkResult}` : linkResult}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button type="button" onClick={() => setLinkModal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl">닫기</button>
              <button type="button" disabled={linkCreating} onClick={handleCreateLink} className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {isCpsCampaign(linkModal) ? (
                  <><Copy size={16} /> 링크 복사</>
                ) : linkCreating ? (
                  '생성 중...'
                ) : (
                  '링크 생성'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </PartnerLayout>
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
        <div className="aspect-[16/10] overflow-hidden relative bg-slate-100 flex items-center justify-center">
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
