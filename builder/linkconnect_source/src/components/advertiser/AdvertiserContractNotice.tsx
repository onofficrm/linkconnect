import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

type Props = {
  variant?: 'card' | 'banner';
};

export function AdvertiserContractNotice({ variant = 'card' }: Props) {
  if (variant === 'banner') {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-2 text-sm text-amber-900">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p>
            CPA 광고 제휴 계약 체결이 필요합니다. 유예 기간 내에는 기존 기능을 이용할 수 있으나, 기한 이후에는 계약 체결이
            필요합니다.
          </p>
        </div>
        <Link
          to="/advertiser/contract"
          className="shrink-0 inline-flex justify-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
        >
          계약서 확인 및 체결하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">CPA 광고 제휴 계약 체결이 필요합니다.</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            계약 체결 후 광고 등록, 광고 DB 관리, 광고비 충전 및 광고주센터의 주요 기능을 이용할 수 있습니다.
          </p>
        </div>
        <Link
          to="/advertiser/contract"
          className="inline-flex justify-center px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold whitespace-nowrap"
        >
          계약서 확인 및 체결하기
        </Link>
      </div>
    </div>
  );
}
