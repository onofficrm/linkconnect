// ============================================================================
// 모두의 철거 — form / UI types (receive.php contract via Frontend Adapter)
// ============================================================================

export type DemolitionType =
  | '상가/매장 원상복구'
  | '인테리어 철거'
  | '사무실/학원/빌딩'
  | '식당/주방 시설철거'
  | '주택/빌라/아파트'
  | '부분/바닥/천장'
  | '기타(상담 시 문의)';

export interface DemolitionFormData {
  name: string;
  phone: string;
  agreedToTerms: boolean;
  formSource: 'hero_quick' | 'detail_quote';
  region?: string;
  demolitionType?: string;
  additionalNotes?: string;
  /** Server / dry-run message shown in Success UI */
  resultMessage?: string;
  dryRun?: boolean;
}

export interface FormErrorState {
  message: string;
  kind: 'validation' | 'network' | 'server';
}
