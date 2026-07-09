import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  ConsultationDraftFields,
  debtManwonToSelectValue,
  emptyConsultationDraft,
  incomeManwonToSelectValue,
} from '../lib/consultationForm';

type CalculatorPrefill = {
  debtManwon: number;
  incomeManwon: number;
  note: string;
};

interface ConsultationDraftContextValue {
  draft: ConsultationDraftFields;
  setDraft: (patch: Partial<ConsultationDraftFields>) => void;
  resetDraft: () => void;
  applyCalculatorPrefill: (input: CalculatorPrefill) => void;
  formStep: 1 | 2;
  setFormStep: (step: 1 | 2) => void;
}

const ConsultationDraftContext = createContext<ConsultationDraftContextValue | null>(null);

export function ConsultationDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<ConsultationDraftFields>(emptyConsultationDraft);
  const [formStep, setFormStep] = useState<1 | 2>(1);

  const setDraft = useCallback((patch: Partial<ConsultationDraftFields>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftState(emptyConsultationDraft());
    setFormStep(1);
  }, []);

  const applyCalculatorPrefill = useCallback((input: CalculatorPrefill) => {
    setDraftState((prev) => ({
      ...prev,
      debt: debtManwonToSelectValue(input.debtManwon),
      income: incomeManwonToSelectValue(input.incomeManwon),
      calculatorNote: input.note,
    }));
    setFormStep(1);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      resetDraft,
      applyCalculatorPrefill,
      formStep,
      setFormStep,
    }),
    [draft, setDraft, resetDraft, applyCalculatorPrefill, formStep],
  );

  return <ConsultationDraftContext.Provider value={value}>{children}</ConsultationDraftContext.Provider>;
}

export function useConsultationDraft(): ConsultationDraftContextValue {
  const ctx = useContext(ConsultationDraftContext);
  if (!ctx) {
    throw new Error('useConsultationDraft must be used within ConsultationDraftProvider');
  }
  return ctx;
}
