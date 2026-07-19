import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { SummaryCard, StatusBadge } from '../../components/admin/AdminShared';
import {
  Briefcase, Activity, PauseCircle, AlertCircle, Coins, Percent,
  Search, Download, X, Edit3, Plus, Database, Image, Upload,
  Wand2, Loader2, Copy, Trash2,
} from 'lucide-react';
import {
  AdminCampaign,
  AdminCampaignSummary,
  AdminMerchant,
  deleteAdminCampaign,
  fetchAdminCampaigns,
  fetchAdminMerchants,
  saveAdminCampaign,
  updateAdminCampaignStatus,
  uploadAdminCampaignThumbnail,
  deleteAdminCampaignThumbnail,
  generateAdminCampaignThumbnailAi,
} from '../../lib/api';
import { isLcSuperAdmin } from '../../lib/auth';
import { promoGuideStatusLabel, promoGuideStatusStyle } from '../../lib/campaignPromoGuide';
import { AdminCampaignPromoGuidePanel } from '../../components/admin/AdminCampaignPromoGuidePanel';
import { CPA_THUMBNAIL_ASPECT_CLASS, CPA_THUMBNAIL_SPEC, cpaThumbnailHint } from '../../lib/cpaThumbnail';

const categoryOptions = ['금융', '법률', '병원', '교육', '생활서비스', '렌탈', '기타'];

const guideFilterOptions = [
  { label: '가이드 상태 전체', value: '' },
  { label: '미등록', value: 'none' },
  { label: '작성 중', value: 'draft' },
  { label: '검토 대기', value: 'review' },
  { label: '수정 요청', value: 'revision' },
  { label: '파트너 공개', value: 'published' },
  { label: '비공개', value: 'hidden' },
];

const statusFilterOptions = [
  { label: '전체 상태', value: '' },
  { label: '운영중', value: 'active' },
  { label: '일시중지', value: 'paused' },
  { label: '종료', value: 'ended' },
  { label: '검수중', value: 'draft' },
  { label: '광고비 부족', value: 'low_balance' },
];

const emptySummary: AdminCampaignSummary = {
  total: 0,
  active: 0,
  paused: 0,
  lowBalance: 0,
  avgPrice: 0,
  avgApproval: 0,
};

type EditForm = {
  id: number;
  code: string;
  name: string;
  mtId: number;
  category: string;
  type: string;
  advertiserPrice: number;
  partnerPrice: number;
  statusCode: string;
  landingUrl: string;
  allowedChannels: string;
  forbiddenChannels: string;
  description: string;
  approvalRate: string;
  avgTime: string;
  thumbnailUrl: string;
};

function toEditForm(campaign: AdminCampaign | null, isNew = false): EditForm {
  if (!campaign || isNew) {
    return {
      id: 0,
      code: '신규등록',
      name: '',
      mtId: 0,
      category: '',
      type: 'CPA',
      advertiserPrice: 0,
      partnerPrice: 0,
      statusCode: 'draft',
      landingUrl: '',
      allowedChannels: '',
      forbiddenChannels: '',
      description: '',
      approvalRate: '',
      avgTime: '',
      thumbnailUrl: '',
    };
  }

  return {
    id: campaign.id,
    code: campaign.code,
    name: campaign.name,
    mtId: campaign.mtId,
    category: campaign.category,
    type: campaign.type,
    advertiserPrice: campaign.advertiserPrice,
    partnerPrice: campaign.partnerPrice,
    statusCode: campaign.statusCode,
    landingUrl: campaign.landingUrl,
    allowedChannels: campaign.allowedChannels,
    forbiddenChannels: campaign.forbiddenChannels,
    description: campaign.description,
    approvalRate: campaign.approvalRate,
    avgTime: campaign.avgTime,
    thumbnailUrl: campaign.thumbnailUrl ?? '',
  };
}

