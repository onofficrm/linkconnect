import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { privacyPolicyUrl } from '../lib/linkconnect';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Summary aligned with Production consent + /privacy SoT.
 * Full legal text remains at /privacy — do not invent a parallel policy page.
 */
export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">개인정보 수집·이용 안내</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs text-slate-600 leading-relaxed pr-1">
          <p className="font-semibold text-slate-800">
            상담 접수를 위한 개인정보 수집·이용에 관한 안내입니다. 자세한 내용은 개인정보처리방침을
            확인해 주세요.
          </p>

          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <p>
              <strong>1. 수집항목:</strong> 성명, 연락처(휴대폰), 문의 내용(선택: 지역·철거 유형·요청사항·첨부파일)
            </p>
            <p>
              <strong>2. 이용목적:</strong> 철거·원상복구 견적 상담 접수 및 안내, 담당자 연락
            </p>
            <p>
              <strong>3. 보유기간:</strong> 상담 목적 달성 후 파기 (관련 법령에 따라 보존이 필요한 경우 해당 기간)
            </p>
            <p>
              <strong>4. 제3자 제공:</strong> 상담 목적 범위에서 연결 파트너에게 안내될 수 있으며, 판매·마케팅
              목적의 무단 제공은 하지 않습니다.
            </p>
            <p>
              <strong>5. 동의 거부 권리:</strong> 동의를 거부할 수 있으나, 필수 동의 거부 시 상담 접수가
              제한됩니다.
            </p>
          </div>

          <p className="text-[11px] text-slate-500">
            ※ 연락처는 상담 목적에만 사용되며, 제3자에게 판매하지 않습니다.
          </p>

          <a
            href={privacyPolicyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-bold text-blue-600 underline underline-offset-2 hover:text-blue-800"
          >
            개인정보처리방침 전체 보기 (/privacy)
          </a>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
