import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { DemolitionFormData } from '../types';

interface SuccessModalProps {
  isOpen: boolean;
  data: DemolitionFormData | null;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, data, onClose }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {data.dryRun ? '로컬 검증 완료' : '접수 완료'}
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-2">상담 신청이 접수되었습니다</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            <strong className="text-slate-900">{data.name}</strong> 고객님의 상담 접수 정보를 확인하였습니다.
          </p>
          {data.resultMessage ? (
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{data.resultMessage}</p>
          ) : null}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">신청자명</span>
            <span className="font-bold text-slate-900">{data.name} 님</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">연락처</span>
            <span className="font-bold text-slate-900">{data.phone}</span>
          </div>
          {data.region && (
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">지역</span>
              <span className="font-bold text-slate-900">{data.region}</span>
            </div>
          )}
          {data.demolitionType && (
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">철거 유형</span>
              <span className="font-bold text-blue-600">{data.demolitionType}</span>
            </div>
          )}
          {data.additionalNotes && (
            <div className="flex justify-between py-1">
              <span className="text-slate-500">문의내용</span>
              <span className="font-medium text-slate-700 truncate max-w-[200px]">{data.additionalNotes}</span>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
