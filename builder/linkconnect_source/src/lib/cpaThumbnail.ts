/** CPA 상품 썸네일 — 메인·CPA 목록·파트너 카드에 동일 비율로 표시 */
export const CPA_THUMBNAIL_ASPECT_CLASS = 'aspect-[16/10]';

export const CPA_THUMBNAIL_SPEC = {
  /** 권장 업로드 해상도 (가로형) */
  width: 1200,
  height: 750,
  ratioLabel: '16:10',
  sizeLabel: '1200 × 750px',
  formats: 'JPG · PNG · WEBP',
  maxMb: 2,
} as const;

export function cpaThumbnailHint(short = false): string {
  const { sizeLabel, ratioLabel, formats, maxMb } = CPA_THUMBNAIL_SPEC;
  if (short) {
    return `${sizeLabel} (${ratioLabel} 가로형)`;
  }
  return `권장 ${sizeLabel} (가로 ${ratioLabel}). ${formats}, 최대 ${maxMb}MB. 메인·CPA 목록에 가로 직사각형으로 표시됩니다.`;
}
