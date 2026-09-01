import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { FormErrorState } from '../types';

interface ErrorToastProps {
  error: FormErrorState | null;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, onClose }) => {
  if (!error) return null;

  const label =
    error.kind === 'network'
      ? '통신 오류'
      : error.kind === 'server'
        ? '접수 오류'
        : '입력 확인';

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 z-[60] sm:left-auto sm:right-6 sm:max-w-md"
      role="alert"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-xl">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-rose-700">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-800">{error.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