export function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [summary, setSummary] = useState<AdminCampaignSummary>(emptySummary);
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<AdminCampaign | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [guideFilter, setGuideFilter] = useState('');
  const [guidePanel, setGuidePanel] = useState<AdminCampaign | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const isSuperAdmin = isLcSuperAdmin();

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminCampaigns({
        status: statusFilter,
        category: categoryFilter,
        q: searchQuery,
      });
      setCampaigns(data.items);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '캠페인을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    fetchAdminMerchants()
      .then((data) => setMerchants(data.items))
      .catch(() => setMerchants([]));
  }, []);

  const handleRowClick = (campaign: AdminCampaign) => {
    setSelectedCampaign(campaign);
    setEditForm(toEditForm(campaign));
    setIsEditMode(false);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const handleAIGenerate = async () => {
    if (!editForm?.id || isGenerating || thumbnailUploading) return;
    if (!isEditMode) {
      setError('수정 모드에서 AI 썸네일을 생성할 수 있습니다.');
      return;
    }

    const extra = window.prompt(
      '추가 지시사항(선택)\n예: 밝은 상담실 분위기, 신뢰감 있는 톤',
      '',
    );
    if (extra === null) return;

    setIsGenerating(true);
    setError('');
    try {
      const result = await generateAdminCampaignThumbnailAi({
        cpId: editForm.id,
        extra: extra.trim(),
      });
      const cacheBust = `${result.thumbnailUrl}${result.thumbnailUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      setEditForm((prev) => (prev ? { ...prev, thumbnailUrl: cacheBust } : prev));
      if (result.campaign) {
        setSelectedCampaign(result.campaign);
      }
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 썸네일 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThumbnailClick = () => {
    if (!isEditMode || thumbnailUploading) return;
    if (!editForm?.id) {
      setError('광고상품을 먼저 저장한 후 썸네일을 등록할 수 있습니다.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editForm?.id) return;

    setThumbnailUploading(true);
    setError('');
    try {
      const result = await uploadAdminCampaignThumbnail(editForm.id, file);
      const cacheBust = `${result.thumbnailUrl}${result.thumbnailUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      setEditForm((prev) => (prev ? { ...prev, thumbnailUrl: cacheBust } : prev));
      if (result.campaign) {
        setSelectedCampaign(result.campaign);
      }
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : '썸네일 업로드에 실패했습니다.');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleThumbnailDelete = async () => {
    if (!editForm?.id || thumbnailUploading) return;
    if (!window.confirm('썸네일 이미지를 삭제하시겠습니까?')) return;

    setThumbnailUploading(true);
    setError('');
    try {
      await deleteAdminCampaignThumbnail(editForm.id);
      setEditForm((prev) => (prev ? { ...prev, thumbnailUrl: '' } : prev));
      if (selectedCampaign) {
        setSelectedCampaign({ ...selectedCampaign, thumbnailUrl: '' });
      }
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : '썸네일 삭제에 실패했습니다.');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleCreateNew = () => {
    const draft = toEditForm(null, true);
    setSelectedCampaign(null);
    setEditForm(draft);
    setIsEditMode(true);
  };

  const handleSave = async () => {
    if (!editForm) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = await saveAdminCampaign({
        cpId: editForm.id || undefined,
        mtId: editForm.mtId,
        name: editForm.name,
        category: editForm.category,
        type: editForm.type,
        advertiserPrice: editForm.advertiserPrice,
        partnerPrice: editForm.partnerPrice,
        statusCode: editForm.statusCode,
        landingUrl: editForm.landingUrl,
        allowedChannels: editForm.allowedChannels,
        forbiddenChannels: editForm.forbiddenChannels,
        description: editForm.description,
        approvalRate: editForm.approvalRate,
        avgTime: editForm.avgTime,
      });

      if (result.campaign) {
        setSelectedCampaign(result.campaign);
        setEditForm(toEditForm(result.campaign));
      }
      setIsEditMode(false);
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }
    setDeleteModalOpen(false);
    setDeleteConfirmText('');
  };

  const handleDelete = async () => {
    if (!selectedCampaign) {
      return;
    }

    if (deleteConfirmText !== '삭제') {
      setError('삭제를 확인하려면 "삭제"를 입력해주세요.');
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await deleteAdminCampaign({ cpId: selectedCampaign.id, confirm: deleteConfirmText });
      setDeleteModalOpen(false);
      setDeleteConfirmText('');
      setSelectedCampaign(null);
      setEditForm(null);
      setIsEditMode(false);
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (action: 'activate' | 'pause' | 'end') => {
    if (!selectedCampaign) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = await updateAdminCampaignStatus({ action, cpId: selectedCampaign.id });
      if (result.campaign) {
        setSelectedCampaign(result.campaign);
        setEditForm(toEditForm(result.campaign));
      }
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!guideFilter) return true;
    const pg = campaign.promoGuide;
    if (guideFilter === 'none') return !pg?.exists;
    return pg?.status === guideFilter;
  });

  const formatGuideDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return value.slice(0, 10);
    return d.toLocaleDateString('ko-KR');
  };

  const updateEditForm = (patch: Partial<EditForm>) => {
    setEditForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <AdminLayout activeMenu="campaigns" title="광고상품 관리" description="CPA 광고상품의 단가, 운영상태, 승인/취소 기준을 관리하세요.">
      
      <div className="flex justify-end mb-6">
        <button 
          onClick={handleCreateNew}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> 새 광고상품 등록
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <SummaryCard title="전체 광고상품" value={summary.total.toLocaleString()} suffix="개" icon={<Briefcase size={18} />} />
        <SummaryCard title="운영중 상품" value={summary.active.toLocaleString()} suffix="개" color="emerald" highlight icon={<Activity size={18} />} />
        <SummaryCard title="일시중지 상품" value={summary.paused.toLocaleString()} suffix="개" icon={<PauseCircle size={18} />} />
        <SummaryCard title="광고비 부족 상품" value={summary.lowBalance.toLocaleString()} suffix="개" color="red" highlight icon={<AlertCircle size={18} />} />
        <SummaryCard title="평균 파트너 단가" value={summary.avgPrice.toLocaleString()} suffix="원" dark icon={<Coins size={18} />} />
        <SummaryCard title="평균 승인율" value={summary.avgApproval.toLocaleString()} suffix="%" color="cyan" highlight icon={<Percent size={18} />} />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className={`flex flex-col ${editForm ? 'lg:col-span-2' : 'lg:col-span-3 xl:col-span-4'}`}>
          {/* Filter Area */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="광고상품명, 광고주명 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-shadow"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-cyan-500"
                >
                  {statusFilterOptions.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={guideFilter}
                  onChange={(e) => setGuideFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-cyan-500"
                >
                  {guideFilterOptions.map((option) => (
                    <option key={option.value || 'all-guide'} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-cyan-500"
                >
                  <option value="">카테고리 전체</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="text-sm font-medium text-slate-600">총 <strong className="text-cyan-600">{filteredCampaigns.length}</strong>개의 상품</div>
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                <Download size={14} /> 엑셀 다운로드
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-white border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">상품명/코드</th>
                    <th className="px-4 py-3 font-medium">광고주</th>
                    <th className="px-4 py-3 font-medium text-center">홍보 가이드</th>
                    <th className="px-4 py-3 font-medium text-center">포인트/키워드</th>
                    <th className="px-4 py-3 font-medium text-center">이미지</th>
                    <th className="px-4 py-3 font-medium text-center">수정/공개</th>
                    <th className="px-4 py-3 font-medium text-right">파트너 단가</th>
                    <th className="px-4 py-3 font-medium text-center">상태</th>
                    <th className="px-4 py-3 font-medium text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">불러오는 중...</td>
                    </tr>
                  ) : filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">등록된 광고상품이 없습니다.</td>
                    </tr>
                  ) : filteredCampaigns.map((campaign) => {
                    const pg = campaign.promoGuide;
                    const guideStatus = pg?.exists ? (pg.status ?? 'draft') : 'none';
                    return (
                    <tr
                      key={campaign.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedCampaign?.id === campaign.id ? 'bg-cyan-50/50' : ''}`}
                      onClick={() => handleRowClick(campaign)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 mb-0.5">{campaign.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span>{campaign.code}</span>
                          <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                          <span>{campaign.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-700 mb-0.5">{campaign.advertiser}</div>
                        <div className="text-xs font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded inline-block">
                          {campaign.type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {pg?.exists ? (
                          <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold border ${promoGuideStatusStyle(guideStatus)}`}>
                            {pg.statusLabel || promoGuideStatusLabel(guideStatus)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">미등록</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-xs text-slate-600">
                        {pg?.exists ? (
                          <>
                            <div>{pg.hasPoints ? 'O' : 'X'} / {pg.keywordCount ?? 0} / {pg.forbiddenCount ?? 0}</div>
                            <div className="text-slate-400">포인트·키워드·금지</div>
                          </>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-medium text-slate-700">
                        {pg?.exists ? (pg.imageCount ?? 0) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-xs text-slate-600">
                        <div>{formatGuideDate(pg?.updatedAt)}</div>
                        <div className="text-slate-400">{formatGuideDate(pg?.publishedAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-base">{campaign.partnerPrice.toLocaleString()}원</div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuidePanel(campaign);
                          }}
                          className="px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded text-xs font-bold transition-colors"
                        >
                          가이드
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar / Detail Panel */}
        {editForm && (
          <div className="lg:col-span-1 xl:col-span-2 flex flex-col h-[calc(100vh-180px)] sticky top-[100px]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col relative animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {isEditMode ? '광고상품 등록/수정' : '광고상품 상세'}
                  </h3>
                  {!isEditMode && selectedCampaign && <StatusBadge status={selectedCampaign.status} />}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditMode && selectedCampaign && (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCampaign(null);
                      setEditForm(null);
                      setIsEditMode(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white hide-scrollbar">
                
                {/* Basic Info */}
                <section>
                  <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">썸네일 이미지 (가로형)</label>
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-44 ${CPA_THUMBNAIL_ASPECT_CLASS} rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative group ${isEditMode && editForm.id ? 'cursor-pointer' : ''}`}
                          onClick={handleThumbnailClick}
                        >
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                          {editForm.thumbnailUrl ? (
                            <img src={editForm.thumbnailUrl} alt="썸네일" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center px-2">
                              <Image className="w-7 h-7 text-slate-300 mx-auto mb-1" />
                              <span className="text-[10px] text-slate-400 font-medium">{CPA_THUMBNAIL_SPEC.ratioLabel}</span>
                            </div>
                          )}
                          {isEditMode && editForm.id && (
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              {thumbnailUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Upload className="w-5 h-5 text-white" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {isEditMode ? (
                            <div className="flex flex-col gap-2 h-full justify-center">
                              <div
                                className={`border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-cyan-300 transition-colors flex-1 ${editForm.id ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                onClick={handleThumbnailClick}
                              >
                                <Upload className="w-5 h-5 text-cyan-500 mb-1" />
                                <span className="text-xs font-medium text-slate-700">
                                  {editForm.id ? cpaThumbnailHint(true) : '저장 후 업로드 가능'}
                                </span>
                                <span className="text-[11px] text-slate-400 mt-1">
                                  {CPA_THUMBNAIL_SPEC.formats} · 최대 {CPA_THUMBNAIL_SPEC.maxMb}MB
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {cpaThumbnailHint()}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleAIGenerate}
                                  disabled={isGenerating || thumbnailUploading}
                                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors shadow-sm disabled:opacity-50 py-2"
                                >
                                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} AI 생성
                                </button>
                                {editForm.thumbnailUrl && editForm.id ? (
                                  <button
                                    type="button"
                                    onClick={handleThumbnailDelete}
                                    disabled={thumbnailUploading}
                                    className="px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold disabled:opacity-50"
                                  >
                                    삭제
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <div className="min-h-[5.5rem] flex flex-col justify-center text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 gap-1">
                              <span>{editForm.thumbnailUrl ? '등록된 썸네일 이미지' : '등록된 썸네일 이미지가 없습니다.'}</span>
                              <span className="text-[11px] text-slate-400">{cpaThumbnailHint(true)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">광고상품명</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => updateEditForm({ name: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        placeholder="광고상품명을 입력하세요"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">광고주</label>
                      <select
                        value={editForm.mtId || ''}
                        onChange={(e) => updateEditForm({ mtId: Number(e.target.value) })}
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <option value="">광고주 선택</option>
                        {merchants.map((merchant) => (
                          <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">광고 유형</label>
                      <select
                        value={editForm.type}
                        onChange={(e) => updateEditForm({ type: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <option value="CPA">CPA</option>
                        <option value="CPS">CPS</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">카테고리</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => updateEditForm({ category: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <option value="">카테고리 선택</option>
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">운영 상태</label>
                      <select
                        value={editForm.statusCode}
                        onChange={(e) => updateEditForm({ statusCode: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <option value="draft">검수중</option>
                        <option value="active">운영중</option>
                        <option value="paused">일시중지</option>
                        <option value="ended">종료</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">랜딩 URL</label>
                      <input
                        type="url"
                        value={editForm.landingUrl}
                        onChange={(e) => updateEditForm({ landingUrl: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        placeholder="https://"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">목록 설명</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => updateEditForm({ description: e.target.value })}
                        disabled={!isEditMode}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-xl text-sm resize-y min-h-[72px] ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        placeholder="파트너·공개 목록에 표시될 한 줄 설명을 입력하세요"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">CPA/CPS 상품 목록·상세 카드에 노출됩니다.</p>
                    </div>
                  </div>
                </section>

                {/* Pricing / Margin */}
                <section>
                  <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    단가 및 마진 설정
                    {!isEditMode && selectedCampaign && (
                      <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        DB당 마진: {selectedCampaign.margin.toLocaleString()}원
                      </span>
                    )}
                  </h4>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">광고주 차감 단가</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={editForm.advertiserPrice || ''}
                            onChange={(e) => updateEditForm({ advertiserPrice: Number(e.target.value) })}
                            disabled={!isEditMode}
                            className={`w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm font-bold text-slate-900 ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-100 border-slate-200'}`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">원</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">광고비 잔액에서 차감될 금액</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">파트너 지급 단가</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={editForm.partnerPrice || ''}
                            onChange={(e) => updateEditForm({ partnerPrice: Number(e.target.value) })}
                            disabled={!isEditMode}
                            className={`w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm font-bold text-slate-900 ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-100 border-slate-200'}`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">원</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">파트너에게 실제 지급될 금액</p>
                      </div>
                    </div>
                    
                    {isEditMode && (
                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center bg-slate-900 -mx-4 -mb-4 p-4 rounded-b-xl text-white">
                        <span className="text-sm font-medium text-slate-400">DB당 마진</span>
                        <div className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                          {Math.max(0, editForm.advertiserPrice - editForm.partnerPrice).toLocaleString()}
                          <span className="text-sm text-emerald-500/70 font-medium">원</span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Criteria */}
                <section>
                  <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">기준 설정</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">승인 기준 (파트너 공개)</label>
                      <textarea 
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm resize-none h-20 ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        defaultValue="본인 통화 완료 후 정상 접수건에 한해 승인됩니다."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">취소 기준 (파트너 공개)</label>
                      <textarea 
                        disabled={!isEditMode}
                        className={`w-full px-3 py-2 border rounded-xl text-sm resize-none h-20 ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        defaultValue="- 3회 이상 부재중, 결번, 장난전화\n- 중복 접수, 타인 명의 도용\n- 미성년자, 해외 거주자"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">허용 채널</label>
                        <input
                          type="text"
                          value={editForm.allowedChannels}
                          onChange={(e) => updateEditForm({ allowedChannels: e.target.value })}
                          disabled={!isEditMode}
                          className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">금지 채널</label>
                        <input
                          type="text"
                          value={editForm.forbiddenChannels}
                          onChange={(e) => updateEditForm({ forbiddenChannels: e.target.value })}
                          disabled={!isEditMode}
                          className={`w-full px-3 py-2 border rounded-xl text-sm ${isEditMode ? 'bg-white border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <h5 className="text-amber-900 font-bold text-sm mb-2 flex items-center gap-1.5">
                    <AlertCircle size={16} /> 광고상품 운영 주의사항
                  </h5>
                  <ul className="text-amber-800 text-xs space-y-1.5 list-disc pl-4">
                    <li>단가 변경은 파트너 수익에 직접적인 영향을 주므로 신중하게 진행해주세요.</li>
                    <li>운영중인 상품을 일시중지/종료 시 파트너 홍보 링크 접속이 즉시 차단됩니다.</li>
                    <li>승인 및 취소 기준은 파트너센터에 공개되므로 명확하게 작성해주세요.</li>
                  </ul>
                </div>

              </div>
              
              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-2 gap-2 z-20">
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => {
                        if (!editForm.id) {
                          setEditForm(null);
                          setSelectedCampaign(null);
                        }
                        setIsEditMode(false);
                      }}
                      className="py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {saving ? '저장 중...' : '저장하기'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="col-span-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex justify-center items-center gap-1.5 shadow-sm">
                      <Copy size={14} /> 상품 복사하기
                    </button>
                    <button className="py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex justify-center items-center gap-1.5 shadow-sm">
                      <Database size={14} /> 접수 디비보기
                    </button>
                    {selectedCampaign && selectedCampaign.statusCode === 'active' ? (
                      <button
                        onClick={() => handleStatusChange('pause')}
                        disabled={saving}
                        className="py-2.5 bg-orange-100 text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-200 transition-colors shadow-sm flex justify-center items-center gap-1.5 disabled:opacity-50"
                      >
                        <PauseCircle size={14} /> 일시중지
                      </button>
                    ) : selectedCampaign ? (
                      <button
                        onClick={() => handleStatusChange('activate')}
                        disabled={saving}
                        className="py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm flex justify-center items-center gap-1.5 disabled:opacity-50"
                      >
                        <Activity size={14} /> 운영 시작
                      </button>
                    ) : null}
                    {isSuperAdmin && selectedCampaign && (
                      <button
                        onClick={openDeleteModal}
                        disabled={saving || deleting}
                        className="col-span-2 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex justify-center items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <Trash2 size={14} /> 광고상품 삭제
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteModalOpen && selectedCampaign && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-bold text-lg text-slate-900 mb-1">광고상품 삭제</div>
            <p className="text-sm text-slate-500 mb-4">
              <strong className="text-slate-800">{selectedCampaign.name}</strong> 상품을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </p>
            {selectedCampaign.totalDb > 0 && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                접수 DB가 {selectedCampaign.totalDb.toLocaleString()}건 있는 상품은 삭제할 수 없습니다.
              </div>
            )}
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              계속하려면 <span className="text-red-600">삭제</span>를 입력하세요
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="삭제"
              autoFocus
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-4 py-2 text-sm font-bold text-slate-500 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || deleteConfirmText !== '삭제' || selectedCampaign.totalDb > 0}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {guidePanel ? (
        <AdminCampaignPromoGuidePanel
          campaignId={guidePanel.id}
          campaignName={guidePanel.name}
          advertiserName={guidePanel.advertiser}
          onClose={() => setGuidePanel(null)}
          onUpdated={loadCampaigns}
        />
      ) : null}
    </AdminLayout>
  );
}
