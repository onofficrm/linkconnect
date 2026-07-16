import { useMemo, useState } from 'react';

export type PromoAssetSizePreset = {
  id: string;
  title: string;
  width: number;
  height: number;
  platform: 'naver' | 'web' | 'google';
  group: 'popular' | 'naver' | 'web';
  hint: string;
};

/** 네이버·구글·웹사이트 중심 권장 사이즈 (SNS보다 웹/블로그/카페 우선) */
export const PROMO_ASSET_SIZE_PRESETS: PromoAssetSizePreset[] = [
  {
    id: 'naver-blog-banner',
    title: '네이버 블로그 상단 배너',
    width: 758,
    height: 140,
    platform: 'naver',
    group: 'popular',
    hint: '블로그 스킨 상단·사이드 배너에 많이 쓰입니다.',
  },
  {
    id: 'naver-cafe-banner',
    title: '네이버 카페 배너',
    width: 790,
    height: 160,
    platform: 'naver',
    group: 'popular',
    hint: '카페 메인·게시판 상단 배너에 적합합니다.',
  },
  {
    id: 'web-og-thumbnail',
    title: '웹사이트 공유 썸네일',
    width: 1200,
    height: 630,
    platform: 'web',
    group: 'popular',
    hint: '링크 공유·오픈그래프(OG)용. 네이버·구글 검색 미리보기에도 유리합니다.',
  },
  {
    id: 'cpa-product-thumb',
    title: '상품 리스트 썸네일',
    width: 1200,
    height: 750,
    platform: 'web',
    group: 'popular',
    hint: '링크커넥트 CPA 목록·파트너 카드에 표시되는 권장 비율(16:10)입니다.',
  },
  {
    id: 'naver-blog-body',
    title: '네이버 블로그 본문 이미지',
    width: 860,
    height: 484,
    platform: 'naver',
    group: 'naver',
    hint: '블로그 본문 폭에 맞춘 가로형 이미지입니다.',
  },
  {
    id: 'naver-blog-cover',
    title: '네이버 블로그 대표 이미지',
    width: 800,
    height: 800,
    platform: 'naver',
    group: 'naver',
    hint: '글 목록·검색 노출용 정사각 대표 이미지입니다.',
  },
  {
    id: 'naver-cafe-post',
    title: '네이버 카페 게시글 이미지',
    width: 800,
    height: 450,
    platform: 'naver',
    group: 'naver',
    hint: '카페 게시글·공지에 넣는 본문 이미지입니다.',
  },
  {
    id: 'web-hero-banner',
    title: '웹사이트 히어로 배너',
    width: 1920,
    height: 600,
    platform: 'web',
    group: 'web',
    hint: '랜딩·소개 페이지 상단 와이드 배너입니다.',
  },
  {
    id: 'google-display-mrec',
    title: '구글 디스플레이 (중간형)',
    width: 300,
    height: 250,
    platform: 'google',
    group: 'web',
    hint: 'Google Ads 디스플레이에서 가장 흔한 Medium Rectangle 규격입니다.',
  },
  {
    id: 'google-leaderboard',
    title: '구글 디스플레이 (가로형)',
    width: 728,
    height: 90,
    platform: 'google',
    group: 'web',
    hint: '사이트 상단·하단에 쓰는 Leaderboard 배너입니다.',
  },
  {
    id: 'google-skyscraper',
    title: '구글 디스플레이 (세로형)',
    width: 160,
    height: 600,
    platform: 'google',
    group: 'web',
    hint: '사이드바용 Wide Skyscraper 배너입니다.',
  },
];

const GROUP_TABS = [
  { id: 'popular' as const, label: '인기' },
  { id: 'naver' as const, label: '네이버' },
  { id: 'web' as const, label: '웹·구글' },
];

function SizePreview({ width, height, active }: { width: number; height: number; active?: boolean }) {
  const maxW = 88;
  const maxH = 56;
  const scale = Math.min(maxW / width, maxH / height);
  const w = Math.max(10, Math.round(width * scale));
  const h = Math.max(8, Math.round(height * scale));

  return (
    <div className="h-16 flex items-center justify-center">
      <div
        className={`rounded-md border shadow-sm transition-colors ${
          active
            ? 'bg-cyan-100 border-cyan-400'
            : 'bg-white border-slate-200'
        }`}
        style={{ width: w, height: h }}
        aria-hidden
      />
    </div>
  );
}

export function formatPromoAssetSize(width: number, height: number) {
  return `${width.toLocaleString()} × ${height.toLocaleString()} px`;
}

export function suggestTitleForPreset(preset: PromoAssetSizePreset) {
  return preset.title;
}

type PromoAssetSizeGuideProps = {
  selectedId?: string | null;
  onSelect?: (preset: PromoAssetSizePreset) => void;
};

export function PromoAssetSizeGuide({ selectedId = null, onSelect }: PromoAssetSizeGuideProps) {
  const [tab, setTab] = useState<'popular' | 'naver' | 'web'>('popular');

  const items = useMemo(
    () => PROMO_ASSET_SIZE_PRESETS.filter((p) => (tab === 'popular' ? p.group === 'popular' : p.group === tab)),
    [tab],
  );

  const selected = PROMO_ASSET_SIZE_PRESETS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">1. 업로드할 사이즈 선택</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          네이버 블로그·카페, 웹사이트, 구글 디스플레이 규격입니다. 카드를 고른 뒤 아래에서 그 사이즈로 업로드하세요.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {GROUP_TABS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setTab(g.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab === g.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((preset) => {
          const active = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect?.(preset)}
              disabled={!onSelect}
              className={`text-left rounded-xl border p-3 transition-all ${
                active
                  ? 'border-cyan-400 bg-white ring-2 ring-cyan-200 shadow-sm'
                  : 'border-slate-200/80 bg-white hover:border-cyan-300 hover:shadow-sm'
              } ${!onSelect ? 'cursor-default' : ''}`}
            >
              <div className={`rounded-lg mb-2 ${active ? 'bg-cyan-50' : 'bg-slate-100'}`}>
                <SizePreview width={preset.width} height={preset.height} active={active} />
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">{preset.title}</div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {formatPromoAssetSize(preset.width, preset.height)}
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3.5 py-3 text-xs text-cyan-900 space-y-1">
          <p className="font-bold">
            {selected.title} · {formatPromoAssetSize(selected.width, selected.height)}
          </p>
          <p className="text-cyan-800/90 leading-relaxed">{selected.hint}</p>
          <p className="text-cyan-700/80">
            JPG · PNG · WEBP 권장. 가능하면 위 픽셀에 맞춰 제작한 뒤 업로드해 주세요.
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">사이즈 카드를 선택하면 상세 안내가 표시됩니다.</p>
      )}
    </div>
  );
}
