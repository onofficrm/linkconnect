import React from "react";
import { X, ShieldCheck } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base">개인정보 수집 및 이용 동의</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
          <p className="font-bold text-slate-900">
            상담 진행을 위한 개인정보 수집 및 이용에 동의합니다.
          </p>

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p>
              <strong className="text-slate-900">1. 수집 항목:</strong> 이름, 연락처, 지역, 상담 내용
            </p>
            <p>
              <strong className="text-slate-900">2. 이용 목적:</strong> 상담 접수 및 서비스 안내
            </p>
            <p>
              <strong className="text-slate-900">3. 보유 기간:</strong> 상담 목적 달성 후 관련 법령에 따라 처리
            </p>
            <p>
              <strong className="text-slate-900">4. 동의 거부 안내:</strong> 동의를 거부할 수 있으나 상담 신청이 제한될 수 있음
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
