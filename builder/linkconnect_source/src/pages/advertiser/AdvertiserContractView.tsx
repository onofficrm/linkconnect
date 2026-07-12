import React, { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ExternalLink, FileDown, Loader2 } from 'lucide-react';
import { AdvertiserLayout } from '../../layouts/AdvertiserLayout';
import { CONTRACT_REQUIRED_AGREEMENTS } from '../../components/advertiser/contract/contractForm';
import { fetchMerchantContractRead, type MerchantContractRead, PartnerApiError } from '../../lib/api';
import { getLcAuth, isLcLoggedIn } from '../../lib/auth';
import { g5LoginUrl, spaReturnUrl } from '../../lib/urls';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        type="text"
        readOnly
        disabled
        value={value || '-'}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm cursor-not-allowed"
      />
    </div>
  );
}

export function AdvertiserContractView() {
  const auth = getLcAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<MerchantContractRead | null>(null);
  const [history, setHistory] = useState<Array<{ contractVersion: string; contractCode: string; signedAt: string }>>([]);
  const [notSigned, setNotSigned] = useState(false);
  const [error, setError] = useState('');
  const selectedVersion = searchParams.get('version') ?? '';

  useEffect(() => {
    if (!isLcLoggedIn()) {
      window.location.replace(g5LoginUrl(spaReturnUrl('/advertiser/contract/view')));
    }
  }, []);

  useEffect(() => {
    if (!auth.isMerchant) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setNotSigned(false);
    fetchMerchantContractRead(selectedVersion || undefined)
      .then((data) => {
        setContract(data.contract);
        setHistory(data.history);
      })
      .catch((err) => {
        if (err instanceof PartnerApiError && (err.code === 'NOT_FOUND' || err.status === 404)) {
          setNotSigned(true);
          return;
        }
        setError(err instanceof Error ? err.message : '계약 정보를 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [auth.isMerchant, selectedVersion]);

  const handleVersionChange = (version: string) => {
    setSearchParams(version ? { version } : {});
  };

  if (!auth.loggedIn) {
    return (
      <AdvertiserLayout activeMenu="" title="계약정보">
        <p className="text-slate-600">로그인 페이지로 이동 중...</p>
      </AdvertiserLayout>
    );
  }

  if (!auth.isMerchant) {
    return (
      <AdvertiserLayout activeMenu="" title="계약정보">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-700">광고주 계정으로만 계약 정보를 열람할 수 있습니다.</p>
        </div>
      </AdvertiserLayout>
    );
  }

  if (!loading && notSigned) {
    return <Navigate to="/advertiser/contract" replace />;
  }

  if (loading) {
    return (
      <AdvertiserLayout activeMenu="" title="계약정보">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="animate-spin" size={18} />
          불러오는 중...
        </div>
      </AdvertiserLayout>
    );
  }

  if (error || !contract) {
    return (
      <AdvertiserLayout activeMenu="" title="계약정보">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-700">{error || '계약 정보가 없습니다.'}</p>
          <Link to="/advertiser/contract" className="inline-block mt-4 text-sm text-cyan-700 hover:underline">
            계약서 작성으로 이동
          </Link>
        </div>
      </AdvertiserLayout>
    );
  }

  return (
    <AdvertiserLayout activeMenu="" title="계약정보" companyName={contract.companyName}>
      <div className="max-w-4xl space-y-6">
        <p className="text-sm text-slate-500">
          체결된 계약서는 읽기 전용입니다. 계약 당시 기록된 정보를 표시하며, 현재 회원정보와 다를 수 있습니다.
        </p>

        {history.length > 1 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <label className="block text-xs font-medium text-slate-500 mb-2">계약 이력 (버전)</label>
            <select
              value={contract.contractVersion}
              onChange={(e) => handleVersionChange(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
            >
              {history.map((item) => (
                <option key={item.contractVersion} value={item.contractVersion}>
                  {item.contractVersion} · {item.contractCode || '미발급'} · {item.signedAt || '-'}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 shadow-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <ReadOnlyField label="계약 상태" value={contract.statusLabel} />
            <ReadOnlyField label="계약번호" value={contract.contractCode} />
            <ReadOnlyField label="계약서 버전" value={contract.contractVersion} />
            <ReadOnlyField label="계약 체결일시" value={contract.signedAt} />
            <ReadOnlyField label="회사명" value={contract.companyName} />
            <ReadOnlyField label="대표자명" value={contract.representativeName} />
            <ReadOnlyField label="사업자등록번호" value={contract.businessNumber} />
            <ReadOnlyField label="사업장 주소" value={contract.companyAddress} />
            <ReadOnlyField label="회사 연락처" value={contract.companyPhone} />
            <ReadOnlyField label="계약 담당자" value={contract.signerName} />
            <ReadOnlyField label="담당자 직책" value={contract.signerPosition} />
            <ReadOnlyField label="담당자 연락처" value={contract.signerPhone} />
            <ReadOnlyField label="담당자 이메일" value={contract.signerEmail} />
            <ReadOnlyField label="PDF 해시 (일부)" value={contract.pdfHashMasked} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">동의 체크 내역</h3>
            <ul className="space-y-2 text-sm">
              {CONTRACT_REQUIRED_AGREEMENTS.map(({ key, label }) => (
                <li key={key} className="flex items-start gap-2 text-slate-700">
                  <span className={contract.agreements?.[key] ? 'text-emerald-600' : 'text-slate-400'}>
                    {contract.agreements?.[key] ? '✓' : '○'}
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            {contract.agreementCheckedAt ? (
              <p className="text-xs text-slate-500 mt-2">동의 시각: {contract.agreementCheckedAt}</p>
            ) : null}
          </div>

          {contract.signatureUrl ? (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">서명</h3>
              <div className="inline-block border border-slate-200 rounded-xl bg-white p-3">
                <img src={contract.signatureUrl} alt="계약 서명" className="max-h-24" />
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <a
              href={contract.documentPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink size={16} />
              계약서 보기
            </a>
            <a
              href={contract.documentPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
            >
              <FileDown size={16} />
              PDF 다운로드
            </a>
          </div>

          <div
            className="contract-document rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-6 max-h-[50vh] overflow-y-auto text-sm"
            dangerouslySetInnerHTML={{ __html: contract.contractHtml }}
          />
        </div>

        <Link to="/advertiser" className="inline-flex text-sm text-slate-500 hover:text-cyan-600">
          광고주센터로 돌아가기
        </Link>
      </div>
    </AdvertiserLayout>
  );
}
