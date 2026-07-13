import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileSignature, Search, Settings2 } from 'lucide-react';

type ContractProcessGuideProps = {
  audience: 'admin' | 'advertiser';
  className?: string;
};

const advertiserSteps = [
  {
    step: '1',
    title: '광고주 정보 입력',
    desc: '회사명, 사업자번호, 담당자 연락처를 확인합니다.',
  },
  {
    step: '2',
    title: '계약서 확인·동의',
    desc: 'CPA 이용 계약서 전문을 읽고 필수 항목에 동의합니다.',
  },
  {
    step: '3',
    title: '담당자 서명·체결',
    desc: '전자 서명 후 즉시 체결됩니다. (관리자 별도 승인 없음)',
  },
  {
    step: '4',
    title: '광고주센터 이용',
    desc: '체결 후 캠페인·디비·광고비 충전 등 모든 기능을 이용할 수 있습니다.',
  },
];

const adminSteps = [
  {
    step: '1',
    icon: <FileSignature size={16} />,
    title: '광고주가 전자 계약 체결',
    desc: '광고주센터 → CPA 계약 체결 메뉴에서 3단계 작성·서명을 완료합니다.',
  },
  {
    step: '2',
    icon: <Search size={16} />,
    title: '관리자가 조회',
    desc: '이 화면(/admin/contracts)에서 체결 내역·계약서·서명을 확인합니다.',
  },
  {
    step: '3',
    icon: <Settings2 size={16} />,
    title: '상태 관리 (선택)',
    desc: '취소·만료·재계약 필요 처리. 계약 승인 단계는 없습니다.',
  },
];

export function ContractProcessGuide({ audience, className = '' }: ContractProcessGuideProps) {
  if (audience === 'advertiser') {
    return (
      <div className={`rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5 ${className}`}>
        <h3 className="font-bold text-slate-900 mb-1">CPA 계약 체결 절차</h3>
        <p className="text-sm text-slate-600 mb-4">
          관리자 승인 없이 광고주가 직접 전자 계약을 완료합니다. 체결 전에는 광고주센터 주요 메뉴 이용이 제한될 수 있습니다.
        </p>
        <ol className="grid sm:grid-cols-2 gap-3">
          {advertiserSteps.map((item) => (
            <li key={item.step} className="flex gap-3 bg-white/80 border border-cyan-100 rounded-xl p-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-cyan-600 text-white text-sm font-bold flex items-center justify-center">
                {item.step}
              </span>
              <div>
                <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-5 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 mb-1">광고주 계약 프로세스</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            계약은 <b>광고주가 직접 전자 체결</b>합니다. 관리자는 체결 결과를 조회하고 필요 시 상태만 변경합니다.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0">
          데모: <code className="font-mono">lc_advertiser</code> / <code className="font-mono">demo1234!</code>
        </div>
      </div>
      <ol className="grid md:grid-cols-3 gap-3">
        {adminSteps.map((item) => (
          <li key={item.step} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center text-xs">{item.step}</span>
              {item.icon}
              {item.title}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-slate-500 flex items-start gap-1.5">
        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
        광고주 체결 경로: 로그인 → 광고주센터 → <Link to="/advertiser/contract" className="text-cyan-700 font-bold hover:underline">CPA 계약 체결</Link>
        <ArrowRight size={12} className="inline shrink-0 mt-0.5" />
        3단계 작성·서명
      </p>
    </div>
  );
}
