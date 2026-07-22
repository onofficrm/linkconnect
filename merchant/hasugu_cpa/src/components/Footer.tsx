import { Phone } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';

export default function Footer() {
  const { data, hasPhone } = usePartnerContext();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 pb-28 sm:pb-16 text-[15px] sm:text-base border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-10 border border-slate-800">
          <p className="text-slate-300 font-bold mb-2 break-keep text-base sm:text-lg">
            현장 구조와 배관 상태에 따라 작업 방법과 비용이 달라질 수 있습니다.
          </p>
          <p className="text-slate-400 text-[15px] break-keep">방문 및 작업 진행 전 안내 내용을 확인해주세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-800">
          <div>
            <div className="text-xl font-bold text-white mb-4">{data.merchant_name}</div>
            <ul className="space-y-2 text-slate-400 text-[15px]">
              {data.representative_name ? <li>대표자: {data.representative_name}</li> : null}
              {data.business_number ? <li>사업자등록번호: {data.business_number}</li> : null}
              {data.business_address ? <li>주소: {data.business_address}</li> : null}
              {!data.representative_name && !data.business_number && !data.business_address ? (
                <li className="text-slate-500">광고주 연결 후 사업자 정보가 표시됩니다.</li>
              ) : null}
            </ul>
          </div>
          <div className="md:text-right flex flex-col md:items-end justify-center mt-4 md:mt-0">
            <p className="text-slate-400 mb-2 font-bold text-[15px]">광고 및 상담 안내</p>
            {hasPhone ? (
              <CallButton
                placement="footer"
                className="inline-flex items-center gap-2 text-2xl font-black text-white hover:text-blue-400 transition-colors"
                aria-label="대표전화"
              >
                <Phone size={24} className="text-blue-500" />
                <span className="partner-phone-text">{data.tracking_phone_display}</span>
              </CallButton>
            ) : (
              <p className="text-slate-500 text-sm">파트너 링크로 접속 시 안심번호가 표시됩니다.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[15px] text-slate-500">
          <p>© {data.merchant_name}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 font-medium">
            <a
              href={data.privacy_policy_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              개인정보처리방침
            </a>
            <span className="text-slate-700">|</span>
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
              이용안내
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
