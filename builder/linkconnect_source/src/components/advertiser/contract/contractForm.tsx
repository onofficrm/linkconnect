import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: '광고주 정보 확인' },
  { id: 2, label: '계약서 확인 및 동의' },
  { id: 3, label: '담당자 입력 및 서명' },
] as const;

export function ContractStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
      {STEPS.map((step) => {
        const active = currentStep === step.id;
        const done = currentStep > step.id;
        return (
          <li
            key={step.id}
            className={`rounded-xl border px-4 py-3 ${
              active
                ? 'border-cyan-500 bg-cyan-50'
                : done
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? 'bg-cyan-600 text-white'
                    : done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                }`}
              >
                {done ? <Check size={14} /> : step.id}
              </span>
              <span className={`text-sm font-semibold ${active ? 'text-cyan-900' : 'text-slate-700'}`}>
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export const CONTRACT_REQUIRED_AGREEMENTS = [
  { key: 'readAll', label: '계약서 전체 내용을 확인하였습니다.' },
  { key: 'hasAuthority', label: '본인은 해당 회사의 계약 체결 권한을 보유하고 있습니다.' },
  { key: 'electronic', label: '전자적 방식으로 계약을 체결하는 것에 동의합니다.' },
  { key: 'noModify', label: '계약 체결 후 계약서 내용을 임의로 변경할 수 없음을 확인했습니다.' },
] as const;

export type ContractAgreementKey = (typeof CONTRACT_REQUIRED_AGREEMENTS)[number]['key'];

export type ContractFormState = {
  companyName: string;
  representativeName: string;
  businessNumber: string;
  companyAddress: string;
  companyPhone: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  signerName: string;
  signerPosition: string;
  signerPhone: string;
  signerEmail: string;
  agreements: Record<ContractAgreementKey, boolean>;
  step: number;
};

export const EMPTY_CONTRACT_FORM: ContractFormState = {
  companyName: '',
  representativeName: '',
  businessNumber: '',
  companyAddress: '',
  companyPhone: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  signerName: '',
  signerPosition: '',
  signerPhone: '',
  signerEmail: '',
  agreements: {
    readAll: false,
    hasAuthority: false,
    electronic: false,
    noModify: false,
  },
  step: 1,
};

export function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function validateStep1(form: ContractFormState) {
  const errors: Record<string, string> = {};
  const labels: Record<string, string> = {
    companyName: '회사명',
    representativeName: '대표자명',
    businessNumber: '사업자등록번호',
    companyAddress: '사업장 주소',
    companyPhone: '회사 연락처',
    contactName: '담당자명',
    contactPhone: '담당자 연락처',
    contactEmail: '담당자 이메일',
  };
  (Object.keys(labels) as Array<keyof typeof labels>).forEach((key) => {
    if (!form[key]?.trim()) {
      errors[key] = `${labels[key]}을(를) 입력해 주세요.`;
    }
  });
  if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
    errors.contactEmail = '담당자 이메일 형식이 올바르지 않습니다.';
  }
  if (form.businessNumber && !/^\d{3}-\d{2}-\d{5}$/.test(form.businessNumber)) {
    errors.businessNumber = '사업자등록번호는 000-00-00000 형식으로 입력해 주세요.';
  }
  return errors;
}

export function validateStep2(form: ContractFormState) {
  const errors: Record<string, string> = {};
  CONTRACT_REQUIRED_AGREEMENTS.forEach(({ key, label }) => {
    if (!form.agreements[key]) {
      errors[key] = label;
    }
  });
  return errors;
}

export function validateStep3(form: ContractFormState, hasSignature: boolean) {
  const errors: Record<string, string> = {};
  const labels: Record<string, string> = {
    signerName: '계약 담당자 이름',
    signerPosition: '직책',
    signerPhone: '휴대전화번호',
    signerEmail: '이메일',
  };
  (Object.keys(labels) as Array<keyof typeof labels>).forEach((key) => {
    if (!form[key]?.trim()) {
      errors[key] = `${labels[key]}을(를) 입력해 주세요.`;
    }
  });
  if (form.signerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.signerEmail)) {
    errors.signerEmail = '이메일 형식이 올바르지 않습니다.';
  }
  if (!hasSignature) {
    errors.signature = '서명을 입력해 주세요.';
  }
  return errors;
}

export function draftStorageKey(merchantId: number | null) {
  return `lc_merchant_contract_draft_${merchantId ?? 'guest'}`;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-amber-700 mt-1">{message}</p>;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-slate-900 ${
          error ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 bg-white'
        }`}
      />
      <FieldError message={error} />
    </label>
  );
}
