import React from 'react';
import { usePartnerContext } from '../context/PartnerContext';
import { COMPANY_DETAILS } from '../data/initialData';

interface FooterProps {
  onOpenPrivacyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyModal }) => {
  const { data, hasPhone } = usePartnerContext();
  const companyName = data.merchant_name || COMPANY_DETAILS.companyName;
  const representative = data.representative_name || COMPANY_DETAILS.representative;
  const businessNumber = data.business_number || COMPANY_DETAILS.businessNumber;
  const address = data.business_address || COMPANY_DETAILS.address;
  const phone = hasPhone
    ? data.tracking_phone_display || data.partner_phone_display
    : COMPANY_DETAILS.mobile;
  const email = COMPANY_DETAILS.email;

  return (
    <footer className="bg-slate-950 text-slate-400 py-12 pb-24 md:pb-12 border-t border-slate-900 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-800 text-white rounded font-black text-xs tracking-wider border border-slate-700">
              {companyName}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
            <button type="button" onClick={onOpenPrivacyModal} className="hover:text-blue-400 transition-colors">
              개인정보처리방침
            </button>
            <span>|</span>
            <a href="/terms" className="hover:text-blue-400 transition-colors">
              이용약관
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-400 leading-relaxed">
          <div className="space-y-1">
            <p>
              <strong className="text-slate-300">업체명:</strong> {companyName}
            </p>
            <p>
              <strong className="text-slate-300">대표자명:</strong> {representative}
            </p>
            <p>
              <strong className="text-slate-300">사업자등록번호:</strong> {businessNumber}
            </p>
          </div>

          <div className="space-y-1">
            <p>
              <strong className="text-slate-300">사업장 주소:</strong> {address}
            </p>
            {hasPhone && (
              <p>
                <strong className="text-slate-300">대표 전화번호:</strong>{' '}
                <span className="partner-phone-text">{phone}</span>
              </p>
            )}
            {email && email !== '[이메일]' && (
              <p>
                <strong className="text-slate-300">이메일:</strong> {email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-slate-500 pt-1 text-[11px] leading-normal">
              본 페이지는 링크커넥트 CPA 광고용 랜딩페이지입니다. 모든 개인정보는 안전하게 보호됩니다.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900/80 text-center text-slate-600 text-[11px]">
          Copyright © {new Date().getFullYear()} {companyName}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
