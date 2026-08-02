/** CPA 상품 썸네일 — 메인·CPA 목록·관리자 업로드에 동일 4:3 비율 */
export const CPA_THUMBNAIL_ASPECT_CLASS = 'aspect-[4/3]';

/** 목록 카드 미디어 — 4:3 유지, 카드 대비 축소 표시 */
export const CPA_THUMBNAIL_LIST_MEDIA_CLASS =
  'aspect-[4/3] w-[78%] max-w-[240px] mx-auto rounded-xl overflow-hidden relative';

export const CPA_THUMBNAIL_SPEC = {
  /** 권장 업로드 해상도 (4:3 가로형) */
  width: 800,
  height: 600,
  ratioLabel: '4:3',
  sizeLabel: '800 × 600px',
  formats: 'JPG · PNG · WEBP',
  maxMb: 2,
} as const;

export function cpaThumbnailHint(short = false): string {
  const { sizeLabel, ratioLabel, formats, maxMb } = CPA_THUMBNAIL_SPEC;
  if (short) {
    return `${sizeLabel} (${ratioLabel})`;
  }
  return `권장 ${sizeLabel} (${ratioLabel}). ${formats}, 최대 ${maxMb}MB. 메인·CPA 목록에 4:3으로 표시됩니다.`;
}
