import React from 'react';
import { modemoAsset } from '../lib/modemoAsset';
import { privacyPolicyUrl } from '../lib/linkconnect';

interface FooterProps {
  onOpenPrivacyModal: () => void;
}

/** Production legal footer for 모두의 철거 landing. */
export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyModal }) => {
  const ctx = typeof window !== 'undefined' ? window.LC_LANDING_CONTEXT : undefined;
  const brand = '모두의 철거';
  const bizNo = ctx?.business_number || '206-47-92777';
  const rep = ctx?.representative_name || '김장수';
  const addr = ctx?.business_address || '경기도 과천시 과천대로7나길 37, 디엠 303호';

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-10 sm:py-14 px-4 sm:px-6 border-t border-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <img
              src={modemoAsset('images/logo_white.png')}
              alt={brand}
              className="h-8 sm:h-9 w-auto object-contain opacity-95"
              width={152}
              height={40}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400">
            <button
              id="footer-privacy-btn"
              type="button"
              onClick={onOpenPrivacyModal}
              className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer text-xs font-medium"
            >
              개인정보처리방침
            </button>
            <a
              href={privacyPolicyUrl()}
              className="hover:text-white underline underline-offset-2 transition-colors text-xs font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              전체 보기
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 text-xs">상가·오피스·주택 철거 및 원상복구 견적 상담</span>
          </div>
        </div>

        <div className="space-y-2 text-slate-400 text-[11px] sm:text-xs leading-relaxed">
          <p>
            <strong className="text-slate-300">브랜드:</strong> {brand}
            &nbsp;|&nbsp;
            <strong className="text-slate-300">상호명:</strong> {brand}
            &nbsp;|&nbsp;
            <strong className="text-slate-300">대표자:</strong> {rep}
            &nbsp;|&nbsp;
            <strong className="text-slate-300">사업자등록번호:</strong> {bizNo}
          </p>
          <p>
            <strong className="text-slate-300">소재지:</strong> {addr}
          </p>
          <p className="text-slate-500 pt-1">
            {brand}는 중개 플랫폼으로 철거, 원상복구 공사의 주 거래 당사자가 아닙니다. 시공,
            거래에 관한 의무와 책임은 철거 파트너에게 있습니다.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <p>© 2026 Farmingcity inc. All Rights Reserved.</p>
          <p>철거 견적 상담 플랫폼 {brand}</p>
        </div>
      </div>
    </footer>
  );
};
