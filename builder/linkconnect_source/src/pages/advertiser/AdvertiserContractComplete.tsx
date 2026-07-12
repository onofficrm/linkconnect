import React, { useEffect, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, FileDown, FileText, Loader2 } from 'lucide-react';
import { AdvertiserContractLayout } from '../../layouts/AdvertiserContractLayout';
import { fetchMerchantContract, type MerchantContractState } from '../../lib/api';
import { getLcAuth, isLcLoggedIn, refreshLcAuthFromServer } from '../../lib/auth';
import { g5LoginUrl, spaReturnUrl } from '../../lib/urls';

type CompleteLocationState = {
  contract?: MerchantContractState['contract'];
};

export function AdvertiserContractComplete() {
  const auth = getLcAuth();
  const location = useLocation();
  const locationState = (location.state ?? {}) as CompleteLocationState;
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<MerchantContractState | null>(null);

  useEffect(() => {
    if (!isLcLoggedIn()) {
      window.location.replace(g5LoginUrl(spaReturnUrl('/advertiser/contract/complete')));
    }
  }, []);

  useEffect(() => {
    if (!auth.isMerchant) {
      setLoading(false);
      return;
    }
    fetchMerchantContract()
      .then((data) => {
        setState(data);
        if (data.isSigned) {
          refreshLcAuthFromServer().catch(() => undefined);
        }
      })
      .finally(() => setLoading(false));
  }, [auth.isMerchant]);

  if (!auth.loggedIn) {
    return (
      <AdvertiserContractLayout title="계약 체결 완료">
        <p className="text-slate-600">로그인 페이지로 이동 중...</p>
      </AdvertiserContractLayout>
    );
  }

  if (!auth.isMerchant) {
    return (
      <AdvertiserContractLayout title="접근 제한">
        <p className="text-slate-700">광고주 계정으로만 확인할 수 있습니다.</p>
      </AdvertiserContractLayout>
    );
  }

  if (!loading && state && !state.isSigned) {
    return <Navigate to="/advertiser/contract" replace />;
  }

  const contract = locationState.contract ?? state?.contract;

  if (loading) {
    return (
      <AdvertiserContractLayout title="계약 체결 완료">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="animate-spin" size={18} />
          확인 중...
        </div>
      </AdvertiserContractLayout>
    );
  }

  return (
    <AdvertiserContractLayout title="CPA 광고 제휴 계약이 완료되었습니다." subtitle="계약이 정상적으로 저장되었습니다.">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={28} />
          <div>
            <p className="text-slate-700">아래 계약 정보를 확인해 주세요. 체결된 계약서는 수정할 수 없습니다.</p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <dt className="text-slate-500">광고주 회사명</dt>
            <dd className="font-semibold text-slate-900 mt-1">{contract?.companyName ?? state?.form.companyName ?? '-'}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <dt className="text-slate-500">계약서 버전</dt>
            <dd className="font-semibold text-slate-900 mt-1">{contract?.contractVersion ?? state?.contractVersion ?? '-'}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <dt className="text-slate-500">계약번호</dt>
            <dd className="font-semibold text-slate-900 mt-1 font-mono">{contract?.contractCode ?? '-'}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <dt className="text-slate-500">계약 체결일시</dt>
            <dd className="font-semibold text-slate-900 mt-1">{contract?.signedAt ?? '-'}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <dt className="text-slate-500">계약 담당자</dt>
            <dd className="font-semibold text-slate-900 mt-1">{contract?.signerName ?? state?.form.signerName ?? '-'}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <dt className="text-slate-500">계약 상태</dt>
            <dd className="font-semibold text-emerald-700 mt-1">체결 완료</dd>
          </div>
        </dl>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/advertiser"
            className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
          >
            광고주센터 시작하기
          </Link>
          <Link
            to="/advertiser/contract/view"
            className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold"
          >
            <FileText size={18} />
            계약서 확인
          </Link>
          <a
            href={state?.signedPdfDownloadUrl ?? contract?.pdfDownloadUrl ?? '#'}
            className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold"
          >
            <FileDown size={18} />
            계약서 PDF 다운로드
          </a>
        </div>
      </div>
    </AdvertiserContractLayout>
  );
}
