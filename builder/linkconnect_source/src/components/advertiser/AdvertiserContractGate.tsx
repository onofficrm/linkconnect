import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export function AdvertiserContractGate() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-5">
          <FileText className="text-amber-600" size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-3">CPA 광고 제휴 계약 체결이 필요합니다.</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          계약 체결 후 광고 등록, 광고 DB 관리, 광고비 충전 및 광고주센터의 주요 기능을 이용할 수 있습니다.
        </p>
        <Link
          to="/advertiser/contract"
          className="inline-flex justify-center w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors"
        >
          계약서 확인 및 체결하기
        </Link>
      </div>
    </div>
  );
}
