export const DEBT_OPTIONS = [
  { value: 'under_10m', label: '1천만원 이하' },
  { value: '10m_to_30m', label: '1천만~3천만원' },
  { value: '30m_to_50m', label: '3천만~5천만원' },
  { value: '50m_to_100m', label: '5천만~1억원' },
  { value: 'over_100m', label: '1억원 이상' },
] as const;

export const INCOME_OPTIONS = [
  { value: 'none', label: '없음' },
  { value: 'under_1m', label: '100만원 이하' },
  { value: '1m_to_2m', label: '100만~200만원' },
  { value: '2m_to_3m', label: '200만~300만원' },
  { value: 'over_3m', label: '300만원 이상' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'before', label: '연체 전' },
  { value: 'during', label: '연체 중' },
  { value: 'action', label: '독촉/압류 진행 중' },
] as const;

export type DebtValue = (typeof DEBT_OPTIONS)[number]['value'];
export type IncomeValue = (typeof INCOME_OPTIONS)[number]['value'];
export type StatusValue = (typeof STATUS_OPTIONS)[number]['value'];

export const DEBT_LABELS: Record<string, string> = Object.fromEntries(
  DEBT_OPTIONS.map((o) => [o.value, o.label]),
);

export const INCOME_LABELS: Record<string, string> = Object.fromEntries(
  INCOME_OPTIONS.map((o) => [o.value, o.label]),
);

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

export type ConsultationDraftFields = {
  name: string;
  phone: string;
  debt: string;
  income: string;
  status: string;
  message: string;
  calculatorNote: string;
};

export const emptyConsultationDraft = (): ConsultationDraftFields => ({
  name: '',
  phone: '',
  debt: '',
  income: '',
  status: '',
  message: '',
  calculatorNote: '',
});

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

export function debtManwonToSelectValue(manwon: number): DebtValue {
  if (manwon <= 1000) return 'under_10m';
  if (manwon <= 3000) return '10m_to_30m';
  if (manwon <= 5000) return '30m_to_50m';
  if (manwon <= 10000) return '50m_to_100m';
  return 'over_100m';
}

export function incomeManwonToSelectValue(manwon: number): IncomeValue {
  if (manwon <= 0) return 'none';
  if (manwon <= 100) return 'under_1m';
  if (manwon <= 200) return '1m_to_2m';
  if (manwon <= 300) return '2m_to_3m';
  return 'over_3m';
}

export function scrollToConsultForm(behavior: ScrollBehavior = 'smooth'): void {
  window.setTimeout(() => {
    document.getElementById('consult-form')?.scrollIntoView({ behavior, block: 'center' });
  }, 100);
}

export function scrollToCalculator(): void {
  document.getElementById('ai-calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
